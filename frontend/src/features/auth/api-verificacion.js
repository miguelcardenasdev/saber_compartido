export const verificarCorreo = async (token) => {
  const respuesta = await fetch(
    `/api/auth/verificar/${encodeURIComponent(token)}`,
  );
  const cuerpo = await respuesta.json().catch(() => null);

  if (respuesta.ok) return cuerpo ?? {};

  throw Object.assign(
    new Error(cuerpo?.mensaje ?? "No pudimos verificar tu correo"),
    {
      codigo: cuerpo?.codigo,
      status: respuesta.status,
    },
  );
};
