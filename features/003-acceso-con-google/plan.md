# 003 · Registro e inicio de sesión con Google — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

Se extiende el módulo `auth` existente con dos rutas: la que arranca el flujo y la que recibe el regreso de Google. El backend hace el intercambio completo de **Authorization Code con PKCE** usando `google-auth-library`, y reutiliza sin tocar la máquina de sesión de la 002: quien valida la cookie (`requerir-sesion.js`) no sabe ni necesita saber cómo se emitió, así que basta con firmar el mismo JWT de 7 días con el mismo payload y escribir la misma cookie `httpOnly`.

El frontend no cambia de arquitectura. El `AuthProvider` ya pregunta a `GET /api/auth/yo` al montar, así que cuando el backend redirige al dashboard con la cookie puesta, React reconoce la sesión sin ninguna coordinación extra. Lo único nuevo en el frontend es el botón en las dos pantallas y la lectura del parámetro `?error=` que el backend agrega al volver.

Hay dos cambios de esquema, ambos mínimos: `contrasena_hash` pasa a aceptar `NULL` (una cuenta de Google no tiene contraseña) y se agrega `google_sub`, única y nullable, para poder vincular de forma estable. No se crea una tabla de identidades externas: con un solo proveedor sería complejidad sin beneficio.

## Implementación

1. Avisar al equipo e instalar la dependencia nueva `google-auth-library` — `backend/package.json`. (El límite duro de `tech-stack.md` exige anunciarla antes.)
2. Escribir el script SQL con las dos alteraciones y correrlo; luego `npx prisma db pull` para que el modelo refleje la base real — `database/004_google_sub_y_contrasena_nullable.sql` y `backend/prisma/schema.prisma`.
3. Agregar la configuración de OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`) y hacer que el servidor no arranque si faltan — `backend/src/config/index.js` (las tres variables ya están en `backend/.env.template`).
4. Extraer la emisión de la cookie desde el controller a un helper compartido, para que la usen el login por contraseña y el de Google sin duplicar el código — `backend/src/shared/auth/emitir-sesion.js` (nuevo) y `backend/src/modules/auth/auth.controller.js`.
5. Agregar al repository la búsqueda por `google_sub`, la creación de cuenta desde Google (rol estudiante, `emailVerificado` en `true`, sin token de verificación) y la vinculación sobre una cuenta existente — `backend/src/modules/auth/auth.repository.js`.
6. Implementar el service de Google: validar el ID token, exigir `email_verified`, correo terminado en `@amigo.edu.co` y `hd` igual a `amigo.edu.co`; luego buscar por `google_sub`, y si no existe por correo para vincular — `backend/src/modules/auth/auth.service.js`.
7. Implementar el controller y las rutas `GET /api/auth/google` (genera `state` + verificador PKCE, los guarda en una cookie firmada de 10 minutos y redirige a Google) y `GET /api/auth/google/callback` (canjea el código, valida y redirige al dashboard con la cookie puesta) — `backend/src/modules/auth/auth.controller.js` y `auth.routes.js`.
8. Manejar los errores del callback redirigiendo a `/iniciar-sesion?error=<codigo>` en vez de responder JSON, porque el callback es una navegación del navegador — `auth.controller.js`.
9. Verificar que el login por contraseña sigue rechazando igual a una cuenta de Google: `usuario?.contrasenaHash ?? HASH_RELLENO` ya cubre el `null`, así que no debe requerir cambios, solo comprobación — `backend/src/modules/auth/auth.service.js`.
10. Agregar el botón "Continuar con Google" a las dos pantallas, dentro del layout compartido, y leer el parámetro `?error=` para mostrarlo en el aviso general que ya existe — `frontend/src/features/auth/` y `frontend/src/pages/{Registro,Login}/`.

## Decisiones

- **Authorization Code con PKCE vía `google-auth-library`** — es el flujo recomendado para una app con backend propio. Se descartó `openid-client` (trae mucha superficie para un solo proveedor) y hacerlo a mano (riesgo innecesario con tokens e intercambios de por medio).
- **`state` y verificador PKCE en una cookie firmada de 10 minutos con `jsonwebtoken`** — `jsonwebtoken` ya está instalado, así que no suma dependencia. La cookie va con `sameSite: "lax"` porque Google devuelve al usuario mediante una navegación entre sitios y un `strict` la descartaría; es corta y firmada, así que no sirve de nada manipularla desde el cliente.
- **Tres comprobaciones de dominio en el servidor, no una** — se exige `email_verified`, que el correo termine en `@amigo.edu.co` **y** que `hd` sea `amigo.edu.co`. El `hd` solo no basta (puede faltar o ser engañoso), pero como condición *extra* garantiza que la cuenta la administra el Workspace de la universidad y no es un correo suelto con ese dominio en el texto. El mismo `hd` se envía en la URL de autorización para que el selector de Google ofrezca solo cuentas del dominio, pero eso es comodidad, no seguridad.
- **Una columna `google_sub` en `usuarios`, no una tabla `identidades_externas`** — con un solo proveedor la tabla sería complejidad sin beneficio, y va en línea con el principio "Simplicidad sobre complejidad" de mission.md. Si algún día entra un segundo proveedor, esa tabla se puede crear entonces migrando los datos.
- **Vincular por correo cuando aún no hay `google_sub`, y borrar la contraseña si la cuenta no estaba verificada** — sin este último paso, alguien que hubiera registrado el correo de otra persona con una contraseña propia conservaría el acceso después de la vinculación. Si la cuenta sí estaba verificada, se conserva la contraseña y el estudiante puede entrar por cualquiera de los dos caminos.
- **Las cuentas nuevas nacen verificadas y sin token de verificación** — Google ya verificó el correo; hacerlo pasar por el flujo de la 001 sería fricción que no aporta nada.
- **Los errores del callback se devuelven por redirect con `?error=` y no como JSON** — el callback es una navegación del navegador, no una llamada `fetch`. El frontend ya tiene el aviso general del login, así que solo hay que poblarlo y limpiar el parámetro de la URL.
- **Pantalla de consentimiento de tipo External, en modo Testing** — el proyecto no pertenece al Workspace de la universidad. Con solo los scopes básicos (`openid`, `email`, `profile`) Google no debería exigir verificación de la app, pero hay que confirmarlo en la consola; se publica antes de la demo para que pueda entrar cualquier estudiante.

## Riesgos

- **El administrador del Workspace de la UCLA podría tener restringido el acceso de apps de terceros** — no se arregla desde el código. Mitigación: probar pronto con una cuenta institucional real; sin ella no se puede recorrer el camino feliz, porque una cuenta Gmail personal será rechazada por diseño.
- **Credenciales de OAuth mal configuradas (sobre todo la URI de redirección) hacen fallar el callback de forma opaca** — mitigación: crearlas como primer paso del `tasks.md`, registrar por separado la URI de desarrollo (`http://localhost:5173/api/auth/google/callback`, que Vite proxya al backend) y la de producción, y verificar el flujo completo apenas estén listas.
- **El proyecto queda en modo Testing en Google Cloud** — solo los usuarios agregados como de prueba pueden entrar hasta que se publique. Mitigación: publicarlo antes de la demo y confirmarlo con una cuenta que no sea la del equipo.
- **Tocar `schema.prisma` está prohibido sin coordinar con el equipo** (límite duro de `tech-stack.md`) — mitigación: anunciar el cambio antes de escribir el script SQL, y correr `prisma db pull` en vez de editar el modelo a mano, igual que se hizo en la 001.
- **`contrasena_hash` pasa a aceptar `NULL` y eso toca el camino de login de la 002** — mitigación: repetir los chequeos de la 002 (login correcto, pass mala, correo inexistente con respuesta idéntica, y ahora también cuenta de Google con el mismo 401 genérico) antes de cerrar la feature.
