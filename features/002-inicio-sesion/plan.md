# 002 · Inicio de sesión — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

Se extiende el módulo `auth` existente con `POST /api/auth/login`, siguiendo las mismas capas de la 001 (`routes → controller → service → repository`) y la validación con Zod antes del controller. El service compara la contraseña con `bcrypt.compare` y, solo si coincide, revisa que el correo esté verificado; si todo es correcto, firma un JWT de 7 días que el controller entrega en una cookie `httpOnly`.

La sesión se recupera con `GET /api/auth/yo`, protegido por un middleware que valida la cookie. El frontend no puede leer la cookie, así que pregunta a ese endpoint quién es el usuario y guarda la respuesta en un contexto de React que alimenta una ruta protegida. No hay columnas nuevas ni scripts SQL: el login solo lee campos que `usuarios` ya tiene.

## Implementación

1. Anunciar al equipo e instalar las dependencias nuevas `jsonwebtoken` y `cookie-parser` — `backend/package.json`.
2. Agregar la configuración de sesión (`JWT_SECRET`, duración de 7 días, opciones de la cookie) y hacer que el servidor no arranque si el secreto falta o tiene menos de 32 caracteres; documentar la variable en `.env.example` — `backend/src/config/index.js`.
3. Mover `errorNegocio` a un archivo compartido para que lo usen el service y el middleware de sesión — `backend/src/shared/errores/error-negocio.js`.
4. Crear el schema de login (formato de correo y contraseña no vacía, sin la política de contraseña) — `backend/src/modules/auth/login.schema.js`.
5. Agregar `iniciarSesion` y `obtenerSesion` al service, con `buscarPorId` en el repository. El orden es: buscar usuario → `bcrypt.compare` (contra un hash de relleno si el correo no existe) → `CREDENCIALES_INVALIDAS` (401) → `CORREO_NO_VERIFICADO` (403) → firmar JWT — `backend/src/modules/auth/auth.service.js` y `auth.repository.js`.
6. Crear el middleware `requerirSesion`, que verifica el JWT de la cookie (solo `HS256`) y responde `SESION_INVALIDA` (401) si falta, es inválido o venció — `backend/src/shared/middlewares/requerir-sesion.js`.
7. Agregar `POST /login` (con `validar`) y `GET /yo` (con `requerirSesion`), escribir la cookie en el controller y montar `cookieParser()` en la app — `backend/src/modules/auth/auth.controller.js`, `auth.routes.js` y `backend/src/app.js`.
8. Crear en el frontend la copia del schema de login, los wrappers `fetch` (`/api/auth/login` y `/api/auth/yo`), el `AuthContext` y la `RutaProtegida` — `frontend/src/features/auth/`.
9. Extraer el componente `Campo` y el layout split de la pantalla de registro a piezas compartidas, y construir el formulario y la pantalla de inicio de sesión con el mismo patrón de a11y y estados de la 001 — `frontend/src/features/auth/` y `frontend/src/pages/Login/`.
10. Crear el dashboard mínimo, registrar `/iniciar-sesion` y `/dashboard` (protegida) en el router, y apuntar el enlace "Inicia sesión" del registro a la nueva ruta — `frontend/src/pages/Dashboard/`, `frontend/src/App.jsx` y `formulario-registro.jsx`.

## Decisiones

- **JWT en cookie `httpOnly`** — JavaScript no puede leerla, así que un XSS no puede robar el token, y como el proxy de Vite mantiene todo en el mismo origen no hace falta CORS. Se descartó `localStorage` (expuesto a XSS) y la sesión en base de datos (exigiría tabla nueva, script SQL y `db pull`, sin beneficio real para el MVP).
- **El token solo lleva el id del usuario** — `/api/auth/yo` lee los datos frescos de la base, así que cuando un estudiante pase a `tutor` el cambio se refleja sin volver a iniciar sesión.
- **Schema de login propio en vez de reutilizar el de registro** — el de registro aplica la política de contraseña y el cruce con nombres; reutilizarlo le revelaría la política a un atacante y bloquearía el acceso si la regla cambia.
- **Contraseña antes que verificación, y hash de relleno si el correo no existe** — si se revisara la verificación primero, `CORREO_NO_VERIFICADO` confirmaría que un correo tiene cuenta sin conocer la contraseña; el hash de relleno evita que el tiempo de respuesta delate cuál dato falló.
- **`errorNegocio` pasa a `shared/`** — un middleware compartido no debe depender de un módulo de negocio; se descartó duplicarlo.

## Riesgos

- **`JWT_SECRET` débil, ausente o subido al repo** permite fabricar sesiones — mitigación: el servidor se niega a arrancar sin un secreto de al menos 32 caracteres, `.env` sigue ignorado y `.env.example` solo trae un placeholder.
- **Un JWT stateless no se puede revocar y la cookie abre la puerta a CSRF** — mitigación: `httpOnly`, `secure` en producción, `sameSite: "lax"` y vigencia acotada a 7 días; los endpoints futuros que cambien datos deben ser `POST`/`PUT`/`DELETE`. Cerrar sesión y revocar quedan en el backlog.
- **En producción la cookie solo viaja si frontend y backend comparten origen** — mitigación: confirmarlo al desplegar en Railway; si quedaran en dominios distintos habría que revisar `sameSite` y CORS.
- **Los pasos 3, 9 y 10 modifican código ya validado en la 001** (`errorNegocio`, `Campo`, el enlace del registro) — mitigación: repetir los chequeos de registro (201, 400, 409) y revisar la pantalla en navegador antes de cerrar la feature.