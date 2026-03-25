# Light Sitter Pro (LSP) — Claude Code Project Context

## Identity
This is Light Sitter Pro (LSP), a standalone mobile-first booking form for ThePupPad.
Live at: book.thepuppad.com
Repo: DawgWatcher/DogSitterLight
Vercel project: dogsitterlight

## This Is NOT ThePupPad v3.0
LSP has zero connection to the ppWAv3 repo, Airtable, Square, the write chain, or the Quick Booking Flow (QBF). Do not reference or import from any v3.0 architecture.

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Google Calendar API via GCP Service Account JWT (not OAuth)
- Vercel hosting
- No CRM, no payment processor, no middleware

## Pipeline
Form submission → /api/book (Next.js API route) → Google Calendar API → Boarding & Daycare calendar

## Key Files
- src/components/BookingForm.tsx — entire form UI (single component)
- src/app/api/book/route.ts — single API route
- src/lib/calendar.ts — Google Calendar API client
- src/lib/pricing.ts — hardcoded pricing constants
- src/lib/types.ts — TypeScript interfaces

## Environment Variables
- GOOGLE_SERVICE_ACCOUNT_EMAIL — GCP service account email
- GOOGLE_PRIVATE_KEY — GCP private key (must contain actual newlines in Vercel, not literal \n)
- GOOGLE_CALENDAR_ID — Boarding & Daycare calendar ID
- ENABLE_NOTIFICATIONS — feature flag for calendar email notifications (true/false)
- OPERATOR_EMAIL — Dave's email for booking alerts

## Brand
- Colors: White (#FFFFFF) 60%, Cream (#F2F0E6) 30%, Gold (#FFCA4B) 10%, Warm Plum (#3E363F) text
- Font: Nunito (400, 600, 700, 800). No serif fonts. No geometric fonts.
- All buttons are pill-shaped. No sharp corners anywhere.

## Git Rules
- Do not attempt git push. Always output the worktree path and branch name so Dave can push manually.
- Local source path: /Users/davidlauer-lopez/Documents/PupPad/DogSitterLight/puppad-bridge-form
