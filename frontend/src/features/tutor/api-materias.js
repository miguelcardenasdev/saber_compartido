export const obtenerMaterias = async () => {
  const respuesta = await fetch("/api/materias", {
    credentials: "same-origin",
  });

  const cuerpo = await respuesta.json().catch(() => null);

  if (respuesta.ok) return cuerpo;

  throw Object.assign(
    new Error(cuerpo?.mensaje ?? "No pudimos cargar las materias"),
    {
      codigo: cuerpo?.codigo,
      detalle: cuerpo?.detalle,
      status: respuesta.status,
    },
  );
};
