import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const useMenuMovil = () => {
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  const [rutaPrevia, setRutaPrevia] = useState(pathname);

  if (rutaPrevia !== pathname) {
    setRutaPrevia(pathname);
    setAbierto(false);
  }

  const alternar = useCallback(() => setAbierto((actual) => !actual), []);
  const cerrar = useCallback(() => setAbierto(false), []);

  useEffect(() => {
    if (!abierto) return;

    const alPulsar = (evento) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [abierto]);

  return { abierto, alternar, cerrar };
};
