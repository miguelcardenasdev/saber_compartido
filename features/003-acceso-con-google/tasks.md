# 003 · Registro e inicio de sesión con Google — Tareas

_Checklist accionable derivada del `plan.md`. Tareas pequeñas y concretas; marca `[x]` al completarlas._

### Google Cloud Console (pendiente antes de tocar código)

- [x] Crear (o seleccionar) el proyecto en Google Cloud Console y habilitar la API necesaria para obtener el ID token — consola de Google Cloud.
- [x] Configurar la pantalla de consentimiento como tipo **External**, con los scopes básicos `openid`, `email` y `profile`, y confirmar en la consola si con esos scopes exige verificación de la app o no — consola de Google Cloud.
- [x] Crear las credenciales OAuth (ID de cliente y secreto) — consola de Google Cloud.
- [x] Registrar la **URI de redirección de desarrollo**: `http://localhost:5173/api/auth/google/callback` (Vite la proxya al backend) — consola de Google Cloud.
- [x] Registrar la **URI de redirección de producción** — consola de Google Cloud.
- [x] Agregar al equipo como usuarios de prueba del modo Testing — consola de Google Cloud.
- [x] Completar `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_REDIRECT_URI` en `backend/.env` (sin commitearlo) — `backend/.env`.
- [x] **Probar pronto con una cuenta institucional real `@amigo.edu.co`** — es el mayor riesgo de la feature: si el administrador del Workspace de la UCLA tiene restringido el acceso de apps de terceros, no se arregla desde el código y conviene descubrirlo ya. Sin esa cuenta no se puede recorrer el camino feliz, porque una cuenta Gmail personal será rechazada por diseño.

### Base de datos (pendiente antes de tocar código)

- [x] Anunciar al equipo que `schema.prisma` va a cambiar (límite duro de `tech-stack.md`) — coordinación del equipo.
- [x] Escribir el script SQL con los dos cambios: `contrasena_hash` pasa a aceptar `NULL` y se agrega `google_sub` (`VARCHAR`, `UNIQUE`, `NULL`) en `usuarios`. Nota: MySQL permite múltiples `NULL` en columnas `UNIQUE`, así que las cuentas sin Google no chocan entre sí — `database/004_google_sub_y_contrasena_nullable.sql`.
- [x] Correr ese script contra la base local y luego `npx prisma db pull`, para que el modelo refleje la base real en vez de editarlo a mano (mismo criterio que en la 001) — `backend/prisma/schema.prisma`.

### Backend

- [x] Anunciar al equipo e instalar la dependencia nueva `google-auth-library` — `backend/package.json`.
- [x] Agregar la configuración de OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`) y hacer que el servidor no arranque si alguna falta. Las tres variables ya están en `.env.template` — `backend/src/config/index.js`.
- [x] Extraer la emisión de la cookie desde el controller a un helper compartido, para que la usen el login por contraseña y el de Google sin duplicar el código. Debe mantener el comportamiento exacto actual (`httpOnly`, `sameSite: "lax"`, `secure` según config, `maxAge` de 7 días, `path: "/"`) — `backend/src/shared/auth/emitir-sesion.js` (nuevo) y `backend/src/modules/auth/auth.controller.js`.
- [x] Agregar al repository: `buscarPorGoogleSub()`, la creación de cuenta desde Google (rol `estudiante`, `emailVerificado` en `true`, sin `tokenVerificacion` ni `tokenExpira`) y la actualización que guarda `googleSub` al vincular — `backend/src/modules/auth/auth.repository.js`.
- [x] Implementar en el service la validación del ID token de Google y las **tres** comprobaciones de dominio, todas en el servidor: `email_verified`, correo terminado en `@amigo.edu.co` y `hd` igual a `amigo.edu.co`. Si alguna falla, `DOMINIO_NO_PERMITIDO` — `backend/src/modules/auth/auth.service.js`.
- [x] Implementar en el service la búsqueda y vinculación: primero por `googleSub`; si no está, por `correoInstitucional`. Si la cuenta existente **no** estaba verificada, borrar además `contrasenaHash`, `tokenVerificacion` y `tokenExpira` (evita que quien registró el correo de otra persona con su propia contraseña conserve el acceso). Si **sí** estaba verificada, conservar la contraseña para poder usar ambos métodos — `backend/src/modules/auth/auth.service.js`.
- [x] Crear un schema Zod mínimo para el callback (presencia y forma del `code` y del `state`), siguiendo el patrón de validación antes del controller — `backend/src/modules/auth/google.schema.js`.
- [x] Implementar `GET /api/auth/google`: generar `state` y verificador PKCE, guardarlos en una cookie **firmada con `jsonwebtoken`**, de 10 minutos y `sameSite: "lax"` (Google devuelve con navegación entre sitios, un `strict` la descartaría), y redirigir a Google incluyendo `hd=amigo.edu.co` en la URL para que el selector ofrezca solo cuentas del dominio — `backend/src/modules/auth/auth.controller.js` y `auth.routes.js`.
- [x] Implementar `GET /api/auth/google/callback`: verificar que el `state` coincida, canjear el código por el ID token, pasar por el service, emitir la sesión con el helper y redirigir al dashboard con la cookie ya puesta — `backend/src/modules/auth/auth.controller.js` y `auth.routes.js`.
- [x] Manejar los errores del callback **redirigiendo** a `/iniciar-sesion?error=<codigo>` en vez de responder JSON (el callback es una navegación del navegador), con los códigos `DOMINIO_NO_PERMITIDO`, `ACCESO_CANCELADO` y `ERROR_GOOGLE` — `backend/src/modules/auth/auth.controller.js`.
- [x] Confirmar que el login por contraseña no necesita cambios: `usuario?.contrasenaHash ?? HASH_RELLENO` ya cubre el `null`, así que una cuenta de Google cae en el mismo 401 genérico sin revelar que usa Google. Solo verificar, no modificar — `backend/src/modules/auth/auth.service.js`.

### Frontend

- [x] Agregar el botón "Continuar con Google" al formulario de registro, con el mismo patrón de estados (`idle/cargando/error`, deshabilitado mientras navega) y los tokens de `tech-stack.md` — `frontend/src/features/auth/formulario-registro.jsx`.
- [x] Agregar el mismo botón al formulario de inicio de sesión — `frontend/src/features/auth/formulario-login.jsx`.
- [x] Hacer que el botón navegue a `GET /api/auth/google` (es una navegación del navegador, no un `fetch`, porque el backend responde con un redirect) — `frontend/src/features/auth/`.
- [x] Leer el parámetro `?error=` de la URL en la pantalla de inicio de sesión y mostrarlo en el aviso general que ya existe (`role="alert"`, `bg-danger/10`), con un mensaje en español por cada código; después limpiar el parámetro de la URL para que no reaparezca al recargar — `frontend/src/features/auth/formulario-login.jsx` o `frontend/src/pages/Login/Login.jsx`.
- [x] Confirmar que el `AuthProvider` no necesita cambios: cuando el backend redirige al dashboard con la cookie puesta, `GET /api/auth/yo` ya devuelve el usuario — `frontend/src/features/auth/auth-context.jsx`.

### Pruebas / validación

- [ ] Con `curl`: una cuenta de Google con correo personal (no `@amigo.edu.co`) es rechazada con `DOMINIO_NO_PERMITIDO` y no se crea sesión.
- [ ] Con `curl` o con la cookie en mano: una cuenta creada por Google no puede iniciar sesión con contraseña y recibe el mismo 401 genérico de credenciales inválidas, sin ninguna pista de que se debe a que usa Google.
- [ ] Vincular una cuenta existente **no verificada**: después de la vinculación, su contraseña ya no funciona y su token de verificación quedó borrado.
- [ ] Vincular una cuenta existente **verificada**: después de la vinculación, su contraseña sigue funcionando y puede entrar por cualquiera de los dos métodos.
- [ ] Confirmar que al vincular no se crea una cuenta duplicada ni se responde "correo ya registrado".
- [ ] En el navegador: el flujo completo con una cuenta `@amigo.edu.co` lleva del botón al selector de Google y de vuelta al dashboard con "Hola, {nombres}"; al recargar `/dashboard` la sesión se mantiene.
- [ ] En el navegador: cancelar el consentimiento de Google vuelve al login con el mensaje correspondiente y sin sesión.
- [ ] En el navegador: un `state` manipulado o vencido vuelve al login con mensaje genérico y sin sesión.
- [ ] Confirmar que la cookie emitida por Google es la misma de la 002: `httpOnly`, de 7 días, invisible para `document.cookie`.
- [ ] Repetir los chequeos de la 002 (login correcto, pass mala y correo inexistente con respuesta idéntica, `/yo` con y sin cookie) para confirmar que `contrasena_hash` nullable no rompió nada.
- [ ] Repetir los chequeos de la 001 (registro 201, 409, 400 y enlace de verificación) para confirmar que no hubo regresión.
- [ ] Verificar que la pantalla con el botón de Google sea usable en móvil y mantenga la identidad visual del registro.
- [ ] Correr `npm run lint` (`oxlint`) en frontend sin errores.

### Cierre

- [ ] Actualizar `tech-stack.md` con el flujo OAuth (Authorization Code + PKCE), las variables `GOOGLE_*`, la dependencia `google-auth-library`, las columnas `google_sub` y `contrasena_hash` nullable, y la nota de que un login fallido de Google se devuelve por redirect y no por JSON.
- [ ] Publicar la pantalla de consentimiento en Google Cloud (salir del modo Testing) **antes de la demo**, para que pueda entrar cualquier estudiante y no solo el equipo de prueba.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
- [ ] Agregar al Backlog/ideas del roadmap lo que el spec dejó fuera: otros proveedores de identidad, desvincular Google desde la cuenta, y gestión de la restricción de apps de terceros del Workspace.

## Mantenimiento (checklist recurrente)

- [ ] Si se rotan las credenciales OAuth en Google Cloud, actualizar `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` en cada entorno; un secreto viejo hace fallar el callback con `ERROR_GOOGLE`.
- [ ] Si se agrega un segundo proveedor de identidad, reconsiderar si `google_sub` en `usuarios` sigue siendo suficiente o toca migrar a una tabla de identidades externas.
- [ ] Si la universidad cambia su dominio, actualizar la validación del correo **y** la del `hd` (están en dos lugares distintos en esta feature).
- [ ] Vigilar los cambios de la política de apps de terceros del Workspace de la UCLA: una restricción del administrador corta el acceso sin aviso ni error de código.
