import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LayoutPrincipal from './componentes/layout/LayoutPrincipal';
import PaginaLogin from './paginas/auth/PaginaLogin';
import PaginaRegistro from './paginas/auth/PaginaRegistro';
import PaginaInicio from './paginas/PaginaInicio';
import PaginaOfertas from './paginas/PaginaOfertas';

// Un componente para proteger rutas
const RutasProtegidas = ({ estaLogueado }) => {
  if (!estaLogueado) {
    // Si no está logueado, lo redirige al login
    return <Navigate to="/login" replace />;
  }
  // Si está logueado, muestra el contenido de la ruta (Inicio, Ofertas, etc.)
  return <Outlet />;
};

function App() {
  const { estaLogueado, iniciarSesion, registrarse } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtenemos el nombre de la página actual a partir de la URL
  const paginaActual = location.pathname.replace('/', '') || 'inicio';

  const manejarInicioSesion = () => {
    iniciarSesion();
    navigate('/inicio'); // Navega a la página de inicio
  };
  
  const manejarRegistro = () => {
    registrarse();
    navigate('/inicio'); // Navega a la página de inicio
  };

  return (
    <LayoutPrincipal 
      mostrarNavInferior={estaLogueado} 
      paginaActual={paginaActual}
      alNavegar={(ruta) => navigate(`/${ruta}`)} // Navega usando el router
    >
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<PaginaLogin alIniciarSesion={manejarInicioSesion} />} />
        <Route path="/registro" element={<PaginaRegistro alRegistrarse={manejarRegistro} />} />

        {/* Rutas Protegidas */}
        <Route element={<RutasProtegidas estaLogueado={estaLogueado} />}>
          <Route path="/" element={<Navigate to="/inicio" />} />
          <Route path="/inicio" element={<PaginaInicio />} />
          <Route path="/ofertas" element={<PaginaOfertas />} />
          <Route path="/estadisticas" element={<div className="p-4">Estadísticas - Próximamente</div>} />
          <Route path="/perfil" element={<div className="p-4">Perfil - Próximamente</div>} />
        </Route>
        
        {/* Ruta para cualquier otra URL no definida */}
        <Route path="*" element={<Navigate to={estaLogueado ? "/inicio" : "/login"} />} />
      </Routes>
    </LayoutPrincipal>
  );
}

export default App;