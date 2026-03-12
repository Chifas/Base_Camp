# GuidePath 🧭

> Marketplace que conecta a personas en búsqueda de orientación personal o profesional con profesionales certificados: psicólogos, life coaches, mentores de carrera, nutricionistas y más.

## 🚀 Tech Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Animaciones | Framer Motion |
| UI Components | shadcn/ui (Radix primitives) |
| Base de datos | PostgreSQL + Prisma ORM |
| Autenticación | NextAuth.js (email/password + Google OAuth) |
| Pagos | Stripe Connect (split payments) |
| Videollamadas | Daily.co SDK |
| Email | Resend |

## 📁 Estructura del proyecto

```
src/
├── app/                    # Páginas (Next.js App Router)
│   ├── layout.tsx          # Layout raíz
│   ├── page.tsx            # Landing page
│   ├── explore/            # Búsqueda de profesionales
│   ├── professional/[id]/  # Perfil de profesional
│   ├── book/[sessionId]/   # Flujo de reserva
│   ├── dashboard/
│   │   ├── client/         # Dashboard del cliente
│   │   └── professional/   # Dashboard del profesional
│   ├── session/[id]/       # Sala de videollamada
│   └── auth/
│       ├── login/
│       └── register/
├── components/
│   ├── ui/                 # Componentes base shadcn/ui
│   ├── layout/             # Navbar, Footer, ThemeToggle
│   ├── landing/            # Secciones de la landing
│   └── shared/             # Componentes reutilizables
├── lib/                    # Utilidades (cn, prisma client…)
├── data/                   # Mock data para desarrollo
└── types/                  # Tipos TypeScript compartidos
prisma/
└── schema.prisma           # Esquema de la base de datos
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

# 5. Arrancar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔑 Variables de entorno

Consulta `.env.example` para ver todas las variables necesarias:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Supabase (free tier) o PostgreSQL local |
| `NEXTAUTH_SECRET` | Genera con `openssl rand -base64 32` |
| `STRIPE_*` | Claves de Stripe en modo test |
| `DAILY_API_KEY` | Free tier desde el dashboard de daily.co |
| `RESEND_API_KEY` | Free tier desde resend.com |

## 🎨 Sistema de diseño

- **Colores**: Base neutral (white ↔ zinc-950) + acento indigo-600
- **Tipografía**: Inter (cuerpo) + Geist (títulos)
- **Componentes**: shadcn/ui con tarjetas glassmorphism personalizadas
- **Animaciones**: Framer Motion con triggers de scroll + micro-interacciones
- **Responsive**: Mobile-first con breakpoints en sm/md/lg/xl
- **Tema**: Dark/light mode con `next-themes` (estrategia por clase)

## 🌐 Idioma

- **UI**: Español (España) — todo el texto visible para el usuario
- **Código**: Inglés — variables, comentarios y documentación

## 📌 Ramas

| Rama | Propósito |
|------|-----------|
| `main` | Código estable / producción |
| `Develop` | Rama principal de desarrollo |
