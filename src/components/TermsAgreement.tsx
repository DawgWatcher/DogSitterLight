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

const AGREEMENT_TEXT = `ThePupPad Service Agreement

By submitting this booking request, you acknowledge and agree to the following:

1. Kennel-Free Environment. ThePupPad operates as a kennel-free, in-home pet care service. Your dog will be supervised in a home environment, not a commercial facility. Dogs may interact with other dogs and household members during their stay.

2. Vaccination Requirement. All dogs must be current on Rabies, Distemper/Parvo, and Bordetella vaccinations. You may be asked to provide proof of vaccination before or at drop-off. Dogs without current vaccinations may be declined service.

3. Health & Behavior Disclosure. You agree to disclose any known medical conditions, allergies, medications, behavioral concerns, or recent illness/surgery at the time of booking. Failure to disclose may result in service cancellation without refund.

4. Emergency Authorization. In the event of a medical emergency, ThePupPad is authorized to seek veterinary care for your dog. You are responsible for all emergency veterinary costs incurred. ThePupPad will make reasonable efforts to contact you before seeking treatment.

5. Cancellation Policy. Cancellations made less than 24 hours before the scheduled drop-off time are subject to a cancellation fee equal to one day of the booked service. No-shows are charged the full booking amount.

6. Liability Limitation. ThePupPad exercises reasonable care in supervising all dogs. However, ThePupPad is not liable for injury, illness, or property damage arising from normal dog behavior, pre-existing conditions, or undisclosed health/behavioral issues.

7. Pickup & Drop-off. You agree to arrive within the scheduled pickup and drop-off windows. Dogs not picked up within 2 hours of the scheduled pickup time will be charged an additional overnight boarding fee at the standard rate.

8. Payment. Payment is collected at the time of service unless otherwise arranged. Pricing is as quoted at the time of booking and includes applicable NJ sales tax.`;

export default function TermsAgreement({
  accepted,
  onAcceptedChange,
}: {
  accepted: boolean;
  onAcceptedChange: (val: boolean) => void;
}) {
  const [canCheck, setCanCheck] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Detect scroll-to-bottom via Intersection Observer on a sentinel div
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollRef.current;
    if (!sentinel || !container) return;

    // Short document fallback: if content doesn't overflow, enable immediately
    if (container.scrollHeight <= container.clientHeight) {
      setCanCheck(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCanCheck(true);
          observer.disconnect();
        }
      },
      { root: container, threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleToggle = useCallback(() => {
    if (canCheck) onAcceptedChange(!accepted);
  }, [canCheck, accepted, onAcceptedChange]);

  return (
    <div style={{ marginTop: 20 }}>
      {/* Scrollable agreement */}
      <div
        ref={scrollRef}
        style={{
          height: 220,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          background: T.cream,
          borderRadius: 12,
          padding: '16px 18px',
          fontSize: 12,
          fontFamily: 'Nunito, sans-serif',
          color: T.plum,
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          border: `1px solid ${T.border}`,
        }}
      >
        {AGREEMENT_TEXT}
        {/* Sentinel for intersection observer */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>

      {/* Hint to scroll */}
      {!canCheck && (
        <div style={{
          fontSize: 11,
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 600,
          color: T.muted,
          textAlign: 'center',
          marginTop: 8,
        }}>
          Scroll to bottom to continue
        </div>
      )}

      {/* Checkbox */}
      <div
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 14,
          cursor: canCheck ? 'pointer' : 'not-allowed',
          opacity: canCheck ? 1 : 0.45,
          transition: 'opacity 0.2s',
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          border: `1.5px solid ${accepted ? T.gold : T.light}`,
          background: accepted ? T.gold : T.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}>
          {accepted && (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke={T.plum} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span style={{
          fontSize: 13,
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 600,
          color: canCheck ? T.plum : T.muted,
        }}>
          I have read and agree to the service agreement
        </span>
      </div>
    </div>
  );
}
