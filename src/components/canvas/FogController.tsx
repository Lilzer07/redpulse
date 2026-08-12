"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useScrollProgress } from "@/store/useScrollProgress";

const SHOWROOM_FOG = { color: new THREE.Color("#08090b"), near: 9, far: 28 };
const ROAD_FOG = { color: new THREE.Color("#05060a"), near: 6, far: 55 };

const ROAD_SCENES = new Set(["showroom-exit", "road-drive"]);

export default function FogController() {
  const { scene } = useThree();
  const tmpColor = useRef(new THREE.Color());

  useFrame((_, delta) => {
    const fog = scene.fog as THREE.FogExp2 | THREE.Fog | null;
    if (!fog || !("near" in fog)) return;
    const target = ROAD_SCENES.has(useScrollProgress.getState().sceneId)
      ? ROAD_FOG
      : SHOWROOM_FOG;

    const f = fog as THREE.Fog;
    f.near = THREE.MathUtils.damp(f.near, target.near, 2, delta);
    f.far = THREE.MathUtils.damp(f.far, target.far, 2, delta);
    tmpColor.current.copy(f.color).lerp(target.color, 1 - Math.pow(0.001, delta));
    f.color.copy(tmpColor.current);
  });

  return null;
}
