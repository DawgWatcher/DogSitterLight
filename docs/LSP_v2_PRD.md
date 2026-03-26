# Light Sitter Pro (LSP) v2.0 — Product Requirements Document

**Version:** 2.0
**Date:** 2026-03-26
**Repo:** `DawgWatcher/DogSitterLight` (puppad-bridge-form)
**Live domain:** book.thepuppad.com
**Vercel project:** dogsitterlight

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Information Architecture](#2-information-architecture)
3. [Route Specifications](#3-route-specifications)
4. [Shared Components](#4-shared-components)
5. [File Structure](#5-file-structure-proposed)
6. [Brand Compliance](#6-brand-compliance)
7. [Mobile-First CSS Architecture](#7-mobile-first-css-architecture)
8. [Progressive Loading Architecture](#8-progressive-loading-architecture)
9. [Technical Constraints](#9-technical-constraints)
10. [Environment Variables](#10-environment-variables)
11. [Migration Path](#11-migration-path)
12. [Pre-Build Asset Dependencies](#12-pre-build-asset-dependencies)
13. [Deferred Features](#13-deferred-features)
14. [Open Questions](#14-open-questions)

---

## 1. Product Overview

### What LSP v2.0 Is

Light Sitter Pro (LSP) v2.0 is a **frontend restructure** that expands the existing LSP v1.0 single-page booking form into a **five-route mobile-first site**. The booking form moves from `/` to `/bookings` and receives five defined UI improvements. Four new routes are added: Home (`/`), Services (`/services`), Gallery (`/gallery`), and Contact (`/contact`).

**LSP v2.0 is NOT a rewrite.** It is a controlled expansion with a strict change boundary. The backend pipeline is frozen except for two scoped additions to calendar event descriptions. The booking form is open for five defined UI changes and nothing else.

### What It Replaces

LSP v1.0 is a single-page, single-scroll booking form live at `book.thepuppad.com`. The entire app is one route (`/`) with a hero section and five anchored scroll sections (client info, dog info, service selection, extras, review). All UI lives in a single monolith component: `src/components/BookingForm.tsx`.

### Change Boundary

**Pipeline (`/api/book`, `calendar.ts`, `email.ts`, `types.ts`) — FROZEN with two scoped additions:**

1. Meet & Greet events include format (virtual/in-person) and platform (FaceTime/WhatsApp) in the calendar event description.
2. All booking events include a `Terms accepted: Yes` line in the calendar event description.

No other pipeline changes. Every API contract, every email trigger, every calendar write pattern is preserved exactly.

**Booking form (`BookingForm.tsx`) — OPEN for five defined changes:**

1. Service collapse on selection
2. Meet & Greet virtual/in-person picker
3. iOS-style time picker
4. Terms agreement gate
5. Sticky step tracker with Intersection Observer active state

**Everything outside these seven changes (5 form + 2 pipeline) is untouched.** All form fields, validation rules, cart calculations, tax calculations, and submission behavior not listed above are identical to v1.0.

### Relationship to ThePupPad v3.0

LSP has zero connection to the ppWAv3 repo, Airtable, Square, the write chain, or the Quick Booking Flow (QBF). Do not reference or import from any v3.0 architecture. LSP is a standalone product. v2.0 does not change this boundary.

### Entry Points

Users reach LSP via:
- Text messages (SMS links sent by Dave)
- Instagram bios (@thepuppadnj)
- QR codes (printed materials, business cards)
- Direct links shared in conversations
- Facebook and TikTok profiles

All entry points land on `book.thepuppad.com` — the `/` home route in v2.0.

### Current Pipeline (Preserved)

```
Form Submission → /api/book (route.ts) → calendar.ts → Google Calendar API → Boarding & Daycare calendar
                                       → email.ts → Resend API → client confirmation + operator alert
```

**Calendar write behavior by service type (unchanged):**
- **Boarding** creates **3 calendar events** per submission: one all-day event spanning the stay dates, one timed 30-min Drop-off event, and one timed 30-min Pickup event. All three carry the same description block.
- **Meet & Greet** creates **1 calendar event** per submission.
- **All other services** (Daycare, Walking, In-Home Visit) create **1 calendar event** per submission.

### Current Stack (Unchanged)

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Google Calendar API via GCP Service Account JWT (not OAuth)
- Resend (transactional email)
- Vercel hosting
- No CRM, no payment processor, no auth, no database

---

## 2. Information Architecture

### Site Map

```
book.thepuppad.com
├── /                 (Home)
│   ├── Hero Section
│   ├── Trust Block
│   ├── Trust Signals
│   ├── Featured Review
│   ├── Second CTA
│   └── #meet-our-team (anchor)
├── /services         (Services)
│   ├── Service Catalog (7 services)
│   └── Add-ons
├── /gallery          (Gallery)
│   └── Scroll-driven video scrub clips
├── /bookings         (Bookings)
│   └── 5-section booking form (relocated from v1.0 `/`)
├── /contact          (Contact)
│   ├── Contact info + social links
│   └── "Send Us a Message" form
└── /api
    ├── /api/book     (existing — frozen)
    └── /api/contact  (new — Resend integration)
```

### Content by Route

| Route | Content Type | Primary Action |
|-------|-------------|----------------|
| `/` | Marketing landing page | Drive to `/bookings` |
| `/services` | Service catalog with pricing | Drive to `/bookings` |
| `/gallery` | Video showcase of facility | Build trust, drive to `/bookings` |
| `/bookings` | Interactive booking form | Complete a booking |
| `/contact` | Contact info + message form | Call, email, or message |

### Navigation Model

Three navigation elements work together:

1. **Top nav bar** — visible on all routes, all viewports. Mobile: hamburger + logo + profile placeholder. Desktop (>=768px): logo + five inline nav items + profile placeholder.
2. **Bottom nav bar** — visible on all routes, mobile only (below 768px). Five icon+label tabs. Fixed to bottom of viewport.
3. **Hamburger menu** — mobile only. Slides in from left. Contains nav items + phone number + hours + social links.

### Booking Flow Mapping

The v1.0 single-page flow maps directly to `/bookings` in v2.0:

| v1.0 | v2.0 |
|------|------|
| `/` (hero + form) | `/` is home page; form moves to `/bookings` |
| Hero section in `BookingForm.tsx` | Extracted to `HeroSection.tsx`, rendered on `/` |
| Form sections 1-5 in `BookingForm.tsx` | Remains in `BookingForm.tsx`, rendered on `/bookings` |
| Direct URL `book.thepuppad.com` | Lands on `/` home page; CTA routes to `/bookings` |

---

## 3. Route Specifications

### 3.1 `/` (Home)

The home route is a marketing landing page. Its job is to build trust and drive visitors to `/bookings`.

#### Hero Section

- **Height:** Full viewport on mobile (`100svh`). On desktop, can cap at a comfortable maximum but must feel immersive.
- **Background media:** Looping background video (`public/hero-video.mp4`) — muted, autoplay, loop, playsinline. Same asset as v1.0. Progressive loading: brand colors, text, logo, and CTA are visible on first paint. Video loads behind the content as a visual enhancement, not a gate.
- **Overlay:** Semi-transparent warm plum (`#3E363F`) gradient overlay on the video. Ensures white text is always legible regardless of video frame.
- **Logo:** ThePupPad logo via `public/logo.svg` — rendered in **white** on the hero (over the dark overlay). Displayed in the top nav bar, centered on mobile.
- **Headline:** "A KENNEL-FREE PARADISE." — large, bold, white, uppercase, centered. "PARADISE." on its own line for emphasis. Font: Nunito 800, sized for impact (minimum 36px on mobile, scale up on desktop).
- **Photo band:** Below the headline, a full-bleed horizontal band of real facility photography showing dogs playing freely in ThePupPad's space (navy walls, bright yellow doors visible). Edge-to-edge, no padding. Photo provided by Dave, placed in `public/`.
- **Promo Badge:** "First Night Free — For first-time customers" — gold (`#FFCA4B`) text, glassmorphism pill (semi-transparent white/cream background with backdrop blur). Positioned above or near the headline. Promotion is active.
- **Subline:** "Where every pup plays freely and stays in comfort." — white text, centered, below the photo band. Nunito 400, 16-18px.
- **Primary CTA:** "BOOK THEIR STAY" — gold pill button (`background: #FFCA4B`, `color: #3E363F`), full-width on mobile (with horizontal page padding), `border-radius: 999px`. Links to `/bookings`. Touch target 48px minimum height.
- **Secondary link:** "Meet Our Team" — white/cream text, underlined, centered below the CTA. Anchor link to `#meet-our-team` section on the same page.

#### Trust Block

Full-width section immediately below the hero. Three headline-level statistics displayed big and bold. These are the first thing a visitor sees after the hero. They are the primary conversion numbers — not small footnotes.

| Stat | Value | Source |
|------|-------|--------|
| Stars | **5.0** | Rover reviews |
| Reviews | **617** | Verified on Rover |
| Repeat Families | **329** | Returning clients on Rover |

**Layout:** Three columns on desktop, stacked vertically or in a scrollable row on mobile. Each stat has the number displayed large (Nunito 800, 40-48px) with the label below (Nunito 600, 14-16px). Gold accent on the number or a gold underline/decoration.

**Background:** White (`#FFFFFF`) or Cream (`#F2F0E6`) to contrast with the dark hero above.

#### Trust Signals

Four brief statements, each with a bold heading and one-sentence description. Displayed as a vertical list or a 2x2 grid on wider screens.

1. **Kennel-Free, Always.** No cages, no kennels. Your dog roams freely in our home — couches included.
2. **Daily Photo & Video Updates.** You'll never wonder how they're doing. We send multiple updates every day.
3. **Large Fenced Yard.** Plenty of room to run, play, and tire themselves out.
4. **Meet Us First.** Every new family starts with a free Meet & Greet. No commitment until you're comfortable.

**Style:** Heading in Nunito 700, warm plum text. Description in Nunito 400, warm plum text at reduced opacity or lighter weight. Optional gold icon/bullet before each heading.

#### Featured Review

A short client review quote sourced from Rover. Displayed with:
- Quote text in italics or with quotation marks
- Client first name
- Star rating (5 gold stars)
- Cream (`#F2F0E6`) background card with generous padding, rounded corners (16px)

**Content:** Placeholder — Dave selects the exact quote. The component renders whatever string is hardcoded in the source.

#### Second CTA

"Book Their Stay" — gold pill button linking to `/bookings`. Same style as hero CTA. Full-width on mobile. Centered with generous vertical margin (64-80px above and below).

#### Meet Our Team (Anchor: `#meet-our-team`)

Four team member cards in a vertical stack on mobile, horizontal row or 2x2 grid on desktop.

| Name | Role | Bio |
|------|------|-----|
| David | Dog Trainer | 10 years experience, LIMA-certified. Specializes in behavior modification. Primary caretaker and builder of ThePupPad's digital assets. |
| Lexi | Certified Trainer & Facility Manager | LIMA approach (Least Invasive, Minimally Aversive). Cares for dogs, trains them, and keeps operations running smoothly. |
| Juju | Groomer | Specializes in dogs that are difficult to groom due to personality or disabilities. |
| Liz | Owner | Tech background. Responsible for all digital operations and business profitability. |

**Card design:**
- Photo at top (circular or rounded square crop). Photos provided by Dave, placed in `public/team/david.jpg`, `public/team/lexi.jpg`, `public/team/juju.jpg`, `public/team/liz.jpg`.
- Name: Nunito 700, warm plum (`#3E363F`)
- Role: Nunito 600, gold (`#FFCA4B`) or gold-on-cream pill badge
- Bio: Nunito 400, warm plum, 14-15px
- Card background: Cream (`#F2F0E6`), border-radius 16px, generous padding (24px)

---

### 3.2 `/services` (Services)

Service catalog page displaying all LSP services with descriptions, prices, and a CTA per service that routes to `/bookings`.

#### Service Cards

Boarding is the flagship service and receives visual priority — larger card, "Most Popular" badge, or top positioning. All other services are organized logically below.

| Service | ServiceKey | Price | Unit | Description |
|---------|-----------|-------|------|-------------|
| Boarding | `boarding` | $60 | per night | Your dog stays in our home, not a cage. Free-roam, kennel-free, with overnight supervision and all the couch space they can claim. Drop off when you're ready, pick up when you're back. |
| Daycare | `daycare` | $45 | per day | A full day of play, naps, and socialization in a small-group, cage-free environment. Perfect for work days or when your pup just needs to burn some energy. |
| Dog Walking (30 min) | `walking_30` | $25 | per walk | A neighborhood walk with one-on-one attention. We come to you, leash up, and get them moving. |
| Dog Walking (60 min) | `walking_60` | $45 | per walk | The longer loop. More sniffs, more steps, more time outside for dogs who need the extra stretch. |
| In-Home Visit (30 min) | `inhome_30` | $30 | per visit | We stop by your place to let them out, check in, and make sure everything's good. Ideal for mid-day breaks or quick check-ins while you're out. |
| In-Home Visit (60 min) | `inhome_60` | $50 | per visit | A longer visit — enough time for a walk, feeding, play, and some real company. For days when they need more than a pop-in. |
| Meet & Greet | `meet_greet` | Free | 30 min | Come see the space, meet us, and let your dog sniff around before committing to anything. We want everyone comfortable — you and your pup. |

**Card design:**
- White (`#FFFFFF`) or cream (`#F2F0E6`) background, border-radius 16px
- Service name: Nunito 700, warm plum
- Price: Nunito 800, large (24-28px), warm plum. Unit in Nunito 400, smaller, muted.
- Description: Nunito 400, warm plum, 14-15px
- CTA button per card: "Book Now" — gold pill button linking to `/bookings`
- Boarding card: gold border or "Most Popular" badge in gold

**Note:** The CTA routes to `/bookings` without pre-selecting a service. Service pre-selection from this page is a deferred feature (see Section 13).

#### Add-ons Section

Displayed below the service cards in a horizontal row or compact grid.

| Add-on | Price | Unit |
|--------|-------|------|
| Bath | $20 | per dog |
| Pickup | $25 | per booking |
| Dropoff | $25 | per booking |

Styled as smaller cards or pills. Informational only — add-ons are selected during the booking flow on `/bookings`.

#### Prices Source

All prices displayed on this page are read from `pricing.ts`, which in v2.0 reads from environment variables with hardcoded fallback defaults (see Section 9, Pricing Migration). The `/services` page is a server component that can read `process.env` directly or import from `pricing.ts`.

---

### 3.3 `/gallery` (Gallery)

Fullscreen scroll-driven video scrub gallery. The interaction model is "drag through a living photograph" — video playback is tied to scroll position, not time. The video does not auto-play. It only moves when the user scrolls.

#### Interaction Model

- Each video clip occupies a **scroll region taller than the viewport** — approximately 3-5x viewport height per 6-second clip. This provides a smooth frame-to-pixel scrub ratio. Starting recommendation: **4x viewport height** per clip, tuned during build.
- As the user scrolls down within a clip's scroll region, JavaScript maps the scroll position to `video.currentTime`, scrubbing through the clip frame by frame.
- **On finger release (mobile) or scroll stop (desktop):** The view snaps forward to the top of the next video's scroll region. No mid-clip parking — every clip resolves itself.
- **On scroll up:** The view snaps backward to the top of the previous clip's scroll region. The previous clip is ready to be scrubbed forward again on the next downward scroll. No reverse playback.
- The mechanic is identical on mobile and desktop — touch drives it on mobile, trackpad/mouse wheel drives it on desktop.

#### Scroll-to-Time Mapping

For a 6-second clip at 30fps (180 frames) in a scroll region of 4x viewport height (approximately 2680px on a 670px mobile viewport):

```
scrollProgress = (scrollTop - clipRegionStart) / clipRegionHeight
video.currentTime = scrollProgress * video.duration
```

The mapping is linear. Each pixel of scroll corresponds to approximately 1 frame. The result is a film-strip-like scrub feel.

#### Snap Behavior

When the user releases their finger (mobile `touchend`) or stops scrolling (desktop scroll idle detected via `setTimeout` debounce, approximately 150ms):

- If `scrollProgress >= 0.5` (past halfway through the clip): snap forward to the top of the next clip's scroll region.
- If `scrollProgress < 0.5`: snap backward to the top of the current clip's scroll region.
- Snap animation: `scrollTo` with `behavior: 'smooth'`.

On scroll up past the top of a clip's scroll region: snap backward to the top of the previous clip's scroll region.

#### Video Handling

- Source clips: 6 seconds long, landscape aspect ratio, provided by Dave and placed in `public/gallery/`. File names TBD (e.g., `clip-01.mp4`, `clip-02.mp4`).
- `<video>` element attributes: `muted`, `playsinline`, `preload="auto"` (for the visible clip and next clip only). No `autoplay`, no `loop`, no `controls`.
- `object-fit: cover` fills the viewport regardless of aspect ratio. On mobile (portrait viewport), this crops the left/right edges of landscape video. On desktop (landscape viewport), the native aspect ratio fits naturally with minimal or no cropping.
- No letterboxing, no pillarboxing. The video always fills the screen edge to edge.

#### Performance

- **Lazy loading:** Only the visible clip and the next one down are loaded at any time. Use Intersection Observer to detect when a clip's scroll region enters the viewport, then set `src` on the `<video>` element. Remove `src` from clips that are more than one position away.
- **Progressive loading:** Video containers render with warm plum (`#3E363F`) placeholder backgrounds before clips load. Smooth transition when video becomes available.
- **`prefers-reduced-motion`:** When active, disable scroll-driven scrub entirely. Show a static poster frame (`poster` attribute on `<video>`) for each clip instead. Clips are displayed as a simple vertical stack of images, scrollable normally.

#### Layout

- No bottom nav padding needed — the gallery is fullscreen. The bottom nav overlays the gallery content (transparent or semi-transparent background on the gallery route, or hidden during active scrub).
- Top nav remains visible. The gallery content starts below the top nav.
- No text overlays, no captions. Video only.

---

### 3.4 `/bookings` (Bookings)

This is the existing booking form. The current LSP v1.0 `BookingForm.tsx` functionality lives here. The form receives five defined UI improvements. Everything else is preserved as-is.

#### Preserved As-Is

- The existing 5-section scroll form: client info (section `you`) → dog info (section `dog`) → service selection (section `service`) → extras (section `extras`) → review (section `review`)
- The existing API pipeline: `POST /api/book` → `calendar.ts` → `email.ts`
- Existing data contracts: `BookingPayload`, `DogEntry`, `CartSummary`, `CartLineItem` (in `src/lib/types.ts`)
- All form fields, validation rules, cart calculations (`buildCart` function), NJ tax rate (`0.06625`), and submission behavior not listed in the five changes are identical to v1.0
- The canvas-drawn hero animation is removed (it was part of the hero section, now extracted to `HeroSection.tsx` on `/`). The booking form no longer has a hero.

#### UI Improvement 1: Service Collapse on Selection

**Current behavior:** All seven service cards are visible at all times in the service section. The selected service has a gold border; unselected services remain visible.

**New behavior:**
- **Initial state:** All seven service cards are displayed, same as v1.0.
- **On selection:** The unselected services collapse/hide with a smooth animation (height transition, 200-300ms). Only the selected service card remains visible.
- **Change affordance:** A "Change Service" text link or a tap on the selected service card re-expands the full list.
- **Exception:** When Meet & Greet is selected, the card remains visible AND the virtual/in-person picker appears below it (see UI Improvement 2).

**Animation:** CSS `max-height` transition or similar. Unselected cards animate to `max-height: 0; opacity: 0; overflow: hidden`. Selected card remains full height.

#### UI Improvement 2: Meet & Greet Virtual/In-Person Picker

**Trigger:** User selects Meet & Greet as their service.

**New UI elements (appear below the Meet & Greet service card):**

1. **Format picker:** Two pill buttons side by side — "In-Person" and "Virtual". Default: neither selected. User must choose one.
2. **Platform picker (conditional):** When "Virtual" is selected, a secondary picker appears with two options: "FaceTime" and "WhatsApp". When "In-Person" is selected, no platform picker appears.

**Data flow:**
- Selected format and platform are stored in component state. Two new fields on `DogEntry` (or a parallel state object):
  - `meet_greet_format`: `'in-person' | 'virtual' | ''`
  - `meet_greet_platform`: `'facetime' | 'whatsapp' | ''` (only when format is `'virtual'`)
- On form submission, these values are included in the `BookingPayload` and written to the calendar event description by `calendar.ts`:
  - In-person: `Format: In-Person`
  - Virtual: `Format: Virtual (FaceTime)` or `Format: Virtual (WhatsApp)`

**Pipeline change (scoped):** `buildDescription()` in `calendar.ts` adds a `Format:` line for Meet & Greet events. No other description lines change.

**Type change (scoped):** `DogEntry` in `types.ts` gains two optional fields:
```
meet_greet_format?: 'in-person' | 'virtual' | '';
meet_greet_platform?: 'facetime' | 'whatsapp' | '';
```

#### UI Improvement 3: iOS-Style Time Picker

**Current behavior:** Standard HTML `<input type="time">` or text input for time selection.

**New behavior:** An iOS-style scroll wheel (drum roller) picker. The wheel scrolls through hours and minutes with momentum, snapping to discrete values.

**Specification:**
- **Columns:** Two wheels side by side — Hour (1-12) and Minute (00, 15, 30, 45) — plus an AM/PM toggle.
- **Snap behavior:** Each wheel snaps to the nearest valid value after the user releases their touch/scroll.
- **Momentum:** Flick scrolling with deceleration, like a native iOS picker.
- **Visual:** A highlight band across the center of the wheel indicates the selected value. Items above and below the center are slightly faded or smaller (perspective effect).
- **Touch:** Touch-native feel on mobile — responds to `touchstart`, `touchmove`, `touchend` with velocity tracking.
- **Desktop:** Mouse wheel scrolls through values. Click-and-drag also works.
- **Value output:** The selected time is written back to the same state fields used by v1.0 (`dropoffTime`, `pickupTime`, `daycareDropoffTime`, `daycarePickupTime`, `appointmentTime`) in `HH:MM` 24-hour format, preserving the existing data contract.

**This picker replaces all time inputs in the form** — boarding drop-off/pickup times, daycare drop-off/pickup times, and appointment times for walking/in-home/M&G.

#### UI Improvement 4: Terms Agreement Gate

**Location:** Review section (section 5), above the submit button.

**Components:**

1. **Agreement text container:** A scrollable `<div>` with `overflow-y: auto`, fixed height (approximately 200-250px on mobile), containing the full service agreement text. The agreement text is a static string hardcoded in the component — no CMS, no database, no external fetch. Text content is provided by Dave.

2. **Scroll-to-bottom detection:**
   - An Intersection Observer or scroll event listener watches for the user reaching the bottom of the agreement text.
   - When the bottom is reached, the checkbox below becomes enabled (not checked — just enabled, allowing the user to check it).
   - **Short document fallback:** If the agreement text fits entirely in the container without scrolling (i.e., `scrollHeight <= clientHeight`), the checkbox is enabled immediately on render.

3. **Checkbox:** "I have read and agree to the service agreement" — initially disabled (grayed out, non-interactive). Becomes enabled when scroll-to-bottom is detected. User must check the checkbox to proceed.

4. **Submit button gate:** The existing submit button is disabled (`opacity: 0.5`, `pointer-events: none`) until the checkbox is checked. When checked, the submit button enables.

**Data flow:**
- On submission, `Terms accepted: Yes` is appended to the calendar event description by `calendar.ts`.
- A `terms_accepted: boolean` field is added to `BookingPayload` (or the description builder checks a flag).

**Pipeline change (scoped):** `buildDescription()` in `calendar.ts` adds `Terms accepted: Yes` as the last line of the description for all booking events (all service types).

**Type change (scoped):** `BookingPayload` in `types.ts` gains:
```
terms_accepted: boolean;
```

#### UI Improvement 5: Sticky Step Tracker with Active State

**Current behavior:** The step tracker (five circles labeled "you, dog, service, extras, review" connected by a progress line) scrolls with the page. Once the user scrolls past it, it is no longer visible. The active-state logic has never been testable because the tracker leaves the viewport before any section transitions occur.

**New behavior:** The step tracker becomes `position: sticky`, pinned below the top nav bar. As the user scrolls through form sections, the tracker remains visible and the active gold dot advances to indicate the current section.

**Specification (from scratch — do not inherit v1.0 active-state logic):**

1. **Sticky positioning:**
   - `position: sticky`
   - `top: [top-nav-height]` — the exact pixel value of the top nav bar height (approximately 56-64px). This ensures the tracker pins directly below the nav bar with no gap.
   - `z-index: 40` (below the top nav at `z-index: 50`, above page content)
   - White background (`#FFFFFF`) with a subtle bottom shadow or border to separate from form content below.

2. **Active state via Intersection Observer:**
   - Each form section (`you`, `dog`, `service`, `extras`, `review`) has a corresponding DOM element with a `data-section` attribute or `id`.
   - An Intersection Observer watches all five section elements.
   - **Threshold:** `0` (fires as soon as any part of the section enters the viewport).
   - **Root margin:** Negative top margin equal to the combined height of the top nav + step tracker (approximately `-120px 0px 0px 0px`). This ensures the "active" section is the one whose top edge has scrolled past the sticky tracker, not the one that is merely somewhere on screen.
   - **Active determination:** The active section is the last section (in DOM order) whose top edge has crossed above the root margin boundary. When multiple sections are intersecting, the one furthest down the page (latest in DOM order) that has entered wins.
   - **On intersection change:** Update state to set the active section. The corresponding dot fills gold (`#FFCA4B`) and its label text becomes gold. All other dots revert to outline-only (warm plum border, no fill) with warm plum labels.

3. **Progress line:**
   - A horizontal line connecting the five dots.
   - The portion of the line before the active dot is gold (`#FFCA4B`).
   - The portion after the active dot is light/muted (warm plum at low opacity or cream).
   - Transition: the gold fill of the line animates smoothly (CSS transition, 300ms).

4. **Dot design:**
   - Inactive: 12px circle, 2px warm plum (`#3E363F`) border, no fill (transparent center).
   - Active: 12px circle, filled gold (`#FFCA4B`), no border (or gold border).
   - Completed (sections before the active one): filled gold, same as active.
   - Label below each dot: section name in 10-11px Nunito 600, color matches dot state.

5. **Tap behavior:** Tapping a dot scrolls the form to the corresponding section. Use `element.scrollIntoView({ behavior: 'smooth', block: 'start' })` with an offset for the sticky header height.

---

### 3.5 `/contact` (Contact)

Contact information page with direct communication options and a message form.

#### Contact Information

| Field | Value | Display |
|-------|-------|---------|
| Phone | 908-902-6008 | Tap-to-call button |
| Email | bookings@thepuppad.com | Tap-to-email link |
| Hours | 7am - 7pm | Text display |
| Instagram | @thepuppadnj | Icon + link (opens in new tab) |
| Facebook | The Pup Pad | Icon + link (opens in new tab) |
| TikTok | @thepuppad | Icon + link (opens in new tab) |
| Service area | Monroe Township, NJ and surrounding areas | Text display |

#### Tap-to-Call Button

- Prominent gold pill button (`background: #FFCA4B`, `color: #3E363F`)
- Phone number displayed on the button: "908-902-6008"
- `href="tel:9089026008"`
- Touch target: 48px minimum height
- Full-width on mobile

#### Tap-to-Email

- Secondary style: transparent background, warm plum (`#3E363F`) border, warm plum text
- `href="mailto:bookings@thepuppad.com"`
- Below the phone button

#### Social Links

- Displayed as solid, filled icons. Warm plum (`#3E363F`) default color.
- Each link opens in a new tab (`target="_blank"`, `rel="noopener noreferrer"`)
- Horizontal row with adequate spacing (minimum 48px touch targets per icon)
- Instagram: `https://instagram.com/thepuppadnj`
- Facebook: `https://facebook.com/ThePupPad` (URL TBD — Dave confirms)
- TikTok: `https://tiktok.com/@thepuppad`

#### "Send Us a Message" Form

**Fields:**

| Field | Type | Required | Placeholder |
|-------|------|----------|-------------|
| Name | text | Yes | "Your name" |
| Email | email | Yes | "your@email.com" |
| Message | textarea | Yes | "How can we help?" |

**Submit button:** "Send Message" — gold pill button, Brand Guardian styling. Full-width on mobile.

**API route:** `POST /api/contact`

**Request body:**
```json
{
  "name": "string",
  "email": "string",
  "message": "string"
}
```

**Backend behavior:** The `/api/contact` route sends the message to `bookings@thepuppad.com` via Resend. Uses the existing `RESEND_API_KEY` environment variable. No new env vars needed.

**Email sent to operator:**
- From: `ThePupPad <bookings@thepuppad.com>`
- To: `bookings@thepuppad.com`
- Subject: `Contact Form: [name]`
- Body: Plain text with name, email, and message content. Includes a `Reply-To` header set to the submitter's email address so Dave can reply directly.

**Success state:** Form clears. Success message displayed: "Message sent! We'll get back to you soon." — green or gold text, or a subtle card.

**Error state:** Error message displayed: "Something went wrong. Please call us at 908-902-6008." — the phone number is a `tel:` link.

**Validation:** Client-side validation for required fields and email format. Server-side validation in the API route (reject if name, email, or message is missing).

---

## 4. Shared Components

### 4.1 AppShell (`src/components/AppShell.tsx`)

Shared layout wrapper rendered on every route via `src/app/layout.tsx`. Contains the top nav, bottom nav (mobile only), and a content slot.

**Structure:**
```
<AppShell>
  <TopNav />
  <main>{children}</main>
  <BottomNav />  {/* mobile only, below 768px */}
</AppShell>
```

**Responsibilities:**
- Renders top nav bar on all routes
- Renders bottom nav bar on mobile (below 768px), hidden on desktop
- Provides consistent page padding and max-width constraints
- Handles the `isHome` context (for logo color switching — white on `/`, warm plum elsewhere)

### 4.2 Top Navigation Bar (`TopNav`)

#### Mobile (below 768px)

| Position | Element | Behavior |
|----------|---------|----------|
| Left | Hamburger icon (three horizontal lines) | Opens hamburger menu. Warm plum (`#3E363F`) color. |
| Center | ThePupPad logo (`public/logo.svg`) | White fill on `/` (hero overlay), warm plum fill on all other routes. Same SVG, fill controlled via CSS `color` + `currentColor` in the SVG. |
| Right | Profile/user icon (circle with person silhouette) | Non-functional in v2.0. Visual placeholder only. Warm plum color. |

- Height: 56-64px
- Background: transparent on `/` (over hero), white on all other routes
- `position: fixed` or `sticky` at top of viewport
- `z-index: 50`
- Bottom border or shadow on non-home routes for separation

#### Desktop (>=768px)

| Position | Element | Behavior |
|----------|---------|----------|
| Left | ThePupPad logo | Warm plum fill. Links to `/`. |
| Center | Five nav items inline | Home, Services, Gallery, Bookings, Contact. Active = gold text. Inactive = warm plum text. |
| Right | Profile/user icon | Non-functional placeholder. |

- No hamburger icon on desktop
- Nav items are horizontal, evenly spaced or centered
- Font: Nunito 600, 14-15px

### 4.3 Bottom Navigation Bar (`BottomNav`)

**Visible only below 768px.** Hidden on desktop via `display: none` at the 768px breakpoint.

Fixed at the bottom of the viewport on all routes.

| Position | Label | Icon File | Route |
|----------|-------|-----------|-------|
| 1 | Home | `public/icons/home.svg` | `/` |
| 2 | Services | `public/icons/services.svg` | `/services` |
| 3 | Gallery | `public/icons/gallery.svg` | `/gallery` |
| 4 | Bookings | `public/icons/bookings.svg` | `/bookings` |
| 5 | Contact | `public/icons/contact.svg` | `/contact` |

**Active state:** Gold (`#FFCA4B`) fill on icon SVG + gold label text.
**Inactive state:** Warm plum (`#3E363F`) fill on icon SVG + warm plum label text.

**Implementation:**
- SVG icons loaded inline (not as `<img>`) so CSS `fill` or `color` can control the icon color. Use Next.js SVG import or inline SVG components.
- `currentColor` in SVG `fill` attributes, controlled by parent `color` CSS property.
- Background: white (`#FFFFFF`)
- Top border: `1px solid rgba(62, 54, 63, 0.1)` or subtle shadow (`box-shadow: 0 -1px 4px rgba(0,0,0,0.06)`)
- Touch targets: 48px minimum per item (each tab occupies 1/5 of viewport width, minimum 48px tall)
- Icon size: 24px
- Label: Nunito 600, 10-11px, centered below icon
- `position: fixed`, `bottom: 0`, `left: 0`, `right: 0`
- `z-index: 50`
- `padding-bottom: env(safe-area-inset-bottom)` for devices with home indicators (iPhone X+)

**Content padding:** All page content must have `padding-bottom` equal to the bottom nav height (approximately 56-64px + safe area) to prevent the nav from overlapping the last content on the page.

### 4.4 Hamburger Menu (Mobile Only)

Opens when the hamburger icon in the top nav is tapped. Closes when a nav item is tapped, the close button is tapped, or the overlay is tapped.

**Contents:**
- Five nav items: Home, Services, Gallery, Bookings, Contact (same as bottom nav)
- Phone: 908-902-6008 (tap-to-call, `tel:9089026008`)
- Hours: 7am - 7pm
- Social links: Instagram @thepuppadnj, Facebook "The Pup Pad", TikTok @thepuppad

**Animation:** Slides in from the left edge or overlays from the top. Backdrop overlay (semi-transparent dark) behind the menu.

**Style:**
- White or cream background
- Nav items: Nunito 700, 18-20px, warm plum text. Active item highlighted in gold.
- Contact info: Nunito 400, 14px, warm plum text
- Close button: X icon in top-right of menu panel

### 4.5 Footer

- **Mobile:** The bottom nav replaces a traditional footer. No separate footer component on mobile.
- **Desktop:** A minimal footer with contact info (phone, email, hours) and social links. Warm plum background (`#3E363F`) with white/cream text, or cream background with warm plum text. Rendered below page content, above nothing (no bottom nav on desktop).

---

## 5. File Structure (Proposed)

```
puppad-bridge-form/
├── CLAUDE.md
├── .env.local.example
├── docs/
│   └── LSP_v2_PRD.md                      (this document)
├── public/
│   ├── robots.txt
│   ├── hero-video.mp4                      (existing)
│   ├── logo-web.png                        (existing, legacy)
│   ├── logo.svg                            (custom SVG, currentColor fill)
│   ├── icons/
│   │   ├── home.svg                        (bottom nav icon)
│   │   ├── services.svg                    (bottom nav icon)
│   │   ├── gallery.svg                     (bottom nav icon)
│   │   ├── bookings.svg                    (bottom nav icon)
│   │   └── contact.svg                     (bottom nav icon)
│   ├── team/
│   │   ├── david.jpg                       (team photo — owner provides)
│   │   ├── lexi.jpg                        (team photo — owner provides)
│   │   ├── juju.jpg                        (team photo — owner provides)
│   │   └── liz.jpg                         (team photo — owner provides)
│   └── gallery/
│       ├── clip-01.mp4                     (gallery video — owner provides)
│       ├── clip-02.mp4                     (gallery video — owner provides)
│       └── ...                             (additional clips TBD)
└── src/
    ├── app/
    │   ├── layout.tsx                      (root layout — renders AppShell)
    │   ├── page.tsx                        (Home route `/`)
    │   ├── globals.css
    │   ├── bookings/
    │   │   └── page.tsx                    (Bookings route `/bookings`)
    │   ├── services/
    │   │   └── page.tsx                    (Services route `/services`)
    │   ├── gallery/
    │   │   └── page.tsx                    (Gallery route `/gallery`)
    │   ├── contact/
    │   │   └── page.tsx                    (Contact route `/contact`)
    │   └── api/
    │       ├── book/
    │       │   └── route.ts                (existing — frozen)
    │       └── contact/
    │           └── route.ts                (new — contact form handler)
    ├── components/
    │   ├── AppShell.tsx                    (shared layout: top nav + bottom nav + content)
    │   ├── TopNav.tsx                      (top navigation bar)
    │   ├── BottomNav.tsx                   (bottom navigation bar — mobile only)
    │   ├── HamburgerMenu.tsx              (mobile slide-out menu)
    │   ├── HeroSection.tsx                (hero content, extracted from BookingForm.tsx)
    │   ├── BookingForm.tsx                (booking form with 5 UI improvements)
    │   ├── TrustBlock.tsx                 (trust statistics section)
    │   ├── TrustSignals.tsx               (four trust statement cards)
    │   ├── FeaturedReview.tsx             (client review quote)
    │   ├── TeamSection.tsx                (Meet Our Team cards)
    │   ├── ServiceCatalog.tsx             (service cards for /services)
    │   ├── ContactForm.tsx                (Send Us a Message form)
    │   ├── ScrollVideoGallery.tsx         (scroll-driven video scrub gallery)
    │   ├── TimePicker.tsx                 (iOS-style drum roller time picker)
    │   ├── TermsAgreement.tsx             (scrollable terms + checkbox gate)
    │   └── StepTracker.tsx                (sticky step tracker with IO active state)
    └── lib/
        ├── calendar.ts                     (existing — 2 scoped additions)
        ├── email.ts                        (existing — frozen)
        ├── pricing.ts                      (migrated to env var reader)
        └── types.ts                        (existing — minor additions)
```

### Component Decomposition from BookingForm.tsx

| Component | File | Extracted From | Purpose |
|-----------|------|---------------|---------|
| `HeroSection` | `src/components/HeroSection.tsx` | Hero/landing content in `BookingForm.tsx` (canvas animation, headline, CTA) | Full-viewport hero with video background, headline, promo badge, CTA. Rendered on `/` via `src/app/page.tsx`. |
| `BookingForm` | `src/components/BookingForm.tsx` | Form sections 1-5 + cart logic + validation + submit handler | The booking form with five scoped UI improvements. Rendered on `/bookings` via `src/app/bookings/page.tsx`. |
| `AppShell` | `src/components/AppShell.tsx` | New component (does not exist in v1.0) | Shared layout wrapper with top nav + bottom nav (mobile) + content slot. Used in `src/app/layout.tsx`. |

### New Standalone Components

| Component | File | Purpose |
|-----------|------|---------|
| `TimePicker` | `src/components/TimePicker.tsx` | iOS-style scroll wheel time picker. Used by `BookingForm.tsx`. |
| `TermsAgreement` | `src/components/TermsAgreement.tsx` | Scrollable terms text + checkbox gate. Used by `BookingForm.tsx`. |
| `StepTracker` | `src/components/StepTracker.tsx` | Sticky step tracker with Intersection Observer active state. Used by `BookingForm.tsx`. |
| `ScrollVideoGallery` | `src/components/ScrollVideoGallery.tsx` | Scroll-driven video scrub gallery. Used by `/gallery` route. |
| `ContactForm` | `src/components/ContactForm.tsx` | Send Us a Message form. Used by `/contact` route. |

---

## 6. Brand Compliance

### Brand Guardian Palette

| Token | Hex | Usage | Ratio |
|-------|-----|-------|-------|
| White | `#FFFFFF` | Page backgrounds, card backgrounds, nav backgrounds | 60% |
| Cream | `#F2F0E6` | Section backgrounds, card fills, input backgrounds, trust block | 30% |
| Gold | `#FFCA4B` | Primary buttons, active states, accents, badges, progress indicators | 10% |
| Warm Plum | `#3E363F` | Body text, headings, icons (inactive), borders | Text color |
| Gold Hover | `#E8B83E` | Hover/pressed state for gold buttons | Interactive |

**Page background:** White (`#FFFFFF`) across all routes.

### Typography

- **Font family:** Nunito only. Loaded via Google Fonts or self-hosted.
- **Weights:** 400 (body), 600 (labels, nav items), 700 (headings, names), 800 (hero headline, stats)
- **No serif fonts.** No geometric or clinical fonts (no Inter, no Roboto, no SF Pro).
- **Scale:**
  - Hero headline: 36-48px (Nunito 800)
  - Section headings: 24-28px (Nunito 700)
  - Card titles: 18-20px (Nunito 700)
  - Body text: 15-16px (Nunito 400)
  - Labels/captions: 12-14px (Nunito 600)
  - Nav labels: 10-11px (Nunito 600)

### Buttons

All buttons are **pill-shaped** (`border-radius: 999px`). No sharp corners anywhere in the UI.

| Type | Background | Text Color | Border | Hover |
|------|-----------|------------|--------|-------|
| Primary | `#FFCA4B` (Gold) | `#3E363F` (Warm Plum) | None | `#E8B83E` (Gold Hover) |
| Secondary | Transparent | `#3E363F` (Warm Plum) | `2px solid #3E363F` | Light plum fill |

- Minimum height: 48px (touch target)
- Padding: `14px 32px`
- Font: Nunito 700, 15-16px
- Full-width on mobile for primary CTAs

### Icons

- Custom SVGs in `public/icons/`
- Default fill: Warm plum (`#3E363F`)
- Active/accent fill: Gold (`#FFCA4B`)
- Fill controlled via CSS (`currentColor` in SVG), not baked into the SVG file
- Icon size: 24px in nav bars

### Photography

- Candid, warm lighting. No posed studio shots.
- No borders or frames on images.
- Show the environment — dogs in the home, yard, playing together.
- `border-radius: 0` for full-bleed images, `border-radius: 16px` for card images.

### Spacing

- Generous whitespace between sections: 48px minimum, 64-80px preferred
- Card internal padding: 24px
- Page horizontal padding: 20-24px on mobile, wider on desktop
- Between form fields: 16px
- Between section heading and content: 16-24px

### Voice

- Casual, warm, direct
- Contractions always ("we're", "you'll", "they're")
- Short sentences
- No corporate filler ("leverage", "synergy", "solution")
- Second person ("your dog", "you'll love it")
- Friendly without being cutesy

---

## 7. Mobile-First CSS Architecture

### Base and Breakpoints

| Breakpoint | Target | Notes |
|------------|--------|-------|
| Base | 375px | Default styles target iPhone SE / small phones |
| `min-width: 480px` | Large phones | Minor layout adjustments |
| `min-width: 768px` | Tablets / small laptops | Desktop nav, bottom nav hidden, grid layouts |
| `min-width: 1024px` | Desktop | Max-width containers, wider spacing |

**No `max-width` breakpoints.** All responsive styles use `min-width` only.

### Viewport

- Use `100svh` (small viewport height), not `100vh`. This prevents the address bar on mobile from causing layout jumps.
- `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">` (carried from v1.0)

### Touch Targets

- All interactive elements: 48px minimum touch target (height and width)
- Bottom nav items: at least 48px tall, width = 1/5 of viewport
- Buttons: minimum 48px height
- Form inputs: 46-48px height

### Accessibility

- `prefers-reduced-motion: reduce`:
  - Gallery: disable scroll-driven video scrub, show static poster frames
  - Hero: video can be static or paused, content still visible
  - Animations: reduce or disable transitions
- `-webkit-tap-highlight-color: transparent` on all interactive elements
- Focus styles: gold outline (`outline: 2px solid #FFCA4B`) for keyboard navigation
- Color contrast: warm plum on white/cream backgrounds passes WCAG AA

### Bottom Nav Spacing

- Bottom nav visible only below 768px
- All page content has `padding-bottom` equal to bottom nav height + safe area inset
- `padding-bottom: calc(64px + env(safe-area-inset-bottom))` on the `<main>` content area

### Top Nav Behavior

- Below 768px: hamburger + centered logo + profile placeholder
- At 768px+: logo left + five inline nav items + profile placeholder. No hamburger.

---

## 8. Progressive Loading Architecture

### Principles

1. **Lightweight HTML shell renders first on all routes.** Text content, layout, and brand colors are visible before any heavy assets load.
2. **Heavy assets (video, images) load progressively.** They enhance the experience but do not gate it.
3. **No base64 embedding of media in production.** All media is loaded from files in `public/`.

### Hero Video (Home Route)

- The hero section renders with warm plum gradient background, white text, gold CTA on first paint.
- `<video>` element loads `hero-video.mp4` asynchronously behind the overlay.
- Attributes: `muted autoplay loop playsinline preload="auto"`
- The overlay ensures text is legible regardless of whether the video has loaded.
- On `prefers-reduced-motion`, the video `poster` frame is shown statically (or video is hidden entirely).

### Gallery Videos

- Video containers render with warm plum (`#3E363F`) placeholder backgrounds before clips load.
- **Lazy loading:** Only the visible clip and the next one down have their `src` attribute set. All other `<video>` elements have no `src`.
- Intersection Observer watches each clip's scroll region. When a region enters the viewport (or is one position ahead), set `src` on its `<video>`. When a region is more than one position away, remove `src` and call `video.load()` to free memory.
- Transition from placeholder to video: fade-in (opacity transition, 300ms) when `canplay` event fires.

### Team Photos

- Standard `<img>` elements with `loading="lazy"` attribute.
- Sized appropriately (not oversized source files). Recommend 400x400px source images.

### Service Page

- Static content, no heavy assets. Renders immediately.

---

## 9. Technical Constraints

### Backend Boundary

- **No new backend dependencies** except the `/api/contact` route.
- `/api/contact` uses the existing Resend integration (`RESEND_API_KEY`). No new third-party services.
- Google Calendar API + Resend remain the **only** external services.
- The existing `/api/book` route is **frozen** — no changes to its request/response contract, validation logic, or error handling.
- `email.ts` is **frozen** — no changes to confirmation or alert email content/logic.
- `calendar.ts` receives **two scoped additions only:**
  1. `buildDescription()` includes `Format: [In-Person | Virtual (FaceTime) | Virtual (WhatsApp)]` for Meet & Greet events.
  2. `buildDescription()` includes `Terms accepted: Yes` for all events.

### No Auth

- No user accounts, no login, no session management.
- The profile/user icon in the top nav is a visual placeholder. It renders but does not link to anything or trigger any action.

### No Database

- Google Calendar is the sole backend data store.
- All pricing is in environment variables (with hardcoded fallbacks).
- All content (team bios, service descriptions, agreement text) is hardcoded in components.

### No CRM / No Payment

- No Square, no Stripe, no payment processing.
- No Airtable, no CRM integration.
- No connection to ThePupPad v3.0 architecture.

### No Indexing

- `robots.txt` continues to disallow all crawlers.
- `<meta name="robots" content="noindex, nofollow">` remains in the root layout.

### Pricing Migration: Hardcoded to Environment Variables

Service prices migrate from hardcoded constants in `pricing.ts` to environment variables read via `process.env`. The `pricing.ts` file becomes a reader/exporter, not the source of truth.

**Environment variable mapping:**

| Variable | Fallback Default | Description |
|----------|-----------------|-------------|
| `PRICE_BOARDING` | `60` | Boarding per night |
| `PRICE_DAYCARE` | `45` | Daycare flat rate |
| `PRICE_WALK_30` | `25` | Dog Walking 30 min |
| `PRICE_WALK_60` | `45` | Dog Walking 60 min |
| `PRICE_VISIT_30` | `30` | In-Home Visit 30 min |
| `PRICE_VISIT_60` | `50` | In-Home Visit 60 min |
| `PRICE_MEET_GREET` | `0` | Meet & Greet (free) |
| `PRICE_BATH` | `20` | Bath add-on per dog |
| `PRICE_PICKUP` | `25` | Pickup add-on per booking |
| `PRICE_DROPOFF` | `25` | Dropoff add-on per booking |
| `PRICE_BOARDING_OVERAGE` | `2.50` | Boarding overage per hour |

**Behavior:** `pricing.ts` reads from `process.env` with `parseFloat()` and falls back to the current hardcoded values if the env var is missing or not a valid number. The app never breaks if an env var is absent.

**Note on client components:** `pricing.ts` values are used in `BookingForm.tsx`, which is a client component (`'use client'`). Client components cannot read `process.env` at runtime. The prices must be passed as props from a server component (the `/bookings` page), or `pricing.ts` must use `NEXT_PUBLIC_` prefixed variables. The implementation should determine the cleanest approach — either server-side prop passing or public env vars. Server-side prop passing is preferred to avoid exposing pricing env vars to the client bundle.

### Type Additions (Scoped)

`src/lib/types.ts` gains the following fields:

On `DogEntry`:
```
meet_greet_format?: 'in-person' | 'virtual' | '';
meet_greet_platform?: 'facetime' | 'whatsapp' | '';
```

On `BookingPayload`:
```
terms_accepted: boolean;
```

These are the only type changes. All existing fields and interfaces remain unchanged.

---

## 10. Environment Variables

### Existing (Unchanged)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | GCP service account email for Calendar API |
| `GOOGLE_PRIVATE_KEY` | GCP private key (must contain actual newlines in Vercel) |
| `GOOGLE_CALENDAR_ID` | Boarding & Daycare calendar ID |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `OPERATOR_EMAIL` | Dave's email for booking alert notifications |
| `ENABLE_NOTIFICATIONS` | Feature flag for calendar email notifications (true/false) |

### New — Pricing

| Variable | Value | Description |
|----------|-------|-------------|
| `PRICE_BOARDING` | `60` | Boarding per night |
| `PRICE_DAYCARE` | `45` | Daycare flat rate |
| `PRICE_WALK_30` | `25` | Dog Walking 30 min |
| `PRICE_WALK_60` | `45` | Dog Walking 60 min |
| `PRICE_VISIT_30` | `30` | In-Home Visit 30 min |
| `PRICE_VISIT_60` | `50` | In-Home Visit 60 min |
| `PRICE_MEET_GREET` | `0` | Meet & Greet (free) |
| `PRICE_BATH` | `20` | Bath add-on per dog |
| `PRICE_PICKUP` | `25` | Pickup add-on per booking |
| `PRICE_DROPOFF` | `25` | Dropoff add-on per booking |
| `PRICE_BOARDING_OVERAGE` | `2.50` | Boarding overage per hour |

### New — Contact Form

No additional environment variables needed. The contact form API route uses the existing `RESEND_API_KEY` and sends to a hardcoded recipient (`bookings@thepuppad.com`).

### .env.local.example Update

The `.env.local.example` file must be updated to include all new pricing variables with their default values, plus a comment block explaining the pricing migration.

---

## 11. Migration Path

### Overview

The migration from LSP v1.0 to v2.0 is a controlled decomposition and expansion. The existing monolith (`BookingForm.tsx`) is split into discrete components, the form moves to a new route, and four new pages are built around it.

### Component Decomposition: BookingForm.tsx

`BookingForm.tsx` is currently a monolith containing: the canvas-drawn hero animation, the 5-section scroll form, the step tracker, cart logic, validation, and the submission handler.

The v2.0 migration decomposes this into named components:

| Component | Extracted From | Destination | Purpose |
|-----------|---------------|-------------|---------|
| `HeroSection` | Hero/landing content (canvas animation, headline, CTA — lines 88-221 and the hero JSX) | `src/components/HeroSection.tsx`, rendered on `/` | Full-viewport hero with video background (replaces canvas), headline, promo badge, CTA, "Meet Our Team" link |
| `BookingForm` | Form sections 1-5 + cart logic + validation + submit handler | `src/components/BookingForm.tsx`, rendered on `/bookings` | The booking form with five scoped UI improvements |
| `AppShell` | New component | `src/components/AppShell.tsx`, used in `src/app/layout.tsx` | Shared layout wrapper |

### Build Order

**Phase 1: Infrastructure**
1. Create `AppShell.tsx` — top nav + bottom nav + content slot
2. Update `src/app/layout.tsx` to render `AppShell` wrapping `{children}`
3. Create route directories: `src/app/bookings/`, `src/app/services/`, `src/app/gallery/`, `src/app/contact/`

**Phase 2: Home Route (`/`)**
4. Extract hero content from `BookingForm.tsx` into `HeroSection.tsx`
   - Replace the canvas-drawn animation with the video hero (video background + overlay + text)
   - The v1.0 canvas animation (`drawHeroFrame`) is retired — it is replaced by the video hero
5. Build `TrustBlock.tsx`, `TrustSignals.tsx`, `FeaturedReview.tsx`, `TeamSection.tsx`
6. Assemble `src/app/page.tsx` with all home route sections

**Phase 3: Bookings Route (`/bookings`)**
7. Move `BookingForm.tsx` rendering from `src/app/page.tsx` to `src/app/bookings/page.tsx`
8. Remove hero content from `BookingForm.tsx` (it now lives in `HeroSection.tsx`)
9. Implement five UI improvements:
   - Build `StepTracker.tsx` (sticky + Intersection Observer)
   - Build `TimePicker.tsx` (iOS-style scroll wheel)
   - Build `TermsAgreement.tsx` (scroll-to-bottom + checkbox gate)
   - Add service collapse behavior to service selection section
   - Add Meet & Greet format/platform picker
10. Apply two scoped pipeline changes in `calendar.ts` and `types.ts`

**Phase 4: Static Pages**
11. Build `src/app/services/page.tsx` with `ServiceCatalog.tsx`
12. Build `src/app/contact/page.tsx` with `ContactForm.tsx`
13. Build `src/app/api/contact/route.ts`

**Phase 5: Gallery**
14. Build `ScrollVideoGallery.tsx` (scroll-driven video scrub)
15. Build `src/app/gallery/page.tsx`

**Phase 6: Polish**
16. Migrate `pricing.ts` to env var reader
17. Update `.env.local.example`
18. Test all routes on mobile and desktop
19. Verify pipeline (booking submission creates correct calendar events with new description fields)

### Critical Constraints During Decomposition

- `BookingForm.tsx` changes are limited to: (a) removing the hero section content, and (b) implementing the five defined UI improvements.
- No other cleanup, refactoring, or improvement to `BookingForm.tsx`.
- If a piece of form logic is not listed in the five changes, it is not touched.
- All existing design tokens (`T` object), helper functions (`createDog`, `buildCart`, `nextDogId`), sub-components (`SectionLabel`, `GoldDivider`, `FormField`, `ServiceCard`), and the `NJ_TAX_RATE` constant remain in `BookingForm.tsx` unless they are moved to shared modules for reuse — but only if a new route actually needs them.

---

## 12. Pre-Build Asset Dependencies

The following assets must exist in the repo before the build can proceed. They are provided by the owner (Dave), not generated by Claude Code.

| Asset | Source | Conversion | Destination | Status |
|-------|--------|------------|-------------|--------|
| Logo SVG | Owner's PNG | PNG -> SVG | `public/logo.svg` | **In repo** |
| Home nav icon | Owner's PNG | PNG -> SVG | `public/icons/home.svg` | **In repo** |
| Services nav icon | Owner's PNG | PNG -> SVG | `public/icons/services.svg` | **In repo** |
| Gallery nav icon | Owner's PNG | PNG -> SVG | `public/icons/gallery.svg` | **In repo** |
| Bookings nav icon | Owner's PNG | PNG -> SVG | `public/icons/bookings.svg` | **In repo** |
| Contact nav icon | Owner's PNG | PNG -> SVG | `public/icons/contact.svg` | **In repo** |
| Team photos (4) | Owner provides | None (use as-is) | `public/team/` | **Not yet provided** |
| Gallery video clips | Owner provides | None (use as-is) | `public/gallery/` | **Not yet provided** |
| Hero video | Already in repo | None | `public/hero-video.mp4` | **In repo** (v1.0 asset) |
| Facility photo band | Owner provides | None (use as-is) | `public/` | **Not yet provided** |
| Featured review quote | Owner selects from Rover | Text only | Hardcoded in component | **Not yet provided** |
| Service agreement text | Owner provides | Text only | Hardcoded in component | **Not yet provided** |

### SVG Requirements for Icons and Logo

All SVGs must use `currentColor` for their fill values (not hardcoded hex colors). This allows CSS to control the fill color for active/inactive states and the logo's white/plum color switch.

**Verification before build:** Check that `public/logo.svg` and all `public/icons/*.svg` files use `currentColor` or have no baked-in fill colors. If fills are baked in, they must be replaced with `currentColor` before the build proceeds.

### Build Blockers

The build **cannot fully complete** without:
- Team photos in `public/team/` (the Meet Our Team section will have empty image slots)
- Gallery video clips in `public/gallery/` (the gallery page will have no content)
- Featured review quote text (the review section will need a placeholder)
- Service agreement text (the terms agreement gate will need placeholder text)

The build **can proceed** with placeholder states for these assets. All other assets (logo, nav icons, hero video) are already in the repo.

---

## 13. Deferred Features

The following items are explicitly **NOT in v2.0 scope**. Do not implement them, plan for them in the architecture, or add hooks/flags for them.

| Feature | Reason for Deferral |
|---------|-------------------|
| User accounts / authentication | No auth system. Profile icon is visual-only placeholder. |
| Payment processing | No Square, no Stripe. Payment is handled offline. |
| Returning client detection / email lookup | Would require a database. Out of scope. |
| Dog Training and Grooming services | Not offered via LSP. Separate business lines. |
| Admin dashboard | No admin interface. Dave manages via Google Calendar directly. |
| Booking modification or cancellation by client | Would require auth + calendar event lookup. Out of scope. |
| Calendar availability / conflict detection | Would require reading calendar before booking. Out of scope. |
| Per-service agreement text | Day 1 = one universal agreement for all services. Per-service variants are future. |
| Service pre-selection from `/services` page CTA | The CTA routes to `/bookings` but does not pre-select a service. Pre-selection would require modifying form initialization logic beyond the five defined changes. |
| Search engine indexing | `robots.txt` + meta `noindex` remains. LSP is not intended for organic search. |
| Multi-language support | English only. |
| Dark mode | Not in scope. Brand palette is defined for light mode only. |
| Push notifications | No service worker, no push notifications. |
| Anything in the v3.0 scope | LSP remains fully independent of ppWAv3. |

---

## 14. Open Questions

### Carried from v1.0

| # | Question | Impact |
|---|----------|--------|
| 1 | Is NJ sales tax correctly applied to pet services at 6.625%? | Tax calculation in `buildCart()`. Currently uses `NJ_TAX_RATE = 0.06625`. |
| 2 | Should post-tax total appear in calendar events? | Currently only pre-tax total appears in event descriptions. |

### New for v2.0

| # | Question | Impact |
|---|----------|--------|
| 3 | Is LSP a bridge or a permanent product? | The v2.0 expansion — five routes, team page, gallery, full branding — strongly signals permanence. The comment in `pricing.ts` ("These values are throwaway. When the full QBF ships... this file dies.") may no longer be accurate. This should be acknowledged and the comment updated or removed. |
| 4 | What photos for the team cards? | Dave provides. Placed in `public/team/`. Build blocked for this section until provided. |
| 5 | What video clips for the gallery? | Dave provides. Placed in `public/gallery/`. Build blocked for gallery route until provided. |
| 6 | What featured review quote for the home page? | Dave selects from Rover reviews. Placeholder until provided. |
| 7 | Should the contact form have rate limiting or spam protection? | Currently no protection. Resend has built-in rate limits, but the endpoint is open. Consider adding a simple honeypot field or rate limit middleware in a future iteration. |
| 8 | What is the exact service agreement text? | Dave provides. Hardcoded in `TermsAgreement.tsx`. Build can proceed with placeholder text but the terms gate cannot be meaningfully tested until real text is in place. |
| 9 | Optimal scroll region height per gallery clip for smooth scrub feel? | Starting recommendation: 4x viewport height for 6-second clips. May require tuning during build. |
| 10 | Do the existing SVGs in `public/icons/` and `public/logo.svg` use `currentColor` fills? | If fills are baked in as hardcoded hex values, they must be updated before the nav active/inactive color switching will work. Verify before build. |
| 11 | What are the exact social media URLs for Facebook and TikTok? | Instagram is `instagram.com/thepuppadnj`. Facebook and TikTok URLs need confirmation from Dave. |
| 12 | Should the desktop layout have a footer, or is the top nav sufficient? | Bottom nav replaces footer on mobile. Desktop may benefit from a minimal footer with contact info and social links. Dave to decide. |

---

*This PRD is the buildable spec for LSP v2.0. A future Claude Code session should be able to implement every route, component, and interaction described here without asking clarifying questions — except for the open questions listed in Section 14 and the asset dependencies listed in Section 12.*
