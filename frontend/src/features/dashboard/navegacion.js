export const GRUPOS_NAVEGACION = [
  {
    etiqueta: "Menú principal",
    enlaces: [
      {
        ruta: "/dashboard",
        etiqueta: "Resumen",
        icono: "resumen",
        inicio: true,
      },
      {
        ruta: "/dashboard/buscar-tutores",
        etiqueta: "Buscar tutores",
        icono: "buscar",
      },
      {
        ruta: "/dashboard/mis-tutorias",
        etiqueta: "Mis tutorías",
        icono: "tutorias",
      },
      {
        ruta: "/dashboard/tutorias-grupales",
        etiqueta: "Tutorías grupales",
        icono: "grupal",
      },
      {
        ruta: "/dashboard/notificaciones",
        etiqueta: "Notificaciones",
        icono: "notificaciones",
      },
    ],
  },
  {
    etiqueta: "Mi espacio",
    enlaces: [
      {
        ruta: "/dashboard/ser-tutor",
        etiqueta: "Ser tutor",
        icono: "ser-tutor",
        implementado: true,
      },
      { ruta: "/dashboard/mi-perfil", etiqueta: "Mi perfil", icono: "perfil" },
    ],
  },
];

export const PANTALLAS_PLACEHOLDER = GRUPOS_NAVEGACION.flatMap((grupo) =>
  grupo.enlaces.filter((enlace) => !enlace.inicio && !enlace.implementado),
);

export const etiquetaDeRuta = (ruta) => {
  const enlaces = GRUPOS_NAVEGACION.flatMap((grupo) => grupo.enlaces);
  const coincidencia = enlaces.find((enlace) => enlace.ruta === ruta);
  if (coincidencia) return coincidencia.etiqueta;

  const segmento = ruta.split("/").filter(Boolean).pop() ?? "";
  if (!segmento) return "Resumen";
  return segmento
    .replace(/-/g, " ")
    .replace(/^./, (letra) => letra.toUpperCase());
};
