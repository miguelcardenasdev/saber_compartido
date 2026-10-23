export const obtenerResumen = async () => {
  const respuesta = await fetch("/api/dashboard/resumen", {
    credentials: "same-origin",
  });

  const cuerpo = await respuesta.json().catch(() => null);

  if (respuesta.ok) return cuerpo;

  throw Object.assign(
    new Error(cuerpo?.mensaje ?? "No pudimos cargar tu resumen"),
    {
      codigo: cuerpo?.codigo,
      detalle: cuerpo?.detalle,
      status: respuesta.status,
    },
  );
};
