import { FormularioRegistro } from "../../features/auth/formulario-registro.jsx";

const LogoTutoria = (
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

const IconoVerificado = (
  <svg
    className="h-5 w-5 text-success"
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

const IconoAgenda = (
  <svg
    className="h-5 w-5 text-white"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const IconoCalificacion = (
  <svg
    className="h-5 w-5 text-warning"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
  </svg>
);

const Tarjeta = ({ icono, titulo, detalle }) => (
  <li className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/10 p-4">
    <span className="mt-0.5 shrink-0">{icono}</span>
    <div>
      <p className="font-medium text-white">{titulo}</p>
      <p className="text-sm text-white/70">{detalle}</p>
    </div>
  </li>
);

export const Registro = () => {
  return (
    <div className="min-h-screen bg-bg lg:flex">
      <header className="flex flex-col justify-between gap-10 bg-primary-dark px-6 py-9 sm:px-10 lg:min-h-screen lg:w-1/2 lg:px-14 lg:py-12 xl:px-16">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
              {LogoTutoria}
            </span>
            <div>
              <p className="font-heading text-xl font-semibold text-white">
                Saber Compartido
              </p>
              <p className="text-sm text-white/70">
                Universidad Católica Luis Amigó
              </p>
            </div>
          </div>

          <div>
            <p className="font-heading text-4xl font-bold leading-tight sm:text-5xl xl:text-6xl">
              <span className="block text-white">Aprende más</span>
              <span className="block text-accent">con tus pares.</span>
            </p>
            <p className="mt-5 max-w-md text-base text-white/75">
              Conectamos estudiantes con tutores verificados de tu misma
              institución. Sesiones individuales y grupales, cuando lo
              necesites.
            </p>
          </div>
        </div>

        <ul className="hidden list-none flex-col gap-3 lg:flex">
          <Tarjeta
            icono={IconoVerificado}
            titulo="Tutores verificados"
            detalle="Nota mínima 4.0 en cada materia"
          />
          <Tarjeta
            icono={IconoAgenda}
            titulo="Agenda flexible"
            detalle="Reserva bloques de horario en segundos"
          />
          <Tarjeta
            icono={IconoCalificacion}
            titulo="Calificaciones reales"
            detalle="Cada tutoría se califica de 1 a 5"
          />
        </ul>
      </header>

      <main className="flex-1 px-6 py-10 sm:px-10 lg:flex lg:flex-col lg:justify-center lg:px-14 lg:py-12 xl:px-20">
        <div className="mx-auto w-full max-w-md sm:max-w-lg lg:mx-0">
          <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
            Crear cuenta
          </h1>
          <p className="mt-2 text-text-muted">
            Regístrate con tu correo @amigo.edu.co
          </p>
          <div className="mt-8">
            <FormularioRegistro />
          </div>
        </div>
      </main>
    </div>
  );
};
