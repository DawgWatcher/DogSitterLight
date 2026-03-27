'use client';

import { useState, type FormEvent } from 'react';

/* ── Design Tokens (same 60/30/10 as BookingForm) ── */
const T = {
  white: '#FFFFFF',
  cream: '#F2F0E6',
  gold: '#FFCA4B',
  plum: '#3E363F',
  muted: 'rgba(62,54,63,0.45)',
  border: 'rgba(62,54,63,0.08)',
} as const;

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const canSubmit =
    name.trim() !== '' &&
    email.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    message.trim() !== '' &&
    status !== 'sending';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });

      if (!res.ok) throw new Error();
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  const inputBase =
    'w-full rounded-2xl border bg-white px-4 py-3 font-nunito text-sm text-plum outline-none transition-colors placeholder:text-plum/35';
  const inputIdle = `border-[${T.border}] focus:border-gold`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); if (status !== 'idle') setStatus('idle'); }}
          placeholder="Your name"
          required
          className={`${inputBase} ${inputIdle}`}
          style={{ borderColor: T.border }}
          onFocus={(e) => (e.currentTarget.style.borderColor = T.gold)}
          onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
        />
      </div>

      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status !== 'idle') setStatus('idle'); }}
          placeholder="your@email.com"
          required
          className={`${inputBase} ${inputIdle}`}
          style={{ borderColor: T.border }}
          onFocus={(e) => (e.currentTarget.style.borderColor = T.gold)}
          onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
        />
      </div>

      <div>
        <textarea
          value={message}
          onChange={(e) => { setMessage(e.target.value); if (status !== 'idle') setStatus('idle'); }}
          placeholder="How can we help?"
          required
          rows={5}
          className={`${inputBase} ${inputIdle} resize-none`}
          style={{ borderColor: T.border }}
          onFocus={(e) => (e.currentTarget.style.borderColor = T.gold)}
          onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-full bg-gold py-3 font-nunito text-sm font-bold text-plum transition-colors hover:bg-gold-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>

      {/* Success */}
      {status === 'success' && (
        <p className="text-center font-nunito text-sm font-semibold" style={{ color: T.gold }}>
          Message sent! We&apos;ll get back to you soon.
        </p>
      )}

      {/* Error */}
      {status === 'error' && (
        <p className="text-center font-nunito text-sm text-plum">
          Something went wrong. Please call us at{' '}
          <a href="tel:9089026008" className="font-bold underline">
            908-902-6008
          </a>
          .
        </p>
      )}
    </form>
  );
}
