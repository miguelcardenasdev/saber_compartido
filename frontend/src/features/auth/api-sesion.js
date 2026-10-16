export const obtenerSesion = async () => {
  const respuesta = await fetch("/api/auth/yo", {
    credentials: "same-origin",
  });

  const cuerpo = await respuesta.json().catch(() => null);

  if (respuesta.ok) return cuerpo?.usuario ?? null;

  if (respuesta.status === 401) return null;

  throw Object.assign(
    new Error(cuerpo?.mensaje ?? "No pudimos comprobar tu sesión"),
    {
      codigo: cuerpo?.codigo,
      detalle: cuerpo?.detalle,
      status: respuesta.status,
    },
  );
};
