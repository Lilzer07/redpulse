"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, Environment } from "@react-three/drei";
import { sweepFragmentShader, sweepVertexShader } from "@/shaders/shaders";
import { useScrollProgress } from "@/store/useScrollProgress";

function LightSweepOverlay() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#ff5a1f") },
      uSpeed: { value: 0.12 },
      uWidth: { value: 0.06 },
    }),
    []
  );

  useFrame((_, delta) => {
    if (matRef.current) uniforms.uTime.value += delta;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
      <planeGeometry args={[34, 34]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={sweepVertexShader}
        fragmentShader={sweepFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function DustParticles({ count = 240 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 1] = Math.random() * 4.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    const geo = pointsRef.current?.geometry;
    if (!geo) return;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * 0.06;
      if (arr[i * 3 + 1] > 4.5) arr[i * 3 + 1] = 0;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ff5a1f" size={0.012} transparent opacity={0.45} />
    </points>
  );
}

/** Orange-lit smoke near the Lamborghini, only visible during its reveal
 * scene (brief: "Éclairage orange. Fumée."). */
function LamborghiniSmoke({ position }: { position: [number, number, number] }) {
  const count = 90;
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const velocities = useRef<Float32Array>(new Float32Array(count));

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = position[0] + (Math.random() - 0.5) * 2.5;
      arr[i * 3 + 1] = Math.random() * 0.6;
      arr[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 2.5;
      velocities.current[i] = 0.15 + Math.random() * 0.25;
    }
    return arr;
  }, [position]);

  useFrame((_, delta) => {
    const sceneId = useScrollProgress.getState().sceneId;
    const active = sceneId === "lamborghini-reveal";

    if (matRef.current) {
      matRef.current.opacity = THREE.MathUtils.damp(
        matRef.current.opacity,
        active ? 0.35 : 0,
        4,
        delta
      );
    }

    const geo = pointsRef.current?.geometry;
    if (!geo || !active) return;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += delta * velocities.current[i];
      if (arr[i * 3 + 1] > 1.8) {
        arr[i * 3 + 1] = 0;
        arr[i * 3] = position[0] + (Math.random() - 0.5) * 2.5;
        arr[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 2.5;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color="#ff8a4c"
        size={0.16}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ShowroomEnvironment() {
  return (
    <group>
      <Environment preset="warehouse" environmentIntensity={0.7} />

      <hemisphereLight args={["#c9d9ff", "#0a0a0c", 0.42]} />

      <spotLight
        position={[-4, 6, 2]}
        angle={0.5}
        penumbra={0.4}
        intensity={55}
        color="#d7e6ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight position={[4, 6, -2]} angle={0.5} penumbra={0.4} intensity={45} color="#d7e6ff" />
      <pointLight position={[4.5, 1.2, -2]} intensity={22} color="#ff5a1f" distance={10} />
      <pointLight position={[2, 1, 4]} intensity={6} color="#ffffff" distance={10} />

      {/* Mirror floor — the production-reliable stand-in for SSR, reads as
          "sol miroir" from every showroom reference angle. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={45}
          roughness={0.15}
          depthScale={1}
          minDepthThreshold={0.85}
          color="#0b0b0e"
          metalness={0.6}
        />
      </mesh>

      <LightSweepOverlay />
      <DustParticles />
      <LamborghiniSmoke position={[4.5, 0, 0]} />

      <fog attach="fog" args={["#08090b", 9, 28]} />
    </group>
  );
}
