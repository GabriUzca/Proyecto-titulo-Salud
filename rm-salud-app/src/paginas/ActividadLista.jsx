// src/paginas/ActividadLista.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { actividadApi } from "../servicios/actividadApi";
import { IconoPisadas } from "../componentes/iconos";

function esHoy(fechaString) {
  if (!fechaString) return false;

  // Extraer solo la parte de fecha (YYYY-MM-DD) del string recibido
  const [fechaRecibida] = fechaString.split('T');

  // Crear string de hoy en formato YYYY-MM-DD usando fecha local
  const hoy = new Date();
  const hoyString = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0')
  ].join('-');

  return fechaRecibida === hoyString;
}

export default function ActividadLista() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Mis Actividades - RM Salud';
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await actividadApi.list();
      setItems(data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("¿Eliminar este registro?")) return;
    await actividadApi.remove(id);
    load();
  };

  // Calcular minutos de actividad hoy usando la función esHoy() corregida
  const minutosHoy = items
    .filter(i => esHoy(i.fecha))
    .reduce((acc, i) => acc + (i.duracion_min || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando actividades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">{/* pb-20 para navbar */}
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-b-3xl shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/inicio')}
              className="mr-3 p-2 hover:bg-teal-400 rounded-full transition-colors"
            >
              ←
            </button>
            <h2 className="text-2xl font-bold">Mis Actividades</h2>
          </div>
          <Link
            to="/actividad/nueva"
            className="bg-white text-teal-600 font-bold py-2 px-4 rounded-lg hover:bg-teal-50 transition-colors shadow-md"
          >
            + Nueva
          </Link>
        </div>

        {/* Estadística del día */}
        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/30 p-2 rounded-lg mr-3">
                <IconoPisadas className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-teal-100 text-sm">Minutos de actividad hoy</p>
                <p className="text-3xl font-bold">{minutosHoy} <span className="text-lg">min</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de actividades */}

      <div className="px-4 pb-6 max-w-2xl mx-auto">
        {items.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-md text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconoPisadas className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No hay actividades registradas
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza a registrar tu actividad física diaria
            </p>
            <Link
              to="/actividad/nueva"
              className="inline-block bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-colors shadow-md"
            >
              + Registrar primera actividad
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(a => (
              <div key={a.id} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="bg-teal-100 p-3 rounded-lg mr-4">
                      <IconoPisadas className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-lg">
                        {a.tipo.charAt(0).toUpperCase() + a.tipo.slice(1)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        📅 {new Date(a.fecha).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-2xl text-teal-600">{a.duracion_min}</p>
                      <p className="text-xs text-gray-500">minutos</p>
                      {a.calorias && (
                        <p className="text-xs text-orange-600 font-semibold mt-1">🔥 {a.calorias} kcal</p>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/actividad/editar/${a.id}`)}
                      className="p-2 hover:bg-teal-50 rounded-lg transition-colors text-teal-600 hover:text-teal-700"
                      title="Editar actividad"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => remove(a.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500 hover:text-red-700"
                      title="Eliminar actividad"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
