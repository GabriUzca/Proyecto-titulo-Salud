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
    altura: ""
  });
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const cargarUsuario = async () => {
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
          altura: data.profile?.altura || ""
        });
      } catch (err) {
        console.error("Error cargando usuario:", err);
        setMensaje({ tipo: "error", texto: "Error al cargar usuario" });
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, [id]);

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

      <div className="px-4 max-w-2xl mx-auto">
        {/* Mensaje de feedback */}
        {mensaje && (
          <div className={`mb-4 p-4 rounded-xl border ${
            mensaje.tipo === "error" 
              ? "bg-red-50 border-red-200 text-red-700" 
              : "bg-green-50 border-green-200 text-green-700"
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Información del usuario */}
        <div className="bg-white p-4 rounded-2xl shadow-md mb-4">
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
      </div>
    </div>
  );
}