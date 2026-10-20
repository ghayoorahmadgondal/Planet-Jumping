import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Planet Jumping',
  description: 'Fly through the solar system: all eight planets, drawn live in your browser, with the key facts for each.',
  openGraph: { title: 'Planet Jumping', description: 'Fly through all eight planets of the solar system.', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
