import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { buscarPorCorreo, crearUsuario } from "./auth.repository.js";
import { enviarCorreoVerificacion } from "../../shared/email/correo.service.js";

const COSTO_BCRYPT = 10;
const DURACION_TOKEN_HORAS = 24;

export const errorNegocio = (codigo, mensaje, status) =>
  Object.assign(new Error(mensaje), { codigo, status });

export const registrarUsuario = async ({ nombres, apellidos, correo, contrasena }) => {
  const existente = await buscarPorCorreo(correo);
  if (existente) {
    throw errorNegocio("CORREO_DUPLICADO", "Ya existe una cuenta con ese correo", 409);
  }

  const contrasenaHash = await bcrypt.hash(contrasena, COSTO_BCRYPT);
  const tokenVerificacion = randomBytes(32).toString("hex");
  const tokenExpira = new Date(Date.now() + DURACION_TOKEN_HORAS * 60 * 60 * 1000);

  let usuario;
  try {
    usuario = await crearUsuario({
      nombres,
      apellidos,
      correoInstitucional: correo,
      contrasenaHash,
      tokenVerificacion,
      tokenExpira,
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw errorNegocio("CORREO_DUPLICADO", "Ya existe una cuenta con ese correo", 409);
    }
    throw error;
  }

  enviarCorreoVerificacion({
    correo: usuario.correoInstitucional,
    nombres: usuario.nombres,
    token: tokenVerificacion,
  }).catch((error) => {
    console.error("No se pudo enviar el correo de verificación:", error);
  });

  return {
    id: usuario.id,
    correo: usuario.correoInstitucional,
    emailVerificado: usuario.emailVerificado,
  };
};
