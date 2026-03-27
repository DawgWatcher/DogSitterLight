'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HomeIcon from './icons/HomeIcon';
import ServicesIcon from './icons/ServicesIcon';
import GalleryIcon from './icons/GalleryIcon';
import BookingsIcon from './icons/BookingsIcon';
import ContactIcon from './icons/ContactIcon';

const NAV_ITEMS = [
  { label: 'Home', href: '/', Icon: HomeIcon },
  { label: 'Services', href: '/services', Icon: ServicesIcon },
  { label: 'Gallery', href: '/gallery', Icon: GalleryIcon },
  { label: 'Bookings', href: '/bookings', Icon: BookingsIcon },
  { label: 'Contact', href: '/contact', Icon: ContactIcon },
];

export default function BottomNav({ isGallery = false }: { isGallery?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${
        isGallery
          ? 'bg-white/70 backdrop-blur-sm'
          : 'bg-white border-t border-[rgba(62,54,63,0.1)]'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 min-h-[48px] py-1.5 transition-colors ${
                isActive ? 'text-gold' : 'text-plum'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-semibold mt-0.5 leading-tight">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
