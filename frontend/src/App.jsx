import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Registro } from "./pages/Registro/Registro.jsx";
import { Verificacion } from "./pages/Verificacion/Verificacion.jsx";
import { Login } from "./pages/Login/Login.jsx";
import { Dashboard } from "./pages/Dashboard/Dashboard.jsx";
import { AuthProvider } from "./features/auth/auth-context.jsx";
import { RutaProtegida } from "./features/auth/ruta-protegida.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Registro />} />
          <Route path="/verificar/:token" element={<Verificacion />} />
          <Route path="/iniciar-sesion" element={<Login />} />

          <Route element={<RutaProtegida />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
