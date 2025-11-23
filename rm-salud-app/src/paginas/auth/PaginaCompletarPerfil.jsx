import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import BotonAccion from '../../componentes/comunes/BotonAccion';
import CampoEntrada from '../../componentes/comunes/CampoEntrada';
import api from '../../servicios/api';

const PaginaCompletarPerfil = () => {
  const navigate = useNavigate();
  const { recargarUsuario } = useAuth();
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [sexo, setSexo] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    document.title = 'Completar Perfil - RM Salud';
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!edad || !peso || !altura || !sexo) {
      setError('Todos los campos son obligatorios');
      return;
    }

    // Validar que se use coma en lugar de punto para decimales
    if (peso.includes('.')) {
      setError('Por favor usa coma (,) en lugar de punto (.) para decimales en el peso. Ejemplo: 70,5');
      return;
    }

    if (altura.includes('.')) {
      setError('Por favor usa coma (,) en lugar de punto (.) para decimales en la altura. Ejemplo: 170,5');
      return;
    }

    // Convertir comas a puntos para parseo
    const pesoParseado = peso.replace(',', '.');
    const alturaParseada = altura.replace(',', '.');

    const edadNum = parseInt(edad);
    const pesoNum = parseFloat(pesoParseado);
    const alturaNum = parseFloat(alturaParseada);

    if (edadNum < 1 || edadNum > 120) {
      setError('La edad debe estar entre 1 y 120 años');
      return;
    }

    if (pesoNum < 1 || pesoNum > 500) {
      setError('El peso debe estar entre 1 y 500 kg');
      return;
    }

    if (alturaNum < 50 || alturaNum > 300) {
      setError('La altura debe estar entre 50 y 300 cm');
      return;
    }

    try {
      setCargando(true);

      // Actualizar el perfil
      const response = await api.patch('/api/auth/perfil', {
        edad: edadNum,
        peso: pesoNum,
        altura: alturaNum,
        sexo: sexo
      });

      console.log('Perfil actualizado exitosamente:', response.data);

      // Recargar los datos del usuario para actualizar el estado
      await recargarUsuario();

      console.log('Usuario recargado, navegando a /inicio');

      // Pequeño delay para asegurar que el estado se actualice
      setTimeout(() => {
        navigate('/inicio', { replace: true });
      }, 100);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-teal-600 mb-2">¡Completa tu perfil!</h1>
          <p className="text-gray-600">
            Para brindarte una mejor experiencia, necesitamos algunos datos básicos.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edad (años) *
            </label>
            <CampoEntrada
              type="number"
              placeholder="Ej: 25"
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              name="edad"
              min="1"
              max="120"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sexo *
            </label>
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              name="sexo"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            >
              <option value="">Selecciona una opción</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso (kg) *
            </label>
            <CampoEntrada
              type="text"
              placeholder="Ej: 70,5"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              name="peso"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Usa coma (,) para decimales. Ejemplo: 70,5
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Altura (cm) *
            </label>
            <CampoEntrada
              type="text"
              placeholder="Ej: 170,5"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              name="altura"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Usa coma (,) para decimales. Ejemplo: 170,5
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="pt-4">
            <BotonAccion disabled={cargando}>
              {cargando ? 'Guardando...' : 'Completar perfil'}
            </BotonAccion>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          * Todos los campos son obligatorios
        </div>
      </div>
    </div>
  );
};

export default PaginaCompletarPerfil;
