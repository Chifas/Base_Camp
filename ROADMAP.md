# GuidePath — Roadmap de Mejoras

> **Última actualización:** 2026-04-21
> Modelo: Freemium (3 sesiones gratis/mes, impact points para profesionales)
>
> Para marcar un ítem como completado, cambia `[ ]` por `[x]` y haz commit.

---

## Auditoría de calidad — Completada (2026-04-21)

Mejoras identificadas y completadas durante la auditoría del codebase.

### Quick wins
- [x] `ExploreSkeleton` — 12 tarjetas pulsantes en lugar del spinner genérico
- [x] `BookingCard` — `aria-label` en cada botón de fecha y hora (WCAG 2.1 AA)
- [x] Selector de fecha — `snap-x snap-mandatory` + `snap-center` para scroll táctil
- [x] Grid de horas — `grid-cols-2 sm:grid-cols-3` (target táctil ≥ 48 px en móvil)
- [x] URL encoding — `URLSearchParams` reemplaza string interpolation en booking URL
- [x] CSRF middleware — matcher ampliado a 12 rutas de API mutation

### Accesibilidad (WCAG 2.1 AA)
- [x] Explore — `<label sr-only>` en campo de búsqueda, `aria-pressed` en filtros de categoría y rating
- [x] Navbar — `aria-expanded`, `aria-haspopup="menu"`, `role="menu"`, `role="menuitem"`, Escape key
- [x] BookingCard — `aria-label` descriptivo en slots de fecha y hora, `aria-pressed` en selección

### Tests
- [x] `e2e/booking.spec.ts` — 12 tests E2E (filtros, navegación, flujo de reserva, protección de rutas)
- [x] `dashboard-skeleton.test.tsx` — tests de render y estructura
- [x] `explore-skeleton.test.tsx` — tests de render y cantidad de tarjetas
- [x] `/api/professionals` — 4 casos nuevos (page negativo, limit > 100, búsqueda, categoría)

### Performance y type safety
- [x] `React.memo` en `BookingCard` y `FeaturedProfessionals`
- [x] `auth.ts` — `'role' in user` type guard reemplaza doble cast inseguro
- [x] Stripe webhook — adapter explícito `EmailSessionData` en lugar de `as unknown as`
- [x] `SessionRowSkeleton` — exportado con layout completo (avatar, chips, badge, botón de acción)
- [x] `/api/professionals` — paginación con `Math.max`/`Math.min` para rechazar valores negativos

---

## Estado actual — Lo que ya funciona

| Funcionalidad | Estado |
|---------------|--------|
| Auth (NextAuth + Prisma + JWT + RBAC middleware) | ✅ |
| API routes completas (sessions, professionals, credits, rewards, reviews, availability) | ✅ |
| Sistema de créditos freemium (3/mes) + impact points | ✅ |
| Daily.co videollamadas + compartir pantalla + chat en sala | ✅ |
| Resend emails transaccionales + cron reminders | ✅ |
| Reviews con categorías + respuesta del profesional | ✅ |
| Filtros avanzados, paginación, ordenación por relevancia | ✅ |
| Foto de perfil (Cloudinary) + certificaciones + idiomas | ✅ |
| Rate limiting (register, reviews, professionals) | ✅ |
| Cron jobs protegidos (reminders + onboarding emails + session cleanup) | ✅ |
| Validación Zod server-side (14+ schemas) | ✅ |
| Error handling estandarizado + logger estructurado | ✅ |
| SEO dinámico (generateMetadata, JSON-LD, OG, sitemap, landing pages por categoría) | ✅ |
| CI/CD GitHub Actions (lint, build, types, tests) | ✅ |
| Tests unitarios + integración (Vitest) + E2E (Playwright) | ✅ |
| PWA (manifest + service worker) | ✅ |
| Chat directo entre usuarios (conversaciones + mensajes) | ✅ |
| Sistema de referidos (generación de código, canje, estadísticas) | ✅ |
| Notificaciones in-app (bell, historial, marcar como leídas) | ✅ |
| Onboarding profesional (wizard + barra de completitud) | ✅ |
| Landing page Apple-style (hero aurora, trust bar, testimonials, waitlist) | ✅ |
| Páginas legales (privacidad, términos) | ✅ |

---

## Fase 1 — Crítico (Pre-lanzamiento)

> Sin esto no se puede lanzar. Bugs de seguridad, flujos rotos, y validación real.

### 1.1 Onboarding profesional completo
- [x] **Página `/onboarding/professional`**: Wizard paso a paso (perfil → categoría → disponibilidad → foto)
- [x] **Barra de completitud de perfil**: Indicador % con acciones sugeridas para maximizar visibilidad
- [x] **Bloqueo de visibilidad**: Profesional no aparece en `/explore` hasta completar onboarding mínimo (nombre, categoría, 1 slot de disponibilidad)

### 1.2 Seguridad pre-producción
- [x] **JWT callback optimizado**: Eliminar `prisma.user.findUnique()` en cada request — guardar rol en token solo al login
- [x] **Rate limiting en login**: Máx 10 intentos por IP por 15min para prevenir fuerza bruta
- [x] **Sanitización de HTML**: Aplicar `sanitize-html` en campos de texto libre (bio, notas, feedback, registro) para prevenir XSS
- [x] **CSRF en formularios**: Validar origin/referer en middleware para todas las mutaciones en rutas protegidas
- [x] **Protección de endpoints cron redundante**: Verificado — TODOS los cron handlers validan `CRON_SECRET` consistentemente

### 1.3 Validación con usuarios reales
- [ ] **Programa beta cerrado**: Invitar 10-20 profesionales reales para validar flujo end-to-end
- [ ] **Formulario de feedback estructurado**: Encuesta post-sesión para clientes y profesionales
- [ ] **KPIs de validación**: Definir métricas de product-market fit (sesiones completadas, retención mensual, NPS)
- [ ] **Lista de espera / waitlist**: Captura de emails pre-lanzamiento (modelo `WaitlistEntry` ya existe en schema)

### 1.4 Validación client-side en formularios
- [x] **react-hook-form + Zod**: Integrado en login y registro reutilizando schemas Zod existentes
- [x] **Feedback inline en tiempo real**: Errores por campo al perder foco (modo `onBlur`)
- [ ] **Formularios afectados**: ~~Registro~~, ~~Login~~, booking, reviews, perfil profesional, disponibilidad

### 1.5 Env y documentación de deploy
- [x] **`.env.example` completo**: Añadidas Cloudinary, Upstash Redis, CRON_SECRET
- [x] **Health check mejorado**: Incluye check de DB, Daily.co, Resend y Redis con latencia por servicio

---

## Fase 2 — Alta prioridad (Primeras semanas post-lanzamiento)

> Retención de usuarios, confianza, y los flujos que convierten visitantes en usuarios recurrentes.

### 2.1 Notificaciones in-app completas
- [x] **UI de notificaciones en dashboard**: `NotificationBell` con badge, dropdown de últimas notificaciones, marcar como leídas
- [x] **Página de historial de notificaciones**: Lista completa paginada con filtros por tipo y estado (leídas/no leídas)
- [ ] **Notificaciones push (opcional)**: Web Push API para notificar fuera del navegador

### 2.2 Sistema de referidos
- [x] **Referidos profesional → profesional**: Código de invitación con bonus de impact points
- [x] **Referidos cliente → cliente**: Crédito extra por cada amigo que complete una sesión
- [x] **Dashboard de referidos**: Panel con referidos enviados, convertidos y beneficios acumulados
- [x] **Modelo `Referral`**: API + UI implementados (generación de código, canje, estadísticas)

### 2.3 SEO y adquisición orgánica
- [x] **Landing pages por categoría**: `/categoria/coach`, `/categoria/psicologo-laboral`, `/categoria/mentor-de-carrera`, `/categoria/nutricionista`
- [x] **Sitemap dinámico mejorado**: Incluye perfiles + landing pages de categoría (priority 0.85)
- [x] **Open Graph dinámico**: Metadata + OG tags dinámicos por categoría con generateMetadata
- [ ] **Blog integrado**: CMS simple (MDX o similar) para artículos sobre desarrollo profesional

### 2.4 Confianza y seguridad (Trust & Safety)
- [ ] **Verificación de identidad profesional**: Integración con servicio de verificación de documentos (DNI/pasaporte)
- [ ] **2FA para profesionales**: TOTP o passkeys para cuentas con acceso a datos sensibles
- [ ] **Política de disputas**: Flujo para que un cliente abra una disputa post-sesión con mediación
- [x] **Límites anti-abuso**: 1 sesión gratuita por combinación cliente-profesional por mes (HTTP 429)

---

## Fase 3 — Prioridad media (Meses 2-3)

> Funcionalidades que mejoran la experiencia y diferencian la plataforma.

### 3.1 Chat y mensajería
- [x] **Chat pre/post sesión**: Mensajería entre cliente y profesional vinculada a la sesión (modelo Message + API + UI)
- [x] **Polling para mensajes**: Polling cada 5s con auto-scroll y marcado de lectura
- [ ] **WebSockets o Supabase Realtime**: Para mensajes instantáneos (actualmente polling)
- [ ] **Archivos adjuntos**: Compartir documentos/CV en el chat (Cloudinary o S3) — modelo preparado con `fileUrl`/`fileName`
- [x] **Historial de conversaciones**: Persistencia en DB con paginación por cursor

### 3.2 Calendario y disponibilidad avanzada
- [ ] **Integración Google Calendar**: Sincronizar disponibilidad automáticamente (OAuth + Calendar API)
- [x] **Bloqueo de fechas específicas**: Modelo BlockedDate + API CRUD + UI calendario visual + validación en booking
- [ ] **Soporte multi-timezone**: Detección automática + selector para clientes internacionales
- [x] **Slots de duración variable**: SESSION_DURATIONS [30, 45, 60, 90] en credits-config.ts
- [x] **Vista calendario visual**: Mini-calendario interactivo para gestionar fechas bloqueadas

### 3.3 Videollamada mejorada
- [x] **Compartir pantalla**: `enable_screenshare: true` en Daily.co room creation
- [x] **Chat en videollamada**: `enable_chat: true` integrado en Daily.co iframe
- [ ] **Grabación de sesiones**: Con consentimiento mutuo, para revisión posterior
- [x] **Error boundaries para Daily iframe**: UI mejorada con reintentar conexión y volver al dashboard

### 3.4 Deuda técnica
- [x] **Índice `@@index([professionalId, dayOfWeek])` en Availability**: Compound index añadido
- [x] **Índice en `Session.scheduledAt`**: Index añadido para optimizar cron queries
- [x] **Refactor `GET /api/sessions`**: Extraídos `formatSessionForClient()`, `formatSessionForProfessional()` y `buildSessionWhereClause()` en `session-helpers.ts`
- [ ] **`select` explícito en queries Prisma**: Reducir payload en queries pesadas
- [x] **Limpieza de sesiones expiradas**: Cron job `/api/cron/session-cleanup` (PENDING>24h → CANCELLED, CONFIRMED>4h → CANCELLED)
- [x] **Estandarizar `logger` vs `log`**: Migrados 12 archivos, eliminado alias deprecado `log`

---

## Fase 4 — Prioridad baja (Meses 3-6)

> Crecimiento, monetización premium, y escalabilidad.

### 4.1 Panel de administración
- [ ] **Dashboard admin**: Métricas de plataforma (usuarios activos, sesiones/día, distribución por categoría, puntos de impacto)
- [ ] **Gestión de usuarios**: Buscar, suspender, verificar profesionales, cambiar roles
- [ ] **Moderación de reviews**: Cola de reviews reportadas con aprobar/rechazar/escalar
- [ ] **Configuración de plataforma**: Gestionar categorías, comisiones, límites de créditos desde UI
- [ ] **Categorías como tabla**: Migrar `ProfessionalCategory` enum a modelo `Category` gestionable desde admin

### 4.2 Monetización premium (Stripe reactivado)
- [ ] **Tier premium para clientes**: Suscripción mensual con sesiones ilimitadas o paquetes (5, 10, 20)
- [ ] **Stripe Connect para profesionales**: Onboarding + transferencias automáticas por sesiones premium
- [ ] **Cupones y descuentos**: Sistema de códigos promocionales
- [ ] **Facturación**: Generación automática de facturas PDF para clientes y profesionales

### 4.3 Analytics y métricas
- [ ] **Dashboard de métricas para profesionales**: Tasa de conversión visitas→booking, evolución de rating, sesiones por mes
- [ ] **Funnel de conversión**: Tracking visita → perfil → booking → completada (Vercel Analytics events)
- [ ] **A/B testing framework**: Para probar cambios en landing, CTAs, flujo de booking

### 4.4 Internacionalización
- [ ] **next-intl**: Soporte multi-idioma (ES, EN, PT) con detección automática
- [ ] **Moneda local**: Precios en EUR, USD, GBP según ubicación (para tier premium)
- [ ] **Contenido localizado**: Categorías, emails, mensajes de error traducidos

---

## Fase 5 — Largo plazo (6+ meses)

> Infraestructura de escala y features diferenciadoras.

### 5.1 Infraestructura
- [ ] **Caché con Redis**: Cachear listados de profesionales, categorías, perfiles populares
- [ ] **CDN para imágenes**: Optimización automática con next/image + Cloudinary transforms
- [ ] **Monitoring y alertas**: Sentry para error tracking + alertas en Slack/email por errores críticos
- [ ] **`revalidatePath`/`revalidateTag`**: Invalidación de caché ISR en mutaciones de sesiones, perfil, reviews
- [ ] **Migrar a Auth.js v5**: Mejor integración con App Router y Server Components
- [ ] **Base de datos**: Audit de queries N+1, optimización de connection pooling, read replicas

### 5.2 Features avanzadas
- [ ] **Matching inteligente**: Algoritmo que sugiere profesionales basándose en historial, preferencias y disponibilidad
- [ ] **Programa de fidelización**: Niveles de cliente (bronce, plata, oro) con beneficios incrementales
- [ ] **API pública**: REST/GraphQL para integraciones con plataformas de RRHH
- [ ] **App nativa**: React Native o Capacitor para iOS/Android
- [ ] **Pizarra compartida en videollamada**: Herramienta de dibujo/notas en tiempo real

---

## Resumen de prioridades

| Prioridad | Fase | Por qué |
|-----------|------|---------|
| **Crítica** | Fase 1 | Sin onboarding, seguridad y validación real no se puede lanzar |
| **Alta** | Fase 2 | Retención, confianza y adquisición orgánica — lo que hace crecer la base de usuarios |
| **Media** | Fase 3 | Diferenciación y experiencia premium — lo que retiene a largo plazo |
| **Baja** | Fase 4 | Monetización y escala — necesario cuando hay tracción |
| **Futura** | Fase 5 | Infraestructura de escala — cuando el volumen lo justifique |

---

## Criterio de trabajo

1. **Primero lo que desbloquea lanzamiento** — onboarding profesional y seguridad son bloqueantes
2. **No mezclar refactor con features** — separar cambios de schema/DB en ramas dedicadas
3. **Validar con usuarios antes de construir** — la beta de Fase 1.3 informa qué priorizar en Fase 2+
4. **Iterar rápido en fases tempranas** — PRs pequeños, deploy continuo, feedback loop corto
5. **Medir antes de optimizar** — no cachear ni escalar hasta tener datos reales de uso

---

*Última actualización: Abril 2026*
