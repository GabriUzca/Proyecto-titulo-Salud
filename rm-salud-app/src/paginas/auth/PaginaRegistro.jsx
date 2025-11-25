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
  setError(null);
  setExito(null);

  // Validación de campos vacíos
  if (!username || !email || !password || !confirm) {
    setError('Todos los campos son obligatorios');
    return;
  }

  // Validación de contraseñas
  if (password !== confirm) {
    setError('Las contraseñas no coinciden');
    return;
  }

  // Validación de longitud de contraseña
  if (password.length < 8) {
    setError('La contraseña debe tener al menos 8 caracteres');
    return;
  }

  try {
    await alRegistrarse({ username, email, password });
    setExito('¡Registro exitoso! Redirigiendo…');
    setTimeout(() => navigate('/inicio'), 800);
  } catch (err) {
    console.error('Error en registro:', err.response?.data);

    // Manejo específico de errores del backend
    if (err.response?.data) {
      const errorData = err.response.data;

      // Error en el nombre de usuario
      if (errorData.username) {
        if (Array.isArray(errorData.username)) {
          const usernameError = errorData.username[0];
          if (usernameError.includes('already exists') || usernameError.includes('ya existe')) {
            setError('Este nombre de usuario ya está en uso. Por favor elige otro.');
          } else {
            setError(usernameError);
          }
        } else {
          setError('Error con el nombre de usuario');
        }
      }
      // Error en el email
      else if (errorData.email) {
        if (Array.isArray(errorData.email)) {
          const emailError = errorData.email[0];
          if (emailError.includes('already exists') || emailError.includes('ya está registrado')) {
            setError('Este correo electrónico ya está registrado. ¿Ya tienes una cuenta?');
          } else {
            setError(emailError);
          }
        } else {
          setError('Error con el correo electrónico');
        }
      }
      // Error en la contraseña
      else if (errorData.password) {
        if (Array.isArray(errorData.password)) {
          setError(errorData.password[0]);
        } else {
          setError('Error con la contraseña');
        }
      }
      // Error genérico del backend
      else if (errorData.message || errorData.error) {
        setError(errorData.message || errorData.error);
      }
      else {
        setError('Error al registrar usuario. Por favor verifica tus datos.');
      }
    } else {
      setError('Error de conexión. Por favor intenta nuevamente.');
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {exito && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {exito}
          </div>
        )}

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
