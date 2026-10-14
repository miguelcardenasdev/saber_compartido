import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { verificarCorreo } from "../../features/auth/api-verificacion.js";

const LogoMarca = (
  <svg
    className="h-6 w-6 text-white"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path d="M12 4 22 9l-10 5L2 9l10-5z" fill="currentColor" />
    <path
      d="M6 11.5V16c0 0 2.5 2 6 2s6-2 6-2v-4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconoExito = (
  <svg
    className="h-7 w-7"
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

const IconoExpirado = (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const IconoInvalido = (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="m15 9-6 6M9 9l6 6" />
  </svg>
);

const IconoAlerta = (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3 2.5 20h19L12 3z" />
    <path d="M12 10v4M12 17.5v.5" />
  </svg>
);

const Tarjeta = ({ rol, icono, tono, titulo, children, acciones }) => (
  <main className="flex min-h-screen items-center justify-center bg-bg px-6 py-10">
    <div
      role={rol}
      className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-bg p-8 text-center sm:p-10"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          {LogoMarca}
        </span>
        <p className="font-heading text-base font-semibold min-[340px]:text-lg">
          Saber Compartido
        </p>
      </div>
      <span
        className={`mt-2 flex h-14 w-14 items-center justify-center rounded-full ${tono}`}
      >
        {icono}
      </span>
      <h1 className="font-heading text-2xl font-semibold">{titulo}</h1>
      {children}
      {acciones}
    </div>
  </main>
);

export const Verificacion = () => {
  const { token } = useParams();
  const yaConsultado = useRef(false);
  const [estado, setEstado] = useState("cargando");
  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const consultar = useCallback(async () => {
    setEstado("cargando");
    try {
      const cuerpo = await verificarCorreo(token);
      setCodigo(cuerpo.codigo ?? "");
      setMensaje(cuerpo.mensaje ?? "");
      setEstado("exito");
    } catch (error) {
      setCodigo(error.codigo ?? "");
      setMensaje(error.message ?? "");
      if (error.status === 400 && error.codigo === "TOKEN_EXPIRADO") {
        setEstado("expirado");
      } else if (error.status === 400 && error.codigo === "TOKEN_INVALIDO") {
        setEstado("invalido");
      } else {
        setEstado("fallo");
      }
    }
  }, [token]);

  useEffect(() => {
    if (yaConsultado.current) return;
    yaConsultado.current = true;
    consultar();
  }, [consultar]);

  if (estado === "cargando") {
    return (
      <Tarjeta
        rol="status"
        icono={
          <span className="motion-safe:animate-spin h-7 w-7 rounded-full border-[3px] border-border border-t-primary" />
        }
        tono="bg-primary/10"
        titulo="Verificando tu correo…"
      >
        <p className="text-text-muted">Es un momento, por favor.</p>
      </Tarjeta>
    );
  }

  if (estado === "exito") {
    const yaEstaba = codigo === "YA_VERIFICADO";
    return (
      <Tarjeta
        rol="status"
        icono={IconoExito}
        tono="bg-success/15 text-success"
        titulo={yaEstaba ? "Correo ya verificado" : "¡Correo verificado!"}
        acciones={
          <Link
            to="/"
            className="mt-2 w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Ir al inicio
          </Link>
        }
      >
        {!yaEstaba && <p className="text-text-muted">{mensaje}</p>}
      </Tarjeta>
    );
  }

  if (estado === "expirado") {
    return (
      <Tarjeta
        rol="alert"
        icono={IconoExpirado}
        tono="bg-warning/15 text-warning"
        titulo="El enlace expiró"
        acciones={
          <Link
            to="/"
            className="mt-2 w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Volver al registro
          </Link>
        }
      >
        <p className="text-text-muted">{mensaje}</p>
        <p className="text-sm text-text-muted">
          Los enlaces de verificación vencen a las 24 horas.
        </p>
      </Tarjeta>
    );
  }

  if (estado === "invalido") {
    return (
      <Tarjeta
        rol="alert"
        icono={IconoInvalido}
        tono="bg-danger/15 text-danger"
        titulo="Enlace no válido"
        acciones={
          <Link
            to="/"
            className="mt-2 w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Ir al inicio
          </Link>
        }
      >
        <p className="text-text-muted">{mensaje}</p>
      </Tarjeta>
    );
  }

  return (
    <Tarjeta
      rol="alert"
      icono={IconoAlerta}
      tono="bg-danger/15 text-danger"
      titulo="No pudimos verificar tu correo"
      acciones={
        <button
          type="button"
          onClick={consultar}
          className="mt-2 w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Reintentar
        </button>
      }
    >
      <p className="text-text-muted">
        Revisa tu conexión e inténtalo de nuevo.
      </p>
    </Tarjeta>
  );
};
