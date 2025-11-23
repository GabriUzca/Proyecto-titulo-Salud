// rm-salud-app/src/paginas/EditarUsuario.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../servicios/adminApi";

export default function EditarUsuario() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    edad: "",
    peso: "",
    altura: "",
    sexo: ""
  });
  const [usuario, setUsuario] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [comidas, setComidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [mostrarActividades, setMostrarActividades] = useState(false);
  const [mostrarComidas, setMostrarComidas] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const { data } = await adminApi.getUser(id);
        setUsuario(data);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          edad: data.profile?.edad || "",
          peso: data.profile?.peso || "",
          altura: data.profile?.altura || "",
          sexo: data.profile?.sexo || ""
        });

        // Cargar actividades y comidas
        try {
          const actividadesRes = await adminApi.getUserActivities(id);
          setActividades(actividadesRes.data.actividades || []);
        } catch (err) {
          console.error("Error cargando actividades:", err);
        }

        try {
          const comidasRes = await adminApi.getUserMeals(id);
          setComidas(comidasRes.data.comidas || []);
        } catch (err) {
          console.error("Error cargando comidas:", err);
        }
      } catch (err) {
        console.error("Error cargando usuario:", err);
        setMensaje({ tipo: "error", texto: "Error al cargar usuario" });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  const calcularIMC = () => {
    const peso = parseFloat(form.peso);
    const altura = parseFloat(form.altura);
    if (!peso || !altura || altura === 0) return null;
    const alturaMetros = altura / 100;
    return (peso / (alturaMetros * alturaMetros)).toFixed(1);
  };

  const getIMCCategoria = (imc) => {
    if (!imc) return null;
    if (imc < 18.5) return { texto: "Bajo peso", color: "text-blue-600" };
    if (imc < 25) return { texto: "Normal", color: "text-green-600" };
    if (imc < 30) return { texto: "Sobrepeso", color: "text-yellow-600" };
    return { texto: "Obesidad", color: "text-red-600" };
  };

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    try {
      setSaving(true);
      await adminApi.updateUserInfo(id, form);
      setMensaje({ tipo: "success", texto: "✅ Usuario actualizado exitosamente" });
      setTimeout(() => navigate("/admin/usuarios"), 1500);
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: err.response?.data?.error || "Error al actualizar usuario"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuario...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Usuario no encontrado</p>
          <button
            onClick={() => navigate("/admin/usuarios")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const imc = calcularIMC();
  const imcCategoria = getIMCCategoria(imc);

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-b-3xl shadow-xl mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/usuarios')}
            className="mr-3 p-2 hover:bg-purple-500 rounded-full transition-colors"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold">Editar Usuario</h2>
            <p className="text-purple-200 text-sm">@{usuario.username}</p>
          </div>
        </div>
      </div>

      <div className="px-4 max-w-2xl mx-auto space-y-4">
        {/* Mensaje de feedback */}
        {mensaje && (
          <div className={`p-4 rounded-xl border ${
            mensaje.tipo === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Información del usuario */}
        <div className="bg-white p-4 rounded-2xl shadow-md">
          <h3 className="font-bold text-lg text-gray-800 mb-3">Información de la cuenta</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Usuario</p>
              <p className="font-semibold text-gray-800">@{usuario.username}</p>
            </div>
            <div>
              <p className="text-gray-500">Estado</p>
              <p className={`font-semibold ${usuario.is_active ? "text-green-600" : "text-red-600"}`}>
                {usuario.is_active ? "✅ Activo" : "🚫 Inactivo"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Fecha de registro</p>
              <p className="font-semibold text-gray-800">
                {new Date(usuario.date_joined).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Último acceso</p>
              <p className="font-semibold text-gray-800">
                {usuario.last_login
                  ? new Date(usuario.last_login).toLocaleDateString('es-ES')
                  : "Nunca"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Actividades</p>
              <p className="font-semibold text-gray-800">🏃 {usuario.total_actividades}</p>
            </div>
            <div>
              <p className="text-gray-500">Comidas</p>
              <p className="font-semibold text-gray-800">🍽️ {usuario.total_comidas}</p>
            </div>
            {imc && (
              <div className="col-span-2">
                <p className="text-gray-500">IMC (Índice de Masa Corporal)</p>
                <p className="font-bold text-xl">
                  {imc} <span className={`text-sm ${imcCategoria.color}`}>({imcCategoria.texto})</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Editar información</h3>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre
              </label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={onChange}
                placeholder="Nombre del usuario"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Apellido
              </label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={onChange}
                placeholder="Apellido del usuario"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="email@ejemplo.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Sexo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sexo
              </label>
              <select
                name="sexo"
                value={form.sexo}
                onChange={onChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>

            {/* Datos físicos */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Información física</h4>
              <div className="grid grid-cols-3 gap-3">
                {/* Edad */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Edad
                  </label>
                  <input
                    name="edad"
                    type="number"
                    value={form.edad}
                    onChange={onChange}
                    placeholder="25"
                    min="0"
                    max="120"
                    className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                  />
                  <span className="text-xs text-gray-500 block text-center mt-1">años</span>
                </div>

                {/* Peso */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Peso
                  </label>
                  <input
                    name="peso"
                    type="number"
                    step="0.1"
                    value={form.peso}
                    onChange={onChange}
                    placeholder="70"
                    min="0"
                    className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                  />
                  <span className="text-xs text-gray-500 block text-center mt-1">kg</span>
                </div>

                {/* Altura */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Altura
                  </label>
                  <input
                    name="altura"
                    type="number"
                    step="0.1"
                    value={form.altura}
                    onChange={onChange}
                    placeholder="170"
                    min="0"
                    className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                  />
                  <span className="text-xs text-gray-500 block text-center mt-1">cm</span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/admin/usuarios")}
                className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : "💾 Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>

        {/* Actividades del usuario */}
        <div className="bg-white p-4 rounded-2xl shadow-md">
          <button
            onClick={() => setMostrarActividades(!mostrarActividades)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="font-bold text-lg text-gray-800">
              Actividades ({actividades.length})
            </h3>
            <span className="text-2xl">{mostrarActividades ? "−" : "+"}</span>
          </button>

          {mostrarActividades && (
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {actividades.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No hay actividades registradas</p>
              ) : (
                actividades.map((actividad) => (
                  <div key={actividad.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{actividad.tipo}</p>
                        <p className="text-sm text-gray-600">
                          {actividad.duracion_min} min • {actividad.calorias} cal
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(actividad.fecha).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    {actividad.notas && (
                      <p className="text-xs text-gray-600 mt-2">{actividad.notas}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Comidas del usuario */}
        <div className="bg-white p-4 rounded-2xl shadow-md">
          <button
            onClick={() => setMostrarComidas(!mostrarComidas)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="font-bold text-lg text-gray-800">
              Alimentación ({comidas.length})
            </h3>
            <span className="text-2xl">{mostrarComidas ? "−" : "+"}</span>
          </button>

          {mostrarComidas && (
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {comidas.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No hay comidas registradas</p>
              ) : (
                comidas.map((comida) => (
                  <div key={comida.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{comida.nombre}</p>
                        <p className="text-sm text-gray-600">
                          {comida.horario} • {comida.calorias} cal
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(comida.fecha).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    {comida.descripcion && (
                      <p className="text-xs text-gray-600 mt-2">{comida.descripcion}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
