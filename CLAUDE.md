# GuidePath — Architecture & Development Guide

## Overview
GuidePath is a marketplace connecting people seeking personal/professional guidance with certified professionals (psychologists, life coaches, career mentors, nutritionists). Built as a modern web application with a premium, minimalist design.

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
3. **Mock data first** — All pages use hardcoded Spanish-language mock data; API integration comes later
4. **Stripe Connect** — Marketplace model where platform takes a commission per session
5. **Embedded video** — Daily.co SDK renders inside the app (no external redirects)
6. **Dark/light mode** — next-themes with class strategy, CSS variables for colors

## How to Run
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your actual keys in .env

# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Start development server
npm run dev
```

## Environment Variables
See `.env.example` for all required keys. For local development:
- **DATABASE_URL**: Use Supabase free tier or local PostgreSQL
- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
- **STRIPE_***: Use Stripe test mode keys
- **DAILY_API_KEY**: Free tier from daily.co dashboard
- **RESEND_API_KEY**: Free tier from resend.com

## Design System
- **Colors**: Neutral base (white ↔ zinc-950) + indigo-600 accent
- **Typography**: Inter (body) + Geist (headings)
- **Components**: shadcn/ui with custom glassmorphism cards
- **Animations**: Framer Motion scroll-triggered + micro-interactions
- **Responsive**: Mobile-first, breakpoints at sm/md/lg/xl

## Language
- **UI**: Spanish (Spain) — all user-facing text
- **Code**: English — variables, comments, documentation
