export const Campo = ({
  nombre,
  etiqueta,
  tipo = "text",
  autoComplete,
  placeholder,
  error,
  onChange,
  onBlur,
}) => {
  const idError = `error-${nombre}`;
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={nombre} className="text-sm font-medium">
        {etiqueta}
      </label>
      <input
        id={nombre}
        name={nombre}
        type={tipo}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? idError : undefined}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full min-w-0 rounded-lg border px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 ${
          error ? "border-danger" : "border-border"
        }`}
      />
      {error && (
        <p id={idError} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
};
