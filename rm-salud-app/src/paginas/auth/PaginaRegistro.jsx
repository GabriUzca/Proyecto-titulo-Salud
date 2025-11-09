import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BotonAccion from '../../componentes/comunes/BotonAccion';
import CampoEntrada from '../../componentes/comunes/CampoEntrada';

const PaginaRegistro = ({ alRegistrarse }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState(null);
  const [exito, setExito]       = useState(null);

  useEffect(() => {
    document.title = 'Registro - RM Salud';
  }, []);

const onSubmit = async (e) => {
  e.preventDefault();
  if (password !== confirm) {
    setError('Las contraseñas no coinciden');
    return;
  }
  try {
    await alRegistrarse({ username, email, password });
    setExito('¡Registro exitoso! Redirigiendo…');
    setTimeout(() => navigate('/inicio'), 800);
  } catch (err) {
    if (err.response?.data?.password) {
      setError(err.response.data.password[0]); // muestra: "Asegúrate de que este campo tenga al menos 8 caracteres."
    } else if (err.response?.data?.email) {
      setError(err.response.data.email[0]); // ej: "Este correo ya está registrado."
    } else {
      setError('Error al registrar usuario');
    }
  }
};


  return (
    <div className="p-8 flex flex-col h-full bg-white">
      <div className="text-center mt-12 mb-12">
        <h1 className="text-2xl font-bold text-teal-600">RM Salud</h1>
        <h2 className="text-3xl font-bold text-gray-800 mt-4">
          Crear una cuenta
        </h2>
        <p className="text-gray-600 mt-2">
          Únete a nuestra comunidad de salud y bienestar.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <CampoEntrada
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <CampoEntrada
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <CampoEntrada
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <CampoEntrada
          type="password"
          placeholder="Confirma tu contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {exito && <p className="text-green-600 text-sm">{exito}</p>} {/* 👈 nuevo */}
      <div className="mt-6">
        <BotonAccion>Crear cuenta</BotonAccion>
      </div>
      </form>

      <div className="mt-auto text-center py-4">
        <p className="text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-bold text-teal-600 hover:underline"
          >
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default PaginaRegistro;
