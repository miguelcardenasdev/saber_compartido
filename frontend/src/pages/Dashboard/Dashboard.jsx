import { useAuth } from "../../features/auth/auth-context.jsx";

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

export const Dashboard = () => {
  const { usuario } = useAuth();

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-primary-dark px-6 py-4 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            {LogoTutoria}
          </span>
          <div>
            <p className="font-heading text-base font-semibold text-white">
              Saber Compartido
            </p>
            <p className="text-xs text-white/70">
              Universidad Católica Luis Amigó
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-10">
        <h1 className="font-heading text-3xl font-semibold sm:text-4xl">
          Hola, {usuario?.nombres}
        </h1>
      </main>
    </div>
  );
};
