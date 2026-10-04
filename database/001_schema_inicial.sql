-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema saber_compartido
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema saber_compartido
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `saber_compartido` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
USE `saber_compartido` ;

-- -----------------------------------------------------
-- Table `saber_compartido`.`usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `saber_compartido`.`usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombres` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(100) NOT NULL,
  `correo_institucional` VARCHAR(150) NOT NULL,
  `contrasena_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('estudiante', 'tutor', 'administrador') NOT NULL DEFAULT 'estudiante',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `correo_institucional` (`correo_institucional` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `saber_compartido`.`materias`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `saber_compartido`.`materias` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `nombre` (`nombre` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `saber_compartido`.`sesiones_grupales`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `saber_compartido`.`sesiones_grupales` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tutor_id` INT UNSIGNED NOT NULL,
  `materia_id` INT UNSIGNED NOT NULL,
  `titulo` VARCHAR(150) NOT NULL,
  `descripcion` TEXT NULL DEFAULT NULL,
  `fecha_hora_sesion` DATETIME NOT NULL,
  `cupo` SMALLINT UNSIGNED NOT NULL,
  `estado` ENUM('abierta', 'llena', 'cancelada', 'completada') NOT NULL DEFAULT 'abierta',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_sg_tutor` (`tutor_id` ASC) VISIBLE,
  INDEX `fk_sg_materia` (`materia_id` ASC) VISIBLE,
  INDEX `idx_sesiones_grupales_fecha` (`fecha_hora_sesion` ASC) VISIBLE,
  INDEX `idx_sesiones_grupales_estado` (`estado` ASC) VISIBLE,
  CONSTRAINT `fk_sg_materia`
    FOREIGN KEY (`materia_id`)
    REFERENCES `saber_compartido`.`materias` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_sg_tutor`
    FOREIGN KEY (`tutor_id`)
    REFERENCES `saber_compartido`.`usuarios` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `saber_compartido`.`disponibilidad_tutores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `saber_compartido`.`disponibilidad_tutores` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tutor_id` INT UNSIGNED NOT NULL,
  `fecha` DATE NOT NULL COMMENT '0=Domingo ... 6=Sábado',
  `hora_inicio` TIME NOT NULL,
  `hora_fin` TIME NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT '1',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_disponibilidad_tutor_dia` (`tutor_id` ASC, `fecha` ASC) VISIBLE,
  CONSTRAINT `fk_disp_tutor`
    FOREIGN KEY (`tutor_id`)
    REFERENCES `saber_compartido`.`usuarios` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `saber_compartido`.`solicitudes_tutoria`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `saber_compartido`.`solicitudes_tutoria` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `estudiante_id` INT UNSIGNED NOT NULL,
  `tutor_id` INT UNSIGNED NOT NULL,
  `materia_id` INT UNSIGNED NOT NULL,
  `disponibilidad_id` INT UNSIGNED NOT NULL,
  `fecha_hora_solicitud` DATETIME NOT NULL,
  `mensaje` TEXT NULL DEFAULT NULL,
  `estado` ENUM('pendiente', 'aceptada', 'rechazada', 'completada', 'cancelada') NOT NULL DEFAULT 'pendiente',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_st_estudiante` (`estudiante_id` ASC) VISIBLE,
  INDEX `fk_st_tutor` (`tutor_id` ASC) VISIBLE,
  INDEX `fk_st_materia` (`materia_id` ASC) VISIBLE,
  INDEX `idx_solicitudes_tutoria_estado` (`estado` ASC) VISIBLE,
  INDEX `idx_solicitudes_tutoria_fecha` (`fecha_hora_solicitud` ASC) VISIBLE,
  INDEX `idx_st_disponibilidad` (`disponibilidad_id` ASC) VISIBLE,
  CONSTRAINT `fk_st_disponibilidad`
    FOREIGN KEY (`disponibilidad_id`)
    REFERENCES `saber_compartido`.`disponibilidad_tutores` (`id`),
  CONSTRAINT `fk_st_estudiante`
    FOREIGN KEY (`estudiante_id`)
    REFERENCES `saber_compartido`.`usuarios` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_st_materia`
    FOREIGN KEY (`materia_id`)
    REFERENCES `saber_compartido`.`materias` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_st_tutor`
    FOREIGN KEY (`tutor_id`)
    REFERENCES `saber_compartido`.`usuarios` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `saber_compartido`.`calificaciones`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `saber_compartido`.`calificaciones` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `solicitud_tutoria_id` INT UNSIGNED NULL DEFAULT NULL,
  `sesion_grupal_id` INT UNSIGNED NULL DEFAULT NULL,
  `estudiante_id` INT UNSIGNED NOT NULL,
  `tutor_id` INT UNSIGNED NOT NULL,
  `calificacion` TINYINT UNSIGNED NOT NULL,
  `comentario` TEXT NULL DEFAULT NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_calificacion_solicitud` (`estudiante_id` ASC, `solicitud_tutoria_id` ASC) VISIBLE,
  UNIQUE INDEX `uq_calificacion_sesion` (`estudiante_id` ASC, `sesion_grupal_id` ASC) VISIBLE,
  INDEX `fk_cal_solicitud` (`solicitud_tutoria_id` ASC) VISIBLE,
  INDEX `fk_cal_sesion` (`sesion_grupal_id` ASC) VISIBLE,
  INDEX `fk_cal_tutor` (`tutor_id` ASC) VISIBLE,
  CONSTRAINT `fk_cal_estudiante`
    FOREIGN KEY (`estudiante_id`)
    REFERENCES `saber_compartido`.`usuarios` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_cal_sesion`
    FOREIGN KEY (`sesion_grupal_id`)
    REFERENCES `saber_compartido`.`sesiones_grupales` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_cal_solicitud`
    FOREIGN KEY (`solicitud_tutoria_id`)
    REFERENCES `saber_compartido`.`solicitudes_tutoria` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_cal_tutor`
    FOREIGN KEY (`tutor_id`)
    REFERENCES `saber_compartido`.`usuarios` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `saber_compartido`.`tutores_materias`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `saber_compartido`.`tutores_materias` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tutor_id` INT UNSIGNED NOT NULL,
  `materia_id` INT UNSIGNED NOT NULL,
  `promedio_academico` DECIMAL(3,2) NOT NULL,
  `estado` ENUM('pendiente', 'aprobado', 'rechazado') NOT NULL DEFAULT 'pendiente',
  `revisado_por` INT UNSIGNED NULL DEFAULT NULL,
  `revisado_en` TIMESTAMP NULL DEFAULT NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_tutor_materia` (`tutor_id` ASC, `materia_id` ASC) VISIBLE,
  INDEX `fk_tm_materia` (`materia_id` ASC) VISIBLE,
  INDEX `fk_tm_admin` (`revisado_por` ASC) VISIBLE,
  INDEX `idx_tutores_materias_estado` (`estado` ASC) VISIBLE,
  CONSTRAINT `fk_tm_admin`
    FOREIGN KEY (`revisado_por`)
    REFERENCES `saber_compartido`.`usuarios` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_tm_materia`
    FOREIGN KEY (`materia_id`)
    REFERENCES `saber_compartido`.`materias` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_tm_tutor`
    FOREIGN KEY (`tutor_id`)
    REFERENCES `saber_compartido`.`usuarios` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `saber_compartido`.`documentos_verificacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `saber_compartido`.`documentos_verificacion` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tutor_materia_id` INT UNSIGNED NOT NULL,
  `url_archivo` VARCHAR(500) NOT NULL,
  `subido_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ia_nombre_extraido` VARCHAR(150) NULL DEFAULT NULL,
  `ia_primer_apellido_extraido` VARCHAR(150) NULL DEFAULT NULL,
  `ia_segundo_apellido_extraido` VARCHAR(150) NULL DEFAULT NULL,
  `ia_materia_extraida` VARCHAR(150) NULL DEFAULT NULL,
  `ia_promedio_extraido` DECIMAL(3,2) NULL DEFAULT NULL,
  `ia_firma_detectada` TINYINT(1) NULL DEFAULT NULL,
  `ia_alertas` JSON NULL DEFAULT NULL,
  `ia_procesado_en` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_dv_tutor_materia` (`tutor_materia_id` ASC) VISIBLE,
  CONSTRAINT `fk_dv_tutor_materia`
    FOREIGN KEY (`tutor_materia_id`)
    REFERENCES `saber_compartido`.`tutores_materias` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `saber_compartido`.`inscripciones_sesion_grupal`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `saber_compartido`.`inscripciones_sesion_grupal` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sesion_grupal_id` INT UNSIGNED NOT NULL,
  `estudiante_id` INT UNSIGNED NOT NULL,
  `inscrito_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` ENUM('confirmada', 'cancelada') NOT NULL DEFAULT 'confirmada',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_sesion_estudiante` (`sesion_grupal_id` ASC, `estudiante_id` ASC) VISIBLE,
  INDEX `fk_isg_estudiante` (`estudiante_id` ASC) VISIBLE,
  CONSTRAINT `fk_isg_estudiante`
    FOREIGN KEY (`estudiante_id`)
    REFERENCES `saber_compartido`.`usuarios` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_isg_sesion`
    FOREIGN KEY (`sesion_grupal_id`)
    REFERENCES `saber_compartido`.`sesiones_grupales` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
