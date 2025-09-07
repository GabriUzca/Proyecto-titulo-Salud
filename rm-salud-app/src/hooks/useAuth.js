import { useState } from 'react';

/**
 * Hook personalizado para manejar la autenticación
 * Gestiona el estado de login/logout y datos del usuario
 */
export const useAuth = () => {
  const [estaLogueado, setEstaLogueado] = useState(false);
  const [usuario, setUsuario] = useState(null);

  /**
   * Función para iniciar sesión
   * @param {Object} datosUsuario - Datos del usuario (opcional)
   */
  const iniciarSesion = (datosUsuario) => {
    setEstaLogueado(true);
    setUsuario(datosUsuario || { nombre: 'Gabriel' });
  };

  /**
   * Función para registrar un nuevo usuario
   * @param {Object} datosUsuario - Datos del usuario (opcional)
   */
  const registrarse = (datosUsuario) => {
    setEstaLogueado(true);
    setUsuario(datosUsuario || { nombre: 'Gabriel' });
  };

  /**
   * Función para cerrar sesión
   */
  const cerrarSesion = () => {
    setEstaLogueado(false);
    setUsuario(null);
  };

  return {
    estaLogueado,
    usuario,
    iniciarSesion,
    registrarse,
    cerrarSesion
  };
};