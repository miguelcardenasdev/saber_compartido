# 001 · Registro con correo institucional — Tareas

_Checklist accionable derivada del `plan.md`. Tareas pequeñas y concretas; marca `[x]` al completarlas._

### Base de datos (pendiente antes de tocar código)

- [x] **Decidir y agregar en Workbench las columnas faltantes en `usuarios`** para verificación de correo: `email_verificado` (TINYINT(1), default 0), `token_verificacion` (VARCHAR), `token_expira` (DATETIME). Ninguna de las tres existe hoy en el schema y spec.md depende de ellas.
- [x] `npx prisma db pull` contra esa base para generar `schema.prisma` desde las tablas reales — `backend/prisma/schema.prisma`.
- [x] Agregar `@map("columna_snake_case")` a los campos introspectados para exponerlos en camelCase en el código, sin tocar los nombres reales de columna.

### Backend

- [x] Crear `registro.schema.js` con Zod: `correo` (formato email + termina en `@amigo.edu.co`), `contrasena` (8+, mayúscula, minúscula, número, carácter especial, sin nombre/apellido), `nombres`, `apellidos` — `backend/src/modules/auth/registro.schema.js`.
- [x] Implementar `auth.repository.js`: `crearUsuario()`, `buscarPorCorreo()`, `marcarCorreoVerificado()` — `backend/src/modules/auth/auth.repository.js`.
- [x] Implementar `auth.service.js`: hash con bcrypt, verificar duplicado por `correo_institucional`, generar `token_verificacion` + `token_expira`, orquestar envío del correo — `backend/src/modules/auth/auth.service.js`.
- [x] Elegir proveedor de envío de correo (Resend o Nodemailer + SMTP) e implementar el envío — `backend/src/shared/email/`.
- [x] Implementar `auth.controller.js` y `auth.routes.js`: `POST /api/auth/registro`, `GET /api/auth/verificar/:token` (valida que el token no haya expirado antes de marcar `email_verificado = 1`) — `backend/src/modules/auth/`.
- [x] Middleware de errores para los casos: correo no institucional, correo duplicado, contraseña inválida, token expirado/inválido — `backend/src/shared/middlewares/errorHandler.js`.

### Frontend

- [ ] Formulario de registro (nombres, apellidos, correo, contraseña) con la paleta, tipografías y breakpoints de `tech-stack.md` — `frontend/src/features/auth/`.
- [ ] Validación en cliente con mensajes de error por campo.
- [ ] Conectar el formulario al endpoint de registro; manejar estados de carga, error y éxito ("revisa tu correo").
- [ ] Pantalla/estado para cuando el usuario entra al enlace de verificación (éxito, token expirado, token inválido).
- [ ] Verificar que el formulario sea usable en móvil (mobile-first).

### Pruebas / validación

- [ ] Probar manualmente cada criterio de `spec.md`: correo institucional válido, correo no institucional, correo duplicado, contraseña fuera de política, campos vacíos.
- [ ] Confirmar que el correo de verificación llega y que el enlace marca `email_verificado = 1`.
- [ ] Confirmar que un token expirado no verifica la cuenta.

### Cierre

- [ ] Actualizar `tech-stack.md` con las columnas nuevas de `usuarios` y el proveedor de correo elegido.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md`.

## Mantenimiento (checklist recurrente)

- [ ] Si la universidad cambia su dominio de correo institucional, actualizar la validación en `registro.schema.js`.
- [ ] Revisar periódicamente tokens de verificación expirados sin usar, por si vale la pena un job de limpieza más adelante (no bloqueante para el MVP).