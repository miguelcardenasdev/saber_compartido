import {
  listarSolicitudes as servicioListarSolicitudes,
  registrarSolicitud as servicioRegistrarSolicitud,
} from "./tutores.service.js";

export const registrarSolicitud = async (req, res, next) => {
  try {
    const resultado = await servicioRegistrarSolicitud(
      req.usuarioId,
      req.body,
      req.file,
    );
    return res.status(201).json({
      mensaje: "Solicitud enviada. Estará pendiente de revisión",
      solicitudes: resultado.solicitudes,
    });
  } catch (error) {
    return next(error);
  }
};

export const listarSolicitudes = async (req, res, next) => {
  try {
    const solicitudes = await servicioListarSolicitudes(req.usuarioId);
    return res.status(200).json(solicitudes);
  } catch (error) {
    return next(error);
  }
};
