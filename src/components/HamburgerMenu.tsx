'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Bookings', href: '/bookings' },
  { label: 'Contact', href: '/contact' },
];

export default function HamburgerMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-cream shadow-xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center"
          onClick={onClose}
          aria-label="Close menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#3E363F" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        </button>

        <div className="flex flex-col pt-16 px-6">
          {/* Nav items */}
          <nav className="flex flex-col gap-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`text-lg font-bold transition-colors ${
                    isActive ? 'text-gold' : 'text-plum'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-6 border-t border-[rgba(62,54,63,0.1)]" />

          {/* Contact info */}
          <div className="flex flex-col gap-3 text-sm text-plum">
            <a href="tel:9089026008" className="font-normal">
              908-902-6008
            </a>
            <p className="font-normal">7am - 7pm</p>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-[rgba(62,54,63,0.1)]" />

          {/* Social links */}
          <div className="flex flex-col gap-3 text-sm text-plum font-normal">
            <a
              href="https://instagram.com/thepuppadnj"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram @thepuppadnj
            </a>
            <a
              href="https://facebook.com/ThePupPad"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook - The Pup Pad
            </a>
            <a
              href="https://tiktok.com/@thepuppad"
              target="_blank"
              rel="noopener noreferrer"
            >
              TikTok @thepuppad
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
