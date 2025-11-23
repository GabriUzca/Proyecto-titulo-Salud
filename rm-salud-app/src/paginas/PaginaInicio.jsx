import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { actividadApi } from "../servicios/actividadApi";
import { alimentacionApi } from "../servicios/alimentacionApi";
import { recomendacionesApi } from "../servicios/recomendacionesApi";
import { buscarEventosPorUbicacion } from "../servicios/ticketmasterApi";
import { metasApi } from "../servicios/metasApi";
import MapaRecursos from "../componentes/MapaRecursos";
import { IconoCampana, IconoUsuario, IconoLlama, IconoGota, IconoPisadas, IconoCasa } from '../componentes/iconos';

function esHoy(fechaString) {
  if (!fechaString) return false;

  // Extraer solo la parte de fecha (YYYY-MM-DD) del string recibido
  const [fechaRecibida] = fechaString.split('T');

  // Crear string de hoy en formato YYYY-MM-DD usando fecha local
  const hoy = new Date();
  const hoyString = [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0')
  ].join('-');

  return fechaRecibida === hoyString;
}

// Función para calcular distancia entre dos puntos (fórmula de Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distancia en km
}

export default function PaginaInicio() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, cerrarSesion } = useAuth();
  const [loading, setLoading] = useState(true);
  const [act, setAct] = useState([]);
  const [food, setFood] = useState([]);
  const [recs, setRecs] = useState([]);
  const [eventosTicketmaster, setEventosTicketmaster] = useState([]);
  const [eventosAprobados, setEventosAprobados] = useState([]);
  const [pois, setPois] = useState([]);
  const [posUsuario, setPosUsuario] = useState(null);
  const [mostrarTodosEventos, setMostrarTodosEventos] = useState(false);
  const [metaActiva, setMetaActiva] = useState(null);
  const mapaRef = useRef();
  const mapaContainerRef = useRef();

  // Actualizar título de la página
  useEffect(() => {
    document.title = 'Inicio - RM Salud';
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const [a, f, r] = await Promise.all([
          actividadApi.list(),
          alimentacionApi.list(),
          recomendacionesApi.locales("Santiago"),
        ]);

        if (!mounted) return;

        setAct(a.data || []);
        setFood(f.data || []);
        setRecs(r.data?.items || []);

        // Cargar meta activa (si existe)
        try {
          const metaRes = await metasApi.getActiva();
          if (mounted) setMetaActiva(metaRes.data);
        } catch (err) {
          // Si no hay meta activa (404), no hacer nada
          if (mounted) setMetaActiva(null);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Cargar datos al montar el componente
    load();

    // Recargar cuando el usuario vuelve a la pestaña/ventana
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted) {
        load();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname]); // Recargar cuando cambia la ruta (cuando visita /inicio)

  // Obtener ubicación del usuario
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosUsuario({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
      }
    );
  }, []);

  // Cargar eventos de Ticketmaster cuando se obtiene la ubicación
  useEffect(() => {
    if (!posUsuario) return;

    const cargarEventos = async () => {
      try {
        const categorias = ['sports', 'music', 'arts', 'miscellaneous'];
        const eventos = await buscarEventosPorUbicacion(
          posUsuario.lat,
          posUsuario.lng,
          40, // 40 km de radio
          20, // máx 20 eventos
          categorias,
          90 // próximos 90 días
        );
        setEventosTicketmaster(eventos);
      } catch (error) {
        console.error('Error cargando eventos de Ticketmaster:', error);
      }
    };

    cargarEventos();
  }, [posUsuario]);

  // Cargar POIs personalizados cuando se obtiene la ubicación y hay meta activa
  useEffect(() => {
    if (!posUsuario || !metaActiva) return;

    const cargarPOIs = async () => {
      try {
        const response = await recomendacionesApi.poi(
          posUsuario.lat,
          posUsuario.lng,
          5 // 5 km de radio
        );
        setPois(response.data?.pois || []);
      } catch (error) {
        console.error('Error cargando POIs personalizados:', error);
        setPois([]);
      }
    };

    cargarPOIs();
  }, [posUsuario, metaActiva]);

  const minutosHoy = useMemo(
    () => act.filter(x => esHoy(x.fecha)).reduce((acc, x) => acc + (x.duracion_min || 0), 0),
    [act]
  );

  const kcalConsumidasHoy = useMemo(
    () => food.filter(x => esHoy(x.fecha)).reduce((acc, x) => acc + (x.calorias || 0), 0),
    [food]
  );

  const kcalQuemadasHoy = useMemo(
    () => act.filter(x => esHoy(x.fecha)).reduce((acc, x) => acc + (x.calorias || 0), 0),
    [act]
  );

  const kcalNetasHoy = useMemo(() => {
    return kcalConsumidasHoy - kcalQuemadasHoy;
  }, [kcalConsumidasHoy, kcalQuemadasHoy]);

  // Calcular análisis acumulativo desde el inicio de la meta
  const analisisAcumulativo = useMemo(() => {
    if (!metaActiva || !food.length) return null;

    // Calcular días transcurridos (día de hoy cuenta como día 1)
    const diasTranscurridos = metaActiva.dias_totales - metaActiva.dias_restantes + 1;

    // Obtener la fecha de inicio de la meta
    const fechaInicioMeta = new Date(metaActiva.fecha_inicio);
    fechaInicioMeta.setHours(0, 0, 0, 0);

    // Filtrar solo comidas y actividades desde el inicio de la meta
    const foodDesdeMeta = food.filter(item => {
      const fechaItem = new Date(item.fecha);
      fechaItem.setHours(0, 0, 0, 0);
      return fechaItem >= fechaInicioMeta;
    });

    const actDesdeMeta = act.filter(item => {
      const fechaItem = new Date(item.fecha);
      fechaItem.setHours(0, 0, 0, 0);
      return fechaItem >= fechaInicioMeta;
    });

    // Calcular total consumido desde el inicio de la meta
    const totalConsumidasAcumulado = foodDesdeMeta.reduce((acc, item) => acc + (item.calorias || 0), 0);
    const totalQuemadasAcumulado = actDesdeMeta.reduce((acc, item) => acc + (item.calorias || 0), 0);
    const totalNetasAcumulado = totalConsumidasAcumulado - totalQuemadasAcumulado;

    // Calcular lo que debería haber consumido
    const deberiaHaberConsumido = metaActiva.meta_calorica_diaria * diasTranscurridos;

    // Diferencia
    const diferencia = totalNetasAcumulado - deberiaHaberConsumido;

    return {
      diasTranscurridos,
      totalNetasAcumulado: Math.round(totalNetasAcumulado),
      deberiaHaberConsumido: Math.round(deberiaHaberConsumido),
      diferencia: Math.round(diferencia),
      estaPorEncima: diferencia > 0
    };
  }, [metaActiva, food, act]);

  // Filtrar recursos cercanos (dentro de 40 km)
  const recursosCercanos = useMemo(() => {
    if (!posUsuario) return recs;

    const RADIO_KM = 40;
    return recs.filter(recurso => {
      if (typeof recurso.lat !== 'number' || typeof recurso.lng !== 'number') {
        return false;
      }
      const distancia = calcularDistancia(
        posUsuario.lat,
        posUsuario.lng,
        recurso.lat,
        recurso.lng
      );
      return distancia <= RADIO_KM;
    });
  }, [recs, posUsuario]);

  // Callback para recibir eventos del mapa (separa Ticketmaster de aprobados)
  const handleEventosActualizados = (eventos) => {
    // Separar eventos por tipo
    const eventosTicket = eventos.filter(e => e.esTicketmaster || e.url?.includes('ticketmaster'));
    const eventosLocal = eventos.filter(e => !e.esTicketmaster && !e.url?.includes('ticketmaster'));

    setEventosTicketmaster(eventosTicket);
    setEventosAprobados(eventosLocal);
  };

  // Combinar recursos locales cercanos, eventos de Ticketmaster, eventos aprobados y POIs
  const recursosYEventos = useMemo(() => {
    if (mostrarTodosEventos) {
      // Mostrar todos: primero POIs, luego recursos cercanos, luego todos los eventos
      return [...pois, ...recursosCercanos, ...eventosTicketmaster, ...eventosAprobados];
    }

    // Vista compacta: intercalar
    const poisLimitados = pois.slice(0, 2);
    const eventosTicket = eventosTicketmaster.slice(0, 2);
    const eventosLocal = eventosAprobados.slice(0, 1);
    const recursosLimitados = recursosCercanos.slice(0, 1);

    const combinados = [];
    const maxLength = Math.max(poisLimitados.length, eventosTicket.length, eventosLocal.length, recursosLimitados.length);

    for (let i = 0; i < maxLength; i++) {
      if (poisLimitados[i]) combinados.push(poisLimitados[i]);
      if (recursosLimitados[i]) combinados.push(recursosLimitados[i]);
      if (eventosTicket[i]) combinados.push(eventosTicket[i]);
      if (eventosLocal[i]) combinados.push(eventosLocal[i]);
    }

    return combinados.slice(0, 6); // Máximo 6 items
  }, [recursosCercanos, eventosTicketmaster, eventosAprobados, pois, mostrarTodosEventos]);

  const handleLogout = () => {
    if (confirm('¿Cerrar sesión?')) {
      cerrarSesion();
      navigate('/login');
    }
  };

  // Función para centrar el mapa en un evento cuando se hace clic en la lista
  const handleEventoClick = (item) => {
    if (!mapaRef.current) return;

    // Obtener coordenadas (pueden ser lat/lng o latitud/longitud)
    let lat, lng;

    if (typeof item.lat === 'number' && typeof item.lng === 'number') {
      // Recursos locales y eventos de Ticketmaster
      lat = item.lat;
      lng = item.lng;
    } else if (item.latitud != null && item.longitud != null) {
      // Eventos aprobados (pueden ser strings o números)
      lat = typeof item.latitud === 'string' ? parseFloat(item.latitud) : item.latitud;
      lng = typeof item.longitud === 'string' ? parseFloat(item.longitud) : item.longitud;
    }

    // Si tenemos coordenadas válidas, centrar el mapa
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      mapaRef.current.centerOnLocation(lat, lng);

      // Hacer scroll hacia el mapa
      if (mapaContainerRef.current) {
        mapaContainerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  };

  // Calcular IMC (Índice de Masa Corporal)
  const imc = useMemo(() => {
    if (!usuario?.peso || !usuario?.altura) return null;

    const pesoKg = usuario.peso;
    const alturaM = usuario.altura / 100; // convertir cm a metros
    const imcCalculado = pesoKg / (alturaM * alturaM);

    return imcCalculado;
  }, [usuario?.peso, usuario?.altura]);

  // Determinar categoría y color del IMC
  const categoriaIMC = useMemo(() => {
    if (!imc) return null;

    if (imc < 18.5) {
      return {
        texto: 'Bajo peso',
        color: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
        textColor: 'text-yellow-900',
        badgeColor: 'bg-yellow-500',
        iconColor: 'text-white'
      };
    } else if (imc >= 18.5 && imc < 25) {
      return {
        texto: 'Normal',
        color: 'bg-gradient-to-br from-green-50 to-green-100',
        textColor: 'text-green-900',
        badgeColor: 'bg-green-500',
        iconColor: 'text-white'
      };
    } else if (imc >= 25 && imc < 30) {
      return {
        texto: 'Sobrepeso',
        color: 'bg-gradient-to-br from-orange-50 to-orange-100',
        textColor: 'text-orange-900',
        badgeColor: 'bg-orange-500',
        iconColor: 'text-white'
      };
    } else {
      return {
        texto: 'Obesidad',
        color: 'bg-gradient-to-br from-red-50 to-red-100',
        textColor: 'text-red-900',
        badgeColor: 'bg-red-500',
        iconColor: 'text-white'
      };
    }
  }, [imc]);

  const ultAct = useMemo(() => act.slice(0, 3), [act]);
  const ultFood = useMemo(() => food.slice(0, 3), [food]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Encabezado principal */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-bold text-3xl mb-1">
              ¡Hola, {usuario?.first_name || usuario?.username || 'Usuario'}!
            </h2>
            <p className="text-teal-100 text-sm">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-teal-400 rounded-full transition-colors">
              <IconoCampana className="h-6 w-6" />
            </button>
            <button
              onClick={() => navigate('/perfil')}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:shadow-lg transition-shadow"
            >
              <IconoUsuario className="h-6 w-6 text-teal-600" />
            </button>
          </div>
        </div>

      {/* Menú de navegación */}
      <div className="flex gap-2 mt-4 flex-wrap">
        <button 
          onClick={() => navigate('/actividad')}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Actividades
        </button>
        <button 
          onClick={() => navigate('/comida')}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Alimentación
        </button>
        <button 
          onClick={() => navigate('/perfil')}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Perfil
        </button>
        
        {usuario?.is_staff && (
          <button 
            onClick={() => navigate('/admin/menu')}
            className="bg-purple-500/90 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            👑 Admin
          </button>
        )}
        
        <button 
          onClick={handleLogout}
          className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-auto"
        >
          Cerrar Sesión
        </button>
      </div>  
      </div>
      
      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Resumen diario con cards mejoradas */}
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <h3 className="font-bold text-xl text-gray-800 mb-4">Resumen de Hoy</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Actividad */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <div className="bg-teal-500 p-2 rounded-lg">
                  <IconoPisadas className="w-5 h-5 text-white"/>
                </div>
                <span className="ml-2 text-xs text-teal-700 font-medium">Actividad</span>
              </div>
              <p className="font-bold text-2xl text-teal-900">{minutosHoy}</p>
              <p className="text-xs text-teal-600">minutos</p>
              {kcalQuemadasHoy > 0 && (
                <p className="text-xs text-orange-600 font-semibold mt-1">🔥 {kcalQuemadasHoy} kcal</p>
              )}
            </div>

            {/* Calorías */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <IconoLlama className="w-5 h-5 text-white"/>
                </div>
                <span className="ml-2 text-xs text-orange-700 font-medium">Calorías</span>
              </div>
              <p className="font-bold text-2xl text-orange-900">{kcalConsumidasHoy}</p>
              <p className="text-xs text-orange-600">kcal</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progreso diario</span>
              <span>{Math.min(100, Math.round((minutosHoy / 30) * 100))}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-teal-400 to-teal-600 h-3 rounded-full transition-all duration-500"
                style={{width: `${Math.min(100, (minutosHoy / 30) * 100)}%`}}
              ></div>
            </div>
          </div>
        </div>

        {/* Meta Calórica */}
        {metaActiva ? (
          <div className="bg-white p-5 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-gray-800">Tu Meta de Peso</h3>
              <button
                onClick={() => navigate('/progreso-meta')}
                className="text-xs text-purple-600 font-medium hover:text-purple-700"
              >
                Ver detalles →
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl mb-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-purple-700 mb-1">Meta Calórica Diaria</p>
                  <p className="font-bold text-3xl text-purple-900">
                    {Math.round(metaActiva.meta_calorica_diaria)}
                  </p>
                  <p className="text-xs text-purple-600">kcal</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    metaActiva.tipo_meta === "perdida"
                      ? "bg-blue-500 text-white"
                      : "bg-green-500 text-white"
                  }`}>
                    {metaActiva.tipo_meta === "perdida" ? "📉 Pérdida" : "📈 Ganancia"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/50 p-2 rounded-lg">
                  <p className="text-xs text-purple-600">Actual</p>
                  <p className="font-bold text-purple-900">{metaActiva.peso_actual} kg</p>
                </div>
                <div className="bg-white/50 p-2 rounded-lg">
                  <p className="text-xs text-purple-600">Objetivo</p>
                  <p className="font-bold text-purple-900">{metaActiva.peso_objetivo} kg</p>
                </div>
              </div>
            </div>

            {/* Progreso de calorías del día vs meta */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Calorías netas hoy</span>
                <span>{Math.round(kcalNetasHoy)} / {Math.round(metaActiva.meta_calorica_diaria)} kcal</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    (kcalNetasHoy / metaActiva.meta_calorica_diaria) * 100 > 100
                      ? 'bg-gradient-to-r from-red-400 to-red-600'
                      : 'bg-gradient-to-r from-purple-400 to-purple-600'
                  }`}
                  style={{width: `${Math.min(100, (kcalNetasHoy / metaActiva.meta_calorica_diaria) * 100)}%`}}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {kcalNetasHoy < metaActiva.meta_calorica_diaria
                  ? `Te quedan ${Math.round(metaActiva.meta_calorica_diaria - kcalNetasHoy)} kcal disponibles`
                  : `Has excedido tu meta por ${Math.round(kcalNetasHoy - metaActiva.meta_calorica_diaria)} kcal`
                }
              </p>
            </div>

            <div className="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-600">Días restantes</span>
              <span className="font-bold text-purple-700">{metaActiva.dias_restantes} días</span>
            </div>

            {/* Análisis Acumulativo */}
            {analisisAcumulativo && (
              <div className={`mt-3 p-3 rounded-lg border ${
                analisisAcumulativo.estaPorEncima
                  ? 'bg-red-50 border-red-300'
                  : 'bg-green-50 border-green-300'
              }`}>
                <div className="flex items-start">
                  <span className="text-xl mr-2">
                    {analisisAcumulativo.estaPorEncima ? '⚠️' : '✅'}
                  </span>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold mb-1 ${
                      analisisAcumulativo.estaPorEncima ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {analisisAcumulativo.estaPorEncima
                        ? 'Estás consumiendo más calorías de las esperadas'
                        : 'Vas bien con tu consumo calórico'}
                    </p>
                    <p className={`text-xs ${
                      analisisAcumulativo.estaPorEncima ? 'text-red-700' : 'text-green-700'
                    }`}>
                      En los últimos <strong>{analisisAcumulativo.diasTranscurridos} días</strong> has consumido{' '}
                      <strong>{analisisAcumulativo.totalNetasAcumulado.toLocaleString()} kcal</strong>, pero deberías haber consumido{' '}
                      <strong>{analisisAcumulativo.deberiaHaberConsumido.toLocaleString()} kcal</strong>.
                    </p>
                    <p className={`text-xs font-semibold mt-1 ${
                      analisisAcumulativo.estaPorEncima ? 'text-red-800' : 'text-green-800'
                    }`}>
                      Estás <strong>{Math.abs(analisisAcumulativo.diferencia).toLocaleString()} kcal {analisisAcumulativo.estaPorEncima ? 'por encima' : 'por debajo'}</strong> de lo esperado.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl shadow-md border border-purple-200">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold text-lg text-purple-900 mb-2">
                Establece tu Meta de Peso
              </h3>
              <p className="text-sm text-purple-700 mb-4">
                Configura tu objetivo y recibe un plan calórico personalizado
              </p>
              <button
                onClick={() => window.location.href = '/configurar-meta'}
                className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Configurar Meta
              </button>
            </div>
          </div>
        )}

        {/* IMC (Índice de Masa Corporal) */}
        {imc && categoriaIMC && (
          <div className="bg-white p-5 rounded-2xl shadow-md">
            <h3 className="font-bold text-xl text-gray-800 mb-4">Tu IMC</h3>
            <div className={`${categoriaIMC.color} p-4 rounded-xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`${categoriaIMC.badgeColor} p-3 rounded-lg`}>
                    <IconoGota className={`w-6 h-6 ${categoriaIMC.iconColor}`}/>
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${categoriaIMC.textColor} opacity-75`}>
                      Índice de Masa Corporal
                    </p>
                    <p className={`font-bold text-3xl ${categoriaIMC.textColor}`}>
                      {imc.toFixed(1)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${categoriaIMC.badgeColor} text-white`}>
                    {categoriaIMC.texto}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200/30">
                <p className={`text-xs ${categoriaIMC.textColor} opacity-75`}>
                  Basado en tu peso ({usuario.peso} kg) y altura ({usuario.altura} cm)
                </p>
              </div>
            </div>

            {/* Guía de rangos de IMC */}
            <div className="mt-4 bg-gray-50 p-4 rounded-xl">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Rangos de IMC</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-xs text-gray-600">Bajo peso</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">&lt; 18.5</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs text-gray-600">Normal</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">18.5 - 24.9</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                    <span className="text-xs text-gray-600">Sobrepeso</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">25 - 29.9</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-xs text-gray-600">Obesidad</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">≥ 30</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recursos locales con mapa */}
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-gray-800">Recursos y Eventos</h3>
            <span className="text-xs text-teal-600 font-medium">
              {recursosCercanos.length + eventosTicketmaster.length + eventosAprobados.length + pois.length} cercanos
            </span>
          </div>
          <div ref={mapaContainerRef} className="rounded-xl overflow-hidden mb-3">
            <MapaRecursos
              ref={mapaRef}
              recursos={recursosCercanos}
              pois={pois}
              alto={220}
              onEventosActualizados={handleEventosActualizados}
              onUbicacionActualizada={setPosUsuario}
            />
          </div>
          <ul className="space-y-2">
            {recursosYEventos.map((item, i) => (
              item.icono ? (
                // POI personalizado
                <li
                  key={`poi-${item.id}-${i}`}
                  onClick={() => handleEventoClick(item)}
                  className="flex items-start p-3 hover:bg-purple-50 rounded-lg transition-colors border-l-4 border-purple-500 cursor-pointer"
                >
                  <span className="text-2xl mr-2">
                    {item.icono === 'gym' ? '🏋️' :
                     item.icono === 'sports' ? '⚽' :
                     item.icono === 'park' ? '🌳' :
                     item.icono === 'bike' ? '🚴' :
                     item.icono === 'market' ? '🛒' :
                     item.icono === 'supermarket' ? '🏪' :
                     item.icono === 'restaurant' ? '🍽️' :
                     item.icono === 'bakery' ? '🥖' :
                     item.icono === 'shop' ? '🏬' :
                     '📍'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-gray-800 text-sm flex-1">{item.nombre}</p>
                      <span className="text-xs px-2 py-1 rounded-full ml-2 bg-purple-100 text-purple-700">
                        {item.tipo}
                      </span>
                    </div>
                    {item.direccion && (
                      <p className="text-xs text-gray-600 mb-1">📍 {item.direccion}</p>
                    )}
                    <div className="flex items-center mt-1">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">
                        Recomendado para ti
                      </span>
                      {item.prioridad && (
                        <span className="text-xs text-gray-500 ml-2">
                          ⭐ Prioridad: {item.prioridad}/10
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ) : item.esTicketmaster ? (
                // Evento de Ticketmaster
                <li
                  key={`tm-${item.id}`}
                  onClick={() => handleEventoClick(item)}
                  className="flex items-start p-3 hover:bg-red-50 rounded-lg transition-colors border-l-4 border-red-500 cursor-pointer"
                >
                  <span className="text-2xl mr-2">🎫</span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-gray-800 text-sm flex-1">{item.titulo}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                        item.categoria === 'Sports' ? 'bg-blue-100 text-blue-700' :
                        item.categoria === 'Music' ? 'bg-green-100 text-green-700' :
                        item.categoria === 'Arts & Theatre' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {item.categoria === 'Sports' ? '🏃 Deportes' :
                         item.categoria === 'Music' ? '🎵 Música' :
                         item.categoria === 'Arts & Theatre' ? '🎭 Arte y Teatro' :
                         '🎪 Eventos'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      📅 {item.fechaCorta} {item.hora && `• ${item.hora}`}
                    </p>
                    <p className="text-xs text-gray-500">📍 {item.lugar}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                        Ticketmaster
                      </span>
                    </div>
                  </div>
                </li>
              ) : item.nombre_evento ? (
                // Evento aprobado local
                <li
                  key={`evt-${item.id}`}
                  onClick={() => handleEventoClick(item)}
                  className="flex items-start p-3 hover:bg-green-50 rounded-lg transition-colors border-l-4 border-green-500 cursor-pointer"
                >
                  <span className="text-2xl mr-2">🎉</span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-gray-800 text-sm flex-1">{item.nombre_evento}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                        item.categoria === 'deportivo' ? 'bg-blue-100 text-blue-700' :
                        item.categoria === 'cultural' ? 'bg-purple-100 text-purple-700' :
                        item.categoria === 'salud' ? 'bg-pink-100 text-pink-700' :
                        item.categoria === 'recreativo' ? 'bg-yellow-100 text-yellow-700' :
                        item.categoria === 'educativo' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.categoria === 'deportivo' ? '🏃 Deportivo' :
                         item.categoria === 'cultural' ? '🎭 Cultural' :
                         item.categoria === 'salud' ? '❤️ Salud' :
                         item.categoria === 'recreativo' ? '🎪 Recreativo' :
                         item.categoria === 'educativo' ? '📚 Educativo' :
                         '📋 Otro'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      📅 {new Date(item.fecha_inicio).toLocaleDateString('es-CL')}
                    </p>
                    <p className="text-xs text-gray-500">📍 {item.ciudad}</p>
                    <div className="flex items-center mt-1 gap-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                        Evento Local
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {item.tipo_entrada === 'gratuito' ? '💰 Gratis' : '💵 Pago'}
                      </span>
                    </div>
                  </div>
                </li>
              ) : (
                // Recurso local (ciclovía, parque, etc.)
                <li
                  key={`rec-${i}`}
                  onClick={() => handleEventoClick(item)}
                  className="flex items-start p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="text-teal-500 mr-2">📍</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{item.titulo}</p>
                    <p className="text-xs text-gray-500">{item.lugar}</p>
                  </div>
                  {item.tipo && (
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                      {item.tipo}
                    </span>
                  )}
                </li>
              )
            ))}
          </ul>

          {/* Botón para expandir/colapsar */}
          {(recursosCercanos.length + eventosTicketmaster.length + eventosAprobados.length + pois.length > 6) && (
            <div className="mt-3 text-center">
              <button
                onClick={() => setMostrarTodosEventos(!mostrarTodosEventos)}
                className="text-sm text-teal-600 font-medium hover:text-teal-700 hover:underline transition-colors"
              >
                {mostrarTodosEventos
                  ? '← Ver menos'
                  : `Ver todos (${recursosCercanos.length + eventosTicketmaster.length + eventosAprobados.length + pois.length}) →`
                }
              </button>
            </div>
          )}
        </div>

        {/* Actividades recientes */}
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-gray-800">Actividades Recientes</h3>
            <Link to="/actividad" className="text-sm text-teal-600 font-medium hover:text-teal-700">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {ultAct.length > 0 ? (
              ultAct.map(a => (
                <div key={a.id} className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="bg-teal-100 p-2 rounded-lg">
                    <IconoPisadas className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-semibold text-gray-800 text-sm">
                      {a.tipo.charAt(0).toUpperCase() + a.tipo.slice(1)}
                    </p>
                    <p className="text-xs text-gray-500">{a.fecha}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-teal-600">{a.duracion_min}</p>
                    <p className="text-xs text-gray-500">min</p>
                    {a.calorias && (
                      <p className="text-xs text-orange-600 font-semibold mt-1">🔥 {a.calorias} kcal</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-3">No hay actividades registradas</p>
                <Link 
                  to="/actividad/nueva"
                  className="inline-block bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
                >
                  + Registrar actividad
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Alimentación reciente */}
        <div className="bg-white p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-gray-800">Alimentación Reciente</h3>
            <Link to="/comida" className="text-sm text-teal-600 font-medium hover:text-teal-700">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {ultFood.length > 0 ? (
              ultFood.map(c => (
                <div key={c.id} className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <IconoLlama className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{c.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {c.horario.charAt(0).toUpperCase() + c.horario.slice(1)} • {c.fecha}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{c.calorias}</p>
                    <p className="text-xs text-gray-500">kcal</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-3">No hay comidas registradas</p>
                <Link 
                  to="/comida/nueva"
                  className="inline-block bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
                >
                  + Registrar comida
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navbar Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-4 h-16">
            <button
              onClick={() => navigate('/inicio')}
              className="flex flex-col items-center justify-center transition-all duration-200 text-teal-600 bg-teal-50"
            >
              <IconoCasa className="w-6 h-6 mb-1 scale-110" />
              <span className="text-xs font-bold">Inicio</span>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-teal-600 rounded-b-full" />
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
              className="flex flex-col items-center justify-center transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            >
              <IconoUsuario className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Perfil</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}