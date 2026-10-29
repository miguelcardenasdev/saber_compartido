import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Registro } from "./pages/Registro/Registro.jsx";
import { Verificacion } from "./pages/Verificacion/Verificacion.jsx";
import { Login } from "./pages/Login/Login.jsx";
import { Resumen } from "./pages/Dashboard/Resumen.jsx";
import { SerTutor } from "./pages/Dashboard/SerTutor.jsx";
import { Proximamente } from "./pages/Dashboard/Proximamente.jsx";
import { AuthProvider } from "./features/auth/auth-context.jsx";
import { RutaProtegida } from "./features/auth/ruta-protegida.jsx";
import { LayoutDashboard } from "./features/dashboard/layout.jsx";
import { PANTALLAS_PLACEHOLDER } from "./features/dashboard/navegacion.js";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Registro />} />
          <Route path="/verificar/:token" element={<Verificacion />} />
          <Route path="/iniciar-sesion" element={<Login />} />

          <Route element={<RutaProtegida />}>
            <Route path="/dashboard" element={<LayoutDashboard />}>
              <Route index element={<Resumen />} />
              <Route path="ser-tutor" element={<SerTutor />} />
              {PANTALLAS_PLACEHOLDER.map((enlace) => (
                <Route
                  key={enlace.ruta}
                  path={enlace.ruta.replace("/dashboard/", "")}
                  element={<Proximamente titulo={enlace.etiqueta} />}
                />
              ))}
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
