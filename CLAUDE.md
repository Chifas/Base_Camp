# GuidePath — Architecture & Development Guide

## Overview
GuidePath is a marketplace connecting professionals seeking career and workplace guidance with certified experts: career mentors, executive coaches, sector specialists, and work psychologists. Everything is anchored to the professional world — career transitions, leadership development, burnout, team dynamics, sector expertise. Built as a modern web application with a premium, minimalist design.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Animations | Framer Motion |
| UI Components | shadcn/ui (Radix primitives) |
| Database | PostgreSQL (Supabase) + Prisma ORM |
| Auth | NextAuth.js v4 (email/password + Google OAuth) |
| Payments | Stripe (PaymentIntent flow) |
| Video Calls | Daily.co embedded SDK (`@daily-co/daily-js`) |
| Email | Resend |

## Current State (as of branch `develop`, March 2026)

The app is **fully functional end-to-end** in development. All major integration layers are wired:

| Layer | Status |
|-------|--------|
| Auth (NextAuth + Prisma Adapter) | ✅ Done |
| API routes (sessions, professionals, availability, reviews) | ✅ Done |
| Stripe payment flow (PaymentIntent + webhook) | ✅ Done |
| Daily.co video call rooms | ✅ Done |
| Resend email notifications | ✅ Done |
| Review system with aggregate rating | ✅ Done |
| Availability persistence | ✅ Done |
| Stripe Connect payouts to professionals | ⏳ Pending |
| Route protection middleware | ⏳ Pending |
| Professional onboarding after register | ⏳ Pending |
| Zod form validation | ⏳ Pending |

## Project Structure
```
src/
├── app/                         # Next.js App Router pages
│   ├── layout.tsx               # Root layout (fonts, theme, providers)
│   ├── page.tsx                 # Landing page
│   ├── explore/                 # Professional discovery
│   ├── professional/[id]/       # Professional profile
│   ├── book/[sessionId]/        # Booking flow (Stripe Elements)
│   ├── dashboard/
│   │   ├── client/              # Client dashboard (sessions + review modal)
│   │   └── professional/        # Professional dashboard (sessions + availability)
│   ├── session/[id]/            # Video call room (Daily.co)
│   └── auth/
│       ├── login/
│       └── register/
│   └── api/
│       ├── register/            # POST — user registration
│       ├── professionals/       # GET list + GET [id]
│       ├── sessions/            # GET list + GET/PATCH [id]
│       ├── payments/
│       │   └── create-intent/   # POST — create DB Session + Stripe PaymentIntent
│       ├── webhooks/
│       │   └── stripe/          # POST — handle payment_intent.succeeded/failed
│       ├── daily/
│       │   └── create-room/     # POST — create Daily.co room for confirmed session
│       ├── reviews/             # POST — create review + update aggregate rating
│       └── availability/        # GET + PUT — weekly slots for authenticated professional
├── components/
│   ├── ui/                      # shadcn/ui base components
│   ├── layout/                  # Navbar, Footer, ThemeToggle
│   ├── landing/                 # Landing page sections
│   └── shared/                  # Reusable composite components
├── lib/
│   ├── auth.ts                  # NextAuth config (CredentialsProvider + PrismaAdapter)
│   ├── prisma.ts                # Prisma client singleton
│   ├── stripe.ts                # Stripe server-side singleton
│   ├── resend.ts                # Resend client singleton
│   ├── emails.ts                # Email templates + send helpers
│   └── utils.ts                 # cn, formatCurrency, formatDate
├── data/
│   └── mock.ts                  # Mock data (still used in some explore/profile UI)
└── types/
    └── index.ts                 # Shared TypeScript types
prisma/
├── schema.prisma                # Database schema (Supabase)
└── seed.ts                      # Seeds 2 test users
```

## Architecture Decisions
1. **App Router** — Next.js 14 app directory for layouts, server components, and streaming
2. **Schema-first DB** — Prisma schema defines all models; use `db:push` for dev, `db:migrate` for prod
3. **Supabase PostgreSQL** — two URLs: pooler (`DATABASE_URL`, port 6543) for runtime queries; direct (`DIRECT_URL`, port 5432) for Prisma migrations
4. **Stripe PaymentIntent flow** — client calls `POST /api/payments/create-intent` → gets `clientSecret` → renders `<CardElement>` → `stripe.confirmCardPayment()`. Webhook handles fulfillment.
5. **Daily.co dynamic import** — `@daily-co/daily-js` must be dynamically imported inside `useEffect` to avoid SSR crash
6. **Fire-and-forget emails** — email sends use `Promise.allSettled` so failures never break API responses
7. **Incremental rating** — reviews update `ProfessionalProfile.rating` as `(oldRating * oldCount + newRating) / newCount` (no full aggregation scan)
8. **Atomic availability replace** — `PUT /api/availability` uses `prisma.$transaction([deleteMany, createMany])` to replace the whole week atomically
9. **Dark/light mode** — next-themes with class strategy, CSS variables for all colors
10. **`NEXT_PUBLIC_` prefix** — `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is the correct name; without the prefix it is not accessible client-side

## How to Run
```bash
# Install dependencies
npm install

# Copy env file and fill in real keys
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Push schema to Supabase (dev only — no migration history)
npm run db:push

# Seed 2 test users
npm run db:seed

# Start development server
npm run dev
```

## Environment Variables
See `.env.example` for all keys. Critical ones:

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Supabase pooler URL, port 6543, `?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct URL, port 5432 — needed for Prisma migrations |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` for local |
| `STRIPE_SECRET_KEY` | Test key from Stripe dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Must have `NEXT_PUBLIC_` prefix for client-side access |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| `DAILY_API_KEY` | From daily.co dashboard |
| `RESEND_API_KEY` | From resend.com dashboard |
| `RESEND_FROM_EMAIL` | `GuidePath <onboarding@resend.dev>` for local dev free tier |

## Test Users (seeded via `npm run db:seed`)
| Email | Password | Role |
|-------|----------|------|
| `cliente@guidepath.dev` | `password123` | CLIENT |
| `profesional@guidepath.dev` | `password123` | PROFESSIONAL |

## API Routes Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/register` | No | Create user account (hashed password) |
| GET | `/api/professionals` | No | List professionals (filters: category, search) |
| GET | `/api/professionals/[id]` | No | Professional profile + availability + reviews |
| GET | `/api/sessions` | Yes | Authenticated user's sessions (upcoming + past) |
| GET | `/api/sessions/[id]` | Yes | Session detail with role (`client`/`professional`) |
| PATCH | `/api/sessions/[id]` | Yes | Update status (CANCELLED, COMPLETED) |
| POST | `/api/payments/create-intent` | Yes | Create DB Session (PENDING) + Stripe PaymentIntent |
| POST | `/api/webhooks/stripe` | Stripe sig | `payment_intent.succeeded` → CONFIRMED + emails; `payment_intent.payment_failed` → CANCELLED |
| POST | `/api/daily/create-room` | Yes | Create Daily.co room for CONFIRMED session (idempotent) |
| POST | `/api/reviews` | Yes (client) | Create review + update professional aggregate rating |
| GET | `/api/availability` | Yes (professional) | Get weekly availability slots |
| PUT | `/api/availability` | Yes (professional) | Replace weekly availability (atomic) |

## Booking Flow (end-to-end)
1. Client visits `/professional/[id]`, picks date/time → navigates to `/book/new?professional=...&date=...&time=...`
2. `POST /api/payments/create-intent` → creates `Session` (PENDING) in DB, returns `{ clientSecret, sessionId }`
3. Client fills `<CardElement>` → `stripe.confirmCardPayment(clientSecret)` → Stripe fires webhook
4. Webhook `payment_intent.succeeded` → Session status → CONFIRMED → `sendBookingEmails()`
5. Client and professional both receive email confirmation
6. Client enters `/session/[id]` → `POST /api/daily/create-room` → Daily.co iframe appears
7. After session: professional marks COMPLETED → client can leave review via modal in dashboard

## Auth Implementation
- **Login** (`/auth/login`): `signIn('credentials', ...)` from `next-auth/react`
- **Register** (`/auth/register`): `POST /api/register` → redirect to login
- **NextAuth config** (`src/lib/auth.ts`): CredentialsProvider + PrismaAdapter + JWT strategy
- **Session includes** `id`, `name`, `email`, `role` — available via `useSession()` client-side or `getServerSession()` server-side
- Google OAuth: configured but requires `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

## Design System
- **Colors**: Neutral base (white ↔ zinc-950) + indigo-600 accent
- **Typography**: Inter (body) + Geist (headings) — both loaded locally
- **Components**: shadcn/ui with custom glassmorphism cards (`.glass` class)
- **Animations**: Framer Motion scroll-triggered + micro-interactions
- **Responsive**: Mobile-first, breakpoints at sm/md/lg/xl

## Language
- **UI**: Spanish (Spain) — all user-facing text
- **Code**: English — variables, comments, documentation

## Git Branches
| Branch | Purpose |
|--------|---------|
| `main` | Stable scaffolded baseline |
| `develop` | Active development — all features integrated, ready for testing |

The `develop` branch contains all feature work (auth, API, Stripe, Daily.co, Resend, reviews, availability). Use this branch for testing and future development.
