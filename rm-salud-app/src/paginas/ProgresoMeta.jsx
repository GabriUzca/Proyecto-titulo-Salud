import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { metasApi } from "../servicios/metasApi";

export default function ProgresoMeta() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [archivando, setArchivando] = useState(false);

  useEffect(() => {
    document.title = 'Progreso Meta - RM Salud';
    cargarMeta();
  }, []);

  const cargarMeta = async () => {
    try {
      setLoading(true);
      const { data } = await metasApi.getActiva();
      setMeta(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No tienes una meta activa. Crea una nueva meta para comenzar.");
      } else {
        setError("Error al cargar la meta");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleArchivar = async () => {
    if (!meta) return;

    const confirmar = window.confirm("¿Estás seguro de que deseas archivar esta meta? Podrás crear una nueva después.");
    if (!confirmar) return;

    try {
      setArchivando(true);
      await metasApi.archivar(meta.id);
      navigate("/configurar-meta");
    } catch (err) {
      alert("Error al archivar la meta: " + (err.response?.data?.detail || err.message));
      setArchivando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando meta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="text-center px-4">
          <div className="bg-white p-8 rounded-2xl shadow-md max-w-md">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/configurar-meta")}
              className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Crear Nueva Meta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!meta) return null;

  // Calcular porcentaje de progreso
  const diferenciaTotal = Math.abs(meta.peso_actual - meta.peso_objetivo);
  const diasTranscurridos = meta.dias_totales - meta.dias_restantes;
  const porcentajeTiempo = meta.dias_totales > 0 ? (diasTranscurridos / meta.dias_totales) * 100 : 0;

  // Determinar color del ritmo
  const getRitmoColor = (tipo) => {
    switch(tipo) {
      case 'extremo': return 'text-red-600 bg-red-50 border-red-200';
      case 'correcto': return 'text-green-600 bg-green-50 border-green-200';
      case 'lento': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-xl mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/inicio')}
              className="mr-3 p-2 hover:bg-purple-400 rounded-full transition-colors"
            >
              ←
            </button>
            <div>
              <h2 className="text-2xl font-bold">Mi Meta de Peso</h2>
              <p className="text-purple-100 text-sm mt-1">Seguimiento de progreso</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 max-w-2xl mx-auto space-y-4">
        {/* Tarjeta de Resumen */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-800">Objetivo</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              meta.tipo_meta === "perdida"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}>
              {meta.tipo_meta === "perdida" ? "📉 Pérdida" : "📈 Ganancia"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Peso Actual</p>
              <p className="text-2xl font-bold text-gray-800">{meta.peso_actual} kg</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-600 mb-1">Peso Objetivo</p>
              <p className="text-2xl font-bold text-purple-700">{meta.peso_objetivo} kg</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <p className="text-xs text-gray-600 mb-1">Diferencia a lograr</p>
            <p className="text-xl font-bold text-purple-700">
              {diferenciaTotal.toFixed(1)} kg
            </p>
          </div>
        </div>

        {/* Tarjeta de Tiempo */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Tiempo</h3>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progreso temporal</span>
              <span className="font-semibold text-gray-800">{Math.round(porcentajeTiempo)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(porcentajeTiempo, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{meta.dias_restantes}</p>
              <p className="text-xs text-gray-600">días restantes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">{diasTranscurridos}</p>
              <p className="text-xs text-gray-600">días transcurridos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">{meta.dias_totales}</p>
              <p className="text-xs text-gray-600">días totales</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Fecha objetivo</p>
            <p className="font-semibold text-gray-800">
              {new Date(meta.fecha_objetivo).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Tarjeta de Calorías */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Plan Calórico</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">TMB (Tasa Metabólica Basal)</span>
              <span className="font-bold text-gray-800">{Math.round(meta.tmb)} kcal</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">GET (Gasto Energético Total)</span>
              <span className="font-bold text-gray-800">{Math.round(meta.get)} kcal</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm text-blue-700 font-semibold">
                {meta.tipo_meta === "perdida" ? "Déficit" : "Superávit"} Diario
              </span>
              <span className="font-bold text-blue-700">
                {Math.abs(Math.round(meta.deficit_diario))} kcal
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <span className="text-sm text-white font-semibold">Meta Calórica Diaria</span>
              <span className="font-bold text-white text-lg">
                {Math.round(meta.meta_calorica_diaria)} kcal
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Nivel de actividad física</p>
            <p className="font-semibold text-gray-800 capitalize">
              {meta.nivel_actividad.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Tarjeta de Validación del Ritmo */}
        {meta.ritmo_validacion && (
          <div className={`p-6 rounded-2xl shadow-md border ${getRitmoColor(meta.ritmo_validacion.tipo)}`}>
            <div className="flex items-start">
              <span className="text-3xl mr-3">{meta.ritmo_validacion.emoji}</span>
              <div>
                <h3 className="font-bold text-lg mb-2">
                  Ritmo: {meta.ritmo_validacion.tipo === 'extremo' ? 'Extremo' : meta.ritmo_validacion.tipo === 'correcto' ? 'Correcto' : 'Lento'}
                </h3>
                <p className="text-sm leading-relaxed">
                  {meta.ritmo_validacion.mensaje}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/configurar-meta")}
            className="flex-1 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            ✏️ Crear Nueva Meta
          </button>
          <button
            onClick={handleArchivar}
            disabled={archivando}
            className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {archivando ? "Archivando..." : "📁 Archivar Meta"}
          </button>
        </div>
      </div>
    </div>
  );
}
