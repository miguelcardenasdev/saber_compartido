# 004-005 · Acceso al dashboard y accesos directos (con cerrar sesión) — Plan

_Cómo se implementa lo descrito en `spec.md`. Debe respetar la `constitution/`._

## Enfoque

El shell se construye como un **layout de React Router**: un componente que dibuja sidebar, topbar y footer y renderiza `<Outlet/>` con la pantalla activa. Se monta como elemento de la ruta `/dashboard` **dentro del `RutaProtegida` que ya existe**, así que el guard de autenticación no se toca ni se reimplementa: las rutas hijas heredan la protección sin código adicional. La navegación del estudiante vive como un array de datos (etiqueta, ruta, icono) dentro del layout, para que cada feature futura agregue su entrada sin reescribir el sidebar.

En backend se crea el módulo `dashboard` con el patrón obligatorio `routes → controller → service → repository` y un único endpoint `GET /api/dashboard/resumen`, protegido por `requerir-sesion`. El service arma la respuesta y el repository hace las consultas a las tablas existentes (`solicitudes_tutoria`, `disponibilidad_tutores`, `calificaciones`); no hay campos nuevos ni migraciones. Lo que no puede calcularse todavía (tutores recomendados, actividad reciente, favoritos) se devuelve como lista vacía o 0: el contrato queda firmado y cada feature futura solo lo alimenta.

`cerrar sesión` es un endpoint mínimo en el módulo `auth`: como la cookie es `httpOnly`, el cliente no puede borrarla con JavaScript, así que el servidor la limpia con `clearCookie` usando el mismo nombre y path con los que se emite. No hay revocación del JWT (la sesión es stateless): el token viejo sigue siendo criptográficamente válido hasta vencer, pero sin cookie no sirve para nada.

En el frontend, los tokens nuevos del prototipo (fondo `#FAF9FE`, radio 16px, sombras, avatares de colores, badges de estado) se agregan al tema de Tailwind 4 en `index.css` mapeando los colores ya existentes; no se introducen colores fuera de la paleta de `tech-stack.md`.

## Implementación

1. Crear el endpoint `POST /api/auth/logout`: registra la ruta en `auth.routes.js` y la limpia de cookie en el controller — `backend/src/modules/auth/auth.routes.js` y `auth.controller.js` (sin service: no hay lógica de negocio que aislar).
2. Crear el módulo `dashboard` con su `routes → controller → service → repository`: `GET /api/dashboard/resumen` con `requerir-sesion`, que recibe `req.usuarioId` y responde el objeto del contrato (conteos, próximas tutorías, listas vacías) — `backend/src/modules/dashboard/{dashboard.routes.js, dashboard.controller.js, dashboard.service.js, dashboard.repository.js}`.
3. Implementar en el repository las consultas: solicitudes del estudiante (pendiente/aceptada) con tutor, materia y bloque de disponibilidad; suma de duraciones de las aceptadas; completadas sin calificación; y las 3 próximas aceptadas ordenadas por fecha y hora — `dashboard.repository.js` con Prisma.
4. Montar el módulo en la app — `backend/src/app.js` (`app.use("/api/dashboard", ...)`).
5. Agregar los tokens nuevos del prototipo al tema de Tailwind (fondo de página, sombra, radio, colores de avatares y badges) conservando Poppins en encabezados — `frontend/src/index.css`.
6. Crear el cliente del endpoint y el hook/estado de carga del Resumen — `frontend/src/features/dashboard/api-resumen.js`.
7. Construir el layout del shell: sidebar (marca, nav del estudiante, tarjeta de ayuda estática, perfil mini, botón "Cerrar sesión", menú hamburguesa para móvil), topbar (breadcrumb, campana con drawer vacío, usuario) y footer — `frontend/src/features/dashboard/` (archivos de sidebar, topbar y footer).
8. Crear la vista Resumen con banner, stat-cards, accesos directos y los tres paneles, con estados de carga, error con reintento y estados vacíos — `frontend/src/pages/Dashboard/Resumen.jsx`.
9. Crear el componente placeholder "Próximamente" y montar las rutas anidadas bajo `/dashboard` dentro de `RutaProtegida` en `App.jsx` — `frontend/src/pages/Dashboard/` y `frontend/src/App.jsx`.
10. Implementar el cierre de sesión en el frontend: llamar `POST /api/auth/logout`, vaciar el contexto con `fijarUsuario(null)` y navegar a `/iniciar-sesion` — botón del sidebar y `frontend/src/features/auth/`.
11. Insertar filas de prueba manualmente en la base local (una tutoría aceptada, una pendiente, una completada sin calificación) para validar el Resumen con datos reales, no solo con la base vacía.
12. Recorrer los criterios de aceptación del `spec.md` a mano, correr `npm run lint` en el frontend y `oxlint backend/src` en el backend.
13. Cierre: actualizar `tech-stack.md` (tokens nuevos, módulo `dashboard`, endpoint de logout), mover la feature a "Hecho" en `roadmap.md` y dejar en el backlog lo que quedó fuera.

## Decisiones

- **Layout como ruta padre con `<Outlet/>` dentro de `RutaProtegida`** — reutiliza el guard que ya protege `/dashboard` (línea de trabajo de la 002) sin duplicarlo; cada pantalla futura se cuelga como ruta hija y hereda la protección. Se descartó un layout independiente con su propio guard (sería el mismo código con otro nombre) y meter todo en un solo componente gigante (dificultaría el trabajo en paralelo por módulos).
- **Un solo endpoint `GET /api/dashboard/resumen`, no varios** — el Resumen es la única pantalla que lo consume hoy; con varios endpoints se duplicaría la consulta de solicitudes sin beneficiar a nadie. Si crece, el service se descompone sin tocar el contrato.
- **Conteos calculados en el service sobre tablas existentes, sin campos nuevos** — no hay nada en el modelo que justifique persistir un contador derivado; los datos reales serán ceros al principio y eso está bien (evita cifras inventadas que después haya que deshacer). Sin migraciones ni anuncios de esquema.
- **Horas de aprendizaje = suma de la duración de los bloques de `disponibilidad_tutores` de las tutorías aceptadas** — es la única fuente de duración confiable en el modelo actual; se descartó estimar desde la fecha de la solicitud (no dice cuánto duró) o pedir al tutor que registre horas (eso es otra feature).
- **`tutoresFavoritos` en 0 y listas vacías para recomendados y actividad** — el contrato del spec incluye los campos para que el frontend no cambie cuando entren BUS-TUT-001 y DAS-EST-004; inventar datos de demostración obligaría a rehacer la vista dos veces.
- **Un único componente placeholder "Próximamente" parametrizado por pantalla** — las seis entradas sin pantalla real muestran el mismo componente con su título; cada feature futura reemplaza su placeholder por la pantalla verdadera sin tocar las demás (módulos independientes).
- **Cerrar sesión: endpoint que limpia la cookie, sin revocación del JWT** — la cookie es `httpOnly`, así que es la única forma sin inseguridad. La revocación real (lista negra de tokens o tabla de sesiones) queda en el backlog de la 002: exige decidir el modelo de sesiones y no es necesaria para el MVP.
- **El logout no exige sesión previa (idempotente)** — llamarlo sin cookie no debe fallar: el botón puede pulsarse dos veces o en una pestaña con sesión ya vencida, y en ambos casos el resultado esperado es "sin error, sin sesión".
- **Navegación del estudiante como array de datos en el layout** — etiqueta, ruta e icono en una sola estructura; cuando TUT-VER-001 habilite el rol tutor se agrega el array del tutor sin reescribir el sidebar (hoy no se muestra ningún selector de rol: ese selector es solo demostración del prototipo).
- **Los tokens nuevos viven en el tema de Tailwind, no en estilos inline** — fondo de página, sombra, radio y colores de avatares/badges quedan como utilidades (`bg-page`, `rounded-card`, `shadow-card`, etc.) reutilizables por todas las features futuras, en línea con el sistema de tokens de `tech-stack.md`.
- **La tarjeta de ayuda es estática** — no hay canal de soporte definido; agregar un botón que no abre nada útil o un modal inventado sería ruido. Se documenta como decisión, no como pendiente.
- **Sin dependencias nuevas y sin tocar `schema.prisma`** — todo se construye con lo ya instalado (Express, Prisma, React, Tailwind, react-router), así que no hay nada que anunciar al equipo por los límites duros de `tech-stack.md`.

## Riesgos

- **La base local está vacía: sin datos de prueba no se pueden validar los conteos ni "Próximas tutorías" con contenido** — mitigación: antes de recorrer los criterios, insertar manualmente (SQL directo) solicitudes en los estados necesarios con su disponibilidad, validar los números, y volver a dejar la base limpia o documentar las filas de prueba.
- **Las columnas `fecha` (DATE) y `hora_inicio`/`hora_fin` (TIME) de `disponibilidad_tutores` vienen del adapter MariaDB como objetos date raros** — riesgo de calcular mal la duración o de fechas desfasadas por zona horaria al serializar a JSON. Mitigación: normalizar fechas y horas en el service antes de responder y probar con bloques que crucen el mediodía.
- **Replicar el prototipo (20+ componentes visuales) con Tailwind puede alargar el código del shell** — mitigación: componentes pequeños (Sidebar, Topbar, Footer, StatCard, SessionItem, EmptyState) y utilidades del tema en lugar de clases gigantes repetidas; si un componente crece demasiado, se extrae.
- **El drawer de notificaciones y la tarjeta de ayuda son UI sin backend: el riesgo es que alguien crea que están "rotos"** — mitigación: estados vacíos con copy explícito ("Próximamente" / "no tienes notificaciones todavía") y fuera de alcance documentado en el spec.
- **Cerrar sesión no revoca el token: una cookie robada sigue siendo válida hasta vencer** — riesgo aceptado y documentado desde la 002 (sesión stateless); queda en el backlog junto con el límite de intentos fallidos y la recuperación de contraseña.
- **`App.jsx` pasa de 4 rutas a ~10** — mitigación: las rutas del dashboard se declaran en un solo array o archivo aparte que el layout consume, para que el archivo raíz no se convierta en un punto de conflicto del equipo.
