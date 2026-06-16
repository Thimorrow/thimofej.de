"use client";

import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

// Post chain for the particle cloud. Deliberately no depth-of-field or chromatic
// aberration: DoF turns crisp points into mush and CA fringes the bright dots,
// which together read as "low resolution". Just bloom + a touch of grain.
export function PostFX({ low }: { low: boolean }) {
  return (
    <EffectComposer multisampling={low ? 0 : 4}>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.55}
        luminanceSmoothing={0.2}
        intensity={low ? 0.26 : 0.32}
        radius={0.4}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={0.02}
      />
      <Vignette offset={0.32} darkness={0.62} />
    </EffectComposer>
  );
}
