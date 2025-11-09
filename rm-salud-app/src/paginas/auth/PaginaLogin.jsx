import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BotonAccion from '../../componentes/comunes/BotonAccion';
import CampoEntrada from '../../componentes/comunes/CampoEntrada';

const PaginaLogin = ({ alIniciarSesion }) => {
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Iniciar Sesión - RM Salud';
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await alIniciarSesion({ emailOrUsername, password });
      navigate('/inicio');
    } catch (err) {
      setError('Credenciales inválidas o error de servidor');
    }
  };

  return (
    <div className="p-8 flex flex-col h-full">
      <div className="text-center mt-12 mb-12">
        <h1 className="text-2xl font-bold text-teal-600">RM Salud</h1>
        <h2 className="text-3xl font-bold text-gray-800 mt-8">
          ¡Bienvenido de nuevo!
        </h2>
        <p className="text-gray-600 mt-2">
          Inicia sesión para continuar con tu experiencia.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <CampoEntrada
          type="text"
          placeholder="Usuario o correo"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          name="emailOrUsername"
        />
        <CampoEntrada
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          name="password"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="mt-6">
          <BotonAccion>Iniciar sesión</BotonAccion>
        </div>
      </form>

      <div className="mt-auto text-center py-4 space-y-3">
        <p className="text-gray-600">
          ¿No tienes una cuenta?{' '}
          <button
            onClick={() => navigate('/registro')}
            className="font-bold text-teal-600 hover:underline"
          >
            Regístrate
          </button>
        </p>

        <div className="pt-3 border-t border-gray-200">
          <p className="text-gray-600 mb-2">¿Eres una empresa u organizador?</p>
          <button
            onClick={() => navigate('/solicitar-evento')}
            className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
          >
            Solicita publicar tu evento aquí
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginaLogin;
