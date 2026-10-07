import { ZodError } from "zod";
import { detalleDeIssues } from "./validar.js";

export const errorHandler = (error, req, res, next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      mensaje: "Datos inválidos",
      detalle: detalleDeIssues(error.issues),
    });
  }

  if (error.codigo && error.status) {
    return res.status(error.status).json({
      codigo: error.codigo,
      mensaje: error.message,
    });
  }

  if (error.code === "P2002") {
    return res.status(409).json({
      codigo: "CORREO_DUPLICADO",
      mensaje: "Ya existe una cuenta con ese correo",
    });
  }

  console.error(error);
  return res.status(500).json({
    codigo: "ERROR_INTERNO",
    mensaje: "Ocurrió un error inesperado. Inténtalo más tarde",
  });
};

export default errorHandler;
