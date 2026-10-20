# Planet Jumping

A journey through all eight planets of the solar system, built with Next.js 14 (App Router), React and TypeScript. Every planet is drawn live on a canvas, with no videos and no extra libraries.

## Run
```bash
npm install
npm run dev      # http://localhost:3000
```

## Deploy on Vercel
Push to GitHub, import the repository on vercel.com and click Deploy.

## Use
Arrows, the planet list or the left/right keys travel between planets. Play tour visits all eight automatically, which is handy for screen recordings.

## Structure
- `components/SolarSystem.tsx` interface and buttons
- `lib/scene.ts` flight transitions, floating motion, pointer parallax
- `lib/render.ts` procedural planet textures, lit rotating sphere, Saturn's rings, starfield
- `lib/planets.ts` facts for each planet
