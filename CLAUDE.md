# GuidePath — Architecture & Development Guide

## Overview
GuidePath is a **freemium platform** connecting professionals seeking career and workplace guidance with certified experts: career mentors, executive coaches, sector specialists, and work psychologists. Everything is anchored to the professional world — career transitions, leadership development, burnout, team dynamics, sector expertise. Built as a modern web application with a premium, minimalist design.

**Business Model**: Clients get free sessions (3/month). Professionals earn **impact points** per session, redeemable for certifications or philanthropic donations. No direct payment between client and professional.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Animations | Framer Motion |
| UI Components | shadcn/ui (Radix primitives) |
| Database | PostgreSQL (Supabase) + Prisma ORM (19 models) |
| Auth | NextAuth.js v4 (email/password + Google OAuth) |
| Credits System | Custom (configurable via `src/lib/credits-config.ts`) |
| Video Calls | Daily.co embedded SDK (`@daily-co/daily-js`) |
| Email | Resend (templates in `src/lib/emails/`) |
| Image uploads | Cloudinary (`src/lib/cloudinary.ts`) |
| Rate limiting | Upstash Redis (`src/lib/rate-limit.ts`) |
| Payments (legacy) | Stripe (kept for future premium tier) |

## Current State (as of `develop`, April 2026)

The app is **fully functional end-to-end**. All major layers are wired and production-ready:

| Layer | Status |
|-------|--------|
| Auth (NextAuth + Prisma Adapter + JWT + RBAC middleware) | ✅ Done |
| API routes (sessions, professionals, credits, rewards, reviews, availability) | ✅ Done |
| Freemium credits system (3 free sessions/month) | ✅ Done |
| Impact points & rewards for professionals | ✅ Done |
| Daily.co video calls (screen share + in-call chat) | ✅ Done |
| Resend transactional emails + cron reminders | ✅ Done |
| Review system (categories + professional response + report) | ✅ Done |
| Availability persistence (weekly slots + blocked dates) | ✅ Done |
| Route protection middleware (RBAC by role) | ✅ Done |
| Professional onboarding wizard (`/onboarding/professional`) | ✅ Done |
| Zod validation — server-side (14+ schemas) + client-side (react-hook-form) | ✅ Done |
| Rate limiting (Upstash Redis — register, login, reviews, professionals) | ✅ Done |
| Cron jobs protected with `CRON_SECRET` | ✅ Done |
| Structured JSON logger + health check endpoint | ✅ Done |
| Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy) | ✅ Done |
| SEO (generateMetadata, JSON-LD, OG, sitemap, robots, category landing pages) | ✅ Done |
| Cloudinary image uploads for profile photos | ✅ Done |
| In-app notifications (bell, dropdown, history page) | ✅ Done |
| Direct messaging / conversations | ✅ Done |
| Referral system (code generation, redemption, dashboard) | ✅ Done |
| Certifications management for professionals | ✅ Done |
| Waitlist capture + beta feedback modal | ✅ Done |
| PWA (manifest + service worker) | ✅ Done |
| CI/CD GitHub Actions (lint, build, types, tests) | ✅ Done |
| Unit + integration tests (Vitest) + E2E (Playwright) | ✅ Done |
| Apple-style landing (aurora hero, trust bar, testimonials, waitlist) | ✅ Done |
| Legal pages (privacy + terms) | ✅ Done |
| Stripe payment flow (legacy, for future premium tier) | ⏳ Paused |

## Project Structure
```
src/
├── app/
│   ├── layout.tsx               # Root layout (fonts, theme, providers)
│   ├── page.tsx                 # Landing page
│   ├── explore/                 # Professional discovery with filters + pagination
│   ├── professional/[id]/       # Public professional profile + booking card
│   ├── book/[sessionId]/        # Booking flow (credits-based)
│   │   └── confirmed/           # Booking confirmation page
│   ├── session/[id]/            # Video call room (Daily.co)
│   ├── dashboard/
│   │   ├── client/              # Client dashboard (sessions + credits + reviews)
│   │   └── professional/        # Professional dashboard (sessions + impact + availability)
│   ├── categoria/[slug]/        # SEO landing pages per category
│   ├── notifications/           # Full notification history
│   ├── onboarding/
│   │   └── professional/        # Step-by-step onboarding wizard
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   ├── complete-profile/
│   │   └── forgot-password/
│   ├── legal/
│   │   ├── privacidad/
│   │   └── terminos/
│   ├── robots.ts                # Dynamic robots.txt
│   ├── sitemap.ts               # Dynamic sitemap
│   ├── error.tsx                # Global error boundary
│   └── not-found.tsx            # 404 page
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/   # NextAuth handler
│       │   ├── register/        # POST — user registration
│       │   └── update-role/     # POST — update user role
│       ├── professionals/       # GET list + GET [id] + GET/POST/PUT /me
│       ├── sessions/            # GET list + GET/PATCH [id] + reschedule + room
│       ├── credits/             # GET status + POST /use (book free session)
│       ├── rewards/             # GET points + POST redeem
│       ├── reviews/             # GET/POST + respond + report + received
│       ├── availability/        # GET/PUT weekly slots
│       ├── blocked-dates/       # POST — block specific dates
│       ├── certifications/      # GET/POST/DELETE [id]
│       ├── categories/          # GET — professional categories
│       ├── notifications/       # GET/PATCH in-app notifications
│       ├── conversations/       # GET/POST + GET/POST [id]/messages
│       ├── messages/            # GET/POST + GET /unread
│       ├── referrals/           # GET/POST + POST /redeem
│       ├── upload/              # POST — Cloudinary image upload
│       ├── daily/create-room/   # POST — create Daily.co room
│       ├── feedback/            # POST — beta feedback
│       ├── waitlist/            # POST — waitlist signup
│       ├── health/              # GET — health check
│       ├── payments/            # (Legacy) Stripe PaymentIntent
│       ├── webhooks/stripe/     # (Legacy) Stripe webhook
│       ├── stripe/              # (Legacy) Stripe Connect
│       └── cron/
│           ├── session-reminders/   # POST — send session reminder emails
│           ├── session-cleanup/     # POST — cancel expired sessions
│           └── onboarding-emails/   # POST — drip onboarding for new professionals
├── components/
│   ├── ui/                      # shadcn/ui base components
│   ├── layout/                  # Navbar, Footer, ThemeToggle, NotificationBell
│   ├── landing/                 # Hero, HowItWorks, Categories, FeaturedProfessionals,
│   │                            # Testimonials, TrustBar, Waitlist, CTA
│   └── shared/                  # AvailabilityEditor, BlockedDatesManager, ChatWidget,
│                                 # ConversationList, ConversationChat, SessionChat,
│                                 # ProfileCompleteness, ReferralPanel, PhotoUpload,
│                                 # DashboardSkeleton, EmptyState, Pagination,
│                                 # BetaFeedbackModal, MotionWrapper, PageError
├── lib/
│   ├── auth.ts                  # NextAuth config (CredentialsProvider + PrismaAdapter)
│   ├── prisma.ts                # Prisma client singleton
│   ├── env.ts                   # Zod env validation — fails build if vars missing
│   ├── credits-config.ts        # Freemium config (session limits, impact points)
│   ├── validations.ts           # Zod schemas (14+ — shared server/client)
│   ├── emails/                  # Email templates + send helpers (Resend)
│   ├── notifications.ts         # In-app notification helpers
│   ├── rate-limit.ts            # Upstash Redis rate limiter helper
│   ├── cloudinary.ts            # Cloudinary upload helper
│   ├── daily.ts                 # Daily.co room creation helper
│   ├── logger.ts                # Structured JSON logger
│   ├── api-error.ts             # Standardized API error responses
│   ├── csrf.ts                  # CSRF validation for mutations
│   ├── sanitize.ts              # sanitize-html for user-generated content
│   ├── session-utils.ts         # Session role helpers
│   ├── professionals.ts         # Professional query helpers
│   ├── cancellation.ts          # Cancellation logic
│   ├── stripe.ts                # Stripe server-side singleton (legacy)
│   ├── resend.ts                # Resend client singleton
│   └── utils.ts                 # cn, formatDate, formatTime, etc.
├── data/
│   └── mock.ts                  # Mock data (used in explore/profile UI)
└── types/
    ├── index.ts                 # Shared TypeScript types
    ├── next-auth.d.ts           # NextAuth session type extensions (id, role)
    └── sessions.ts              # Session-specific types
prisma/
├── schema.prisma                # Database schema (19 models, 6 enums)
└── seed.ts                      # Seeds 2 test users
```

## Architecture Decisions
1. **App Router** — Next.js 14 app directory for layouts, server components, and streaming
2. **Schema-first DB** — Prisma schema defines all models; use `db:push` for dev, `db:migrate` for prod
3. **Supabase PostgreSQL** — two URLs: pooler (`DATABASE_URL`, port 6543) for runtime queries; direct (`DIRECT_URL`, port 5432) for Prisma migrations
4. **Freemium credits flow** — client calls `POST /api/credits/use` → session created as CONFIRMED directly → emails sent → no payment needed
5. **Impact points system** — professionals earn points per completed session, redeemable via `POST /api/rewards`
6. **Configurable limits** — `src/lib/credits-config.ts` is the single source of truth for FREE_SESSIONS_PER_MONTH, IMPACT_POINTS_PER_SESSION, etc.
7. **Daily.co dynamic import** — `@daily-co/daily-js` must be dynamically imported inside `useEffect` to avoid SSR crash
8. **Fire-and-forget emails** — email sends use `Promise.allSettled` so failures never break API responses
9. **Incremental rating** — reviews update `ProfessionalProfile.rating` as `(oldRating * oldCount + newRating) / newCount`
10. **Atomic availability replace** — `PUT /api/availability` uses `prisma.$transaction([deleteMany, createMany])` to replace the whole week
11. **Dark/light mode** — next-themes with class strategy, CSS variables for all colors
12. **Stripe kept as legacy** — Payment flow preserved but paused; for future premium subscription tier
13. **JWT role in token** — role is written to the JWT only at login (`if (user)` block), not re-fetched on every request
14. **Env validation at startup** — `src/lib/env.ts` uses Zod to validate all required env vars; build fails if any are missing
15. **Cron protection** — all cron endpoints validate `Authorization: Bearer $CRON_SECRET` header
16. **XSS prevention** — `sanitize-html` applied in `src/lib/sanitize.ts` on all free-text fields (bio, notes, feedback)
17. **Rate limiting** — Upstash Redis via `src/lib/rate-limit.ts`; active on register, login, reviews, and professionals list
18. **Structured logging** — `src/lib/logger.ts` outputs JSON; used in all API routes; `log` alias removed

## How to Run
```bash
npm install
cp .env.example .env        # fill in real keys
npm run db:generate          # generate Prisma client
npm run db:push              # sync schema to DB (dev — no migration history)
npm run db:seed              # seed 2 test users
npm run dev                  # start dev server at http://localhost:3000
```

For local PostgreSQL without Supabase:
```bash
docker-compose up -d         # PostgreSQL on port 5433, pgAdmin on port 5050
```

## Environment Variables
See `.env.example` for all keys. Validated at startup by `src/lib/env.ts`.

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Supabase pooler URL, port 6543, `?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct URL, port 5432 — for Prisma migrations |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` for local |
| `NEXT_PUBLIC_SITE_URL` | Public URL — used for OG tags, sitemap, emails |
| `DAILY_API_KEY` | From daily.co dashboard |
| `RESEND_API_KEY` | From resend.com |
| `RESEND_FROM_EMAIL` | `GuidePath <onboarding@resend.dev>` for local free tier |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `CRON_SECRET` | `openssl rand -base64 32` — protects cron endpoints |
| `GOOGLE_CLIENT_ID` | (Optional) Google OAuth |
| `GOOGLE_CLIENT_SECRET` | (Optional) Google OAuth |
| `STRIPE_SECRET_KEY` | (Optional) Only for future premium tier |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (Optional) Only for premium tier |
| `STRIPE_WEBHOOK_SECRET` | (Optional) Only for premium tier |

## Test Users (seeded via `npm run db:seed`)
| Email | Password | Role |
|-------|----------|------|
| `cliente@guidepath.dev` | `password123` | CLIENT |
| `profesional@guidepath.dev` | `password123` | PROFESSIONAL |

## API Routes Reference

### Auth & users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create user account |
| GET/PUT | `/api/professionals/me` | Yes (prof) | Own professional profile |
| POST | `/api/auth/update-role` | Yes | Update user role |

### Professionals & categories
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/professionals` | No | List professionals (filters, search, pagination) |
| GET | `/api/professionals/[id]` | No | Profile + availability + reviews |
| GET | `/api/categories` | No | Available professional categories |

### Sessions
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/sessions` | Yes | User's sessions (upcoming + past) |
| GET | `/api/sessions/[id]` | Yes | Session detail + role (client/professional) |
| PATCH | `/api/sessions/[id]` | Yes | Update status (CANCELLED, COMPLETED + award points) |
| POST | `/api/sessions/[id]/reschedule` | Yes | Request reschedule |
| GET | `/api/sessions/[id]/room` | Yes | Daily.co room info |

### Credits & rewards
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/credits` | Yes (client) | Credit status (used, remaining, resetsAt) |
| POST | `/api/credits/use` | Yes (client) | Book free session (auto-CONFIRMED) |
| GET | `/api/rewards` | Yes (prof) | Impact points + redemption history |
| POST | `/api/rewards` | Yes (prof) | Redeem points for certification or donation |

### Reviews & availability
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/api/reviews` | Yes | Create review + update aggregate rating |
| GET | `/api/reviews/received` | Yes (prof) | Reviews received by the professional |
| POST | `/api/reviews/[id]/respond` | Yes (prof) | Respond to a review |
| POST | `/api/reviews/[id]/report` | Yes | Report a review |
| GET/PUT | `/api/availability` | Yes (prof) | Weekly slots (atomic replace) |
| POST | `/api/blocked-dates` | Yes (prof) | Block specific dates |

### Messaging & notifications
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/api/conversations` | Yes | List + create conversations |
| GET/POST | `/api/conversations/[id]/messages` | Yes | Messages in a conversation |
| GET | `/api/messages/unread` | Yes | Unread message count |
| GET/PATCH | `/api/notifications` | Yes | In-app notifications |

### Utilities
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/daily/create-room` | Yes | Create Daily.co room for CONFIRMED session |
| POST | `/api/upload` | Yes | Upload profile photo to Cloudinary |
| GET/POST/DELETE | `/api/certifications` | Yes (prof) | Manage certifications |
| GET/POST | `/api/referrals` | Yes | Referral system |
| POST | `/api/referrals/redeem` | Yes | Redeem referral code |
| POST | `/api/feedback` | Yes | Submit beta feedback |
| POST | `/api/waitlist` | No | Waitlist signup |
| GET | `/api/health` | No | Health check (DB + services) |

### Cron (protected — require `Authorization: Bearer $CRON_SECRET`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/cron/session-reminders` | Send upcoming session reminder emails |
| POST | `/api/cron/session-cleanup` | Cancel expired sessions (PENDING>24h, CONFIRMED>4h) |
| POST | `/api/cron/onboarding-emails` | Drip onboarding emails for new professionals |

## Booking Flow (end-to-end — Freemium)
1. Client visits `/professional/[id]`, picks date/time → navigates to `/book/new?professional=...&date=...&time=...`
2. Booking page checks `/api/credits` → shows remaining credits
3. Client clicks "Confirmar reserva gratuita" → `POST /api/credits/use`
4. API validates credits → creates Session (CONFIRMED) → increments `freeCreditsUsed` → sends emails
5. Client and professional both receive email confirmation
6. Client enters `/session/[id]` → `POST /api/daily/create-room` → Daily.co iframe appears
7. After session: professional marks COMPLETED → impact points awarded → client can leave review

## Credits & Rewards System
- **Client**: 3 free sessions per calendar month (auto-resets on 1st of each month)
- **Professional**: +10 impact points per completed session
- **Redemptions**: 100 pts = 1 certification, 50 pts = 1 philanthropic donation
- **Configuration**: All values in `src/lib/credits-config.ts`

## Auth Implementation
- **Login** (`/auth/login`): `signIn('credentials', ...)` from `next-auth/react`
- **Register** (`/auth/register`): `POST /api/auth/register` → redirect to login
- **NextAuth config** (`src/lib/auth.ts`): CredentialsProvider + PrismaAdapter + JWT strategy
- **Session includes** `id`, `name`, `email`, `role` — typed via `src/types/next-auth.d.ts`
- **Role in JWT**: written once at login (`if (user)` block), not re-fetched per request
- **RBAC middleware** (`src/middleware.ts`): protects `/dashboard`, `/session`, `/book`, `/onboarding`
- Google OAuth: configured, requires `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

## Design System
- **Colors**: Neutral base (white ↔ zinc-950) + indigo-600 accent
- **Typography**: Inter (body) + Geist (headings) — both loaded locally from `src/app/fonts/`
- **Components**: shadcn/ui with custom glassmorphism cards (`.glass` class)
- **Animations**: Framer Motion scroll-triggered + micro-interactions + aurora background (landing)
- **Responsive**: Mobile-first, breakpoints at sm/md/lg/xl
- **Landing hero**: Apple-style — centered layout, fluid typography (`clamp`), animated aurora background

## Language
- **UI**: Spanish (Spain) — all user-facing text
- **Code**: English — variables, comments, documentation

## Git Branches
| Branch | Purpose |
|--------|---------|
| `main` | Stable scaffolded baseline |
| `develop` | Active development — all features integrated, ready for testing |

Use `develop` as the base for all feature work. PRs target `develop`.
