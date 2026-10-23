export const BotonMenuMovil = ({ abierto, onAlternar }) => (
  <button
    type="button"
    onClick={onAlternar}
    aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
    aria-expanded={abierto}
    aria-controls="sidebar-movil"
    className="hidden h-[34px] w-[34px] flex-none place-items-center rounded-[10px] border border-[#eee8f5] bg-white text-[17px] text-[#716786] max-[900px]:inline-grid"
  >
    ☰
  </button>
);
