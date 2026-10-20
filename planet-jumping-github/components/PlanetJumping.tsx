'use client';

import { useEffect, useRef, useState } from 'react';

type Panel = null | 'menu' | 'about' | 'explore' | 'planets';
import { flushSync } from 'react-dom';
import { ASSETS, planets, states, type Planet } from '@/lib/planets';
import { initExperience } from '@/lib/engine';

export default function PlanetJumping() {
  const root = useRef<HTMLElement>(null);
  const currentRef = useRef<Planet>('mars');
  const [current, setCurrent] = useState<Planet>('mars');
  const s = states[current];
  const [panel, setPanel] = useState<Panel>(null);
  const [tab, setTab] = useState<'about' | 'explore' | 'planets'>('about');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    return initExperience(root.current!, {
      get: () => currentRef.current,
      set: (p) => {
        currentRef.current = p;
        flushSync(() => setCurrent(p));
      },
    });
  }, []);

  useEffect(() => {
    const pv = document.getElementById('portal-video') as HTMLVideoElement | null;
    if (!pv) return;
    if (s.image) pv.pause();
    else pv.play().catch(() => {});
  }, [s]);

  const bg = (id: string) => 'background' + (s.background === id ? ' is-visible' : '');

  return (
    <main ref={root} className="experience" data-planet={current}>
      <div className="backgrounds" aria-hidden="true">
        <video id="mars-background" className={bg('mars-background')} src={ASSETS.MARS_BG} muted playsInline preload="auto" />
        <video id="earth-background" className={bg('earth-background')} src={ASSETS.TO_EARTH} muted playsInline preload="auto" />
        <video id="venus-background" className={bg('venus-background')} src={ASSETS.TO_VENUS} muted playsInline preload="auto" />
      </div>
      <div className="preloader" id="preloader" aria-label="Loading Mars">
        <video id="preloader-video" src={ASSETS.TO_MARS} muted playsInline preload="auto" />
        <div className="preloader-shade" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="floating-logo" id="floating-logo" src={ASSETS.LOGO} alt="Planet Jumping logo" />
      <div className="preloader-count" id="preloader-count" aria-live="polite">
        <span id="preloader-value">0</span>
        <span className="percent">%</span>
      </div>
      <canvas id="scene-canvas" className="scene-canvas" aria-hidden="true" />
      <div className="shade" aria-hidden="true" />

      <header className="header chrome">
        <div className="header-actions">
          <nav className="nav" aria-label="Primary navigation">
            {(['about', 'explore', 'planets'] as const).map((t) => (
              <a key={t} href={'#' + t} className={tab === t ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab(t); setPanel(t); }}>
                {t[0].toUpperCase() + t.slice(1)}
              </a>
            ))}
          </nav>
          <button className="menu" type="button" onClick={() => setPanel('menu')}>Menu</button>
        </div>
      </header>

      <aside className="planet-list chrome" aria-label="Planets">
        {planets.map((p) => (
          <span key={p} className={'planet-item' + (p === s.name ? ' active' : '')}>{p}</span>
        ))}
      </aside>

      <canvas id="portal-canvas" className="portal-canvas" aria-hidden="true" />
      <section className="portal-wrap chrome" aria-label="Next destination">
        <div className="portal-heading">
          <span>Next:</span>
          <span>
            <span id="next-number">{s.number}</span> <strong id="next-name">{s.next}</strong>
          </span>
        </div>
        <button className="portal" id="portal" type="button" aria-label={`Travel to ${s.next}`}>
          <video id="portal-video" src={s.portal ?? ASSETS.TO_EARTH} style={{ display: s.image ? 'none' : '' }} muted playsInline loop preload="auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img id="portal-image" src={ASSETS.MERCURY} alt="Mercury" style={{ display: s.image ? '' : 'none' }} />
        </button>
      </section>

      <section className="planet-content chrome" aria-live="polite">
        <h1 id="planet-title">{s.name.toUpperCase()}</h1>
        <dl id="facts">
          {s.facts.map(([k, v]) => (
            <div className="fact" key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="transition-layer" aria-hidden="true">
        <video id="transition-video" muted playsInline preload="auto" />
      </div>
      <div className="loading" aria-hidden="true">Preparing orbit…</div>
      {panel && (
        <div className="overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setPanel(null)}>
          <div className="overlay-card">
            <button className="overlay-close" type="button" onClick={() => setPanel(null)}>Close</button>
            {(panel === 'menu' || panel === 'about') && (
              <section><h2>About</h2><p>Planet Jumping is an immersive space portal experience. A canvas-drawn 3D window tilts with your pointer and expands into a full-screen flight to the next planet.</p></section>
            )}
            {(panel === 'menu' || panel === 'explore') && (
              <section><h2>Explore</h2><p>Move your pointer over the window to tilt it. Click or tap the window to travel to the next planet. Mars leads to Earth, and Earth to Venus.</p></section>
            )}
            {(panel === 'menu' || panel === 'planets') && (
              <section><h2>Planets</h2><ul>{planets.map((p) => <li key={p} className={p === s.name ? 'on' : ''}>{p}</li>)}</ul></section>
            )}
            {panel === 'menu' && <button className="overlay-restart" type="button" onClick={() => location.reload()}>Restart journey</button>}
          </div>
        </div>
      )}
      <div className="custom-cursor" aria-hidden="true">
        <span className="cursor-orbit" />
        <span className="cursor-dot" />
        <span className="cursor-label">Enter</span>
      </div>
    </main>
  );
}
