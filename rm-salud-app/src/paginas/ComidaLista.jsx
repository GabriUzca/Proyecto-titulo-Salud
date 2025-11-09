import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { alimentacionApi } from "../servicios/alimentacionApi";
import { IconoLlama, IconoCasa, IconoPisadas, IconoUsuario } from "../componentes/iconos";

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

export default function ComidaLista() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Mis Comidas - RM Salud';
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await alimentacionApi.list();
      setItems(data);
    } catch (err) {
      console.error("Error cargando comidas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm("¿Eliminar este registro?")) return;
    try {
      await alimentacionApi.remove(id);
      load();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  // Calcular calorías consumidas hoy usando la función esHoy() corregida
  const kcalHoy = items
    .filter(i => esHoy(i.fecha))
    .reduce((acc, i) => acc + (i.calorias || 0), 0);

  const getHorarioEmoji = (horario) => {
    const emojis = {
      desayuno: '🌅',
      almuerzo: '☀️',
      cena: '🌙',
      snack: '🍎'
    };
    return emojis[horario] || '🍽️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando comidas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">{/* pb-20 para navbar */}
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-b-3xl shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/inicio')}
              className="mr-3 p-2 hover:bg-orange-400 rounded-full transition-colors"
            >
              ← 
            </button>
            <h2 className="text-2xl font-bold">Mis Comidas</h2>
          </div>
          <Link
            to="/comida/nueva"
            className="bg-white text-orange-600 font-bold py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors shadow-md"
          >
            + Nueva
          </Link>
        </div>
        
        {/* Estadística del día */}
        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/30 p-2 rounded-lg mr-3">
                <IconoLlama className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-orange-100 text-sm">Calorías consumidas hoy</p>
                <p className="text-3xl font-bold">{kcalHoy} <span className="text-lg">kcal</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de comidas */}
      <div className="px-4 pb-6 max-w-2xl mx-auto">
        {items.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-md text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconoLlama className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No hay comidas registradas
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza a registrar tu alimentación diaria
            </p>
            <Link 
              to="/comida/nueva" 
              className="inline-block bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Registrar primera comida
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(i => (
              <div 
                key={i.id} 
                className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <div className="bg-orange-100 p-3 rounded-lg mr-3">
                      <span className="text-2xl">{getHorarioEmoji(i.horario)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                          {i.horario.charAt(0).toUpperCase() + i.horario.slice(1)}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">
                        {i.nombre}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center">
                          📅 {new Date(i.fecha).toLocaleDateString('es-ES')}
                        </span>
                        <span className="flex items-center font-semibold text-orange-600">
                          🔥 {i.calorias} kcal
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(i.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors ml-2"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navbar Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-4 h-16">
            <button
              onClick={() => navigate('/inicio')}
              className="flex flex-col items-center justify-center transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            >
              <IconoCasa className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Inicio</span>
            </button>
            
            <button
              onClick={() => navigate('/actividad')}
              className="flex flex-col items-center justify-center transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            >
              <IconoPisadas className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Actividad</span>
            </button>
            
            <button
              onClick={() => navigate('/comida')}
              className="flex flex-col items-center justify-center transition-all duration-200 text-orange-600 bg-orange-50"
            >
              <IconoLlama className="w-6 h-6 mb-1 scale-110" />
              <span className="text-xs font-bold">Comida</span>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-orange-600 rounded-b-full" />
            </button>
            
            <button
              onClick={() => navigate('/perfil')}
              className="flex flex-col items-center justify-center transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            >
              <IconoUsuario className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Perfil</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}