-- ==============================================================================
-- Script de migración / actualización para Workbench
-- Feature: 001-registro-institucional
-- Cambio: `token_verificacion` pasa a UNIQUE para garantizar a nivel de base de
--         datos que un token identifique exactamente una cuenta.
--         (MySQL permite múltiples NULL en columnas UNIQUE, así que los
--          usuarios ya verificados —token limpiado— no chocan entre sí.)
-- ==============================================================================

ALTER TABLE usuarios
  DROP INDEX idx_usuarios_token_verificacion,
  ADD UNIQUE KEY uq_usuarios_token_verificacion (token_verificacion);
