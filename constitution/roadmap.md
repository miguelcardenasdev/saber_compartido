# Roadmap

## Hecho ✅

1. **001 · Registro con correo institucional** — permite que un estudiante cree su cuenta con correo institucional y quede habilitado tras verificarla (REG-USR-001).
2. **002 · Inicio de sesión** — autenticación con correo y contraseña; abre una sesión de 7 días en cookie `httpOnly`, bloquea el acceso si el correo no está verificado y protege `/dashboard` (REG-USR-002).
3. **003 · Registro e inicio de sesión con Google** — botón "Continuar con Google" en el registro y el login; solo acepta cuentas `@amigo.edu.co`, crea la cuenta si no existe, vincula si ya existe y abre la misma sesión de 7 días de la 002 (REG-USR-003). La pantalla de consentimiento queda en modo Testing hasta el despliegue (usa la URL pública para publicarla).

## Siguiente 🔜

_Por definir — la siguiente entrada se concreta cuando su spec esté lista (ver Backlog)._

## Backlog / ideas 💡

_Orden aproximado según lo definido en tech-stack.md (por épicas y dependencias) — nada aquí está comprometido a una fecha, solo la entrada en "Siguiente" lo está:_

- **Acceso al dashboard** — pantalla central tras iniciar sesión, con guard de autenticación (DAS-EST-001).
- **Accesos directos del dashboard** — enlaces rápidos a buscar tutores, mis tutorías y cambiar a modo tutor (DAS-EST-002).
- **Registro como tutor** — un estudiante se postula como tutor de una materia y adjunta su certificado de notas (TUT-REG-001).
- **Verificación de tutor con IA** — extrae datos del certificado y permite al admin aprobar o rechazar el perfil (TUT-VER-001).
- **Búsqueda de tutores** — filtra tutores ya verificados por materia (BUS-TUT-001).
- **Disponibilidad del tutor** — el tutor define bloques de horario que alimentan las solicitudes (DISP-TUT-001).
- **Solicitud de tutoría personalizada** — flujo de solicitar, aceptar o rechazar una tutoría 1 a 1 (SOL-TUT-001).
- **Resumen de próximas tutorías** — vista de agenda dentro del dashboard (DAS-EST-003).
- **Calificación de tutor** — el estudiante califica al finalizar la tutoría, una sola vez por sesión (CAL-TUT-001).
- **Notificaciones del dashboard** — alertas de solicitudes pendientes y tutorías por calificar (DAS-EST-004).
- **Crear sesión grupal** — el tutor abre una sesión con cupo limitado (GRU-TUT-001).
- **Inscripción a sesión grupal** — un estudiante se inscribe respetando el cupo disponible (GRU-INS-001).
- **(fase futura) Panel de administración completo** — reportes y gestión general de usuarios; hoy el rol admin solo verifica tutores.

_De la 002 (quedaron fuera de su alcance):_

- **Reenviar correo de verificación** — reutiliza `correo.service.js`; permite al usuario con cuenta no verificada pedir un enlace nuevo desde el propio aviso de login (el token de 24 h ya existe, solo falta la UI y el endpoint).
- **Recuperar / cambiar contraseña** — requiere definir el flujo de recuperación por correo y una regla de fortaleza coherente con la del registro.
- **Límite de intentos fallidos** — protección anti fuerza bruta; no está definida en ninguna historia de usuario todavía.
- **Cerrar sesión** — no figura en ninguna historia de usuario; además la sesión es stateless, así que habría que decidir si basta con borrar la cookie o se necesita revocación real (ver "Sesión de usuario" en `tech-stack.md`).

_De la 003 (quedaron fuera de su alcance):_

- **Otros proveedores de identidad** — Microsoft, GitHub, etc.; la 002 quedó pendiente de esto y la 003 fue el primer proveedor. Si se agrega otro, reconsiderar si `google_sub` sigue siendo suficiente o tocar migrar a una tabla de identidades externas.
- **Desvincular Google desde la cuenta** — o cambiar a otra cuenta de Google; no hay pantalla de gestión de cuenta todavía.
- **Gestión de la restricción de apps de terceros del Workspace de la UCLA** — depende del administrador de la universidad, no del código; conviene vigilar la política y coordinar con ellos antes de la demo.
- **Publicar la pantalla de consentimiento en Google** — sale de Testing cuando haya URL pública de despliegue (Render/Railway); exige además homepage y política de privacidad válidos.

> Cada feature nueva se crea como `features/NNN-nombre-feature/` con `spec.md`, `plan.md` y `tasks.md` antes de tocar código.