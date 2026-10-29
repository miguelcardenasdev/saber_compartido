import { obtenerMaterias as servicioObtenerMaterias } from "./materias.service.js";

export const obtenerMaterias = async (req, res, next) => {
  try {
    const materias = await servicioObtenerMaterias();
    return res.status(200).json(materias);
  } catch (error) {
    return next(error);
  }
};
