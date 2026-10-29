const REQUISITOS = [
  {
    titulo: "Usa tus datos institucionales",
    texto: "Tu perfil debe corresponder con la información del certificado.",
    icono: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="m16 11 2 2 4-4" />
      </svg>
    ),
  },
  {
    titulo: "Adjunta un documento legible",
    texto: "Verifica que el nombre, la materia y el promedio se puedan leer.",
    icono: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8M8 17h5" />
      </svg>
    ),
  },
  {
    titulo: "Espera la verificación",
    texto: "El perfil se hará público cuando sea aprobado.",
    icono: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
];

export const PanelRequisitos = () => (
  <section className="min-w-0 overflow-hidden rounded-card border border-[#eeeaf5] bg-white shadow-card">
    <div className="border-b border-[#f1edf6] px-5 py-[18px]">
      <h2 className="m-0 text-[13px] tracking-[-0.25px]">Antes de postularte</h2>
      <p className="mb-0 mt-[5px] text-[10px] text-text-muted">
        Tres cosas para que tu solicitud avance sin tropiezos
      </p>
    </div>
    <div className="px-5 py-[18px]">
      <div className="flex flex-col gap-[15px]">
        {REQUISITOS.map((requisito) => (
          <div key={requisito.titulo} className="flex items-start gap-3">
            <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] bg-icon-lilac text-icon-lilac-ink">
              {requisito.icono}
            </span>
            <div className="min-w-0">
              <strong className="mb-[5px] block text-[11px] text-text">
                {requisito.titulo}
              </strong>
              <p className="m-0 text-[10px] leading-[1.55] text-text-muted">
                {requisito.texto}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
