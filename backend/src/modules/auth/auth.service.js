import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import {
  buscarPorCorreo,
  buscarPorId,
  buscarPorGoogleSub,
  crearUsuario,
  crearUsuarioGoogle,
  vincularGoogle,
} from "./auth.repository.js";
import { errorNegocio } from "../../shared/errores/error-negocio.js";
import { enviarCorreoVerificacion } from "../../shared/email/correo.service.js";
import { config } from "../../config/index.js";

const COSTO_BCRYPT = 10;
const DURACION_TOKEN_HORAS = 24;

const HASH_RELLENO =
  "$2b$10$TW4DSQH.SfpcaDacuu381O58IteGKSbYdRRIG56BfpQs5k3tSrfjS";

const DOMINIO_CORREO = "@amigo.edu.co";
const DOMINIO_HD = "amigo.edu.co";

const clienteGoogle = new OAuth2Client({ clientId: config.google.idCliente });

const presentarUsuario = (usuario) => ({
  id: usuario.id,
  nombres: usuario.nombres,
  apellidos: usuario.apellidos,
  correo: usuario.correoInstitucional,
  rol: usuario.rol,
});

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

export const iniciarSesion = async ({ correo, contrasena }) => {
  const usuario = await buscarPorCorreo(correo);

  const coincide = await bcrypt.compare(
    contrasena,
    usuario?.contrasenaHash ?? HASH_RELLENO,
  );

  if (!usuario || !coincide) {
    throw errorNegocio(
      "CREDENCIALES_INVALIDAS",
      "Correo o contraseña incorrectos",
      401,
    );
  }

  if (!usuario.emailVerificado) {
    throw errorNegocio(
      "CORREO_NO_VERIFICADO",
      "Tu correo aún no está verificado. Revisa tu bandeja de entrada antes de iniciar sesión",
      403,
    );
  }

  const token = jwt.sign({ sub: usuario.id }, config.sesion.secreto, {
    algorithm: "HS256",
    expiresIn: config.sesion.duracionSegundos,
  });

  return {
    token,
    usuario: presentarUsuario(usuario),
  };
};

export const obtenerSesion = async (usuarioId) => {
  const usuario = await buscarPorId(usuarioId);

  if (!usuario) {
    throw errorNegocio(
      "SESION_INVALIDA",
      "Tu sesión ya no es válida. Inicia sesión de nuevo",
      401,
    );
  }

  return presentarUsuario(usuario);
};

export const validarIdTokenGoogle = async (idToken) => {
  let payload;
  try {
    const ticket = await clienteGoogle.verifyIdToken({
      idToken,
      audience: config.google.idCliente,
    });
    payload = ticket.getPayload();
  } catch {
    throw errorNegocio(
      "ERROR_GOOGLE",
      "No pudimos validar el acceso con Google. Inténtalo de nuevo",
      401,
    );
  }

  const correo = (payload?.email ?? "").toLowerCase();
  const correoVerificado = payload?.email_verified === true;
  const hd = payload?.hd;
  const googleSub = payload?.sub;

  if (
    !googleSub ||
    !correoVerificado ||
    !correo.endsWith(DOMINIO_CORREO) ||
    hd !== DOMINIO_HD
  ) {
    throw errorNegocio(
      "DOMINIO_NO_PERMITIDO",
      "Solo se permite el acceso con una cuenta institucional @amigo.edu.co",
      403,
    );
  }

  return {
    googleSub,
    correo,
    nombres: payload.given_name ?? "",
    apellidos: payload.family_name ?? "",
  };
};

export const resolverCuentaGoogle = async ({ googleSub, correo, nombres, apellidos }) => {
  const porGoogle = await buscarPorGoogleSub(googleSub);
  if (porGoogle) return porGoogle;

  const porCorreo = await buscarPorCorreo(correo);
  if (porCorreo) {
    return vincularGoogle(porCorreo.id, {
      googleSub,
      sinPassword: !porCorreo.emailVerificado,
    });
  }

  return crearUsuarioGoogle({
    nombres,
    apellidos,
    correoInstitucional: correo,
    googleSub,
  });
};
