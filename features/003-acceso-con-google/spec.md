# 003 · Registro e inicio de sesión con Google

**Estado:** propuesta

## Qué hace

Agrega un botón "Continuar con Google" a las pantallas de registro y de inicio de sesión. Un estudiante que lo pulsa se autentica con su cuenta de Google y queda con sesión abierta en Saber Compartido, sin tener que escribir ni recordar una contraseña.

Solo se aceptan cuentas de Google del dominio institucional de la UCLA (`@amigo.edu.co`). Si la cuenta no existe todavía en la plataforma se crea automáticamente; si ya existe con ese mismo correo, se vincula a la de Google en lugar de duplicarse ni rechazarse. La sesión que se abre es exactamente la misma que abre la 002: dura 7 días, se mantiene al recargar la página y da acceso a las mismas pantallas protegidas.

## Por qué

Hoy el único camino para entrar es crear una contraseña que cumpla una política exigente, esperar el correo de verificación y volver. Cada uno de esos pasos es una razón para abandonar el registro, y ninguno aporta seguridad real cuando la universidad ya administra la identidad del estudiante: Google Workspace de la UCLA ya sabe quién es el estudiante y ya verificó su correo.

Conectar esa identidad existente elimina la fricción del registro sin aflojar la puerta — el filtro de dominio sigue siendo igual de estricto que en la 001, y de hecho se vuelve más confiable, porque el correo lo entrega y verifica Google en vez de confiar en lo que tipeó el usuario. Refuerza el principio de mission.md de que "no es un marketplace abierto": la única forma de entrar es con una cuenta que la universidad administra.

## Criterios de aceptación

- [x] Un estudiante que pulsa "Continuar con Google" en el registro o en el inicio de sesión llega al selector de cuentas de Google y, al elegir una cuenta `@amigo.edu.co` autorizada, queda con sesión abierta y es redirigido al dashboard.
- [x] La sesión que abre es indistinguible de la de la 002: cookie `httpOnly` de 7 días, y al recargar `/dashboard` el estudiante sigue autenticado y ve su nombre.
- [x] Si la cuenta de Google todavía no existe en Saber Compartido, se crea automáticamente en el mismo momento, sin pedirle datos adicionales y sin enviarle el correo de verificación (Google ya lo verificó).
- [x] Si ya existe una cuenta con ese correo, la vinculación la reutiliza: no se crea una cuenta duplicada ni se rechaza el acceso por "correo ya registrado".
- [x] Si esa cuenta existente no estaba verificada, la vinculación elimina su contraseña y su token de verificación: quien la tenía pierde el acceso por contraseña y desde ese momento solo puede entrar con Google. (Sin esta regla, alguien que hubiera registrado el correo de otra persona con una contraseña propia conservaría el acceso después de la vinculación.)
- [x] Si esa cuenta existente sí estaba verificada, conserva su contraseña y puede entrar indistintamente con Google o con su contraseña.
- [x] Una cuenta que entró (o fue creada) por Google no puede iniciar sesión con contraseña: al intentarlo ve el mismo mensaje genérico de credenciales inválidas que cualquier otro fallo, sin revelar que se debe a que la cuenta usa Google.
- [x] Una cuenta de Google personal, que no pertenezca al dominio institucional, es rechazada con un mensaje claro: no se crea cuenta ni se abre sesión.
- [x] Si el estudiante cancela o cierra el consentimiento de Google, vuelve a la pantalla de inicio de sesión con un mensaje que explica que no se completó el acceso, y no queda con sesión.
- [x] Si el acceso falla por cualquier otro motivo (error de Google, enlace manipulado o expirado), el estudiante vuelve a la pantalla de inicio de sesión con un mensaje genérico y sin sesión abierta.
- [x] Mientras Google procesa el acceso, el botón muestra un estado de carga y queda deshabilitado, del mismo modo que el formulario de la 002, para evitar activaciones duplicadas.
- [x] El botón "Continuar con Google" aparece en ambas pantallas —registro e inicio de sesión—, respeta la identidad visual y los tokens de `tech-stack.md` y es usable en móvil.
- [x] El registro con contraseña de la 001 y el inicio de sesión con contraseña de la 002 siguen funcionando exactamente igual que antes de esta feature.

## Fuera de alcance

- Otros proveedores de identidad (Microsoft, GitHub, etc.) — por ahora solo Google; la 002 quedó explícitamente pendiente de esto y este es su primer proveedor.
- Iniciar sesión con una cuenta Gmail personal — rechazado a propósito, no es una limitación técnica: "no es un marketplace abierto" (mission.md).
- Recuperación o cambio de contraseña — sigue en el backlog de la 002.
- Desvincular Google desde la cuenta o cambiar a otra cuenta de Google — no hay pantalla de gestión de cuenta todavía.
- Cerrar sesión — sigue en el backlog de la 002; la sesión de la 003 usa el mismo mecanismo y los mismos límites.
- Verificación en dos pasos propia de la plataforma — la que aplique el usuario en su cuenta de Google ya entra en juego automáticamente.
- Administración de las cuentas de Google del Workspace de la universidad (aprobar la app, restringir terceros) — depende del administrador de la UCLA, no del código.
