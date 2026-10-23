import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth-context.jsx";

export const useCerrarSesion = () => {
  const { fijarUsuario } = useAuth();
  const navigate = useNavigate();

  return useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // El endpoint es idempotente; aunque falle la red, igual vaciamos la vista local.
    }

    fijarUsuario(null);
    navigate("/iniciar-sesion", { replace: true });
  }, [fijarUsuario, navigate]);
};
