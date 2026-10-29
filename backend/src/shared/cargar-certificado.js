import multer from "multer";
import { errorNegocio } from "./errores/error-negocio.js";

const LIMITE_BYTES = 5 * 1024 * 1024;

const carga = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITE_BYTES, files: 1 },
}).single("certificado");

const FIRMAS = {
  pdf: [0x25, 0x50, 0x44, 0x46],
  jpg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
};

const detectarTipoReal = (contenido) => {
  for (const [tipo, firma] of Object.entries(FIRMAS)) {
    if (contenido.length < firma.length) continue;
    if (firma.every((byte, indice) => contenido[indice] === byte)) {
      return tipo === "jpg" ? "image/jpeg" : tipo === "png" ? "image/png" : "application/pdf";
    }
  }
  return null;
};

const traducirErrorMulter = (error) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return errorNegocio(
        "ARCHIVO_MUY_GRANDE",
        "El certificado no puede superar los 5 MB",
        400,
      );
    }
    return errorNegocio(
      "ARCHIVO_INVALIDO",
      "No pudimos recibir el archivo. Intenta de nuevo",
      400,
    );
  }
  return error;
};

export const cargarCertificado = (req, res, next) => {
  carga(req, res, (error) => {
    if (error) return next(traducirErrorMulter(error));

    if (!req.file) {
      return next(
        errorNegocio(
          "ARCHIVO_REQUERIDO",
          "Adjunta tu certificado de notas (PDF, JPG o PNG)",
          400,
        ),
      );
    }

    const tipoReal = detectarTipoReal(req.file.buffer);
    if (!tipoReal) {
      return next(
        errorNegocio(
          "ARCHIVO_TIPO_INVALIDO",
          "El certificado debe ser un archivo PDF, JPG o PNG válido",
          400,
        ),
      );
    }

    req.file.tipoReal = tipoReal;

    if (typeof req.body.materias === "string") {
      try {
        req.body.materias = JSON.parse(req.body.materias);
      } catch {
        return next(
          errorNegocio(
            "MATERIAS_INVALIDAS",
            "Las materias enviadas no son válidas",
            400,
          ),
        );
      }
    }

    return next();
  });
};

export default cargarCertificado;
