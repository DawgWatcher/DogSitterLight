function envPrice(key: string, fallback: number): number {
  const parsed = parseFloat(process.env[key] ?? '');
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const SERVICES = {
  boarding: {
    label: "Boarding",
    description: "Kennel-free overnight care — 24hr rate",
    price: envPrice('PRICE_BOARDING', 60),
    unit: "per 24 hours",
    hasOverage: true,
    overageRate: envPrice('PRICE_BOARDING_OVERAGE', 2.5),
    overageUnit: "per hour",
    needsDropoffPickupTimes: true,
    needsDateRange: true,
  },
  daycare: {
    label: "Daycare",
    description: "Kennel-free daytime care",
    price: envPrice('PRICE_DAYCARE', 45),
    unit: "flat rate",
    hasOverage: false,
    needsDropoffPickupTimes: true,
    needsDateRange: false,
  },
  walking_30: {
    label: "Dog Walking — 30 min",
    description: "30-minute neighborhood walk",
    price: envPrice('PRICE_WALK_30', 25),
    unit: "per walk",
    hasOverage: false,
    durationMinutes: 30,
    needsDropoffPickupTimes: false,
    needsDateRange: false,
  },
  walking_60: {
    label: "Dog Walking — 60 min",
    description: "60-minute neighborhood walk",
    price: envPrice('PRICE_WALK_60', 45),
    unit: "per walk",
    hasOverage: false,
    durationMinutes: 60,
    needsDropoffPickupTimes: false,
    needsDateRange: false,
  },
  inhome_30: {
    label: "In-Home Visit — 30 min",
    description: "30-minute home check-in, feeding, and potty break",
    price: envPrice('PRICE_VISIT_30', 30),
    unit: "per visit",
    hasOverage: false,
    durationMinutes: 30,
    needsDropoffPickupTimes: false,
    needsDateRange: false,
  },
  inhome_60: {
    label: "In-Home Visit — 60 min",
    description: "60-minute home visit with walk and care",
    price: envPrice('PRICE_VISIT_60', 50),
    unit: "per visit",
    hasOverage: false,
    durationMinutes: 60,
    needsDropoffPickupTimes: false,
    needsDateRange: false,
  },
  meet_greet: {
    label: "Meet & Greet",
    description: "Free introductory visit — get to know each other",
    price: envPrice('PRICE_MEET_GREET', 0),
    unit: "free",
    hasOverage: false,
    durationMinutes: 30,
    needsDropoffPickupTimes: false,
    needsDateRange: false,
  },
};

export const ADDONS = {
  bath: {
    label: "Bath",
    price: envPrice('PRICE_BATH', 20),
    unit: "per dog",
    perDog: true,
  },
  pickup: {
    label: "Pickup",
    price: envPrice('PRICE_PICKUP', 25),
    unit: "per booking",
    perDog: false,
  },
  dropoff: {
    label: "Dropoff",
    price: envPrice('PRICE_DROPOFF', 25),
    unit: "per booking",
    perDog: false,
  },
};

export type ServiceKey = keyof typeof SERVICES;
export type AddonKey = keyof typeof ADDONS;

export type ServicesMap = typeof SERVICES;
export type AddonsMap = typeof ADDONS;

/* ── Form-friendly list (BookingForm only — route.ts/calendar.ts don't use these) ── */
export interface ServiceOption {
  id: ServiceKey;
  label: string;
  price: number;
  unit: string;
  popular?: boolean;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: "boarding", label: "Boarding", price: SERVICES.boarding.price, unit: SERVICES.boarding.unit, popular: true },
  { id: "daycare", label: "Daycare", price: SERVICES.daycare.price, unit: SERVICES.daycare.unit },
  { id: "walking_30", label: "Dog Walking 30 min", price: SERVICES.walking_30.price, unit: SERVICES.walking_30.unit },
  { id: "walking_60", label: "Dog Walking 60 min", price: SERVICES.walking_60.price, unit: SERVICES.walking_60.unit },
  { id: "inhome_30", label: "In-Home Visit 30 min", price: SERVICES.inhome_30.price, unit: SERVICES.inhome_30.unit },
  { id: "inhome_60", label: "In-Home Visit 60 min", price: SERVICES.inhome_60.price, unit: SERVICES.inhome_60.unit },
  { id: "meet_greet", label: "Meet & Greet", price: SERVICES.meet_greet.price, unit: "30 min · free" },
];
