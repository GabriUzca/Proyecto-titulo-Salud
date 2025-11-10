import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../servicios/adminApi";
import { IconoUsuario, IconoCasa } from "../componentes/iconos";

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("all"); // all, active, inactive
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    document.title = 'Admin - Gestión de Usuarios - RM Salud';
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filtro === "active") params.is_active = "true";
      if (filtro === "inactive") params.is_active = "false";
      if (busqueda) params.search = busqueda;

      const [usersRes, statsRes] = await Promise.all([
        adminApi.listUsers(params),
        adminApi.getStatistics()
      ]);

      setUsuarios(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setMensaje({ tipo: "error", texto: "Error al cargar usuarios" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [filtro]);

  const handleBuscar = (e) => {
    e.preventDefault();
    cargarDatos();
  };

  const toggleActivo = async (id, currentStatus) => {
    if (!confirm(`¿${currentStatus ? 'Desactivar' : 'Activar'} este usuario?`)) return;
    
    try {
      await adminApi.toggleUserActive(id);
      setMensaje({ 
        tipo: "success", 
        texto: `Usuario ${currentStatus ? 'desactivado' : 'activado'} exitosamente` 
      });
      cargarDatos();
      setTimeout(() => setMensaje(null), 3000);
    } catch (err) {
      setMensaje({ 
        tipo: "error", 
        texto: err.response?.data?.error || "Error al cambiar estado" 
      });
    }
  };

  const irAEditar = (id) => {
    navigate(`/admin/usuarios/${id}/editar`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-b-3xl shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/admin/menu')}
              className="mr-3 p-2 hover:bg-purple-500 rounded-full transition-colors"
            >
              ←
            </button>
            <div>
              <h2 className="text-2xl font-bold">Administración de Usuarios</h2>
              <p className="text-purple-200 text-sm">Gestiona las cuentas del sistema</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-purple-200 text-xs mb-1">Total</p>
              <p className="text-2xl font-bold">{stats.total_users}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-purple-200 text-xs mb-1">Activos</p>
              <p className="text-2xl font-bold">{stats.active_users}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-purple-200 text-xs mb-1">Inactivos</p>
              <p className="text-2xl font-bold">{stats.inactive_users}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <p className="text-purple-200 text-xs mb-1">Admins</p>
              <p className="text-2xl font-bold">{stats.staff_users}</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 max-w-6xl mx-auto">
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

        {/* Controles de búsqueda y filtro */}
        <div className="bg-white p-4 rounded-2xl shadow-md mb-4">
          <form onSubmit={handleBuscar} className="space-y-3">
            <input
              type="text"
              placeholder="Buscar por nombre, email o username..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFiltro("all")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  filtro === "all" 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFiltro("active")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  filtro === "active" 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Activos
              </button>
              <button
                type="button"
                onClick={() => setFiltro("inactive")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  filtro === "inactive" 
                    ? "bg-red-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Inactivos
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🔍 Buscar
            </button>
          </form>
        </div>

        {/* Lista de usuarios */}
        <div className="space-y-3">
          {usuarios.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-md text-center">
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          ) : (
            usuarios.map((user) => (
              <div 
                key={user.id} 
                className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${
                      user.is_active ? "bg-purple-100" : "bg-gray-100"
                    }`}>
                      <IconoUsuario className={`w-6 h-6 ${
                        user.is_active ? "text-purple-600" : "text-gray-400"
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}` 
                            : user.username}
                        </h3>
                        {user.is_staff && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                            Admin
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          user.is_active 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {user.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email || "Sin email"}</p>
                      
                      <div className="flex gap-3 mt-2 text-xs text-gray-500">
                        <span>🏃 {user.total_actividades} actividades</span>
                        <span>🍽️ {user.total_comidas} comidas</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => irAEditar(user.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => toggleActivo(user.id, user.is_active)}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        user.is_active
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {user.is_active ? "🚫 Desactivar" : "✅ Activar"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}