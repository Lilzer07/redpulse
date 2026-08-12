"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { CarKey } from "@/store/useConfigurator";
import { useScrollProgress, type SceneId } from "@/store/useScrollProgress";

/** Builds a tapered wedge body by displacing a box's vertices. */
function buildWedgeGeometry(width: number, height: number, length: number) {
  const geo = new THREE.BoxGeometry(width, height, length, 4, 2, 8);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const t = Math.abs(z) / (length / 2);
    const taper = 1 - t * 0.35;
    pos.setX(i, x * taper);
    if (z > length * 0.35) pos.setY(i, y * 0.55);
    if (z < -length * 0.42) pos.setY(i, y * 1.1);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

interface CarProfile {
  length: number;
  width: number;
  defaultColor: string;
  doorType: "none" | "scissor";
  hoodOpens: boolean;
  wingDeploys: boolean;
  /** which scene ids trigger this car's special animation (0..1 local progress computed from scene match) */
  activeScenes: SceneId[];
}

const PROFILES: Record<CarKey, CarProfile> = {
  ferrari: {
    length: 4.3,
    width: 1.9,
    defaultColor: "#a10f1f",
    doorType: "none",
    hoodOpens: false,
    wingDeploys: false,
    activeScenes: ["ferrari-orbit", "ferrari-cockpit"],
  },
  lamborghini: {
    length: 4.6,
    width: 2.02,
    defaultColor: "#e8b100",
    doorType: "scissor",
    hoodOpens: false,
    wingDeploys: false,
    activeScenes: ["lamborghini-reveal", "lamborghini-underside"],
  },
  mclaren: {
    length: 4.5,
    width: 1.95,
    defaultColor: "#ff5a1f",
    doorType: "none",
    hoodOpens: true,
    wingDeploys: false,
    activeScenes: ["mclaren-reveal", "mclaren-hood"],
  },
  porsche: {
    length: 4.1,
    width: 1.85,
    defaultColor: "#0c0c0e",
    doorType: "none",
    hoodOpens: false,
    wingDeploys: true,
    activeScenes: ["porsche-reveal", "porsche-rear"],
  },
};

interface ProceduralCarProps {
  carKey: CarKey;
  position: [number, number, number];
  rotationY?: number;
  paintColor?: string;
  caliperColor?: string;
  rimColor?: string;
}

export default function ProceduralCar({
  carKey,
  position,
  rotationY = 0,
  paintColor,
  caliperColor = "#ff5a1f",
  rimColor = "#c4c8ce",
}: ProceduralCarProps) {
  const profile = PROFILES[carKey];
  const color = paintColor ?? profile.defaultColor;

  const bodyGeo = useMemo(
    () => buildWedgeGeometry(profile.width, 0.5, profile.length),
    [profile.width, profile.length]
  );
  const cabinGeo = useMemo(
    () => buildWedgeGeometry(profile.width * 0.78, 0.5, profile.length * 0.44),
    [profile.width, profile.length]
  );

  const wheelsRef = useRef<THREE.Group[]>([]);
  const doorLRef = useRef<THREE.Group>(null);
  const doorRRef = useRef<THREE.Group>(null);
  const hoodRef = useRef<THREE.Group>(null);
  const wingRef = useRef<THREE.Group>(null);
  const headlightMatL = useRef<THREE.MeshStandardMaterial>(null);
  const headlightMatR = useRef<THREE.MeshStandardMaterial>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);

  const wheelPositions: [number, number, number][] = [
    [-profile.width * 0.5, 0.4, profile.length * 0.31],
    [profile.width * 0.5, 0.4, profile.length * 0.31],
    [-profile.width * 0.5, 0.4, -profile.length * 0.31],
    [profile.width * 0.5, 0.4, -profile.length * 0.31],
  ];

  useFrame((_, delta) => {
    const { sceneId } = useScrollProgress.getState();

    // Wheels always turn gently, faster once this car's own scene is active.
    const isActiveScene = profile.activeScenes.includes(sceneId);
    wheelsRef.current.forEach((w) => {
      if (w) w.rotation.x -= delta * (isActiveScene ? 1.6 : 0.3);
    });

    // Local 0..1 easing while this car's scene(s) are on screen — drives
    // doors / hood / wing / headlights without needing a GSAP timeline per
    // car (the global scroll progress + scene id from CameraRig is enough).
    const localT = isActiveScene ? 1 : 0;

    if (profile.doorType === "scissor") {
      const targetAngle = localT * -1.05; // ~60°, scissor-lift outward/up
      if (doorLRef.current)
        doorLRef.current.rotation.z = THREE.MathUtils.damp(
          doorLRef.current.rotation.z,
          targetAngle,
          3.5,
          delta
        );
      if (doorRRef.current)
        doorRRef.current.rotation.z = THREE.MathUtils.damp(
          doorRRef.current.rotation.z,
          -targetAngle,
          3.5,
          delta
        );
    }

    if (profile.hoodOpens && hoodRef.current) {
      const target = sceneId === "mclaren-hood" ? -1.3 : 0;
      hoodRef.current.rotation.x = THREE.MathUtils.damp(
        hoodRef.current.rotation.x,
        target,
        3.5,
        delta
      );
      if (engineGlowRef.current) {
        engineGlowRef.current.intensity = THREE.MathUtils.damp(
          engineGlowRef.current.intensity,
          sceneId === "mclaren-hood" ? 4 : 0,
          3,
          delta
        );
      }
    }

    if (profile.wingDeploys && wingRef.current) {
      const target = sceneId === "porsche-rear" ? 0.35 : 0;
      wingRef.current.position.y = THREE.MathUtils.damp(
        wingRef.current.position.y,
        target,
        3.5,
        delta
      );
    }

    const headlightTarget =
      carKey === "ferrari" && (sceneId === "ferrari-orbit" || sceneId === "ferrari-cockpit")
        ? 0.9
        : sceneId === "porsche-rear"
        ? 0
        : 0.15;
    if (headlightMatL.current)
      headlightMatL.current.emissiveIntensity = THREE.MathUtils.damp(
        headlightMatL.current.emissiveIntensity,
        headlightTarget,
        3,
        delta
      );
    if (headlightMatR.current)
      headlightMatR.current.emissiveIntensity = THREE.MathUtils.damp(
        headlightMatR.current.emissiveIntensity,
        headlightTarget,
        3,
        delta
      );
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* body */}
      <mesh geometry={bodyGeo} position={[0, 0.42, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={color}
          metalness={0.62}
          roughness={0.27}
          clearcoat={1}
          clearcoatRoughness={0.07}
        />
      </mesh>

      {/* cabin / windshield */}
      <mesh geometry={cabinGeo} position={[0, 0.95, -0.15]} castShadow>
        <meshPhysicalMaterial
          color="#0a0f14"
          metalness={0.1}
          roughness={0.05}
          transmission={0.85}
          thickness={0.4}
          transparent
        />
      </mesh>

      {/* doors (scissor for Lamborghini; static side panels otherwise) */}
      <group ref={doorLRef} position={[-profile.width * 0.5, 0.75, -0.1]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 0.42, profile.length * 0.34]} />
          <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.28} clearcoat={1} />
        </mesh>
      </group>
      <group ref={doorRRef} position={[profile.width * 0.5, 0.75, -0.1]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.04, 0.42, profile.length * 0.34]} />
          <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.28} clearcoat={1} />
        </mesh>
      </group>

      {/* hood (McLaren opens to reveal the engine) */}
      <group ref={hoodRef} position={[0, 0.66, profile.length * 0.32]}>
        <mesh position={[0, 0, profile.length * 0.1]} castShadow>
          <boxGeometry args={[profile.width * 0.86, 0.05, profile.length * 0.22]} />
          <meshPhysicalMaterial color={color} metalness={0.6} roughness={0.28} clearcoat={1} />
        </mesh>
        {/* faux engine block, only meaningfully visible once the hood opens */}
        <mesh position={[0, -0.12, profile.length * 0.14]}>
          <boxGeometry args={[profile.width * 0.55, 0.22, profile.length * 0.16]} />
          <meshStandardMaterial color="#26272b" roughness={0.4} metalness={0.7} />
        </mesh>
        <pointLight
          ref={engineGlowRef}
          position={[0, 0, profile.length * 0.14]}
          color="#ff5a1f"
          intensity={0}
          distance={1.6}
        />
      </group>

      {/* rear wing (Porsche deploys upward) */}
      <group ref={wingRef} position={[0, 0.7, -profile.length * 0.46]}>
        <mesh castShadow>
          <boxGeometry args={[profile.width * 0.85, 0.05, 0.42]} />
          <meshStandardMaterial color="#121214" roughness={0.35} metalness={0.4} />
        </mesh>
        <mesh position={[-profile.width * 0.32, -0.2, 0]}>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#121214" />
        </mesh>
        <mesh position={[profile.width * 0.32, -0.2, 0]}>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#121214" />
        </mesh>
      </group>

      {/* headlights */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * profile.width * 0.34, 0.5, profile.length * 0.49]}
        >
          <boxGeometry args={[0.32, 0.08, 0.06]} />
          <meshStandardMaterial
            ref={side === -1 ? headlightMatL : headlightMatR}
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}

      {/* taillights */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * profile.width * 0.28, 0.55, -profile.length * 0.49]}
        >
          <boxGeometry args={[0.4, 0.07, 0.05]} />
          <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* wheels + calipers */}
      {wheelPositions.map((p, i) => (
        <group
          key={i}
          position={p}
          ref={(el) => {
            if (el) wheelsRef.current[i] = el;
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.38, 0.38, 0.28, 24]} />
            <meshStandardMaterial color="#121214" roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.29, 6]} />
            <meshStandardMaterial color={rimColor} roughness={0.15} metalness={1} />
          </mesh>
          <mesh position={[0.16, 0, 0]}>
            <boxGeometry args={[0.05, 0.16, 0.16]} />
            <meshStandardMaterial
              color={caliperColor}
              emissive={caliperColor}
              emissiveIntensity={0.4}
              roughness={0.3}
              metalness={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
