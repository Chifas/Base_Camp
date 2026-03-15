# GuidePath — Roadmap de Mejoras

## Fase 1: Estabilidad y Calidad (Bugs + UX inmediata)

### 1.1 Correcciones pendientes
- [x] **Permisos de cámara en videollamada**: Headers `Permissions-Policy` añadidos en `next.config.mjs` para Daily.co iframe
- [x] **Botones Aceptar/Rechazar sesiones**: Conectados al endpoint `PATCH /api/sessions/[id]`
- [x] **Botón Iniciar sesión (videollamada)**: Conectado a la ruta `/session/[id]`
- [x] **Botones CTA visibles en ambos modos**: Corregido contraste en hero y CTA para light/dark mode
- [x] **Validación de disponibilidad**: Permitir strings vacíos en slots deshabilitados
- [x] **Protección de rutas completa**: Validación de roles en PATCH sessions (solo profesional confirma/completa) + transiciones de estado válidas (PENDING→CONFIRMED→COMPLETED, no reversibles)
- [x] **Manejo de errores global**: `error.tsx` específicos para dashboard, booking, session y explore con mensajes descriptivos
- [x] **Loading states**: `loading.tsx` con skeletons en dashboard, explore, booking, session, perfil profesional, login y registro

### 1.2 Validaciones de formulario
- [x] **Zod en formularios cliente**: Validación con schemas Zod en registro y onboarding profesional
- [x] **Feedback de errores inline**: Errores por campo con borde rojo y mensaje debajo, se limpian al editar
- [x] **Validación de horarios**: Impide guardar disponibilidad si `endTime` <= `startTime`, con mensaje de error indicando el día

### 1.3 Tests
- [x] **Ampliar cobertura de tests unitarios**: 44 tests pasando — availability (GET/PUT), sessions PATCH (roles + transiciones), reviews, register, professionals, utils, env
- [ ] **Tests de integración**: Flujo completo de booking (crear intent → webhook → confirmar)
- [ ] **Tests de componentes**: Dashboard, formularios de perfil, sistema de reviews
- [ ] **E2E con Playwright**: Flujo de registro → onboarding → booking → videollamada → review

---

## Fase 2: Funcionalidades Core Pendientes

### 2.1 Stripe Connect (pagos a profesionales)
- [ ] **Flujo completo de onboarding Stripe Connect**: El endpoint existe pero no está integrado en el dashboard
- [ ] **Transferencias automáticas**: Al completar sesión, transferir al profesional su parte
- [ ] **Comisión de plataforma**: Definir % de comisión y aplicarlo en cada pago
- [ ] **Panel de pagos**: Historial de transferencias, estado de cuenta, próximos pagos

### 2.2 Sistema de notificaciones
- [ ] **Emails transaccionales mejorados**: Templates HTML profesionales con branding GuidePath
- [ ] **Recordatorio pre-sesión**: Email/notificación 24h y 1h antes de la sesión
- [ ] **Notificación de nueva review**: Email al profesional cuando recibe una valoración
- [ ] **Notificaciones in-app**: Centro de notificaciones en el navbar con badge de no leídas

### 2.3 Gestión de sesiones avanzada
- [ ] **Reprogramar sesión**: Permitir cambiar fecha/hora de una sesión confirmada
- [ ] **Política de cancelación**: Cancelación gratuita hasta 24h antes, cargo parcial después
- [ ] **Notas de sesión**: El profesional puede añadir notas privadas post-sesión
- [ ] **Historial de sesiones completo**: Filtros por fecha, estado, profesional/cliente

---

## Fase 3: Experiencia de Usuario

### 3.1 Perfil de usuario
- [ ] **Foto de perfil**: Upload de imagen con crop y preview (usar Supabase Storage o Cloudinary)
- [ ] **Perfil público del profesional**: Página SEO-friendly con schema.org markup
- [ ] **Verificación de profesionales**: Badge de verificado, proceso de validación de credenciales
- [ ] **Certificaciones y experiencia**: Sección para añadir títulos, años de experiencia, especialidades

### 3.2 Búsqueda y descubrimiento
- [ ] **Filtros avanzados en Explorar**: Rango de precio, idioma, disponibilidad inmediata, rating mínimo
- [ ] **Ordenación por relevancia**: Algoritmo que combine rating, reviews, disponibilidad y precio
- [ ] **Profesionales destacados**: Sección rotativa en landing basada en métricas reales
- [ ] **Búsqueda por texto**: Full-text search en nombre, headline y bio del profesional
- [ ] **Paginación o scroll infinito**: Actualmente carga todos los profesionales de golpe

### 3.3 Sistema de reviews mejorado
- [ ] **Respuesta del profesional**: El profesional puede responder a una review
- [ ] **Reviews con categorías**: Puntualidad, conocimiento, comunicación, valor por dinero
- [ ] **Reportar review**: Sistema de moderación para reviews inapropiadas

### 3.4 UI/UX
- [ ] **Animaciones de transición entre páginas**: Page transitions con Framer Motion
- [ ] **Skeleton loaders personalizados**: Skeletons que reflejen el layout real de cada página
- [ ] **Toast notifications**: Reemplazar mensajes de estado por toasts (sonner o react-hot-toast)
- [ ] **Modo offline**: Service worker para PWA básica con cache de recursos estáticos
- [ ] **Responsive refinado**: Revisar y pulir todos los breakpoints en mobile

---

## Fase 4: Funcionalidades Avanzadas

### 4.1 Chat y mensajería
- [ ] **Chat en tiempo real**: Mensajería entre cliente y profesional pre/post sesión
- [ ] **WebSockets o Supabase Realtime**: Para mensajes instantáneos
- [ ] **Archivos adjuntos**: Compartir documentos/CV en el chat
- [ ] **Historial de conversaciones**: Persistencia y búsqueda de mensajes

### 4.2 Calendario y disponibilidad avanzada
- [ ] **Integración con Google Calendar**: Sincronizar disponibilidad automáticamente
- [ ] **Bloqueo de fechas específicas**: Vacaciones, días festivos, ausencias puntuales
- [ ] **Zonas horarias**: Soporte multi-timezone para clientes internacionales
- [ ] **Slots de duración variable**: Sesiones de 30, 45, 60, 90 min con precios diferentes
- [ ] **Vista calendario visual**: Calendario interactivo tipo Google Calendar en el dashboard

### 4.3 Paquetes y suscripciones
- [ ] **Paquetes de sesiones**: Ej: "5 sesiones por 200€" con descuento
- [ ] **Suscripción mensual**: Plan recurrente con X sesiones/mes
- [ ] **Cupones y descuentos**: Sistema de códigos promocionales
- [ ] **Primera sesión gratuita**: Opción para profesionales de ofrecer sesión de prueba

### 4.4 Videollamada mejorada
- [ ] **Grabación de sesiones**: Opción de grabar (con consentimiento) para revisión posterior
- [ ] **Pizarra compartida**: Herramienta de dibujo/notas en tiempo real
- [ ] **Compartir pantalla**: Habilitar screen sharing en Daily.co
- [ ] **Chat en videollamada**: Mensajes durante la sesión

---

## Fase 5: Crecimiento y Escalabilidad

### 5.1 SEO y Marketing
- [ ] **Blog integrado**: CMS simple para artículos sobre desarrollo profesional
- [ ] **Landing pages por categoría**: `/coach`, `/psicologo`, `/mentor` con SEO específico
- [ ] **Schema.org markup**: Structured data para profesionales (Person, Service, Review)
- [ ] **Sitemap dinámico**: Incluir perfiles de profesionales verificados
- [ ] **Open Graph mejorado**: Imágenes dinámicas para compartir en redes sociales

### 5.2 Panel de administración
- [ ] **Dashboard admin**: Métricas de plataforma (usuarios, sesiones, ingresos, reviews)
- [ ] **Gestión de usuarios**: Buscar, suspender, verificar profesionales
- [ ] **Moderación de reviews**: Aprobar/rechazar reviews reportadas
- [ ] **Configuración de plataforma**: Comisiones, categorías, emails

### 5.3 Analytics y métricas
- [ ] **Dashboard de métricas para profesionales**: Tasa de conversión, rating evolution, earnings chart
- [ ] **Tracking de eventos**: Funnel de conversión (visita → perfil → booking → completada)
- [ ] **A/B testing**: Framework para probar cambios en UI

### 5.4 Internacionalización
- [ ] **i18n con next-intl**: Soporte multi-idioma (ES, EN, PT)
- [ ] **Moneda local**: Precios en EUR, USD, GBP según ubicación
- [ ] **Contenido localizado**: Categorías y UI traducidas

### 5.5 Infraestructura
- [ ] **Rate limiting**: Proteger APIs de abuso (ej: upstash/ratelimit)
- [ ] **Caché con Redis**: Cachear listados de profesionales, categorías
- [ ] **CDN para imágenes**: Optimización automática con next/image + Cloudinary
- [ ] **Monitoring**: Sentry para error tracking, Vercel Analytics para performance
- [ ] **CI/CD mejorado**: Tests obligatorios en PR, deploy preview por branch
- [ ] **Base de datos**: Índices optimizados, queries N+1 audit, connection pooling

---

## Prioridad Recomendada

| Prioridad | Fase | Razón |
|-----------|------|-------|
| Alta | Fase 1 | Sin estabilidad no hay producto viable |
| Alta | Fase 2.1 | Sin pagos a profesionales no hay marketplace |
| Media | Fase 2.2-2.3 | Mejoran retención de usuarios |
| Media | Fase 3 | Diferenciación y experiencia premium |
| Baja | Fase 4 | Features avanzados para escalar |
| Baja | Fase 5 | Crecimiento a largo plazo |

---

*Última actualización: Marzo 2026*
