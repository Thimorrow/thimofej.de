/** Subpixel marching squares keep curved letter edges smooth under grazing light. */
export function glyphEdges(pixels: Uint8ClampedArray, width: number, height: number): Float32Array<ArrayBuffer> {
  const vertices: number[]=[];
  const sample=(x:number,y:number)=>x<0 || y<0 || x>=width || y>=height ? 0 : pixels[(y*width+x)*4]/255;
  const field=(x:number,y:number)=>{
    const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
    return (sample(ix,iy)*(1-fx)+sample(ix+1,iy)*fx)*(1-fy)+(sample(ix,iy+1)*(1-fx)+sample(ix+1,iy+1)*fx)*fy;
  };
  const point=(x:number,y:number)=>{
    const nx=field(x-2,y)-field(x+2,y),ny=field(x,y-2)-field(x,y+2);
    return [(x+0.5)/width,(y+0.5)/height,Math.atan2(ny,nx)] as const;
  };
  for(let y=-1;y<height;y++) for(let x=-1;x<width;x++){
    const tl=sample(x,y),tr=sample(x+1,y),br=sample(x+1,y+1),bl=sample(x,y+1);
    const code=(tl>=0.5 ? 1 : 0)|(tr>=0.5 ? 2 : 0)|(br>=0.5 ? 4 : 0)|(bl>=0.5 ? 8 : 0);
    if(code===0 || code===15) continue;
    const corners=[[x,y],[x+1,y],[x+1,y+1],[x,y+1]] as const;
    const values=[tl,tr,br,bl];
    const crossings: (readonly [number,number,number])[]=[];
    for(let i=0;i<4;i++){
      const j=(i+1)%4;
      if((values[i]>=0.5)===(values[j]>=0.5)) continue;
      const t=(0.5-values[i])/(values[j]-values[i]);
      crossings.push(point(corners[i][0]+t*(corners[j][0]-corners[i][0]),corners[i][1]+t*(corners[j][1]-corners[i][1])));
    }
    // Ambiguous diagonal cells split into two short contours rather than a crossing wall.
    for(let i=0;i+1<crossings.length;i+=2){
      const a=crossings[i],b=crossings[i+1];
      for(const [p,z] of [[a,-1],[b,-1],[a,1],[a,1],[b,-1],[b,1]] as const) vertices.push(p[0],p[1],z,p[2]);
    }
  }
  return new Float32Array(vertices);
}
