import { Router } from "express";
import { obtenerMaterias } from "./materias.controller.js";
import { requerirSesion } from "../../shared/middlewares/requerir-sesion.js";

const router = Router();

router.get("/", requerirSesion, obtenerMaterias);

export default router;
