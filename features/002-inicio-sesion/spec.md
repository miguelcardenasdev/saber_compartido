# 002 · Inicio de sesión

**Estado:** propuesta

## Qué hace

Permite que un estudiante con cuenta ya registrada inicie sesión en Saber Compartido con su correo institucional y su contraseña. Si las credenciales son correctas y el correo está verificado, el sistema abre una sesión (que dura 7 días) y lo lleva al dashboard. Si algo falla, el sistema lo informa sin revelar cuál dato fue el incorrecto.

La sesión se mantiene al recargar la página, y las pantallas protegidas (por ahora, un dashboard mínimo) no se pueden ver sin haber iniciado sesión.

## Por qué

Es el siguiente paso obligatorio después del registro: una cuenta que no puede entrar no sirve de nada, y ninguna funcionalidad posterior (dashboard, búsqueda, solicitud de tutorías) puede existir sin saber quién es el usuario. Además, es lo que hace efectivo el bloqueo por correo no verificado que quedó pendiente en la feature 001, y cierra el enlace "Inicia sesión" que hoy no lleva a ninguna parte.

## Criterios de aceptación

- [ ] Un estudiante con cuenta verificada que ingresa su correo y su contraseña correctos recibe una sesión y es redirigido al dashboard.
- [ ] La sesión se guarda en una cookie que JavaScript no puede leer (`httpOnly`), y la respuesta del login nunca incluye la contraseña ni su hash.
- [ ] Un estudiante que ingresa una contraseña incorrecta ve el mensaje genérico "Correo o contraseña incorrectos", y no se crea ninguna sesión.
- [ ] Un estudiante que ingresa un correo que no tiene cuenta ve exactamente el mismo mensaje y recibe la misma respuesta que con una contraseña incorrecta, sin forma de distinguir cuál de los dos datos falló.
- [ ] Un estudiante con cuenta no verificada que ingresa credenciales correctas no obtiene sesión y ve un mensaje que le indica que debe verificar su correo antes de continuar.
- [ ] Un estudiante con cuenta no verificada que ingresa una contraseña incorrecta ve el mensaje genérico de credenciales inválidas, no el de correo sin verificar (el estado de verificación solo se revela a quien conoce la contraseña).
- [ ] Si el correo no tiene formato de email o algún campo está vacío, el sistema lo señala junto a cada campo antes de enviar y también lo rechaza el servidor.
- [ ] Mientras el formulario se envía, el botón queda deshabilitado y muestra un estado de carga, para evitar envíos duplicados.
- [ ] Un usuario sin sesión que intenta abrir `/dashboard` es redirigido a la pantalla de inicio de sesión.
- [ ] Un usuario con sesión activa que recarga la página sigue autenticado y ve su dashboard con su nombre.
- [ ] Una sesión de más de 7 días se trata como inexistente: el usuario es llevado de nuevo al inicio de sesión.
- [ ] El enlace "¿Ya tienes cuenta? Inicia sesión" de la pantalla de registro lleva a la pantalla de inicio de sesión, y esta tiene un enlace de regreso al registro.
- [ ] La pantalla es usable en móvil y mantiene la identidad visual de la pantalla de registro (tokens, tipografías y layout de `tech-stack.md`).

## Fuera de alcance

- Reenvío del correo de verificación cuando la cuenta no está verificada — queda como feature propia en el backlog (reutilizaría `correo.service.js`).
- Recuperación o cambio de contraseña.
- Límite de intentos fallidos o protección anti fuerza bruta — no está definido en las historias de usuario; queda en backlog/ideas.
- Cerrar sesión — no figura en ninguna historia de usuario todavía.
- Renovación automática de la sesión o "recuérdame": al vencer los 7 días se vuelve a iniciar sesión.
- Inicio de sesión con proveedores externos (Google, etc.).
- El contenido real del dashboard y el acceso al "modo tutor" — es la feature siguiente (DAS-EST-001). Aquí solo existe un dashboard mínimo para que la redirección tenga destino.