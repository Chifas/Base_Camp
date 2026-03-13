# MEJORAS

## Objetivo

Este documento recoge las mejoras recomendadas para `GuidePath`, priorizadas para poder ejecutarlas por fases sin romper el proyecto actual. La idea es reforzar seguridad, mantenibilidad, rendimiento y preparación para producción.

---

## 🚨 Prioridad Alta

### 1. Seguridad y control de acceso
- [x] Crear `middleware.ts` para proteger rutas privadas como `/dashboard`, `/session` y futuras rutas internas
- [x] Validar permisos por rol (`CLIENT`, `PROFESSIONAL`, `ADMIN`) antes de renderizar páginas sensibles
- [x] Revisar el flujo de autenticación para evitar accesos directos a páginas privadas sin sesión iniciada

### 2. Manejo de errores
- [x] Añadir `src/app/error.tsx`
- [x] Añadir `src/app/not-found.tsx`
- [ ] Crear estados vacíos y mensajes de error consistentes para páginas dinámicas
- [ ] Definir una estrategia de errores de backend y frontend

### 3. Base de datos — índices
- [x] Añadir índices en Prisma para consultas frecuentes:
  - [x] `Session.clientId`
  - [x] `Session.professionalId`
  - [x] `ProfessionalProfile.category`
- [x] Revisar relaciones para asegurar cascadas y consistencia de datos

### 4. Validación de entorno
- [x] Añadir validación tipada de variables de entorno con Zod o solución similar
- [x] Fallar en build si falta una variable crítica
- [x] Separar variables públicas y privadas correctamente

---

## ⚠️ Prioridad Media

### 5. Modelo de dominio
- [ ] Revisar si `rating` y `reviewCount` deben calcularse en consulta en lugar de persistirse manualmente
- [ ] Valorar sustituir `ProfessionalCategory` como enum por una tabla de categorías independiente
- [ ] Añadir soporte para bloqueos de agenda, vacaciones y excepciones en disponibilidad
- [ ] Diseñar mejor el sistema de reservas para evitar solapes de horario

### 6. SEO y metadata
- [x] Usar `generateMetadata()` en perfiles de profesionales (`/professional/[id]`)
- [x] Añadir títulos y descripciones dinámicas por página
- [ ] Mejorar Open Graph y Twitter Cards (OG parcial, faltan Twitter Cards)
- [ ] Revisar sitemap y robots cuando el proyecto esté más maduro

### 7. Rendimiento
- [x] Revisar qué componentes realmente necesitan `"use client"` (ej. `page.tsx` en landing no lo necesita)
- [x] Mantener páginas simples como Server Components siempre que sea posible
- [ ] Evaluar lazy loading en componentes pesados
- [ ] Optimizar carga inicial de landing y dashboards

### 8. Emails, pagos y eventos
- [ ] Diseñar flujo real de Stripe Connect con comisión de plataforma
- [x] Añadir webhooks de Stripe para confirmar pagos y cancelaciones
- [x] Crear sistema de emails transaccionales con plantillas claras (Resend)
- [ ] Añadir trazabilidad para reservas, pagos y cancelaciones

---

## 💡 Prioridad Baja

### 9. Calidad de código
- [ ] Revisar y reforzar configuración de ESLint
- [ ] Añadir convención de commits (Conventional Commits)
- [ ] Crear `CONTRIBUTING.md`
- [ ] Crear `CHANGELOG.md`

### 10. Testing
- [x] Añadir tests unitarios para utilidades y lógica de negocio (básicos: utils, env, professionals, sessions)
- [ ] Añadir tests de integración para auth, reservas y pagos
- [ ] Añadir tests E2E con Playwright para flujos principales
- [x] Definir datos seed consistentes para testing

### 11. CI/CD
- [x] Crear workflow de GitHub Actions con al menos:
  - [x] Instalación de dependencias
  - [x] Lint
  - [x] Build
  - [x] Validación de tipos TypeScript
- [ ] Añadir checks obligatorios antes de mergear a `Develop` o `main`

### 12. Documentación
- [x] Mantener actualizado `README.md`
- [x] Documentar arquitectura técnica
- [ ] Añadir guía de despliegue
- [x] Añadir guía de configuración local

---

## 🗺️ Propuesta de fases

### Fase 1 — Base sólida ✅
- [x] Middleware de autenticación
- [x] `error.tsx` y `not-found.tsx`
- [x] Validación de variables de entorno
- [x] Índices en Prisma

### Fase 2 — Calidad y visibilidad
- [x] SEO dinámico
- [x] Revisión de `"use client"`
- [x] Testing básico
- [x] CI/CD con GitHub Actions

### Fase 3 — Modelo de negocio
- [ ] Refactor del modelo de categorías
- [ ] Revisión de ratings y reviews
- [ ] Disponibilidad avanzada
- [ ] Webhooks y pagos reales con Stripe

### Fase 4 — Producción
- [ ] Hardening de seguridad
- [ ] Observabilidad y logs
- [ ] Analítica
- [ ] Preparación final para despliegue

---

## 📌 Notas del estado actual

- Next.js 14 con App Router
- Prisma con PostgreSQL (Supabase) con índices y cascadas configuradas
- Autenticación con NextAuth v4 + middleware de protección de rutas
- Stripe PaymentIntent + webhooks funcionales
- Daily.co integrado para videollamadas
- Resend con plantillas de email transaccional
- CI/CD con GitHub Actions (lint, build, types, tests)
- Tests unitarios básicos con Vitest
- SEO dinámico con `generateMetadata()` en perfiles
- Validación de variables de entorno con Zod

---

## ✅ Criterio de trabajo recomendado

1. Hacer primero mejoras no destructivas (sin tocar schema ni dependencias mayores)
2. Separar los cambios de base de datos en ramas y migraciones controladas
3. Probar auth, reservas y sesiones después de cada cambio importante
4. No mezclar refactor de arquitectura con cambios funcionales grandes en el mismo commit
