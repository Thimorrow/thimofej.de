export const orbitVertex = /* glsl */ `
precision highp float;
precision highp int;
struct Settings {
  vec4 view;
  vec4 motion;
  vec4 shape;
  vec4 ink;
  vec4 paper;
  vec4 material;
  vec4 story;
  vec4 storyStyle;
  vec4 textWave0;
  vec4 textWave1;
  vec4 textWave2;
  vec4 textWave3;
  vec4 pulseShape;
  vec4 pulseLife;
  vec4 pulseRebound;
  vec4 pulseForce;
};
uniform Settings settings;
out vec2 vUv;
out vec3 vWorld;
out vec3 vNormal;
flat out float vWall;
out float vVisibility;
flat out float vStrip;
in vec4 glyphEdge;
vec3 ry(vec3 p,float a){return vec3(cos(a)*p.x+sin(a)*p.z,p.y,-sin(a)*p.x+cos(a)*p.z);}
vec3 rx(vec3 p,float a){return vec3(p.x,cos(a)*p.y-sin(a)*p.z,sin(a)*p.y+cos(a)*p.z);}
vec3 rz(vec3 p,float a){return vec3(cos(a)*p.x-sin(a)*p.y,sin(a)*p.x+cos(a)*p.y,p.z);}
float cameraDistance(){return max(9.0,8.5/settings.view.x)+(1.0-smoothstep(0.0,1.0,settings.motion.w))*2.0;}


float textImpulse(vec2 p,vec4 wave){
  if(wave.z<0.0){return 0.0;}
  float age=wave.z;
  float angle=wave.w*6.283185;
  vec2 d=p-vec2(wave.x*settings.view.x,wave.y);
  float radius=length(d);
  vec2 direction=d/max(radius,0.001);
  float theta=atan(d.y,d.x);
  float front=(1.12+wave.w*0.16)*settings.pulseShape.x*age+settings.pulseForce.x*0.3*(1.0-exp(-age*7.0));
  float warp=(sin(theta*3.0+angle)*0.045+sin(theta*5.0-angle)*0.022)*min(age*2.0,1.0)*settings.pulseShape.w;
  float width=(settings.pulseShape.y+age*settings.pulseShape.z)*2.4;
  float offset=radius-front+warp;
  float envelope=exp(-pow(offset/(width*1.5),2.0));
  float shoulder=exp(-pow((offset+width*2.0)/(width*2.2),2.0))*0.20*(settings.pulseLife.w/2.4);
  float drift=0.5+0.5*sin(p.x*3.7+p.y*2.4+angle)*cos(p.y*4.1-p.x*1.6);
  float arcs=mix(1.0-settings.pulseLife.z,1.0,smoothstep(0.15,0.85,drift));
  float release=exp(-age*settings.pulseLife.x)*(1.0-smoothstep(settings.pulseLife.y*0.62,settings.pulseLife.y,age));
  float pressure=(envelope-shoulder)*release*(1.0-exp(-age*35.0))*arcs;
  float elapsed=age-settings.pulseRebound.x;
  if(elapsed>0.0 && elapsed<settings.pulseRebound.w){
    float progress=elapsed/settings.pulseRebound.w;
    vec2 axis=vec2(cos(angle),sin(angle));
    float facing=pow(smoothstep(-0.25,1.0,dot(direction,axis)),1.5);
    float afterFront=settings.pulseRebound.y*(1.0-pow(1.0-progress,3.0));
    float afterEnvelope=exp(-pow((radius-afterFront)/(0.10+progress*0.07),2.0));
    float life=smoothstep(0.0,0.16,progress)*(1.0-smoothstep(0.32,1.0,progress));
    pressure+=afterEnvelope*facing*life*settings.pulseRebound.z;
  }
  return pressure;
}
void main(){
int vi=gl_VertexID; int ii=gl_InstanceID;
  float wall=settings.view.w;
  float strip=float(ii/2);
  bool copy=(ii/2)%3!=1;
  bool unfolding=settings.material.w>0.5;
  float opening=((unfolding) ? (smoothstep(0.04,0.88,settings.view.y)) : (0.0));
  float layer=((unfolding) ? (2.0-floor(strip/3.0)) : (strip));
  vec2 uv=vec2(0);
  float edgeAngle=0.0;
  float side=((ii%2==0) ? (1.0) : (-1.0));
  if(wall>0.5){
    vec4 e=glyphEdge;
    uv=vec2(e.x*0.5+float(ii%2)*0.5,e.y);
    uv.x=mix(uv.x,e.x,opening);
    side=e.z;edgeAngle=e.w;
  }else{
    vec2 corners[6]=vec2[6](vec2(0,0),vec2(1,0),vec2(0,1),vec2(0,1),vec2(1,0),vec2(1,1));
    int cell=vi/6;
    uv=(vec2(float(cell%192),float(cell/192))+corners[vi%6])/vec2(192,12);
  }
  float reveal=smoothstep(layer*0.12,0.70+layer*0.12,settings.motion.w);
  float arrival=1.0-reveal;

  float turn=settings.motion.x*0.18+layer*0.56+settings.shape.w*0.18+(layer+0.3)*settings.storyStyle.z;
  float angle=uv.x*6.283185+turn+arrival*(1.1-layer*0.3);
  float radius=2.42+settings.shape.x*0.24+side*settings.material.z;
  float y=(0.5-uv.y)*1.65+(layer-1.0)*(1.65+arrival*0.9);
  vec3 p=vec3(sin(angle)*radius,y,cos(angle)*radius);
  vec3 n=vec3(sin(angle),0,cos(angle))*side;
  if(wall>0.5){n=vec3(cos(angle)*cos(edgeAngle),-sin(edgeAngle),-sin(angle)*cos(edgeAngle));}
  float tilt=0.22+(layer-1.0)*settings.shape.y*0.12+arrival*(layer-1.0)*0.2;
  float roll=-0.18+settings.shape.y*0.12*sin(layer*2.1+settings.shape.w);
  p=rz(rx(p,tilt),roll); n=rz(rx(n,tilt),roll);
  p=rx(ry(p,settings.motion.y-0.25),settings.motion.z); n=rx(ry(n,settings.motion.y-0.25),settings.motion.z);
  float visibility=1.0;
  if(unfolding){
    float separation=smoothstep(1.0,2.0,settings.view.y);
    float phase=settings.story.z;
    float fan=smoothstep(0.66,0.96,settings.view.y);
    float rowFan=smoothstep(0.46,0.70,settings.view.y);
    float stagger=sin(strip*1.7+phase)*settings.story.w*fan*min(1.0,settings.view.x);
    float local=uv.x-0.5;
    float pull=exp(-pow((local-settings.story.x*0.5)*3.0,2.0)-pow((4.0-strip)/5.0-settings.story.y,2.0)*2.0);
    float wave=sin(uv.x*6.283185+strip*0.64+phase)*0.24;
    float depth=(wave+pull*settings.story.x*1.8)*settings.storyStyle.x*fan;
    float fly=sign(strip-4.0)*separation;
    float viewScale=cameraDistance()/9.0;

    float span=max(0.002,6.283185*(1.0-opening));
    float width=mix(6.283185*(2.42+settings.shape.x*0.24)*settings.shape.z,settings.view.x*8.2*viewScale,opening);
    float arcRadius=width/span+side*settings.material.z*mix(settings.shape.z,1.0,opening);
    float phi=local*span;

    float startTurn=turn-3.14159265+arrival*(1.1-layer*0.3);
    float arcTurn=atan(sin(startTurn),cos(startTurn))*(1.0-opening);
    float growth=((copy) ? (mix(0.84,1.0,fan)) : (1.0));

    float rowCenter=(layer-1.0)*1.98+(1.0-float((ii/2)%3))*0.66*rowFan;
    float printHeight=mix(0.82,0.98,smoothstep(0.85,1.6,settings.view.x));
    float flatY=(rowCenter+(0.5-uv.y)*printHeight*settings.storyStyle.y*growth+0.1)*viewScale;
    float startY=((0.5-uv.y)*1.65*growth+(layer-1.0)*(1.65+arrival*0.9))*settings.shape.z;
    vec3 arc=vec3(sin(phi)*arcRadius,mix(startY,flatY,opening),(cos(phi)-smoothstep(0.0,1.0,opening))*arcRadius);
    vec3 arcNormal=vec3(sin(phi),0,cos(phi))*side;
    arc=ry(arc,arcTurn);arcNormal=ry(arcNormal,arcTurn);
    arc=rz(rx(arc,tilt*(1.0-opening)),roll*(1.0-opening));
    arcNormal=rz(rx(arcNormal,tilt*(1.0-opening)),roll*(1.0-opening));
    float facing=atan(sin(settings.motion.y-0.25),cos(settings.motion.y-0.25))*(1.0-opening);
    arc=rx(ry(arc,facing),settings.motion.z*(1.0-opening));
    arcNormal=rx(ry(arcNormal,facing),settings.motion.z*(1.0-opening));
    arc+=vec3(stagger*0.5+fly*settings.view.x*4.0,sin(uv.x*3.14159)*depth*0.25,depth)*viewScale*opening;
    if(opening>0.0){p=arc;n=normalize(arcNormal+vec3(-cos(uv.x*6.283185+strip*.64+phase)*0.2*settings.storyStyle.x*opening*fan,0,0));}
    else{p*=settings.shape.z;}
    if(copy){visibility=fan;}
    if(wall>0.5){visibility*=1.0-smoothstep(0.04,0.2,settings.view.y);}
    if(ii%2==1 && wall<0.5 && settings.view.y>0.3){visibility=0.0;}
    visibility*=1.0-smoothstep(1.72,2.0,settings.view.y);
  }else{p*=settings.shape.z*mix(1.0,0.53,settings.view.y);}
  float camera=cameraDistance();
  float w=camera-p.z;

  bool narrow=settings.view.x<0.85;
  vec2 shift=((unfolding) ? (vec2(0)) : (((narrow) ? (vec2(0.0,0.52)) : (vec2(-0.49,0.02)))*settings.view.y));
  gl_Position=vec4(p.x*2.1/settings.view.x+shift.x*w,p.y*2.1+shift.y*w,w-0.15,w);
  vUv=vec2(uv.x*mix(2.0,1.0,opening),uv.y);vWorld=p;vNormal=n;vWall=wall;vVisibility=visibility;vStrip=strip;
  gl_Position.z=gl_Position.z*2.0-gl_Position.w;
}
`;

export const orbitFragment = /* glsl */ `
precision highp float;
precision highp int;
struct Settings {
  vec4 view;
  vec4 motion;
  vec4 shape;
  vec4 ink;
  vec4 paper;
  vec4 material;
  vec4 story;
  vec4 storyStyle;
  vec4 textWave0;
  vec4 textWave1;
  vec4 textWave2;
  vec4 textWave3;
  vec4 pulseShape;
  vec4 pulseLife;
  vec4 pulseRebound;
  vec4 pulseForce;
};
uniform Settings settings;
in vec2 vUv;
in vec3 vWorld;
in vec3 vNormal;
flat in float vWall;
in float vVisibility;
flat in float vStrip;
uniform sampler2D letters;
uniform sampler2D storyLetters;
out vec4 outColor;
vec3 ry(vec3 p,float a){return vec3(cos(a)*p.x+sin(a)*p.z,p.y,-sin(a)*p.x+cos(a)*p.z);}
vec3 rx(vec3 p,float a){return vec3(p.x,cos(a)*p.y-sin(a)*p.z,sin(a)*p.y+cos(a)*p.z);}
vec3 rz(vec3 p,float a){return vec3(cos(a)*p.x-sin(a)*p.y,sin(a)*p.x+cos(a)*p.y,p.z);}
float cameraDistance(){return max(9.0,8.5/settings.view.x)+(1.0-smoothstep(0.0,1.0,settings.motion.w))*2.0;}


float textImpulse(vec2 p,vec4 wave){
  if(wave.z<0.0){return 0.0;}
  float age=wave.z;
  float angle=wave.w*6.283185;
  vec2 d=p-vec2(wave.x*settings.view.x,wave.y);
  float radius=length(d);
  vec2 direction=d/max(radius,0.001);
  float theta=atan(d.y,d.x);
  float front=(1.12+wave.w*0.16)*settings.pulseShape.x*age+settings.pulseForce.x*0.3*(1.0-exp(-age*7.0));
  float warp=(sin(theta*3.0+angle)*0.045+sin(theta*5.0-angle)*0.022)*min(age*2.0,1.0)*settings.pulseShape.w;
  float width=(settings.pulseShape.y+age*settings.pulseShape.z)*2.4;
  float offset=radius-front+warp;
  float envelope=exp(-pow(offset/(width*1.5),2.0));
  float shoulder=exp(-pow((offset+width*2.0)/(width*2.2),2.0))*0.20*(settings.pulseLife.w/2.4);
  float drift=0.5+0.5*sin(p.x*3.7+p.y*2.4+angle)*cos(p.y*4.1-p.x*1.6);
  float arcs=mix(1.0-settings.pulseLife.z,1.0,smoothstep(0.15,0.85,drift));
  float release=exp(-age*settings.pulseLife.x)*(1.0-smoothstep(settings.pulseLife.y*0.62,settings.pulseLife.y,age));
  float pressure=(envelope-shoulder)*release*(1.0-exp(-age*35.0))*arcs;
  float elapsed=age-settings.pulseRebound.x;
  if(elapsed>0.0 && elapsed<settings.pulseRebound.w){
    float progress=elapsed/settings.pulseRebound.w;
    vec2 axis=vec2(cos(angle),sin(angle));
    float facing=pow(smoothstep(-0.25,1.0,dot(direction,axis)),1.5);
    float afterFront=settings.pulseRebound.y*(1.0-pow(1.0-progress,3.0));
    float afterEnvelope=exp(-pow((radius-afterFront)/(0.10+progress*0.07),2.0));
    float life=smoothstep(0.0,0.16,progress)*(1.0-smoothstep(0.32,1.0,progress));
    pressure+=afterEnvelope*facing*life*settings.pulseRebound.z;
  }
  return pressure;
}
vec3 lightResponse(vec3 n,vec3 v,vec3 l,float rough,vec3 base){
  vec3 h=normalize(v+l);
  float nl=max(dot(n,l),0.0);float nv=max(dot(n,v),0.001);float nh=max(dot(n,h),0.0);float vh=max(dot(v,h),0.0);
  float a=rough*rough;float a2=a*a;
  float den=nh*nh*(a2-1.0)+1.0;
  float d=a2/(3.14159*den*den+0.0001);
  float k=(rough+1.0)*(rough+1.0)/8.0;
  float g=nv/(nv*(1.0-k)+k)*nl/(nl*(1.0-k)+k);
  vec3 f=vec3(0.04)+(vec3(1.0)-vec3(0.04))*pow(1.0-vh,5.0);
  return (base/3.14159+f*d*g/(4.0*nv*max(nl,0.001)))*nl;
}
void main(){
  vec2 uv=vec2(fract(vUv.x),vUv.y);
  float mask=texture(letters,uv).r;
  float pigment=1.0;
  vec2 screen=vWorld.xy*2.1/(cameraDistance()-vWorld.z);
  bool inkWave=settings.material.w>0.5 && settings.view.y>0.84 && settings.storyStyle.x>0.0
    && max(max(settings.textWave0.z,settings.textWave1.z),max(settings.textWave2.z,settings.textWave3.z))>=0.0;
  float pressure=0.0;
  if(inkWave){
    pressure=textImpulse(screen,settings.textWave0)+textImpulse(screen,settings.textWave1)+textImpulse(screen,settings.textWave2)+textImpulse(screen,settings.textWave3);
  }
  if(settings.material.w>0.5 && settings.view.y>0.48){

    float inkMask=texture(storyLetters,uv).r*((vUv.x<=1.0) ? (1.0) : (0.0));
    float outlined=inkMask;
    if(settings.view.y>0.84){
      float stroke=((settings.view.x<0.85) ? (8.0) : (4.5));
      vec2 texel=vec2(stroke/2048.0,stroke/384.0);
      float inside=min(min(texture(storyLetters,uv+vec2(texel.x,0)).r,texture(storyLetters,uv-vec2(texel.x,0)).r),min(texture(storyLetters,uv+vec2(0,texel.y)).r,texture(storyLetters,uv-vec2(0,texel.y)).r));
      float erosion=smoothstep(0.84,1.0,settings.view.y);
      float contour=inkMask*(1.0-smoothstep(1.0-erosion,1.04-erosion,inside));
      bool odd=int(vStrip)%2==1;
      outlined=((odd) ? (contour) : (inkMask));
      if(inkWave){
        float fill=smoothstep(0.015,0.36,max(pressure,0.0));
        pigment=mix(((odd) ? (contour) : (1.0)),((odd) ? (1.0) : (contour)),fill);
        outlined=inkMask;
      }
    }
    float change=smoothstep(0.48,0.66,settings.view.y);
    float changed=mix(mask,outlined,change);
    mask=mix(smoothstep(0.42,0.58,changed),changed,smoothstep(0.84,1.0,settings.view.y));
  }
  if((vWall<0.5 && mask<0.05) || vVisibility<0.02){discard;}
  vec3 n=normalize(vNormal);
  vec3 v=normalize(vec3(0,0,cameraDistance())-vWorld);
  if(dot(n,v)<0.0){n=-n;}
  float lightAngle=settings.material.y;
  vec3 key=normalize(ry(vec3(-3.5,5,6),lightAngle));
  vec3 fill=normalize(ry(vec3(4,0.5,2),lightAngle));
  vec3 rim=normalize(ry(vec3(1,3,-4),lightAngle));
  vec3 base=pow(max(settings.ink.xyz,vec3(0.025)),vec3(2.2));
  vec3 env=pow(max(settings.paper.xyz,vec3(0.01)),vec3(2.2));
  vec3 tint=env/max(max(env.r,env.g),env.b);
  float rough=settings.material.x;
  vec3 c=base*(vec3(0.22)+tint*0.1);
  c+=lightResponse(n,v,key,rough,base)*vec3(3.6,3.3,2.9);
  c+=lightResponse(n,v,fill,min(0.95,rough+0.2),base)*mix(vec3(0.65,0.8,1.0),tint*0.9,0.5);
  c+=lightResponse(n,v,rim,rough,base)*vec3(2.4,2.1,1.8);

  vec3 r=reflect(-v,n);
  float studio=pow(max(dot(r,key),0.0),mix(30.0,4.0,rough));
  c+=mix(vec3(0.35,0.32,0.27),tint*0.35,0.25)*studio;
  if(vWall>0.5){c*=0.78;}
  c=c/(vec3(1.0)+c);
  vec3 color=pow(c,vec3(1.0/2.2));
  if(settings.material.w>0.5){color=mix(color,settings.ink.xyz,smoothstep(0.18,0.72,settings.view.y)*0.92);}
  float opacity=vVisibility;
  if(settings.material.w>0.5){


    vec3 paper=mix(settings.paper.xyz,vec3(0.141,0.102,0.086),smoothstep(0.12,0.72,settings.view.y));
    color=mix(paper,color,vVisibility);
    opacity=1.0;
  }
  if(inkWave){

    float glow=exp(-dot(screen-vec2(-0.25,0.35),screen-vec2(-0.25,0.35))*1.1);
    float shadow=exp(-pow(screen.x/0.55,2.0)-pow((screen.y+0.61)/0.075,2.0))*0.08;
    vec3 paper=vec3(0.141,0.102,0.086)*(0.96+glow*0.08-shadow);
    color=mix(paper,color,pigment);
  }
  outColor=vec4(color,((vWall>0.5) ? (1.0) : (smoothstep(0.1,0.9,mask)))*opacity);
}
`;

export const fullscreenVertex = /* glsl */ `
precision highp float;
precision highp int;
out vec2 vUv;
void main(){
  vec2 corners[3]=vec2[3](vec2(-1,-1),vec2(3,-1),vec2(-1,3));
  vUv=corners[gl_VertexID];
  gl_Position=vec4(vUv,0,1);
}
`;

export const backdropFragment = /* glsl */ `
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 outColor;
struct Backdrop { vec4 color; vec4 view; vec4 wave0; vec4 wave1; vec4 wave2; vec4 wave3; vec4 raster; vec4 ambient; vec4 click; vec4 detail; vec4 interaction; vec4 rebound; };

uniform Backdrop background;
uniform sampler2D characterField;
uniform sampler2D alphabet;
vec4 sampleField(vec2 uv,float lod){return textureLod(characterField,vec2(uv.x,1.0-uv.y),lod);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float field(vec2 p,float t){
 vec2 q=p+vec2(sin(p.y*2.0+t*0.12),cos(p.x*1.6-t*0.09))*0.24;
 vec2 center=vec2(sin(t*0.08)*0.55,cos(t*0.06)*0.3);
 float ring=exp(-pow((length(q-center)-0.95)/0.24,2.0));
 float other=exp(-pow((length(q+center+vec2(0.8,0.4))-0.62)/0.18,2.0));
 return min(1.0,ring+other*0.65);
}


vec4 afterImpulse(vec2 d,float age,float angle){
 float elapsed=age-background.rebound.x;
 if(elapsed<=0.0 || elapsed>=background.rebound.w){return vec4(0);}
 float progress=elapsed/background.rebound.w;
 float ease=1.0-pow(1.0-progress,3.0);
 vec2 axis=vec2(cos(angle),sin(angle));
 float radius=length(d);

 float facing=pow(smoothstep(-0.25,1.0,dot(d/max(radius,0.001),axis)),1.5);
 float front=background.rebound.y*ease;
 float width=0.10+progress*0.07;
 float offset=radius-front;
 float envelope=exp(-pow(offset/width,2.0));
 float life=smoothstep(0.0,0.16,progress)*(1.0-smoothstep(0.32,1.0,progress));
 float pressure=envelope*facing*life*background.rebound.z;
 vec2 direction=d/max(radius,0.001);
 return vec4(direction*pressure*background.detail.w,pressure,pressure*0.8);
}

vec4 impulse(vec2 p,vec4 w){
 if(w.z<0.0){return vec4(0);}
 float age=w.z;float v=w.w;float angle=v*6.283185;
 vec2 d=p-vec2(w.x*background.view.x,w.y);
 float theta=atan(d.y,d.x);
 float radius=length(d);

 float front=(1.12+v*0.16)*background.ambient.z*age+background.detail.z*0.3*(1.0-exp(-age*7.0));
 float flow=background.view.y*0.35;
 float warp=(sin(theta*3.0+angle+flow)*0.045+sin(theta*5.0-angle-flow*0.7)*0.022)*min(age*2.0,1.0)*background.click.w;
 float width=background.ambient.w+age*background.click.x;
 float offset=radius-front+warp;
 float envelope=exp(-pow(offset/(width*1.5),2.0));

 float shoulder=exp(-pow((offset+width*2.0)/(width*2.2),2.0))*0.20*(background.detail.y/2.4);

 float drift=0.5+0.5*sin(p.x*3.7+p.y*2.4+flow+angle)*cos(p.y*4.1-p.x*1.6-flow*0.6);
 float arcs=mix(1.0-background.detail.x,1.0,smoothstep(0.15,0.85,drift));
 float release=exp(-age*background.click.z)*(1.0-smoothstep(background.click.y*0.62,background.click.y,age));
 float attack=1.0-exp(-(age+0.016)*35.0);
 float pressure=(envelope-shoulder)*release*attack*arcs;
 float core=exp(-pow(radius/0.22,2.0))*exp(-age*12.0);
 vec2 direction=d/max(radius,0.001);
 float wake=(1.0-smoothstep(front-width,front+width,radius))*exp(-max(front-radius,0.0)*background.interaction.z)*release;
 return vec4(direction*pressure*background.detail.w,(pressure*1.15+core*0.35),wake)+afterImpulse(d,age,angle);
}
void main(){
 vec2 p=vec2(vUv.x*background.view.x,vUv.y);
 float glow=exp(-dot(p-vec2(-0.25,0.35),p-vec2(-0.25,0.35))*1.1);
 float shadow=exp(-pow(p.x/0.55,2.0)-pow((p.y+0.61)/0.075,2.0))*0.08;
 vec3 c=background.color.xyz*(0.96+glow*0.08-shadow);
 float mode=background.view.z;
 float t=background.view.y*3.0;
 float quietCenter=smoothstep(0.35,1.3,length(p));
 float dark=1.0-smoothstep(0.08,0.3,dot(background.color.xyz,vec3(0.2126,0.7152,0.0722)));
 if(mode>0.5 && mode<1.5){
   float shape=field(p,t);
   c+=mix(vec3(-0.035,-0.027,-0.02),vec3(0.045,0.047,0.05),dark)*shape*quietCenter*background.color.w;
 }
 if(mode>1.5){
   vec2 resolution=vec2(background.view.w,background.view.w/background.view.x);
   vec2 pixel=(vUv*vec2(0.5,-0.5)+0.5)*resolution;
   vec2 grid=pixel/(vec2(7,10)*background.raster.y);
   vec2 cell=floor(grid);vec2 local=fract(grid);

   int sequence[26]=int[26](0,1,2,3,4,5,6,7,14,8,9,10,11,4,14,0,1,2,3,4,12,12,4,13,14,15);
   int index=sequence[(int(cell.x)+int(cell.y)*7)%26];
   float ink=textureLod(alphabet,vec2((float(index)+local.x)/17.0,local.y),0.0).r;
   vec4 pulse=impulse(p,background.wave0)+impulse(p,background.wave1)+impulse(p,background.wave2)+impulse(p,background.wave3);
   vec2 fieldUV=(cell+0.5)*vec2(7,10)*background.raster.y/resolution+pulse.xy*vec2(0.5/background.view.x,-0.5);
   float influence=clamp(pulse.w*1.8+abs(pulse.z)*0.6,0.0,1.0);
   vec2 spread=vec2(background.interaction.x/background.view.x,background.interaction.x)*influence;
   float original=sampleField(fieldUV,0.0).r;
   float softened=(sampleField(fieldUV+vec2(spread.x,0),0.0).r
     +sampleField(fieldUV-vec2(spread.x,0),0.0).r
     +sampleField(fieldUV+vec2(0,spread.y),0.0).r
     +sampleField(fieldUV-vec2(0,spread.y),0.0).r+original)*0.2;
   float shade=mix(original,softened,influence);

   float ambient=pow(smoothstep(0.015,0.72,shade),background.raster.w)*mix(1.0-background.ambient.x,1.0,quietCenter);
   float visibility=background.raster.x+(ambient*background.raster.z*(1.0-influence*background.interaction.y)+max(pulse.z,0.0)*background.ambient.y)*(background.color.w/2.8);
   float alpha=min(0.86,visibility)*ink;
   c=mix(c,mix(vec3(0.16,0.075,0.035),vec3(0.88,0.90,0.94),dark),alpha);
 }
 outColor=vec4(c,1);
}
`;

export const fieldFragment = /* glsl */ `
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 outColor;
struct Field {vec4 view;vec4 shape;};
uniform Field field;
void main(){
 float t=field.view.y*0.14;
 vec2 p=vec2(vUv.x*field.view.x,vUv.y)/field.shape.x;
 vec2 drift=vec2(t*0.18,-t*0.09);
 vec2 q=p+drift;
 float warp=sin(q.y*1.45-t*0.22)*0.62+sin(q.y*2.3+q.x*0.45+t*0.15)*0.18;
 float phase=q.x*1.55+q.y*0.42+warp;
 float width=field.shape.y*0.8;
 float fold=exp(-pow(sin(phase)/width,2.0));
 float crossing=exp(-pow(sin(q.y*1.3-q.x*0.55+sin(q.x*0.85+t*0.2)*0.55+1.8)/(width*0.85),2.0));
 float blend=clamp(field.shape.z/1.5,0.0,1.0);
 float light=fold*0.58+crossing*(0.08+blend*0.18);
 float breathing=0.78+0.12*sin(q.y*0.7+q.x*0.4-t*0.12);
 outColor=vec4(clamp(light*breathing,0.0,1.0),0,0,1);
}
`;
