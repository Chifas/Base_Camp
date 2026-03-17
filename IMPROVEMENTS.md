# GuidePath — Mejoras Técnicas de Código

Este fichero recoge mejoras técnicas identificadas en revisión de código, listas para implementar con Claude Code.
Cada mejora incluye el archivo afectado, el problema concreto y la solución esperada.

---

## 🔴 CRÍTICO — JWT callback con query a DB en cada request

**Archivo:** `src/lib/auth.ts`

**Problema:**
El callback `jwt` hace un `prisma.user.findUnique()` en cada verificación de token, es decir, en prácticamente cada request autenticado. Con carga real esto es un cuello de botella grave.

```ts
// PROBLEMA ACTUAL — query a DB en cada request
if (token.id) {
  const fresh = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { role: true },
  });
  if (fresh) token.role = fresh.role;
}
```

**Solución esperada:**
Guardar el rol directamente en el token durante el login inicial. Solo refrescar desde DB si existe un flag explícito (ej: tras un cambio de rol por admin). El rol tarda hasta el siguiente login en actualizarse, comportamiento estándar y aceptable.

```ts
// SOLUCIÓN — solo escribir el rol en el token al hacer login
async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.role = (user as { role: string }).role; // solo en login
  }
  return token;
},
```

---

## 🟡 Índice faltante en modelo `Availability`

**Archivo:** `prisma/schema.prisma`

**Problema:**
El modelo `Availability` no tiene índice en `dayOfWeek`. Cada consulta de disponibilidad por día hace un full scan de la tabla.

```prisma
// PROBLEMA ACTUAL — sin índice
model Availability {
  id              String @id @default(cuid())
  professionalId  String
  dayOfWeek       Int
  startTime       String
  endTime         String
  ...
  @@map("availability")
}
```

**Solución esperada:**
Añadir índice compuesto `@@index([professionalId, dayOfWeek])` al modelo y ejecutar la migración correspondiente.

---

## 🟡 `ProfessionalCategory` como enum hardcodeado en schema

**Archivo:** `prisma/schema.prisma`

**Problema:**
Las categorías de profesionales son un enum Prisma con solo 4 valores hardcodeados (`PSYCHOLOGIST`, `COACH`, `CAREER_MENTOR`, `NUTRITIONIST`). Añadir una nueva categoría requiere una migración de base de datos y un redeploy.

**Solución esperada:**
Convertir `ProfessionalCategory` en un modelo `Category` con campos `id`, `slug`, `name`, `icon`, `description`, `active`. Actualizar `ProfessionalProfile` para usar `categoryId String` con relación a `Category`. Gestionar categorías desde el panel de admin (Fase 5.2 del Roadmap) sin tocar el schema.

Impacto: requiere migración de datos existentes al hacer el cambio.

---

## 🟡 Duplicación de lógica en `GET /api/sessions`

**Archivo:** `src/app/api/sessions/route.ts`

**Problema:**
El handler tiene la lógica de construcción de filtros y el `map()` del resultado duplicados casi exactamente para los roles `PROFESSIONAL` y `CLIENT`. Cualquier cambio hay que aplicarlo en dos sitios.

**Solución esperada:**
Extraer una función utilitaria `formatSessionForResponse(session, perspective: 'client' | 'professional')` que devuelva el DTO correcto según el rol, y reutilizarla en ambas ramas. Considerar también extraer `buildSessionWhereClause(params)` para centralizar la construcción de filtros.

---

## 🟠 Rate limiting ausente en APIs públicas o sensibles

**Archivos:** `src/app/api/register/route.ts`, `src/app/api/reviews/route.ts`, `src/app/api/professionals/route.ts`

**Problema:**
Ningún endpoint tiene rate limiting. Rutas como `/api/register` son vulnerables a ataques de fuerza bruta o spam de cuentas. Ya está registrado en el Roadmap (Fase 5.5) pero debería subir de prioridad antes del lanzamiento.

**Solución esperada:**
Instalar `@upstash/ratelimit` + `@upstash/redis`. Crear un helper `src/lib/rate-limit.ts` reutilizable. Aplicar como mínimo en:
- `POST /api/register` — máx 5 registros por IP por hora
- `POST /api/reviews` — máx 3 reviews por usuario por día
- `GET /api/professionals` — máx 60 requests por IP por minuto

Vercel tiene integración nativa con Upstash Redis, se configura en el dashboard sin infraestructura adicional.

---

## 🟠 Endpoints de cron sin protección

**Archivos:** `src/app/api/cron/` (todos los handlers)

**Problema:**
Los endpoints de cron jobs (`/api/cron/session-reminders`, etc.) son accesibles públicamente. Cualquiera puede dispararlos manualmente.

**Solución esperada:**
Añadir validación de header secreto en cada cron handler:

```ts
const authHeader = req.headers.get('authorization');
if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

Añadir `CRON_SECRET` a `.env.example` y configurarlo en Vercel. En `vercel.json` configurar los crons para que Vercel inyecte el header automáticamente.

---

## 🟢 Quick wins — mejoras menores de calidad

### `select` explícito en queries Prisma
**Archivos:** varios en `src/app/api/`

En algunos endpoints se incluyen relaciones completas (`include: { professional: { include: { user: true } } }`) cuando solo se necesitan 2-3 campos. Revisar todas las queries y añadir `select` explícito para reducir payload y tiempo de query.

### `revalidatePath` en mutaciones
**Archivos:** endpoints PATCH/POST que modifican sesiones, perfil, reviews

Si se usan Server Components para renderizar datos, añadir `revalidatePath('/dashboard')` o `revalidateTag('sessions')` al final de los handlers de mutación para que Next.js invalide la caché automáticamente.

### Migrar de `next-auth v4` a `Auth.js v5`
**Archivo:** `src/lib/auth.ts`, `src/middleware.ts`

Next-Auth v4 tiene integración limitada con el App Router de Next.js 14+. Auth.js v5 (beta estable) está diseñado específicamente para Server Components y middleware del App Router. No es urgente pero cuanto más se espere más costosa será la migración. Considerar para después del lanzamiento inicial.

---

*Última actualización: Marzo 2026*
