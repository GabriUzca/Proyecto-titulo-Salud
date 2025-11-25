import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { alimentacionApi } from "../servicios/alimentacionApi";
import { IconoCasa, IconoPisadas, IconoLlama, IconoUsuario } from "../componentes/iconos";

export default function ComidaNueva() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL if editing
  const esEdicion = Boolean(id);

  const [form, setForm] = useState({
    nombre: "",
    calorias: "",
    horario: "almuerzo",
    fecha: new Date().toISOString().split('T')[0]
  });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(esEdicion);

  useEffect(() => {
    document.title = esEdicion ? 'Editar Comida - RM Salud' : 'Nueva Comida - RM Salud';

    // Load existing data if editing
    if (esEdicion) {
      cargarComida();
    }
  }, [esEdicion]);

  const cargarComida = async () => {
    try {
      setLoadingData(true);
      const { data } = await alimentacionApi.list();
      const comida = data.find(c => c.id === parseInt(id));

      if (comida) {
        setForm({
          nombre: comida.nombre,
          calorias: comida.calorias,
          horario: comida.horario,
          fecha: comida.fecha.split('T')[0]
        });
      } else {
        setMsg("❌ Comida no encontrada");
        setTimeout(() => navigate("/comida"), 2000);
      }
    } catch (err) {
      setMsg("❌ Error al cargar comida");
      setTimeout(() => navigate("/comida"), 2000);
    } finally {
      setLoadingData(false);
    }
  };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!form.nombre || !form.calorias || !form.fecha) {
      setMsg("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        nombre: form.nombre,
        calorias: Number(form.calorias),
        horario: form.horario,
        fecha: form.fecha
      };

      if (esEdicion) {
        await alimentacionApi.update(id, payload);
        setMsg("✅ Comida actualizada");
      } else {
        await alimentacionApi.create(payload);
        setMsg("✅ Comida registrada");
      }

      // Navegar al dashboard para ver los totales actualizados
      setTimeout(() => navigate("/inicio"), 1500);
    } catch (err) {
      setMsg("❌ Error al guardar: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando comida...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">{/* pb-20 para navbar */}
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-b-3xl shadow-xl mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/comida')}
            className="mr-3 p-2 hover:bg-orange-400 rounded-full transition-colors"
          >
            ←
          </button>
          <h2 className="text-2xl font-bold">{esEdicion ? 'Editar Comida' : 'Registrar Comida'}</h2>
        </div>
      </div>

      {/* Formulario */}
      <div className="px-4 max-w-md mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del platillo *
              </label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                placeholder="Ej: Ensalada césar"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            {/* Calorías */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calorías (kcal) *
              </label>
              <input
                name="calorias"
                type="number"
                value={form.calorias}
                onChange={onChange}
                placeholder="Ej: 350"
                required
                min="0"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            {/* Horario */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Horario *
              </label>
              <select
                name="horario"
                value={form.horario}
                onChange={onChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="desayuno">🌅 Desayuno</option>
                <option value="almuerzo">☀️ Almuerzo</option>
                <option value="cena">🌙 Cena</option>
                <option value="snack">🍎 Snack</option>
              </select>
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/comida")}
                className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Guardando..." : (esEdicion ? "Actualizar" : "Guardar")}
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
        <div className="mt-4 bg-orange-50 border border-orange-200 p-4 rounded-xl">
          <p className="text-sm text-orange-800">
            💡 <strong>Tip:</strong> Registra todas tus comidas para tener un mejor control de tu consumo calórico diario.
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