import { backgroundDefaults } from "./background-tuning";
import { BufferAttribute, BufferGeometry, Camera, CanvasTexture, DoubleSide, GLSL3, InstancedBufferGeometry, LinearFilter, Mesh, NoBlending, RawShaderMaterial, Scene, WebGLRenderer, WebGLRenderTarget } from "three";
import type { Wave } from "./background-wave";
import { orbitVertex, orbitFragment, fullscreenVertex, backdropFragment, fieldFragment } from "./orbit-shaders";
import { glyphEdges } from "./orbit-geometry";
import { palettes, seedPhase, type Config } from "./config";
import { unfoldTone } from './unfold-motion';

type Story = {waves:Wave[];time:number;x:number;y:number;phase:number;spread:number;motion:number;typeScale:number};

export async function createTypeRenderer(canvas: HTMLCanvasElement, config: Config, fail: (message: string) => void, signal: AbortSignal) {
  let renderer: WebGLRenderer | undefined;
  const resources: { dispose(): void }[] = [];
  let disposed = false;
  const lost = (event: Event) => {
    event.preventDefault();
    if (!disposed) fail("Die GPU-Verbindung wurde unterbrochen. Bitte neu laden.");
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    signal.removeEventListener("abort", dispose);
    canvas.removeEventListener("webglcontextlost", lost);
    for (const resource of resources) resource.dispose();
    renderer?.dispose();
  };
  try {
    const fonts = getComputedStyle(document.documentElement);
    const font = fonts.getPropertyValue("--font-body").trim() || "sans-serif";
    const mono = fonts.getPropertyValue("--font-mono").trim() || "monospace";
    await Promise.all([document.fonts.load(`850 100px ${font}`), document.fonts.load(`400 60px ${mono}`)]);
    await document.fonts.ready;
    signal.throwIfAborted();
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    const context = renderer;
    context.autoClear = false;
    context.debug.onShaderError = () => { throw new Error("Die Grafik konnte nicht vorbereitet werden."); };
    canvas.dataset.renderer = "three-webgl";
    canvas.addEventListener("webglcontextlost", lost);
    signal.addEventListener("abort", dispose, { once: true });
    const camera = new Camera();
    const scene = new Scene();
    const fieldScene = new Scene();
    const track = <T extends { dispose(): void }>(resource: T): T => { resources.push(resource); return resource; };
    const canvasTexture = (source: HTMLCanvasElement) => {
      const result = track(new CanvasTexture(source));
      result.flipY = false;
      result.minFilter = result.magFilter = LinearFilter;
      result.generateMipmaps = false;
      return result;
    };
    const geometry = (vertices: number) => {
      const result = track(new InstancedBufferGeometry());
      result.setAttribute("position", new BufferAttribute(new Float32Array(vertices * 3), 3));
      result.setAttribute("glyphEdge", new BufferAttribute(new Float32Array(vertices * 4), 4));
      result.setDrawRange(0, vertices);
      result.instanceCount = 6;
      return result;
    };
    const textGeometry = geometry(192 * 12 * 6);
    const wallGeometry = geometry(0);
    const fullscreenGeometry = track(new BufferGeometry());
    fullscreenGeometry.setAttribute("position", new BufferAttribute(new Float32Array(9), 3));
    const fullscreen = (material: RawShaderMaterial) => {
      const mesh = new Mesh(fullscreenGeometry, material);
      mesh.frustumCulled = false;
      return mesh;
    };
    const atlas = document.createElement("canvas");
    atlas.width = 2048; atlas.height = 384;
    const ctx = atlas.getContext("2d");
    if (!ctx) throw new Error("Die Schrift konnte nicht vorbereitet werden.");
    const glyphs = canvasTexture(atlas);
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
      glyphs.needsUpdate = true;
      {
        const data=glyphEdges(ctx.getImageData(0,0,2048,384).data,2048,384);
        if (data.byteLength>4*1024*1024) throw new Error("Die Schriftkontur ist zu komplex.");
        edgeVertices=data.length/4;
        wallGeometry.dispose();
        wallGeometry.setAttribute("position", new BufferAttribute(new Float32Array(edgeVertices * 3), 3));
        wallGeometry.setAttribute("glyphEdge", new BufferAttribute(data, 4));
        wallGeometry.setDrawRange(0, edgeVertices);
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
    const storyLetters=canvasTexture(storyAtlas);
    const characterAtlas=document.createElement("canvas");characterAtlas.width=17*64;characterAtlas.height=64;
    const charContext=characterAtlas.getContext("2d")!;
    charContext.fillStyle="black";charContext.fillRect(0,0,17*64,64);
    charContext.font=`400 60px ${mono}`;charContext.fillStyle="white";charContext.textAlign="center";charContext.textBaseline="middle";
    [..."THIMOFEJZAPKRW·/<"].forEach((letter,i)=>charContext.fillText(letter,i*64+32,32));
    const alphabet=canvasTexture(characterAtlas);
    const characterField=track(new WebGLRenderTarget(1,1,{minFilter:LinearFilter,magFilter:LinearFilter,depthBuffer:false}));
    const fieldDraw=track(new RawShaderMaterial({glslVersion:GLSL3,vertexShader:fullscreenVertex,fragmentShader:fieldFragment,depthTest:false,depthWrite:false,blending:NoBlending,uniforms:{field:{value:{view:[1,0,0,0],shape:[1,0.58,0.65,0]}}}}));
    fieldScene.add(fullscreen(fieldDraw));

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
    const material = (wall: number) => track(new RawShaderMaterial({
      glslVersion: GLSL3, vertexShader: orbitVertex, fragmentShader: orbitFragment,
      side: DoubleSide, alphaToCoverage: true, blending: NoBlending,
      uniforms: { settings: { value: uniforms(config,1,wall) }, letters: { value: glyphs }, storyLetters: { value: storyLetters } },
    }));
    const textDraw=material(0), walls=material(1);
    const textMesh=new Mesh(textGeometry,textDraw), wallMesh=new Mesh(wallGeometry,walls);
    textMesh.frustumCulled=wallMesh.frustumCulled=false;
    textMesh.renderOrder=1;wallMesh.renderOrder=2;
    scene.add(textMesh,wallMesh);
    const tuningUniforms = (c: Config) => {
      const t={...backgroundDefaults,...c.tuning};
      return { raster:[t.rasterOpacity,t.gridSize,t.ambientOpacity,t.ambientSoftness], ambient:[t.centerQuiet,t.clickOpacity,t.clickSpeed,t.clickWidth], click:[t.clickWiden,t.clickLifetime,t.clickDecay,t.clickWarp], detail:[t.clickArcs,t.clickEcho,t.clickKick,t.refraction], interaction:[t.blur,t.suppression,t.recovery,0], rebound:[t.reboundDelay,t.reboundDistance,t.reboundStrength,t.reboundDuration] };
    };
    const backdrop=track(new RawShaderMaterial({glslVersion:GLSL3,vertexShader:fullscreenVertex,fragmentShader:backdropFragment,depthTest:false,depthWrite:false,blending:NoBlending,uniforms:{characterField:{value:characterField.texture},alphabet:{value:alphabet},background:{value:{...tuningUniforms(config),color:[...palettes[config.palette].background,1],view:[1,0,0,0],wave0:[0,0,-1,0],wave1:[0,0,-1,0],wave2:[0,0,-1,0],wave3:[0,0,-1,0]}}}}));
    const backgroundMesh=fullscreen(backdrop);backgroundMesh.renderOrder=0;scene.add(backgroundMesh);
    context.compile(scene,camera);
    context.compile(fieldScene,camera);
    signal.throwIfAborted();
    return {
      resize(width: number,height: number) {
        width=Math.max(1,width);height=Math.max(1,height);
        const dpr=Math.min(devicePixelRatio,1.75);aspect=width/height;cssWidth=width;
        characterField.setSize(Math.max(1,Math.ceil(width/7)),Math.max(1,Math.ceil(height/10)));
        context.setPixelRatio(dpr);context.setSize(width,height,false);
      },
      render(c: Config,intro = 1,waves: Wave[] = [],presentation = 0,story?:Story,bandLag=0) {
        if (lastText !== c.text) writeText(c.text);

        textDraw.uniforms.settings.value=uniforms(c,intro,0,presentation,story,bandLag);
        walls.uniforms.settings.value=uniforms(c,intro,1,presentation,story,bandLag);
        const wave = (i: number) => waves[i] ? [waves[i].x,waves[i].y,waves[i].age,waves[i].variation] : [0,0,-1,0];
        const tuning={...backgroundDefaults,...c.tuning};
        const tone=story?unfoldTone(presentation):0;
        const color=palettes[c.palette].background.map((value,i)=>value+([.141,.102,.086][i]-value)*tone);
        const backgroundUniforms=tuningUniforms(c);backgroundUniforms.raster[0]*=1-tone;
        backdrop.uniforms.background.value={...backgroundUniforms,color:[...color,(c.backgroundStrength ?? 1)*(1-tone)],view:[aspect,(c.time+(c.phase ?? 0))*tuning.ambientSpeed,c.background ?? 0,cssWidth],wave0:wave(0),wave1:wave(1),wave2:wave(2),wave3:wave(3)};
        fieldDraw.uniforms.field.value={view:[aspect,(c.time+(c.phase ?? 0))*3*tuning.ambientSpeed,0,0],shape:[tuning.ambientScale,tuning.ambientThickness,tuning.ambientMerge,0]};
        const instances=story?18:6;
        textGeometry.instanceCount=wallGeometry.instanceCount=instances;
        wallMesh.visible=edgeVertices>0;
        if(c.background===2 && tone<1){context.setRenderTarget(characterField);context.clear();context.render(fieldScene,camera);}
        context.setRenderTarget(null);context.clear();context.render(scene,camera);
      },
      dispose,
    };
  } catch(error) { dispose(); throw error; }
}
