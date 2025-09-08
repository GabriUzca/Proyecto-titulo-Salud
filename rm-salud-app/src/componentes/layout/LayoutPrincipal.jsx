import React from 'react';
import ContenedorApp from '../comunes/ContenedorApp';
import NavegacionInferior from '../comunes/NavegacionInferior';

/**
 * Layout principal de la aplicación
 * Proporciona la estructura base y navegación para todas las páginas
 */
const LayoutPrincipal = ({ children, mostrarNavInferior = false, paginaActual, alNavegar }) => {
  return (
    <ContenedorApp>
      {children}
      {mostrarNavInferior && (
        <NavegacionInferior 
          paginaActual={paginaActual} 
          alNavegar={alNavegar} 
        />
      )}
    </ContenedorApp>
  );
};

export default LayoutPrincipal;