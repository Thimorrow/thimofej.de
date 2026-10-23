struct Field { view:vec4f, shape:vec4f };
@group(0) @binding(0) var<uniform> field:Field;
struct Out { @builtin(position) position:vec4f,@location(0) uv:vec2f };
@vertex fn vs_main(@builtin(vertex_index) vi:u32)->Out{
 let a=array<vec2f,3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3));var o:Out;o.position=vec4f(a[vi],0,1);o.uv=a[vi];return o;
}
// Slowly advected folds of light. The glyph raster is stationary in the next pass.
@fragment fn fs_main(i:Out)->@location(0) vec4f{
 let t=field.view.y*0.14;
 let p=vec2f(i.uv.x*field.view.x,i.uv.y)/field.shape.x;
 let drift=vec2f(t*0.18,-t*0.09);
 let q=p+drift;
 let warp=sin(q.y*1.45-t*0.22)*0.62+sin(q.y*2.3+q.x*0.45+t*0.15)*0.18;
 let phase=q.x*1.55+q.y*0.42+warp;
 let width=field.shape.y*0.8;
 let fold=exp(-pow(sin(phase)/width,2.0));
 let crossing=exp(-pow(sin(q.y*1.3-q.x*0.55+sin(q.x*0.85+t*0.2)*0.55+1.8)/(width*0.85),2.0));
 let blend=clamp(field.shape.z/1.5,0.0,1.0);
 let light=fold*0.58+crossing*(0.08+blend*0.18);
 let breathing=0.78+0.12*sin(q.y*0.7+q.x*0.4-t*0.12);
 return vec4f(clamp(light*breathing,0.0,1.0),0,0,1);
}
