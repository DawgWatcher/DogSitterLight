"use client";

import { useState, useCallback } from "react";
import { SERVICES, ADDONS, ServiceKey } from "@/lib/pricing";
import type { ClientInfo, DogEntry, BookingState, CartSummary, CartLineItem } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────
function uuid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function emptyDog(): DogEntry {
  return {
    id: uuid(),
    name: "",
    service: "",
    dropoffDate: "",
    dropoffTime: "",
    pickupDate: "",
    pickupTime: "",
    daycareDate: "",
    daycareDropoffTime: "",
    daycarePickupTime: "",
    appointmentDate: "",
    appointmentTime: "",
    bath: false,
  };
}

function calculateCart(state: BookingState): CartSummary {
  const lineItems: CartLineItem[] = state.dogs.map((dog) => {
    const svc = SERVICES[dog.service as ServiceKey];
    const servicePrice = svc?.price ?? 0;
    const bathPrice = dog.bath ? ADDONS.bath.price : 0;
    return {
      dogName: dog.name,
      service: svc?.label ?? "",
      servicePrice,
      bathPrice,
    };
  });

  const subtotal = lineItems.reduce((sum, li) => sum + li.servicePrice + li.bathPrice, 0);
  const pickupPrice = state.pickupService ? ADDONS.pickup.price : 0;
  const dropoffPrice = state.dropoffService ? ADDONS.dropoff.price : 0;
  const total = subtotal + pickupPrice + dropoffPrice;

  return { lineItems, subtotal, pickupPrice, dropoffPrice, total };
}

const STEPS = [
  { num: 1, label: "Your Info" },
  { num: 2, label: "Dog Info" },
  { num: 3, label: "Service" },
  { num: 4, label: "Add-ons" },
  { num: 5, label: "Review" },
];

// ── Service Fields (extracted outside — receives props, stable identity) ──
function ServiceFieldsBlock({ dog, updateDog }: { dog: DogEntry; updateDog: (dogId: string, updates: Partial<DogEntry>) => void }) {
  if (!dog.service) return null;

  if (dog.service === "boarding") {
    return (
      <div className="mt-4 space-y-3 bg-white rounded-lg p-4 border border-brand-100">
        <p className="text-sm font-medium text-forest-700">Boarding Dates & Times</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Drop-off Date</label>
            <input
              type="date"
              className="input-field text-sm"
              value={dog.dropoffDate}
              onChange={(e) => updateDog(dog.id, { dropoffDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Drop-off Time</label>
            <input
              type="time"
              className="input-field text-sm"
              value={dog.dropoffTime}
              onChange={(e) => updateDog(dog.id, { dropoffTime: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Pickup Date</label>
            <input
              type="date"
              className="input-field text-sm"
              value={dog.pickupDate}
              onChange={(e) => updateDog(dog.id, { pickupDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Pickup Time</label>
            <input
              type="time"
              className="input-field text-sm"
              value={dog.pickupTime}
              onChange={(e) => updateDog(dog.id, { pickupTime: e.target.value })}
            />
          </div>
        </div>
      </div>
    );
  }

  if (dog.service === "daycare") {
    return (
      <div className="mt-4 space-y-3 bg-white rounded-lg p-4 border border-brand-100">
        <p className="text-sm font-medium text-forest-700">Daycare Schedule</p>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input
            type="date"
            className="input-field text-sm"
            value={dog.daycareDate}
            onChange={(e) => updateDog(dog.id, { daycareDate: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Drop-off Time</label>
            <input
              type="time"
              className="input-field text-sm"
              value={dog.daycareDropoffTime}
              onChange={(e) => updateDog(dog.id, { daycareDropoffTime: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Pickup Time</label>
            <input
              type="time"
              className="input-field text-sm"
              value={dog.daycarePickupTime}
              onChange={(e) => updateDog(dog.id, { daycarePickupTime: e.target.value })}
            />
          </div>
        </div>
      </div>
    );
  }

  // Walking, In-Home, Meet & Greet
  const svc = SERVICES[dog.service as ServiceKey];
  return (
    <div className="mt-4 space-y-3 bg-white rounded-lg p-4 border border-brand-100">
      <p className="text-sm font-medium text-forest-700">{svc.label} — When?</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input
            type="date"
            className="input-field text-sm"
            value={dog.appointmentDate}
            onChange={(e) => updateDog(dog.id, { appointmentDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Start Time</label>
          <input
            type="time"
            className="input-field text-sm"
            value={dog.appointmentTime}
            onChange={(e) => updateDog(dog.id, { appointmentTime: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [state, setState] = useState<BookingState>({
    client: { name: "", email: "", phone: "" },
    dogs: [emptyDog()],
    pickupService: false,
    dropoffService: false,
  });

  // ── State updaters ──────────────────────────────────────────
  const updateClient = useCallback((field: keyof ClientInfo, value: string) => {
    setState((prev) => ({
      ...prev,
      client: { ...prev.client, [field]: value },
    }));
  }, []);

  const updateDog = useCallback((dogId: string, updates: Partial<DogEntry>) => {
    setState((prev) => ({
      ...prev,
      dogs: prev.dogs.map((d) => (d.id === dogId ? { ...d, ...updates } : d)),
    }));
  }, []);

  const addDog = useCallback(() => {
    setState((prev) => ({ ...prev, dogs: [...prev.dogs, emptyDog()] }));
  }, []);

  const removeDog = useCallback((dogId: string) => {
    setState((prev) => ({
      ...prev,
      dogs: prev.dogs.filter((d) => d.id !== dogId),
    }));
  }, []);

  // ── Validation ──────────────────────────────────────────────
  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!(state.client.name && state.client.email && state.client.phone);
      case 2:
        return state.dogs.every((d) => d.name.trim() !== "");
      case 3:
        return state.dogs.every((d) => {
          if (!d.service) return false;
          if (d.service === "boarding") {
            return d.dropoffDate && d.dropoffTime && d.pickupDate && d.pickupTime;
          }
          if (d.service === "daycare") {
            return d.daycareDate && d.daycareDropoffTime && d.daycarePickupTime;
          }
          // walking, in-home, m&g
          return d.appointmentDate && d.appointmentTime;
        });
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const cart = calculateCart(state);
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: state.client,
          dogs: state.dogs,
          pickupService: state.pickupService,
          dropoffService: state.dropoffService,
          cart,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirmation screen ─────────────────────────────────────
  if (submitted) {
    return (
      <div className="card text-center py-12">
        <div className="text-5xl mb-4">🐾</div>
        <h2 className="font-display text-3xl font-bold text-forest-700 mb-3">
          You&apos;re Booked!
        </h2>
        <p className="text-gray-600 mb-2">
          Your booking is on the calendar. We&apos;ll be in touch to confirm details.
        </p>
        <p className="text-sm text-gray-500">
          {state.dogs.map((d) => d.name).join(" & ")} — we can&apos;t wait to meet{" "}
          {state.dogs.length > 1 ? "them" : "them"}!
        </p>
      </div>
    );
  }

  // ── Cart for review step ────────────────────────────────────
  const cart = calculateCart(state);

  // ═══════════════════════════════════════════════════════════
  // RENDER — all steps are plain JSX, not inner components
  // ═══════════════════════════════════════════════════════════
  return (
    <div>
      {/* ── Step Indicator ── */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`step-badge ${
                  step >= s.num
                    ? "bg-forest-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span
                className={`text-xs mt-1 hidden sm:block ${
                  step >= s.num ? "text-forest-700 font-medium" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-0.5 mx-1 ${
                  step > s.num ? "bg-forest-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ═══ STEP 1 — CLIENT INFO ═══ */}
      {step === 1 && (
        <div className="card">
          <h2 className="font-display text-2xl font-bold text-forest-800 mb-1">
            Your Information
          </h2>
          <p className="text-gray-500 text-sm mb-6">Tell us about yourself</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Jane Smith"
                value={state.client.name}
                onChange={(e) => updateClient("name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="jane@email.com"
                value={state.client.email}
                onChange={(e) => updateClient("email", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                className="input-field"
                placeholder="(908) 555-1234"
                value={state.client.phone}
                onChange={(e) => updateClient("phone", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 2 — DOG INFO ═══ */}
      {step === 2 && (
        <div className="card">
          <h2 className="font-display text-2xl font-bold text-forest-800 mb-1">
            Your Dog{state.dogs.length > 1 ? "s" : ""}
          </h2>
          <p className="text-gray-500 text-sm mb-6">Who are we caring for?</p>

          <div className="space-y-4">
            {state.dogs.map((dog, i) => (
              <div key={dog.id} className="dog-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-brand-700">
                    Dog {i + 1}
                  </span>
                  {state.dogs.length > 1 && (
                    <button
                      className="text-sm text-red-500 hover:text-red-700"
                      onClick={() => removeDog(dog.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Dog's name (e.g., Max)"
                  value={dog.name}
                  onChange={(e) => updateDog(dog.id, { name: e.target.value })}
                />
              </div>
            ))}
          </div>

          <button className="btn-secondary w-full mt-4" onClick={addDog}>
            + Add Another Dog
          </button>
        </div>
      )}

      {/* ═══ STEP 3 — SERVICE SELECTION ═══ */}
      {step === 3 && (
        <div className="card">
          <h2 className="font-display text-2xl font-bold text-forest-800 mb-1">
            Choose a Service
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Select a service{state.dogs.length > 1 ? " for each dog" : ""}
          </p>

          <div className="space-y-6">
            {state.dogs.map((dog) => (
              <div key={dog.id} className="dog-card">
                <p className="font-semibold text-brand-700 mb-3">
                  {dog.name || "Unnamed Dog"}
                </p>
                <select
                  className="select-field"
                  value={dog.service}
                  onChange={(e) => updateDog(dog.id, { service: e.target.value as ServiceKey })}
                >
                  <option value="">Select a service...</option>
                  {Object.entries(SERVICES).map(([key, svc]) => (
                    <option key={key} value={key}>
                      {svc.label} — {svc.price === 0 ? "Free" : `$${svc.price} ${svc.unit}`}
                    </option>
                  ))}
                </select>
                <ServiceFieldsBlock dog={dog} updateDog={updateDog} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ STEP 4 — ADD-ONS ═══ */}
      {step === 4 && (
        <div className="card">
          <h2 className="font-display text-2xl font-bold text-forest-800 mb-1">
            Add-ons
          </h2>
          <p className="text-gray-500 text-sm mb-6">Optional extras for your booking</p>

          {/* Bath — per dog */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Bath — ${ADDONS.bath.price} per dog
            </h3>
            <div className="space-y-3">
              {state.dogs.map((dog) => (
                <label
                  key={dog.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 border border-brand-100 cursor-pointer hover:border-forest-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="checkbox-field"
                    checked={dog.bath}
                    onChange={(e) => updateDog(dog.id, { bath: e.target.checked })}
                  />
                  <span className="text-gray-800">
                    Bath for <span className="font-semibold">{dog.name || "unnamed"}</span>
                  </span>
                  <span className="ml-auto text-sm text-gray-500">${ADDONS.bath.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Transportation — per booking */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Transportation — per booking
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 border border-brand-100 cursor-pointer hover:border-forest-300 transition-colors">
                <input
                  type="checkbox"
                  className="checkbox-field"
                  checked={state.pickupService}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, pickupService: e.target.checked }))
                  }
                />
                <div>
                  <span className="text-gray-800 font-medium">Pickup</span>
                  <span className="block text-xs text-gray-500">We come get your pup</span>
                </div>
                <span className="ml-auto text-sm text-gray-500">${ADDONS.pickup.price}</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 border border-brand-100 cursor-pointer hover:border-forest-300 transition-colors">
                <input
                  type="checkbox"
                  className="checkbox-field"
                  checked={state.dropoffService}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, dropoffService: e.target.checked }))
                  }
                />
                <div>
                  <span className="text-gray-800 font-medium">Dropoff</span>
                  <span className="block text-xs text-gray-500">We bring your pup home</span>
                </div>
                <span className="ml-auto text-sm text-gray-500">${ADDONS.dropoff.price}</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP 5 — REVIEW ═══ */}
      {step === 5 && (
        <div className="card">
          <h2 className="font-display text-2xl font-bold text-forest-800 mb-1">
            Review Your Booking
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Make sure everything looks good
          </p>

          {/* Client info */}
          <div className="mb-6 pb-4 border-b border-brand-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Your Info
            </h3>
            <p className="text-gray-800 font-medium">{state.client.name}</p>
            <p className="text-sm text-gray-600">{state.client.email}</p>
            <p className="text-sm text-gray-600">{state.client.phone}</p>
          </div>

          {/* Dogs & services */}
          <div className="mb-6 pb-4 border-b border-brand-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Services
            </h3>
            <div className="space-y-3">
              {state.dogs.map((dog) => {
                const svc = SERVICES[dog.service as ServiceKey];
                return (
                  <div key={dog.id} className="bg-brand-50 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{dog.name}</p>
                        <p className="text-sm text-gray-600">{svc?.label}</p>
                        {dog.service === "boarding" && (
                          <p className="text-xs text-gray-500 mt-1">
                            Drop-off: {dog.dropoffDate} at {dog.dropoffTime}
                            <br />
                            Pickup: {dog.pickupDate} at {dog.pickupTime}
                          </p>
                        )}
                        {dog.service === "daycare" && (
                          <p className="text-xs text-gray-500 mt-1">
                            {dog.daycareDate} — {dog.daycareDropoffTime} to {dog.daycarePickupTime}
                          </p>
                        )}
                        {!["boarding", "daycare", ""].includes(dog.service) && (
                          <p className="text-xs text-gray-500 mt-1">
                            {dog.appointmentDate} at {dog.appointmentTime}
                          </p>
                        )}
                        {dog.bath && (
                          <span className="inline-block mt-1 text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full">
                            + Bath
                          </span>
                        )}
                      </div>
                      <p className="text-forest-700 font-semibold">
                        ${svc?.price ?? 0}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Price Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              {cart.lineItems.map((li, i) => (
                <div key={i}>
                  <div className="flex justify-between text-gray-700">
                    <span>{li.dogName} — {li.service}</span>
                    <span>${li.servicePrice}</span>
                  </div>
                  {li.bathPrice > 0 && (
                    <div className="flex justify-between text-gray-500 pl-4">
                      <span>Bath</span>
                      <span>${li.bathPrice}</span>
                    </div>
                  )}
                </div>
              ))}
              {cart.pickupPrice > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Pickup</span>
                  <span>${cart.pickupPrice}</span>
                </div>
              )}
              {cart.dropoffPrice > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Dropoff</span>
                  <span>${cart.dropoffPrice}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-forest-800 pt-2 border-t border-brand-200">
                <span>Total</span>
                <span>${cart.total}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* ── Navigation Buttons ── */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button className="btn-ghost" onClick={() => setStep(step - 1)}>
            ← Back
          </button>
        ) : (
          <div />
        )}
        {step < 5 ? (
          <button
            className="btn-primary"
            disabled={!canProceed()}
            onClick={() => setStep(step + 1)}
          >
            Continue →
          </button>
        ) : (
          <button
            className="btn-primary"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Booking..." : "Confirm Booking"}
          </button>
        )}
      </div>
    </div>
  );
}
