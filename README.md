# ThePupPad Bridge Booking Form

**Status: BRIDGE / THROWAWAY** — This app exists to take bookings NOW while the full QBF (Quick Booking Form) is being built. When the real app ships, delete this folder.

## What It Does

Multi-step booking form that mirrors the QBF flow:
1. Client info (name, email, phone)
2. Dog info (multi-dog support via "Add Another Dog")
3. Service selection per dog (with date/time inputs)
4. Add-ons (bath per dog, pickup/dropoff per booking)
5. Review with calculated pricing
6. Submits → creates events on your **Boarding & Daycare** Google Calendar

### Calendar Event Structure
- **Boarding:** 3 events — timed drop-off, all-day overnight stay, timed pickup
- **Daycare:** 1 timed block event (drop-off to pickup)
- **Walking / In-Home / M&G:** 1 timed block event

### Hardcoded Pricing
| Service | Price |
|---------|-------|
| Boarding | $60/24hr (+$2.50/hr overage) |
| Daycare | $45 flat |
| Dog Walking 30 min | $25 |
| Dog Walking 60 min | $45 |
| In-Home Visit 30 min | $30 |
| In-Home Visit 60 min | $50 |
| Meet & Greet | Free |
| Bath | $20/dog |
| Pickup | $25/booking |
| Dropoff | $25/booking |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Google Calendar API credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use existing)
3. Enable the **Google Calendar API**
4. Go to **IAM & Admin → Service Accounts → Create Service Account**
5. Create a **JSON key** for the service account and download it
6. In Google Calendar, share your **Boarding & Daycare** calendar with the service account email (give it "Make changes to events" permission)

### 3. Create `.env.local`
```bash
cp .env.local.example .env.local
```
Fill in the values from your downloaded JSON key file:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` — the `client_email` field
- `GOOGLE_PRIVATE_KEY` — the `private_key` field (keep the quotes and \n)
- `GOOGLE_CALENDAR_ID` — already set to your Boarding & Daycare calendar

### 4. Run it
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy (optional)
```bash
npx vercel
```
Set the same env vars in your Vercel project settings.

## What This Does NOT Do
- No Airtable
- No Square / payment processing
- No email lookup / returning client detection
- No write chain
- No auth

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Google Calendar API (via `googleapis` npm package)
- TypeScript
