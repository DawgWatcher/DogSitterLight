'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

const CLIPS = [
  '/gallery/clip-01.mp4',
  '/gallery/clip-02.mp4',
  '/gallery/clip-03.mp4',
  '/gallery/clip-04.mp4',
  '/gallery/clip-05.mp4',
  '/gallery/clip-06.mp4',
  '/gallery/clip-07.mp4',
];

const SCROLL_MULTIPLIER = 4; // Each clip = 4x viewport height
const SNAP_THRESHOLD = 0.5;
const SCROLL_IDLE_MS = 150;

export default function ScrollVideoGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const rafId = useRef<number>(0);
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout>>();
  const isSnapping = useRef(false);
  const lastScrollTop = useRef(0);
  const [loadedClips, setLoadedClips] = useState<Set<number>>(() => new Set([0, 1]));
  const [readyClips, setReadyClips] = useState<Set<number>>(() => new Set());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Get clip region dimensions
  const getClipRegion = useCallback((index: number) => {
    const vh = window.innerHeight;
    // Top nav: h-14 = 56px on mobile
    const navHeight = 56;
    const viewportHeight = vh - navHeight;
    const regionHeight = viewportHeight * SCROLL_MULTIPLIER;
    const regionStart = index * regionHeight;
    return { regionStart, regionHeight, viewportHeight, navHeight };
  }, []);

  // Snap to clip boundary
  const snapToClip = useCallback((clipIndex: number) => {
    const { regionStart } = getClipRegion(clipIndex);
    const clampedIndex = Math.max(0, Math.min(clipIndex, CLIPS.length - 1));
    const target = getClipRegion(clampedIndex).regionStart;
    isSnapping.current = true;
    window.scrollTo({ top: target === regionStart ? target : getClipRegion(clampedIndex).regionStart, behavior: 'smooth' });
    // Reset snapping flag after animation
    setTimeout(() => { isSnapping.current = false; }, 500);
  }, [getClipRegion]);

  // Determine which clips to load based on scroll position
  const updateLoadedClips = useCallback(() => {
    const scrollTop = window.scrollY;
    const { regionHeight } = getClipRegion(0);
    const currentIndex = Math.floor(scrollTop / regionHeight);
    const clamped = Math.max(0, Math.min(currentIndex, CLIPS.length - 1));

    setLoadedClips(prev => {
      const next = new Set<number>();
      // Load current and next clip
      next.add(clamped);
      if (clamped + 1 < CLIPS.length) next.add(clamped + 1);
      // Also keep previous if close
      if (clamped - 1 >= 0) next.add(clamped - 1);

      // Check if same set
      if (prev.size === next.size && Array.from(next).every(v => prev.has(v))) return prev;
      return next;
    });
  }, [getClipRegion]);

  // Unload clips that are far away
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (loadedClips.has(i)) {
        if (!video.src || !video.src.endsWith(CLIPS[i])) {
          video.src = CLIPS[i];
          video.load();
        }
      } else {
        if (video.src) {
          video.removeAttribute('src');
          video.load();
          setReadyClips(prev => {
            if (!prev.has(i)) return prev;
            const next = new Set(prev);
            next.delete(i);
            return next;
          });
        }
      }
    });
  }, [loadedClips]);

  // Handle canplay events
  const handleCanPlay = useCallback((index: number) => {
    setReadyClips(prev => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // Scroll handler — maps scroll position to video.currentTime (downward only)
  const handleScroll = useCallback(() => {
    if (prefersReducedMotion) return;

    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const scrollingDown = scrollTop > lastScrollTop.current;
      lastScrollTop.current = scrollTop;

      const { regionHeight } = getClipRegion(0);

      for (let i = 0; i < CLIPS.length; i++) {
        const { regionStart } = getClipRegion(i);
        const progress = (scrollTop - regionStart) / regionHeight;

        if (progress >= 0 && progress <= 1) {
          const video = videoRefs.current[i];
          if (video && video.duration && scrollingDown) {
            video.currentTime = Math.min(progress * video.duration, video.duration);
          }
          break;
        }
      }

      updateLoadedClips();
    });

    // Snap on scroll idle (desktop)
    if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
    if (!isSnapping.current) {
      scrollIdleTimer.current = setTimeout(() => {
        if (isSnapping.current) return;
        const scrollTop = window.scrollY;
        const { regionHeight } = getClipRegion(0);
        const currentIndex = Math.floor(scrollTop / regionHeight);
        const clamped = Math.max(0, Math.min(currentIndex, CLIPS.length - 1));
        const { regionStart } = getClipRegion(clamped);
        const progress = (scrollTop - regionStart) / regionHeight;

        if (progress >= SNAP_THRESHOLD && clamped + 1 < CLIPS.length) {
          snapToClip(clamped + 1);
        } else if (progress > 0.01) {
          snapToClip(clamped);
        }
      }, SCROLL_IDLE_MS);
    }
  }, [prefersReducedMotion, getClipRegion, updateLoadedClips, snapToClip]);

  // Touch end handler — snap on mobile
  const handleTouchEnd = useCallback(() => {
    if (prefersReducedMotion || isSnapping.current) return;

    // Small delay to let scroll momentum settle
    setTimeout(() => {
      if (isSnapping.current) return;
      const scrollTop = window.scrollY;
      const { regionHeight } = getClipRegion(0);
      const currentIndex = Math.floor(scrollTop / regionHeight);
      const clamped = Math.max(0, Math.min(currentIndex, CLIPS.length - 1));
      const { regionStart } = getClipRegion(clamped);
      const progress = (scrollTop - regionStart) / regionHeight;

      if (progress >= SNAP_THRESHOLD && clamped + 1 < CLIPS.length) {
        snapToClip(clamped + 1);
      } else if (progress > 0.01) {
        snapToClip(clamped);
      }
    }, 100);
  }, [prefersReducedMotion, getClipRegion, snapToClip]);

  // Attach/detach event listeners
  useEffect(() => {
    if (prefersReducedMotion) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Initialize loaded clips
    updateLoadedClips();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(rafId.current);
      if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
    };
  }, [handleScroll, handleTouchEnd, updateLoadedClips, prefersReducedMotion]);

  // Reduced motion: static stack
  if (prefersReducedMotion) {
    return (
      <div>
        {CLIPS.map((clip, i) => (
          <div
            key={i}
            className="w-full bg-[#3E363F]"
            style={{ height: 'calc(100vh - 56px)' }}
          >
            <video
              className="w-full h-full object-cover"
              src={clip}
              muted
              playsInline
              preload="metadata"
              ref={el => { videoRefs.current[i] = el; }}
              onLoadedMetadata={() => {
                const video = videoRefs.current[i];
                if (video) video.currentTime = 0;
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  // Total scroll height = clips * 4 viewports
  // Each clip has a scroll region and a sticky video inside
  return (
    <div ref={containerRef}>
      {CLIPS.map((clip, i) => {
        const isReady = readyClips.has(i);
        return (
          <div
            key={i}
            style={{ height: 'calc((100vh - 56px) * 4)' }}
            className="relative"
          >
            <div
              className="sticky w-full bg-[#3E363F]"
              style={{
                top: '56px',
                height: 'calc(100vh - 56px)',
              }}
            >
              <video
                ref={el => { videoRefs.current[i] = el; }}
                className="w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: isReady ? 1 : 0 }}
                muted
                playsInline
                preload="auto"
                onCanPlay={() => handleCanPlay(i)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
