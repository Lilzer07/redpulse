"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { laneFragmentShader, laneVertexShader } from "@/shaders/shaders";
import { useScrollProgress } from "@/store/useScrollProgress";

function LaneMarkings() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uSpeed: { value: 1.2 } }),
    []
  );

  useFrame((_, delta) => {
    const sceneId = useScrollProgress.getState().sceneId;
    const speed = sceneId === "road-drive" ? 4.5 : 1.2;
    if (matRef.current) {
      uniforms.uTime.value += delta * speed;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -60]}>
      <planeGeometry args={[10, 140]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={laneVertexShader}
        fragmentShader={laneFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

/** Bright horizontal streaks drifting past — combined with the
 * ChromaticAberration boost in Effects.tsx during "road-drive", this reads
 * as motion blur without a real per-pixel velocity buffer. */
function SpeedStreaks({ count = 40 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 16,
        y: 0.5 + Math.random() * 3,
        z: -Math.random() * 120,
        speed: 8 + Math.random() * 10,
      })),
    [count]
  );

  useFrame((_, delta) => {
    const sceneId = useScrollProgress.getState().sceneId;
    const active = sceneId === "road-drive";
    if (!ref.current) return;
    seeds.forEach((s, i) => {
      if (active) {
        s.z += delta * s.speed;
        if (s.z > 10) s.z = -120;
      }
      dummy.position.set(s.x, s.y, s.z);
      dummy.scale.set(0.03, 0.03, active ? 3.5 : 0);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#d7e6ff" transparent opacity={0.5} toneMapped={false} />
    </instancedMesh>
  );
}

export default function RoadEnvironment() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -60]} receiveShadow>
        <planeGeometry args={[24, 160]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.65} metalness={0.15} />
      </mesh>

      <LaneMarkings />
      <SpeedStreaks />

      <ambientLight intensity={0.15} />
      <pointLight position={[0, 5, -20]} intensity={12} color="#d7e6ff" distance={40} />
    </group>
  );
}
