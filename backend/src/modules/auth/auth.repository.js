import { prisma } from "../../shared/prisma/client.js";

export const buscarPorCorreo = async (correo) => {
  return prisma.usuarios.findUnique({
    where: { correoInstitucional: correo },
  });
};

export const buscarPorId = async (id) => {
  return prisma.usuarios.findUnique({
    where: { id },
  });
};

export const buscarPorToken = async (token) => {
  return prisma.usuarios.findUnique({
    where: { tokenVerificacion: token },
  });
};

export const buscarPorGoogleSub = async (googleSub) => {
  return prisma.usuarios.findUnique({
    where: { googleSub },
  });
};

export const crearUsuario = async ({
  nombres,
  apellidos,
  correoInstitucional,
  contrasenaHash,
  tokenVerificacion,
  tokenExpira,
}) => {
  return prisma.usuarios.create({
    data: {
      nombres,
      apellidos,
      correoInstitucional,
      contrasenaHash,
      tokenVerificacion,
      tokenExpira,
    },
  });
};

export const crearUsuarioGoogle = async ({
  nombres,
  apellidos,
  correoInstitucional,
  googleSub,
}) => {
  return prisma.usuarios.create({
    data: {
      nombres,
      apellidos,
      correoInstitucional,
      googleSub,
      emailVerificado: true,
    },
  });
};

export const vincularGoogle = async (id, { googleSub, sinPassword = false }) => {
  return prisma.usuarios.update({
    where: { id },
    data: {
      googleSub,
      ...(sinPassword && {
        contrasenaHash: null,
        tokenVerificacion: null,
        tokenExpira: null,
      }),
    },
  });
};

export const marcarCorreoVerificado = async (id) => {
  return prisma.usuarios.update({
    where: { id },
    data: {
      emailVerificado: true,
    },
  });
};
