-- ==============================================================================
-- Script de migración / actualización para Workbench
-- Feature: 001-registro-institucional
-- Tarea 1.1: Columnas para verificación de correo en tabla `usuarios`
-- ==============================================================================

ALTER TABLE usuarios
  ADD COLUMN email_verificado TINYINT(1) NOT NULL DEFAULT 0 AFTER rol,
  ADD COLUMN token_verificacion VARCHAR(255) NULL AFTER email_verificado,
  ADD COLUMN token_expira DATETIME NULL AFTER token_verificacion;

-- Índices recomendados para optimizar la búsqueda por token de verificación
CREATE INDEX idx_usuarios_token_verificacion ON usuarios (token_verificacion);
