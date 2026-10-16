import { FormularioRegistro } from "../../features/auth/formulario-registro.jsx";
import { LayoutAuth } from "../../components/layout-auth.jsx";

export const Registro = () => {
  return (
    <LayoutAuth
      encabezado="Crear cuenta"
      subtitulo="Regístrate con tu correo @amigo.edu.co"
    >
      <FormularioRegistro />
    </LayoutAuth>
  );
};
