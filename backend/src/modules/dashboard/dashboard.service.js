import {
  contarSolicitudesProgramadas,
  sumarHorasAceptadas,
  contarPendientesPorCalificar,
  buscarProximasTutorias,
} from "./dashboard.repository.js";

const aFecha = (valor) => (valor instanceof Date ? valor : new Date(valor));

const formatearFecha = (valor) => {
  const d = aFecha(valor);
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${mes}-${dia}`;
};

const formatearHora = (valor) => {
  const d = aFecha(valor);
  const horas = String(d.getUTCHours()).padStart(2, "0");
  const minutos = String(d.getUTCMinutes()).padStart(2, "0");
  return `${horas}:${minutos}`;
};

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
      fecha: formatearFecha(solicitud.disponibilidad_tutores.fecha),
      horaInicio: formatearHora(solicitud.disponibilidad_tutores.horaInicio),
      horaFin: formatearHora(solicitud.disponibilidad_tutores.horaFin),
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
