# Changelog

Todos los cambios notables del proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [0.4.0] - 2026-03-15

### Added
- Validacion Zod en todas las rutas API (register, checkout, reviews, availability, sessions)
- Health check endpoint `GET /api/health`
- Logger estructurado JSON para todas las rutas API
- Vercel Analytics + Speed Insights
- Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- Middleware RBAC con next-auth `withAuth`
- Componentes EmptyState y DashboardSkeleton reutilizables
- Estrategia de errores unificada (`api-error.ts` + `PageError` component)
- Open Graph + Twitter Cards completas
- Sitemap dinamico + robots.txt
- Lazy loading de componentes below-the-fold en landing
- Trazabilidad de reservas, pagos y cancelaciones con logger
- ESLint reforzado (no-console, eqeqeq, no-eval, no-unused-vars)
- Conventional Commits con commitlint + husky
- CONTRIBUTING.md
- Guia de despliegue

### Fixed
- GeistVF.woff2 corrupto (era HTML, reemplazado con binario real)
- Stripe checkout type error (`SessionCreateParams` en vez de `Parameters<>`)
- Stripe/Resend null guard para builds sin API keys
- `useSearchParams` sin Suspense boundary
- ESLint 8 compatibility con Next.js 14
- Node 20 en CI (styleText no disponible en Node 18)

### Removed
- Ruta muerta `/api/register` (duplicado de `/api/auth/register`)
- Archivos huerfanos `available-prices` y `PriceSelector`

## [0.3.0] - 2026-03-10

### Added
- Integracion real Daily.co para videollamadas
- Stripe Checkout Sessions con Stripe Connect (20% comision plataforma)
- Resend email transaccional (confirmacion + cancelacion)
- Sistema de reviews con rating agregado incremental
- Disponibilidad avanzada con bloqueos de fechas y deteccion de solapamientos

## [0.2.0] - 2026-03-05

### Added
- SEO dinamico con `generateMetadata()` en perfiles
- CI/CD con GitHub Actions (lint, build, types, tests)
- Tests unitarios basicos con Vitest
- Revision de `"use client"` para maximizar Server Components

## [0.1.0] - 2026-02-28

### Added
- Proyecto inicial con Next.js 14 App Router + TypeScript + Tailwind CSS
- Auth con NextAuth v4 (credentials + Google OAuth)
- Landing page con Hero, HowItWorks, FeaturedProfessionals, Testimonials, CTA
- Explore page con filtros y busqueda
- Professional profile con calendario de disponibilidad
- Dashboard cliente y profesional
- API routes para sessions, professionals, availability
- Prisma schema con PostgreSQL (Supabase)
- Dark/light mode con next-themes
