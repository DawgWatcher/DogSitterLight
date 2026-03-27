'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const T = {
  white: '#FFFFFF',
  cream: '#F2F0E6',
  gold: '#FFCA4B',
  plum: '#3E363F',
  muted: 'rgba(62,54,63,0.45)',
  light: 'rgba(62,54,63,0.28)',
} as const;

const SECTIONS = [
  { id: 'you', label: 'you' },
  { id: 'dog', label: 'dog' },
  { id: 'service', label: 'service' },
  { id: 'extras', label: 'extras' },
  { id: 'review', label: 'review' },
] as const;

// TopNav: h-14 (56px) mobile, h-16 (64px) desktop
// StepTracker itself is ~56px. Combined ~112–120px.
const TOP_NAV_HEIGHT_MOBILE = 56;

export default function StepTracker({
  sectionRefs,
}: {
  sectionRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer — active section = last section whose top crossed above the observer root margin
  useEffect(() => {
    const refs = sectionRefs.current;
    if (!refs || refs.length === 0) return;

    // Measure tracker height for root margin
    const trackerH = trackerRef.current?.offsetHeight ?? 56;
    const topOffset = TOP_NAV_HEIGHT_MOBILE + trackerH;

    // Track which sections are currently intersecting
    const visible = new Set<number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = refs.indexOf(entry.target as HTMLDivElement);
          if (idx === -1) return;
          if (entry.isIntersecting) {
            visible.add(idx);
          } else {
            visible.delete(idx);
          }
        });
        // Active = highest-index visible section, or keep current if none visible
        if (visible.size > 0) {
          const maxIdx = Math.max(...Array.from(visible));
          setActiveIndex(maxIdx);
        }
      },
      {
        threshold: 0,
        rootMargin: `-${topOffset}px 0px -60% 0px`,
      }
    );

    refs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [sectionRefs]);

  const scrollTo = useCallback((sectionId: string) => {
    const idx = SECTIONS.findIndex((s) => s.id === sectionId);
    const el = sectionRefs.current[idx];
    if (!el) return;
    const trackerH = trackerRef.current?.offsetHeight ?? 56;
    const offset = TOP_NAV_HEIGHT_MOBILE + trackerH + 12;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }, [sectionRefs]);

  // Progress line percentage: activeIndex / (total - 1) * 100
  const progressPct = SECTIONS.length > 1
    ? (activeIndex / (SECTIONS.length - 1)) * 100
    : 0;

  return (
    <div
      ref={trackerRef}
      style={{
        position: 'sticky',
        top: TOP_NAV_HEIGHT_MOBILE,
        zIndex: 40,
        background: T.white,
        padding: '14px 24px 12px',
        borderBottom: `1px solid ${T.cream}`,
        boxShadow: '0 1px 4px rgba(62,54,63,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        {/* Background track */}
        <div style={{
          position: 'absolute', top: 5, left: 0, right: 0, height: 2,
          background: T.cream, borderRadius: 1,
        }} />
        {/* Gold fill */}
        <div style={{
          position: 'absolute', top: 5, left: 0, height: 2,
          background: T.gold, borderRadius: 1,
          width: `${progressPct}%`,
          transition: 'width 0.3s ease',
        }} />
        {/* Dots */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', width: '100%',
          position: 'relative', zIndex: 2,
        }}>
          {SECTIONS.map((s, i) => {
            const isActive = i <= activeIndex;
            return (
              <div
                key={s.id}
                onClick={() => scrollTo(s.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  transition: 'all 0.3s',
                  background: isActive ? T.gold : T.white,
                  border: isActive ? `2px solid ${T.gold}` : `2px solid ${T.plum}`,
                  boxShadow: i === activeIndex ? '0 0 0 3px rgba(255,202,75,0.25)' : 'none',
                }} />
                <span style={{
                  fontSize: 10, fontFamily: 'Nunito, sans-serif', fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: isActive ? T.plum : T.light,
                  transition: 'color 0.3s',
                }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
