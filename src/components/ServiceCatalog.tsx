import Link from 'next/link';
import { SERVICES, ADDONS, SERVICE_OPTIONS } from '@/lib/pricing';

/* ── Descriptions (richer than pricing.ts, per PRD §3.2) ── */
const DESCRIPTIONS: Record<string, string> = {
  boarding:
    "Your dog stays in our home, not a cage. Free-roam, kennel-free, with overnight supervision and all the couch space they can claim. Drop off when you're ready, pick up when you're back.",
  daycare:
    "A full day of play, naps, and socialization in a small-group, cage-free environment. Perfect for work days or when your pup just needs to burn some energy.",
  walking_30:
    "A neighborhood walk with one-on-one attention. We come to you, leash up, and get them moving.",
  walking_60:
    "The longer loop. More sniffs, more steps, more time outside for dogs who need the extra stretch.",
  inhome_30:
    "We stop by your place to let them out, check in, and make sure everything's good. Ideal for mid-day breaks or quick check-ins while you're out.",
  inhome_60:
    "A longer visit — enough time for a walk, feeding, play, and some real company. For days when they need more than a pop-in.",
  meet_greet:
    "Come see the space, meet us, and let your dog sniff around before committing to anything. We want everyone comfortable — you and your pup.",
};

/* ── Display-friendly unit labels ── */
const UNIT_LABELS: Record<string, string> = {
  boarding: '/night',
  daycare: '/day',
  walking_30: '/walk',
  walking_60: '/walk',
  inhome_30: '/visit',
  inhome_60: '/visit',
  meet_greet: '30 min',
};

/* ── Addon keys ── */
const addonKeys = Object.keys(ADDONS) as (keyof typeof ADDONS)[];

export default function ServiceCatalog() {
  return (
    <section>
      {/* ── Service Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SERVICE_OPTIONS.map((svc) => {
          const isBoarding = svc.id === 'boarding';
          const isFree = svc.price === 0;

          return (
            <div
              key={svc.id}
              className={`relative rounded-2xl p-6 ${
                isBoarding
                  ? 'border-2 border-gold bg-white md:col-span-2'
                  : 'border border-[rgba(62,54,63,0.08)] bg-white'
              }`}
            >
              {/* Most Popular badge */}
              {isBoarding && (
                <span className="absolute -top-3 left-6 inline-block rounded-full bg-gold px-4 py-1 text-xs font-bold text-plum">
                  Most Popular
                </span>
              )}

              {/* Service name */}
              <h3 className="font-nunito text-lg font-bold text-plum">
                {svc.label}
              </h3>

              {/* Price */}
              <div className="mt-1 flex items-baseline gap-1">
                {isFree ? (
                  <span className="font-nunito text-2xl font-extrabold text-plum">
                    Free
                  </span>
                ) : (
                  <>
                    <span className="font-nunito text-2xl font-extrabold text-plum">
                      ${svc.price}
                    </span>
                    <span className="font-nunito text-sm text-plum/45">
                      {UNIT_LABELS[svc.id]}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="mt-3 font-nunito text-sm leading-relaxed text-plum">
                {DESCRIPTIONS[svc.id]}
              </p>

              {/* CTA */}
              <Link
                href="/bookings"
                className="mt-4 inline-block rounded-full bg-gold px-6 py-2.5 text-center font-nunito text-sm font-bold text-plum transition-colors hover:bg-gold-hover"
              >
                Book Now
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── Add-ons ── */}
      <div className="mt-12">
        <h3 className="font-nunito text-xl font-bold text-plum">Add-ons</h3>
        <p className="mt-1 font-nunito text-sm text-plum/45">
          Available during booking
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {addonKeys.map((key) => {
            const addon = ADDONS[key];
            return (
              <div
                key={key}
                className="rounded-full border border-[rgba(62,54,63,0.08)] bg-cream px-5 py-2.5"
              >
                <span className="font-nunito text-sm font-bold text-plum">
                  {addon.label}
                </span>
                <span className="ml-2 font-nunito text-sm text-plum/45">
                  ${addon.price} {addon.unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
