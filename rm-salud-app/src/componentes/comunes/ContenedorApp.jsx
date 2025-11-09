import React from 'react';
/**
 * Componente contenedor principal de la aplicación
 * Proporciona el marco visual y la estructura base para todas las páginas
 */
const ContenedorApp = ({ children }) => (
  <div className="bg-gray-100 min-h-screen font-sans flex items-center justify-center">
    {/* Contenedor principal con diseño móvil */}
    <div className="w-full max-w-sm bg-white shadow-lg rounded-lg overflow-hidden relative flex flex-col" style={{minHeight: '812px'}}>
      {/* Área de contenido - ocupa el espacio disponible y es scrolleable */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

export default ContenedorApp;