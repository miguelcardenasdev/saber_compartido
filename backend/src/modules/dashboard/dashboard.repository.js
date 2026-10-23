import { prisma } from "../../shared/prisma/client.js";

export const contarSolicitudesProgramadas = async (estudianteId) => {
  return prisma.solicitudes_tutoria.count({
    where: {
      estudianteId,
      estado: { in: ["pendiente", "aceptada"] },
    },
  });
};

export const sumarHorasAceptadas = async (estudianteId) => {
  const solicitudes = await prisma.solicitudes_tutoria.findMany({
    where: { estudianteId, estado: "aceptada" },
    select: { disponibilidad: { select: { horaInicio: true, horaFin: true } } },
  });

  return solicitudes.reduce((total, solicitud) => {
    const { horaInicio, horaFin } = solicitud.disponibilidad;
    const milisegundos = new Date(horaFin).getTime() - new Date(horaInicio).getTime();
    return total + Math.max(milisegundos, 0);
  }, 0);
};

export const contarPendientesPorCalificar = async (estudianteId) => {
  return prisma.solicitudes_tutoria.count({
    where: {
      estudianteId,
      estado: "completada",
      calificaciones: { none: {} },
    },
  });
};

export const buscarProximasTutorias = async (estudianteId) => {
  return prisma.solicitudes_tutoria.findMany({
    where: { estudianteId, estado: "aceptada" },
    include: {
      materias: { select: { nombre: true } },
      usuarios_solicitudes_tutoria_tutor_idTousuarios: {
        select: { id: true, nombres: true, apellidos: true },
      },
      disponibilidad: { select: { fecha: true, horaInicio: true, horaFin: true } },
    },
    orderBy: { disponibilidad: { fecha: "asc" } },
    take: 3,
  });
};
