import { backgroundDefaults } from "./background-tuning";
import { draw, frame, init, sampler, surface, texture, storage, target as offscreenTarget, type Gpu } from "vgpu";
import type { Wave } from "./background-wave";
import orbitShader from "./orbit.wgsl";
import fieldShader from "./orbit-field.wgsl";
import backdropShader from "./orbit-backdrop.wgsl";
import { glyphEdges } from "./orbit-geometry";
import { palettes, seedPhase, type Config } from "./config";
import { unfoldTone } from './unfold-motion';

type Story = {waves:Wave[];time:number;x:number;y:number;phase:number;spread:number;motion:number;typeScale:number};

let fontReady: Promise<FontFace> | undefined;

export async function createTypeRenderer(canvas: HTMLCanvasElement, config: Config, fail: (message: string) => void, signal: AbortSignal) {
  let gpu: Gpu | undefined;
  try {
    await document.fonts.ready;
    fontReady ??= new FontFace("TypeLabSans", 'url("/type-lab/inter.woff2")', {weight:"100 900"}).load().then(face=>{document.fonts.add(face);return face;}).catch(error=>{fontReady=undefined;throw error;});
    await fontReady;
    const font = '"TypeLabSans", sans-serif';
    signal.throwIfAborted();
    gpu = await init({ label: "Spatial type lab · vgpu", powerPreference: "high-performance" });
    signal.throwIfAborted();
    const context = gpu;
    signal.addEventListener("abort",()=>context.dispose(),{once:true});
    context.onError(error => fail(error.message));
    void context.lost.then(() => { if (!context.disposed) fail("Die GPU-Verbindung wurde unterbrochen. Bitte neu laden."); });
    const target = surface(context, canvas, { autoResize: false, size: [1,1], dpr: 1, depth: true, msaa: 4 });
    const atlas = document.createElement("canvas");
    atlas.width = 2048; atlas.height = 384;
    const ctx = atlas.getContext("2d");
    if (!ctx) throw new Error("Die Schrift konnte nicht vorbereitet werden.");
    const glyphs = texture(context, { kind: "2d", size: [2048,384], format: "rgba8unorm", usage: ["texture_binding","copy_dst","render_attachment"] });
    const edgeBuffer=storage(context,4*1024*1024,"read");
    let edgeVertices=0;
    let lastText = "";
    const writeText = (text: string) => {
      ctx.fillStyle = "black"; ctx.fillRect(0,0,2048,384);
      ctx.font = `850 290px ${font}`;
      ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      const m = ctx.measureText(text);
      const size = Math.min(290, 1920 / m.width * 290);
      ctx.font = `850 ${size}px ${font}`;
      const measured = ctx.measureText(text);
      ctx.fillStyle = "white";
      ctx.fillText(text,1024,192+(measured.actualBoundingBoxAscent-measured.actualBoundingBoxDescent)/2);
      context.gpu.queue.copyExternalImageToTexture({source: atlas}, {texture:glyphs.gpu}, [2048,384]);
      if (edgeBuffer) {
        const outline=document.createElement("canvas"); outline.width=2048; outline.height=384;
        const outlineContext=outline.getContext("2d")!;
        outlineContext.drawImage(atlas,0,0,2048,384);
        const data=glyphEdges(outlineContext.getImageData(0,0,2048,384).data,2048,384);
        if (data.byteLength>4*1024*1024) throw new Error("Die Schriftkontur ist zu komplex.");
        if(data.length) edgeBuffer.write(data);
        edgeVertices=data.length/4;
      }
      lastText = text;
    };
    writeText(config.text);
    const storyAtlas=document.createElement('canvas');storyAtlas.width=2048;storyAtlas.height=384;
    const storyContext=storyAtlas.getContext('2d')!;
    storyContext.fillStyle='black';storyContext.fillRect(0,0,2048,384);
    storyContext.font=`850 290px ${font}`;
    const storySize=Math.min(290,1920/storyContext.measureText('THIMORROW').width*290);
    storyContext.font=`850 ${storySize}px ${font}`;storyContext.textAlign='center';storyContext.textBaseline='alphabetic';
    const storyMetrics=storyContext.measureText('THIMORROW');
    storyContext.fillStyle='white';storyContext.fillText('THIMORROW',1024,192+(storyMetrics.actualBoundingBoxAscent-storyMetrics.actualBoundingBoxDescent)/2);
    const storyLetters=texture(context,{kind:'2d',size:[2048,384],format:'rgba8unorm',usage:['texture_binding','copy_dst','render_attachment']});
    context.gpu.queue.copyExternalImageToTexture({source:storyAtlas},{texture:storyLetters.gpu},[2048,384]);
    const characterAtlas=document.createElement("canvas");characterAtlas.width=17*64;characterAtlas.height=64;
    const charContext=characterAtlas.getContext("2d")!;
    charContext.fillStyle="black";charContext.fillRect(0,0,17*64,64);
    const mono=getComputedStyle(document.documentElement).getPropertyValue("--font-ibm-plex-mono").trim() || "monospace";
    charContext.font=`400 60px ${mono}`;charContext.fillStyle="white";charContext.textAlign="center";charContext.textBaseline="middle";
    [..."THIMOFEJZAPKRW·/<"].forEach((letter,i)=>charContext.fillText(letter,i*64+32,32));
    const alphabet=texture(context,{kind:"2d",size:[17*64,64],format:"rgba8unorm",usage:["texture_binding","copy_dst","render_attachment"]});
    context.gpu.queue.copyExternalImageToTexture({source:characterAtlas},{texture:alphabet.gpu},[17*64,64]);
    const characterField=offscreenTarget(context,{size:[1,1],format:"rgba8unorm"});
    const fieldDraw=draw(context,{shader:fieldShader,vertices:3,depth:false,set:{field:{view:[1,0,0,0],shape:[1,0.58,0.65,0]}}});

    let aspect = 1, cssWidth=1;
    const uniforms = (c: Config, intro: number, wall = 0, presentation = 0, story?:Story, bandLag=0) => {
      const palette = palettes[c.palette];
      const t={...backgroundDefaults,...c.tuning};
      const wave=(index:number)=>{
        const w=story?.waves[index];
        return w ? [w.x,w.y,w.age,w.variation] : [0,0,-1,0];
      };
      const tone=story?unfoldTone(presentation):0;
      const ink=palette.ink.map((value,i)=>Math.min(1,value+(palette.background[i]-value)*tone+Math.sin(Math.PI*tone)*0.4));
      return { textWave0:wave(0),textWave1:wave(1),textWave2:wave(2),textWave3:wave(3),
        pulseShape:[t.clickSpeed,t.clickWidth,t.clickWiden,t.clickWarp],
        pulseLife:[t.clickDecay,t.clickLifetime,t.clickArcs,t.clickEcho],
        pulseRebound:[t.reboundDelay,t.reboundDistance,t.reboundStrength,t.reboundDuration],
        pulseForce:[t.clickKick,t.refraction,0,0], material:[c.roughness ?? 0.38,c.light ?? 0,c.thickness ?? 0.045,story?1:0], view: [aspect,presentation,c.mode,wall], motion: [(story?.time ?? c.time)+(c.phase ?? 0),c.yaw,c.pitch,intro], shape: [c.depth,c.bend,c.scale,seedPhase(c)], ink: [...ink,1], paper: [...palette.background,1], story:[story?.x??0,story?.y??0,story?.phase??0,story?.spread??0], storyStyle:[story?.motion??0,story?.typeScale??1,bandLag,0] };
    };
    const bindings={letters:glyphs,storyLetters,linearSampler:sampler(context,{minFilter:"linear",magFilter:"linear"}),edges:edgeBuffer};
    const textDraw=draw(context,{shader:orbitShader,vertices:192*12*6,instances:6,multisample:{alphaToCoverage:true},frontFace:"cw",set:{settings:uniforms(config,1),...bindings}});
    const walls=draw(context,{shader:orbitShader,vertices:edgeVertices,instances:6,multisample:{alphaToCoverage:true},set:{settings:uniforms(config,1,1),...bindings}});
    const tuningUniforms = (c: Config) => {
      const t={...backgroundDefaults,...c.tuning};
      return { raster:[t.rasterOpacity,t.gridSize,t.ambientOpacity,t.ambientSoftness], ambient:[t.centerQuiet,t.clickOpacity,t.clickSpeed,t.clickWidth], click:[t.clickWiden,t.clickLifetime,t.clickDecay,t.clickWarp], detail:[t.clickArcs,t.clickEcho,t.clickKick,t.refraction], interaction:[t.blur,t.suppression,t.recovery,0], rebound:[t.reboundDelay,t.reboundDistance,t.reboundStrength,t.reboundDuration] };
    };
    const backdrop=draw(context,{shader:backdropShader,vertices:3,depth:false,set:{characterField,alphabet,linearSampler:sampler(context,{minFilter:"linear",magFilter:"linear"}),background:{...tuningUniforms(config),color:[...palettes[config.palette].background,1],view:[1,0,0,0],wave0:[0,0,-1,0],wave1:[0,0,-1,0],wave2:[0,0,-1,0],wave3:[0,0,-1,0]}}});
    await Promise.all([textDraw.compile(target),walls.compile(target),backdrop.compile(target),fieldDraw.compile(characterField)]);
    signal.throwIfAborted();
    return {
      resize(width: number,height: number) { const dpr = Math.min(devicePixelRatio,1.75); aspect = width/height; cssWidth=width; characterField.resize([Math.max(1,Math.ceil(width/7)),Math.max(1,Math.ceil(height/10))]); target.resize([Math.max(1,Math.round(width*dpr)),Math.max(1,Math.round(height*dpr))]); },
      render(c: Config,intro = 1,waves: Wave[] = [],presentation = 0,story?:Story,bandLag=0) {
        if (lastText !== c.text) writeText(c.text);
        target.clearColor = [...palettes[c.palette].background,1];
        textDraw.set({settings: uniforms(c,intro,0,presentation,story,bandLag)});
        walls.set({settings:uniforms(c,intro,1,presentation,story,bandLag)});
        const wave = (i: number) => waves[i] ? [waves[i].x,waves[i].y,waves[i].age,waves[i].variation] : [0,0,-1,0];
        const tuning={...backgroundDefaults,...c.tuning};
        const tone=story?unfoldTone(presentation):0;
        const color=palettes[c.palette].background.map((value,i)=>value+([.141,.102,.086][i]-value)*tone);
        const backgroundUniforms=tuningUniforms(c);backgroundUniforms.raster[0]*=1-tone;
        backdrop.set({background:{...backgroundUniforms,color:[...color,(c.backgroundStrength ?? 1)*(1-tone)],view:[aspect,(c.time+(c.phase ?? 0))*tuning.ambientSpeed,c.background ?? 0,cssWidth],wave0:wave(0),wave1:wave(1),wave2:wave(2),wave3:wave(3)}});
        fieldDraw.set({field:{view:[aspect,(c.time+(c.phase ?? 0))*3*tuning.ambientSpeed,0,0],shape:[tuning.ambientScale,tuning.ambientThickness,tuning.ambientMerge,0]}});
        const instances=story?18:6;
        frame(context,f=>{if(c.background===2 && tone<1) f.pass(characterField,fieldDraw);f.pass(target,pass=>{pass.draw(backdrop);pass.draw(textDraw,{instances});if(edgeVertices) pass.draw(walls,{vertices:edgeVertices,instances});});});
      },
      dispose() { context.dispose(); },
    };
  } catch(error) { gpu?.dispose(); throw error; }
}
