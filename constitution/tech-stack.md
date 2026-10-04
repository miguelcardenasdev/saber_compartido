# Tech stack y convenciones

## Tecnologías

- **Lenguaje:** JavaScript (Node.js en el backend, React en el frontend).
- **Framework / runtime:** Node.js 22 LTS + Express 5 en el backend; React con Vite en el frontend.
- **Base de datos:** MySQL con Prisma como ORM. En desarrollo, MySQL corre en un contenedor local vía `docker-compose` (mismo entorno para los 3). En producción, MySQL gestionado en Aiven.
- **Tests:** no hay suite formal por el plazo del MVP. En su lugar, cada historia se valida manualmente contra sus criterios de aceptación (ya documentados por historia en el backlog). Si el tiempo alcanza, se agregan tests unitarios solo a lógica crítica sin UI (ej. cálculo de cupos, validación de conflictos de horario) con Vitest — no a todo el proyecto.
- **Despliegue:** Aplicación completa (backend + frontend) desplegada vía Docker en Railway; base de datos de producción en Aiven, no en Railway. Variable de conexión (`DATABASE_URL`) cambia entre entornos: apunta al contenedor local en desarrollo y a Aiven en producción — el resto del `Dockerfile` no cambia.

## Archivos / módulos clave

- `backend/src/modules/<nombre>/` — un módulo por épica (`auth`, `dashboard`, `tutores`, `busqueda`, `tutorias-1a1`, `tutorias-grupales`, `calificaciones`), cada uno con `routes → controller → service → repository`.
- `backend/src/modules/tutores/verificacion/` — sub-módulo aislado de verificación de tutores con IA, separado para poder extraerlo a un servicio propio más adelante si hace falta.
- `backend/src/shared/prisma/client.js` — instancia única de Prisma compartida por todo el backend.
- `backend/prisma/schema.prisma` — modelo de datos completo del proyecto (archivo compartido, ver Límites duros).
- `frontend/src/features/<nombre>/` — lógica de negocio del frontend, mapeada 1 a 1 con los módulos del backend.
- `frontend/src/pages/` — una carpeta por pantalla (Login, Dashboard, BuscarTutores, etc.).

## Comandos

- `npm run dev` — arranca el entorno local (backend y frontend por separado, cada uno en su carpeta).
- `npm test` — no aplica aún; se define si se agregan tests de lógica crítica.
- `npm run lint` — ESLint + Prettier.
- `npm run build` — compila el frontend para producción (Vite build); el backend en JavaScript plano no necesita paso de build.

## Modelo de datos / dominio

- `usuarios.rol` — `estudiante` | `tutor` | `administrador`. Pasa de `estudiante` a `tutor` automáticamente cuando al menos una fila de `tutores_materias` del usuario llega a `estado = 'aprobado'` (no antes — mientras esté `pendiente`, sigue viéndose como `estudiante`). Esta actualización debe ocurrir en la misma transacción que aprueba al tutor (TUT-VER-001). El frontend usa este campo para habilitar el switch "modo tutor" (DAS-EST-002) — no hay un valor combinado; el usuario conserva su vista de estudiante y además gana acceso a la de tutor.
- `usuarios.correo_institucional` — debe terminar en `@amigo.edu.co`; se valida en el registro (REG-USR-001).
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