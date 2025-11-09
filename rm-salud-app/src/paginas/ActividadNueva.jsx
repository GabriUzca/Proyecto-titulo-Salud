import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { actividadApi } from "../servicios/actividadApi";
import { IconoCasa, IconoPisadas, IconoLlama, IconoUsuario } from "../componentes/iconos";

export default function ActividadNueva() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tipo: "caminar",
    duracion_min: "",
    calorias: "",
    fecha: new Date().toISOString().split('T')[0]
  });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Nueva Actividad - RM Salud';
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    
    if (!form.duracion_min || !form.fecha) {
      setMsg("Por favor completa los campos obligatorios");
      return;
    }
    
    try {
      setLoading(true);
      const payload = {
        tipo: form.tipo,
        duracion_min: Number(form.duracion_min),
        calorias: form.calorias ? Number(form.calorias) : null,
        fecha: form.fecha
      };
      await actividadApi.create(payload);
      setMsg("✅ Actividad guardada");
      // Navegar al dashboard para ver los totales actualizados
      setTimeout(() => navigate("/inicio"), 1500);
    } catch (err) {
      setMsg("❌ Error al guardar: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">{/* pb-20 para navbar */}
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-b-3xl shadow-xl mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/actividad')}
            className="mr-3 p-2 hover:bg-teal-400 rounded-full transition-colors"
          >
            ← 
          </button>
          <h2 className="text-2xl font-bold">Nueva Actividad</h2>
        </div>
      </div>

      {/* Formulario */}
      <div className="px-4 max-w-md mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Tipo de actividad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de actividad *
              </label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={onChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="caminar">🚶 Caminar</option>
                <option value="correr">🏃 Correr</option>
                <option value="bicicleta">🚴 Bicicleta</option>
                <option value="gimnasio">💪 Gimnasio</option>
                <option value="otro">🏋️ Otro</option>
              </select>
            </div>
            
            {/* Duración */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duración (minutos) *
              </label>
              <input
                name="duracion_min"
                type="number"
                value={form.duracion_min}
                onChange={onChange}
                placeholder="Ej: 30"
                required
                min="1"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            {/* Calorías */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calorías quemadas (opcional)
              </label>
              <input
                name="calorias"
                type="number"
                value={form.calorias}
                onChange={onChange}
                placeholder="Ej: 250"
                min="0"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            {/* Fecha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                name="fecha"
                type="date"
                value={form.fecha}
                onChange={onChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/actividad")}
                className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
          
          {/* Mensaje de estado */}
          {msg && (
            <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${
              msg.includes('Error') || msg.includes('❌')
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {msg}
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="mt-4 bg-teal-50 border border-teal-200 p-4 rounded-xl">
          <p className="text-sm text-teal-800">
            💡 <strong>Tip:</strong> Registra tus actividades regularmente para ver tu progreso y alcanzar tus metas.
          </p>
        </div>
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
              className="flex flex-col items-center justify-center transition-all duration-200 text-teal-600 bg-teal-50"
            >
              <IconoPisadas className="w-6 h-6 mb-1 scale-110" />
              <span className="text-xs font-bold">Actividad</span>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-teal-600 rounded-b-full" />
            </button>
            
            <button
              onClick={() => navigate('/comida')}
              className="flex flex-col items-center justify-center transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            >
              <IconoLlama className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Comida</span>
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