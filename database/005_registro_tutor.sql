-- ==============================================================================
-- Script de migración / actualización para Workbench
-- Feature: 006-registro-tutor
-- Cambios:
--   1. Nueva tabla `archivos_certificado`: guarda los bytes del certificado de
--      notas en la base de datos (el disco de Railway es efímero y el MVP no
--      justifica un servicio de almacenamiento externo). Un solo archivo por
--      envío, compartido por todas las materias de ese envío.
--   2. `documentos_verificacion.archivo_id`: FK NULL a `archivos_certificado`
--      que enlaza cada documento con el archivo que lo respalda; las
--      resubmisiones conservan historial porque cada solicitud crea su propia
--      fila apuntando al mismo archivo.
--   3. `tutores_materias.descripcion`: descripción opcional (máx. 500
--      caracteres) que el tutor acompaña a su solicitud, repetida en cada
--      fila del mismo envío.
--   4. UNIQUE (tutor_id, materia_id): YA EXISTE desde `001_schema_inicial.sql`
--      como `uq_tutor_materia` (verificado con SHOW INDEX antes de crear este
--      script; la tabla estaba vacía o sin duplicados). Se deja documentado
--      que, si algún día faltara, debe crearse solo tras comprobar que no hay
--      duplicados:
--
--        -- Verificar antes:
--        -- SELECT tutor_id, materia_id, COUNT(*) FROM tutores_materias
--        --   GROUP BY tutor_id, materia_id HAVING COUNT(*) > 1;
--        -- ALTER TABLE tutores_materias
--        --   ADD UNIQUE KEY uq_tutor_materia (tutor_id, materia_id);
-- ==============================================================================

CREATE TABLE IF NOT EXISTS archivos_certificado (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NOT NULL,
  nombre_original VARCHAR(255) NOT NULL,
  tipo_mime VARCHAR(100) NOT NULL,
  tamano_bytes INT UNSIGNED NOT NULL,
  contenido LONGBLOB NOT NULL,
  subido_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_ac_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE documentos_verificacion
  ADD COLUMN archivo_id INT UNSIGNED NULL AFTER url_archivo,
  ADD CONSTRAINT fk_dv_archivo FOREIGN KEY (archivo_id)
    REFERENCES archivos_certificado (id)
    ON DELETE SET NULL;

ALTER TABLE tutores_materias
  ADD COLUMN descripcion VARCHAR(500) NULL AFTER promedio_academico;
