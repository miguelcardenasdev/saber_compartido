import jwt from "jsonwebtoken";
import { config } from "../../config/index.js";
import { errorNegocio } from "../errores/error-negocio.js";

const sesionInvalida = () =>
  errorNegocio(
    "SESION_INVALIDA",
    "Tu sesión ya no es válida. Inicia sesión de nuevo",
    401,
  );

export const requerirSesion = (req, res, next) => {
  const token = req.cookies?.[config.sesion.nombreCookie];
  if (!token) return next(sesionInvalida());

  try {
    const payload = jwt.verify(token, config.sesion.secreto, {
      algorithms: ["HS256"],
    });

    const usuarioId = Number(payload.sub);
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      return next(sesionInvalida());
    }

    req.usuarioId = usuarioId;
    return next();
  } catch {
    return next(sesionInvalida());
  }
};

export default requerirSesion;
