import { LayoutAuth } from "../../components/layout-auth.jsx";
import { FormularioLogin } from "../../features/auth/formulario-login.jsx";

export const Login = () => {
  return (
    <LayoutAuth
      encabezado="Iniciar sesión"
      subtitulo="Accede con tu correo @amigo.edu.co"
    >
      <FormularioLogin />
    </LayoutAuth>
  );
};
