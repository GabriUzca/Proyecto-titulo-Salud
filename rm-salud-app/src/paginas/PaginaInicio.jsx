import { IconoCampana, IconoUsuario, IconoLlama, IconoGota, IconoPisadas } from '../componentes/iconos';

/**
 * Página principal del dashboard
 * Muestra el resumen diario, progreso semanal y recursos disponibles
 */
const PaginaInicio = () => {
  // Datos de progreso semanal para el gráfico
  const datosProgresoSemanal = [
    { dia: 'Lun', valor: 60 }, { dia: 'Mar', valor: 75 }, { dia: 'Mie', valor: 50 },
    { dia: 'Jue', valor: 80 }, { dia: 'Vie', valor: 90 }, { dia: 'Sab', valor: 40 },
    { dia: 'Dom', valor: 70 }
  ];

  return (
    <div className="bg-gray-50 pb-24">
      {/* Encabezado principal */}
      <div className="bg-teal-600 text-white p-4 flex justify-between items-center rounded-b-2xl shadow-lg">
        <div>
          <h2 className="font-bold text-2xl">¡Hola, Gabriel!</h2>
          <p className="text-teal-100">Martes, 12 de Marzo</p>
        </div>
        <div className="flex items-center space-x-4">
          <IconoCampana className="h-6 w-6" />
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <IconoUsuario className="h-6 w-6 text-teal-600"/>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Resumen diario */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg text-gray-800 mb-3">Resumen de Hoy</h3>
          <div className="flex justify-around text-center">
            {/* Calorías */}
            <div className="flex items-center flex-col">
              <IconoLlama className="w-6 h-6 text-red-500 mb-1"/>
              <span className="font-bold text-xl text-gray-900">7,840</span>
              <span className="text-sm text-gray-500">Calorías</span>
            </div>
            {/* Agua */}
            <div className="flex items-center flex-col">
              <IconoGota className="w-6 h-6 text-blue-500 mb-1"/>
              <span className="font-bold text-xl text-gray-900">1,245</span>
              <span className="text-sm text-gray-500">Agua ml</span>
            </div>
            {/* Distancia */}
            <div className="flex items-center flex-col">
              <IconoPisadas className="w-6 h-6 text-green-500 mb-1"/>
              <span className="font-bold text-xl text-gray-900">3.2 km</span>
              <span className="text-sm text-gray-500">Distancia</span>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-teal-500 h-2.5 rounded-full" style={{width: '45%'}}></div>
            </div>
            <p className="text-xs text-gray-500 text-right mt-1">45% de tu meta diaria</p>
          </div>
        </div>

        {/* Progreso semanal */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">Progreso Semanal</h3>
            <a href="#" className="text-sm text-teal-600 font-medium">Ver todo</a>
          </div>
          {/* Gráfico de barras simple */}
          <div className="flex justify-between items-end h-32">
            {datosProgresoSemanal.map(item => (
              <div key={item.dia} className="flex flex-col items-center w-1/7">
                <div 
                  className="w-6 bg-teal-200 rounded-t-md" 
                  style={{ height: `${item.valor}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">{item.dia}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alimentación */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-gray-800">Alimentación</h3>
            <button className="text-sm text-teal-600 font-medium">+ Añadir</button>
          </div>
          <div className="space-y-3">
            <p className="text-gray-700">
              <span className="font-semibold">● Desayuno:</span> Avena con frutas - 
              <span className="text-gray-500"> 320 Kcal</span>
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">● Almuerzo:</span> Pecho con verduras - 
              <span className="text-gray-500"> 450 Kcal</span>
            </p>
          </div>
        </div>

        {/* Recursos locales */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-gray-800">Recursos Locales</h3>
            <a href="#" className="text-sm text-teal-600 font-medium">Ver todos</a>
          </div>
          {/* Placeholder del mapa */}
          <div className="h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-500">
            Mapa Placeholder
          </div>
          <ul className="space-y-2 text-gray-700">
            <li>⭐ Parque Bicentenario <span className="text-gray-400 text-sm">(5 km de distancia)</span></li>
            <li>⭐ Ciclovía Providencia <span className="text-gray-400 text-sm">(2 km de distancia)</span></li>
          </ul>
        </div>
        
        {/* Eventos próximos */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg text-gray-800">Eventos Próximos</h3>
            <a href="#" className="text-sm text-teal-600 font-medium">Ver todos</a>
          </div>
          
          {/* Evento 1 */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex flex-col items-center justify-center bg-teal-100 text-teal-700 w-12 h-12 rounded-lg">
              <span className="text-xs">MAR</span>
              <span className="font-bold text-xl">15</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Maratón Santiago 2025</p>
              <p className="text-sm text-gray-500">123 participantes</p>
            </div>
          </div>
          
          {/* Evento 2 */}
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center justify-center bg-gray-100 text-gray-700 w-12 h-12 rounded-lg">
              <span className="text-xs">MAR</span>
              <span className="font-bold text-xl">18</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Clase de Yoga en Las Condes</p>
              <p className="text-sm text-gray-500">Parque Los Dominicos - 10:00 AM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaInicio;