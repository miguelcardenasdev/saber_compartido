-- ==============================================================================
-- Script de migración / actualización para Workbench
-- Feature: 003-acceso-con-google
-- Cambios en tabla `usuarios`:
--   1. `contrasena_hash` pasa a aceptar NULL (una cuenta creada con Google no
--      tiene contraseña).
--   2. Se agrega `google_sub` VARCHAR(255) NULL UNIQUE: el identificador
--      estable de la cuenta de Google con el que se vincula la cuenta.
--      (MySQL permite múltiples NULL en columnas UNIQUE, así que las cuentas
--      sin Google no chocan entre sí.)
-- ==============================================================================

ALTER TABLE usuarios
  MODIFY COLUMN contrasena_hash VARCHAR(255) NULL,
  ADD COLUMN google_sub VARCHAR(255) NULL AFTER contrasena_hash,
  ADD UNIQUE KEY uq_usuarios_google_sub (google_sub);
