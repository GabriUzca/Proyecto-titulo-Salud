import { useEffect, useState, useCallback } from 'react';
import { authApi } from '../servicios/api';

export const useAuth = () => {
  const [estaLogueado, setEstaLogueado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarSesion = useCallback(async () => {
    try {
      const access = localStorage.getItem('access');
      if (!access) return;
      const { data } = await authApi.me();
      setUsuario(data);
      setEstaLogueado(true);
    } catch (error) {
      setEstaLogueado(false);
      setUsuario(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await cargarSesion();
      setCargando(false);
    })();
  }, [cargarSesion]);

  const iniciarSesion = async ({ emailOrUsername, password }) => {
    setError(null);
    const { data } = await authApi.login(emailOrUsername, password);
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    await cargarSesion();
  };

  const registrarse = async ({ username, email, password }) => {
    setError(null);
    await authApi.register({ username, email, password });
    await iniciarSesion({ emailOrUsername: username, password });
  };

  const cerrarSesion = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setEstaLogueado(false);
    setUsuario(null);
  };

  return {
    estaLogueado,
    usuario,
    cargando,
    error,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    recargarUsuario: cargarSesion,  // Exponer para refrescar datos del usuario
    esAdmin: usuario?.is_staff || false  // Nueva propiedad
  };
}