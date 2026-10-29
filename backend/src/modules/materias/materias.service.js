import { buscarTodas } from "./materias.repository.js";

export const obtenerMaterias = async () => {
  const materias = await buscarTodas();
  return materias.map(({ id, nombre }) => ({ id, nombre }));
};
