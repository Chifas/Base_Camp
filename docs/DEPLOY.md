# Guia de Despliegue — GuidePath

## Vercel (recomendado)

### 1. Conectar repositorio

1. Ir a [vercel.com](https://vercel.com) y crear nuevo proyecto
2. Importar el repositorio `Chifas/Base_Camp`
3. Seleccionar rama `develop` como rama de produccion
4. Framework: Next.js (autodetectado)

### 2. Variables de entorno

Configurar en **Settings > Environment Variables**:

| Variable | Valor | Notas |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...?pgbouncer=true` | URL pooler Supabase, puerto 6543 |
| `DIRECT_URL` | `postgresql://...` | URL directa Supabase, puerto 5432 |
| `NEXTAUTH_SECRET` | (generado) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://tu-dominio.vercel.app` | URL publica de la app |
| `NEXT_PUBLIC_SITE_URL` | `https://tu-dominio.vercel.app` | Para OG, sitemap, emails |
| `DAILY_API_KEY` | `...` | API key de Daily.co |
| `RESEND_API_KEY` | `re_...` | API key de Resend |
| `RESEND_FROM_EMAIL` | `GuidePath <noreply@tudominio.com>` | Dominio verificado en Resend |
| `CLOUDINARY_CLOUD_NAME` | `...` | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | `...` | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | `...` | API secret de Cloudinary |
| `UPSTASH_REDIS_REST_URL` | `https://...` | URL REST de Upstash Redis (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | `...` | Token de Upstash Redis |
| `CRON_SECRET` | (generado) | `openssl rand -base64 32` — protege endpoints cron |
| `GOOGLE_CLIENT_ID` | `...` | (Opcional) Para login con Google OAuth |
| `GOOGLE_CLIENT_SECRET` | `...` | (Opcional) Para login con Google OAuth |
| `STRIPE_SECRET_KEY` | `sk_live_...` | (Opcional) Solo para tier premium |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | (Opcional) Solo para tier premium |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | (Opcional) Solo para tier premium |

### 3. Build settings

- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm ci` (default)

Vercel ejecuta `postinstall` automaticamente (`prisma generate`).

### 4. Cron jobs

Configurar en `vercel.json` los cron jobs con el header `Authorization: Bearer $CRON_SECRET`:

```json
{
  "crons": [
    { "path": "/api/cron/session-reminders", "schedule": "0 8 * * *" },
    { "path": "/api/cron/session-cleanup", "schedule": "0 2 * * *" },
    { "path": "/api/cron/onboarding-emails", "schedule": "0 10 * * *" }
  ]
}
```

---

## Supabase (Base de datos)

### Configuracion inicial

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Copiar las URLs de conexion:
   - **Pooler URL** (puerto 6543) → `DATABASE_URL`
   - **Direct URL** (puerto 5432) → `DIRECT_URL`
3. Ejecutar migraciones:

```bash
npx prisma migrate deploy
```

### Migraciones en produccion

```bash
# Crear migracion localmente
npx prisma migrate dev --name nombre_descriptivo

# Aplicar en produccion
npx prisma migrate deploy
```

> En desarrollo puedes usar `npm run db:push` para sincronizar el schema sin crear migraciones.

---

## Cloudinary (Imagenes)

1. Crear cuenta en [cloudinary.com](https://cloudinary.com)
2. Copiar desde Dashboard: **Cloud Name**, **API Key**, **API Secret**
3. Las imagenes se suben via `POST /api/upload` y se almacenan en la carpeta `guidepath/`

---

## Upstash Redis (Rate limiting)

1. Crear base de datos en [upstash.com](https://upstash.com) > Redis
2. Copiar **REST URL** y **REST Token**
3. Rate limiting activo en: `POST /api/auth/register`, `POST /api/reviews`, `GET /api/professionals`, `POST /api/auth/login`

---

## Daily.co (Videollamadas)

1. Crear cuenta en [daily.co](https://daily.co)
2. Copiar API key desde Dashboard
3. Las rooms se crean dinamicamente via `POST /api/daily/create-room` al confirmar sesion

---

## Resend (Emails)

1. Crear cuenta en [resend.com](https://resend.com)
2. Verificar dominio (necesario para envio en produccion)
3. Para desarrollo local: usar `onboarding@resend.dev` como `RESEND_FROM_EMAIL` (tier gratuito)

---

## Google OAuth (Opcional)

1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Habilitar **Google+ API**
3. Crear credenciales OAuth 2.0 con redirect URI: `https://tu-dominio/api/auth/callback/google`
4. Copiar **Client ID** y **Client Secret**

---

## Stripe (Opcional — tier premium futuro)

### Webhooks

1. Ir a Stripe Dashboard > Developers > Webhooks
2. Crear endpoint: `https://tu-dominio/api/webhooks/stripe`
3. Eventos a escuchar: `checkout.session.completed`, `checkout.session.expired`, `account.updated`
4. Copiar **Signing Secret** → `STRIPE_WEBHOOK_SECRET`

---

## Dominio personalizado

1. En Vercel: **Settings > Domains > Add**
2. Configurar DNS: `CNAME` → `cname.vercel-dns.com`
3. Actualizar `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL` y el webhook de Stripe

---

## Branch Protection (GitHub)

Configurar en **Settings > Branches > Branch protection rules**:

1. Regla para `develop`:
   - Require status checks to pass: `ci`
   - Require pull request before merging
   - Require approvals: 1
2. Regla para `main`:
   - Mismas reglas + restrict who can push

---

## Health Check

El endpoint `GET /api/health` verifica conectividad con base de datos y servicios externos:

```bash
curl https://tu-dominio/api/health
# {"status":"ok","timestamp":"...","database":"connected","services":{...}}
```

Util para monitoring con Vercel, Uptime Robot o similar.

---

## Checklist pre-produccion

- [ ] Variables de entorno configuradas en Vercel (especialmente las obligatorias)
- [ ] Migraciones aplicadas en Supabase (`prisma migrate deploy`)
- [ ] Dominio verificado en Resend
- [ ] Cloudinary configurado y `CLOUDINARY_*` vars presentes
- [ ] Upstash Redis configurado (`UPSTASH_*` vars presentes)
- [ ] `CRON_SECRET` generado y configurado en Vercel
- [ ] Cron jobs configurados en `vercel.json`
- [ ] Branch protection configurado en GitHub
- [ ] Health check respondiendo `"status":"ok"`
- [ ] SSL activo (automatico en Vercel)
- [ ] `NEXTAUTH_URL` y `NEXT_PUBLIC_SITE_URL` apuntando al dominio correcto
