import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LayoutPrincipal from './componentes/layout/LayoutPrincipal';
import PaginaLogin from './paginas/auth/PaginaLogin';
import PaginaRegistro from './paginas/auth/PaginaRegistro';
import PaginaInicio from './paginas/PaginaInicio';
import PaginaOfertas from './paginas/PaginaOfertas';

/**
 * Componente principal de la aplicación
 * Maneja la navegación entre páginas y el estado de autenticación
 */
function App() {
  const [paginaActual, setPaginaActual] = useState('login');
  const { estaLogueado, iniciarSesion, registrarse, cerrarSesion } = useAuth();

  /**
   * Maneja la navegación entre páginas
   * @param {string} paginaDestino - Nombre de la página a la que navegar
   */
  const manejarNavegacion = (paginaDestino) => {
    setPaginaActual(paginaDestino);
  };

  /**
   * Maneja el proceso de inicio de sesión
   */
  const manejarInicioSesion = () => {
    iniciarSesion();
    setPaginaActual('inicio');
  };
  
  /**
   * Maneja el proceso de registro
   */
  const manejarRegistro = () => {
    registrarse();
    setPaginaActual('inicio');
  };

  /**
   * Renderiza la página actual basada en el estado de autenticación
   */
  const renderizarPagina = () => {
    // Si el usuario no está logueado, mostrar páginas de autenticación
    if (!estaLogueado) {
      switch (paginaActual) {
        case 'login':
          return (
            <PaginaLogin 
              alNavegar={manejarNavegacion} 
              alIniciarSesion={manejarInicioSesion} 
            />
          );
        case 'registro':
          return (
            <PaginaRegistro 
              alNavegar={manejarNavegacion} 
              alRegistrarse={manejarRegistro} 
            />
          );
        default:
          return (
            <PaginaLogin 
              alNavegar={manejarNavegacion} 
              alIniciarSesion={manejarInicioSesion} 
            />
          );
      }
    }

    // Si el usuario está logueado, mostrar páginas principales
    switch (paginaActual) {
      case 'inicio':
        return <PaginaInicio />;
      case 'ofertas':
        return <PaginaOfertas />;
      case 'estadisticas':
        return (
          <div className="p-4 pb-24">
            <h2 className="text-2xl font-bold">Estadísticas - Próximamente</h2>
            <p className="text-gray-600 mt-2">
              Esta sección mostrará gráficos detallados de tu progreso.
            </p>
          </div>
        );
      case 'perfil':
        return (
          <div className="p-4 pb-24">
            <h2 className="text-2xl font-bold">Perfil - Próximamente</h2>
            <p className="text-gray-600 mt-2">
              Aquí podrás configurar tu información personal y preferencias.
            </p>
          </div>
        );
      default:
        return <PaginaInicio />;
    }
  };

  return (
    <LayoutPrincipal 
      mostrarNavInferior={estaLogueado} 
      paginaActual={paginaActual} 
      alNavegar={manejarNavegacion}
    >
      {renderizarPagina()}
    </LayoutPrincipal>
  );
}

export default App;