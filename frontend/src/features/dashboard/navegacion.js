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
      { ruta: "/dashboard/ser-tutor", etiqueta: "Ser tutor", icono: "ser-tutor" },
      { ruta: "/dashboard/mi-perfil", etiqueta: "Mi perfil", icono: "perfil" },
    ],
  },
];

export const PANTALLAS_PLACEHOLDER = GRUPOS_NAVEGACION.flatMap((grupo) =>
  grupo.enlaces.filter((enlace) => !enlace.inicio),
);
