import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import {
  registrarUsuario,
  iniciarSesion as servicioIniciarSesion,
  obtenerSesion as servicioObtenerSesion,
  canjearCodigoGoogle,
  iniciarSesionConGoogle,
} from "./auth.service.js";
import { errorNegocio } from "../../shared/errores/error-negocio.js";
import { buscarPorToken, marcarCorreoVerificado } from "./auth.repository.js";
import { emitirSesion } from "../../shared/auth/emitir-sesion.js";
import { esquemaCallbackGoogle } from "./google.schema.js";
import { config } from "../../config/index.js";

const URL_AUTORIZACION_GOOGLE = "https://accounts.google.com/o/oauth2/v2/auth";
const COOKIE_OAUTH_GOOGLE = "google_oauth";
const DURACION_OAUTH_SEGUNDOS = 10 * 60;
const SCOPES_GOOGLE = "openid email profile";

export const registrar = async (req, res, next) => {
  try {
    const usuario = await registrarUsuario(req.body);
    return res.status(201).json({
      mensaje: "Cuenta creada. Revisa tu correo para verificarla.",
      usuario,
    });
  } catch (error) {
    return next(error);
  }
};

export const verificarCorreo = async (req, res, next) => {
  try {
    const { token } = req.params;
    const usuario = token ? await buscarPorToken(token) : null;

    if (!usuario) {
      throw errorNegocio("TOKEN_INVALIDO", "El enlace de verificación no es válido", 400);
    }

    if (usuario.emailVerificado) {
      return res.status(200).json({
        codigo: "YA_VERIFICADO",
        mensaje: "Tu correo ya estaba verificado",
      });
    }

    if (!usuario.tokenExpira || usuario.tokenExpira.getTime() < Date.now()) {
      throw errorNegocio(
        "TOKEN_EXPIRADO",
        "El enlace de verificación expiró. Solicita uno nuevo",
        400,
      );
    }

    await marcarCorreoVerificado(usuario.id);
    return res.status(200).json({
      codigo: "CORREO_VERIFICADO",
      mensaje: "Tu correo quedó verificado. Ya puedes iniciar sesión",
    });
  } catch (error) {
    return next(error);
  }
};

export const iniciarSesion = async (req, res, next) => {
  try {
    const { token, usuario } = await servicioIniciarSesion(req.body);

    emitirSesion(res, token);

    return res.status(200).json({ usuario });
  } catch (error) {
    return next(error);
  }
};

export const obtenerSesion = async (req, res, next) => {
  try {
    const usuario = await servicioObtenerSesion(req.usuarioId);
    return res.status(200).json({ usuario });
  } catch (error) {
    return next(error);
  }
};

export const cerrarSesion = (req, res) => {
  res.clearCookie(config.sesion.nombreCookie, { path: "/" });
  return res.status(200).json({ mensaje: "Sesión cerrada" });
};

export const iniciarGoogle = (req, res, next) => {
  try {
    const verificador = randomBytes(32).toString("base64url");
    const desafio = createHash("sha256").update(verificador).digest("base64url");
    const state = randomBytes(32).toString("base64url");

    const cookieFirmada = jwt.sign(
      { state, verificador },
      config.sesion.secreto,
      { algorithm: "HS256", expiresIn: DURACION_OAUTH_SEGUNDOS },
    );

    res.cookie(COOKIE_OAUTH_GOOGLE, cookieFirmada, {
      httpOnly: true,
      sameSite: "lax",
      secure: config.sesion.secure,
      maxAge: DURACION_OAUTH_SEGUNDOS * 1000,
      path: "/api/auth",
    });

    const parametros = new URLSearchParams({
      client_id: config.google.idCliente,
      redirect_uri: config.google.uriRedireccion,
      response_type: "code",
      scope: SCOPES_GOOGLE,
      state,
      code_challenge: desafio,
      code_challenge_method: "S256",
      hd: "amigo.edu.co",
    });

    return res.redirect(`${URL_AUTORIZACION_GOOGLE}?${parametros.toString()}`);
  } catch (error) {
    return next(error);
  }
};

export const callbackGoogle = async (req, res) => {
  const redirigirAlLogin = (codigo) =>
    res.redirect(`${config.urlFrontend}/iniciar-sesion?error=${codigo}`);

  try {
    res.clearCookie(COOKIE_OAUTH_GOOGLE, { path: "/api/auth" });

    if (req.query.error) {
      const codigo =
        req.query.error === "access_denied" ? "ACCESO_CANCELADO" : "ERROR_GOOGLE";
      return redirigirAlLogin(codigo);
    }

    const resultado = esquemaCallbackGoogle.safeParse(req.query);
    if (!resultado.success) {
      return redirigirAlLogin("ERROR_GOOGLE");
    }
    const { code, state } = resultado.data;

    const cookie = req.cookies?.[COOKIE_OAUTH_GOOGLE];
    let payload;
    try {
      payload = jwt.verify(cookie ?? "", config.sesion.secreto, {
        algorithms: ["HS256"],
      });
    } catch {
      return redirigirAlLogin("ERROR_GOOGLE");
    }

    if (!payload?.state || payload.state !== state || !payload.verificador) {
      return redirigirAlLogin("ERROR_GOOGLE");
    }

    const idToken = await canjearCodigoGoogle({
      code,
      codeVerifier: payload.verificador,
    });
    const { token, usuario } = await iniciarSesionConGoogle(idToken);

    emitirSesion(res, token);
    return res.redirect(`${config.urlFrontend}/dashboard`);
  } catch (error) {
    console.error("Fallo el callback de Google:", error);
    const codigo = [
      "DOMINIO_NO_PERMITIDO",
      "ACCESO_CANCELADO",
      "ERROR_GOOGLE",
    ].includes(error.codigo)
      ? error.codigo
      : "ERROR_GOOGLE";
    return redirigirAlLogin(codigo);
  }
};
