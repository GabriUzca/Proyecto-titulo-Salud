import React from 'react';

/**
 * Componente de campo de entrada reutilizable
 * Maneja diferentes tipos de input con estilos consistentes
 */
const CampoEntrada = ({ type = 'text', placeholder, value, onChange, name }) => (
  <input
    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    name={name}
  />
);

export default CampoEntrada;