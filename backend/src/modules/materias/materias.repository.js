import { prisma } from "../../shared/prisma/client.js";

export const buscarTodas = async () => {
  return prisma.materias.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  });
};
