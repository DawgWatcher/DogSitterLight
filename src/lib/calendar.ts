import { google } from "googleapis";
import { BookingPayload, DogEntry } from "./types";
import { SERVICES, ServiceKey } from "./pricing";

// ── Auth ──────────────────────────────────────────────────────
function getCalendarClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
  return google.calendar({ version: "v3", auth });
}

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID!;
const TIMEZONE = "America/New_York";

// ── Notification feature flag ─────────────────────────────────
const notificationsEnabled = process.env.ENABLE_NOTIFICATIONS === "true";

// ── Description header ────────────────────────────────────────
const DESCRIPTION_HEADER = `Your booking with ThePupPad is confirmed!
This is a calendar hold for your appointment — no need to RSVP.

────────────────────────

`;

// ── Attendees builder ─────────────────────────────────────────
function buildAttendees(clientEmail: string) {
  if (!notificationsEnabled) return undefined;
  return [
    { email: clientEmail, responseStatus: "accepted" as const },
    { email: process.env.OPERATOR_EMAIL!, responseStatus: "accepted" as const },
  ];
}

// ── Description builder ───────────────────────────────────────
function buildDescription(payload: BookingPayload): string {
  const lines: string[] = [];
  lines.push(`Client: ${payload.client.name}`);
  lines.push(`Email: ${payload.client.email}`);
  lines.push(`Phone: ${payload.client.phone}`);
  lines.push("");

  for (const dog of payload.dogs) {
    const svc = SERVICES[dog.service as ServiceKey];
    lines.push(`Dog: ${dog.name}`);
    lines.push(`Service: ${svc.label}`);
    if (dog.bath) lines.push(`Add-on: Bath ($20)`);
    lines.push("");
  }

  if (payload.pickupService) lines.push("Add-on: Pickup ($25)");
  if (payload.dropoffService) lines.push("Add-on: Dropoff ($25)");
  if (payload.pickupService || payload.dropoffService) lines.push("");

  lines.push("── Price Breakdown ──");
  for (const item of payload.cart.lineItems) {
    const bathStr = item.bathPrice > 0 ? ` + Bath $${item.bathPrice}` : "";
    lines.push(`${item.dogName}: ${item.service} $${item.servicePrice}${bathStr}`);
  }
  if (payload.cart.pickupPrice > 0) lines.push(`Pickup: $${payload.cart.pickupPrice}`);
  if (payload.cart.dropoffPrice > 0) lines.push(`Dropoff: $${payload.cart.dropoffPrice}`);
  lines.push(`TOTAL: $${payload.cart.total}`);

  return DESCRIPTION_HEADER + lines.join("\n");
}

// ── Title builder ─────────────────────────────────────────────
function buildTitle(dogs: DogEntry[], suffix?: string): string {
  const names = dogs.map((d) => d.name).join(" & ");
  const svcLabel = dogs.length === 1
    ? SERVICES[dogs[0].service as ServiceKey].label
    : "Booking";
  const base = `${names} – ${svcLabel}`;
  return suffix ? `${base} (${suffix})` : base;
}

// ── ISO helpers ───────────────────────────────────────────────
function toISODateTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

function addMinutes(date: string, time: string, minutes: number): string {
  const dt = new Date(`${date}T${time}:00`);
  dt.setMinutes(dt.getMinutes() + minutes);
  const h = String(dt.getHours()).padStart(2, "0");
  const m = String(dt.getMinutes()).padStart(2, "0");
  return `${date}T${h}:${m}:00`;
}

// ── Event creation ────────────────────────────────────────────
export async function createBookingEvents(payload: BookingPayload): Promise<string[]> {
  const cal = getCalendarClient();
  const description = buildDescription(payload);
  const attendees = buildAttendees(payload.client.email);
  const createdIds: string[] = [];

  // Group dogs by service type for intelligent event creation
  const boardingDogs = payload.dogs.filter((d) => d.service === "boarding");
  const daycareDogs = payload.dogs.filter((d) => d.service === "daycare");
  const otherDogs = payload.dogs.filter(
    (d) => d.service !== "boarding" && d.service !== "daycare"
  );

  // ── BOARDING: 3 events ────────────────────────────────────
  if (boardingDogs.length > 0) {
    const ref = boardingDogs[0];
    const dogNames = boardingDogs.map((d) => d.name).join(" & ");
    const clientName = payload.client.name;

    // 1. Drop-off (timed event) — sendUpdates: 'none' (silent)
    const dropoffEvent = await cal.events.insert({
      calendarId: CALENDAR_ID,
      sendUpdates: "none",
      requestBody: {
        summary: `${dogNames} – Drop-off (${clientName})`,
        description,
        ...(attendees && { attendees }),
        start: {
          dateTime: toISODateTime(ref.dropoffDate, ref.dropoffTime),
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: addMinutes(ref.dropoffDate, ref.dropoffTime, 30),
          timeZone: TIMEZONE,
        },
        reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 60 }] },
      },
    });
    createdIds.push(dropoffEvent.data.id!);

    // 2. Overnight stay (all-day event) — sendUpdates: 'all' when enabled (the one notification per boarding)
    const endDate = new Date(ref.pickupDate + "T00:00:00");
    endDate.setDate(endDate.getDate() + 1);
    const endDateStr = endDate.toISOString().split("T")[0];

    const stayEvent = await cal.events.insert({
      calendarId: CALENDAR_ID,
      sendUpdates: notificationsEnabled ? "all" : "none",
      requestBody: {
        summary: `${dogNames} – Boarding (${clientName})`,
        description,
        ...(attendees && { attendees }),
        start: { date: ref.dropoffDate },
        end: { date: endDateStr },
        reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 1440 }] },
      },
    });
    createdIds.push(stayEvent.data.id!);

    // 3. Pickup (timed event) — sendUpdates: 'none' (silent)
    const pickupEvent = await cal.events.insert({
      calendarId: CALENDAR_ID,
      sendUpdates: "none",
      requestBody: {
        summary: `${dogNames} – Pickup (${clientName})`,
        description,
        ...(attendees && { attendees }),
        start: {
          dateTime: toISODateTime(ref.pickupDate, ref.pickupTime),
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: addMinutes(ref.pickupDate, ref.pickupTime, 30),
          timeZone: TIMEZONE,
        },
        reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 60 }] },
      },
    });
    createdIds.push(pickupEvent.data.id!);
  }

  // ── DAYCARE: 1 timed block per day ────────────────────────
  if (daycareDogs.length > 0) {
    const ref = daycareDogs[0];
    const dogNames = daycareDogs.map((d) => d.name).join(" & ");
    const clientName = payload.client.name;

    const daycareEvent = await cal.events.insert({
      calendarId: CALENDAR_ID,
      sendUpdates: notificationsEnabled ? "all" : "none",
      requestBody: {
        summary: `${dogNames} – Daycare (${clientName})`,
        description,
        ...(attendees && { attendees }),
        start: {
          dateTime: toISODateTime(ref.daycareDate, ref.daycareDropoffTime),
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: toISODateTime(ref.daycareDate, ref.daycarePickupTime),
          timeZone: TIMEZONE,
        },
        reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 60 }] },
      },
    });
    createdIds.push(daycareEvent.data.id!);
  }

  // ── WALKING / IN-HOME / M&G: 1 timed block each ──────────
  for (const dog of otherDogs) {
    const svc = SERVICES[dog.service as ServiceKey];
    const duration = "durationMinutes" in svc ? svc.durationMinutes : 30;
    const clientName = payload.client.name;

    const event = await cal.events.insert({
      calendarId: CALENDAR_ID,
      sendUpdates: notificationsEnabled ? "all" : "none",
      requestBody: {
        summary: `${dog.name} – ${svc.label} (${clientName})`,
        description,
        ...(attendees && { attendees }),
        start: {
          dateTime: toISODateTime(dog.appointmentDate, dog.appointmentTime),
          timeZone: TIMEZONE,
        },
        end: {
          dateTime: addMinutes(dog.appointmentDate, dog.appointmentTime, duration),
          timeZone: TIMEZONE,
        },
        reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 30 }] },
      },
    });
    createdIds.push(event.data.id!);
  }

  return createdIds;
}
