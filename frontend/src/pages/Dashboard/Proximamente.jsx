export const Proximamente = ({ titulo }) => (
  <div className="flex min-h-[45vh] flex-col items-center justify-center px-4 text-center">
    <span className="mb-3 grid h-[50px] w-[50px] place-items-center rounded-[15px] bg-icon-lilac text-[22px] text-primary">
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    </span>
    <h1 className="m-0 font-heading text-[26px] font-semibold">{titulo}</h1>
    <p className="mb-6 mt-2 max-w-[270px] text-xs leading-[1.6] text-text-muted">
      Esta pantalla está en construcción. Muy pronto podrás usarla desde aquí.
    </p>
    <strong className="rounded-full bg-primary-light px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[1.15px] text-primary-dark">
      Próximamente
    </strong>
  </div>
);
