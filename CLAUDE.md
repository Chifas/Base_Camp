# GuidePath — Architecture & Development Guide

## Overview
GuidePath is a marketplace connecting professionals seeking career and workplace guidance with certified experts: career mentors, executive coaches, sector specialists, and work psychologists. Everything is anchored to the professional world — career transitions, leadership development, burnout, team dynamics, sector expertise. Built as a modern web application with a premium, minimalist design.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Animations | Framer Motion |
| UI Components | shadcn/ui (Radix primitives) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (email/password + Google OAuth) |
| Payments | Stripe Connect (marketplace split payments) |
| Video Calls | Daily.co embedded SDK |
| Email | Resend |

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (fonts, theme, providers)
│   ├── page.tsx            # Landing page
│   ├── explore/            # Professional discovery
│   ├── professional/[id]/  # Professional profile
│   ├── book/[sessionId]/   # Booking flow
│   ├── dashboard/
│   │   ├── client/         # Client dashboard
│   │   └── professional/   # Professional dashboard
│   ├── session/[id]/       # Video call room
│   └── auth/
│       ├── login/          # Login page
│       └── register/       # Registration page
├── components/
│   ├── ui/                 # shadcn/ui base components
│   ├── layout/             # Navbar, Footer, ThemeToggle
│   ├── landing/            # Landing page sections
│   └── shared/             # Reusable composite components
├── lib/                    # Utilities (cn, prisma client, etc.)
├── data/                   # Mock data for development
└── types/                  # Shared TypeScript types
prisma/
└── schema.prisma           # Database schema
```

## Architecture Decisions
1. **App Router** — uses Next.js 14 app directory for layouts, server components, and streaming
2. **Schema-first DB** — Prisma schema defines all models; migrations via `prisma migrate dev`
3. **Mock data first** — All pages use hardcoded Spanish-language mock data (`src/data/mock.ts`); API integration comes later
4. **Stripe Connect** — Marketplace model where platform takes a commission per session
5. **Embedded video** — Daily.co SDK renders inside the app (no external redirects)
6. **Dark/light mode** — next-themes with class strategy, CSS variables for colors
7. **Auth wired** — Login and register forms are fully functional; dashboards still use mock data

## How to Run
```bash
# Install dependencies
npm install

# Copy env file (DATABASE_URL already set for Docker local)
cp .env.example .env

# Start Docker containers (PostgreSQL + pgAdmin)
docker compose up -d

# Generate Prisma client + apply schema
npm run db:push

# Seed test users into the database
npm run db:seed

# Start development server
npm run dev
```

## Local Development Environment

### Docker Setup (IMPORTANT)
- The machine has **PostgreSQL installed locally on Windows** (port 5432)
- Docker is configured to expose PostgreSQL on **port 5433** to avoid conflict
- `docker-compose.yml` is at the project root
- Containers: `guidepath_db` (postgres:16-alpine) and `guidepath_pgadmin` (dpage/pgadmin4)
- pgAdmin: http://localhost:5050 → `admin@guidepath.dev` / `admin`
- Connect pgAdmin to DB using hostname `guidepath_db`, port `5432` (internal)

### Environment Variables
The `.env` file (gitignored) must exist at project root. Key values for local:
- **DATABASE_URL**: `postgresql://guidepath:guidepath_dev@localhost:5433/guidepath`
- **NEXTAUTH_SECRET**: Already generated and set in `.env`
- **STRIPE_***: Use Stripe test mode keys
- **DAILY_API_KEY**: Free tier from daily.co dashboard
- **RESEND_API_KEY**: Free tier from resend.com

### Test Users (seeded via `npm run db:seed`)
| Email | Password | Role |
|-------|----------|------|
| `cliente@guidepath.dev` | `password123` | CLIENT |
| `profesional@guidepath.dev` | `password123` | PROFESSIONAL |

## Auth Implementation
- **Login** (`/auth/login`): calls `signIn('credentials', ...)` from `next-auth/react`, redirects to `/dashboard/client`
- **Register** (`/auth/register`): calls `POST /api/register`, then redirects to `/auth/login`
- **API endpoint**: `src/app/api/register/route.ts` — creates user with bcrypt-hashed password
- **NextAuth config**: `src/lib/auth.ts` — CredentialsProvider + PrismaAdapter + JWT strategy
- Google OAuth configured but requires `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` to work

## Design System
- **Colors**: Neutral base (white ↔ zinc-950) + indigo-600 accent
- **Typography**: Inter (body) + Geist (headings)
- **Components**: shadcn/ui with custom glassmorphism cards
- **Animations**: Framer Motion scroll-triggered + micro-interactions
- **Responsive**: Mobile-first, breakpoints at sm/md/lg/xl

## Language
- **UI**: Spanish (Spain) — all user-facing text
- **Code**: English — variables, comments, documentation
