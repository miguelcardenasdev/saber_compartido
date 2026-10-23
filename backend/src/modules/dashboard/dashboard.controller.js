import { obtenerResumen as servicioObtenerResumen } from "./dashboard.service.js";

export const obtenerResumen = async (req, res, next) => {
  try {
    const resumen = await servicioObtenerResumen(req.usuarioId);
    return res.status(200).json(resumen);
  } catch (error) {
    return next(error);
  }
};
