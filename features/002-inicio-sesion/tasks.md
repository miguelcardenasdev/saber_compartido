# 002 · Inicio de sesión — Tareas

_Checklist accionable derivada del `plan.md`. Tareas pequeñas y concretas; marca `[x]` al completarlas._

### Backend

- [x] Anunciar al equipo e instalar las dependencias nuevas `jsonwebtoken` y `cookie-parser` — `backend/package.json`.
- [x] Agregar la configuración de sesión: `JWT_SECRET`, duración de 7 días, nombre de la cookie y bandera `secure` (activa solo con `NODE_ENV=production`). Si `JWT_SECRET` falta o tiene menos de 32 caracteres, el servidor no arranca — `backend/src/config/index.js`.
- [x] Documentar `JWT_SECRET` con un placeholder en `.env.example` y generar un secreto local en `backend/.env` con `node -p "crypto.randomBytes(48).toString('hex')"` (sin commitearlo) — `backend/.env.template`.
- [x] Mover `errorNegocio` a un archivo compartido y hacer que `auth.service.js` lo importe de ahí — `backend/src/shared/errores/error-negocio.js`.
- [x] Crear `login.schema.js` con Zod 4: `correo` (string, trim, formato email) y `contrasena` (string no vacía), con mensajes en español y sin la política de contraseña — `backend/src/modules/auth/login.schema.js`.
- [x] Agregar `buscarPorId()` y confirmar que `buscarPorCorreo()` devuelve `contrasenaHash`, `emailVerificado`, `nombres`, `apellidos` y `rol` — `backend/src/modules/auth/auth.repository.js`.
- [x] Implementar `iniciarSesion({ correo, contrasena })` en el service: buscar usuario → `bcrypt.compare` (contra un hash de relleno si el correo no existe) → `CREDENCIALES_INVALIDAS` (401, "Correo o contraseña incorrectos") → `CORREO_NO_VERIFICADO` (403) → firmar JWT de 7 días con el id en `sub`. Devuelve `{ token, usuario: { id, nombres, apellidos, correo, rol } }`, sin hash ni campos de verificación — `backend/src/modules/auth/auth.service.js`.
- [x] Implementar `obtenerSesion(usuarioId)` en el service: busca al usuario y lanza `SESION_INVALIDA` (401) si ya no existe — `backend/src/modules/auth/auth.service.js`.
- [x] Crear el middleware `requerirSesion`: lee la cookie, verifica el JWT restringido a `HS256`, deja el id en `req.usuarioId` y responde `SESION_INVALIDA` (401) si falta, es inválido o venció — `backend/src/shared/middlewares/requerir-sesion.js`.
- [x] Agregar `iniciarSesion` al controller: llama al service, escribe la cookie (`httpOnly`, `sameSite: "lax"`, `secure` según config, `maxAge` de 7 días, `path: "/"`) y responde `200 { usuario }`. Agregar `obtenerSesion`, que responde `200 { usuario }` — `backend/src/modules/auth/auth.controller.js`.
- [x] Registrar `POST /login` con `validar(esquemaLogin)` y `GET /yo` con `requerirSesion` — `backend/src/modules/auth/auth.routes.js`.
- [x] Montar `cookieParser()` después de `express.json()` y antes de las rutas — `backend/src/app.js`.
- [x] Confirmar que `errorHandler` responde `{ codigo, mensaje }` con los códigos nuevos (`CREDENCIALES_INVALIDAS`, `CORREO_NO_VERIFICADO`, `SESION_INVALIDA`) sin necesidad de cambios — `backend/src/shared/middlewares/errorHandler.js`.

### Frontend

- [x] Hacer commit de lo que haya antes de empezar, para poder volver atrás si la extracción rompe algo.
- [x] Extraer el componente `Campo` de `formulario-registro.jsx` a una pieza compartida, sin cambiar su comportamiento — `frontend/src/features/auth/campo.jsx`.
- [x] Extraer el layout split (panel de marca `bg-primary-dark` y formulario) de `Registro.jsx` a un componente compartido — `frontend/src/components/layout-auth.jsx`.
- [x] Crear la copia del schema de login para validar en el cliente, con los mismos mensajes que el backend — `frontend/src/features/auth/login.schema.js`.
- [x] Crear los wrappers `fetch` `iniciarSesion(datos)` (`POST /api/auth/login`) y `obtenerSesion()` (`GET /api/auth/yo`), que devuelven datos o lanzan `{ codigo, mensaje, detalle }` como los de la 001 — `frontend/src/features/auth/api-login.js` y `api-sesion.js`.
- [x] Crear `AuthContext` y `AuthProvider`: al montar llama a `obtenerSesion` (un 401 deja `usuario` en `null`, no es un error) y expone `usuario`, `cargando` y una función para fijar el usuario tras el login — `frontend/src/features/auth/auth-context.jsx`.
- [x] Crear `RutaProtegida`: mientras `cargando` muestra un estado accesible (`role="status"`); sin usuario redirige a `/iniciar-sesion` con `replace`; con usuario renderiza `<Outlet />` — `frontend/src/features/auth/ruta-protegida.jsx`.
- [x] Crear el formulario de login con el patrón de la 001 (`noValidate`, `role="alert"`, `aria-invalid`, validación al salir del campo y al corregir, estados `idle/cargando/error`, botón deshabilitado mientras envía). Los errores de campo van bajo cada input; `CREDENCIALES_INVALIDAS` y `CORREO_NO_VERIFICADO` se muestran en un aviso general. Al tener éxito fija el usuario y navega a `/dashboard` con `replace` — `frontend/src/features/auth/formulario-login.jsx`.
- [x] Crear la pantalla de inicio de sesión con el layout compartido y un enlace de regreso al registro — `frontend/src/pages/Login/Login.jsx`.
- [x] Crear el dashboard mínimo que muestra "Hola, {nombres}" — `frontend/src/pages/Dashboard/Dashboard.jsx`.
- [x] Envolver las rutas en `AuthProvider` y registrar `/iniciar-sesion` y `/dashboard` (esta dentro de `RutaProtegida`) — `frontend/src/App.jsx`.
- [x] Cambiar el `href="#"` de "Inicia sesión" por un `Link` a `/iniciar-sesion` — `frontend/src/features/auth/formulario-registro.jsx`.
- [x] Verificar que la pantalla de login sea usable en móvil (mobile-first) y mantenga los tokens, tipografías y layout del registro.

### Pruebas / validación

- [ ] Con `curl`: login con credenciales correctas y cuenta verificada responde 200, trae `Set-Cookie` con `HttpOnly` y el cuerpo no incluye contraseña ni hash.
- [ ] Con `curl`: contraseña incorrecta y correo inexistente responden 401 con el mismo cuerpo exacto.
- [ ] Con `curl`: cuenta no verificada con credenciales correctas responde 403 `CORREO_NO_VERIFICADO` y no entrega cookie; con contraseña incorrecta responde 401 `CREDENCIALES_INVALIDAS`.
- [ ] Con `curl`: correo con formato inválido o campos vacíos responden 400 con `detalle` por campo.
- [ ] Con `curl`: `GET /api/auth/yo` responde 200 con cookie válida, y 401 sin cookie, con cookie manipulada y con un token ya vencido (firmado con el secreto y `exp` en el pasado).
- [ ] En el navegador: `/dashboard` sin sesión redirige al login; tras iniciar sesión se ve "Hola, {nombres}"; al recargar se mantiene la sesión.
- [ ] En el navegador: la cookie aparece como `HttpOnly` en DevTools y `document.cookie` no la devuelve.
- [ ] En el navegador: los tres casos de error (credenciales inválidas, correo no verificado, campos inválidos) muestran el mensaje correcto, y el enlace entre registro y login funciona en ambos sentidos.
- [ ] Repetir los chequeos de la 001 (registro 201, 400, 409 y enlace de verificación) para confirmar que no hubo regresión.
- [ ] Correr `npm run lint` (`oxlint`) en backend y frontend sin errores.

### Cierre

- [ ] Actualizar `tech-stack.md` con la sesión por JWT en cookie `httpOnly`, la variable `JWT_SECRET`, las dependencias nuevas y la corrección de que el lint es `oxlint`.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.
- [ ] Agregar al Backlog/ideas del roadmap lo que el spec dejó fuera: reenvío del correo de verificación, recuperación de contraseña, límite de intentos y cerrar sesión.

## Mantenimiento (checklist recurrente)

- [ ] Si se rota `JWT_SECRET`, tener en cuenta que todas las sesiones activas se invalidan y los usuarios deben iniciar sesión de nuevo.
- [ ] Al agregar endpoints que cambien datos, usar `POST`/`PUT`/`DELETE` y nunca `GET`, porque la protección contra CSRF depende de `sameSite: "lax"`.
- [ ] Al desplegar en Railway, confirmar que frontend y backend comparten origen y que `NODE_ENV=production` deja la cookie en `secure`.
- [ ] Revisar si conviene resolver la enumeración de cuentas (el registro responde `409 CORREO_DUPLICADO`) cuando se aborde el límite de intentos.