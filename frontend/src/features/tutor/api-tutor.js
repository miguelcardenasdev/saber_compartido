const manejarFallos = async (respuesta, mensajePorDefecto) => {
  const cuerpo = await respuesta.json().catch(() => null);

  throw Object.assign(new Error(cuerpo?.mensaje ?? mensajePorDefecto), {
    codigo: cuerpo?.codigo,
    detalle: cuerpo?.detalle,
    status: respuesta.status,
  });
};

export const obtenerSolicitudes = async () => {
  const respuesta = await fetch("/api/tutores/solicitudes", {
    credentials: "same-origin",
  });

  if (respuesta.ok) return respuesta.json().catch(() => []);

  await manejarFallos(respuesta, "No pudimos cargar tus solicitudes");
};

export const enviarSolicitud = async (datos) => {
  const formulario = new FormData();
  formulario.append("materias", JSON.stringify(datos.materias));
  if (datos.descripcion) formulario.append("descripcion", datos.descripcion);
  formulario.append("certificado", datos.certificado);

  const respuesta = await fetch("/api/tutores/solicitudes", {
    method: "POST",
    credentials: "same-origin",
    body: formulario,
  });

  if (respuesta.ok) return respuesta.json().catch(() => ({}));

  await manejarFallos(respuesta, "No pudimos enviar tu solicitud");
};
