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

function buildCart(dogs: DogEntry[], pickupService: boolean, dropoffService: boolean): CartSummary {
  const lineItems: CartLineItem[] = dogs
    .filter(d => d.service !== '')
    .map(d => {
      const svc = SERVICES[d.service as ServiceKey];
      return {
        dogName: d.name || 'Unnamed',
        service: svc.label,
        servicePrice: svc.price,
        bathPrice: d.bath ? ADDONS.bath.price : 0,
      };
    });

  const subtotal = lineItems.reduce((sum, li) => sum + li.servicePrice + li.bathPrice, 0);
  const pickupPrice = pickupService ? ADDONS.pickup.price : 0;
  const dropoffPrice = dropoffService ? ADDONS.dropoff.price : 0;

  return {
    lineItems,
    subtotal,
    pickupPrice,
    dropoffPrice,
    total: subtotal + pickupPrice + dropoffPrice,
  };
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
  label, placeholder, type = 'text', value, onChange, onCream = false,
}: {
  label: string; placeholder: string; type?: string;
  value: string; onChange: (val: string) => void; onCream?: boolean;
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updateDog = useCallback((idx: number, field: keyof DogEntry, value: string | boolean) => {
    setDogs(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  }, []);

  const addDog = useCallback(() => {
    setDogs(prev => [...prev, createDog()]);
  }, []);

  const cart = buildCart(dogs, pickupService, dropoffService);

  /* Scroll spy */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const st = el.scrollTop;
      const sh = el.scrollHeight - el.clientHeight;
      setScrollPct(sh > 0 ? (st / sh) * 100 : 0);
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
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  /* Submit */
  const handleSubmit = async () => {
    setError(null);
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
        <div style={{ padding: '20px 24px 28px' }}>

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

                {/* Boarding: drop-off date/time + pickup date/time */}
                {dog.service === 'boarding' && (
                  <div style={{ background: T.cream, borderRadius: 14, padding: 20, marginBottom: 8 }}>
                    <SectionLabel>boarding dates</SectionLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <FormField label="Drop-off date" placeholder="" type="date" onCream value={dog.dropoffDate} onChange={v => updateDog(idx, 'dropoffDate', v)} />
                      <FormField label="Drop-off time" placeholder="" type="time" onCream value={dog.dropoffTime} onChange={v => updateDog(idx, 'dropoffTime', v)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <FormField label="Pickup date" placeholder="" type="date" onCream value={dog.pickupDate} onChange={v => updateDog(idx, 'pickupDate', v)} />
                      <FormField label="Pickup time" placeholder="" type="time" onCream value={dog.pickupTime} onChange={v => updateDog(idx, 'pickupTime', v)} />
                    </div>
                  </div>
                )}

                {/* Daycare: single date + drop-off time + pickup time */}
                {dog.service === 'daycare' && (
                  <div style={{ background: T.cream, borderRadius: 14, padding: 20, marginBottom: 8 }}>
                    <SectionLabel>daycare times</SectionLabel>
                    <FormField label="Date" placeholder="" type="date" onCream value={dog.daycareDate} onChange={v => updateDog(idx, 'daycareDate', v)} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <FormField label="Drop-off time" placeholder="" type="time" onCream value={dog.daycareDropoffTime} onChange={v => updateDog(idx, 'daycareDropoffTime', v)} />
                      <FormField label="Pickup time" placeholder="" type="time" onCream value={dog.daycarePickupTime} onChange={v => updateDog(idx, 'daycarePickupTime', v)} />
                    </div>
                  </div>
                )}

                {/* Walking / In-Home / Meet & Greet: date + time */}
                {dog.service !== '' && dog.service !== 'boarding' && dog.service !== 'daycare' && (
                  <div style={{ background: T.cream, borderRadius: 14, padding: 20, marginBottom: 8 }}>
                    <SectionLabel>appointment</SectionLabel>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <FormField label="Date" placeholder="" type="date" onCream value={dog.appointmentDate} onChange={v => updateDog(idx, 'appointmentDate', v)} />
                      <FormField label="Time" placeholder="" type="time" onCream value={dog.appointmentTime} onChange={v => updateDog(idx, 'appointmentTime', v)} />
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Total</span>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: T.espresso, fontWeight: 400 }}>${cart.total}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{ flexShrink: 0, padding: '12px 24px 28px', background: T.white, borderTop: `1px solid ${T.cream}` }}>
        {error && (
          <div style={{ fontSize: 13, color: '#b91c1c', marginBottom: 10, textAlign: 'center' }}>{error}</div>
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
