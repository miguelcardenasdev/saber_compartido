import { Router } from "express";
import { registrar, verificarCorreo } from "./auth.controller.js";
import { validar } from "../../shared/middlewares/validar.js";
import { esquemaRegistro } from "./registro.schema.js";

const router = Router();

router.post("/registro", validar(esquemaRegistro), registrar);
router.get("/verificar/:token", verificarCorreo);

export default router;
