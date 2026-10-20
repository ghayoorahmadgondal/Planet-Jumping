import type { Planet } from './planets';

export const TW = 512, TH = 256, R = 210, CANVAS = 900;
type V3 = [number, number, number];

const mix = (a: V3, b: V3, t: number): V3 => {
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
};
function hash(x: number, y: number, z: number) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177);
  n = Math.imul(n ^ (n >>> 13), 1103515245);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
const sm = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function noise(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = sm(x - xi), fy = sm(y - yi), fz = sm(z - zi);
  const f = (dz: number) =>
    lerp(lerp(hash(xi, yi, zi + dz), hash(xi + 1, yi, zi + dz), fx), lerp(hash(xi, yi + 1, zi + dz), hash(xi + 1, yi + 1, zi + dz), fx), fy);
  return lerp(f(0), f(1), fz);
}
function fbm(x: number, y: number, z: number, o = 4) {
  let a = 0.5, s = 0, f = 1;
  for (let i = 0; i < o; i++) { s += a * noise(x * f, y * f, z * f); f *= 2; a *= 0.5; }
  return s;
}

type Fn = (x: number, y: number, z: number, lat: number, lon: number) => V3;
const fns: Record<string, Fn> = {
  mercury: (x, y, z) => {
    let c = mix([84, 80, 76], [182, 174, 164], fbm(x * 3, y * 3, z * 3) * 1.25);
    const cr = noise(x * 13, y * 13, z * 13);
    if (cr > 0.74) c = mix(c, [60, 57, 55], (cr - 0.74) * 3);
    return c;
  },
  venus: (x, y, z) => {
    const w = fbm(x * 2, y * 2, z * 2, 3) * 2;
    return mix([190, 140, 70], [246, 226, 172], fbm(x * 1.8 + w, y * 6 + w, z * 1.8 + w) * 1.35 - 0.12);
  },
  earth: (x, y, z) => {
    const h = fbm(x * 2.3 + 3, y * 2.3, z * 2.3, 5);
    let c: V3 = h > 0.5 ? mix([62, 118, 56], [166, 138, 84], (h - 0.5) * 4) : mix([8, 34, 100], [26, 92, 168], h * 2);
    const ice = Math.abs(y) - 0.86;
    if (ice > 0) c = mix(c, [240, 246, 250], ice * 14);
    return mix(c, [255, 255, 255], (fbm(x * 3.2 + 9, y * 3.8, z * 3.2, 5) - 0.5) * 3.2);
  },
  mars: (x, y, z) => {
    let c = mix([132, 58, 32], [212, 128, 74], fbm(x * 2.6, y * 2.6, z * 2.6) * 1.4 - 0.1);
    c = mix(c, [78, 40, 30], (fbm(x * 1.4 + 9, y * 1.4, z * 1.4, 3) - 0.5) * 2.4);
    const ice = Math.abs(y) - 0.94;
    return ice > 0 ? mix(c, [238, 238, 240], ice * 30) : c;
  },
  jupiter: (x, y, z, lat, lon) => {
    const w = fbm(x * 3, y * 2.5, z * 3);
    let c = mix([150, 98, 66], [238, 218, 186], Math.sin(y * 12 + w * 3.4) * 0.5 + 0.5);
    const s = Math.sin(y * 27 + 1.7 + w * 2);
    if (s > 0.55) c = mix(c, [112, 66, 46], (s - 0.55) * 1.2);
    const d = Math.hypot((lon - 0.9) / 0.24, (lat + 0.3) / 0.1);
    return d < 1 ? mix(c, [196, 84, 52], 1 - d * d) : c;
  },
  saturn: (x, y, z) =>
    mix([186, 156, 104], [238, 218, 170], Math.sin(y * 16 + fbm(x * 2, y * 2, z * 2, 3) * 1.8) * 0.5 + 0.5),
  uranus: (x, y, z) =>
    mix([146, 212, 220], [190, 238, 242], Math.sin(y * 9 + fbm(x * 2, y * 2, z * 2, 3) * 1.2) * 0.5 + 0.5),
  neptune: (x, y, z, lat, lon) => {
    const w = fbm(x * 2.4, y * 2.4, z * 2.4);
    const t = Math.sin(y * 10 + w * 2.4) * 0.5 + 0.5;
    let c = mix([24, 52, 160], [76, 124, 236], t * 0.8 + w * 0.3);
    const d = Math.hypot((lon + 0.6) / 0.3, (lat - 0.32) / 0.12);
    return d < 1 ? mix(c, [10, 24, 90], 1 - d * d) : c;
  },
};

const cache: Record<string, Uint8ClampedArray> = {};
export function getTexture(id: string) {
  if (cache[id]) return cache[id];
  const out = new Uint8ClampedArray(TW * TH * 4), fn = fns[id];
  for (let y = 0; y < TH; y++) {
    const lat = (0.5 - (y + 0.5) / TH) * Math.PI;
    for (let x = 0; x < TW; x++) {
      const lon = ((x + 0.5) / TW - 0.5) * 2 * Math.PI;
      const c = fn(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon), lat, lon);
      const o = (y * TW + x) * 4;
      out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = 255;
    }
  }
  return (cache[id] = out);
}

/** Pre-computed lit sphere: each frame only slides the texture sideways, which looks like rotation. */
export class Sphere {
  canvas: HTMLCanvasElement; private ctx: CanvasRenderingContext2D; private img: ImageData;
  private n = 0; private pos: Int32Array; private col: Int16Array; private row: Int16Array; private sh: Uint16Array; private al: Uint8Array;
  constructor() {
    const S = R * 2;
    this.canvas = document.createElement('canvas'); this.canvas.width = this.canvas.height = S;
    this.ctx = this.canvas.getContext('2d')!; this.img = this.ctx.createImageData(S, S);
    const max = Math.ceil(Math.PI * R * R) + 400;
    this.pos = new Int32Array(max); this.col = new Int16Array(max); this.row = new Int16Array(max);
    this.sh = new Uint16Array(max); this.al = new Uint8Array(max);
    const L = [-0.55, 0.42, 0.72], ll = Math.hypot(L[0], L[1], L[2]);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const nx = (x + 0.5 - R) / R, ny = -(y + 0.5 - R) / R, d2 = nx * nx + ny * ny;
      if (d2 >= 1) continue;
      const nz = Math.sqrt(1 - d2), r = Math.sqrt(d2);
      const lon = Math.atan2(nx, nz), lat = Math.asin(ny);
      const i = this.n++;
      this.pos[i] = y * S + x;
      this.col[i] = Math.floor((lon / (2 * Math.PI) + 0.5) * TW);
      this.row[i] = Math.min(TH - 1, Math.floor((0.5 - lat / Math.PI) * TH));
      const dot = (nx * L[0] + ny * L[1] + nz * L[2]) / ll;
      const lit = Math.pow(Math.min(1, Math.max(0, (dot + 0.14) / 1.14)), 0.85);
      this.sh[i] = Math.round((0.05 + 0.95 * lit) * (0.6 + 0.4 * nz) * 256);
      this.al[i] = r > 0.993 ? Math.round(((1 - r) / 0.007) * 255) : 255;
    }
  }
  draw(tex: Uint8ClampedArray, off: number) {
    const d = this.img.data, io = Math.floor(off), fr = off - io;
    for (let i = 0; i < this.n; i++) {
      const base = this.row[i] * TW, c = this.col[i] + io;
      const a = (base + (c & (TW - 1))) * 4, b = (base + ((c + 1) & (TW - 1))) * 4, s = this.sh[i], o = this.pos[i] * 4;
      d[o] = (((tex[a] * (1 - fr) + tex[b] * fr) * s) >> 8);
      d[o + 1] = (((tex[a + 1] * (1 - fr) + tex[b + 1] * fr) * s) >> 8);
      d[o + 2] = (((tex[a + 2] * (1 - fr) + tex[b + 2] * fr) * s) >> 8);
      d[o + 3] = this.al[i];
    }
    this.ctx.putImageData(this.img, 0, 0);
  }
}

const BANDS: [number, number, number, string][] = [
  [1.3, 0.14, 0.4, '150,132,100'], [1.52, 0.3, 0.75, '218,196,152'], [1.9, 0.07, 0.3, '170,150,118'], [2.0, 0.2, 0.6, '196,176,138'],
];
function ring(ctx: CanvasRenderingContext2D, a0: number, a1: number) {
  for (const [r, w, al, c] of BANDS) {
    ctx.beginPath(); ctx.arc(0, 0, r * R, a0, a1);
    ctx.lineWidth = w * R; ctx.strokeStyle = `rgba(${c},${al})`; ctx.stroke();
  }
}

export function drawPlanet(ctx: CanvasRenderingContext2D, sphere: Sphere, tex: Uint8ClampedArray, off: number, p: Planet) {
  const c = CANVAS / 2;
  ctx.clearRect(0, 0, CANVAS, CANVAS);
  const g = ctx.createRadialGradient(c, c, R * 0.97, c, c, R * 1.28);
  g.addColorStop(0, `rgba(${p.glow},.38)`); g.addColorStop(1, `rgba(${p.glow},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, R * 1.28, 0, Math.PI * 2); ctx.fill();
  const rings = p.id === 'saturn';
  if (rings) { ctx.save(); ctx.translate(c, c); ctx.rotate(-0.38); ctx.scale(1, 0.3); ring(ctx, Math.PI, Math.PI * 2); ctx.restore(); }
  sphere.draw(tex, off);
  ctx.drawImage(sphere.canvas, c - R, c - R);
  if (rings) { ctx.save(); ctx.translate(c, c); ctx.rotate(-0.38); ctx.scale(1, 0.3); ring(ctx, 0, Math.PI); ctx.restore(); }
}

export class Stars {
  private s: { x: number; y: number; z: number; r: number; a: number }[] = [];
  private t = 0;
  constructor(n: number) {
    for (let i = 0; i < n; i++) {
      const z = Math.random() ** 2;
      this.s.push({ x: Math.random(), y: Math.random(), z: 0.15 + z * 0.85, r: 0.6 + Math.random() * 1.4, a: 0.35 + Math.random() * 0.65 });
    }
  }
  draw(ctx: CanvasRenderingContext2D, W: number, H: number, dt: number, px: number, py: number, warp: number) {
    this.t += dt; ctx.clearRect(0, 0, W, H);
    this.s.forEach((s, i) => {
      s.x -= ((0.004 + warp * 0.9) * s.z * dt) / 1000;
      s.x -= Math.floor(s.x);
      const x = s.x * W - px * 46 * s.z, y = s.y * H - py * 30 * s.z;
      ctx.fillStyle = `rgba(255,255,255,${s.a * (0.78 + 0.22 * Math.sin(this.t * 0.002 + i))})`;
      const len = Math.abs(warp) * 160 * s.z;
      if (len > 2) ctx.fillRect(warp > 0 ? x : x - len, y, len + s.r, s.r * 0.8);
      else ctx.fillRect(x, y, s.r, s.r);
    });
  }
}
