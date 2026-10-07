import { errorNegocio, registrarUsuario } from "./auth.service.js";
import { buscarPorToken, marcarCorreoVerificado } from "./auth.repository.js";

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
