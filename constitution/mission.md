# Misión

**Saber Compartido** es una plataforma web de tutorías universitarias para la Universidad Católica Luis Amigó (UCLA).

- Conecta estudiantes que necesitan ayuda en una materia con otros estudiantes que ya la dominan (promedio superior a la media) y quieren enseñarla.
- Resuelve el problema de que, durante el semestre, los estudiantes con dudas no siempre tienen acceso al tiempo del profesor.
- Las tutorías pueden ser virtuales o presenciales, en el horario que acuerden tutor y estudiante.
- El tutor recibe un pago por su tiempo y decide qué métodos de pago acepta (la plataforma solo registra esa preferencia, no procesa el pago — ver "Qué NO es").

## Piezas principales del producto

1. **Perfiles verificados de tutores** — un estudiante se registra como tutor de una materia específica; su certificado de notas se verifica con ayuda de IA antes de que su perfil sea público.
2. **Búsqueda de tutores** — los estudiantes filtran tutores verificados por materia y ven su calificación y promedio antes de elegir.
3. **Agenda de tutorías** — el tutor define su disponibilidad horaria; los estudiantes solicitan tutorías personalizadas (1 a 1) o se inscriben a sesiones grupales con cupo limitado.
4. **Calificaciones y reputación** — al terminar una tutoría, el estudiante la califica; eso alimenta el promedio público que ven otros estudiantes al buscar tutor.

## Para quién

- **Estudiantes con dudas académicas** — necesitan ayuda extracurricular para entender materias que les han resultado complejas.
- **Estudiantes-tutores** — dominan una materia específica por encima del promedio y quieren enseñarla de forma clara y paciente a quien la solicite.
- **La Universidad Católica Luis Amigó** — busca, mediante apoyo académico entre pares, mejorar el promedio académico de sus estudiantes en materias específicas.

## Principios

- **El MVP es solo para Tecnología en Desarrollo de Software (UCLA)** — tutores y estudiantes deben pertenecer a ese programa. Se prioriza que el producto funcione bien en un público inicialmente pequeño antes de abrir a otros programas.
- **Simplicidad sobre complejidad** — ante dos formas de resolver algo, se elige la más simple que cumpla el criterio de aceptación, no la más "correcta" en abstracto. Aplica a arquitectura (monolito, no microservicios), infraestructura (sin orquestación) y alcance de cada historia.
- **Módulos independientes, trabajo independiente** — cada funcionalidad vive en su propio módulo, para que el equipo avance en paralelo sin bloquearse entre sí.
- **Nada se construye sin spec** — cada historia tiene sus criterios de aceptación definidos antes de escribir código.

## Qué NO es

- **No es una pasarela de pagos** — solo registra el método de pago preferido del estudiante; no procesa transacciones ni maneja dinero.
- **No es una app de videollamadas** — agenda y confirma el encuentro entre estudiante y tutor, pero no aloja la sesión (video/audio); cómo se lleva a cabo la tutoría queda fuera del alcance.
- **No es un marketplace abierto** — solo funciona con correo institucional de la UCLA; no es para tutores o estudiantes externos a la institución.
- **No es una app móvil, por ahora** — el MVP es exclusivamente web.
- **No es un LMS** — no gestiona contenido de cursos, tareas ni calificaciones académicas; conecta personas para tutorías, no reemplaza la plataforma académica de la universidad.
- **No garantiza calidad pedagógica** — la verificación confirma promedio académico y materia, no qué tan bien enseña el tutor; eso lo refleja el sistema de calificaciones después de la tutoría, no la verificación.
- **No es un panel de administración completo** — el rol de administrador se limita a verificar el perfil de los tutores; no incluye reportes, gestión general de usuarios ni configuración del sistema en esta fase.