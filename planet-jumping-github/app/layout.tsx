import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Planet Jumping',
  description: 'An immersive space portal experience: step through a canvas-driven 3D window and travel from planet to planet.',
  openGraph: { title: 'Planet Jumping', description: 'An immersive space portal experience built with Next.js and canvas.', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
