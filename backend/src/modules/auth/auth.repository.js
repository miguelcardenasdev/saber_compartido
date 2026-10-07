import { prisma } from "../../shared/prisma/client.js";

export const buscarPorCorreo = async (correo) => {
  return prisma.usuarios.findUnique({
    where: { correoInstitucional: correo },
  });
};

export const buscarPorToken = async (token) => {
  return prisma.usuarios.findUnique({
    where: { tokenVerificacion: token },
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

export const marcarCorreoVerificado = async (id) => {
  return prisma.usuarios.update({
    where: { id },
    data: {
      emailVerificado: true,
      tokenVerificacion: null,
      tokenExpira: null,
    },
  });
};
