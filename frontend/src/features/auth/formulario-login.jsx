import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { esquemaLogin } from "./login.schema.js";
import { iniciarSesion } from "./api-login.js";
import { useAuth } from "./auth-context.jsx";
import { Campo } from "./campo.jsx";

const leerDatos = (formulario) => Object.fromEntries(new FormData(formulario));

const obtenerErrores = (datos) => {
  const resultado = esquemaLogin.safeParse(datos);
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

export const FormularioLogin = () => {
  const navigate = useNavigate();
  const { fijarUsuario } = useAuth();

  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState("");
  const [estado, setEstado] = useState("idle");

  const manejarEnvio = async (event) => {
    event.preventDefault();
    if (estado === "cargando") return;
    setAviso("");

    const datos = leerDatos(event.target);
    const fallos = obtenerErrores(datos);
    setErrores(fallos);
    if (Object.keys(fallos).length > 0) return;

    setEstado("cargando");
    try {
      const usuario = await iniciarSesion(datos);
      fijarUsuario(usuario);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error.status === 401 || error.codigo === "CORREO_NO_VERIFICADO") {
        setAviso(error.message);
      } else if (error.detalle) {
        const { porCampo, general } = erroresDeDetalle(error.detalle);
        setErrores(porCampo);
        if (general) setAviso(general);
      } else {
        setAviso(
          error.codigo
            ? error.message
            : "No pudimos iniciar sesión. Inténtalo de nuevo.",
        );
      }
      setEstado("error");
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

  const cargando = estado === "cargando";

  return (
    <form
      noValidate
      onSubmit={manejarEnvio}
      className="flex w-full flex-col gap-4 rounded-2xl border border-border bg-bg p-6 sm:gap-5 sm:p-8"
    >
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
        autoComplete="current-password"
        error={errores.contrasena}
        onChange={manejarCambio}
        onBlur={manejarSalida}
      />

      {aviso && (
        <p
          role="alert"
          className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {aviso}
        </p>
      )}

      <button
        type="submit"
        disabled={cargando}
        aria-busy={cargando}
        className="mt-1 w-full rounded-xl bg-accent px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-accent-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
      >
        {cargando ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>

      <p className="text-center text-sm text-text-muted">
        ¿No tienes cuenta?{" "}
        <Link
          to="/"
          className="font-medium text-primary transition-colors hover:text-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
        >
          Regístrate
        </Link>
      </p>
    </form>
  );
};
