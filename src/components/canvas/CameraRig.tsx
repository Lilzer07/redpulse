"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ensureGsapRegistered, ScrollTrigger } from "@/lib/gsapSetup";
import { useScrollProgress, type SceneId } from "@/store/useScrollProgress";

interface Keyframe {
  t: number;
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
  scene: SceneId;
}

// The single place that choreographs scenes 2 → 11 of the brief. Car
// positions this matches: Ferrari [0,0,0], Lamborghini [4.5,0,0],
// McLaren [-4.5,0,0], Porsche [0,0,-6.5], exit door ~z=-14, road runs
// from z≈-10 to z≈-130 (see RoadEnvironment.tsx).
const KEYFRAMES: Keyframe[] = [
  { t: 0.0, position: new THREE.Vector3(0, 1.7, 9), lookAt: new THREE.Vector3(0, 0.8, 0), fov: 32, scene: "showroom-entry" },
  { t: 0.04, position: new THREE.Vector3(0, 1.5, 5.5), lookAt: new THREE.Vector3(0, 0.8, 0), fov: 34, scene: "showroom-entry" },

  { t: 0.09, position: new THREE.Vector3(3.2, 1.1, 2.6), lookAt: new THREE.Vector3(0, 0.7, 0), fov: 36, scene: "ferrari-orbit" },
  { t: 0.13, position: new THREE.Vector3(-1.4, 0.95, -1.6), lookAt: new THREE.Vector3(0.2, 0.7, -1), fov: 38, scene: "ferrari-orbit" },
  { t: 0.18, position: new THREE.Vector3(-0.3, 0.75, -0.2), lookAt: new THREE.Vector3(0, 0.85, -1.4), fov: 45, scene: "ferrari-cockpit" },

  { t: 0.23, position: new THREE.Vector3(0, 2.6, 4), lookAt: new THREE.Vector3(0, 0.8, -3), fov: 40, scene: "showroom-tour" },

  { t: 0.28, position: new THREE.Vector3(6.5, 1.3, 2.4), lookAt: new THREE.Vector3(4.5, 1.0, 0), fov: 34, scene: "lamborghini-reveal" },
  { t: 0.33, position: new THREE.Vector3(4.5, 1.0, 3.4), lookAt: new THREE.Vector3(4.5, 0.8, 0), fov: 34, scene: "lamborghini-reveal" },
  { t: 0.38, position: new THREE.Vector3(4.5, 0.3, -2.3), lookAt: new THREE.Vector3(4.5, 0.05, 0), fov: 42, scene: "lamborghini-underside" },

  { t: 0.44, position: new THREE.Vector3(-6.5, 1.1, 2.2), lookAt: new THREE.Vector3(-4.5, 0.8, 0), fov: 34, scene: "mclaren-reveal" },
  { t: 0.49, position: new THREE.Vector3(-4.5, 0.85, 3.0), lookAt: new THREE.Vector3(-4.5, 0.7, 3.4), fov: 26, scene: "mclaren-hood" },

  { t: 0.55, position: new THREE.Vector3(1.5, 1.1, -4.8), lookAt: new THREE.Vector3(0, 0.8, -6.5), fov: 34, scene: "porsche-reveal" },
  { t: 0.6, position: new THREE.Vector3(0, 0.7, -9.0), lookAt: new THREE.Vector3(0, 0.85, -7.1), fov: 22, scene: "porsche-rear" },

  { t: 0.66, position: new THREE.Vector3(0, 1.6, -14), lookAt: new THREE.Vector3(0, 0.9, -18), fov: 34, scene: "showroom-exit" },

  { t: 0.72, position: new THREE.Vector3(3, 1.6, -30), lookAt: new THREE.Vector3(0, 1, -45), fov: 36, scene: "road-drive" },
  { t: 0.8, position: new THREE.Vector3(-3, 2.2, -70), lookAt: new THREE.Vector3(0, 1, -85), fov: 38, scene: "road-drive" },
  { t: 0.87, position: new THREE.Vector3(0, 4, -40), lookAt: new THREE.Vector3(0, 1, -60), fov: 40, scene: "road-drive" },

  { t: 0.94, position: new THREE.Vector3(0, 2.4, 11), lookAt: new THREE.Vector3(0, 0.9, 0), fov: 30, scene: "services" },
  { t: 1.0, position: new THREE.Vector3(0, 2.8, 13), lookAt: new THREE.Vector3(0, 0.7, 0), fov: 28, scene: "services" },
];

export default function CameraRig({ trackId }: { trackId: string }) {
  const { camera } = useThree();
  const setProgress = useScrollProgress((s) => s.setProgress);
  const setScene = useScrollProgress((s) => s.setScene);
  const targetProgress = useRef(0);
  const smoothedProgress = useRef(0);

  const positionCurve = useMemo(
    () => new THREE.CatmullRomCurve3(KEYFRAMES.map((k) => k.position)),
    []
  );
  const lookAtCurve = useMemo(
    () => new THREE.CatmullRomCurve3(KEYFRAMES.map((k) => k.lookAt)),
    []
  );

  useEffect(() => {
    ensureGsapRegistered();
    const trigger = ScrollTrigger.create({
      trigger: `#${trackId}`,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        targetProgress.current = self.progress;
        setProgress(self.progress);
        const idx = Math.min(
          KEYFRAMES.length - 1,
          Math.floor(self.progress * (KEYFRAMES.length - 1))
        );
        setScene(KEYFRAMES[idx].scene);
      },
    });
    return () => trigger.kill();
  }, [trackId, setProgress, setScene]);

  useFrame((_, delta) => {
    smoothedProgress.current +=
      (targetProgress.current - smoothedProgress.current) *
      Math.min(1, delta * 4);

    const t = THREE.MathUtils.clamp(smoothedProgress.current, 0, 1);
    const pos = positionCurve.getPointAt(t);
    const look = lookAtCurve.getPointAt(t);

    camera.position.copy(pos);
    camera.lookAt(look);

    const fov = KEYFRAMES[Math.floor(t * (KEYFRAMES.length - 1))]?.fov ?? 35;
    if ("fov" in camera) {
      (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(
        (camera as THREE.PerspectiveCamera).fov,
        fov,
        0.05
      );
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
  });

  return null;
}
