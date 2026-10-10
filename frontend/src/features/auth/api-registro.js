export const registrarCuenta = async (datos) => {
  const respuesta = await fetch("/api/auth/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  const cuerpo = await respuesta.json().catch(() => null);

  if (respuesta.ok) return cuerpo ?? {};

  throw Object.assign(
    new Error(cuerpo?.mensaje ?? "No pudimos crear tu cuenta"),
    {
      codigo: cuerpo?.codigo,
      detalle: cuerpo?.detalle,
      status: respuesta.status,
    },
  );
};
