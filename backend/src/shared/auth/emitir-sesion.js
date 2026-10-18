import { config } from "../../config/index.js";

export const emitirSesion = (res, token) => {
  res.cookie(config.sesion.nombreCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.sesion.secure,
    maxAge: config.sesion.duracionSegundos * 1000,
    path: "/",
  });
};

export default emitirSesion;
