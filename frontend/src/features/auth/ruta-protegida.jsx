import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth-context.jsx";

const Cargando = () => (
  <div
    role="status"
    className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6"
  >
    <span className="motion-safe:animate-spin h-7 w-7 rounded-full border-[3px] border-border border-t-primary" />
    <p className="text-text-muted">Comprobando tu sesión…</p>
  </div>
);

export const RutaProtegida = () => {
  const { usuario, cargando } = useAuth();

  if (cargando) return <Cargando />;

  if (!usuario) return <Navigate to="/iniciar-sesion" replace />;

  return <Outlet />;
};
