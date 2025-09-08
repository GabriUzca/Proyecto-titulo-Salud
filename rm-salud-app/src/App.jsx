import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Páginas de Auth
import PaginaLogin from './paginas/auth/PaginaLogin.jsx';
import PaginaRegistro from './paginas/auth/PaginaRegistro.jsx';
import PaginaInicio from './paginas/PaginaInicio.jsx';

/** Layout protegido: muestra children solo si hay sesión */
const ProtectedRoute = ({ isAuth, loading }) => {
  const location = useLocation();

  if (loading) {
    return <div className="p-8">Cargando…</div>;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

function App() {
  const { estaLogueado, cargando, iniciarSesion, registrarse } = useAuth();
  const navigate = useNavigate();

  const manejarInicioSesion = async (credenciales) => {
    await iniciarSesion(credenciales);
    navigate('/inicio');
  };

  const manejarRegistro = async (datos) => {
    await registrarse(datos);
    navigate('/inicio');
  };

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<PaginaLogin alIniciarSesion={manejarInicioSesion} />} />
      <Route path="/registro" element={<PaginaRegistro alRegistrarse={manejarRegistro} />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute isAuth={estaLogueado} loading={cargando} />}>
        <Route path="/inicio" element={<PaginaInicio />} />
        <Route path="/" element={<Navigate to="/inicio" replace />} />
      </Route>

      {/* Cualquier otra ruta → redirige */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}

export default App;
