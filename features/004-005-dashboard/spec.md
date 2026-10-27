# 004-005 · Acceso al dashboard y accesos directos (con cerrar sesión)

**Estado:** finalizado

> Feature unificada de las historias **DAS-EST-001** (acceso al dashboard) y **DAS-EST-002** (accesos directos del dashboard), más la funcionalidad de **cerrar sesión** que quedó fuera del alcance de la 002. Referencia visual: el prototipo `Saber-Compartido-Dashboard` (carpeta compartida por el equipo).

## Qué hace

Convierte el esqueleto actual de `/dashboard` en el espacio central del estudiante tras iniciar sesión. Construye el "shell" de la aplicación —la estructura que rodea a todas las pantallas autenticadas— y la vista **Resumen**: el primer vistazo del estudiante a su actividad académica.

El shell replica fielmente el prototipo: **sidebar** fijo con la marca, la navegación principal (solo el menú del estudiante), una tarjeta informativa de ayuda y el bloque de perfil; **topbar** con miga de pan, campana de notificaciones y el usuario; y **pie de página**. En móvil el sidebar colapsa y se abre con un botón de menú. El selector de rol del prototipo no se implementa: el prototipo es una demostración con datos de ejemplo, y en producción el rol lo entrega la autenticación (hoy todos los usuarios son estudiantes).

La vista **Resumen** muestra el banner de bienvenida con sus CTAs, cuatro tarjetas de estadísticas, tres accesos directos y tres paneles (próximas tutorías, tutores recomendados y actividad reciente). Las cifras y listas salen de un endpoint nuevo `GET /api/dashboard/resumen` que calcula datos reales de las tablas existentes; cuando aún no hay datos (que es el caso de las cuentas nuevas), los paneles muestran estados vacíos amigables en lugar de números inventados. Los accesos directos y los CTAs del banner navegan a pantallas placeholder ("Próximamente") que ocupan el lugar de las features futuras: cada una se construirá en su propia feature.

También agrega **cerrar sesión**: un botón visible en el sidebar que limpia la cookie de sesión y devuelve al estudiante a la pantalla de inicio de sesión. La sesión es stateless (JWT en cookie `httpOnly`), por lo que el endpoint limpia la cookie desde el servidor; la revocación anticipada del token queda en el backlog, igual que en la 002 y la 003.

## Por qué

Hoy, después de iniciar sesión, el estudiante aterriza en un `/dashboard` que es apenas un `<h1>` con su nombre dentro de un header. No hay navegación, no hay forma de llegar a ninguna otra área de la plataforma y no hay manera de cerrar sesión sin borrar cookies a mano. Ese vacío bloquea todas las historias siguientes: buscar tutores, gestionar tutorías, calificar o convertirse en tutor necesitan un punto de entrada común desde el cual navegar.

Construir primero el shell y el Resumen sigue el principio de **módulos independientes** del constitution: es la base compartida que desbloquea el trabajo en paralelo del equipo — en cuanto exista la estructura, cada pantalla futura se conecta a una entrada del menú sin tocar las demás. Y hacerlo con datos reales (aunque hoy sean ceros) en lugar de cifras de demostración evita rehacer la vista cuando entren las features de tutorías y calificaciones: el contrato del endpoint ya estará listo y solo habrá que alimentarlo.

El cierre de sesión entra aquí porque no es una feature independiente: es parte de que el shell sea un espacio completo del usuario. Dejarlo pendiente otra vez perpetuaría la sensación de producto a medias que la 003 ya heredó de la 002.

## Criterios de aceptación

### Shell y navegación

- [ ] Tras iniciar sesión por cualquiera de los tres caminos (registro verificado, contraseña o Google), el estudiante aterriza en `/dashboard` y ve el shell completo —sidebar, topbar y pie de página— con la identidad visual del prototipo.
- [ ] El sidebar muestra la marca, la navegación del estudiante en dos grupos (`MENÚ PRINCIPAL` y `MI ESPACIO`), la tarjeta de ayuda y el bloque de perfil con las iniciales, el nombre y el rol del usuario autenticado (no datos de ejemplo).
- [ ] La navegación del estudiante contiene exactamente estas entradas: Resumen, Buscar tutores, Mis tutorías, Tutorías grupales, Notificaciones, Ser tutor y Mi perfil. Solo **Resumen** tiene pantalla real; las demás muestran una página placeholder "Próximamente" que conserva el shell.
- [ ] El ítem de navegación activo queda resaltado y el breadcrumb de la topbar muestra el nombre de la pantalla actual.
- [ ] La campana de notificaciones abre un drawer en estado vacío ("no tienes notificaciones todavía"); la acción "Marcar todas como leídas" no aparece mientras no haya notificaciones.
- [ ] En pantallas menores a 900px el sidebar queda oculto y se abre y cierra con el botón de menú de la topbar, sin bloquear el uso de la página.
- [ ] El footer muestra el texto del prototipo.

### Resumen

- [ ] El banner de bienvenida muestra el nombre real del estudiante y sus dos botones ("Buscar un tutor" y "Solicitar tutoría") navegan a los placeholders correspondientes.
- [ ] Se muestran las cuatro tarjetas de estadísticas —tutorías programadas, horas de aprendizaje, tutores favoritos y pendientes por calificar— con los valores que devuelve el backend para ese estudiante (0 mientras no tenga actividad).
- [ ] Los tres accesos directos (Encontrar un tutor, Mis tutorías, Aprender en grupo) navegan a sus placeholders.
- [ ] El panel "Próximas tutorías" lista como máximo las 3 tutorías más próximas del estudiante con fecha, hora, materia, persona y estado; cuando no hay ninguna, muestra un estado vacío con un botón que lleva al placeholder de Buscar tutores.
- [ ] El panel "Tutores recomendados" muestra un estado vacío explicativo mientras no exista la función de recomendación.
- [ ] El panel de actividad reciente muestra un estado vacío explicativo mientras no exista la función de notificaciones.
- [ ] Mientras el backend responde, se ve un estado de carga coherente con el resto de la app; si la petición falla, se muestra un mensaje con opción de reintentar y el shell no se rompe.

### Datos del Resumen (backend)

- [ ] `GET /api/dashboard/resumen` sin cookie o con cookie inválida responde 401 `SESION_INVALIDA` con el mismo cuerpo que el resto de rutas protegidas.
- [ ] Con sesión válida, el endpoint devuelve: las tutorías programadas del estudiante (solicitudes pendientes o aceptadas), las horas de aprendizaje (suma de la duración de sus tutorías aceptadas), tutores favoritos (0 por ahora), pendientes por calificar (tutorías completadas sin calificación del estudiante), hasta 3 próximas tutorías con tutor, materia, fecha, horario y estado, y listas vacías para recomendados y actividad.
- [ ] Los datos devueltos corresponden siempre al usuario autenticado: ningún estudiante ve tutorías, calificaciones o actividad de otra persona.

### Cerrar sesión

- [ ] El sidebar incluye un botón "Cerrar sesión" visible sin necesidad de desplazarse.
- [ ] Al pulsarlo, el estudiante vuelve a `/iniciar-sesion`, su contexto de usuario queda vacío y ya no puede volver a `/dashboard` por URL directa.
- [ ] Después de cerrar sesión, recargar la página no restaura la sesión.
- [ ] Ejecutar cerrar sesión con una sesión ya cerrada o ausente responde sin error (es idempotente).
- [ ] Cerrar sesión en este navegador no cierra las sesiones que el mismo usuario tenga abiertas en otros navegadores.

### Estética y convenciones

- [ ] El shell y el Resumen replican el prototipo: fondo de página `#FAF9FE`, tarjetas blancas con radio 16px y sombra suave, avatares con iniciales y badges de estado, respetando los tokens de marca de `tech-stack.md` (morado para identidad, rosa coral para CTAs) y su definición de tipografías.
- [ ] El resultado es usable de forma mobile-first: sin desbordes horizontales a 320px, targets táctiles suficientes y sin depender de `hover`.
- [ ] Todo el copy visible está en español.
- [ ] El registro (001), el inicio de sesión (002), el acceso con Google (003) y la verificación de correo siguen funcionando exactamente igual que antes de esta feature.

## Fuera de alcance

- Las pantallas a las que apuntan los accesos directos: Buscar tutores (BUS-TUT-001), Mis tutorías y detalle/solicitud de tutoría (SOL-TUT-001), Tutorías grupales (GRU-TUT-001 / GRU-INS-001), Notificaciones (DAS-EST-004), Ser tutor (TUT-REG-001) y edición de Mi perfil. Esta feature solo crea el shell, el Resumen y los placeholders que las enlazan.
- La búsqueda global del topbar del prototipo (campo "Buscar tutor, materia…" y atajo ⌘K) — pertenece a BUS-TUT-001.
- El rol tutor y el rol administrador: la navegación y las vistas de esas dos perspectivas se construirán en sus features (TUT-VER-001 habilita el rol tutor; el panel de administración es una fase futura). El shell de esta feature es solo la vista del estudiante.
- La lista real de "Tutores recomendados" (necesita perfiles verificados de tutores: BUS-TUT-001).
- Notificaciones reales, su drawer poblado y la acción "Marcar todas como leídas" (DAS-EST-004). La campana existe en el shell con estado vacío.
- Funcionalidad de la tarjeta de ayuda (es estática; no abre modal ni canal de soporte porque no está definido).
- Favoritos de tutores: no existe en el modelo de datos; la stat-card se queda en 0 hasta que se defina esa historia.
- Revocación anticipada de sesiones (logout real más allá de borrar la cookie) — ya en el backlog de la 002.
- Cambiar contraseña, editar perfil y preferencias de la pantalla "Mi perfil" del prototipo — no hay historia de usuario que los respalde todavía.
- Vistas del prototipo de tutor y administrador (solicitudes recibidas, disponibilidad, creación de sesiones grupales, verificaciones, usuarios, reportes).
- Cambios en `schema.prisma` o migraciones: esta feature no modifica el modelo de datos.
