# 001 · Registro con correo institucional

**Estado:** propuesta

## Qué hace

Permite que un estudiante cree una cuenta en Saber Compartido usando su correo institucional de la UCLA y una contraseña. Al registrarse, recibe un correo de verificación; la cuenta queda en estado "no verificado" hasta que confirme ese enlace.

## Por qué

Es el punto de entrada obligatorio a la plataforma — sin cuenta, nadie puede buscar tutores, solicitar tutorías ni registrarse como tutor. Exigir correo institucional es lo que garantiza que solo estudiantes de la UCLA usen el sistema (ver "Qué NO es" en mission.md: no es un marketplace abierto).

## Criterios de aceptación

- [x] Un estudiante que completa el formulario con sus nombres, apellidos, un correo del dominio institucional de la UCLA (`@amigo.edu.co`) y una contraseña que cumpla la política (mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial) obtiene una cuenta creada y recibe un correo de verificación. _Nota de cierre: los campos originalmente previstos (segundo nombre, segundo apellido, facultad, carrera) quedan fuera de este MVP según plan.md y tasks.md — ver "Campos académicos en el registro" en el roadmap._
- [x] La cuenta creada queda en estado "no verificado" hasta que el estudiante haga clic en el enlace del correo de verificación; a partir de ahí, queda habilitada.
- [x] Un estudiante que intenta registrarse con un correo que no pertenece al dominio institucional ve un mensaje de error claro y la cuenta no se crea.
- [x] Un estudiante que intenta registrarse con un correo ya registrado ve un mensaje indicando que ya existe una cuenta con ese correo, y la cuenta no se duplica.
- [x] Si algún campo obligatorio (correo, contraseña) queda vacío o la contraseña no cumple el mínimo, el sistema lo señala antes de crear la cuenta (validación con Zod, según tech-stack.md).
- [x] El formulario es usable en móvil, siguiendo el enfoque mobile-first definido en tech-stack.md.

## Fuera de alcance

- Inicio de sesión con correo y contraseña ya registrados — es la feature 002 (REG-USR-002).
- Recuperación o cambio de contraseña.
- Edición del perfil después del registro.
- Límite de intentos o protección anti-spam en el formulario.