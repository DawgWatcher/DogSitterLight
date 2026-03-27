'use client';

import { usePathname } from 'next/navigation';
import TopNav from './TopNav';
import BottomNav from './BottomNav';
import Footer from './Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isGallery = pathname === '/gallery';

  return (
    <>
      <TopNav isHome={isHome} />
      <main className={isGallery ? 'md:pb-0' : 'pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0'}>
        {children}
      </main>
      <Footer />
      <BottomNav isGallery={isGallery} />
    </>
  );
}
