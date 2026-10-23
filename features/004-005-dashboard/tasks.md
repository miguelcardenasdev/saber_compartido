# 004-005 · Acceso al dashboard y accesos directos (con cerrar sesión) — Tareas

_Checklist accionable derivada del `plan.md`. Tareas pequeñas y concretas; marca `[x]` al completarlas._

### Backend

- [x] Crear `POST /api/auth/logout`: registrar la ruta en `auth.routes.js` y limpiar la cookie `sesion` en el controller con `clearCookie` usando el **mismo nombre y `path: "/"` con los que se emite** (`config.sesion.nombreCookie`), respondiendo 200 sin importar si había sesión — `backend/src/modules/auth/auth.routes.js` y `auth.controller.js`.
- [x] Crear el módulo `dashboard` con el patrón `routes → controller → service → repository` y la ruta `GET /api/dashboard/resumen` protegida con `requerir-sesion` (recibe `req.usuarioId`) — `backend/src/modules/dashboard/dashboard.routes.js` y `dashboard.controller.js`.
- [x] Implementar en el repository las consultas de Prisma sobre `solicitudes_tutoria` (con include de tutor, materia y bloque de `disponibilidad_tutores`): las del estudiante en estado pendiente o aceptada; la suma de duraciones de las aceptadas; las completadas sin fila en `calificaciones` para ese estudiante; y las 3 aceptadas más próximas ordenadas por `fecha` y `hora_inicio` — `backend/src/modules/dashboard/dashboard.repository.js`.
- [x] Implementar en el service el armado de la respuesta: `tutoriasProgramadas`, `horasAprendizaje` (redondeado a un decimal, calculado desde `hora_fin - hora_inicio` de cada bloque aceptado), `tutoresFavoritos` en `0`, `pendientesPorCalificar`, `proximasTutorias` (hasta 3, con tutor, materia, fecha, horario y estado), `tutoresRecomendados` y `actividadReciente` como listas vacías — `backend/src/modules/dashboard/dashboard.service.js`.
- [x] Normalizar en el service las fechas y horas que vienen del adapter MariaDB (`DATE`/`TIME`) a formatos JSON consistentes antes de responder — `dashboard.service.js`.
- [x] Montar el módulo en la app: `app.use("/api/dashboard", dashboardRoutes)` — `backend/src/app.js`.
- [x] Verificar con `curl` que `GET /api/dashboard/resumen` sin cookie responde 401 `SESION_INVALIDA` con el mismo cuerpo que el resto de rutas protegidas.

### Frontend

- [x] Agregar al tema de Tailwind los tokens nuevos del prototipo: fondo de página `#FAF9FE`, sombra de tarjeta, radio 16px, los 5 colores de avatares y los badges de estado (éxito/peligro/pendiente/info/neutro), conservando Poppins en encabezados — `frontend/src/index.css`.
- [x] Crear el cliente del endpoint con el patrón de `api-sesion.js` (credentials same-origin, 401 ⇒ manejo propio) — `frontend/src/features/dashboard/api-resumen.js`.
- [ ] Crear un helper de iniciales de avatar (primeras letras del nombre, color determinista entre los 5 colores del tema) — `frontend/src/features/dashboard/`.
- [ ] Construir el sidebar del shell: marca, nav del estudiante desde un array de datos (Resumen, Buscar tutores, Mis tutorías, Tutorías grupales, Notificaciones, Ser tutor, Mi perfil; solo Resumen con ruta real y las demás a placeholders), tarjeta de ayuda estática, bloque de perfil mini y botón "Cerrar sesión" — `frontend/src/features/dashboard/`.
- [ ] Implementar en el sidebar el menú hamburguesa para móvil (abierto/cerrado, sin bloquear el contenido) — `frontend/src/features/dashboard/`.
- [ ] Construir la topbar: breadcrumb con el nombre de la pantalla actual, campana que abre un drawer en estado vacío ("no tienes notificaciones todavía", sin "Marcar todas como leídas") y bloque de usuario — `frontend/src/features/dashboard/`.
- [ ] Construir el footer con el texto del prototipo — `frontend/src/features/dashboard/`.
- [ ] Crear el layout del shell (sidebar + main con `<Outlet/>` + topbar + footer) que se monta como ruta padre dentro de `RutaProtegida` — `frontend/src/features/dashboard/`.
- [ ] Crear el componente placeholder "Próximamente" parametrizado con el título de la pantalla — `frontend/src/pages/Dashboard/`.
- [ ] Montar en `App.jsx` las rutas anidadas bajo `/dashboard` dentro del layout: Resumen (índice) y las seis pantallas placeholder, manteniendo el archivo raíz legible (array o módulo aparte si crece) — `frontend/src/App.jsx`.
- [ ] Crear la vista Resumen: banner de bienvenida con el nombre real y sus dos CTAs, las 4 stat-cards, los 3 accesos directos y los paneles Próximas tutorías, Tutores recomendados y Actividad reciente, con estados de carga, error con reintento y estados vacíos — `frontend/src/pages/Dashboard/Resumen.jsx`.
- [ ] Implementar el cierre de sesión en el frontend: llamar `POST /api/auth/logout`, `fijarUsuario(null)` y navegar a `/iniciar-sesion` — botón del sidebar y `frontend/src/features/auth/`.

### Datos de prueba

- [ ] Insertar manualmente en la base local filas de prueba: un tutor aprobado, bloques de disponibilidad y solicitudes del estudiante de prueba en estados pendiente, aceptada y completada sin calificación (para ver `proximasTutorias` poblado y los conteos > 0) — SQL directo contra MySQL local.

### Pruebas / validación

- [ ] Camino feliz: iniciar sesión (contraseña o Google) y aterrizar en `/dashboard` viendo el shell completo con sidebar, topbar y footer.
- [ ] La navegación del estudiante tiene exactamente las 7 entradas; solo Resumen tiene pantalla real y las otras seis muestran "Próximamente" conservando el shell.
- [ ] El ítem activo del sidebar queda resaltado y el breadcrumb cambia al navegar entre Resumen y placeholders.
- [ ] Con los datos de prueba insertados, las stat-cards muestran los valores esperados (tutorías programadas, horas calculadas desde los bloques, favoritos en 0, pendientes por calificar) y "Próximas tutorías" lista hasta 3 con tutor, materia, fecha, horario y estado.
- [ ] Sin datos (usuario recién registrado), las tarjetas muestran 0 y los paneles muestran estados vacíos amigables, no errores.
- [ ] La campana abre el drawer vacío y no ofrece marcar como leídas.
- [ ] En móvil (menos de 900px) el sidebar está oculto, se abre con el botón de menú y se cierra sin dejar el contenido inutilizable; sin desbordes horizontales a 320px.
- [ ] Cerrar sesión: el estudiante vuelve a `/iniciar-sesion`, el contexto queda vacío, y volver a escribir `/dashboard` por URL lo redirige al login.
- [ ] Después de cerrar sesión, recargar la página no restaura la sesión (cookie limpia).
- [ ] Llamar `POST /api/auth/logout` sin sesión responde 200 sin error.
- [ ] Regresión 001: registro 201, 409 y enlace de verificación.
- [ ] Regresión 002: login correcto, pass mala y correo inexistente con respuesta idéntica, `/yo` con y sin cookie.
- [ ] Regresión 003: acceso con Google completo y su redirección al dashboard.
- [ ] El diseño replica el prototipo (fondo `#FAF9FE`, tarjetas con radio y sombra, avatares, badges) y el copy visible está en español.
- [ ] Correr `npm run lint` (`oxlint`) en frontend sin errores y `oxlint backend/src` sin errores nuevos.

### Cierre

- [ ] Actualizar `tech-stack.md`: tokens nuevos del tema, módulo `dashboard` con su endpoint, `POST /api/auth/logout` y la nota de que el logout limpia la cookie sin revocar el JWT.
- [ ] Validar contra los criterios de aceptación de `spec.md`.
- [ ] Mover la feature a "Hecho" en `../../constitution/roadmap.md` (como entrada única que engloba DAS-EST-001 y DAS-EST-002 más cerrar sesión).
- [ ] Quitar del backlog del roadmap el ítem "Cerrar sesión" de la 002 (ya implementado) y dejar como pendiente solo la revocación anticipada de sesiones.
- [ ] Confirmar con el equipo que no hubo cambios en `schema.prisma` ni dependencias nuevas (no había nada que anunciar).
