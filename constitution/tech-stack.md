# Tech stack y convenciones

## Tecnologías

- **Lenguaje:** JavaScript (Node.js en el backend, React en el frontend).
- **Framework / runtime:** Node.js 22 LTS + Express 5 en el backend; React con Vite en el frontend.
- **Base de datos:** MySQL con Prisma como ORM. En desarrollo, MySQL corre en un contenedor local vía `docker-compose` (mismo entorno para los 3). En producción, MySQL gestionado en Aiven.
- **Tests:** no hay suite formal por el plazo del MVP. En su lugar, cada historia se valida manualmente contra sus criterios de aceptación (ya documentados por historia en el backlog). Si el tiempo alcanza, se agregan tests unitarios solo a lógica crítica sin UI (ej. cálculo de cupos, validación de conflictos de horario) con Vitest — no a todo el proyecto.
- **Despliegue:** Aplicación completa (backend + frontend) desplegada vía Docker en Railway; base de datos de producción en Aiven, no en Railway. Variable de conexión (`DATABASE_URL`) cambia entre entornos: apunta al contenedor local en desarrollo y a Aiven en producción — el resto del `Dockerfile` no cambia.
- **Correo de transacción:** Nodemailer + SMTP de Gmail (STARTTLS, puerto 587) — `backend/src/shared/email/`. El envío es **asíncrono**: el `201` de registro no espera al correo; si el envío falla, el error queda en los logs del backend sin afectar al usuario (la feature de "reenviar verificación" queda en el backlog de mantenimiento).
- **Autenticación:** JWT (`jsonwebtoken`) firmado con **HS256**, entregado en una cookie de sesión **`httpOnly`** (`sesion`) de **7 días**, `SameSite=Lax` y `Secure` solo en producción. `httpOnly` impide que el JavaScript de la página lea o manipule la cookie, por lo que no está expuesta a XSS; el `SameSite=Lax` evita que viaje en peticiones cross-site de tipo POST. El secreto vive en la variable de entorno **`JWT_SECRET`** (obligatoria, mínimo 32 caracteres; se valida al arrancar en `backend/src/config/index.js` y se genera con `node -p "crypto.randomBytes(48).toString('hex')"`). El payload lleva solo `{ sub: <id de usuario> }` — nunca datos del usuario ni la contraseña. El cliente **nunca** recibe el JWT en el cuerpo de la respuesta: solo se guarda en la cookie. Dependencias nuevas: `jsonwebtoken`, `cookie-parser`, `bcrypt`.
- **Acceso con Google (003):** flujo **Authorization Code con PKCE** implementado con **`google-auth-library`**. Credenciales obligatorias en variables de entorno **`GOOGLE_CLIENT_ID`**, **`GOOGLE_CLIENT_SECRET`** y **`GOOGLE_REDIRECT_URI`** (si falta alguna, el servidor no arranca — `backend/src/config/index.js`; plantilla en `.env.template`). `GET /api/auth/google` genera `state` + verificador PKCE, los guarda en una cookie firmada con `jsonwebtoken` (`google_oauth`, 10 minutos, `httpOnly`, `SameSite=Lax`, `path=/api/auth`) y redirige a Google con `hd=amigo.edu.co`. El `GET /api/auth/google/callback` verifica el `state`, canjea el código por un ID token y lo valida **en el servidor** con tres comprobaciones: `email_verified`, correo terminado en `@amigo.edu.co` y `hd` igual a `amigo.edu.co`. Si todo pasa, emite **la misma sesión de 7 días de la 002** (helper compartido `backend/src/shared/auth/emitir-sesion.js`) y redirige al dashboard. **Los fallos de este flujo no se devuelven como JSON: el callback redirige a `/iniciar-sesion?error=<codigo>` con los códigos `DOMINIO_NO_PERMITIDO`, `ACCESO_CANCELADO` y `ERROR_GOOGLE`** — el callback es una navegación del navegador, no una llamada `fetch`.

## Archivos / módulos clave

- `backend/src/modules/<nombre>/` — un módulo por épica (`auth`, `dashboard`, `tutores`, `busqueda`, `tutorias-1a1`, `tutorias-grupales`, `calificaciones`), cada uno con `routes → controller → service → repository`.
- `backend/src/modules/tutores/verificacion/` — sub-módulo aislado de verificación de tutores con IA, separado para poder extraerlo a un servicio propio más adelante si hace falta.
- `backend/src/shared/prisma/client.js` — instancia única de Prisma compartida por todo el backend.
- `backend/prisma/schema.prisma` — modelo de datos completo del proyecto (archivo compartido, ver Límites duros).
- `frontend/src/features/<nombre>/` — lógica de negocio del frontend, mapeada 1 a 1 con los módulos del backend.
- `frontend/src/pages/` — una carpeta por pantalla (Login, Dashboard, BuscarTutores, etc.).
- `backend/src/shared/middlewares/requerir-sesion.js` — middleware que valida el JWT de la cookie `sesion` y fija `req.usuarioId`; lo usan las rutas protegidas. Responde **401 `SESION_INVALIDA`** con el mismo cuerpo ante cookie ausente, manipulada, vencida o de un usuario ya inexistente.
- `frontend/src/features/auth/` — `auth-context.jsx` (lee `GET /api/auth/yo` al montar; un 401 deja `usuario` en `null`, no es un error), `ruta-protegida.jsx` (guarda `/dashboard`) y `formulario-login.jsx` (replica el patrón de validación de la 001).
- **Firma de errores de login:** el backend valida la **contraseña antes que el estado de verificación**. Así, una cuenta no verificada con contraseña incorrecta responde el genérico `CREDENCIALES_INVALIDAS` (401) y no `CORREO_NO_VERIFICADO` (403), evitando que un atacante descubra qué correos tienen cuenta activa. Además usa un hash de relleno (`HASH_RELLENO`) cuando el correo no existe, para que el tiempo de respuesta no delate la existencia de la cuenta.

## Comandos

- `npm run dev` — arranca el entorno local (backend y frontend por separado, cada uno en su carpeta).
- `npm test` — no aplica aún; se define si se agregan tests de lógica crítica.
- `npm run lint` — **oxlint** (no ESLint). Hoy está configurado y ejecutable **solo en `frontend/`** (`.oxlintrc.json` con los plugins `react` y `oxc`); `backend/` no tiene script ni config de lint todavía, así que sus archivos se revisan con el mismo binario apuntándolo a la carpeta (`oxlint backend/src`). Añadir `lint` al `backend/package.json` queda pendiente de coordinar con el equipo (ver "No agregar dependencias nuevas sin avisar").
- `npm run build` — compila el frontend para producción (Vite build); el backend en JavaScript plano no necesita paso de build.

## Modelo de datos / dominio

- `usuarios.rol` — `estudiante` | `tutor` | `administrador`. Pasa de `estudiante` a `tutor` automáticamente cuando al menos una fila de `tutores_materias` del usuario llega a `estado = 'aprobado'` (no antes — mientras esté `pendiente`, sigue viéndose como `estudiante`). Esta actualización debe ocurrir en la misma transacción que aprueba al tutor (TUT-VER-001). El frontend usa este campo para habilitar el switch "modo tutor" (DAS-EST-002) — no hay un valor combinado; el usuario conserva su vista de estudiante y además gana acceso a la de tutor.
- `usuarios.correo_institucional` — debe terminar en `@amigo.edu.co`; se valida en el registro (REG-USR-001) y también en el acceso con Google (REG-USR-003), que exige además `email_verified` y `hd = amigo.edu.co`.
- `usuarios.contrasena_hash` — **acepta `NULL` desde la 003** (una cuenta creada o vinculada con Google no tiene contraseña; migración en `database/004_google_sub_y_contrasena_nullable.sql`). El login por contraseña usa `usuario?.contrasenaHash ?? HASH_RELLENO`, así que un `null` cae en el mismo `401 CREDENCIALES_INVALIDAS` genérico que cualquier otro fallo.
- `usuarios.google_sub` — `VARCHAR(255) NULL UNIQUE` (`uq_usuarios_google_sub`), el `sub` del ID token de Google con el que se vincula la cuenta de forma estable (columna en `004_...`, modelo `googleSub` vía `prisma db pull`). Búsqueda por este campo primero y por correo después; al vincular sobre una cuenta **no verificada** se borran también `contrasena_hash` y el token de verificación. MySQL permite múltiples `NULL` en columnas `UNIQUE`, así que las cuentas sin Google no chocan.
- `usuarios.email_verificado`, `usuarios.token_verificacion`, `usuarios.token_expira` — ciclo de verificación de correo (REG-USR-001). La cuenta nace con `email_verificado = 0`; el registro genera un token hexadecimal de 32 bytes con vencimiento de 24 h y envía el enlace `${URL_FRONTEND}/verificar/<token>`. `token_verificacion` es **UNIQUE** en la BD (`uq_usuarios_token_verificacion`) y se conserva después de verificar: el enlace es reutilizable hasta su vencimiento (un segundo clic responde `YA_VERIFICADO`); vencido sin verificar responde `TOKEN_EXPIRADO` y la cuenta sigue inhabilitada. La verificación la resuelve `GET /api/auth/verificar/:token`.
- **Sesión de usuario:** no hay tabla de sesiones — es **stateless**. La validez la da el JWT de la cookie `sesion` y la comprobación final de que el usuario exista en BD (`GET /api/auth/yo`). Por eso "cerrar sesión" hoy solo podría hacerse borrando la cookie desde el cliente, y una cuenta eliminada sigue teniendo un JWT técnicamente válido hasta que `/yo` la rechace. Cerrar sesión y revocación anticipada quedan en el backlog.
- `tutores_materias.estado` — `pendiente` | `aprobado` | `rechazado`, por tutor **y por materia** (un tutor puede quedar aprobado en una materia y rechazado en otra). Solo las filas en `aprobado` hacen público al tutor en esa materia y lo hacen visible en búsqueda (BUS-TUT-001).
- `tutores_materias.promedio_academico` — debe ser ≥ 4.0 para que la IA apruebe la verificación; por debajo de eso, el estado pasa a `rechazado` (TUT-VER-001).
- `disponibilidad_tutores` — bloques de horario concretos (`fecha` + `hora_inicio` + `hora_fin`), no recurrentes.
- `solicitudes_tutoria.estado` — `pendiente` | `aceptada` | `rechazada` | `completada` | `cancelada`. **Pendiente de resolver antes de construir SOL-TUT-001:** `disponibilidad_id` es `UNIQUE` en esta tabla, lo que impide reutilizar un bloque incluso después de una solicitud `rechazada` — contradice el criterio de que rechazar libera el horario. Al implementar, validar en el `service` (no en la base de datos) que no exista ya una solicitud `pendiente` o `aceptada` para ese bloque antes de crear una nueva.
- `sesiones_grupales.cupo` — al llegar al máximo (contado vía `inscripciones_sesion_grupal` con `estado = 'confirmada'`), deshabilita nuevas inscripciones (GRU-INS-001).
- `calificaciones` — única por `(estudiante_id, solicitud_tutoria_id)` y por `(estudiante_id, sesion_grupal_id)` — no se puede calificar dos veces la misma tutoría (CAL-TUT-001), rango 1–5. Alimenta el promedio público del tutor (calculado, no un campo almacenado).

## Convenciones

- Nombres de variables y funciones en camelCase; nombres de archivos de módulo en kebab-case (`disponibilidad.service.js`).
- Identificadores de código (variables, funciones, modelos Prisma) en español. Copy visible al usuario siempre en español.
- El controller nunca accede a Prisma directamente — siempre pasa por `service` y luego `repository`.
- Manejo de errores centralizado en un middleware de Express único, que traduce errores de negocio a respuestas HTTP consistentes.
- Validación de entradas con Zod. Cada endpoint define su schema (`<recurso>.schema.js`, junto al controller del módulo) y valida `req.body`/`req.query` antes de llegar al controller; si falla, responde 400 con el detalle del schema.

## Estilo visual

### Sistema de color (tokens)

```css
:root {
  /* Marca */
  --color-primary: #7C3AED;        /* morado vibrante — identidad, headers, nav, estados activos */
  --color-primary-dark: #5B21B6;   /* hover/pressed de primary */
  --color-primary-light: #F5F3FF;  /* fondo suave con tinte morado — cards destacadas, secciones alternas */

  --color-accent: #FF5A8C;         /* rosa coral — botones de acción principal (Solicitar tutoría, Registrarme) */
  --color-accent-dark: #E0396F;    /* hover/pressed de accent */

  /* Neutrales */
  --color-text: #1F1147;           /* texto principal — gris-morado oscuro, más cálido que negro puro */
  --color-text-muted: #6B7280;     /* texto secundario, ayudas, timestamps */
  --color-border: #E5E7EB;
  --color-bg: #FFFFFF;
  --color-bg-soft: #F5F3FF;        /* mismo tono que primary-light, para fondos de sección */

  /* Estados semánticos (independientes de la marca, no tocar) */
  --color-success: #16A34A;        /* tutor verificado, solicitud aceptada */
  --color-warning: #F59E0B;        /* pendiente de verificación */
  --color-danger: #DC2626;         /* rechazo, error de validación */
}
```

- El morado lleva la identidad (marca, navegación, links); el rosa coral se reserva casi exclusivamente para los CTAs — así no compite consigo mismo por atención.
- Opcional para hero/headers: degradado sutil de `--color-primary` a `--color-accent`.

### Tipografías

- **Encabezados:** [Poppins](https://fonts.google.com/specimen/Poppins) — geométrica, redondeada, encaja con el tono juvenil de la paleta.
- **Cuerpo de texto y UI:** [Inter](https://fonts.google.com/specimen/Inter) — mantiene la legibilidad en formularios y perfiles de tutor.

### Reglas de layout / responsive

- Mobile-first.
- Breakpoints: `sm: 640px` · `md: 768px` · `lg: 1024px` · `xl: 1280px`.
- Bordes redondeados generosos (12–16px) en cards, botones y avatares — sensación app, no portal institucional.
- Formas orgánicas (blobs, círculos de fondo) opcionales en dashboard/landing para reforzar el tono "app".
- **Implementación:** Tailwind CSS, mapeando estos tokens a `theme.extend.colors`.

## Límites duros

- No agregar dependencias nuevas al `package.json` sin avisar al equipo — con 3 personas trabajando en paralelo, una dependencia nueva sin avisar rompe el entorno de los otros dos.
- No modificar `schema.prisma` sin coordinar con el equipo — es el archivo compartido con más riesgo de conflicto de merge.
- No subir `.env*` ni ninguna API key (Gemini, Groq, etc.) al repositorio.
- No implementar procesamiento real de pagos — la plataforma solo registra la preferencia del estudiante (ver "Qué NO es" en mission.md).
- No construir funcionalidad de video/llamadas — fuera de alcance del MVP.