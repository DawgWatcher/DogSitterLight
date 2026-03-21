import { ServiceKey } from "./pricing";

export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
}

export interface DogEntry {
  id: string; // local UUID for form state only
  name: string;
  service: ServiceKey | "";
  // Boarding fields
  dropoffDate: string;
  dropoffTime: string;
  pickupDate: string;
  pickupTime: string;
  // Daycare fields
  daycareDate: string;
  daycareDropoffTime: string;
  daycarePickupTime: string;
  // Walking / In-Home / M&G fields
  appointmentDate: string;
  appointmentTime: string;
  // Upsells
  bath: boolean;
}

export interface BookingState {
  client: ClientInfo;
  dogs: DogEntry[];
  pickupService: boolean; // per-booking
  dropoffService: boolean; // per-booking
}

export interface CartLineItem {
  dogName: string;
  service: string;
  servicePrice: number;
  bathPrice: number;
}

export interface CartSummary {
  lineItems: CartLineItem[];
  subtotal: number;
  pickupPrice: number;
  dropoffPrice: number;
  total: number;
}

export interface BookingPayload {
  client: ClientInfo;
  dogs: DogEntry[];
  pickupService: boolean;
  dropoffService: boolean;
  cart: CartSummary;
}
