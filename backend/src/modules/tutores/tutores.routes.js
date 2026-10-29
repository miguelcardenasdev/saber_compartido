import { Router } from "express";
import { listarSolicitudes, registrarSolicitud } from "./tutores.controller.js";
import { requerirSesion } from "../../shared/middlewares/requerir-sesion.js";
import { cargarCertificado } from "../../shared/cargar-certificado.js";
import { validar } from "../../shared/middlewares/validar.js";
import { esquemaSolicitudTutor } from "./tutores.schema.js";

const router = Router();

router.get("/solicitudes", requerirSesion, listarSolicitudes);
router.post(
  "/solicitudes",
  requerirSesion,
  cargarCertificado,
  validar(esquemaSolicitudTutor),
  registrarSolicitud,
);

export default router;
