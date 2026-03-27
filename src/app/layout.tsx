import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import AppShell from '@/components/AppShell';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Pup Pad',
  description: 'Kennel-free dog boarding and pet care in Central New Jersey. Book your visit.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="font-nunito">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
