export const iniciarSesion = async (datos) => {
  const respuesta = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(datos),
  });

  const cuerpo = await respuesta.json().catch(() => null);

  if (respuesta.ok) return cuerpo?.usuario ?? null;

  throw Object.assign(
    new Error(cuerpo?.mensaje ?? "No pudimos iniciar sesión"),
    {
      codigo: cuerpo?.codigo,
      detalle: cuerpo?.detalle,
      status: respuesta.status,
    },
  );
};
