"use client";

/**
 * AyraOrb — a WebGL particle orb for the maggie hero.
 *
 * A single GLSL-shaded BufferGeometry point cloud (thousands of particles, no
 * per-particle meshes) that lives in two states and fluidly interpolates
 * between them:
 *
 *   • IDLE      — a loose, asymmetric wisp/blob with a thin comet-like tail,
 *                 densest at the core, scattering thin at the edges, in constant
 *                 noise-driven motion (every particle wanders uniquely) while the
 *                 whole form drifts and rotates very gently.
 *   • CONVERGED — every particle gathers into a tightly-packed lat/long-gridded
 *                 sphere shell whose regular angular grid creates the fine
 *                 woven/moiré interference (plus a slow surface shimmer so it is
 *                 never frozen). Subtle low-frequency lumps keep the silhouette
 *                 organic rather than perfectly geometric.
 *
 * The two states are blended per-frame by an eased `uConverge` uniform (0→1 over
 * ~780ms, ease-in-out). For this pass the transition is driven by a press-hold on
 * a circular hit-area (stand-in for the eventual push-to-talk button) — the
 * particle system is intentionally decoupled from the trigger so voice logic can
 * be wired in next without touching any of this.
 *
 * Framer-Motion handles only the DOM layer (floating example prompts + the
 * converged label). Respects prefers-reduced-motion (static cloud, instant swap)
 * and scales particle count down on mobile / low-end devices.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Canvas, useFrame, useThree, extend, type ThreeElement } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import * as THREE from "three";

/* ────────────────────────────────────────────────────────────────────────── */
/* Tunables                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

const BONE = new THREE.Color("#F2EEE3");
const SPHERE_R = 1.12; // converged sphere radius (world units)
const CONVERGE_MS = 780; // idle ↔ converged transition duration
const DESKTOP_BREAKPOINT = 1024;

const EXAMPLE_PROMPTS = [
  "i need a logo for my business",
  "help me build an app",
  "want to grow on social media",
  "thinking about a website redesign",
  "need an ai chatbot for my site",
];

/* ────────────────────────────────────────────────────────────────────────── */
/* Device capability → particle count                                           */
/* ────────────────────────────────────────────────────────────────────────── */

function pickParticleCount(): number {
  if (typeof window === "undefined") return 12000;
  const w = window.innerWidth;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const mem = nav.deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mobile =
    w < 768 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (mobile || mem <= 4 || cores <= 4) return 9000; // mobile / low-end floor
  if (w < DESKTOP_BREAKPOINT) return 18000;
  if (w < 1280 || mem <= 6 || cores <= 6) return 23000;
  if (mem >= 8 && cores >= 8) return 38000;
  return 30000;
}

type OrbViewportProfile = {
  canvasHeight: string;
  canvasWidth: string;
  idleWildness: number;
  pointSize: number;
  radius: number;
  glow: number; // overall opacity multiplier — keeps the dense desktop cloud dark
};

const MOBILE_ORB_PROFILE: OrbViewportProfile = {
  canvasHeight: "min(58vh, 460px)",
  canvasWidth: "min(94vw, 720px)",
  idleWildness: 0.48,
  pointSize: 7.6,
  radius: 150,
  glow: 1,
};

const DESKTOP_ORB_PROFILE: OrbViewportProfile = {
  canvasHeight: "min(72vh, 640px)",
  canvasWidth: "min(96vw, 980px)",
  idleWildness: 1,
  pointSize: 8.15,
  radius: 196,
  // Many more particles on desktop, so dim the accumulated additive glow to
  // keep the field dark with a bright core rather than washing out to grey.
  glow: 0.72,
};

function pickOrbViewportProfile(): OrbViewportProfile {
  if (typeof window === "undefined") return MOBILE_ORB_PROFILE;
  return window.innerWidth >= DESKTOP_BREAKPOINT
    ? DESKTOP_ORB_PROFILE
    : MOBILE_ORB_PROFILE;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Geometry — idle wisp positions + converged sphere targets + per-particle rng */
/* ────────────────────────────────────────────────────────────────────────── */

// Box–Muller normal sample (mean 0, std 1).
function gauss(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function buildAttributes(count: number) {
  const idle = new Float32Array(count * 3); // IDLE position (also `position`)
  const sphere = new Float32Array(count * 3); // CONVERGED target
  const rnd = new Float32Array(count * 3); // x: phase/jitter, y: sizeVar, z: brightVar
  const shade = new Float32Array(count * 3); // x: idleDensity, y: shellBoost, z: weaveSeed
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  // Ordered sphere points use a Fibonacci spiral; the slight jitter below keeps
  // the woven pattern organic without turning it into random grey noise.

  // Comet tail direction (asymmetric flick off one side of the idle blob).
  const tailDir = new THREE.Vector3(1, 0.42, -0.18).normalize();
  const crossA = new THREE.Vector3(-tailDir.y, tailDir.x, 0).normalize();
  const crossB = new THREE.Vector3().crossVectors(tailDir, crossA).normalize();
  const organic = count >= 10000 ? 1 : 0.62;
  const ambientChance = count >= 10000 ? 0.06 : 0.022;
  const tailCutoff = 1 - ambientChance;

  for (let i = 0; i < count; i++) {
    const o = i * 3;

    /* ── IDLE: dense gaussian core + a thin, thinning tail ──────────────── */
    const r = Math.random();
    let idleDensity = 0.45;
    if (r < 0.62) {
      const pocket = Math.random() < 0.22 * organic ? Math.random() : 0;
      const pocketX = pocket ? Math.cos(pocket * Math.PI * 2.0) * 0.22 * organic : 0;
      const pocketY = pocket ? Math.sin(pocket * Math.PI * 1.6) * 0.16 * organic : 0;
      const x = gauss() * (0.4 + organic * 0.04) + 0.08 + pocketX;
      const y = gauss() * (0.35 + organic * 0.04) + pocketY;
      const z = gauss() * (0.37 + organic * 0.04);
      idle[o] = x;
      idle[o + 1] = y;
      idle[o + 2] = z;
      const coreDist = Math.sqrt(x * x * 1.35 + y * y * 1.6 + z * z * 1.45);
      idleDensity = THREE.MathUtils.clamp(1.22 - coreDist * 0.58, 0.56, 1.18);
    } else if (r < 0.84) {
      // Core: anisotropic blob, densest at centre, scattering thin at edges.
      const x = gauss() * (0.82 + organic * 0.08) + 0.13;
      const y = gauss() * (0.6 + organic * 0.08);
      const z = gauss() * (0.64 + organic * 0.08);
      idle[o] = x;
      idle[o + 1] = y;
      idle[o + 2] = z;
      const haloDist = Math.sqrt(x * x * 0.75 + y * y + z * z);
      idleDensity = THREE.MathUtils.clamp(0.78 - haloDist * 0.16, 0.34, 0.72);
    } else if (r < tailCutoff) {
      const t = Math.pow(Math.random(), 1.42);
      const along = 0.32 + t * (2.18 + organic * 0.38);
      const spread = (1 - t) * (0.2 + organic * 0.06) + 0.018;
      const swirl =
        Math.sin(t * Math.PI * 2.55 + i * 0.027) *
        (0.08 + organic * 0.06) *
        (1 - t);
      const sideA = gauss() * spread + swirl;
      const sideB = gauss() * spread * (0.78 + organic * 0.12);
      idle[o] = tailDir.x * along + crossA.x * sideA + crossB.x * sideB;
      idle[o + 1] =
        tailDir.y * along + crossA.y * sideA + crossB.y * sideB;
      idle[o + 2] =
        tailDir.z * along + crossA.z * sideA + crossB.z * sideB;
      idleDensity = THREE.MathUtils.clamp(0.66 - t * 0.42, 0.16, 0.52);
    } else {
      // Sparse ambient specks: mostly desktop, lightly scattered around the
      // main wisp so the hero feels wider without becoming noisy.
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.2 + Math.pow(Math.random(), 0.38) * 2.25;
      const x = Math.cos(angle) * radius * 1.08 + gauss() * 0.08;
      const y = Math.sin(angle) * radius * 0.62 + gauss() * 0.08;
      const z = gauss() * 0.72;
      idle[o] = x;
      idle[o + 1] = y;
      idle[o + 2] = z;
      idleDensity = THREE.MathUtils.clamp(
        0.23 - radius * 0.028 + Math.random() * 0.07,
        0.1,
        0.24
      );
    }

    const edge = THREE.MathUtils.clamp(
      Math.sqrt(
        idle[o] * idle[o] * 0.42 +
          idle[o + 1] * idle[o + 1] * 0.66 +
          idle[o + 2] * idle[o + 2] * 0.52
      ) / 2.4,
      0,
      1
    );
    const curlA = Math.sin(idle[o + 1] * 2.2 + idle[o + 2] * 1.4 + i * 0.013);
    const curlB = Math.sin(idle[o] * 2.45 - idle[o + 2] * 1.2 + i * 0.017);
    const warp = organic * (0.55 + edge * 0.75);
    idle[o] += (gauss() * 0.052 + curlA * 0.07) * warp;
    idle[o + 1] += (gauss() * 0.044 + curlB * 0.052) * warp;
    idle[o + 2] += (gauss() * 0.056 + (curlA - curlB) * 0.028) * warp;

    /* ── CONVERGED: lat/long sphere with low-frequency organic lumps ────── */
    const u = (i + 0.5) / count;
    const y = 1 - 2 * u + gauss() * 0.0018;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * goldenAngle + (Math.random() - 0.5) * 0.014;
    const theta = Math.acos(THREE.MathUtils.clamp(y, -1, 1));
    const lump =
      1 +
      0.032 * Math.sin(3.0 * phi + 2.2 * theta) +
      0.024 * Math.sin(5.0 * theta + 1.3) +
      0.018 * Math.sin(4.0 * phi - 2.1 * theta);
    const rad = SPHERE_R * lump + gauss() * 0.004;
    sphere[o] = rad * ring * Math.cos(phi);
    sphere[o + 1] = rad * y;
    sphere[o + 2] = rad * ring * Math.sin(phi);

    /* ── per-particle randoms ───────────────────────────────────────────── */
    rnd[o] = Math.random(); // phase / jitter seed
    rnd[o + 1] = Math.random(); // size variation
    rnd[o + 2] = Math.random(); // brightness variation
    shade[o] = idleDensity;
    shade[o + 1] = 0.78 + Math.random() * 0.44;
    shade[o + 2] = (i % 89) / 89;
  }

  return { idle, sphere, rnd, shade };
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Shaders                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

const SIMPLEX = /* glsl */ `
// Simplex 3D noise — Ashima Arts / Stefan Gustavson (public domain).
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERT = /* glsl */ `
uniform float uTime;
uniform float uConverge;   // 0 idle … 1 converged (already eased on CPU)
uniform float uSize;
uniform float uPixelRatio;
uniform float uIdleWildness;
uniform vec2 uCursor;
uniform float uCursorActive;

attribute vec3 aSphere;
attribute vec3 aRnd;       // x: phase/jitter  y: sizeVar  z: brightVar
attribute vec3 aShade;     // x: idleDensity   y: shellBoost z: weaveSeed

varying float vBright;
varying float vAlpha;
varying float vSharp;

${SIMPLEX}

void main() {
  float e = uConverge;
  vec3 idlePos = position;

  /* IDLE: organic per-particle wander + a slow collective breathing. */
  vec3 seed = idlePos * 1.4 + aRnd * 9.0;
  float t = uTime;
  float n1 = snoise(seed + vec3(0.0, 0.0, t * 0.16));
  float n2 = snoise(seed.yzx * 1.25 + vec3(t * 0.13, 0.0, 0.0));
  float n3 = snoise(seed.zxy * 0.9 - vec3(0.0, t * 0.15, 0.0));
  float wild = uIdleWildness * (1.0 - e);
  vec3 wander = vec3(n1, n2, n3) * mix(0.145, 0.232, uIdleWildness);
  wander += vec3(n2 * n3, n1 * n3, n1 * n2) * (0.052 * wild);
  float breathe = 1.0 + mix(0.025, 0.04, uIdleWildness) * sin(t * 0.5 + aRnd.x * 6.28);
  vec3 idleAnim = idlePos * breathe + wander;

  /* DESKTOP IDLE: nearby particles lean softly toward the cursor. */
  vec2 toCursor = uCursor - idleAnim.xy;
  float cursorDist = length(toCursor);
  float cursorFalloff = smoothstep(1.45, 0.0, cursorDist);
  cursorFalloff = cursorFalloff * cursorFalloff * uCursorActive * (1.0 - e);
  vec2 cursorDir = normalize(toCursor + vec2(1e-5));
  idleAnim.xy += cursorDir * cursorFalloff * 0.18;
  idleAnim.z += (aRnd.z - 0.5) * cursorFalloff * 0.04;

  /* CONVERGED: slow radial shimmer + microscopic tangential drift. */
  vec3 dir = normalize(aSphere + vec3(1e-5));
  vec3 tangent = normalize(cross(dir, vec3(0.0, 1.0, 0.17)) + vec3(1e-5));
  float surfaceFlow = snoise(dir * 4.2 + vec3(t * 0.16, -t * 0.11, t * 0.08));
  float strandWave = sin(
    dir.x * 11.0 + dir.y * 15.0 + dir.z * 9.0 + t * 0.42 + aRnd.x * 6.283
  );
  float ripple = surfaceFlow * 0.014 + strandWave * 0.007;
  float jitter = (aRnd.x - 0.5) * 0.01;
  vec3 sphereAnim = aSphere + dir * (ripple + jitter) + tangent * surfaceFlow * 0.005;

  vec3 pos = mix(idleAnim, sphereAnim, e);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  /* Size: fine, sharp particles; density carries the form, not blob size. */
  float sizeVar = mix(0.72, 1.28, aRnd.y);
  float idleFlicker = sin(t * (0.34 + aRnd.y * 0.32) + aRnd.x * 6.283);
  idleFlicker += 0.5 * sin(t * (0.21 + aRnd.z * 0.18) + aRnd.z * 8.1);
  idleFlicker *= 0.666;
  float size = uSize * sizeVar * mix(1.0 + idleFlicker * 0.075 * wild, 0.66, e);
  gl_PointSize = clamp(size * uPixelRatio / -mv.z, 0.65, 4.8 * uPixelRatio);

  /* Luminance: idle density gradient + converged Fresnel/depth glow. */
  float distC = length(idlePos * vec3(0.82, 1.08, 0.96));
  float idleCore = smoothstep(2.35, 0.06, distC);
  float hotCore = smoothstep(1.05, 0.02, distC); // tight, bright nucleus
  float idleAlpha = clamp(aShade.x * (0.34 + idleCore * 1.04 + hotCore * 0.32), 0.08, 1.3);
  float idleBright = aShade.x * (0.58 + 0.9 * idleCore + 0.6 * hotCore + 0.38 * aRnd.z);
  idleAlpha *= 1.0 + idleFlicker * 0.085 * wild;
  idleBright *= 1.0 + idleFlicker * 0.15 * wild;

  vec3 viewNormal = normalize(mat3(modelViewMatrix) * dir);
  float front = smoothstep(-0.35, 0.95, viewNormal.z);
  float rim = pow(clamp(1.0 - abs(viewNormal.z), 0.0, 1.0), 1.42);
  float az = atan(dir.z, dir.x);
  float weaveA = abs(sin(az * 19.0 + dir.y * 30.0 + t * 0.16 + aShade.z * 6.283));
  float weaveB = abs(sin(-az * 17.0 + dir.y * 34.0 - t * 0.13 + aRnd.x * 6.283));
  float weave = 0.68 + 0.32 * max(weaveA, weaveB);
  float shellAlpha = (0.18 + rim * 0.82 + front * 0.16) * aShade.y;
  float shellBright = (0.42 + rim * 1.42 + front * 0.32 + weave * 0.38) * aShade.y;

  vBright = mix(idleBright, shellBright, e);
  vAlpha = mix(idleAlpha, shellAlpha, e) * (0.7 + 0.58 * aRnd.z);
  vSharp = mix(1.75, 2.45, e);
}
`;

const FRAG = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
uniform float uOpacity;
varying float vBright;
varying float vAlpha;
varying float vSharp;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float glow = smoothstep(0.5, 0.0, d);
  glow = pow(glow, vSharp);
  float alpha = glow * vAlpha * uOpacity;
  vec3 color = uColor * (0.28 + 1.18 * vBright);
  gl_FragColor = vec4(color, alpha);
}
`;

const OrbMaterial = shaderMaterial(
  {
    uTime: 0,
    uConverge: 0,
    uSize: 7.6,
    uPixelRatio: 1,
    uIdleWildness: MOBILE_ORB_PROFILE.idleWildness,
    uCursor: new THREE.Vector2(0, 0),
    uCursorActive: 0,
    uColor: BONE.clone(),
    uOpacity: 1,
  },
  VERT,
  FRAG
);

extend({ OrbMaterial });

// Make <orbMaterial /> known to TS / R3F's JSX.
declare module "@react-three/fiber" {
  interface ThreeElements {
    orbMaterial: ThreeElement<typeof OrbMaterial>;
  }
}

type OrbMaterialImpl = THREE.ShaderMaterial & {
  uTime: number;
  uConverge: number;
  uIdleWildness: number;
  uPixelRatio: number;
  uSize: number;
  uOpacity: number;
  uCursor: THREE.Vector2;
  uCursorActive: number;
};

/* ────────────────────────────────────────────────────────────────────────── */
/* The point cloud (inside <Canvas>)                                            */
/* ────────────────────────────────────────────────────────────────────────── */

const easeInOut = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

type CursorState = {
  x: number;  // normalized to orb canvas bounds (-1..1), used by shader
  y: number;
  active: boolean;
  vx: number; // normalized to viewport center (-1..1), used for global tilt
  vy: number;
};

function OrbPoints({
  count,
  converged,
  idleWildness,
  pointSize,
  glow,
  reduced,
  cursorRef,
}: {
  count: number;
  converged: boolean;
  idleWildness: number;
  pointSize: number;
  glow: number;
  reduced: boolean;
  cursorRef: MutableRefObject<CursorState>;
}) {
  const matRef = useRef<OrbMaterialImpl>(null);
  const groupRef = useRef<THREE.Group>(null);
  const targetCursor = useRef(new THREE.Vector2(0, 0));
  const cursorWorld = useRef(new THREE.Vector2(0, 0));
  const cursorPower = useRef(0);
  // Global ambient tilt: slow whole-cloud position offset toward the cursor.
  const groupTilt = useRef(new THREE.Vector2(0, 0));
  const tiltTarget = useRef(new THREE.Vector2(0, 0));
  const { gl, invalidate, viewport } = useThree();

  const attrs = useMemo(() => buildAttributes(count), [count]);

  // Eased transition state (persists across frames).
  const conv = useRef(0);
  const from = useRef(0);
  const startT = useRef(0);
  const lastTarget = useRef(0);

  useEffect(() => {
    if (matRef.current) matRef.current.uPixelRatio = gl.getPixelRatio();
  }, [gl]);

  // Reduced motion: render-on-demand. Nudge a frame whenever the state flips so
  // the instant swap actually paints.
  useEffect(() => {
    if (reduced) invalidate();
  }, [reduced, converged, invalidate]);

  useFrame((state) => {
    const mat = matRef.current;
    if (!mat) return;

    const target = converged ? 1 : 0;
    const time = reduced ? 0 : state.clock.elapsedTime;

    if (target !== lastTarget.current) {
      from.current = conv.current;
      startT.current = state.clock.elapsedTime;
      lastTarget.current = target;
    }

    if (reduced) {
      conv.current = target; // instant swap
    } else {
      const p = Math.min(
        (state.clock.elapsedTime - startT.current) / (CONVERGE_MS / 1000),
        1
      );
      conv.current = from.current + (target - from.current) * easeInOut(p);
    }

    mat.uConverge = conv.current;
    mat.uTime = time;
    mat.uIdleWildness = idleWildness;
    mat.uSize = pointSize;
    mat.uOpacity = glow;

    const cursor = cursorRef.current;
    const cursorTargetActive = !reduced && !converged && cursor.active ? 1 : 0;
    targetCursor.current.set(
      THREE.MathUtils.clamp(cursor.x, -1.15, 1.15) * viewport.width * 0.5,
      THREE.MathUtils.clamp(-cursor.y, -1.15, 1.15) * viewport.height * 0.5
    );
    cursorWorld.current.lerp(targetCursor.current, reduced ? 1 : 0.09);
    cursorPower.current +=
      (cursorTargetActive - cursorPower.current) * (reduced ? 1 : 0.12);
    mat.uCursor.copy(cursorWorld.current);
    mat.uCursorActive = cursorPower.current;

    // Global ambient tilt: very slow lerp of the group's position toward the
    // cursor anywhere on screen. Max ±0.09 world units (~6% of cloud radius) so
    // it reads as "alive and aware" rather than "following". Scales to 0 as
    // converge completes so the sphere stays centered when held.
    const MAX_TILT = 0.09;
    const TILT_LERP = reduced ? 1 : 0.018; // ~3 s to full offset at 60 fps
    tiltTarget.current.set(
      cursorRef.current.vx * MAX_TILT * (1 - conv.current),
      -cursorRef.current.vy * MAX_TILT * (1 - conv.current)
    );
    groupTilt.current.lerp(tiltTarget.current, TILT_LERP);

    if (groupRef.current && !reduced) {
      groupRef.current.position.x = groupTilt.current.x;
      groupRef.current.position.y = groupTilt.current.y;
      // Whole form drifts/rotates very gently; eases toward upright as it
      // converges so the woven grid faces the viewer.
      groupRef.current.rotation.y = time * 0.05;
      groupRef.current.rotation.x = 0.32 + Math.sin(time * 0.18) * 0.05;
      groupRef.current.rotation.z = Math.sin(time * 0.12) * 0.04;
    } else if (groupRef.current) {
      groupRef.current.position.set(0, 0, 0);
      groupRef.current.rotation.set(0.32, 0.6, 0);
    }
  });

  return (
    <group ref={groupRef}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[attrs.idle, 3]}
          />
          <bufferAttribute attach="attributes-aSphere" args={[attrs.sphere, 3]} />
          <bufferAttribute attach="attributes-aRnd" args={[attrs.rnd, 3]} />
          <bufferAttribute attach="attributes-aShade" args={[attrs.shade, 3]} />
        </bufferGeometry>
        <orbMaterial
          ref={matRef}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* DOM overlay — floating prompts + converged label                            */
/* ────────────────────────────────────────────────────────────────────────── */

const PILL_CLASS =
  "pointer-events-none select-none whitespace-nowrap rounded-full border border-white/12 " +
  "bg-white/[0.06] px-3.5 py-1.5 text-[13px] font-light text-foreground/85 " +
  "backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.25)]";

// Loose angular slots around the orb perimeter, biased to the sides (away from
// the logo above and the cards below). Degrees, 0° = right, 90° = down.
const PROMPT_SLOTS = [200, 160, 215, 145, 340, 25, 320, 40];
const COMPACT_PROMPT_SLOTS = [250, 290, 70, 110, 240, 300, 60, 120];

// One prompt visible at a time, cycling slot→slot. The pill stays mounted and
// is swapped by `key` (instant, while hidden) with opacity/scale driven by the
// `animate` prop — deliberately NOT AnimatePresence, whose exit never completes
// in this React 19 + Next 15 + framer-motion 12 stack.
function FloatingPrompts({ radius }: { radius: number }) {
  const [idx, setIdx] = useState(() =>
    Math.floor(Math.random() * EXAMPLE_PROMPTS.length)
  );
  const [visible, setVisible] = useState(true);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const sync = () => setCompact(window.innerWidth < 640);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    setVisible(true);
    const hide = setTimeout(() => setVisible(false), 2700); // fade out
    const next = setTimeout(() => setIdx((i) => i + 1), 3400); // then advance
    return () => {
      clearTimeout(hide);
      clearTimeout(next);
    };
  }, [idx]);

  const prompt = EXAMPLE_PROMPTS[idx % EXAMPLE_PROMPTS.length];
  const slots = compact ? COMPACT_PROMPT_SLOTS : PROMPT_SLOTS;
  const angle = slots[idx % slots.length];
  const effectiveRadius = compact ? Math.min(radius, 132) : radius;
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * effectiveRadius;
  const y = Math.sin(rad) * effectiveRadius * 0.82; // slightly flattened orbit

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-visible">
      <motion.div
        key={idx}
        className="absolute left-1/2 top-1/2"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        initial={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: visible ? 1 : 0.97,
          filter: visible ? "blur(0px)" : "blur(4px)",
        }}
        transition={{ duration: visible ? 0.6 : 0.5, ease: "easeOut" }}
      >
        <span className={`${PILL_CLASS} max-w-[calc(100vw-3rem)] overflow-hidden text-ellipsis`}>
          {prompt}
        </span>
      </motion.div>
    </div>
  );
}

// Stays mounted; fades on `show` via the `animate` prop (no AnimatePresence).
function ConvergedLabel({ show, radius }: { show: boolean; radius: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{ translateX: "-50%" }}
        initial={false}
        animate={{ opacity: show ? 1 : 0, y: show ? radius + 28 : radius + 42 }}
        transition={{ duration: show ? 0.45 : 0.35, ease: "easeOut" }}
      >
        <span
          className="whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-5 py-2
                     text-sm font-normal text-foreground backdrop-blur-xl
                     shadow-[0_4px_30px_rgba(0,0,0,0.35)]"
        >
          hold and share your needs
        </span>
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* AyraOrb — the self-contained, drop-in component                             */
/* ────────────────────────────────────────────────────────────────────────── */

const CURSOR_LABEL_OFFSET = 18;
const DRAG_THRESHOLD_PX = 8;   // px of movement before a touch is classified as drag
const HOLD_MS = 300;            // ms of stillness before touch becomes hold-to-converge

type TapStart = {
  x: number;
  y: number;
  time: number;
};

export default function AyraOrb() {
  const reduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<CursorState>({ x: 0, y: 0, active: false, vx: 0, vy: 0 });
  const pressing = useRef(false);
  const tapStart = useRef<TapStart | null>(null);
  const touchPhase = useRef<"idle" | "pending" | "holding" | "dragging">("idle");
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchOrigin = useRef({ x: 0, y: 0 });

  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(4200);
  const [orbProfile, setOrbProfile] = useState<OrbViewportProfile>(MOBILE_ORB_PROFILE);
  const [converged, setConverged] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [supportsCoarsePointer, setSupportsCoarsePointer] = useState(false);
  const [hadTouch, setHadTouch] = useState(false);
  const [cursorNear, setCursorNear] = useState(false);
  const [mobileLabelVisible, setMobileLabelVisible] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 300, damping: 30 });
  const sy = useSpring(my, { stiffness: 300, damping: 30 });
  const labelX = reduced ? mx : sx;
  const labelY = reduced ? my : sy;

  // Client-only: pick particle count once we know the device.
  useEffect(() => {
    setCount(pickParticleCount());
    setOrbProfile(pickOrbViewportProfile());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const anyCoarse = window.matchMedia("(any-pointer: coarse)");
    const sync = () => {
      setIsFinePointer(fine.matches);
      setSupportsCoarsePointer(coarse.matches || anyCoarse.matches);
    };

    sync();
    fine.addEventListener("change", sync);
    coarse.addEventListener("change", sync);
    anyCoarse.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      coarse.removeEventListener("change", sync);
      anyCoarse.removeEventListener("change", sync);
    };
  }, []);

  // Release anywhere ends the hold, even if the pointer left the hit-area.
  useEffect(() => {
    if (!mounted) return;
    const release = () => {
      if (pressing.current) {
        pressing.current = false;
        setConverged(false);
      }
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [mounted]);

  const desktopHitEnabled = mounted && isFinePointer && !hadTouch;
  const desktopEffectsEnabled = desktopHitEnabled && !reduced;
  const mobileTapEnabled = mounted && supportsCoarsePointer;
  const showCursorLabel = desktopEffectsEnabled && cursorNear && !converged;
  const showAnyLabel = showCursorLabel || (mobileLabelVisible && !converged && !reduced);
  const orbRadius = orbProfile.radius;
  const promptRadius = orbRadius + (orbRadius > MOBILE_ORB_PROFILE.radius ? 78 : 64);
  const cursorZoneRadius = orbRadius + (orbRadius > MOBILE_ORB_PROFILE.radius ? 108 : 96);

  useEffect(() => {
    if (!desktopEffectsEnabled || converged) {
      cursorRef.current.active = false;
    }
    if (!desktopEffectsEnabled) {
      setCursorNear(false);
    }
  }, [desktopEffectsEnabled, converged]);

  // Global cursor tracking for the full-screen ambient tilt.
  // Only fires for pointer: fine devices; resets vx/vy to 0 when disabled so
  // the cloud eases back to center rather than freezing off-axis.
  useEffect(() => {
    if (!desktopEffectsEnabled) {
      cursorRef.current.vx = 0;
      cursorRef.current.vy = 0;
      return;
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      cursorRef.current.vx = (e.clientX / window.innerWidth) * 2 - 1;
      cursorRef.current.vy = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [desktopEffectsEnabled]);

  const updateTouchLean = (clientX: number, clientY: number) => {
    if (reduced) return;
    cursorRef.current.vx = (clientX / window.innerWidth) * 2 - 1;
    cursorRef.current.vy = (clientY / window.innerHeight) * 2 - 1;
    const orbRect = orbRef.current?.getBoundingClientRect();
    if (orbRect) {
      cursorRef.current.x = ((clientX - orbRect.left) / orbRect.width) * 2 - 1;
      cursorRef.current.y = ((clientY - orbRect.top) / orbRect.height) * 2 - 1;
    }
    cursorRef.current.active = true;
  };

  const markTouchInput = () => {
    cursorRef.current.active = false;
    setCursorNear(false);
    setHadTouch(true);
  };

  const syncCursor = (e: ReactPointerEvent<HTMLDivElement>, jump = false) => {
    const orb = orbRef.current;
    const root = rootRef.current;
    if (!orb || !root) return;

    const orbRect = orb.getBoundingClientRect();
    cursorRef.current.x = ((e.clientX - orbRect.left) / orbRect.width) * 2 - 1;
    cursorRef.current.y = ((e.clientY - orbRect.top) / orbRect.height) * 2 - 1;
    cursorRef.current.active = true;

    const rootRect = root.getBoundingClientRect();
    const x = e.clientX - rootRect.left + CURSOR_LABEL_OFFSET;
    const y = e.clientY - rootRect.top + CURSOR_LABEL_OFFSET;
    mx.set(x);
    my.set(y);
    if (jump && !reduced) {
      sx.jump(x);
      sy.jump(y);
    }
  };

  const onDesktopEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      markTouchInput();
      return;
    }
    if (!desktopHitEnabled) return;
    syncCursor(e, true);
    setCursorNear(true);
  };

  const onDesktopMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      markTouchInput();
      return;
    }
    if (!desktopHitEnabled) return;
    syncCursor(e);
    setCursorNear(true);
  };

  const onDesktopLeave = () => {
    cursorRef.current.active = false;
    setCursorNear(false);
  };

  const beginMobileTap = (e: ReactPointerEvent<HTMLDivElement>) => {
    const touchLike =
      e.pointerType === "touch" || (!isFinePointer && supportsCoarsePointer);
    if (!touchLike) return;
    markTouchInput();
    touchOrigin.current = { x: e.clientX, y: e.clientY };
    touchPhase.current = "pending";
    tapStart.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    // Mobile: seed label centered horizontally and above the finger.
    const rootRect = rootRef.current?.getBoundingClientRect();
    if (rootRect) {
      const lx = e.clientX - rootRect.left;
      const ly = e.clientY - rootRect.top - 56;
      mx.set(lx);
      my.set(ly);
      if (!reduced) { sx.jump(lx); sy.jump(ly); }
    }
    setMobileLabelVisible(true);
    if (!reduced) {
      holdTimerRef.current = setTimeout(() => {
        if (touchPhase.current === "pending") {
          touchPhase.current = "holding";
          cursorRef.current.active = false;
          setMobileLabelVisible(false);
          setConverged(true);
        }
      }, HOLD_MS);
    }
  };

  const handleTouchDragMove = (clientX: number, clientY: number) => {
    if (reduced) return;
    const phase = touchPhase.current;
    if (phase === "idle") return;
    const moved = Math.hypot(
      clientX - touchOrigin.current.x,
      clientY - touchOrigin.current.y
    );
    if (phase === "pending" && moved > DRAG_THRESHOLD_PX) {
      if (holdTimerRef.current !== null) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      touchPhase.current = "dragging";
    } else if (phase === "holding" && moved > DRAG_THRESHOLD_PX) {
      touchPhase.current = "dragging";
      setConverged(false);
    }
    if (touchPhase.current === "dragging") {
      updateTouchLean(clientX, clientY);
    }
  };

  const onMobileTouchMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") return;
    // Keep label tracking the finger while any touch is active.
    if (touchPhase.current !== "idle") {
      const rootRect = rootRef.current?.getBoundingClientRect();
      if (rootRect) {
        mx.set(e.clientX - rootRect.left);
        my.set(e.clientY - rootRect.top - 56);
      }
    }
    handleTouchDragMove(e.clientX, e.clientY);
  };

  const finishMobileTap = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    const phase = touchPhase.current;
    const start = tapStart.current;
    touchPhase.current = "idle";
    tapStart.current = null;
    setMobileLabelVisible(false);
    if (phase === "pending" && start) {
      const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      const elapsed = performance.now() - start.time;
      if (moved <= 14 && elapsed <= 700) {
        setConverged((current) => !current);
      }
    } else if (phase === "holding") {
      setConverged(false);
    } else if (phase === "dragging") {
      cursorRef.current.vx = 0;
      cursorRef.current.vy = 0;
      cursorRef.current.active = false;
    }
  };

  const cancelMobileTap = () => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    const phase = touchPhase.current;
    touchPhase.current = "idle";
    tapStart.current = null;
    setMobileLabelVisible(false);
    if (phase === "holding") {
      setConverged(false);
    } else if (phase === "dragging") {
      cursorRef.current.vx = 0;
      cursorRef.current.vy = 0;
      cursorRef.current.active = false;
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      beginMobileTap(e);
      return;
    }
    if (!desktopHitEnabled) return;
    e.preventDefault();
    syncCursor(e);
    pressing.current = true;
    setConverged(true);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") {
      finishMobileTap(e);
      return;
    }
    pressing.current = false;
    setConverged(false);
  };

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-0 overflow-hidden"
    >
      {/* Visual layer — behind the hero content (z-0), never intercepts input. */}
      <div
        ref={orbRef}
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: orbProfile.canvasWidth,
          height: orbProfile.canvasHeight,
        }}
        aria-hidden
      >
        {mounted && (
          <Canvas
            frameloop={reduced ? "never" : "always"}
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            camera={{ position: [0, 0, 5], fov: 42 }}
            style={{ width: "100%", height: "100%" }}
          >
            <OrbPoints
              count={count}
              converged={converged}
              idleWildness={orbProfile.idleWildness}
              pointSize={orbProfile.pointSize}
              glow={orbProfile.glow}
              reduced={reduced}
              cursorRef={cursorRef}
            />
          </Canvas>
        )}
      </div>

      {mobileTapEnabled && (
        <div
          className="absolute inset-0 z-10"
          style={{ touchAction: "pan-y" }}
          onPointerDown={beginMobileTap}
          onPointerMove={onMobileTouchMove}
          onPointerUp={finishMobileTap}
          onPointerCancel={cancelMobileTap}
          aria-hidden
        />
      )}

      {/* Floating prompts — idle only, around the perimeter (no input). */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
        style={{ width: 1, height: 1 }}
        aria-hidden
      >
        {mounted && !reduced && !converged && !showAnyLabel && (
          <FloatingPrompts radius={promptRadius} />
        )}
        <ConvergedLabel show={converged} radius={orbRadius} />
      </div>

      {desktopHitEnabled && (
        <div
          className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2
                     cursor-pointer rounded-full"
          style={{
            width: cursorZoneRadius * 2,
            height: cursorZoneRadius * 2,
            touchAction: "pan-y",
          }}
          onPointerEnter={onDesktopEnter}
          onPointerMove={onDesktopMove}
          onPointerLeave={onDesktopLeave}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={cancelMobileTap}
          role="button"
          aria-label="Hold to converge the orb"
        />
      )}

      {/* Desktop: label follows cursor (offset down-right). */}
      {desktopHitEnabled && (
        <motion.div
          className="pointer-events-none absolute left-0 top-0 z-40"
          style={{ x: labelX, y: labelY }}
          aria-hidden
        >
          <motion.div
            initial={false}
            animate={
              showAnyLabel
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: reduced ? 1 : 0.95 }
            }
            transition={{
              duration: reduced ? 0 : showAnyLabel ? 0.15 : 0.1,
              ease: showAnyLabel ? [0.22, 1, 0.36, 1] : [0.64, 0, 0.78, 0],
            }}
          >
            <span className={PILL_CLASS}>press and hold</span>
          </motion.div>
        </motion.div>
      )}

      {/* Mobile: label centered above the tap point. Inner div handles -50% centering
          separately from framer-motion's x/y so the two transforms don't conflict. */}
      {mobileTapEnabled && !desktopHitEnabled && (
        <motion.div
          className="pointer-events-none absolute left-0 top-0 z-40"
          style={{ x: labelX, y: labelY }}
          aria-hidden
        >
          <div style={{ transform: "translateX(-50%)" }}>
            <motion.div
              initial={false}
              animate={
                showAnyLabel
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: reduced ? 1 : 0.95 }
              }
              transition={{
                duration: reduced ? 0 : showAnyLabel ? 0.15 : 0.1,
                ease: showAnyLabel ? [0.22, 1, 0.36, 1] : [0.64, 0, 0.78, 0],
              }}
            >
              <span className={PILL_CLASS}>press and hold</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
