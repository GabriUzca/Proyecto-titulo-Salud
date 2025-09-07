import React from 'react';
import { useNavigate } from 'react-router-dom';
import BotonAccion from '../../componentes/comunes/BotonAccion';
import CampoEntrada from '../../componentes/comunes/CampoEntrada';

/**
 * Página de inicio de sesión
 * Permite a los usuarios autenticarse en la aplicación
 */
const PaginaLogin = ({ alIniciarSesion }) => {
  const navigate = useNavigate();

  return (
    <div className="p-8 flex flex-col h-full">
      {/* Encabezado de bienvenida */}
      <div className="text-center mt-12 mb-12">
        <h1 className="text-2xl font-bold text-teal-600">RM Salud</h1>
        <h2 className="text-3xl font-bold text-gray-800 mt-8">¡Bienvenido de nuevo!</h2>
        <p className="text-gray-600 mt-2">Inicia sesión para continuar con tu experiencia.</p>
      </div>
      
      {/* Formulario de inicio de sesión */}
      <div className="space-y-4">
        <CampoEntrada type="email" placeholder="ejemplo@correo.com" />
        <CampoEntrada type="password" placeholder="Ingresa tu contraseña" />
      </div>

      {/* Opciones adicionales */}
      <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
        <label className="flex items-center">
          <input type="checkbox" className="form-checkbox h-4 w-4 text-teal-600" />
          <span className="ml-2">Recuérdame</span>
        </label>
        <a href="#" className="font-medium text-teal-600 hover:text-teal-500">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {/* Botón de inicio de sesión */}
      <div className="mt-8">
        <BotonAccion onClick={alIniciarSesion}>Iniciar sesión</BotonAccion>
      </div>
      
      {/* Separador */}
      <div className="mt-8 text-center text-gray-500 text-sm relative">
        <span className="absolute left-0 top-1/2 w-full h-px bg-gray-200"></span>
        <span className="relative bg-white px-4">o continúa con</span>
      </div>

      {/* Botones de redes sociales */}
      <div className="flex justify-center space-x-4 mt-6">
        <button className="h-12 w-12 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50">
          G
        </button>
        <button className="h-12 w-12 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50">
          O
        </button>
      </div>

      {/* Enlace a registro */}
      <div className="mt-auto text-center py-4">
        <p className="text-gray-600">
          ¿No tienes una cuenta? {' '}
          <button 
            onClick={() => navigate('/registro')} 
            className="font-bold text-teal-600 hover:underline"
          >
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
};

export default PaginaLogin;