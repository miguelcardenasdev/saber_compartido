import {
  contarSolicitudesProgramadas,
  sumarHorasAceptadas,
  contarPendientesPorCalificar,
  buscarProximasTutorias,
} from "./dashboard.repository.js";

export const obtenerResumen = async (estudianteId) => {
  const [tutoriasProgramadas, segundosAceptados, pendientesPorCalificar, proximas] =
    await Promise.all([
      contarSolicitudesProgramadas(estudianteId),
      sumarHorasAceptadas(estudianteId),
      contarPendientesPorCalificar(estudianteId),
      buscarProximasTutorias(estudianteId),
    ]);

  return {
    tutoriasProgramadas,
    horasAprendizaje: Number((segundosAceptados / 3600).toFixed(1)),
    tutoresFavoritos: 0,
    pendientesPorCalificar,
    proximasTutorias: proximas.map((solicitud) => ({
      id: solicitud.id,
      estado: solicitud.estado,
      fecha: solicitud.disponibilidad.fecha,
      horaInicio: solicitud.disponibilidad.horaInicio,
      horaFin: solicitud.disponibilidad.horaFin,
      materia: solicitud.materias.nombre,
      tutor: {
        id: solicitud.usuarios_solicitudes_tutoria_tutor_idTousuarios.id,
        nombres: solicitud.usuarios_solicitudes_tutoria_tutor_idTousuarios.nombres,
        apellidos: solicitud.usuarios_solicitudes_tutoria_tutor_idTousuarios.apellidos,
      },
    })),
    tutoresRecomendados: [],
    actividadReciente: [],
  };
};
