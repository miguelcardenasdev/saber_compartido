export const FormularioRegistro = ({ alEnviar }) => {
  const manejarEnvio = (event) => {
    event.preventDefault();
    const datos = Object.fromEntries(new FormData(event.target));
    alEnviar?.(datos);
  };

  return (
    <form
      onSubmit={manejarEnvio}
      className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-bg p-6 sm:gap-5 sm:p-8"
    >
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombres" className="text-sm font-medium">
            Nombres
          </label>
          <input
            id="nombres"
            name="nombres"
            type="text"
            required
            autoComplete="given-name"
            className="w-full min-w-0 rounded-lg border border-border px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="apellidos" className="text-sm font-medium">
            Apellidos
          </label>
          <input
            id="apellidos"
            name="apellidos"
            type="text"
            required
            autoComplete="family-name"
            className="w-full min-w-0 rounded-lg border border-border px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="correo" className="text-sm font-medium">
          Correo institucional
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          required
          autoComplete="email"
          placeholder="nombre@amigo.edu.co"
          className="w-full min-w-0 rounded-lg border border-border px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contrasena" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          required
          autoComplete="new-password"
          className="w-full min-w-0 rounded-lg border border-border px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <button
        type="submit"
        className="mt-1 w-full rounded-xl bg-accent px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-accent-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:bg-accent-dark cursor-pointer"
      >
        Crear cuenta
      </button>

      <p className="text-center text-sm text-text-muted">
        ¿Ya tienes cuenta?{" "}
        <a
          href="#"
          className="font-medium text-primary transition-colors hover:text-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        >
          Inicia sesión
        </a>
      </p>
    </form>
  );
};
