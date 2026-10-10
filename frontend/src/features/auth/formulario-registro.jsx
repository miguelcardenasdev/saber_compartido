import { useState } from "react";
import { esquemaRegistro } from "./registro.schema.js";
import { registrarCuenta } from "./api-registro.js";

const Campo = ({
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

const leerDatos = (formulario) => Object.fromEntries(new FormData(formulario));

const obtenerErrores = (datos) => {
  const resultado = esquemaRegistro.safeParse(datos);
  if (resultado.success) return {};
  const porCampo = {};
  for (const incidencia of resultado.error.issues) {
    const campo = incidencia.path[0];
    if (porCampo[campo] === undefined) porCampo[campo] = incidencia.message;
  }
  return porCampo;
};

const erroresDeDetalle = (detalle) => {
  const porCampo = {};
  let general;
  for (const [campo, mensajes] of Object.entries(detalle)) {
    if (campo === "general") general = mensajes[0];
    else porCampo[campo] = mensajes[0];
  }
  return { porCampo, general };
};

const IconoExito = (
  <svg
    className="h-7 w-7 text-success"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const FormularioRegistro = () => {
  const [errores, setErrores] = useState({});
  const [falloGeneral, setFalloGeneral] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(null);

  const manejarEnvio = async (event) => {
    event.preventDefault();
    if (cargando) return;
    setFalloGeneral("");
    const datos = leerDatos(event.target);
    const fallos = obtenerErrores(datos);
    setErrores(fallos);
    if (Object.keys(fallos).length > 0) return;

    setCargando(true);
    try {
      const respuesta = await registrarCuenta(datos);
      setExito({ mensaje: respuesta.mensaje, correo: datos.correo });
    } catch (error) {
      if (error.status === 409 && error.codigo === "CORREO_DUPLICADO") {
        setErrores({ correo: error.mensaje });
      } else if (error.detalle) {
        const { porCampo, general } = erroresDeDetalle(error.detalle);
        setErrores(porCampo);
        if (general) setFalloGeneral(general);
      } else {
        setFalloGeneral(
          error.codigo
            ? error.message
            : "No pudimos crear tu cuenta. Inténtalo de nuevo.",
        );
      }
    } finally {
      setCargando(false);
    }
  };

  const manejarCambio = (event) => {
    const formulario = event.target.form;
    if (!formulario) return;
    const fallos = obtenerErrores(leerDatos(formulario));
    setErrores((previos) => {
      const siguientes = { ...previos };
      for (const campo of Object.keys(siguientes)) {
        if (fallos[campo] === undefined) delete siguientes[campo];
        else siguientes[campo] = fallos[campo];
      }
      return siguientes;
    });
  };

  const manejarSalida = (event) => {
    const formulario = event.target.form;
    const nombre = event.target.name;
    if (!formulario || !nombre) return;
    const fallos = obtenerErrores(leerDatos(formulario));
    if (fallos[nombre] !== undefined) {
      setErrores((previos) => ({ ...previos, [nombre]: fallos[nombre] }));
    }
  };

  if (exito) {
    return (
      <div
        role="status"
        className="flex w-full flex-col items-center gap-3 rounded-2xl border border-border bg-bg p-8 text-center sm:p-10"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
          {IconoExito}
        </span>
        <h2 className="font-heading text-2xl font-semibold">
          Cuenta creada
        </h2>
        <p className="text-text-muted">{exito.mensaje}</p>
        <p className="font-medium text-text">{exito.correo}</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={manejarEnvio}
      className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-bg p-6 sm:gap-5 sm:p-8"
    >
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5">
        <Campo
          nombre="nombres"
          etiqueta="Nombres"
          autoComplete="given-name"
          error={errores.nombres}
          onChange={manejarCambio}
          onBlur={manejarSalida}
        />
        <Campo
          nombre="apellidos"
          etiqueta="Apellidos"
          autoComplete="family-name"
          error={errores.apellidos}
          onChange={manejarCambio}
          onBlur={manejarSalida}
        />
      </div>

      <Campo
        nombre="correo"
        etiqueta="Correo institucional"
        tipo="email"
        autoComplete="email"
        placeholder="nombre@amigo.edu.co"
        error={errores.correo}
        onChange={manejarCambio}
        onBlur={manejarSalida}
      />

      <Campo
        nombre="contrasena"
        etiqueta="Contraseña"
        tipo="password"
        autoComplete="new-password"
        error={errores.contrasena}
        onChange={manejarCambio}
        onBlur={manejarSalida}
      />

      {falloGeneral && (
        <p role="alert" className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
          {falloGeneral}
        </p>
      )}

      <button
        type="submit"
        disabled={cargando}
        aria-busy={cargando}
        className="mt-1 w-full rounded-xl bg-accent px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-accent-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
      >
        {cargando ? "Creando cuenta…" : "Crear cuenta"}
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
