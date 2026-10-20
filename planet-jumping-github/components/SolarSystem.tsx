'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { planets } from '@/lib/planets';
import { createScene } from '@/lib/scene';

type Panel = null | 'menu' | 'about' | 'explore' | 'planets';
const TABS = ['about', 'explore', 'planets'] as const;

export default function SolarSystem() {
  const bg = useRef<HTMLCanvasElement>(null);
  const pl = useRef<HTMLCanvasElement>(null);
  const target = useRef(0);
  const [tg, setTg] = useState(0);
  const [shown, setShown] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>('about');
  const [tour, setTour] = useState(false);
  const p = planets[shown];

  const go = useCallback((i: number) => {
    const n = ((i % planets.length) + planets.length) % planets.length;
    target.current = n;
    setTg(n);
  }, []);

  useEffect(() => createScene(bg.current!, pl.current!, { target: () => target.current, shown: setShown }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(target.current + 1);
      else if (e.key === 'ArrowLeft') go(target.current - 1);
      else if (e.key === 'Escape') setPanel(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  useEffect(() => {
    if (!tour) return;
    const id = setInterval(() => go(target.current + 1), 8000);
    return () => clearInterval(id);
  }, [tour, go]);

  const manual = (i: number) => { setTour(false); go(i); };

  return (
    <main className="experience">
      <canvas ref={bg} className="stars" aria-hidden="true" />
      <div className="stage" aria-hidden="true"><canvas ref={pl} className="planet" /></div>

      <header className="header">
        <svg className="logo" viewBox="0 0 36 36" aria-label="Planet Jumping">
          <circle cx="18" cy="18" r="7" fill="#fff" />
          <ellipse cx="18" cy="18" rx="16" ry="6" fill="none" stroke="#fff" strokeWidth="1.6" transform="rotate(-25 18 18)" />
        </svg>
        <div className="controls">
          <button type="button" className="round" aria-label="Previous planet" onClick={() => manual(target.current - 1)}>‹</button>
          <span className="count">{String(tg + 1).padStart(2, '0')} / {String(planets.length).padStart(2, '0')}</span>
          <button type="button" className="round" aria-label="Next planet" onClick={() => manual(target.current + 1)}>›</button>
          <button type="button" className={'tour' + (tour ? ' on' : '')} onClick={() => setTour((t) => !t)}>{tour ? 'Stop tour' : 'Play tour'}</button>
        </div>
        <div className="header-actions">
          <nav className="nav" aria-label="Primary navigation">
            {TABS.map((t) => (
              <a key={t} href={'#' + t} className={tab === t ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTab(t); setPanel(t); }}>
                {t[0].toUpperCase() + t.slice(1)}
              </a>
            ))}
          </nav>
          <button type="button" className="menu" onClick={() => setPanel('menu')}>Menu</button>
        </div>
      </header>

      <aside className="planet-list" aria-label="Planets">
        {planets.map((q, i) => (
          <button key={q.id} type="button" className={'planet-item' + (i === tg ? ' active' : '')} onClick={() => manual(i)}>{q.name}</button>
        ))}
      </aside>

      <section className="content" aria-live="polite">
        <h1 key={'t' + p.id}>{p.name.toUpperCase()}</h1>
        <div className="info" key={'i' + p.id}>
          <p className="blurb">{p.blurb}</p>
          <dl>
            {p.facts.map(([k, v]) => (
              <div className="fact" key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {panel && (
        <div className="overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && setPanel(null)}>
          <div className="overlay-card">
            <button type="button" className="overlay-close" onClick={() => setPanel(null)}>Close</button>
            {(panel === 'menu' || panel === 'about') && (
              <section><h2>About</h2><p>Planet Jumping is a journey through the solar system. Every planet is drawn live in your browser, with its own surface, spin and key facts.</p></section>
            )}
            {(panel === 'menu' || panel === 'explore') && (
              <section><h2>Explore</h2><p>Use the arrows, the planet list or the ← → keys to travel. Move your pointer to shift the view. Press Play tour to visit all eight planets automatically.</p></section>
            )}
            {(panel === 'menu' || panel === 'planets') && (
              <section>
                <h2>Planets</h2>
                <ul>{planets.map((q, i) => (
                  <li key={q.id}><button type="button" className={i === tg ? 'on' : ''} onClick={() => { manual(i); setPanel(null); }}>{q.name}</button></li>
                ))}</ul>
              </section>
            )}
            {panel === 'menu' && (
              <button type="button" className="overlay-action" onClick={() => { setTour(true); setPanel(null); }}>Start tour</button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
