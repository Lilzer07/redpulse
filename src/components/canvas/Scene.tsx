"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, ContactShadows, PerformanceMonitor } from "@react-three/drei";
import ProceduralCar from "./ProceduralCar";
import ShowroomEnvironment from "./ShowroomEnvironment";
import RoadEnvironment from "./RoadEnvironment";
import FogController from "./FogController";
import CameraRig from "./CameraRig";
import LensFlareSource from "./LensFlareSource";
import Effects from "./Effects";
import { useConfigurator } from "@/store/useConfigurator";

export default function Scene() {
  const { paint, activeCar, caliperColor, rimStyle } = useConfigurator();

  const colorFor = (car: typeof activeCar, fallback: string) =>
    activeCar === car ? paint : fallback;

  const caliperFor = (car: typeof activeCar) =>
    activeCar === car ? caliperColor : "#ff5a1f";

  const rimFor = (car: typeof activeCar) => {
    if (activeCar !== car) return "#c4c8ce";
    if (rimStyle === "carbon") return "#1a1a1c";
    if (rimStyle === "chrome") return "#eef0f2";
    return "#c4c8ce"; // forge
  };

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 1.7, 9], fov: 32, near: 0.1, far: 200 }}
    >
      <color attach="background" args={["#08090b"]} />

      <PerformanceMonitor>
        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />

        <Suspense fallback={null}>
          <ShowroomEnvironment />
          <RoadEnvironment />
          <LensFlareSource />

          <ProceduralCar
            carKey="ferrari"
            position={[0, 0, 0]}
            rotationY={Math.PI}
            paintColor={colorFor("ferrari", "#a10f1f")}
            caliperColor={caliperFor("ferrari")}
            rimColor={rimFor("ferrari")}
          />
          <ContactShadows position={[0, 0.01, 0]} opacity={0.55} scale={7} blur={2.2} far={2} />

          <ProceduralCar
            carKey="lamborghini"
            position={[4.5, 0, 0]}
            rotationY={Math.PI * 1.15}
            paintColor={colorFor("lamborghini", "#e8b100")}
            caliperColor={caliperFor("lamborghini")}
            rimColor={rimFor("lamborghini")}
          />
          <ContactShadows position={[4.5, 0.01, 0]} opacity={0.55} scale={7} blur={2.2} far={2} />

          <ProceduralCar
            carKey="mclaren"
            position={[-4.5, 0, 0]}
            rotationY={Math.PI * 0.9}
            paintColor={colorFor("mclaren", "#ff5a1f")}
            caliperColor={caliperFor("mclaren")}
            rimColor={rimFor("mclaren")}
          />
          <ContactShadows position={[-4.5, 0.01, 0]} opacity={0.55} scale={7} blur={2.2} far={2} />

          <ProceduralCar
            carKey="porsche"
            position={[0, 0, -6.5]}
            rotationY={Math.PI}
            paintColor={colorFor("porsche", "#0c0c0e")}
            caliperColor={caliperFor("porsche")}
            rimColor={rimFor("porsche")}
          />
          <ContactShadows position={[0, 0.01, -6.5]} opacity={0.55} scale={7} blur={2.2} far={2} />
        </Suspense>

        <FogController />
        <CameraRig trackId="showroom-track" />
        <Effects />
      </PerformanceMonitor>
    </Canvas>
  );
}
