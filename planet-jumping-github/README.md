# Planet Jumping (Next.js)

Immersive space portal experience built with Next.js 14 (App Router), React and TypeScript. The 3D window, tilt and planet-to-planet travel are drawn on a canvas, with no extra libraries.

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Deploy on Vercel
Push this folder to GitHub, import the repository on vercel.com (framework: Next.js is detected automatically) and click Deploy.

## Structure
- `app/` layout, page and global styles
- `components/PlanetJumping.tsx` markup and React state (current planet, facts, planet list)
- `lib/engine.ts` preloader, canvas portal mask, travel transition, cursor
- `lib/planets.ts` planet data and asset URLs

## Notes
- Videos and images load from remote URLs in `lib/planets.ts`. Download them into `public/` and point the URLs there so the site never breaks.
- Replace the logo with your own before sharing.
