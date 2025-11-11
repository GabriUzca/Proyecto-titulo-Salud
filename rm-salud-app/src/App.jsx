// rm-salud-app/src/App.jsx
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Auth pages
import PaginaLogin from './paginas/auth/PaginaLogin';
import PaginaRegistro from './paginas/auth/PaginaRegistro';
import PaginaCompletarPerfil from './paginas/auth/PaginaCompletarPerfil';

// Main pages
import PaginaInicio from './paginas/PaginaInicio';
import ActividadLista from './paginas/ActividadLista';
import ActividadNueva from './paginas/ActividadNueva';
import ComidaLista from './paginas/ComidaLista';
import ComidaNueva from './paginas/ComidaNueva';
import Perfil from './paginas/Perfil';
import PaginaOfertas from './paginas/PaginaOfertas';
import MapaRecursos from './componentes/MapaRecursos';

// Admin pages
import AdminUsuarios from './paginas/AdminUsuarios';
import EditarUsuario from './paginas/EditarUsuario';
import AdminEventos from './paginas/AdminEventos';
import PaginaAdminMenu from './paginas/PaginaAdminMenu';

// Event request pages (public)
import SolicitarEvento from './paginas/SolicitarEvento';
import ConsultarSolicitud from './paginas/ConsultarSolicitud';

// Layout con navegación
function LayoutConNavegacion() {
  const location = useLocation();
  const { navigate } = useAuth();
  
  // Determinar qué botón está activo basado en la ruta actual
  const getActiveButton = (path) => {
    const currentPath = location.pathname;
    if (path === '/actividad') {
      return currentPath === '/actividad' || currentPath === '/actividad/nueva';
    }
    if (path === '/comida') {
      return currentPath === '/comida' || currentPath === '/comida/nueva';
    }
    return currentPath === path;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Contenido principal */}
      <div className="flex-1 pb-16">
        <Outlet />
      </div>
      
      {/* Navegación inferior fija */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-4 h-16">
            {/* Botón Inicio */}
            <button
              onClick={() => window.location.pathname !== '/inicio' && (window.location.pathname = '/inicio')}
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                getActiveButton('/inicio') 
                  ? 'text-teal-600 bg-teal-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 mb-1">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="text-xs font-medium">Inicio</span>
              {getActiveButton('/inicio') && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-teal-600 rounded-b-full" />
              )}
            </button>
            
            {/* Botón Actividad */}
            <button
              onClick={() => window.location.pathname !== '/actividad' && (window.location.pathname = '/actividad')}
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                getActiveButton('/actividad') 
                  ? 'text-teal-600 bg-teal-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 mb-1">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span className="text-xs font-medium">Actividad</span>
              {getActiveButton('/actividad') && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-teal-600 rounded-b-full" />
              )}
            </button>
            
            {/* Botón Comida */}
            <button
              onClick={() => window.location.pathname !== '/comida' && (window.location.pathname = '/comida')}
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                getActiveButton('/comida') 
                  ? 'text-teal-600 bg-teal-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 mb-1">
                <path d="M2 2v20l10-5.5L22 22V2l-10 5.5L2 2z" />
              </svg>
              <span className="text-xs font-medium">Comida</span>
              {getActiveButton('/comida') && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-teal-600 rounded-b-full" />
              )}
            </button>
            
            {/* Botón Perfil */}
            <button
              onClick={() => window.location.pathname !== '/perfil' && (window.location.pathname = '/perfil')}
              className={`flex flex-col items-center justify-center transition-all duration-200 ${
                getActiveButton('/perfil') 
                  ? 'text-teal-600 bg-teal-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 mb-1">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-xs font-medium">Perfil</span>
              {getActiveButton('/perfil') && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-teal-600 rounded-b-full" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

// Componente para proteger rutas que requieren autenticación
function ProtectedRoute({ children, requireAdmin = false, allowIncompleteProfile = false }) {
  const { estaLogueado, cargando, usuario } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!estaLogueado) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el perfil está completo (tiene edad, peso, altura y sexo)
  const perfilCompleto = usuario?.edad != null && usuario?.peso != null && usuario?.altura != null && usuario?.sexo != null;

  // Si el perfil no está completo y no estamos en la página de completar perfil, redirigir
  if (!perfilCompleto && !allowIncompleteProfile && location.pathname !== '/completar-perfil') {
    return <Navigate to="/completar-perfil" replace />;
  }

  if (requireAdmin && !usuario?.is_staff) {
    return <Navigate to="/inicio" replace />;
  }

  return children;
}

// Componente para rutas públicas (login/registro)
// Redirige a /inicio si el usuario ya está autenticado
function PublicRoute({ children }) {
  const { estaLogueado, cargando } = useAuth();

  // Mostrar loader mientras verifica la sesión
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, redirigir a inicio
  if (estaLogueado) {
    return <Navigate to="/inicio" replace />;
  }

  // Si no está autenticado, mostrar la página (login o registro)
  return children;
}

export default function App() {
  const { iniciarSesion, registrarse, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas públicas - Solo accesibles si NO está autenticado */}
      <Route path="/login" element={
        <PublicRoute>
          <PaginaLogin alIniciarSesion={iniciarSesion} />
        </PublicRoute>
      } />
      <Route path="/registro" element={
        <PublicRoute>
          <PaginaRegistro alRegistrarse={registrarse} />
        </PublicRoute>
      } />

      {/* Rutas públicas para eventos - No requieren autenticación */}
      <Route path="/solicitar-evento" element={<SolicitarEvento />} />
      <Route path="/consultar-solicitud" element={<ConsultarSolicitud />} />

      {/* Ruta para completar perfil - Requiere autenticación pero permite perfil incompleto */}
      <Route path="/completar-perfil" element={
        <ProtectedRoute allowIncompleteProfile={true}>
          <PaginaCompletarPerfil />
        </ProtectedRoute>
      } />

      {/* Protected routes with layout */}
      <Route element={
        <ProtectedRoute>
          <LayoutConNavegacion />
        </ProtectedRoute>
      }>
        <Route path="/inicio" element={<PaginaInicio />} />
        <Route path="/actividad" element={<ActividadLista />} />
        <Route path="/actividad/nueva" element={<ActividadNueva />} />
        <Route path="/comida" element={<ComidaLista />} />
        <Route path="/comida/nueva" element={<ComidaNueva />} />
        <Route path="/ofertas" element={<PaginaOfertas />} />
        <Route path="/mapa" element={<MapaRecursos />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin/menu" element={
        <ProtectedRoute requireAdmin={true}>
          <PaginaAdminMenu />
        </ProtectedRoute>
      } />

      <Route path="/admin/usuarios" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminUsuarios />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/usuarios/:id/editar" element={
        <ProtectedRoute requireAdmin={true}>
          <EditarUsuario />
        </ProtectedRoute>
      } />

      <Route path="/admin/eventos" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminEventos />
        </ProtectedRoute>
      } />

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}