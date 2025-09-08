import { IconoConfiguracion, IconoUsuario } from '../componentes/iconos';

/**
 * Página de ofertas y eventos
 * Muestra productos en oferta, categorías y eventos fitness
 */
const PaginaOfertas = () => {
  // Categorías disponibles
  const categorias = ['Corre', 'Come', 'Entrena', 'Equipa'];
  
  // Ofertas destacadas
  const ofertas = [
    { 
      nombre: 'Zapatillas Running Air Max', 
      precio: '$45.990', 
      precioOriginal: '$79.990', 
      imagen: 'https://placehold.co/100x100/DBF3F1/4A5568?text=Shoe' 
    },
    { 
      nombre: 'Proteína Whey 1kg', 
      precio: '$29.990', 
      precioOriginal: '$34.990', 
      imagen: 'https://placehold.co/100x100/DBF3F1/4A5568?text=Protein' 
    },
    { 
      nombre: 'Calzas Deportivas', 
      precio: '$15.990', 
      precioOriginal: '$22.990', 
      imagen: 'https://placehold.co/100x100/DBF3F1/4A5568?text=Pants' 
    },
  ];

  return (
    <div className="bg-gray-50 pb-24">
      {/* Encabezado */}
      <div className="bg-teal-600 text-white p-4 flex justify-between items-center rounded-b-2xl shadow-lg">
        <div>
          <h2 className="font-bold text-2xl">¡Hola, Gabriel!</h2>
          <p className="text-teal-100">Martes, 12 de Marzo</p>
        </div>
        <div className="flex items-center space-x-4">
          <IconoConfiguracion className="h-6 w-6" />
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <IconoUsuario className="h-6 w-6 text-teal-600"/>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Categorías */}
        <div>
          <h3 className="font-bold text-lg text-gray-800 mb-3">Categorías</h3>
          <div className="flex justify-around text-center">
            {categorias.map(categoria => (
              <div key={categoria} className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                  {/* Icono placeholder */}
                  <span className="text-2xl">👟</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{categoria}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ofertas destacadas */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-gray-800">Ofertas Destacadas</h3>
            <a href="#" className="text-sm text-teal-600 font-medium">Ver todas</a>
          </div>
          <div className="space-y-3">
            {ofertas.map(oferta => (
              <div key={oferta.nombre} className="bg-white p-3 rounded-xl shadow-sm flex items-center space-x-4">
                <img src={oferta.imagen} alt={oferta.nombre} className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{oferta.nombre}</p>
                  <p className="text-green-600 font-bold">
                    {oferta.precio} {' '}
                    <span className="text-sm text-gray-400 line-through">{oferta.precioOriginal}</span>
                  </p>
                </div>
                <button className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-teal-600">
                  Comprar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Eventos Fitness */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-gray-800">Eventos Fitness</h3>
            <a href="#" className="text-sm text-teal-600 font-medium">Ver todos</a>
          </div>
          <div className="space-y-3">
            {/* Evento 1 - Maratón */}
            <div className="bg-white p-3 rounded-xl shadow-sm">
              <p className="text-xs text-gray-500">SANTIAGO 12 DIC - 09:00 AM</p>
              <p className="font-semibold text-gray-800 my-1">Maratón de Santiago 2025</p>
              <div className="flex justify-between items-center">
                <p className="font-bold text-lg text-teal-700">$25.000</p>
                <button className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-teal-600">
                  Comprar Entrada
                </button>
              </div>
            </div>
            
            {/* Evento 2 - Yoga */}
            <div className="bg-white p-3 rounded-xl shadow-sm">
              <p className="text-xs text-gray-500">JUEVES 15 DIC - 10:00 AM</p>
              <p className="font-semibold text-gray-800 my-1">Yoga en el Parque - Clase Abierta</p>
              <div className="flex justify-between items-center">
                <p className="font-bold text-lg text-teal-700">GRATIS</p>
                <button className="border border-teal-500 text-teal-500 font-bold py-2 px-4 rounded-lg text-sm hover:bg-teal-50">
                  Reservar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaOfertas;