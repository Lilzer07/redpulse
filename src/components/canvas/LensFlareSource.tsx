"use client";

import { useMemo } from "react";
import * as THREE from "three";

function createFlareTexture(color: string, size = 256) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );

  gradient.addColorStop(0, `${color}ff`);
  gradient.addColorStop(0.15, `${color}cc`);
  gradient.addColorStop(0.4, `${color}55`);
  gradient.addColorStop(1, `${color}00`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

function FlareElement({
  texture,
  size,
  distance,
}: {
  texture: THREE.Texture | null;
  size: number;
  distance: number;
}) {
  if (!texture) return null;

  return (
    <sprite position={[distance * 0.8, distance * 0.2, 0]}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}

export default function LensFlareSource() {
  const main = useMemo(() => createFlareTexture("#eaf6ff"), []);
  const ring = useMemo(() => createFlareTexture("#ff5a1f"), []);
  const blue = useMemo(() => createFlareTexture("#d7e6ff"), []);

  return (
    <group>
      <FlareElement
        texture={main}
        size={180}
        distance={0}
      />

      <FlareElement
        texture={ring}
        size={55}
        distance={0.35}
      />

      <FlareElement
        texture={blue}
        size={30}
        distance={0.6}
      />

      <FlareElement
        texture={ring}
        size={70}
        distance={0.9}
      />
    </group>
  );
}