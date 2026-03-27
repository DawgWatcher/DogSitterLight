'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex flex-col bg-plum overflow-hidden">
      {/* Background video */}
      {!reducedMotion && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(62,54,63,0.35), rgba(62,54,63,0.55))',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center flex-1 pt-28 md:pt-36">
        {/* Promo badge */}
        <div className="mb-6 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-[12px] border border-white/20">
          <span className="text-gold font-semibold text-sm md:text-base">
            First Night Free — For first-time customers
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center font-extrabold text-white uppercase leading-[1.1] tracking-tight px-5">
          <span className="block text-[36px] md:text-[56px] lg:text-[72px]">
            A Kennel-Free
          </span>
          <span className="block text-[36px] md:text-[56px] lg:text-[72px]">
            Paradise.
          </span>
        </h1>

        {/* Photo band */}
        <div className="w-full mt-8 md:mt-12">
          <img
            src="/photo-band.png"
            alt="Inside ThePupPad — navy walls, yellow doors, dogs playing freely in the open facility"
            className="w-full h-[200px] md:h-[320px] lg:h-[400px] object-cover"
          />
        </div>

        {/* Subline */}
        <p className="mt-8 md:mt-10 text-white text-center text-base md:text-lg font-normal px-5">
          Where every pup plays freely and stays in comfort.
        </p>

        {/* Primary CTA */}
        <div className="mt-8 w-full px-5 md:w-auto md:px-0">
          <Link
            href="/bookings"
            className="block w-full md:w-auto md:inline-block text-center bg-gold hover:bg-gold-hover text-plum font-bold text-base md:text-lg py-3.5 px-10 rounded-full min-h-[48px] transition-colors focus:outline-2 focus:outline-gold"
          >
            BOOK THEIR STAY
          </Link>
        </div>

        {/* Secondary link */}
        <a
          href="#meet-our-team"
          className="mt-4 mb-12 text-white/90 underline underline-offset-4 text-sm md:text-base font-normal hover:text-white transition-colors focus:outline-2 focus:outline-gold"
        >
          Meet Our Team
        </a>
      </div>
    </section>
  );
}
