# MEJORAS

## Objetivo

Este documento recoge las mejoras recomendadas para `GuidePath`, priorizadas para poder ejecutarlas por fases sin romper el proyecto actual. La idea es reforzar seguridad, mantenibilidad, rendimiento y preparación para producción.

---

## 🚨 Prioridad Alta

### 1. Seguridad y control de acceso
- [ ] Crear `middleware.ts` para proteger rutas privadas como `/dashboard`, `/session` y futuras rutas internas
- [ ] Validar permisos por rol (`CLIENT`, `PROFESSIONAL`, `ADMIN`) antes de renderizar páginas sensibles
- [ ] Revisar el flujo de autenticación para evitar accesos directos a páginas privadas sin sesión iniciada

### 2. Manejo de errores
- [ ] Añadir `src/app/error.tsx`
- [ ] Añadir `src/app/not-found.tsx`
- [ ] Crear estados vacíos y mensajes de error consistentes para páginas dinámicas
- [ ] Definir una estrategia de errores de backend y frontend

### 3. Base de datos — índices
- [ ] Añadir índices en Prisma para consultas frecuentes:
  - [ ] `Session.clientId`
  - [ ] `Session.professionalId`
  - [ ] `ProfessionalProfile.category`
- [ ] Revisar relaciones para asegurar cascadas y consistencia de datos

### 4. Validación de entorno
- [ ] Añadir validación tipada de variables de entorno con Zod o solución similar
- [ ] Fallar en build si falta una variable crítica
- [ ] Separar variables públicas y privadas correctamente

---

## ⚠️ Prioridad Media

### 5. Modelo de dominio
- [ ] Revisar si `rating` y `reviewCount` deben calcularse en consulta en lugar de persistirse manualmente
- [ ] Valorar sustituir `ProfessionalCategory` como enum por una tabla de categorías independiente
- [ ] Añadir soporte para bloqueos de agenda, vacaciones y excepciones en disponibilidad
- [ ] Diseñar mejor el sistema de reservas para evitar solapes de horario

### 6. SEO y metadata
- [ ] Usar `generateMetadata()` en perfiles de profesionales (`/professional/[id]`)
- [ ] Añadir títulos y descripciones dinámicas por página
- [ ] Mejorar Open Graph y Twitter Cards
- [ ] Revisar sitemap y robots cuando el proyecto esté más maduro

### 7. Rendimiento
- [ ] Revisar qué componentes realmente necesitan `"use client"` (ej. `page.tsx` en landing no lo necesita)
- [ ] Mantener páginas simples como Server Components siempre que sea posible
- [ ] Evaluar lazy loading en componentes pesados
- [ ] Optimizar carga inicial de landing y dashboards

### 8. Emails, pagos y eventos
- [ ] Diseñar flujo real de Stripe Connect con comisión de plataforma
- [ ] Añadir webhooks de Stripe para confirmar pagos y cancelaciones
- [ ] Crear sistema de emails transaccionales con plantillas claras (Resend)
- [ ] Añadir trazabilidad para reservas, pagos y cancelaciones

---

## 💡 Prioridad Baja

### 9. Calidad de código
- [ ] Revisar y reforzar configuración de ESLint
- [ ] Añadir convención de commits (Conventional Commits)
- [ ] Crear `CONTRIBUTING.md`
- [ ] Crear `CHANGELOG.md`

### 10. Testing
- [ ] Añadir tests unitarios para utilidades y lógica de negocio
- [ ] Añadir tests de integración para auth, reservas y pagos
- [ ] Añadir tests E2E con Playwright para flujos principales
- [ ] Definir datos seed consistentes para testing

### 11. CI/CD
- [ ] Crear workflow de GitHub Actions con al menos:
  - [ ] Instalación de dependencias
  - [ ] Lint
  - [ ] Build
  - [ ] Validación de tipos TypeScript
- [ ] Añadir checks obligatorios antes de mergear a `Develop` o `main`

### 12. Documentación
- [ ] Mantener actualizado `README.md`
- [ ] Documentar arquitectura técnica
- [ ] Añadir guía de despliegue
- [ ] Añadir guía de configuración local

---

## 🗺️ Propuesta de fases

### Fase 1 — Base sólida
- [ ] Middleware de autenticación
- [ ] `error.tsx` y `not-found.tsx`
- [ ] Validación de variables de entorno
- [ ] Índices en Prisma

### Fase 2 — Calidad y visibilidad
- [ ] SEO dinámico
- [ ] Revisión de `"use client"`
- [ ] Testing básico
- [ ] CI/CD con GitHub Actions

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
- Prisma con PostgreSQL
- Autenticación con NextAuth v4
- Integración prevista con Stripe, Daily.co y Resend
- La estructura base del proyecto está bien planteada y lista para evolucionar

---

## ✅ Criterio de trabajo recomendado

1. Hacer primero mejoras no destructivas (sin tocar schema ni dependencias mayores)
2. Separar los cambios de base de datos en ramas y migraciones controladas
3. Probar auth, reservas y sesiones después de cada cambio importante
4. No mezclar refactor de arquitectura con cambios funcionales grandes en el mismo commit
