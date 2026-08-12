export const sweepVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const sweepFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uSpeed;
  uniform float uWidth;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    float diag = (vWorldPos.x + vWorldPos.z) * 0.15;
    float band = fract(diag - uTime * uSpeed);
    float glow = smoothstep(0.0, uWidth, band) * smoothstep(uWidth * 2.0, uWidth, band);
    float edgeFade = 1.0 - smoothstep(0.35, 0.5, length(vUv - 0.5));
    float alpha = glow * edgeFade * 0.6;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export const fresnelVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fresnelFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), uPower);
    gl_FragColor = vec4(uColor * fresnel * uIntensity, fresnel);
  }
`;

/** Road lane-marker shader — a fast-scrolling dashed stripe, used in the
 * Scene 11 driving sequence to sell speed without a real road texture. */
export const laneVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const laneFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  varying vec2 vUv;

  void main() {
    float dash = step(0.5, fract((vUv.y * 14.0) - uTime * uSpeed));
    float laneMask = smoothstep(0.46, 0.5, vUv.x) * (1.0 - smoothstep(0.5, 0.54, vUv.x));
    gl_FragColor = vec4(vec3(0.92), dash * laneMask * 0.9);
  }
`;
