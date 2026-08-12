import * as THREE from "three";

export function createGlassMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: "#0a0f14",
    metalness: 0.1,
    roughness: 0.04,
    transmission: 0.88,
    thickness: 0.4,
    ior: 1.52,
    transparent: true,
    envMapIntensity: 1.4,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
  });
}

export function createCarbonMaterial() {
  return new THREE.MeshStandardMaterial({
    color: "#0c0c0e",
    roughness: 0.42,
    metalness: 0.35,
    envMapIntensity: 0.8,
  });
}

export function createBrushedMetalMaterial(color = "#c4c8ce") {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.28,
    metalness: 1,
    envMapIntensity: 1.2,
  });
}

export function createPaintMaterial(color: string) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.65,
    roughness: 0.26,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.3,
  });
}
