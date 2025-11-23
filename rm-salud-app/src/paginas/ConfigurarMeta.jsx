import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { metasApi } from "../servicios/metasApi";
import { useAuth } from "../hooks/useAuth";

export default function ConfigurarMeta() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [form, setForm] = useState({
    peso_actual: "",
    peso_objetivo: "",
    fecha_objetivo: "",
    nivel_actividad: "sedentario"
  });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cargandoActual, setCargandoActual] = useState(true);
  const [advertencias, setAdvertencias] = useState([]);

  useEffect(() => {
    document.title = 'Configurar Meta - RM Salud';
    cargarMetaActual();
  }, []);

  // Actualizar peso actual cuando el usuario se carga
  useEffect(() => {
    if (usuario?.peso && !form.peso_actual) {
      setForm(f => ({ ...f, peso_actual: usuario.peso }));
    }
  }, [usuario]);

  const cargarMetaActual = async () => {
    try {
      const { data } = await metasApi.getActiva();
      // Si tiene meta activa, pre-llenar el formulario con datos actuales
      setForm({
        peso_actual: data.peso_actual || usuario?.peso || "",
        peso_objetivo: data.peso_objetivo || "",
        fecha_objetivo: data.fecha_objetivo || "",
        nivel_actividad: data.nivel_actividad || "sedentario"
      });
    } catch (err) {
      // Si no hay meta activa, usar el peso del perfil si existe
      setForm(f => ({
        ...f,
        peso_actual: usuario?.peso || ""
      }));
    } finally {
      setCargandoActual(false);
    }
  };

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    // Limpiar advertencias al cambiar valores
    setAdvertencias([]);
    setMsg(null);
  };

  // Calcular advertencias en tiempo real
  useEffect(() => {
    const calcularAdvertencias = () => {
      const warns = [];

      if (!form.peso_objetivo || !form.fecha_objetivo) return;

      const pesoActual = parseFloat(form.peso_actual);
      const pesoObjetivo = parseFloat(form.peso_objetivo);

      if (isNaN(pesoActual) || isNaN(pesoObjetivo)) return;

      const diferencia = Math.abs(pesoActual - pesoObjetivo);
      const fechaObj = new Date(form.fecha_objetivo);
      const hoy = new Date();
      const diasRestantes = Math.ceil((fechaObj - hoy) / (1000 * 60 * 60 * 24));

      if (diasRestantes > 0) {
        const kgPorSemana = (diferencia / diasRestantes) * 7;
        const deficitDiario = (diferencia * 7700) / diasRestantes;

        if (deficitDiario > 1000) {
          warns.push({
            tipo: 'extremo',
            emoji: '🚨',
            mensaje: `Déficit muy alto (${Math.round(deficitDiario)} kcal/día). Perder/ganar ${kgPorSemana.toFixed(1)} kg por semana puede ser peligroso para tu salud.`
          });
        } else if (deficitDiario >= 500) {
          warns.push({
            tipo: 'correcto',
            emoji: '✅',
            mensaje: `Ritmo saludable (${Math.round(deficitDiario)} kcal/día). Aproximadamente ${kgPorSemana.toFixed(1)} kg por semana.`
          });
        } else if (deficitDiario < 300) {
          warns.push({
            tipo: 'lento',
            emoji: '🐢',
            mensaje: `Ritmo muy lento (${Math.round(deficitDiario)} kcal/día). Aproximadamente ${kgPorSemana.toFixed(1)} kg por semana. Considera una fecha más cercana.`
          });
        }
      }

      setAdvertencias(warns);
    };

    calcularAdvertencias();
  }, [form.peso_actual, form.peso_objetivo, form.fecha_objetivo]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    // Validaciones frontend
    if (!form.peso_actual || !form.peso_objetivo || !form.fecha_objetivo) {
      setMsg({ tipo: "error", texto: "Por favor completa todos los campos obligatorios" });
      return;
    }

    const pesoActual = parseFloat(form.peso_actual);
    const pesoObjetivo = parseFloat(form.peso_objetivo);

    if (pesoActual === pesoObjetivo) {
      setMsg({ tipo: "error", texto: "El peso actual y el peso objetivo no pueden ser iguales" });
      return;
    }

    const diferencia = Math.abs(pesoActual - pesoObjetivo);
    if (diferencia > 50) {
      setMsg({ tipo: "error", texto: "La diferencia entre peso actual y objetivo no puede ser mayor a 50 kg. Por favor, establece metas más pequeñas y alcanzables." });
      return;
    }

    const fechaObjetivo = new Date(form.fecha_objetivo);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaObjetivo <= hoy) {
      setMsg({ tipo: "error", texto: "La fecha objetivo debe ser posterior a hoy" });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        peso_actual: pesoActual,
        peso_objetivo: pesoObjetivo,
        fecha_objetivo: form.fecha_objetivo,
        nivel_actividad: form.nivel_actividad
      };

      await metasApi.create(payload);
      setMsg({ tipo: "success", texto: "✅ Meta configurada exitosamente" });
      setTimeout(() => navigate("/progreso-meta"), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || "Error al configurar la meta";
      setMsg({ tipo: "error", texto: `❌ ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  if (cargandoActual) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const tipoMeta = form.peso_actual && form.peso_objetivo
    ? (parseFloat(form.peso_objetivo) < parseFloat(form.peso_actual) ? "Pérdida" : "Ganancia")
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-b-3xl shadow-xl mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/inicio')}
            className="mr-3 p-2 hover:bg-purple-400 rounded-full transition-colors"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold">Configurar Meta de Peso</h2>
            <p className="text-purple-100 text-sm mt-1">Define tu objetivo de salud</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="px-4 max-w-md mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          {/* Indicador de tipo de meta */}
          {tipoMeta && (
            <div className={`mb-4 p-3 rounded-lg text-center font-semibold ${
              tipoMeta === "Pérdida"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}>
              {tipoMeta === "Pérdida" ? "📉" : "📈"} Meta de {tipoMeta} de Peso
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Peso actual */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Peso Actual (kg) *
              </label>
              <input
                name="peso_actual"
                type="number"
                step="0.1"
                value={form.peso_actual}
                readOnly
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Peso tomado de tu perfil
              </p>
            </div>

            {/* Peso objetivo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Peso Objetivo (kg) *
              </label>
              <input
                name="peso_objetivo"
                type="number"
                step="0.1"
                value={form.peso_objetivo}
                onChange={onChange}
                placeholder="Ej: 65.0"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                La diferencia no puede ser mayor a 50 kg
              </p>
            </div>

            {/* Fecha objetivo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Objetivo *
              </label>
              <input
                name="fecha_objetivo"
                type="date"
                value={form.fecha_objetivo}
                onChange={onChange}
                required
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Debe ser una fecha futura
              </p>
            </div>

            {/* Nivel de actividad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nivel de Actividad Física *
              </label>
              <select
                name="nivel_actividad"
                value={form.nivel_actividad}
                onChange={onChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="sedentario">🪑 Sedentario (poco o ningún ejercicio)</option>
                <option value="ligero">🚶 Ligero (ejercicio 1-3 días/semana)</option>
                <option value="moderado">🏃 Moderado (ejercicio 3-5 días/semana)</option>
                <option value="activo">💪 Activo (ejercicio 6-7 días/semana)</option>
                <option value="muy_activo">🏋️ Muy Activo (ejercicio intenso diario)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Este factor afecta tu gasto energético total
              </p>
            </div>

            {/* Advertencias sobre el ritmo */}
            {advertencias.length > 0 && (
              <div className="space-y-2">
                {advertencias.map((adv, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      adv.tipo === 'extremo'
                        ? 'bg-red-50 border-red-200'
                        : adv.tipo === 'correcto'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-2">{adv.emoji}</span>
                      <p className={`text-sm ${
                        adv.tipo === 'extremo'
                          ? 'text-red-700'
                          : adv.tipo === 'correcto'
                          ? 'text-green-700'
                          : 'text-yellow-700'
                      }`}>
                        {adv.mensaje}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mensaje de feedback */}
            {msg && (
              <div className={`p-4 rounded-lg border ${
                msg.tipo === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-green-50 border-green-200 text-green-700"
              }`}>
                {msg.texto}
              </div>
            )}

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "🎯 Establecer Meta"}
            </button>
          </form>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Tu meta calórica diaria se calculará automáticamente</li>
              <li>• Recibirás recomendaciones sobre el ritmo de tu progreso</li>
              <li>• Puedes archivar o crear nuevas metas en cualquier momento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
