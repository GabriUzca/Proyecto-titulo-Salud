import { IconoCasa, IconoGraficoBarras, IconoRegalo, IconoUsuario } from '../iconos';

/**
 * Componente de navegación inferior
 * Permite navegar entre las principales secciones de la aplicación
 */
const NavegacionInferior = ({ paginaActual, alNavegar }) => {
  // Elementos de navegación con sus respectivos iconos y etiquetas
  const elementosNav = [
    { nombre: 'inicio', etiqueta: 'Inicio', icono: IconoCasa },
    { nombre: 'estadisticas', etiqueta: 'Estadísticas', icono: IconoGraficoBarras },
    { nombre: 'ofertas', etiqueta: 'Ofertas', icono: IconoRegalo },
    { nombre: 'perfil', etiqueta: 'Perfil', icono: IconoUsuario },
  ];
  
  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex justify-around items-center shadow-top">
      {elementosNav.map(elemento => (
        <button 
          key={elemento.nombre} 
          onClick={() => alNavegar(elemento.nombre)} 
          className={`flex flex-col items-center justify-center space-y-1 ${
            paginaActual === elemento.nombre ? 'text-teal-600' : 'text-gray-400'
          }`}
        >
          <elemento.icono className="h-6 w-6" />
          <span className="text-xs font-medium">{elemento.etiqueta}</span>
        </button>
      ))}
    </div>
  );
};

export default NavegacionInferior;