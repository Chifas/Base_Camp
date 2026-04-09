# GuidePath

> Plataforma freemium que conecta a profesionales en busqueda de orientacion laboral con expertos certificados: mentores de carrera, coaches ejecutivos, psicologos laborales y especialistas sectoriales.

## Modelo de negocio

| Rol | Como funciona |
|-----|---------------|
| **Cliente** | 3 sesiones gratuitas al mes (se reinician el 1 de cada mes). Sin pagos, sin tarjeta. |
| **Profesional** | Gana puntos de impacto por cada sesion completada (+10 pts/sesion). Canjeables por certificaciones (100 pts) o donaciones solidarias (50 pts). |

Toda la configuracion de limites y puntos esta centralizada en `src/lib/credits-config.ts`.

## Tech Stack

| Capa | Tecnologia |
|------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Animaciones | Framer Motion |
| UI Components | shadcn/ui (Radix primitives) |
| Base de datos | PostgreSQL (Supabase) + Prisma ORM |
| Autenticacion | NextAuth.js v4 (email/password + Google OAuth) |
| Sistema de creditos | Custom (`src/lib/credits-config.ts`) |
| Videollamadas | Daily.co SDK (`@daily-co/daily-js`) |
| Email | Resend |
| Imagenes | Cloudinary |
| Rate limiting | Upstash Redis |
| Pagos (legacy) | Stripe — pausado, reservado para futuro tier premium |

## Estructura del proyecto

```
src/
├── app/                         # Paginas (Next.js App Router)
│   ├── layout.tsx               # Layout raiz (fuentes, tema, providers)
│   ├── page.tsx                 # Landing page
│   ├── explore/                 # Busqueda y descubrimiento de profesionales
│   ├── professional/[id]/       # Perfil publico + booking card
│   ├── book/[sessionId]/        # Flujo de reserva (basado en creditos)
│   ├── session/[id]/            # Sala de videollamada (Daily.co)
│   ├── dashboard/
│   │   ├── client/              # Dashboard del cliente (sesiones + creditos + resenas)
│   │   └── professional/        # Dashboard del profesional (sesiones + impacto + disponibilidad)
│   ├── categoria/[slug]/        # Landing pages por categoria (SEO)
│   ├── notifications/           # Historial de notificaciones
│   ├── onboarding/
│   │   └── professional/        # Wizard de onboarding para profesionales
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   ├── complete-profile/
│   │   └── forgot-password/
│   ├── legal/
│   │   ├── privacidad/
│   │   └── terminos/
│   └── api/                     # (ver seccion API Routes)
├── components/
│   ├── ui/                      # Componentes base shadcn/ui
│   ├── layout/                  # Navbar, Footer, ThemeToggle, NotificationBell
│   ├── landing/                 # Secciones de la landing page
│   └── shared/                  # Componentes reutilizables compuestos
├── lib/
│   ├── auth.ts                  # Configuracion NextAuth
│   ├── prisma.ts                # Singleton del cliente Prisma
│   ├── credits-config.ts        # Configuracion del sistema freemium
│   ├── validations.ts           # Esquemas Zod para validacion
│   ├── emails/                  # Plantillas de email y helpers de envio
│   ├── notifications.ts         # Sistema de notificaciones in-app
│   ├── rate-limit.ts            # Rate limiting con Upstash Redis
│   ├── cloudinary.ts            # Integracion con Cloudinary
│   ├── logger.ts                # Logger estructurado JSON
│   └── utils.ts                 # cn, formatDate, formatTime, etc.
├── data/
│   └── mock.ts                  # Datos mock para desarrollo
└── types/
    └── index.ts                 # Tipos TypeScript compartidos
prisma/
├── schema.prisma                # Esquema de la base de datos (19 modelos)
└── seed.ts                      # Seed con usuarios de prueba
```

## Instalacion y puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Rellena tus claves reales en el archivo .env

# 3. Generar el cliente de Prisma
npm run db:generate

# 4. Aplicar el esquema a la base de datos (desarrollo)
npm run db:push

# 5. Insertar usuarios de prueba
npm run db:seed

# 6. Arrancar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

Para levantar PostgreSQL en local:

```bash
docker-compose up -d
```

## Variables de entorno

Consulta `.env.example` para ver todas las variables. Las principales:

| Variable | Descripcion |
|----------|-------------|
| `DATABASE_URL` | URL pooler Supabase (puerto 6543, `?pgbouncer=true`) |
| `DIRECT_URL` | URL directa Supabase (puerto 5432) — para migraciones Prisma |
| `NEXTAUTH_SECRET` | Genera con `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` en local |
| `NEXT_PUBLIC_SITE_URL` | URL publica para OG, sitemap y emails |
| `DAILY_API_KEY` | Desde el dashboard de daily.co |
| `RESEND_API_KEY` | Desde resend.com |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary |
| `UPSTASH_REDIS_REST_URL` | URL REST de Upstash Redis (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Token de Upstash Redis |
| `CRON_SECRET` | Secreto para proteger endpoints cron |
| `GOOGLE_CLIENT_ID` | (Opcional) Para login con Google OAuth |
| `STRIPE_SECRET_KEY` | (Opcional) Solo para futuro tier premium |

## Usuarios de prueba

Disponibles tras ejecutar `npm run db:seed`:

| Email | Contrasena | Rol |
|-------|------------|-----|
| `cliente@guidepath.dev` | `password123` | CLIENT |
| `profesional@guidepath.dev` | `password123` | PROFESSIONAL |

## Flujo de reserva (end-to-end)

1. El cliente visita `/explore` y descubre profesionales → entra en `/professional/[id]`
2. Selecciona fecha y hora → navega a `/book/new?professional=...&date=...&time=...`
3. La pagina de reserva consulta `/api/credits` → muestra creditos restantes
4. El cliente pulsa **"Confirmar reserva gratuita"** → `POST /api/credits/use`
5. La API valida creditos → crea Sesion (CONFIRMED) → incrementa `freeCreditsUsed` → envia emails
6. Cliente y profesional reciben confirmacion por email
7. El cliente entra en `/session/[id]` → `POST /api/daily/create-room` → aparece la videollamada
8. Tras la sesion: el profesional marca COMPLETED → se otorgan puntos de impacto → el cliente puede dejar resena

## Sistema de creditos y recompensas

| Concepto | Valor |
|----------|-------|
| Sesiones gratuitas / mes (cliente) | 3 |
| Puntos de impacto por sesion completada | +10 |
| Puntos para certificacion profesional | 100 |
| Puntos para donacion solidaria | 50 |

Configuracion en `src/lib/credits-config.ts`.

## API Routes

### Autenticacion y usuarios

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Crear cuenta de usuario |
| GET/PUT | `/api/professionals/me` | Si | Perfil del profesional autenticado |
| POST | `/api/auth/update-role` | Si | Actualizar rol de usuario |

### Profesionales y categorias

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| GET | `/api/professionals` | No | Listar profesionales (filtros: categoria, busqueda, paginacion) |
| GET | `/api/professionals/[id]` | No | Perfil + disponibilidad + resenas |
| GET | `/api/categories` | No | Categorias profesionales disponibles |

### Sesiones

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| GET | `/api/sessions` | Si | Sesiones del usuario (proximas + pasadas) |
| GET | `/api/sessions/[id]` | Si | Detalle de sesion con rol (client/professional) |
| PATCH | `/api/sessions/[id]` | Si | Actualizar estado (CANCELLED, COMPLETED + puntos) |
| POST | `/api/sessions/[id]/reschedule` | Si | Solicitar reprogramacion |
| GET | `/api/sessions/[id]/room` | Si | Info de sala Daily.co |

### Creditos y recompensas

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| GET | `/api/credits` | Si (cliente) | Estado de creditos del cliente |
| POST | `/api/credits/use` | Si (cliente) | Reservar sesion gratuita |
| GET | `/api/rewards` | Si (profesional) | Puntos de impacto + historial de canjes |
| POST | `/api/rewards` | Si (profesional) | Canjear puntos por recompensa |

### Resenas y disponibilidad

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| GET/POST | `/api/reviews` | Si | Crear resena + actualizar rating agregado |
| GET | `/api/reviews/received` | Si (prof.) | Resenas recibidas del profesional |
| POST | `/api/reviews/[id]/respond` | Si (prof.) | Responder a una resena |
| POST | `/api/reviews/[id]/report` | Si | Reportar una resena |
| GET/PUT | `/api/availability` | Si (prof.) | Disponibilidad semanal (reemplazo atomico) |
| POST | `/api/blocked-dates` | Si (prof.) | Bloquear fechas especificas |

### Comunicacion

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| GET/POST | `/api/conversations` | Si | Lista + crear conversacion |
| GET/POST | `/api/conversations/[id]/messages` | Si | Mensajes de una conversacion |
| GET | `/api/messages/unread` | Si | Conteo de mensajes no leidos |
| GET/PATCH | `/api/notifications` | Si | Notificaciones in-app |

### Herramientas y utilidades

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| POST | `/api/daily/create-room` | Si | Crear sala de videollamada Daily.co |
| POST | `/api/upload` | Si | Subir imagen de perfil (Cloudinary) |
| GET/POST | `/api/certifications` | Si (prof.) | Gestionar certificaciones |
| GET/POST | `/api/referrals` | Si | Sistema de referidos |
| POST | `/api/referrals/redeem` | Si | Canjear codigo de referido |
| POST | `/api/feedback` | Si | Enviar feedback de beta |
| POST | `/api/waitlist` | No | Unirse a la lista de espera |
| GET | `/api/health` | No | Health check del sistema |

### Cron jobs (protegidos con CRON_SECRET)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/cron/session-reminders` | Envia recordatorios de sesiones proximas |
| POST | `/api/cron/session-cleanup` | Cancela sesiones expiradas sin confirmar |
| POST | `/api/cron/onboarding-emails` | Emails de onboarding para nuevos profesionales |

## Sistema de diseno

- **Colores**: Base neutral (white <-> zinc-950) + acento indigo-600
- **Tipografia**: Inter (cuerpo) + Geist (titulos) — cargadas localmente
- **Componentes**: shadcn/ui con tarjetas glassmorphism personalizadas (`.glass`)
- **Animaciones**: Framer Motion con triggers de scroll + micro-interacciones
- **Responsive**: Mobile-first con breakpoints en sm/md/lg/xl
- **Tema**: Dark/light mode con `next-themes` (estrategia por clase CSS)

## Testing

```bash
npm test               # Tests unitarios e integracion (Vitest)
npm run test:watch     # Modo watch
npm run test:e2e       # Tests E2E (Playwright)
```

## Idioma

- **UI**: Espanol (Espana) — todo el texto visible para el usuario
- **Codigo**: Ingles — variables, comentarios y documentacion tecnica

## Ramas

| Rama | Proposito |
|------|-----------|
| `main` | Codigo estable / baseline |
| `develop` | Rama principal de desarrollo activo |

## Decisiones de arquitectura

1. **App Router** — Next.js 14 con layouts, server components y streaming
2. **Schema-first DB** — Prisma define todos los modelos; `db:push` para dev, `db:migrate` para prod
3. **Supabase PostgreSQL** — URL pooler (puerto 6543) para queries; URL directa (puerto 5432) para migraciones
4. **Flujo freemium** — `POST /api/credits/use` crea sesion CONFIRMED directamente, sin pago
5. **Puntos de impacto** — Los profesionales acumulan puntos por sesion completada, canjeables via `POST /api/rewards`
6. **Configuracion centralizada** — `credits-config.ts` como source of truth para todos los limites
7. **Daily.co con import dinamico** — `@daily-co/daily-js` se importa en `useEffect` para evitar crash en SSR
8. **Emails fire-and-forget** — Los envios usan `Promise.allSettled` para que los fallos no rompan las respuestas de la API
9. **Rating incremental** — Las resenas actualizan el rating como `(oldRating * oldCount + newRating) / newCount`
10. **Disponibilidad atomica** — `PUT /api/availability` usa `prisma.$transaction([deleteMany, createMany])`
11. **Dark/light mode** — `next-themes` con estrategia de clase y variables CSS
12. **Stripe como legacy** — Flujo de pago preservado pero pausado; para futuro tier premium
