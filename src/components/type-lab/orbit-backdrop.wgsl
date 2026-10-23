struct Backdrop { color:vec4f, view:vec4f, wave0:vec4f, wave1:vec4f, wave2:vec4f, wave3:vec4f, raster:vec4f, ambient:vec4f, click:vec4f, detail:vec4f, interaction:vec4f, rebound:vec4f };
@group(0) @binding(0) var<uniform> background:Backdrop;
@group(0) @binding(1) var characterField:texture_2d<f32>;
@group(0) @binding(2) var alphabet:texture_2d<f32>;
@group(0) @binding(3) var linearSampler:sampler;
struct Out { @builtin(position) position:vec4f, @location(0) uv:vec2f };
@vertex fn vs_main(@builtin(vertex_index) vi:u32)->Out {
 let p=array<vec2f,3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3));
 var o:Out;o.position=vec4f(p[vi],0,1);o.uv=p[vi];return o;
}
fn hash(p:vec2f)->f32{return fract(sin(dot(p,vec2f(127.1,311.7)))*43758.5453);}
fn field(p:vec2f,t:f32)->f32{
 let q=p+vec2f(sin(p.y*2.0+t*0.12),cos(p.x*1.6-t*0.09))*0.24;
 let center=vec2f(sin(t*0.08)*0.55,cos(t*0.06)*0.3);
 let ring=exp(-pow((length(q-center)-0.95)/0.24,2.0));
 let other=exp(-pow((length(q+center+vec2f(0.8,0.4))-0.62)/0.18,2.0));
 return min(1.0,ring+other*0.65);
}
// A delayed, short travelling arc lives inside the primary expanding ring.
// Its heading is fixed for this click; it never tracks the pointer afterwards.
fn afterImpulse(d:vec2f,age:f32,angle:f32)->vec4f {
 let elapsed=age-background.rebound.x;
 if(elapsed<=0.0 || elapsed>=background.rebound.w){return vec4f(0);}
 let progress=elapsed/background.rebound.w;
 let ease=1.0-pow(1.0-progress,3.0);
 let axis=vec2f(cos(angle),sin(angle));
 let radius=length(d);
 // A directional compression inside the same wave, with no detached second circle.
 let facing=pow(smoothstep(-0.25,1.0,dot(d/max(radius,0.001),axis)),1.5);
 let front=background.rebound.y*ease;
 let width=0.10+progress*0.07;
 let offset=radius-front;
 let envelope=exp(-pow(offset/width,2.0));
 let life=smoothstep(0.0,0.16,progress)*(1.0-smoothstep(0.32,1.0,progress));
 let pressure=envelope*facing*life*background.rebound.z;
 let direction=d/max(radius,0.001);
 return vec4f(direction*pressure*background.detail.w,pressure,pressure*0.8);
}
// A short pressure impulse bends the moving light, never the underlying character grid.
fn impulse(p:vec2f,w:vec4f)->vec4f {
 if(w.z<0.0){return vec4f(0);}
 let age=w.z;let v=w.w;let angle=v*6.283185;
 let d=p-vec2f(w.x*background.view.x,w.y);
 let theta=atan2(d.y,d.x);
 let radius=length(d);
 // Fast response, then deceleration; the angular modulation stays coherent within one wave.
 let front=(1.12+v*0.16)*background.ambient.z*age+background.detail.z*0.3*(1.0-exp(-age*7.0));
 let flow=background.view.y*0.35;
 let warp=(sin(theta*3.0+angle+flow)*0.045+sin(theta*5.0-angle-flow*0.7)*0.022)*min(age*2.0,1.0)*background.click.w;
 let width=background.ambient.w+age*background.click.x;
 let offset=radius-front+warp;
 let envelope=exp(-pow(offset/(width*1.5),2.0));
 // A softer inner shoulder shares the primary front; avoid a stack of identical rings.
 let shoulder=exp(-pow((offset+width*2.0)/(width*2.2),2.0))*0.20*(background.detail.y/2.4);
 // The same moving field gives each arc a different strength; no per-frame randomness.
 let drift=0.5+0.5*sin(p.x*3.7+p.y*2.4+flow+angle)*cos(p.y*4.1-p.x*1.6-flow*0.6);
 let arcs=mix(1.0-background.detail.x,1.0,smoothstep(0.15,0.85,drift));
 let release=exp(-age*background.click.z)*(1.0-smoothstep(background.click.y*0.62,background.click.y,age));
 let attack=1.0-exp(-(age+0.016)*35.0);
 let pressure=(envelope-shoulder)*release*attack*arcs;
 let core=exp(-pow(radius/0.22,2.0))*exp(-age*12.0);
 let direction=d/max(radius,0.001);
 let wake=(1.0-smoothstep(front-width,front+width,radius))*exp(-max(front-radius,0.0)*background.interaction.z)*release;
 return vec4f(direction*pressure*background.detail.w,(pressure*1.15+core*0.35),wake)+afterImpulse(d,age,angle);
}
@fragment fn fs_main(i:Out)->@location(0) vec4f {
 let p=vec2f(i.uv.x*background.view.x,i.uv.y);
 let glow=exp(-dot(p-vec2f(-0.25,0.35),p-vec2f(-0.25,0.35))*1.1);
 let shadow=exp(-pow(p.x/0.55,2.0)-pow((p.y+0.61)/0.075,2.0))*0.08;
 var c=background.color.xyz*(0.96+glow*0.08-shadow);
 let mode=background.view.z;
 let t=background.view.y*3.0;
 let quietCenter=smoothstep(0.35,1.3,length(p));
 let dark=1.0-smoothstep(0.08,0.3,dot(background.color.xyz,vec3f(0.2126,0.7152,0.0722)));
 if(mode>0.5 && mode<1.5){
   let shape=field(p,t);
   c+=mix(vec3f(-0.035,-0.027,-0.02),vec3f(0.045,0.047,0.05),dark)*shape*quietCenter*background.color.w;
 }
 if(mode>1.5){
   let resolution=vec2f(background.view.w,background.view.w/background.view.x);
   let pixel=(i.uv*vec2f(0.5,-0.5)+0.5)*resolution;
   let grid=pixel/(vec2f(7,10)*background.raster.y);
   let cell=floor(grid);let local=fract(grid);
   // THIMOFEJ / ZAPKO / THIMORROW, set into a stationary personal character grid.
   let sequence=array<u32,26>(0u,1u,2u,3u,4u,5u,6u,7u,14u,8u,9u,10u,11u,4u,14u,0u,1u,2u,3u,4u,12u,12u,4u,13u,14u,15u);
   let index=sequence[(u32(cell.x)+u32(cell.y)*7u)%26u];
   let ink=textureSampleLevel(alphabet,linearSampler,vec2f((f32(index)+local.x)/17.0,local.y),0.0).r;
   let pulse=impulse(p,background.wave0)+impulse(p,background.wave1)+impulse(p,background.wave2)+impulse(p,background.wave3);
   let fieldUV=(cell+0.5)*vec2f(7,10)*background.raster.y/resolution+pulse.xy*vec2f(0.5/background.view.x,-0.5);
   let influence=clamp(pulse.w*1.8+abs(pulse.z)*0.6,0.0,1.0);
   let spread=vec2f(background.interaction.x/background.view.x,background.interaction.x)*influence;
   let original=textureSampleLevel(characterField,linearSampler,fieldUV,0.0).r;
   let softened=(textureSampleLevel(characterField,linearSampler,fieldUV+vec2f(spread.x,0),0.0).r
     +textureSampleLevel(characterField,linearSampler,fieldUV-vec2f(spread.x,0),0.0).r
     +textureSampleLevel(characterField,linearSampler,fieldUV+vec2f(0,spread.y),0.0).r
     +textureSampleLevel(characterField,linearSampler,fieldUV-vec2f(0,spread.y),0.0).r+original)*0.2;
   let shade=mix(original,softened,influence);
   // A faint continuous raster; only the travelling ambient form reveals strong ink.
   let ambient=pow(smoothstep(0.015,0.72,shade),background.raster.w)*mix(1.0-background.ambient.x,1.0,quietCenter);
   let visibility=background.raster.x+(ambient*background.raster.z*(1.0-influence*background.interaction.y)+max(pulse.z,0.0)*background.ambient.y)*(background.color.w/2.8);
   let alpha=min(0.86,visibility)*ink;
   c=mix(c,mix(vec3f(0.16,0.075,0.035),vec3f(0.88,0.90,0.94),dark),alpha);
 }
 return vec4f(c,1);
}
