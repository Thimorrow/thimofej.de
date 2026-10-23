struct Settings {
  view: vec4f,
  motion: vec4f,
  shape: vec4f,
  ink: vec4f,
  paper: vec4f,
  material: vec4f,
  story: vec4f,
  storyStyle: vec4f,
};
@group(0) @binding(0) var<uniform> settings: Settings;
@group(0) @binding(1) var letters: texture_2d<f32>;
@group(0) @binding(2) var linearSampler: sampler;
@group(0) @binding(3) var<storage,read> edges: array<vec4f>;
@group(0) @binding(4) var storyLetters:texture_2d<f32>;
struct Out {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) world: vec3f,
  @location(2) normal: vec3f,
  @location(3) @interpolate(flat) wall: f32,
  @location(4) visibility:f32,
  @location(5) @interpolate(flat) strip:f32,
};
fn ry(p:vec3f,a:f32)->vec3f{return vec3f(cos(a)*p.x+sin(a)*p.z,p.y,-sin(a)*p.x+cos(a)*p.z);}
fn rx(p:vec3f,a:f32)->vec3f{return vec3f(p.x,cos(a)*p.y-sin(a)*p.z,sin(a)*p.y+cos(a)*p.z);}
fn rz(p:vec3f,a:f32)->vec3f{return vec3f(cos(a)*p.x-sin(a)*p.y,sin(a)*p.x+cos(a)*p.y,p.z);}
fn cameraDistance()->f32{return max(9.0,8.5/settings.view.x)+(1.0-smoothstep(0.0,1.0,settings.motion.w))*2.0;}
@vertex fn vs_main(@builtin(vertex_index) vi:u32,@builtin(instance_index) ii:u32)->Out {
  let wall=settings.view.w;
  let strip=f32(ii/2u);
  let copy=(ii/2u)%3u!=1u;
  let unfolding=settings.material.w>0.5;
  let opening=select(0.0,smoothstep(0.04,0.96,settings.view.y),unfolding);
  let layer=select(strip,2.0-floor(strip/3.0),unfolding);
  var uv=vec2f(0);
  var edgeAngle=0.0;
  var side=select(-1.0,1.0,ii%2u==0u);
  if(wall>0.5){
    let e=edges[vi];
    uv=vec2f(e.x*0.5+f32(ii%2u)*0.5,e.y);
    uv.x=mix(uv.x,e.x,opening);
    side=e.z;edgeAngle=e.w;
  }else{
    let corners=array<vec2f,6>(vec2f(0,0),vec2f(1,0),vec2f(0,1),vec2f(0,1),vec2f(1,0),vec2f(1,1));
    let cell=vi/6u;
    uv=(vec2f(f32(cell%192u),f32(cell/192u))+corners[vi%6u])/vec2f(192,12);
  }
  let reveal=smoothstep(layer*0.12,0.70+layer*0.12,settings.motion.w);
  let arrival=1.0-reveal;
  let turn=settings.motion.x*0.18+layer*0.56+settings.shape.w*0.18;
  let angle=uv.x*6.283185+turn+arrival*(1.1-layer*0.3);
  let radius=2.42+settings.shape.x*0.24+side*settings.material.z;
  let y=(0.5-uv.y)*1.65+(layer-1.0)*(1.65+arrival*0.9);
  var p=vec3f(sin(angle)*radius,y,cos(angle)*radius);
  var n=vec3f(sin(angle),0,cos(angle))*side;
  if(wall>0.5){n=vec3f(cos(angle)*cos(edgeAngle),-sin(edgeAngle),-sin(angle)*cos(edgeAngle));}
  let tilt=0.22+(layer-1.0)*settings.shape.y*0.12+arrival*(layer-1.0)*0.2;
  let roll=-0.18+settings.shape.y*0.12*sin(layer*2.1+settings.shape.w);
  p=rz(rx(p,tilt),roll); n=rz(rx(n,tilt),roll);
  p=rx(ry(p,settings.motion.y-0.25),settings.motion.z); n=rx(ry(n,settings.motion.y-0.25),settings.motion.z);
  var visibility=1.0;
  if(unfolding){
    let separation=smoothstep(1.0,2.0,settings.view.y);
    let phase=settings.story.z;
    let stagger=sin(strip*1.7+phase)*settings.story.w;
    let local=uv.x-0.5;
    let pull=exp(-pow((local-settings.story.x*0.5)*3.0,2.0)-pow((4.0-strip)/5.0-settings.story.y,2.0)*2.0);
    let wave=sin(uv.x*6.283185+strip*0.64+phase)*0.32;
    let depth=(wave+pull*settings.story.x*1.8)*settings.storyStyle.x;
    let fly=select(-1.0,1.0,strip>=4.0)*separation;
    let viewScale=cameraDistance()/9.0;
    // Open the cylinder by reducing its angular span at constant arc length.
    let span=max(0.002,6.283185*(1.0-opening));
    let width=mix(6.283185*(2.42+settings.shape.x*0.24)*settings.shape.z,settings.view.x*8.2*viewScale,opening);
    let arcRadius=width/span+side*settings.material.z;
    let phi=local*span;
    // Same starting orientation, one full revolution less on the way to flat.
    let arcTurn=(turn-3.14159265)*(1.0-opening);
    let growth=select(1.0,smoothstep(0.24,0.64,settings.view.y),copy);
    let flatY=((4.0-strip)*0.66+(0.5-uv.y)*0.82*settings.storyStyle.y*growth+0.1)*viewScale;
    let startY=((0.5-uv.y)*1.65*growth+(layer-1.0)*(1.65+arrival*0.9))*settings.shape.z;
    var arc=vec3f(sin(phi)*arcRadius,mix(startY,flatY,opening),(cos(phi)-smoothstep(0.0,1.0,opening))*arcRadius);
    var arcNormal=vec3f(sin(phi),0,cos(phi))*side;
    arc=ry(arc,arcTurn);arcNormal=ry(arcNormal,arcTurn);
    arc=rz(rx(arc,tilt*(1.0-opening)),roll*(1.0-opening));
    arcNormal=rz(rx(arcNormal,tilt*(1.0-opening)),roll*(1.0-opening));
    arc=rx(ry(arc,(settings.motion.y-0.25)*(1.0-opening)),settings.motion.z*(1.0-opening));
    arcNormal=rx(ry(arcNormal,(settings.motion.y-0.25)*(1.0-opening)),settings.motion.z*(1.0-opening));
    arc+=vec3f(stagger*0.5+fly*settings.view.x*4.0,sin(uv.x*3.14159)*depth*0.25,depth+separation*(strip-4.0)*0.4)*viewScale*opening;
    if(opening>0.0){p=arc;n=normalize(arcNormal+vec3f(-cos(uv.x*6.283185+strip*.64+phase)*0.2*settings.storyStyle.x*opening,0,0));}
    else{p*=settings.shape.z;}
    p=ry(p,separation*(strip-4.0)*0.11);
    n=ry(n,separation*(strip-4.0)*0.11);
    if(copy){visibility=select(0.0,1.0,settings.view.y>0.24);}
    if(wall>0.5){visibility*=1.0-smoothstep(0.04,0.2,settings.view.y);}
    if(ii%2u==1u && wall<0.5 && settings.view.y>0.3){visibility=0.0;}
    visibility*=1.0-smoothstep(1.72,2.0,settings.view.y);
  }else{p*=settings.shape.z*mix(1.0,0.53,settings.view.y);}
  let camera=cameraDistance();
  let w=camera-p.z;
  var o:Out;
  let narrow=settings.view.x<0.85;
  let shift=select(select(vec2f(-0.49,0.02),vec2f(0.0,0.52),narrow)*settings.view.y,vec2f(0),unfolding);
  o.position=vec4f(p.x*2.1/settings.view.x+shift.x*w,p.y*2.1+shift.y*w,w-0.15,w);
  o.uv=vec2f(uv.x*mix(2.0,1.0,opening),uv.y);o.world=p;o.normal=n;o.wall=wall;o.visibility=visibility;o.strip=strip;
  return o;
}
fn lightResponse(n:vec3f,v:vec3f,l:vec3f,rough:f32,base:vec3f)->vec3f{
  let h=normalize(v+l);
  let nl=max(dot(n,l),0.0);let nv=max(dot(n,v),0.001);let nh=max(dot(n,h),0.0);let vh=max(dot(v,h),0.0);
  let a=rough*rough;let a2=a*a;
  let den=nh*nh*(a2-1.0)+1.0;
  let d=a2/(3.14159*den*den+0.0001);
  let k=(rough+1.0)*(rough+1.0)/8.0;
  let g=nv/(nv*(1.0-k)+k)*nl/(nl*(1.0-k)+k);
  let f=vec3f(0.04)+(vec3f(1.0)-vec3f(0.04))*pow(1.0-vh,5.0);
  return (base/3.14159+f*d*g/(4.0*nv*max(nl,0.001)))*nl;
}
@fragment fn fs_main(i:Out)->@location(0) vec4f{
  let uv=vec2f(fract(i.uv.x),i.uv.y);
  var mask=textureSample(letters,linearSampler,uv).r;
  let inkMask=textureSample(storyLetters,linearSampler,uv).r;
  let stroke=select(3.5,8.0,settings.view.x<0.85);
  let texel=vec2f(stroke/2048.0,stroke/384.0);
  let inside=min(min(textureSample(storyLetters,linearSampler,uv+vec2f(texel.x,0)).r,textureSample(storyLetters,linearSampler,uv-vec2f(texel.x,0)).r),min(textureSample(storyLetters,linearSampler,uv+vec2f(0,texel.y)).r,textureSample(storyLetters,linearSampler,uv-vec2f(0,texel.y)).r));
  if(settings.material.w>0.5 && settings.view.y>0.001){
    let change=smoothstep(0.36+uv.x*0.12,0.64+uv.x*0.12,settings.view.y);
    let erosion=smoothstep(0.75,1.0,settings.view.y);
    let outlined=select(inkMask,inkMask*(1.0-smoothstep(1.0-erosion,1.04-erosion,inside)),u32(i.strip)%2u==1u);
    let changed=mix(mask,outlined,change);
    mask=mix(smoothstep(0.42,0.58,changed),changed,smoothstep(0.78,1.0,settings.view.y));
  }
  if((i.wall<0.5 && mask<0.05) || i.visibility<0.02){discard;}
  var n=normalize(i.normal);
  let v=normalize(vec3f(0,0,cameraDistance())-i.world);
  if(dot(n,v)<0.0){n=-n;}
  let lightAngle=settings.material.y;
  let key=normalize(ry(vec3f(-3.5,5,6),lightAngle));
  let fill=normalize(ry(vec3f(4,0.5,2),lightAngle));
  let rim=normalize(ry(vec3f(1,3,-4),lightAngle));
  let base=pow(max(settings.ink.xyz,vec3f(0.025)),vec3f(2.2));
  let env=pow(max(settings.paper.xyz,vec3f(0.01)),vec3f(2.2));
  let tint=env/max(max(env.r,env.g),env.b);
  let rough=settings.material.x;
  var c=base*(vec3f(0.22)+tint*0.1);
  c+=lightResponse(n,v,key,rough,base)*vec3f(3.6,3.3,2.9);
  c+=lightResponse(n,v,fill,min(0.95,rough+0.2),base)*mix(vec3f(0.65,0.8,1.0),tint*0.9,0.5);
  c+=lightResponse(n,v,rim,rough,base)*vec3f(2.4,2.1,1.8);
  // Broad studio reflection gives curved enamel a continuous highlight, even in shadow.
  let r=reflect(-v,n);
  let studio=pow(max(dot(r,key),0.0),mix(30.0,4.0,rough));
  c+=mix(vec3f(0.35,0.32,0.27),tint*0.35,0.25)*studio;
  if(i.wall>0.5){c*=0.78;}
  c=c/(vec3f(1.0)+c);
  var color=pow(c,vec3f(1.0/2.2));
  if(settings.material.w>0.5){color=mix(color,settings.ink.xyz,smoothstep(0.42,0.95,settings.view.y)*0.78);}
  return vec4f(color,select(smoothstep(0.1,0.9,mask),1.0,i.wall>0.5)*i.visibility);
}
