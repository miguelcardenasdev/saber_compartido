import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Registro } from "./pages/Registro/Registro.jsx";
import { Verificacion } from "./pages/Verificacion/Verificacion.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Registro />} />
        <Route path="/verificar/:token" element={<Verificacion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
