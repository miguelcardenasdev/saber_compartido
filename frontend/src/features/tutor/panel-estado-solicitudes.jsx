const ESTILOS_BADGE = {
  pendiente: "bg-status-pending text-status-pending-ink",
  aprobado: "bg-status-success text-status-success-ink",
  rechazado: "bg-status-danger text-status-danger-ink",
};

const FECHA_LARGA = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const mayusculaInicial = (texto = "") =>
  texto.charAt(0).toUpperCase() + texto.slice(1);

const formatearFecha = (valor) => {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? "" : FECHA_LARGA.format(fecha);
};

export const PanelEstadoSolicitudes = ({
  solicitudes,
  cargando,
  error,
  onReintentar,
}) => (
  <section className="min-w-0 overflow-hidden rounded-card border border-[#eeeaf5] bg-white shadow-card">
    <div className="border-b border-[#f1edf6] px-5 py-[18px]">
      <h2 className="m-0 text-[13px] tracking-[-0.25px]">Estado de mi solicitud</h2>
      <p className="mb-0 mt-[5px] text-[10px] text-text-muted">
        El avance de cada materia que solicitaste
      </p>
    </div>

    <div className="px-5 py-[18px]">
      {cargando && (
        <div role="status" className="flex flex-col items-center gap-3 px-[15px] py-[25px]">
          <span className="motion-safe:animate-spin h-6 w-6 rounded-full border-[3px] border-border border-t-primary" />
          <p className="m-0 text-[10px] text-text-muted">Cargando tus solicitudes…</p>
        </div>
      )}

      {!cargando && error && (
        <div className="px-[15px] py-[25px] text-center">
          <strong className="mb-[6px] block text-[12px] text-text">
            No pudimos cargar tus solicitudes
          </strong>
          <p className="mx-auto mb-[14px] max-w-[270px] text-[10px] leading-[1.6] text-text-muted">
            Ocurrió un problema al consultar tus datos. Inténtalo de nuevo.
          </p>
          <button
            type="button"
            onClick={onReintentar}
            className="inline-flex min-h-[39px] items-center justify-center rounded-[10px] border border-border bg-white px-[15px] text-[11px] font-bold text-text transition hover:-translate-y-px"
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && solicitudes.length === 0 && (
        <div className="px-[15px] py-[25px] text-center">
          <span className="mx-auto mb-3 grid h-[50px] w-[50px] place-items-center rounded-[15px] bg-primary-light text-primary">
            <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </span>
          <strong className="mb-[6px] block text-[12px] text-text">
            Aún no has enviado una solicitud
          </strong>
          <p className="mx-auto mb-0 max-w-[270px] text-[10px] leading-[1.6] text-text-muted">
            Cuando envíes el formulario, podrás consultar su estado aquí.
          </p>
        </div>
      )}

      {!cargando && !error && solicitudes.length > 0 && (
        <div className="flex flex-col">
          {solicitudes.map((solicitud) => (
            <div
              key={solicitud.id}
              className="flex items-center justify-between gap-3 border-b border-[#f4f0f8] py-[13px] last:border-b-0"
            >
              <div className="min-w-0">
                <strong className="mb-[4px] block truncate text-[11px] text-text">
                  {solicitud.materia?.nombre ?? "Materia"}
                </strong>
                <span className="block text-[10px] text-text-muted">
                  Solicitada el {formatearFecha(solicitud.creadoEn)}
                </span>
              </div>
              <span
                className={`flex-none rounded-full px-2 py-[5px] text-[9px] font-bold ${
                  ESTILOS_BADGE[solicitud.estado] ??
                  "bg-status-neutral text-status-neutral-ink"
                }`}
              >
                {mayusculaInicial(solicitud.estado)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
);
