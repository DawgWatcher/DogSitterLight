'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const T = {
  white: '#FFFFFF',
  cream: '#F2F0E6',
  gold: '#FFCA4B',
  plum: '#3E363F',
  muted: 'rgba(62,54,63,0.45)',
  light: 'rgba(62,54,63,0.28)',
  border: 'rgba(62,54,63,0.08)',
} as const;

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 15, 30, 45];
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function parse24(value: string): { hour12: number; minute: number; ampm: 'AM' | 'PM' } {
  if (!value) return { hour12: 12, minute: 0, ampm: 'AM' };
  const [hStr, mStr] = value.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  // Snap to nearest quarter
  const snapped = MINUTES.reduce((prev, curr) =>
    Math.abs(curr - m) < Math.abs(prev - m) ? curr : prev
  );
  return { hour12: h, minute: snapped, ampm };
}

function to24(hour12: number, minute: number, ampm: 'AM' | 'PM'): string {
  let h = hour12;
  if (ampm === 'AM' && h === 12) h = 0;
  else if (ampm === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/* ── Scroll Wheel Column ── */

function WheelColumn<V extends number>({
  items,
  value,
  onChange,
  formatItem,
}: {
  items: V[];
  value: V;
  onChange: (val: V) => void;
  formatItem: (val: V) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScroll = useRef(0);
  const velocity = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const animFrame = useRef(0);
  const suppressSnap = useRef(false);

  const selectedIdx = items.indexOf(value);
  // padding items so selected can be centered
  const padCount = Math.floor(VISIBLE_ITEMS / 2);

  const scrollToIndex = useCallback((idx: number, smooth = false) => {
    const el = containerRef.current;
    if (!el) return;
    const target = idx * ITEM_HEIGHT;
    if (smooth) {
      el.scrollTo({ top: target, behavior: 'smooth' });
    } else {
      el.scrollTop = target;
    }
  }, []);

  // Init scroll position
  useEffect(() => {
    scrollToIndex(selectedIdx < 0 ? 0 : selectedIdx);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const snapToNearest = useCallback(() => {
    const el = containerRef.current;
    if (!el || suppressSnap.current) return;
    const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });
    if (items[clamped] !== value) {
      onChange(items[clamped]);
    }
  }, [items, value, onChange]);

  // Mouse / touch handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    isDragging.current = true;
    suppressSnap.current = true;
    startY.current = e.clientY;
    startScroll.current = el.scrollTop;
    lastY.current = e.clientY;
    lastTime.current = Date.now();
    velocity.current = 0;
    cancelAnimationFrame(animFrame.current);
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const el = containerRef.current;
    if (!el) return;
    const dy = startY.current - e.clientY;
    el.scrollTop = startScroll.current + dy;

    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      velocity.current = (lastY.current - e.clientY) / dt;
    }
    lastY.current = e.clientY;
    lastTime.current = now;
  }, []);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const el = containerRef.current;
    if (!el) return;

    // Momentum
    let v = velocity.current * 8;
    const decel = 0.95;
    const tick = () => {
      if (Math.abs(v) < 0.5) {
        suppressSnap.current = false;
        snapToNearest();
        return;
      }
      el.scrollTop += v;
      v *= decel;
      animFrame.current = requestAnimationFrame(tick);
    };
    if (Math.abs(v) > 1) {
      tick();
    } else {
      suppressSnap.current = false;
      snapToNearest();
    }
  }, [snapToNearest]);

  // Mouse wheel
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop += e.deltaY;
    cancelAnimationFrame(animFrame.current);
    animFrame.current = requestAnimationFrame(() => {
      snapToNearest();
    });
  }, [snapToNearest]);

  // Scroll-end snap for programmatic/native scrolls
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!isDragging.current && !suppressSnap.current) {
          snapToNearest();
        }
      }, 120);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, [snapToNearest]);

  return (
    <div style={{ position: 'relative', height: WHEEL_HEIGHT, overflow: 'hidden', flex: 1 }}>
      {/* Highlight band */}
      <div style={{
        position: 'absolute',
        top: padCount * ITEM_HEIGHT,
        left: 0, right: 0,
        height: ITEM_HEIGHT,
        background: T.gold,
        opacity: 0.18,
        borderRadius: 8,
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      {/* Fade overlays */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: padCount * ITEM_HEIGHT,
        background: `linear-gradient(to bottom, ${T.white}, transparent)`,
        pointerEvents: 'none', zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: padCount * ITEM_HEIGHT,
        background: `linear-gradient(to top, ${T.white}, transparent)`,
        pointerEvents: 'none', zIndex: 2,
      }} />
      {/* Scrollable area */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        style={{
          height: WHEEL_HEIGHT,
          overflowY: 'scroll',
          scrollbarWidth: 'none',
          touchAction: 'none',
          cursor: 'grab',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`.tp-wheel::-webkit-scrollbar{display:none}`}</style>
        <div className="tp-wheel" style={{ height: '100%', overflowY: 'inherit', scrollbarWidth: 'none' }} ref={(el) => {
          // Proxy scroll to parent ref
          if (el && containerRef.current !== el) {
            // Keep only the outer ref
          }
        }}>
          {/* Top padding */}
          <div style={{ height: padCount * ITEM_HEIGHT }} />
          {items.map((item, i) => {
            const isSelected = i === selectedIdx;
            return (
              <div
                key={item}
                onClick={() => {
                  onChange(item);
                  scrollToIndex(i, true);
                }}
                style={{
                  height: ITEM_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: isSelected ? 22 : 18,
                  fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? T.plum : T.muted,
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}
              >
                {formatItem(item)}
              </div>
            );
          })}
          {/* Bottom padding */}
          <div style={{ height: padCount * ITEM_HEIGHT }} />
        </div>
      </div>
    </div>
  );
}

/* ── TimePicker ── */

export default function TimePicker({
  value,
  onChange,
  onClose,
}: {
  value: string; // HH:MM 24h
  onChange: (val: string) => void;
  onClose: () => void;
}) {
  const parsed = parse24(value);
  const [hour, setHour] = useState(parsed.hour12);
  const [minute, setMinute] = useState(parsed.minute);
  const [ampm, setAmpm] = useState(parsed.ampm);

  // Emit on any change
  useEffect(() => {
    const newVal = to24(hour, minute, ampm);
    if (newVal !== value) {
      onChange(newVal);
    }
  }, [hour, minute, ampm]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      background: T.white,
      borderRadius: 16,
      border: `1.5px solid ${T.cream}`,
      padding: '16px 12px 12px',
      marginTop: 8,
      boxShadow: '0 4px 20px rgba(62,54,63,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <WheelColumn
          items={HOURS}
          value={hour}
          onChange={setHour}
          formatItem={(h) => String(h)}
        />
        <div style={{
          fontSize: 28, fontWeight: 700, color: T.plum,
          fontFamily: 'Nunito, sans-serif',
          lineHeight: 1, flexShrink: 0,
        }}>:</div>
        <WheelColumn
          items={MINUTES}
          value={minute}
          onChange={setMinute}
          formatItem={(m) => String(m).padStart(2, '0')}
        />
        {/* AM/PM toggle */}
        <button
          type="button"
          onClick={() => setAmpm(p => p === 'AM' ? 'PM' : 'AM')}
          style={{
            flexShrink: 0,
            width: 56,
            height: 40,
            borderRadius: 999,
            border: `1.5px solid ${T.gold}`,
            background: T.gold,
            color: T.plum,
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          {ampm}
        </button>
      </div>
      {/* Done button */}
      <button
        type="button"
        onClick={onClose}
        style={{
          marginTop: 12,
          width: '100%',
          height: 38,
          borderRadius: 999,
          border: 'none',
          background: T.cream,
          color: T.plum,
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        Done
      </button>
    </div>
  );
}
