import { Router } from "express";
import { obtenerResumen } from "./dashboard.controller.js";
import { requerirSesion } from "../../shared/middlewares/requerir-sesion.js";

const router = Router();

router.get("/resumen", requerirSesion, obtenerResumen);

export default router;
