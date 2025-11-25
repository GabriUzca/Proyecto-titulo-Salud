import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconoUsuario, IconoCampana } from '../componentes/iconos';

export default function PaginaAdminMenu() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Menú Admin - RM Salud';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-b-3xl shadow-xl mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/inicio')}
            className="mr-3 p-2 hover:bg-purple-500 rounded-full transition-colors">
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold">Menú de Administración</h2>
            <p className="text-purple-200 text-sm">Selecciona una sección para gestionar</p>
          </div>
        </div>
      </div>

      {/* Contenido del menú */}
      <div className="px-4 max-w-2xl mx-auto">
        <div className="space-y-4">
          
          {/* Botón Gestión de Usuarios */}
          <button
            onClick={() => navigate('/admin/usuarios')}
            className="w-full bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow flex items-center space-x-4 text-left"
          >
            <div className="bg-purple-100 p-4 rounded-full">
              <IconoUsuario className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Gestión de Usuarios</h3>
              <p className="text-gray-600">Activar, desactivar y editar cuentas de usuario.</p>
            </div>
          </button>

          {/* Botón Gestión de Eventos */}
          <button
            onClick={() => navigate('/admin/eventos')}
            className="w-full bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow flex items-center space-x-4 text-left"
          >
            <div className="bg-teal-100 p-4 rounded-full">
              {/* Usamos IconoCampana por "solicitudes" */}
              <IconoCampana className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Gestión de Eventos</h3>
              <p className="text-gray-600">Aprobar o rechazar solicitudes de eventos públicos.</p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}