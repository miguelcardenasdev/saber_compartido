import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { obtenerSesion } from "./api-sesion.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    obtenerSesion()
      .then((siguiente) => {
        if (activo) setUsuario(siguiente ?? null);
      })
      .catch(() => {
        if (activo) setUsuario(null);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const fijarUsuario = useCallback((siguiente) => {
    setUsuario(siguiente ?? null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, fijarUsuario }),
    [usuario, cargando, fijarUsuario],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return contexto;
};
