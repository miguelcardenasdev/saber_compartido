# Roadmap

## Hecho ✅


## Siguiente 🔜

1. **001 · Registro con correo institucional** — permite que un estudiante cree su cuenta con correo institucional y quede habilitado tras verificarla (REG-USR-001).

## Backlog / ideas 💡

_Orden aproximado según lo definido en tech-stack.md (por épicas y dependencias) — nada aquí está comprometido a una fecha, solo la entrada en "Siguiente" lo está:_

- **Inicio de sesión** — autenticación con correo y contraseña; bloquea el acceso si el correo no está verificado (REG-USR-002).
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

> Cada feature nueva se crea como `features/NNN-nombre-feature/` con `spec.md`, `plan.md` y `tasks.md` antes de tocar código.