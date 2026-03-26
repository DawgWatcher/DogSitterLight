'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SERVICES, ADDONS, SERVICE_OPTIONS, type ServiceKey } from '@/lib/pricing';
import type { BookingPayload, DogEntry, ClientInfo, CartSummary, CartLineItem } from '@/lib/types';

/* ── Design Tokens (60/30/10) ── */
const T = {
  white: '#FFFFFF',
  cream: '#F2F0E6',
  gold: '#FFCA4B',
  espresso: '#2C1F14',
  muted: 'rgba(44,31,20,0.45)',
  light: 'rgba(44,31,20,0.28)',
  border: 'rgba(44,31,20,0.08)',
} as const;

const NJ_TAX_RATE = 0.06625;

const SECTIONS = [
  { id: 'you', label: 'you' },
  { id: 'dog', label: 'dog' },
  { id: 'service', label: 'service' },
  { id: 'extras', label: 'extras' },
  { id: 'review', label: 'review' },
] as const;

/* ── Helpers ── */

let dogCounter = 0;
function nextDogId(): string {
  dogCounter += 1;
  return `dog-${Date.now()}-${dogCounter}`;
}

function createDog(): DogEntry {
  return {
    id: nextDogId(),
    name: '',
    service: '',
    dropoffDate: '',
    dropoffTime: '',
    pickupDate: '',
    pickupTime: '',
    daycareDate: '',
    daycareDropoffTime: '',
    daycarePickupTime: '',
    appointmentDate: '',
    appointmentTime: '',
    bath: false,
  };
}

function buildCart(dogs: DogEntry[], pickupService: boolean, dropoffService: boolean): CartSummary & { tax: number; grandTotal: number } {
  const lineItems: CartLineItem[] = dogs
    .filter(d => d.service !== '')
    .map(d => {
      const svc = SERVICES[d.service as ServiceKey];
      let servicePrice = svc.price;

      if (d.service === 'boarding' && d.dropoffDate && d.pickupDate) {
        const dropoff = new Date(d.dropoffDate + 'T00:00:00');
        const pickup = new Date(d.pickupDate + 'T00:00:00');
        const msPerDay = 1000 * 60 * 60 * 24;
        const nights = Math.max(1, Math.round((pickup.getTime() - dropoff.getTime()) / msPerDay));
        servicePrice = svc.price * nights;
      }

      return {
        dogName: d.name || 'Unnamed',
        service: svc.label,
        servicePrice,
        bathPrice: d.bath ? ADDONS.bath.price : 0,
      };
    });

  const subtotal = lineItems.reduce((sum, li) => sum + li.servicePrice + li.bathPrice, 0);
  const pickupPrice = pickupService ? ADDONS.pickup.price : 0;
  const dropoffPrice = dropoffService ? ADDONS.dropoff.price : 0;
  const total = subtotal + pickupPrice + dropoffPrice;
  const tax = Math.round(total * NJ_TAX_RATE * 100) / 100;
  const grandTotal = Math.round((total + tax) * 100) / 100;

  return { lineItems, subtotal, pickupPrice, dropoffPrice, total, tax, grandTotal };
}

/* ── Canvas draw function (no React — pure imperative) ── */

function drawHeroFrame(ctx: CanvasRenderingContext2D, w: number, h: number, scrollTop: number) {
  const maxScroll = 400;
  const p = Math.min(scrollTop / maxScroll, 1);

  ctx.clearRect(0, 0, w, h);

  // Sky
  const skyR = Math.round(242 - p * 30);
  const skyG = Math.round(240 - p * 25);
  const skyB = Math.round(230 - p * 40);
  ctx.fillStyle = `rgb(${skyR},${skyG},${skyB})`;
  ctx.fillRect(0, 0, w, h);

  // Sun
  const sunY = 160 - p * 100;
  const sunR = 35 + p * 15;
  ctx.fillStyle = '#FFCA4B';
  ctx.beginPath();
  ctx.arc(280 - p * 50, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,202,75,0.08)';
  ctx.beginPath();
  ctx.arc(280 - p * 50, sunY, sunR + 25 + p * 15, 0, Math.PI * 2);
  ctx.fill();

  // Hills
  const hillPeak = 280 + p * 30;
  ctx.fillStyle = `rgb(${Math.round(80 - p * 20)},${Math.round(100 - p * 20)},${Math.round(70 - p * 20)})`;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.quadraticCurveTo(90, hillPeak - 50, 180, hillPeak);
  ctx.quadraticCurveTo(270, hillPeak + 35, w, hillPeak + 15);
  ctx.lineTo(w, h);
  ctx.fill();

  ctx.fillStyle = `rgb(${Math.round(100 - p * 25)},${Math.round(130 - p * 25)},${Math.round(85 - p * 25)})`;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.quadraticCurveTo(130, hillPeak + 25, 220, hillPeak + 40);
  ctx.quadraticCurveTo(310, hillPeak + 65, w, hillPeak + 50);
  ctx.lineTo(w, h);
  ctx.fill();

  // Grass
  const grassY = hillPeak + 40 + p * 8;
  ctx.fillStyle = `rgb(${Math.round(120 - p * 30)},${Math.round(155 - p * 30)},${Math.round(100 - p * 30)})`;
  ctx.fillRect(0, grassY, w, h - grassY);

  // House
  const houseX = 150 + p * 8;
  const houseY = grassY - 65 + p * 12;
  ctx.fillStyle = '#F2F0E6';
  ctx.fillRect(houseX, houseY, 60, 45);
  ctx.fillStyle = '#2C1F14';
  ctx.beginPath();
  ctx.moveTo(houseX - 6, houseY);
  ctx.lineTo(houseX + 30, houseY - 25 + p * 4);
  ctx.lineTo(houseX + 66, houseY);
  ctx.fill();
  ctx.fillStyle = '#FFCA4B';
  ctx.fillRect(houseX + 22, houseY + 20, 16, 25);

  // Dog — walks from far left toward the house
  const dogX = 40 + p * 100;
  const dogY = grassY - 14 + p * 4;
  ctx.fillStyle = '#C49A2E';
  ctx.beginPath();
  ctx.ellipse(dogX, dogY, 15, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(dogX + 13, dogY - 7, 7, 0, Math.PI * 2);
  ctx.fill();
  // Eye
  ctx.fillStyle = '#2C1F14';
  ctx.beginPath();
  ctx.arc(dogX + 16, dogY - 8, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // Tail wag
  const tailWag = Math.sin(p * Math.PI * 6) * 8;
  ctx.strokeStyle = '#C49A2E';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(dogX - 13, dogY - 4);
  ctx.quadraticCurveTo(dogX - 22, dogY - 17 + tailWag, dogX - 18, dogY - 21 + tailWag);
  ctx.stroke();

  // Person walking the dog
  const personX = dogX - 30;
  const personY = grassY - 40 + p * 4;
  // Body
  ctx.strokeStyle = '#5C3D2E';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  // Torso
  ctx.beginPath();
  ctx.moveTo(personX, personY);
  ctx.lineTo(personX, personY + 25);
  ctx.stroke();
  // Head
  ctx.fillStyle = '#E8A898';
  ctx.beginPath();
  ctx.arc(personX, personY - 6, 6, 0, Math.PI * 2);
  ctx.fill();
  // Legs (walking motion)
  const legSwing = Math.sin(p * Math.PI * 8) * 6;
  ctx.strokeStyle = '#2C1F14';
  ctx.beginPath();
  ctx.moveTo(personX, personY + 25);
  ctx.lineTo(personX - 4 + legSwing, personY + 40);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(personX, personY + 25);
  ctx.lineTo(personX + 4 - legSwing, personY + 40);
  ctx.stroke();
  // Arm holding leash
  ctx.strokeStyle = '#5C3D2E';
  ctx.beginPath();
  ctx.moveTo(personX, personY + 8);
  ctx.lineTo(personX + 10, personY + 16);
  ctx.stroke();
  // Leash
  ctx.strokeStyle = '#C49A2E';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(personX + 10, personY + 16);
  ctx.quadraticCurveTo(personX + 20, personY + 22, dogX - 12, dogY - 2);
  ctx.stroke();

  // Darken overlay
  ctx.fillStyle = `rgba(0,0,0,${0.1 + p * 0.3})`;
  ctx.fillRect(0, 0, w, h);
}

/* ── Primitives ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.15em',
      color: T.muted, textTransform: 'uppercase', marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function GoldDivider() {
  return <div style={{ height: 1, background: T.gold, margin: '8px 0 28px', opacity: 0.4 }} />;
}

function FormField({
  label, placeholder, type = 'text', value, onChange, onCream = false, required = false,
}: {
  label: string; placeholder: string; type?: string;
  value: string; onChange: (val: string) => void; onCream?: boolean; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const borderIdle = onCream ? T.border : T.cream;
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontFamily: 'monospace', color: T.muted, marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 46, borderRadius: 10,
          border: `1.5px solid ${focused ? T.gold : borderIdle}`,
          background: T.white, padding: '0 14px', fontSize: 15,
          color: T.espresso, outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
      />
    </div>
  );
}

function ServiceCard({
  label, price, unit, popular = false, selected, onSelect,
}: {
  label: string; price: number; unit: string;
  popular?: boolean; selected: boolean; onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: selected ? T.white : T.cream,
        border: selected ? `2px solid ${T.gold}` : '1.5px solid transparent',
        borderRadius: 12, padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: selected ? T.gold : 'transparent',
        border: selected ? `2px solid ${T.gold}` : `1.5px solid ${T.light}`,
      }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15, color: T.espresso, fontWeight: selected ? 500 : 400 }}>{label}</span>
        {popular && (
          <span style={{
            background: T.gold, color: T.espresso, fontSize: 9,
            fontFamily: 'monospace', padding: '3px 8px', borderRadius: 6,
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>Popular</span>
        )}
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: selected ? T.espresso : T.muted }}>
          {price === 0 ? 'Free' : `$${price}`}
        </span>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: T.light }}>{unit}</div>
      </div>
    </div>
  );
}

function ToggleCard({
  label, subtitle, price, checked, onToggle,
}: {
  label: string; subtitle: string; price: number;
  checked: boolean; onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        background: checked ? T.white : T.cream,
        border: checked ? `2px solid ${T.gold}` : '1.5px solid transparent',
        borderRadius: 12, padding: 16,
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer', transition: 'all 0.15s', marginBottom: 8,
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        border: `1.5px solid ${checked ? T.gold : T.light}`,
        background: checked ? T.gold : T.white,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke={T.espresso} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, color: T.espresso, fontWeight: checked ? 500 : 400 }}>{label}</div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{subtitle}</div>
      </div>
      <span style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: checked ? T.espresso : T.muted }}>${price}</span>
    </div>
  );
}

function ProgressNav({ activeIndex, scrollPercent }: { activeIndex: number; scrollPercent: number }) {
  return (
    <div style={{
      flexShrink: 0, background: T.white, padding: '0 24px 12px',
      borderBottom: `1px solid ${T.cream}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: T.cream, transform: 'translateY(-50%)', borderRadius: 1 }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, height: 2, background: T.gold, transform: 'translateY(-50%)', borderRadius: 1, width: `${scrollPercent}%`, transition: 'width 0.3s ease' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2 }}>
          {SECTIONS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', transition: 'all 0.3s',
                background: i <= activeIndex ? T.gold : T.white,
                border: `2px solid ${i <= activeIndex ? T.gold : T.cream}`,
                boxShadow: i === activeIndex ? '0 0 0 3px rgba(255,202,75,0.25)' : 'none',
              }} />
              <span style={{
                fontSize: 9, fontFamily: 'monospace', whiteSpace: 'nowrap',
                color: i <= activeIndex ? T.espresso : T.light,
                transition: 'color 0.3s',
              }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */

export default function BookingForm() {
  const [client, setClient] = useState<ClientInfo>({ name: '', email: '', phone: '' });
  const [dogs, setDogs] = useState<DogEntry[]>([createDog()]);
  const [pickupService, setPickupService] = useState(false);
  const [dropoffService, setDropoffService] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);
  const [heroTextOpacity, setHeroTextOpacity] = useState(1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const updateDog = useCallback((idx: number, field: keyof DogEntry, value: string | boolean) => {
    setDogs(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  }, []);

  const addDog = useCallback(() => {
    setDogs(prev => [...prev, createDog()]);
  }, []);

  const cart = buildCart(dogs, pickupService, dropoffService);

  /* Draw initial frame on mount */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    drawHeroFrame(ctx, cv.width, cv.height, 0);
  }, []);

  /* Scroll handler — canvas draws via rAF, not React state */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const st = el.scrollTop;

        // Draw canvas directly — no setState
        const cv = canvasRef.current;
        if (cv) {
          const ctx = cv.getContext('2d');
          if (ctx) drawHeroFrame(ctx, cv.width, cv.height, st);
        }

        // Hero text fade — direct DOM manipulation
        const fadeStart = 50;
        const fadeEnd = 250;
        let opacity = 1;
        if (st >= fadeEnd) opacity = 0;
        else if (st > fadeStart) opacity = 1 - (st - fadeStart) / (fadeEnd - fadeStart);

        if (heroOverlayRef.current) {
          heroOverlayRef.current.style.opacity = String(opacity);
          heroOverlayRef.current.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
        }

        // Progress bar + section tracking still use state (these update less frequently)
        const heroHeight = 420;
        const formScroll = Math.max(0, st - heroHeight);
        const formHeight = el.scrollHeight - el.clientHeight - heroHeight;
        setScrollPct(formHeight > 0 ? Math.min((formScroll / formHeight) * 100, 100) : 0);

        const viewMid = el.clientHeight * 0.35;
        let cur = 0;
        for (let i = sectionRefs.current.length - 1; i >= 0; i--) {
          const ref = sectionRefs.current[i];
          if (ref && ref.getBoundingClientRect().top - el.getBoundingClientRect().top < viewMid) {
            cur = i;
            break;
          }
        }
        setActiveSection(cur);
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* Submit */
  const handleSubmit = async () => {
    setError(null);

    // Validate required date/time fields per dog
    const missing: string[] = [];
    for (let i = 0; i < dogs.length; i++) {
      const dog = dogs[i];
      const label = dog.name || `Dog ${i + 1}`;

      if (!dog.service) {
        missing.push(`${label}: please select a service`);
        continue;
      }

      if (dog.service === 'boarding') {
        if (!dog.dropoffDate) missing.push(`${label}: drop-off date`);
        if (!dog.dropoffTime) missing.push(`${label}: drop-off time`);
        if (!dog.pickupDate) missing.push(`${label}: pickup date`);
        if (!dog.pickupTime) missing.push(`${label}: pickup time`);
      } else if (dog.service === 'daycare') {
        if (!dog.daycareDate) missing.push(`${label}: daycare date`);
        if (!dog.daycareDropoffTime) missing.push(`${label}: drop-off time`);
        if (!dog.daycarePickupTime) missing.push(`${label}: pickup time`);
      } else {
        if (!dog.appointmentDate) missing.push(`${label}: appointment date`);
        if (!dog.appointmentTime) missing.push(`${label}: appointment time`);
      }
    }

    if (missing.length > 0) {
      setError(`Missing required fields: ${missing.join('; ')}`);
      return;
    }

    setSubmitting(true);
    try {
      const payload: BookingPayload = {
        client,
        dogs,
        pickupService,
        dropoffService,
        cart,
      };
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not connect. Please check your internet and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Confirmation Screen ── */
  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', background: T.white,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '0 28px',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: T.gold,
          margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28">
            <path d="M7 14l5 5 9-9" stroke={T.espresso} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: T.espresso, margin: '0 0 8px', fontWeight: 400 }}>
          Booking received
        </h2>
        <p style={{ fontSize: 14, color: T.muted, margin: '0 0 36px', lineHeight: 1.6, textAlign: 'center' }}>
          We&apos;ll confirm your booking shortly.<br />Check your email for details.
        </p>
        <div style={{ background: T.cream, borderRadius: 14, padding: 20, textAlign: 'left', width: '100%', maxWidth: 340 }}>
          <SectionLabel>what happens next</SectionLabel>
          <div style={{ fontSize: 14, color: T.espresso, lineHeight: 1.9 }}>
            1. Dave reviews your request<br />
            2. You&apos;ll get a confirmation email<br />
            3. Payment collected at drop-off
          </div>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div style={{
      maxWidth: 480, margin: '0 auto', minHeight: '100vh',
      background: T.white, display: 'flex', flexDirection: 'column',
    }}>
      {/* Nav */}
      <div style={{
        height: 54, background: T.white, display: 'flex',
        alignItems: 'flex-end', justifyContent: 'center',
        paddingBottom: 10, flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: T.espresso, letterSpacing: '0.02em' }}>
          The Pup Pad
        </span>
      </div>

      <ProgressNav activeIndex={activeSection} scrollPercent={scrollPct} />

      {/* Scrollable content */}
      <div ref={scrollRef} className="scroll-hide" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>

        {/* ── Hero ── */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <canvas ref={canvasRef} width={480} height={420} style={{ width: '100%', height: 420, display: 'block' }} />
          <div
            ref={heroOverlayRef}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '0 28px 36px', zIndex: 2,
            }}
          >
            <div style={{
              display: 'inline-block', background: T.gold, color: T.espresso,
              fontSize: 11, fontFamily: 'monospace', padding: '4px 10px', borderRadius: 6,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
            }}>kennel-free boarding</div>
            <h1 style={{
              fontFamily: 'Georgia, serif', fontSize: 30, color: T.white,
              margin: '0 0 8px', fontWeight: 400, lineHeight: 1.15,
            }}>
              Your dog deserves<br />a real home
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>
              Premium pet care in Central New Jersey.<br />No cages. No kennels. Just love.
            </p>
          </div>
          <div style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            zIndex: 2, opacity: 0.5,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M10 4v12M4 10l6 6 6-6" stroke="#FFF" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* ── Form Sections ── */}
        <div style={{ padding: '28px 24px 28px' }}>

          {/* ── Section 1: Client ── */}
          <div ref={el => { sectionRefs.current[0] = el; }} style={{ marginBottom: 8 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: T.espresso, margin: '0 0 6px', fontWeight: 400 }}>
              Your information
            </h2>
            <p style={{ fontSize: 13, color: T.muted, margin: '0 0 20px' }}>We&apos;ll use this to confirm your booking</p>
            <SectionLabel>contact</SectionLabel>
            <FormField label="Full name" placeholder="Jane Smith" value={client.name} onChange={v => setClient(p => ({ ...p, name: v }))} />
            <FormField label="Email" placeholder="jane@email.com" type="email" value={client.email} onChange={v => setClient(p => ({ ...p, email: v }))} />
            <FormField label="Phone" placeholder="(555) 123-4567" type="tel" value={client.phone} onChange={v => setClient(p => ({ ...p, phone: v }))} />
          </div>

          <GoldDivider />

          {/* ── Section 2: Dogs ── */}
          <div ref={el => { sectionRefs.current[1] = el; }} style={{ marginBottom: 8 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: T.espresso, margin: '0 0 6px', fontWeight: 400 }}>
              Your dog(s)
            </h2>
            <p style={{ fontSize: 13, color: T.muted, margin: '0 0 20px' }}>Tell us about your furry family</p>
            {dogs.map((dog, idx) => (
              <div key={dog.id} style={{ background: T.cream, borderRadius: 14, padding: 20, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <SectionLabel>dog {idx + 1}</SectionLabel>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.gold }} />
                </div>
                <FormField label="Dog name" placeholder="Buddy" onCream value={dog.name} onChange={v => updateDog(idx, 'name', v)} />
              </div>
            ))}
            <button
              onClick={addDog}
              type="button"
              style={{
                width: '100%', height: 44, borderRadius: 10,
                border: `1.5px dashed ${T.light}`, background: 'transparent',
                color: T.muted, fontSize: 13, fontFamily: 'monospace', cursor: 'pointer',
              }}
            >+ add another dog</button>
          </div>

          <GoldDivider />

          {/* ── Section 3: Services ── */}
          <div ref={el => { sectionRefs.current[2] = el; }} style={{ marginBottom: 8 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: T.espresso, margin: '0 0 6px', fontWeight: 400 }}>
              Choose a service
            </h2>
            <p style={{ fontSize: 13, color: T.muted, margin: '0 0 20px' }}>
              {dogs.length === 1
                ? `Select a service for ${dogs[0].name || 'your dog'}`
                : 'Select a service per dog'}
            </p>

            {dogs.map((dog, idx) => (
              <div key={dog.id} style={{ marginBottom: dogs.length > 1 ? 24 : 0 }}>
                {dogs.length > 1 && <SectionLabel>{dog.name || `dog ${idx + 1}`}</SectionLabel>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {SERVICE_OPTIONS.map(opt => (
                    <ServiceCard
                      key={opt.id}
                      label={opt.label}
                      price={opt.price}
                      unit={opt.unit}
                      popular={opt.popular}
                      selected={dog.service === opt.id}
                      onSelect={() => updateDog(idx, 'service', opt.id)}
                    />
                  ))}
                </div>

                {dog.service === 'boarding' && (
                  <div style={{ background: T.cream, borderRadius: 14, padding: 20, marginBottom: 8 }}>
                    <SectionLabel>boarding dates</SectionLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <FormField label="Drop-off date" placeholder="" type="date" onCream required value={dog.dropoffDate} onChange={v => updateDog(idx, 'dropoffDate', v)} />
                      <FormField label="Drop-off time" placeholder="" type="time" onCream required value={dog.dropoffTime} onChange={v => updateDog(idx, 'dropoffTime', v)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <FormField label="Pickup date" placeholder="" type="date" onCream required value={dog.pickupDate} onChange={v => updateDog(idx, 'pickupDate', v)} />
                      <FormField label="Pickup time" placeholder="" type="time" onCream required value={dog.pickupTime} onChange={v => updateDog(idx, 'pickupTime', v)} />
                    </div>
                  </div>
                )}

                {dog.service === 'daycare' && (
                  <div style={{ background: T.cream, borderRadius: 14, padding: 20, marginBottom: 8 }}>
                    <SectionLabel>daycare times</SectionLabel>
                    <FormField label="Date" placeholder="" type="date" onCream required value={dog.daycareDate} onChange={v => updateDog(idx, 'daycareDate', v)} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <FormField label="Drop-off time" placeholder="" type="time" onCream required value={dog.daycareDropoffTime} onChange={v => updateDog(idx, 'daycareDropoffTime', v)} />
                      <FormField label="Pickup time" placeholder="" type="time" onCream required value={dog.daycarePickupTime} onChange={v => updateDog(idx, 'daycarePickupTime', v)} />
                    </div>
                  </div>
                )}

                {dog.service !== '' && dog.service !== 'boarding' && dog.service !== 'daycare' && (
                  <div style={{ background: T.cream, borderRadius: 14, padding: 20, marginBottom: 8 }}>
                    <SectionLabel>appointment</SectionLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <FormField label="Date" placeholder="" type="date" onCream required value={dog.appointmentDate} onChange={v => updateDog(idx, 'appointmentDate', v)} />
                      <FormField label="Time" placeholder="" type="time" onCream required value={dog.appointmentTime} onChange={v => updateDog(idx, 'appointmentTime', v)} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <GoldDivider />

          {/* ── Section 4: Add-ons ── */}
          <div ref={el => { sectionRefs.current[3] = el; }} style={{ marginBottom: 8 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: T.espresso, margin: '0 0 6px', fontWeight: 400 }}>
              Add-ons
            </h2>
            <p style={{ fontSize: 13, color: T.muted, margin: '0 0 20px' }}>Extras to pamper your pup</p>
            <SectionLabel>per dog</SectionLabel>
            {dogs.map((dog, idx) => (
              <ToggleCard
                key={dog.id}
                label={`Bath${dog.name ? ` for ${dog.name}` : ''}`}
                subtitle={`$${ADDONS.bath.price} per dog`}
                price={ADDONS.bath.price}
                checked={dog.bath}
                onToggle={() => updateDog(idx, 'bath', !dog.bath)}
              />
            ))}
            <div style={{ height: 1, background: T.cream, margin: '24px 0' }} />
            <SectionLabel>per booking</SectionLabel>
            <ToggleCard label="Pickup" subtitle={`$${ADDONS.pickup.price} per booking`} price={ADDONS.pickup.price} checked={pickupService} onToggle={() => setPickupService(p => !p)} />
            <ToggleCard label="Dropoff" subtitle={`$${ADDONS.dropoff.price} per booking`} price={ADDONS.dropoff.price} checked={dropoffService} onToggle={() => setDropoffService(p => !p)} />
          </div>

          <GoldDivider />

          {/* ── Section 5: Review ── */}
          <div ref={el => { sectionRefs.current[4] = el; }} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: T.espresso, margin: '0 0 6px', fontWeight: 400 }}>
              Review & confirm
            </h2>
            <p style={{ fontSize: 13, color: T.muted, margin: '0 0 20px' }}>Everything look right?</p>
            <div style={{ background: T.cream, borderRadius: 14, padding: 20 }}>
              <SectionLabel>booking summary</SectionLabel>

              {cart.lineItems.map((li, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', background: T.white,
                    border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: 17, color: T.espresso,
                  }}>
                    {li.dogName[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, color: T.espresso, fontWeight: 500 }}>{li.dogName}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{li.service}</div>
                  </div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: T.espresso }}>
                    {li.servicePrice === 0 ? 'Free' : `$${li.servicePrice}`}
                  </div>
                </div>
              ))}

              {cart.lineItems.length === 0 && (
                <div style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>No services selected yet</div>
              )}

              <div style={{ height: 1, background: T.border, margin: '0 0 12px' }} />

              {cart.lineItems.filter(li => li.bathPrice > 0).map((li, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: T.muted }}>Bath — {li.dogName}</span>
                  <span style={{ color: T.espresso }}>${li.bathPrice}</span>
                </div>
              ))}
              {cart.pickupPrice > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: T.muted }}>Pickup</span>
                  <span style={{ color: T.espresso }}>${cart.pickupPrice}</span>
                </div>
              )}
              {cart.dropoffPrice > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: T.muted }}>Dropoff</span>
                  <span style={{ color: T.espresso }}>${cart.dropoffPrice}</span>
                </div>
              )}

              <div style={{ height: 1, background: T.border, margin: '14px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: T.muted }}>Subtotal</span>
                <span style={{ color: T.espresso }}>${cart.total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: T.muted }}>NJ Sales Tax (6.625%)</span>
                <span style={{ color: T.espresso }}>${cart.tax.toFixed(2)}</span>
              </div>

              <div style={{ height: 1, background: T.border, margin: '14px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Total</span>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: T.espresso, fontWeight: 400 }}>${cart.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{ flexShrink: 0, padding: '12px 24px 28px', background: T.white, borderTop: `1px solid ${T.cream}` }}>
        {error && (
          <div style={{
            fontSize: 13, color: T.espresso, marginBottom: 10, textAlign: 'center',
            background: 'rgba(255,202,75,0.15)', border: `1px solid ${T.gold}`,
            borderRadius: 10, padding: '10px 14px', lineHeight: 1.5,
          }}>{error}</div>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          type="button"
          style={{
            width: '100%', height: 52, borderRadius: 12,
            background: T.gold, color: T.espresso, fontWeight: 600,
            fontSize: 15, border: 'none', cursor: submitting ? 'wait' : 'pointer',
            boxShadow: '0 2px 12px rgba(255,202,75,0.3)',
            fontFamily: 'Georgia, serif', letterSpacing: '0.02em',
            opacity: submitting ? 0.6 : 1, transition: 'opacity 0.2s',
          }}
        >
          {submitting ? 'Submitting...' : 'Submit booking'}
        </button>
      </div>
    </div>
  );
}
