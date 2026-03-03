# GuidePath

Marketplace que conecta profesionales con coaches y mentores especializados en desarrollo de carrera, liderazgo y emprendimiento. Sesiones por videollamada, cuando tú quieras.

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Animaciones | Framer Motion |
| UI | shadcn/ui (Radix primitives) |
| Base de datos | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (email/password + Google OAuth) |
| Pagos | Stripe Connect |
| Videollamadas | Daily.co SDK |
| Email | Resend |

## Puesta en marcha local

### Requisitos previos
- Node.js >= 18.17
- Docker Desktop

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

El `.env` ya incluye la `DATABASE_URL` apuntando al contenedor Docker local. Edita el resto de claves según necesites.

### 3. Levantar la base de datos

```bash
docker compose up -d
```

Esto arranca:
- **PostgreSQL** en `localhost:5433` (puerto 5433 para evitar conflicto con PostgreSQL local de Windows)
- **pgAdmin** en `http://localhost:5050` → `admin@guidepath.dev` / `admin`

### 4. Aplicar el schema y sembrar datos

```bash
npm run db:push    # Crea las tablas
npm run db:seed    # Crea usuarios de prueba
```

### 5. Arrancar el servidor

```bash
npm run dev
```

La app estará disponible en **http://localhost:3000**

---

## Usuarios de prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `cliente@guidepath.dev` | `password123` | Cliente |
| `profesional@guidepath.dev` | `password123` | Profesional |

---

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/explore` | Catálogo de profesionales |
| `/professional/[id]` | Perfil de profesional |
| `/book/[sessionId]` | Flujo de reserva |
| `/dashboard/client` | Dashboard de cliente |
| `/dashboard/professional` | Dashboard de profesional |
| `/session/[id]` | Sala de videollamada |
| `/auth/login` | Inicio de sesión |
| `/auth/register` | Registro |

---

## Scripts disponibles

```bash
npm run dev           # Servidor de desarrollo
npm run build         # Build de producción
npm run db:generate   # Generar cliente Prisma
npm run db:push       # Aplicar schema a la BD
npm run db:migrate    # Crear migración (producción)
npm run db:seed       # Sembrar datos de prueba
npm run db:studio     # Abrir Prisma Studio
```

---

## Estado del proyecto

- Datos mock en español para todas las páginas
- Auth funcional con NextAuth (email/password)
- API de registro (`POST /api/register`)
- Docker Compose para desarrollo local
- Integración con Stripe, Daily.co y Resend pendiente de configurar
