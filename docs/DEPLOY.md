# Guia de Despliegue — GuidePath

## Vercel (recomendado)

### 1. Conectar repositorio

1. Ir a [vercel.com](https://vercel.com) y crear nuevo proyecto
2. Importar el repositorio `Chifas/Base_Camp`
3. Seleccionar rama `Develop` como rama de produccion
4. Framework: Next.js (autodetectado)

### 2. Variables de entorno

Configurar en **Settings > Environment Variables**:

| Variable | Valor | Notas |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...?pgbouncer=true` | URL del pooler de Supabase, puerto 6543 |
| `DIRECT_URL` | `postgresql://...` | URL directa de Supabase, puerto 5432 |
| `NEXTAUTH_SECRET` | (generado) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://guidepath.vercel.app` | Tu dominio en Vercel |
| `STRIPE_SECRET_KEY` | `sk_live_...` o `sk_test_...` | Clave secreta de Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` o `pk_test_...` | Clave publica de Stripe |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Webhook signing secret |
| `DAILY_API_KEY` | `...` | API key de Daily.co |
| `RESEND_API_KEY` | `re_...` | API key de Resend |
| `RESEND_FROM_EMAIL` | `GuidePath <noreply@tudominio.com>` | Dominio verificado en Resend |
| `NEXT_PUBLIC_SITE_URL` | `https://guidepath.vercel.app` | Para OG, sitemap, etc. |

### 3. Build settings

- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm ci` (default)

### 4. Post-deploy

Vercel ejecuta `postinstall` automaticamente (`prisma generate`).

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

## Stripe

### Webhooks

1. Ir a [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Crear endpoint: `https://guidepath.vercel.app/api/webhooks/stripe`
3. Eventos a escuchar:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `account.updated` (para Stripe Connect)
4. Copiar **Signing Secret** → `STRIPE_WEBHOOK_SECRET`

### Stripe Connect (payouts)

Para habilitar pagos a profesionales:
1. Activar Connect en Stripe Dashboard
2. Los profesionales se conectan via OAuth flow (pendiente de implementar)

## Daily.co (Videollamadas)

1. Crear cuenta en [daily.co](https://daily.co)
2. Copiar API key desde Dashboard
3. Las rooms se crean dinamicamente via `POST /api/daily/create-room`

## Resend (Emails)

1. Crear cuenta en [resend.com](https://resend.com)
2. Verificar dominio (o usar `onboarding@resend.dev` para testing)
3. Copiar API key

## Dominio personalizado

1. En Vercel: **Settings > Domains > Add**
2. Configurar DNS:
   - `CNAME` → `cname.vercel-dns.com`
3. Actualizar `NEXTAUTH_URL` y `NEXT_PUBLIC_SITE_URL`
4. Actualizar webhook URL en Stripe

## Branch Protection (GitHub)

Se recomienda configurar en **Settings > Branches > Branch protection rules**:

1. Crear regla para `Develop`:
   - Require status checks to pass: `ci`
   - Require pull request before merging
   - Require approvals: 1
2. Crear regla para `main`:
   - Mismas reglas + restrict who can push

## Health Check

El endpoint `GET /api/health` verifica conectividad con la base de datos. Util para monitoring:

```bash
curl https://guidepath.vercel.app/api/health
# {"status":"ok","timestamp":"...","database":"connected"}
```

## Checklist pre-produccion

- [ ] Variables de entorno configuradas en Vercel
- [ ] Migraciones aplicadas en Supabase
- [ ] Webhook de Stripe apuntando al dominio correcto
- [ ] Dominio verificado en Resend
- [ ] Branch protection configurado en GitHub
- [ ] Health check respondiendo OK
- [ ] SSL activo (automatico en Vercel)
