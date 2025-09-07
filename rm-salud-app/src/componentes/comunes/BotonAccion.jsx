import React from 'react';

/**
 * Componente de botón reutilizable con estilos consistentes
 * Usado en formularios y acciones principales de la aplicación
 */
const BotonAccion = ({ children, onClick, className = '' }) => (
  <button 
    onClick={onClick} 
    className={`w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline hover:bg-teal-600 transition-colors duration-300 ${className}`}
  >
    {children}
  </button>
);

export default BotonAccion;