import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { perfilApi } from "../servicios/perfilApi";
import { useAuth } from "../hooks/useAuth";
import { IconoUsuario, IconoCasa, IconoPisadas, IconoLlama } from "../componentes/iconos";

export default function Perfil() {
  const navigate = useNavigate();
  const { cerrarSesion } = useAuth();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    edad: "",
    peso: "",
    altura: ""
  });
  const [foto, setFoto] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Mi Perfil - RM Salud';
  }, []);

  useEffect(() => {
    perfilApi.getMe()
      .then(({ data }) => {
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          edad: data.profile?.edad ?? "",
          peso: data.profile?.peso ?? "",
          altura: data.profile?.altura ?? "",
        });
      })
      .catch(() => setStatus("❌ Error al cargar perfil"))
      .finally(() => setLoading(false));
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      setSaving(true);
      const payload = { ...form };
      if (foto) payload.foto = foto;
      await perfilApi.updateMe(payload);
      setStatus("✅ Perfil actualizado");
      setFoto(null);
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus("❌ Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión?')) {
      cerrarSesion();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">{/* pb-20 para navbar */}
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-b-3xl shadow-xl mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/inicio')}
              className="mr-3 p-2 hover:bg-teal-400 rounded-full transition-colors"
            >
              ← 
            </button>
            <h2 className="text-2xl font-bold">Mi Perfil</h2>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Formulario */}
      <div className="px-4 max-w-md mx-auto pb-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          {/* Avatar section */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mb-3">
              <IconoUsuario className="w-12 h-12 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {form.first_name || form.last_name 
                ? `${form.first_name} ${form.last_name}`.trim() 
                : 'Usuario'}
            </h3>
          </div>

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
                placeholder="Tu nombre"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                placeholder="Tu apellido"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            
            {/* Grid para datos físicos */}
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
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center"
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
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center"
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
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center"
                />
                <span className="text-xs text-gray-500 block text-center mt-1">cm</span>
              </div>
            </div>
            
            {/* Foto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Foto de perfil (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFoto(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
              {foto && (
                <p className="text-xs text-teal-600 mt-1">
                  ✓ Archivo seleccionado: {foto.name}
                </p>
              )}
            </div>
            
            {/* Botón guardar */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </form>
          
          {/* Mensaje de estado */}
          {status && (
            <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${
              status.includes('Error') || status.includes('❌')
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {status}
            </div>
          )}
        </div>

        {/* Sección de navegación rápida */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/actividad')}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-2xl mb-2">🏃</div>
            <p className="text-sm font-semibold text-gray-800">Actividades</p>
          </button>
          <button
            onClick={() => navigate('/comida')}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-2xl mb-2">🍽️</div>
            <p className="text-sm font-semibold text-gray-800">Alimentación</p>
          </button>
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
              className="flex flex-col items-center justify-center transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            >
              <IconoLlama className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Comida</span>
            </button>
            
            <button
              onClick={() => navigate('/perfil')}
              className="flex flex-col items-center justify-center transition-all duration-200 text-teal-600 bg-teal-50"
            >
              <IconoUsuario className="w-6 h-6 mb-1 scale-110" />
              <span className="text-xs font-bold">Perfil</span>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-teal-600 rounded-b-full" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}