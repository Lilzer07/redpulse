"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useScrollProgress } from "@/store/useScrollProgress";

const CLOSE_UP_SCENES = new Set([
  "ferrari-cockpit",
  "lamborghini-underside",
  "mclaren-hood",
  "porsche-rear",
]);

export default function Effects() {
  const caRef = useRef<any>(null);
  const dofRef = useRef<any>(null);

  // Both DOF focus and the chromatic-aberration "motion blur" stand-in are
  // driven every frame from the scene id rather than React state, so
  // scrubbing the scrollbar never causes a re-render of the whole stack.
  useFrame((_, delta) => {
    const sceneId = useScrollProgress.getState().sceneId;

    const targetFocus = CLOSE_UP_SCENES.has(sceneId) ? 0.015 : 0.05;
    if (dofRef.current) {
      dofRef.current.circleOfConfusionMaterial.uniforms.focusDistance.value =
        THREE.MathUtils.damp(
          dofRef.current.circleOfConfusionMaterial.uniforms.focusDistance
            .value,
          targetFocus,
          3,
          delta
        );
    }

    const targetOffset = sceneId === "road-drive" ? 0.004 : 0.0006;
    if (caRef.current) {
      const off = caRef.current.offset as THREE.Vector2;
      off.x = THREE.MathUtils.damp(off.x, targetOffset, 3, delta);
      off.y = off.x;
    }
  });

  return (
    <EffectComposer multisampling={4}>
      <DepthOfField
        ref={dofRef}
        focusDistance={0.05}
        focalLength={0.02}
        bokehScale={3}
        height={480}
      />
      <Bloom intensity={0.7} luminanceThreshold={0.22} luminanceSmoothing={0.9} mipmapBlur />
      <ChromaticAberration
  ref={caRef}
  offset={new THREE.Vector2(0.0006, 0.0006)}
  radialModulation={false}
  modulationOffset={0.15}
/>
  
        
      <Vignette eskil={false} offset={0.15} darkness={0.9} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.04} />
    </EffectComposer>
  );
}
