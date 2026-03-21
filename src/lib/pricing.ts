// =============================================================
// BRIDGE FORM — HARDCODED PRICING
// These values are throwaway. When the full QBF ships with
// Airtable as the pricing source of truth, this file dies.
// =============================================================

export const SERVICES = {
  boarding: {
    label: "Boarding",
    description: "Kennel-free overnight care — 24hr rate",
    price: 60,
    unit: "per 24 hours",
    hasOverage: true,
    overageRate: 2.5,
    overageUnit: "per hour",
    needsDropoffPickupTimes: true,
    needsDateRange: true,
  },
  daycare: {
    label: "Daycare",
    description: "Kennel-free daytime care",
    price: 45,
    unit: "flat rate",
    hasOverage: false,
    needsDropoffPickupTimes: true,
    needsDateRange: false,
  },
  walking_30: {
    label: "Dog Walking — 30 min",
    description: "30-minute neighborhood walk",
    price: 25,
    unit: "per walk",
    hasOverage: false,
    durationMinutes: 30,
    needsDropoffPickupTimes: false,
    needsDateRange: false,
  },
  walking_60: {
    label: "Dog Walking — 60 min",
    description: "60-minute neighborhood walk",
    price: 45,
    unit: "per walk",
    hasOverage: false,
    durationMinutes: 60,
    needsDropoffPickupTimes: false,
    needsDateRange: false,
  },
  inhome_30: {
    label: "In-Home Visit — 30 min",
    description: "30-minute home check-in, feeding, and potty break",
    price: 30,
    unit: "per visit",
    hasOverage: false,
    durationMinutes: 30,
    needsDropoffPickupTimes: false,
    needsDateRange: false,
  },
  inhome_60: {
    label: "In-Home Visit — 60 min",
    description: "60-minute home visit with walk and care",
    price: 50,
    unit: "per visit",
    hasOverage: false,
    durationMinutes: 60,
    needsDropoffPickupTimes: false,
    needsDateRange: false,
  },
  meet_greet: {
    label: "Meet & Greet",
    description: "Free introductory visit — get to know each other",
    price: 0,
    unit: "free",
    hasOverage: false,
    durationMinutes: 30,
    needsDropoffPickupTimes: false,
    needsDateRange: false,
  },
} as const;

export const ADDONS = {
  bath: {
    label: "Bath",
    price: 20,
    unit: "per dog",
    perDog: true,
  },
  pickup: {
    label: "Pickup",
    price: 25,
    unit: "per booking",
    perDog: false,
  },
  dropoff: {
    label: "Dropoff",
    price: 25,
    unit: "per booking",
    perDog: false,
  },
} as const;

export type ServiceKey = keyof typeof SERVICES;
export type AddonKey = keyof typeof ADDONS;
