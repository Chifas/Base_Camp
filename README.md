<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-5.14-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/Stripe-Connect-635BFF?style=for-the-badge&logo=stripe&logoColor=white" />
</p>

# GuidePath

**Marketplace que conecta profesionales con expertos del mundo laboral: mentores de carrera, coaches ejecutivos, especialistas sectoriales y psicólogos laborales.**

Sesiones por videollamada, sin desplazamientos. Pago seguro, profesionales verificados y una experiencia premium enfocada al crecimiento profesional.

---

## Tabla de contenidos

- [Descripción del proyecto](#descripción-del-proyecto)
- [Funcionalidades principales](#funcionalidades-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación y setup](#instalación-y-setup)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Scripts disponibles](#scripts-disponibles)
- [Páginas de la aplicación](#páginas-de-la-aplicación)
- [Sistema de diseño](#sistema-de-diseño)
- [Infraestructura gratuita recomendada](#infraestructura-gratuita-recomendada)
- [Despliegue en producción](#despliegue-en-producción)

---

## Descripción del proyecto

GuidePath es una plataforma web tipo marketplace donde:

- **Profesionales** (empleados, managers, founders, freelancers) encuentran expertos verificados, reservan sesiones por videollamada y dejan reseñas tras cada sesión.
- **Expertos** (mentores de carrera, coaches ejecutivos, especialistas sectoriales, psicólogos laborales) gestionan su disponibilidad, aceptan sesiones, reciben pagos y construyen su reputación.
- **La plataforma** cobra una comisión por cada sesión completada mediante Stripe Connect.

Todo el universo de GuidePath gira en torno al **mundo laboral y profesional**: cambios de carrera, desarrollo del liderazgo, burnout, dinámicas de equipo, expertise sectorial.

El diseño sigue una estética premium y minimalista inspirada en aplicaciones como Linear.app y Notion, con modo oscuro/claro, animaciones suaves y una experiencia completamente responsive.

Toda la interfaz de usuario está en **español de España**.

---

## Funcionalidades principales

| Funcionalidad | Descripción |
|---|---|
| **Exploración de profesionales** | Directorio con filtros por categoría, precio, valoración y búsqueda por texto |
| **Perfiles profesionales** | Biografía, especialidades, disponibilidad semanal, reseñas y reserva directa |
| **Reserva de sesiones** | Selección de fecha/hora, notas opcionales y flujo de pago integrado |
| **Videollamada integrada** | Sala de videollamada con controles de micro/cámara, chat y picture-in-picture |
| **Panel del cliente** | Sesiones próximas y pasadas, estadísticas, posibilidad de dejar reseñas |
| **Panel del profesional** | Gestión de sesiones, configuración de disponibilidad, historial de ingresos |
| **Autenticación** | Registro/login con email y contraseña o Google OAuth |
| **Modo oscuro/claro** | Cambio de tema con persistencia automática |
| **Pagos** | Stripe Connect en modo marketplace con comisión de plataforma |
| **Email transaccional** | Confirmaciones y recordatorios vía Resend |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) 5.4 |
| **Estilos** | [Tailwind CSS](https://tailwindcss.com/) 3.4 + variables CSS (modo oscuro/claro) |
| **Componentes UI** | [shadcn/ui](https://ui.shadcn.com/) (primitivos de Radix UI) |
| **Animaciones** | [Framer Motion](https://www.framer.com/motion/) |
| **Base de datos** | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) |
| **Autenticación** | [NextAuth.js](https://next-auth.js.org/) (email/contraseña + Google OAuth) |
| **Pagos** | [Stripe Connect](https://stripe.com/connect) (pagos divididos marketplace) |
| **Videollamadas** | [Daily.co](https://www.daily.co/) SDK integrado |
| **Email** | [Resend](https://resend.com/) |
| **Tipografías** | Inter (cuerpo) + Geist (encabezados) — ambas locales |

---

## Estructura del proyecto

```
guidepath/
├── prisma/
│   └── schema.prisma              # Esquema de base de datos
├── public/                        # Archivos estáticos
├── src/
│   ├── app/                       # Páginas (Next.js App Router)
│   │   ├── layout.tsx             # Layout raíz (fuentes, tema, providers)
│   │   ├── page.tsx               # Landing page
│   │   ├── globals.css            # Variables CSS y estilos globales
│   │   ├── fonts/                 # Fuentes locales (Inter, Geist)
│   │   ├── auth/
│   │   │   ├── login/page.tsx     # Inicio de sesión
│   │   │   └── register/page.tsx  # Registro
│   │   ├── explore/page.tsx       # Explorar profesionales
│   │   ├── professional/
│   │   │   └── [id]/page.tsx      # Perfil del profesional
│   │   ├── book/
│   │   │   └── [sessionId]/page.tsx  # Flujo de reserva
│   │   ├── dashboard/
│   │   │   ├── client/page.tsx    # Panel del cliente
│   │   │   └── professional/page.tsx  # Panel del profesional
│   │   └── session/
│   │       └── [id]/page.tsx      # Sala de videollamada
│   ├── components/
│   │   ├── ui/                    # Componentes base (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── separator.tsx
│   │   │   └── skeleton.tsx
│   │   ├── layout/                # Componentes de estructura
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── landing/               # Secciones de la landing page
│   │   │   ├── hero.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── featured-professionals.tsx
│   │   │   ├── testimonials.tsx
│   │   │   └── cta.tsx
│   │   └── shared/                # Componentes reutilizables
│   │       └── motion-wrapper.tsx # Wrappers de Framer Motion
│   ├── data/
│   │   └── mock.ts               # Datos de prueba en español
│   ├── lib/
│   │   └── utils.ts              # Utilidades (cn, formatCurrency, formatDate)
│   └── types/
│       └── index.ts              # Tipos e interfaces TypeScript
├── .env.example                   # Plantilla de variables de entorno
├── .gitignore
├── CLAUDE.md                      # Documentación de arquitectura
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Requisitos previos

Antes de empezar, asegúrate de tener instalado:

- **Node.js** 18.17 o superior — [descargar](https://nodejs.org/)
- **npm** 9+ (viene incluido con Node.js)
- **PostgreSQL** (local o remoto) — o una cuenta gratuita en [Supabase](https://supabase.com/) / [Railway](https://railway.app/)
- **Git** — [descargar](https://git-scm.com/)

### Cuentas necesarias (todas tienen tier gratuito)

| Servicio | Para qué | Registro |
|---|---|---|
| **Supabase** o **Railway** | Base de datos PostgreSQL | [supabase.com](https://supabase.com/) |
| **Stripe** | Pagos (modo test) | [stripe.com](https://stripe.com/) |
| **Daily.co** | Videollamadas | [daily.co](https://www.daily.co/) |
| **Resend** | Emails transaccionales | [resend.com](https://resend.com/) |
| **Google Cloud Console** | OAuth con Google | [console.cloud.google.com](https://console.cloud.google.com/) |

---

## Instalación y setup

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Base_Camp
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` y rellena cada variable con tus claves reales (ver sección [Variables de entorno](#variables-de-entorno)).

### 4. Configurar la base de datos

```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear las tablas en tu base de datos
npm run db:push
```

### 5. Arrancar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en **http://localhost:3000**.

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# ─── Autenticación ────────────────────────────────
NEXTAUTH_SECRET=          # Generar con: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# ─── Base de datos ────────────────────────────────
DATABASE_URL=postgresql://usuario:contraseña@host:5432/guidepath

# ─── Stripe (modo marketplace) ───────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ─── Daily.co (videollamadas) ────────────────────
DAILY_API_KEY=tu-clave-daily-aquí

# ─── Resend (email) ─────────────────────────────
RESEND_API_KEY=re_...

# ─── Google OAuth ────────────────────────────────
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

### Cómo obtener cada clave

| Variable | Cómo obtenerla |
|---|---|
| `NEXTAUTH_SECRET` | Ejecuta `openssl rand -base64 32` en tu terminal |
| `DATABASE_URL` | Copia la cadena de conexión de Supabase (Settings > Database > Connection string) |
| `STRIPE_SECRET_KEY` | Panel de Stripe > Developers > API keys (usa las de test) |
| `STRIPE_PUBLISHABLE_KEY` | Mismo lugar que la anterior |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| `DAILY_API_KEY` | Panel de Daily.co > Developers > API Keys |
| `RESEND_API_KEY` | Panel de Resend > API Keys |
| `GOOGLE_CLIENT_ID` / `SECRET` | Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client |

---

## Base de datos

### Esquema

La base de datos utiliza **PostgreSQL** con **Prisma ORM**. Los modelos principales son:

| Modelo | Descripción |
|---|---|
| `User` | Usuarios de la plataforma (cliente, profesional o administrador) |
| `ProfessionalProfile` | Perfil profesional: categoría, tarifa, valoración, cuenta de Stripe |
| `Session` | Sesiones reservadas con estado, fecha, precio y enlace de videollamada |
| `Review` | Reseñas con puntuación (1-5) y comentario |
| `Availability` | Franjas horarias disponibles por día de la semana |
| `Account` | Cuentas de proveedores OAuth (NextAuth.js) |
| `AuthSession` | Tokens de sesión (NextAuth.js) |

### Categorías profesionales

- `CAREER_MENTOR` — Mentor de Carrera
- `EXECUTIVE_COACH` — Coach Ejecutivo
- `SECTOR_EXPERT` — Experto Sectorial
- `WORK_PSYCHOLOGIST` — Psicólogo/a Laboral

### Comandos de base de datos

```bash
npm run db:generate   # Genera el cliente de Prisma
npm run db:push       # Sincroniza el esquema con la BD (desarrollo)
npm run db:migrate    # Crea y ejecuta migraciones (producción)
npm run db:studio     # Abre Prisma Studio (interfaz visual para la BD)
npm run db:seed       # Ejecuta el seed de datos iniciales
```

---

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Arranca el servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Compila la aplicación para producción |
| `npm start` | Arranca el servidor de producción (requiere `build` previo) |
| `npm run lint` | Ejecuta el linter de Next.js |
| `npm run db:generate` | Genera el cliente de Prisma a partir del esquema |
| `npm run db:push` | Empuja el esquema a la base de datos |
| `npm run db:migrate` | Crea y aplica migraciones |
| `npm run db:studio` | Abre la interfaz visual de Prisma Studio |
| `npm run db:seed` | Ejecuta datos iniciales |

---

## Páginas de la aplicación

### Páginas públicas

| Ruta | Página | Descripción |
|---|---|---|
| `/` | **Landing** | Página de inicio con hero animado, cómo funciona, profesionales destacados, testimonios y CTA |
| `/explore` | **Explorar** | Directorio de profesionales con búsqueda, filtros por categoría y ordenación |
| `/professional/[id]` | **Perfil profesional** | Detalle del profesional con bio, disponibilidad, reseñas y reserva |
| `/auth/login` | **Iniciar sesión** | Login con Google OAuth o email/contraseña |
| `/auth/register` | **Registro** | Registro como cliente o profesional |

### Páginas autenticadas

| Ruta | Página | Descripción |
|---|---|---|
| `/book/[sessionId]` | **Reservar** | Flujo de reserva: revisión, pago con Stripe y confirmación |
| `/dashboard/client` | **Panel del cliente** | Sesiones próximas/pasadas, estadísticas, dejar reseñas |
| `/dashboard/professional` | **Panel del profesional** | Ingresos, gestión de sesiones, configuración de disponibilidad |
| `/session/[id]` | **Videollamada** | Sala de videollamada con controles, chat y picture-in-picture |

---

## Sistema de diseño

### Paleta de colores

- **Base**: blanco (`#ffffff`) en modo claro / zinc-950 (`#09090b`) en modo oscuro
- **Acento**: indigo-600 (`#4f46e5`) — color principal de la marca
- **Variables CSS**: todos los colores se definen mediante variables HSL para cambiar fácilmente entre temas

### Tipografías

- **Inter** (Variable) — texto del cuerpo, UI general
- **Geist** (Variable) — encabezados y números destacados

Ambas fuentes se cargan de forma local (sin dependencia de Google Fonts).

### Componentes UI (shadcn/ui)

Componentes base incluidos: `Button`, `Input`, `Card`, `Badge`, `Avatar`, `Select`, `Tabs`, `Separator`, `Skeleton`.

### Animaciones (Framer Motion)

- `FadeIn` — aparición con desplazamiento (arriba, abajo, izquierda, derecha)
- `StaggerContainer` / `StaggerItem` — aparición escalonada de elementos en lista
- `ScaleIn` — aparición con escalado
- Todas las animaciones se activan al hacer scroll (`whileInView`)

### Estilo glassmorphism

Las tarjetas de profesionales utilizan la clase `.glass` que combina fondo semi-transparente con `backdrop-blur`.

---

## Infraestructura gratuita recomendada

| Servicio | Uso | Tier gratuito |
|---|---|---|
| [Supabase](https://supabase.com/) | Base de datos PostgreSQL | 500 MB, 2 proyectos |
| [Vercel](https://vercel.com/) | Hosting de Next.js | Uso personal ilimitado |
| [Daily.co](https://www.daily.co/) | Videollamadas | 10.000 minutos/mes |
| [Resend](https://resend.com/) | Emails transaccionales | 3.000 emails/mes |
| [Stripe](https://stripe.com/) | Pagos | Sin cuota mensual, solo % por transacción |

---

## Despliegue en producción

### Vercel (recomendado)

1. Conecta tu repositorio de GitHub con [Vercel](https://vercel.com/)
2. Configura las variables de entorno en el panel de Vercel (Settings > Environment Variables)
3. Asegúrate de que `NEXTAUTH_URL` apunte a tu dominio de producción
4. Vercel detectará automáticamente que es un proyecto Next.js y lo configurará

```bash
# O despliega manualmente con la CLI de Vercel
npx vercel --prod
```

### Checklist antes de producción

- [ ] Todas las variables de entorno configuradas con claves de producción (no test)
- [ ] Base de datos migrada con `npm run db:migrate`
- [ ] Stripe configurado en modo live con webhook apuntando a tu dominio
- [ ] Google OAuth con URI de redirección de producción añadida
- [ ] `NEXTAUTH_URL` actualizado al dominio final
- [ ] `NEXTAUTH_SECRET` generado de forma segura

---

## Estado actual

Este proyecto es un **MVP scaffolded** (estructura completa con datos de prueba). Las páginas utilizan datos mock en español para demostración. Los siguientes pasos para completar la integración serían:

1. Conectar NextAuth.js con la base de datos real (Prisma Adapter ya incluido como dependencia)
2. Crear las API routes para CRUD de sesiones, profesionales y reseñas
3. Integrar Stripe Connect para pagos reales
4. Integrar Daily.co SDK para videollamadas reales
5. Configurar Resend para emails transaccionales
6. Añadir validación de formularios (por ejemplo, con Zod)
7. Implementar protección de rutas según el rol del usuario

---

<p align="center">
  Hecho con Next.js, TypeScript y mucho café.
</p>
