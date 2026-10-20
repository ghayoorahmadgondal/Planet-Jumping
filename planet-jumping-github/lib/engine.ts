import { states, type Planet } from './planets';

type Api = { get: () => Planet; set: (p: Planet) => void };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const raf = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const retrigger = (el: Element, c: string) => {
  el.classList.remove(c);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(c);
};
const animateValue = (set: (v: number) => void, d: number) =>
  new Promise<void>((res) => {
    const s = performance.now();
    (function f(n: number) {
      const t = Math.min(1, Math.max(0, (n - s) / d));
      set(ease(t));
      t < 1 ? requestAnimationFrame(f) : res();
    })(s);
  });

/** Runs the preloader, the canvas portal mask and the travel transition. Returns a cleanup function. */
export function initExperience(root: HTMLElement, api: Api) {
  const q = <T extends HTMLElement>(s: string) => root.querySelector(s) as T;
  const pl = q('.planet-list'), portal = q<HTMLButtonElement>('#portal');
  const pv = q<HTMLVideoElement>('#portal-video'), pi = q<HTMLImageElement>('#portal-image');
  const tv = q<HTMLVideoElement>('#transition-video'), pre = q('#preloader'), pvid = q<HTMLVideoElement>('#preloader-video');
  const pc = q<HTMLCanvasElement>('#portal-canvas'), sc = q<HTMLCanvasElement>('#scene-canvas');
  const logo = q('#floating-logo'), cnt = q('#preloader-count'), val = q('#preloader-value'), cur = q('.custom-cursor');
  const ctx = pc.getContext('2d')!, sctx = sc.getContext('2d')!;

  let dead = false, busy = false, frozen = false, transitionActive = false;
  let rotX = 0, rotY = 0, tX = 0, tY = 0, expn = 0, maskScale = 0, canvasOpacity = 1;
  let px = 0, py = 0, cx = 0, cy = 0, seen = false, r1 = 0, r2 = 0;
  const offs: (() => void)[] = [];
  const on = <K extends keyof WindowEventMap>(t: EventTarget, type: string, fn: (e: any) => void) => {
    t.addEventListener(type, fn);
    offs.push(() => t.removeEventListener(type, fn));
  };

  const revealMask = () => { retrigger(root, 'mask-revealing'); maskScale = 0; return animateValue((v) => (maskScale = v), 1050); };
  const revealPlanetContent = () => retrigger(root, 'content-revealing');

  function resizeCanvas() {
    const d = Math.min(window.devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
    const set = (c: HTMLCanvasElement, x: CanvasRenderingContext2D) => {
      c.width = W * d; c.height = H * d; c.style.width = W + 'px'; c.style.height = H + 'px'; x.setTransform(d, 0, 0, d, 0, 0);
    };
    set(pc, ctx);
    if (!frozen) set(sc, sctx);
  }
  function drawCover(m: HTMLVideoElement | HTMLImageElement, c: CanvasRenderingContext2D) {
    const mw = (m as HTMLVideoElement).videoWidth || (m as HTMLImageElement).naturalWidth;
    const mh = (m as HTMLVideoElement).videoHeight || (m as HTMLImageElement).naturalHeight;
    if (!mw || !mh) return;
    const s = Math.max(innerWidth / mw, innerHeight / mh), w = mw * s, h = mh * s;
    c.drawImage(m, (innerWidth - w) / 2, (innerHeight - h) / 2, w, h);
  }
  function drawShade(c: CanvasRenderingContext2D) {
    const H = innerHeight, g = c.createLinearGradient(0, H * 0.52, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.88)');
    c.fillStyle = g; c.fillRect(0, H * 0.52, innerWidth, H * 0.48);
  }
  function roundedPts(w: number, h: number, r: number) {
    r = Math.min(r, w / 2, h / 2);
    const P: [number, number][] = [], PI = Math.PI;
    ([[w / 2 - r, -h / 2 + r, -PI / 2, 0], [w / 2 - r, h / 2 - r, 0, PI / 2], [-w / 2 + r, h / 2 - r, PI / 2, PI], [-w / 2 + r, -h / 2 + r, PI, PI * 1.5]] as number[][]).forEach(([x, y, a0, a1]) => {
      for (let i = 0; i <= 10; i++) { const a = a0 + ((a1 - a0) * i) / 10; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    });
    return P;
  }
  function project(x: number, y: number, rx: number, ry: number, ox: number, oy: number): [number, number] {
    const ax = (rx * Math.PI) / 180, ay = (ry * Math.PI) / 180;
    const xx = x * Math.cos(ay), yy = y * Math.cos(ax), z = x * Math.sin(ay) - y * Math.sin(ax), p = 850 / (850 + z);
    return [ox + xx * p, oy + yy * p];
  }

  let last = performance.now();
  function draw(t: number) {
    if (dead) return;
    const dt = Math.min(40, t - last); last = t;
    const k = Math.min(1, dt * 0.009); rotX += (tX - rotX) * k; rotY += (tY - rotY) * k;
    const W = innerWidth, H = innerHeight;
    ctx.clearRect(0, 0, W, H);
    if (frozen) { ctx.drawImage(sc, 0, 0, W, H); drawShade(ctx); }
    const rc = portal.getBoundingClientRect(), e = expn;
    const rcx = rc.left + rc.width / 2, rcy = rc.top + rc.height / 2;
    const ox = rcx + (W / 2 - rcx) * e, oy = rcy + (H / 2 - rcy) * e;
    const sca = e ? 1 : maskScale;
    const w = (rc.width + (W - rc.width) * e) * sca, h = (rc.height + (H - rc.height) * e) * sca, r = 90 * (1 - e) * sca;
    if (w > 1 && h > 1) {
      const pts = roundedPts(w, h, r).map(([x, y]) => project(x, y, rotX * (1 - e), rotY * (1 - e), ox, oy));
      ctx.save(); ctx.globalAlpha = canvasOpacity;
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
      ctx.fillStyle = '#030303'; ctx.fillRect(0, 0, W, H);
      drawCover(transitionActive ? tv : states[api.get()].image ? pi : pv, ctx);
      if (transitionActive) drawShade(ctx);
      ctx.restore();
    }
    r1 = requestAnimationFrame(draw);
  }

  async function travel() {
    const from = api.get();
    if (busy || from === 'venus') return;
    busy = true; tX = tY = 0;
    try {
      const next: Planet = from === 'mars' ? 'earth' : 'venus';
      tv.src = states[from].portal!; tv.load(); root.classList.add('is-loading');
      await new Promise<void>((r) => { tv.addEventListener('canplaythrough', () => r(), { once: true }); tv.addEventListener('error', () => r(), { once: true }); setTimeout(r, 1600); });
      root.classList.remove('is-loading', 'content-revealing', 'mask-revealing'); root.classList.add('is-transitioning');
      tv.currentTime = 0; tv.playbackRate = 1.3; canvasOpacity = 1; transitionActive = true;
      await tv.play();
      await animateValue((v) => (expn = v), 1100);
      if (!tv.ended) await new Promise<void>((r) => tv.addEventListener('ended', () => r(), { once: true }));
      frozen = true;
      const d = Math.min(window.devicePixelRatio || 1, 2);
      sc.width = innerWidth * d; sc.height = innerHeight * d; sctx.setTransform(d, 0, 0, d, 0, 0);
      sctx.clearRect(0, 0, innerWidth, innerHeight); drawCover(tv, sctx);
      root.classList.add('is-committing');
      api.set(next);
      retrigger(pl, 'is-switching');
      const bg = root.querySelector('#' + states[next].background) as HTMLVideoElement | null;
      if (bg && bg.duration) { try { bg.currentTime = Math.max(0, bg.duration - 0.05); } catch {} }
      await raf(); await raf();
      transitionActive = false; expn = 0; maskScale = 0; canvasOpacity = 1;
      root.classList.remove('is-transitioning', 'is-committing');
      const mr = revealMask(); setTimeout(revealPlanetContent, 100); await mr;
      await wait(450);
      tv.removeAttribute('src'); tv.load(); busy = false;
    } catch {
      transitionActive = false; expn = 0; maskScale = 1; canvasOpacity = 1;
      root.classList.remove('is-transitioning', 'is-committing', 'is-loading'); busy = false;
    }
  }

  async function startExperience() {
    pv.play().catch(() => {});
    if (!states[api.get()].image && pv.readyState < 2) await new Promise<void>((r) => { pv.addEventListener('loadeddata', () => r(), { once: true }); setTimeout(r, 2500); });
    await revealMask();
    document.body.classList.add('intro-ready');
    await wait(850); revealPlanetContent();
  }

  function runPreloader() {
    let done = false;
    const finish = () => {
      if (done || dead) return; done = true;
      val.textContent = '100'; cnt.classList.add('is-leaving'); logo.classList.add('is-docked');
      pre.classList.add('is-background'); document.body.classList.add('preload-complete');
      startExperience();
      setTimeout(() => (cnt.style.display = 'none'), 750);
      setTimeout(() => logo.classList.add('is-settled'), 2000);
    };
    const go = () => {
      pvid.playbackRate = Math.max(0.25, pvid.duration / 3);
      pvid.play().catch(finish);
      (function tick() { if (done || dead) return; val.textContent = String(Math.min(100, Math.round((pvid.currentTime / pvid.duration) * 100) || 0)); r2 = requestAnimationFrame(tick); })();
    };
    setTimeout(finish, 12000);
    pvid.addEventListener('ended', finish); pvid.addEventListener('error', finish);
    pvid.readyState >= 1 ? go() : pvid.addEventListener('loadedmetadata', go, { once: true });
  }

  on(window, 'pointermove', (e: PointerEvent) => {
    px = e.clientX; py = e.clientY;
    if (!seen) { seen = true; cx = px; cy = py; }
    cur.classList.add('is-visible');
    if (e.pointerType === 'mouse' && !busy) { tY = (px / innerWidth - 0.5) * 37.4; tX = (py / innerHeight - 0.5) * -33; }
  });
  on(document, 'mouseleave', () => cur.classList.remove('is-visible'));
  on(document.documentElement, 'pointerleave', () => { tX = tY = 0; });
  on(portal, 'pointerenter', () => cur.classList.add('is-enter'));
  on(portal, 'pointerleave', () => cur.classList.remove('is-enter'));
  on(portal, 'click', travel);
  on(window, 'resize', resizeCanvas);

  let r3 = 0;
  const cursorLoop = () => {
    if (dead) return;
    cx += (px - cx) * 0.2; cy += (py - cy) * 0.2;
    cur.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    r3 = requestAnimationFrame(cursorLoop);
  };

  root.querySelectorAll('video').forEach((v) => { v.muted = true; });
  root.querySelectorAll<HTMLVideoElement>('.background').forEach((v) => { v.pause(); v.currentTime = 0; });
  resizeCanvas();
  r1 = requestAnimationFrame(draw); r3 = requestAnimationFrame(cursorLoop); runPreloader();

  return () => {
    dead = true;
    cancelAnimationFrame(r1); cancelAnimationFrame(r2); cancelAnimationFrame(r3);
    offs.forEach((f) => f());
    document.body.classList.remove('preload-complete', 'intro-ready');
  };
}
