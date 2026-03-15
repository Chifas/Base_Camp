# Contribuir a GuidePath

## Requisitos previos

- Node.js >= 18.17
- npm >= 9
- PostgreSQL (Supabase)

## Configurar entorno local

```bash
# Clonar el repositorio
git clone https://github.com/Chifas/Base_Camp.git
cd Base_Camp

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Rellenar .env con claves reales

# Generar Prisma client y sincronizar schema
npm run db:generate
npm run db:push

# Seed de datos de prueba
npm run db:seed

# Iniciar servidor de desarrollo
npm run dev
```

## Ramas

| Rama | Uso |
|------|-----|
| `main` | Estable, solo merges desde Develop |
| `Develop` | Desarrollo activo |
| `feature/*` | Nuevas funcionalidades |
| `fix/*` | Correcciones de bugs |

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

1. Crear rama desde `Develop`
2. Hacer cambios con commits convencionales
3. Asegurarse de que pasan lint, build y tests
4. Crear PR hacia `Develop`
5. Esperar revision y aprobacion

## Tests

```bash
npm test          # Ejecutar una vez
npm run test:watch  # Modo watch
```

## Base de datos

```bash
npm run db:generate  # Regenerar Prisma client
npm run db:push      # Sincronizar schema (dev)
npm run db:migrate   # Crear migracion (produccion)
npm run db:studio    # Abrir Prisma Studio
```
