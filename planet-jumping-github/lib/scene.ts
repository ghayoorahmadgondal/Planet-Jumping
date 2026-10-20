import { planets } from './planets';
import { CANVAS, Sphere, Stars, drawPlanet, getTexture } from './render';

const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export interface SceneApi { target: () => number; shown: (i: number) => void }

/** Draws the starfield and the current planet, and flies planets in and out when the target changes. */
export function createScene(bg: HTMLCanvasElement, pl: HTMLCanvasElement, api: SceneApi) {
  const bctx = bg.getContext('2d')!, pctx = pl.getContext('2d')!;
  pl.width = pl.height = CANVAS;
  const sphere = new Sphere(), stars = new Stars(300);
  let shown = 0, tex = getTexture(planets[0].id), phase: 'idle' | 'exit' | 'enter' = 'idle';
  let t0 = 0, dir = 1, off = 0, last = performance.now(), px = 0, py = 0, spx = 0, spy = 0, raf = 0, dead = false;

  const resize = () => {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    bg.width = innerWidth * d; bg.height = innerHeight * d;
    bg.style.width = innerWidth + 'px'; bg.style.height = innerHeight + 'px';
    bctx.setTransform(d, 0, 0, d, 0, 0);
  };
  const move = (e: PointerEvent) => { px = e.clientX / innerWidth - 0.5; py = e.clientY / innerHeight - 0.5; };

  function frame(now: number) {
    if (dead) return;
    const dt = Math.min(50, now - last); last = now;
    const k = Math.min(1, dt * 0.004);
    spx += (px - spx) * k; spy += (py - spy) * k;
    const tg = api.target();
    if (phase === 'idle' && tg !== shown) { dir = tg > shown ? 1 : -1; phase = 'exit'; t0 = now; }

    let x = 0, s = 1, o = 1, blur = 0, warp = 0;
    if (phase === 'exit') {
      const p = Math.min(1, (now - t0) / 520), e = easeIn(p);
      x = -dir * e * 0.3 * innerWidth; s = 1 - 0.35 * e; o = 1 - e; blur = e * 14; warp = e * dir;
      if (p >= 1) { shown = api.target(); tex = getTexture(planets[shown].id); api.shown(shown); phase = 'enter'; t0 = now; }
    } else if (phase === 'enter') {
      const p = Math.min(1, (now - t0) / 1100), e = easeOut(p);
      x = dir * (1 - e) * 0.3 * innerWidth; s = 0.65 + 0.35 * e; o = Math.min(1, e * 1.6); blur = (1 - e) * 14; warp = (1 - e) * dir;
      if (p >= 1) phase = 'idle';
    }
    const p = planets[shown];
    off += (p.spin * dt) / 1000;
    drawPlanet(pctx, sphere, tex, off, p);
    pl.style.transform = `translate(${x - spx * 18}px,${Math.sin(now / 1400) * 8 - spy * 14}px) scale(${p.size * s})`;
    pl.style.opacity = String(o);
    pl.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none';
    stars.draw(bctx, innerWidth, innerHeight, dt, spx, spy, warp);
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener('pointermove', move);
  window.addEventListener('resize', resize);
  resize();
  raf = requestAnimationFrame(frame);
  return () => {
    dead = true; cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('resize', resize);
  };
}
