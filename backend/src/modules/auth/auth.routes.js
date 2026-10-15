import { Router } from "express";
import {
  registrar,
  verificarCorreo,
  iniciarSesion,
  obtenerSesion,
} from "./auth.controller.js";
import { validar } from "../../shared/middlewares/validar.js";
import { requerirSesion } from "../../shared/middlewares/requerir-sesion.js";
import { esquemaRegistro } from "./registro.schema.js";
import { esquemaLogin } from "./login.schema.js";

const router = Router();

router.post("/registro", validar(esquemaRegistro), registrar);
router.get("/verificar/:token", verificarCorreo);
router.post("/login", validar(esquemaLogin), iniciarSesion);
router.get("/yo", requerirSesion, obtenerSesion);

export default router;
