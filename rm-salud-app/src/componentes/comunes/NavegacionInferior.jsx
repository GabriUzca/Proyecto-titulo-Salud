import { useNavigate, useLocation } from 'react-router-dom';
import { IconoHome, IconoActividad, IconoComida, IconoOfertas, IconoPerfil } from '../iconos';

const NavegacionInferior = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Función mejorada para determinar si una ruta está activa
  const isActive = (path) => {
    // Para rutas que tienen subrutas (como /actividad/nueva)
    if (path === '/actividad' || path === '/comida') {
      return location.pathname.startsWith(path);
    }
    // Para rutas exactas
    return location.pathname === path;
  };

  const items = [
    { icon: IconoHome, label: 'Inicio', path: '/inicio' },
    { icon: IconoActividad, label: 'Actividad', path: '/actividad' },
    { icon: IconoComida, label: 'Comida', path: '/comida' },
    { icon: IconoOfertas, label: 'Ofertas', path: '/ofertas' },
    { icon: IconoPerfil, label: 'Perfil', path: '/perfil' },
  ];

  const handleNavigation = (path) => {
    // Prevenir navegación redundante
    if (!isActive(path)) {
      navigate(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`
                flex flex-col items-center gap-1 py-2 px-3 flex-1
                transition-all duration-200
                ${active 
                  ? 'text-teal-600' 
                  : 'text-gray-400 hover:text-gray-600'
                }
              `}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NavegacionInferior;