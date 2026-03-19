# GuidePath 🧭

> Plataforma freemium que conecta a profesionales en búsqueda de orientación laboral y de carrera con expertos certificados: mentores de carrera, coaches ejecutivos, psicólogos laborales y especialistas sectoriales.

## 💡 Modelo de negocio

| Rol | Cómo funciona |
|-----|---------------|
| **Cliente** | Obtiene **3 sesiones gratuitas al mes** (se reinician el 1 de cada mes). Sin pagos, sin tarjeta. |
| **Profesional** | Gana **puntos de impacto** por cada sesión completada (+10 pts/sesión). Los puntos se canjean por certificaciones (100 pts) o donaciones solidarias (50 pts). |

Toda la configuración de límites y puntos está centralizada en `src/lib/credits-config.ts`.

## 🚀 Tech Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Animaciones | Framer Motion |
| UI Components | shadcn/ui (Radix primitives) |
| Base de datos | PostgreSQL (Supabase) + Prisma ORM |
| Autenticación | NextAuth.js v4 (email/password + Google OAuth) |
| Sistema de créditos | Custom (`src/lib/credits-config.ts`) |
| Videollamadas | Daily.co SDK (`@daily-co/daily-js`) |
| Email | Resend |
| Pagos (legacy) | Stripe — pausado, reservado para futuro tier premium |

## 📁 Estructura del proyecto

```
src/
├── app/                         # Páginas (Next.js App Router)
│   ├── layout.tsx               # Layout raíz (fuentes, tema, providers)
│   ├── page.tsx                 # Landing page
│   ├── explore/                 # Búsqueda y descubrimiento de profesionales
│   ├── professional/[id]/       # Perfil público de profesional + booking card
│   ├── book/[sessionId]/        # Flujo de reserva (basado en créditos)
│   ├── onboarding/
│   │   └── professional/        # Onboarding del profesional tras registro
│   ├── dashboard/
│   │   ├── client/              # Dashboard del cliente (sesiones + créditos + reseñas)
│   │   └── professional/        # Dashboard del profesional (sesiones + impacto + disponibilidad)
│   ├── session/[id]/            # Sala de videollamada (Daily.co)
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── legal/
│   │   ├── privacidad/          # Política de privacidad
│   │   └── terminos/            # Términos y condiciones
│   └── api/
│       ├── register/            # POST — registro de usuario
│       ├── professionals/       # GET lista + GET [id] + POST/PUT /me
│       ├── sessions/            # GET lista + GET/PATCH [id]
│       ├── credits/             # GET — estado de créditos del cliente
│       │   └── use/             # POST — reservar sesión gratuita con créditos
│       ├── rewards/             # GET puntos de impacto + POST canjear recompensa
│       ├── categories/          # GET — categorías profesionales
│       ├── availability/        # GET + PUT — disponibilidad semanal
│       ├── reviews/             # POST — crear reseña + actualizar rating
│       ├── certifications/      # GET + POST + DELETE — certificaciones
│       ├── referrals/           # GET + POST — sistema de referidos
│       ├── notifications/       # GET + PATCH — notificaciones in-app
│       ├── upload/              # POST — subida de imágenes (Cloudinary)
│       ├── daily/
│       │   └── create-room/     # POST — crear sala Daily.co
│       ├── payments/            # (Legacy) Stripe PaymentIntent
│       ├── webhooks/stripe/     # (Legacy) Stripe webhook
│       └── stripe/              # (Legacy) Stripe Connect
├── components/
│   ├── ui/                      # Componentes base shadcn/ui
│   ├── layout/                  # Navbar, Footer, ThemeToggle
│   ├── landing/                 # Secciones de la landing page
│   └── shared/                  # Componentes reutilizables compuestos
├── lib/
│   ├── auth.ts                  # Configuración NextAuth
│   ├── prisma.ts                # Singleton del cliente Prisma
│   ├── credits-config.ts        # Configuración del sistema freemium
│   ├── validations.ts           # Esquemas Zod para validación
│   ├── emails.ts                # Plantillas de email + helpers de envío
│   ├── notifications.ts         # Sistema de notificaciones in-app
│   ├── resend.ts                # Singleton del cliente Resend
│   ├── cloudinary.ts            # Integración con Cloudinary
│   ├── stripe.ts                # Singleton de Stripe (legacy)
│   └── utils.ts                 # cn, formatDate, formatTime, etc.
├── data/
│   └── mock.ts                  # Datos mock para desarrollo
└── types/
    └── index.ts                 # Tipos TypeScript compartidos
prisma/
├── schema.prisma                # Esquema de la base de datos
└── seed.ts                      # Seed con usuarios de prueba
```

## ⚙️ Instalación y puesta en marcha

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

# 5. (Opcional) Insertar usuarios de prueba
npm run db:seed

# 6. Arrancar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔑 Variables de entorno

Consulta `.env.example` para ver todas las variables. Las principales:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL del pooler de Supabase (puerto 6543, `?pgbouncer=true`) |
| `DIRECT_URL` | URL directa de Supabase (puerto 5432) — necesaria para migraciones Prisma |
| `NEXTAUTH_SECRET` | Genera con `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` en local |
| `DAILY_API_KEY` | Desde el dashboard de daily.co |
| `RESEND_API_KEY` | Desde resend.com |
| `RESEND_FROM_EMAIL` | `GuidePath <onboarding@resend.dev>` para tier gratuito en desarrollo |
| `STRIPE_SECRET_KEY` | (Opcional) Solo para futuro tier premium |
| `GOOGLE_CLIENT_ID` | (Opcional) Para login con Google OAuth |

## 👤 Usuarios de prueba

Disponibles tras ejecutar `npm run db:seed`:

| Email | Contraseña | Rol |
|-------|------------|-----|
| `cliente@guidepath.dev` | `password123` | CLIENT |
| `profesional@guidepath.dev` | `password123` | PROFESSIONAL |

## 🔄 Flujo de reserva (end-to-end)

1. El cliente visita `/explore` y descubre profesionales → entra en `/professional/[id]`
2. Selecciona fecha y hora → navega a `/book/new?professional=...&date=...&time=...`
3. La página de reserva consulta `/api/credits` → muestra créditos restantes
4. El cliente pulsa **"Confirmar reserva gratuita"** → `POST /api/credits/use`
5. La API valida créditos → crea Sesión (CONFIRMED) → incrementa `freeCreditsUsed` → envía emails
6. Cliente y profesional reciben confirmación por email
7. El cliente entra en `/session/[id]` → `POST /api/daily/create-room` → aparece la videollamada
8. Tras la sesión: el profesional marca COMPLETED → se otorgan puntos de impacto → el cliente puede dejar reseña

## 🏆 Sistema de créditos y recompensas

| Concepto | Valor |
|----------|-------|
| Sesiones gratuitas / mes (cliente) | 3 |
| Puntos de impacto por sesión completada | +10 |
| Puntos para certificación profesional | 100 |
| Puntos para donación solidaria | 50 |

Configuración en `src/lib/credits-config.ts`:

```typescript
export const CREDITS_CONFIG = {
  FREE_SESSIONS_PER_MONTH: 3,
  IMPACT_POINTS_PER_SESSION: 10,
  IMPACT_POINTS_CERTIFICATION: 100,
  IMPACT_POINTS_DONATION: 50,
} as const;
```

## 🛣️ API Routes

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/register` | No | Crear cuenta de usuario |
| GET | `/api/professionals` | No | Listar profesionales (filtros: categoría, búsqueda) |
| GET | `/api/professionals/[id]` | No | Perfil + disponibilidad + reseñas |
| GET | `/api/professionals/me` | Sí | Perfil del profesional autenticado |
| POST | `/api/professionals/me` | Sí | Crear perfil profesional (onboarding) |
| PUT | `/api/professionals/me` | Sí | Actualizar perfil profesional |
| GET | `/api/sessions` | Sí | Sesiones del usuario (próximas + pasadas) |
| GET | `/api/sessions/[id]` | Sí | Detalle de sesión |
| PATCH | `/api/sessions/[id]` | Sí | Actualizar estado (CANCELLED, COMPLETED + otorgar puntos) |
| GET | `/api/credits` | Sí | Estado de créditos del cliente |
| POST | `/api/credits/use` | Sí (cliente) | Reservar sesión gratuita |
| GET | `/api/rewards` | Sí (profesional) | Puntos de impacto + historial de canjes |
| POST | `/api/rewards` | Sí (profesional) | Canjear puntos por recompensa |
| GET | `/api/categories` | No | Categorías profesionales disponibles |
| GET | `/api/availability` | Sí (profesional) | Disponibilidad semanal |
| PUT | `/api/availability` | Sí (profesional) | Reemplazar disponibilidad (atómico) |
| POST | `/api/reviews` | Sí (cliente) | Crear reseña + actualizar rating agregado |
| POST | `/api/daily/create-room` | Sí | Crear sala de videollamada Daily.co |
| GET | `/api/notifications` | Sí | Notificaciones del usuario |
| POST | `/api/upload` | Sí | Subir imagen de perfil |

## 🎨 Sistema de diseño

- **Colores**: Base neutral (white ↔ zinc-950) + acento indigo-600
- **Tipografía**: Inter (cuerpo) + Geist (títulos) — cargadas localmente
- **Componentes**: shadcn/ui con tarjetas glassmorphism personalizadas (`.glass`)
- **Animaciones**: Framer Motion con triggers de scroll + micro-interacciones
- **Responsive**: Mobile-first con breakpoints en sm/md/lg/xl
- **Tema**: Dark/light mode con `next-themes` (estrategia por clase CSS)
- **Logo**: SVG personalizado "GP" con flecha ascendente en azul

## 🧪 Testing

```bash
# Tests unitarios (Vitest)
npm test

# Tests e2e (Playwright)
npm run test:e2e
```

## 🌐 Idioma

- **UI**: Español (España) — todo el texto visible para el usuario
- **Código**: Inglés — variables, comentarios y documentación técnica

## 📌 Ramas

| Rama | Propósito |
|------|-----------|
| `main` | Código estable / baseline |
| `develop` | Rama principal de desarrollo activo |

La rama `develop` contiene todo el trabajo de features (auth, créditos, impacto social, Daily.co, Resend, reseñas, disponibilidad). Usa esta rama para testing y desarrollo.

## 📐 Decisiones de arquitectura

1. **App Router** — Next.js 14 con layouts, server components y streaming
2. **Schema-first DB** — Prisma define todos los modelos; `db:push` para dev, `db:migrate` para prod
3. **Supabase PostgreSQL** — URL pooler (puerto 6543) para queries; URL directa (puerto 5432) para migraciones
4. **Flujo freemium** — `POST /api/credits/use` crea sesión CONFIRMED directamente, sin pago
5. **Puntos de impacto** — Los profesionales acumulan puntos por sesión completada, canjeables vía `POST /api/rewards`
6. **Configuración centralizada** — `credits-config.ts` como source of truth para todos los límites
7. **Daily.co con import dinámico** — `@daily-co/daily-js` se importa en `useEffect` para evitar crash en SSR
8. **Emails fire-and-forget** — Los envíos usan `Promise.allSettled` para que los fallos no rompan las respuestas de la API
9. **Rating incremental** — Las reseñas actualizan el rating como `(oldRating * oldCount + newRating) / newCount`
10. **Disponibilidad atómica** — `PUT /api/availability` usa `prisma.$transaction([deleteMany, createMany])`
11. **Dark/light mode** — `next-themes` con estrategia de clase y variables CSS
12. **Stripe como legacy** — Flujo de pago preservado pero pausado; para futuro tier premium de suscripción
