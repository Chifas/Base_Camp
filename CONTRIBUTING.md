# Contribuir a GuidePath

## Requisitos previos

- Node.js >= 18.17
- npm >= 9
- PostgreSQL (Supabase o local via docker-compose)

## Configurar entorno local

```bash
# Clonar el repositorio
git clone https://github.com/Chifas/Base_Camp.git
cd Base_Camp

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Rellenar .env con claves reales (ver docs/DEPLOY.md)

# Generar Prisma client y sincronizar schema
npm run db:generate
npm run db:push

# Seed de datos de prueba
npm run db:seed

# Iniciar servidor de desarrollo
npm run dev
```

Para levantar PostgreSQL en local sin Supabase:

```bash
docker-compose up -d
# DATABASE_URL=postgresql://postgres:postgres@localhost:5433/guidepath
```

## Ramas

| Rama | Uso |
|------|-----|
| `main` | Estable, solo merges desde `develop` |
| `develop` | Desarrollo activo — rama principal |
| `feature/*` | Nuevas funcionalidades |
| `fix/*` | Correcciones de bugs |

Crea siempre tu rama desde `develop`:

```bash
git checkout develop
git pull
git checkout -b feature/nombre-descriptivo
```

## Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/es/). El hook `commit-msg` valida el formato automaticamente.

```
feat: nueva funcionalidad
fix: correccion de bug
docs: cambios en documentacion
style: formato, espacios, etc.
refactor: cambio de codigo sin cambiar funcionalidad
perf: mejora de rendimiento
test: tests nuevos o corregidos
build: cambios en el sistema de build
ci: cambios en CI/CD
chore: tareas de mantenimiento
```

## Antes de hacer commit

El hook `pre-commit` ejecuta `next lint` automaticamente. Para ejecutarlo manualmente:

```bash
npm run lint
npm run build
npm test
```

## Pull Requests

1. Crear rama desde `develop`
2. Hacer cambios con commits convencionales
3. Asegurarse de que pasan lint, build y tests
4. Crear PR hacia `develop`
5. Esperar revision y aprobacion

El CI de GitHub Actions ejecuta lint, build, tipos y tests en cada PR.

## Tests

```bash
npm test               # Tests unitarios e integracion (Vitest, una vez)
npm run test:watch     # Modo watch
npm run test:e2e       # Tests end-to-end (Playwright, requiere servidor activo)
```

## Base de datos

```bash
npm run db:generate  # Regenerar Prisma client tras cambios en schema
npm run db:push      # Sincronizar schema con DB (dev — sin migraciones)
npm run db:migrate   # Crear y aplicar migracion (produccion)
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Insertar usuarios de prueba
```

> En produccion usar siempre `db:migrate` en vez de `db:push`.

## Usuarios de prueba

Tras ejecutar `npm run db:seed`. Contrasena para todos: `guidepath123`.

| Email | Rol |
|-------|-----|
| `cliente@guidepath.com` | CLIENT |
| `elena@guidepath.com` | PROFESSIONAL |
| `carlos@guidepath.com` | PROFESSIONAL |
| `ana.garcia@guidepath.com` | PROFESSIONAL |
| `miguel@guidepath.com` | PROFESSIONAL |
| `laura@guidepath.com` | PROFESSIONAL |
| `pablo@guidepath.com` | PROFESSIONAL |

Ver el bloque completo (especialidades + disponibilidad) en [README.md](README.md).
