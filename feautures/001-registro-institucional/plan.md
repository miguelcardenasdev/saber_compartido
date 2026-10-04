# 001 · Registro con correo institucional — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

<Estrategia general en pocas frases: qué aproximación se toma y por qué encaja con el stack y los principios del proyecto.>

## Implementación

_Pasos técnicos concretos, en orden. Indica los archivos/módulos que se tocan._

1. <Paso — archivo/módulo afectado.>
2. <Paso — archivo/módulo afectado.>
3. <Paso — archivo/módulo afectado.>

## Decisiones

_Elecciones de diseño relevantes y su justificación. Alternativas descartadas y por qué._

- **<Decisión>** — <por qué; qué se descartó>.
- **<Decisión>** — <por qué; qué se descartó>.

## Riesgos

_Qué puede salir mal o requerir cuidado, y cómo se mitiga._

- **<Riesgo>** — <mitigación>.


# 001 · Registro con correo institucional — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

Módulo `auth` dentro del monolito, con la estructura de capas ya definida en tech-stack.md (`routes → controller → service → repository`). La validación de entrada va con Zod antes de llegar al controller. Como las tablas ya existen en la base de datos (las creaste directo con el script de Workbench, no con Prisma), el primer paso no es escribir el `schema.prisma` a mano — es *introspectar* la base ya creada para que Prisma genere el modelo a partir de las tablas reales, evitando mantener dos definiciones del mismo esquema por separado.

## Implementación

1. Levantar MySQL local vía `docker-compose up` y correr ahí el script de Workbench (`usuarios`, `materias`, etc.) — `docker-compose.yml`.
2. `npx prisma db pull` contra esa base para generar `schema.prisma` a partir de las tablas reales — `backend/prisma/schema.prisma`.
3. Agregar `@map("nombre_columna")` a los campos introspectados para exponerlos en camelCase en el código (`correoInstitucional`, `contrasenaHash`), siguiendo la convención de nombres ya definida, sin renombrar las columnas reales de la tabla — `backend/prisma/schema.prisma`.
4. Crear `registro.schema.js` con Zod: `correo` (formato email + termina en `@amigo.edu.co`), `contrasena` (política completa: 8+, mayúscula, minúscula, número, carácter especial, sin nombre/apellido), `nombres`, `apellidos` — `backend/src/modules/auth/registro.schema.js`.
5. Implementar `auth.repository.js`: `crearUsuario()`, `buscarPorCorreo()` — `backend/src/modules/auth/auth.repository.js`.
6. Implementar `auth.service.js`: hash con bcrypt, verificar duplicado, generar token de verificación, orquestar el envío del correo — `backend/src/modules/auth/auth.service.js`.
7. Integrar el proveedor de correo elegido (pendiente de decidir — ver Decisiones) para el envío del correo de verificación — `backend/src/shared/email/`.
8. Implementar `auth.controller.js` y `auth.routes.js`: `POST /api/auth/registro`, `GET /api/auth/verificar/:token` — `backend/src/modules/auth/`.
9. Middleware de errores para traducir los casos de negocio (correo no institucional, duplicado, contraseña inválida) a respuestas 400 consistentes — `backend/src/shared/middlewares/errorHandler.js`.
10. Formulario de registro en React (nombres, apellidos, correo, contraseña), con validación en cliente y los tokens de `tech-stack.md` — `frontend/src/features/auth/`.

## Decisiones

- **Introspectar la base con `prisma db pull` en vez de generar migraciones desde cero** — la base ya fue creada con el script de Workbench; usar `prisma migrate dev` ahora generaría una migración paralela que no coincide con lo que realmente existe. Se descarta migrar "a la Prisma" desde el inicio para no reescribir lo que ya está construido y probado en Workbench.
- **Mapear columnas snake_case a campos camelCase en Prisma (`@map`)** — mantiene las convenciones de nombres de tech-stack.md en el código sin tocar el esquema SQL ya definido.
- **Proveedor de envío de correo: pendiente** — no está decidido todavía (Resend vs. Nodemailer+SMTP). Se resuelve en esta feature porque el criterio de aceptación de `spec.md` depende de que el correo de verificación se envíe; una vez decidido, documentarlo en `tech-stack.md`.

## Riesgos

- **`prisma db pull` puede nombrar relaciones de forma distinta a como las pensarías manualmente** (p. ej. nombres de relación ambiguos si hay más de un FK entre dos tablas) — mitigación: revisar el `schema.prisma` generado antes de usarlo, y renombrar relaciones ahí si hace falta, sin tocar las tablas reales.
- **Envío de correo real desde un entorno de desarrollo compartido entre 3 personas** puede generar confusión si varios registran el mismo correo de prueba — mitigación: usar un servicio con modo sandbox/test (muchos proveedores lo ofrecen gratis) mientras se construye, antes de pasar a producción.
- **Política de contraseña "no debe incluir nombre ni apellido" depende de que el formulario pida ambos campos** (ya corregido en `spec.md`) — si en algún punto se simplifica el formulario, este criterio queda roto sin que nadie lo note hasta QA.