import BotonAccion from '../../componentes/comunes/BotonAccion';
import CampoEntrada from '../../componentes/comunes/CampoEntrada';

/**
 * Página de registro de nuevos usuarios
 * Permite crear una cuenta nueva en la aplicación
 */
const PaginaRegistro = ({ alNavegar, alRegistrarse }) => {
  return (
    <div className="p-8 flex flex-col h-full bg-white">
      {/* Encabezado */}
      <div className="text-center mt-12 mb-12">
        <h1 className="text-2xl font-bold text-teal-600">RM Salud</h1>
        <h2 className="text-3xl font-bold text-gray-800 mt-4">Crear una cuenta</h2>
        <p className="text-gray-600 mt-2">Únete a nuestra comunidad de salud y bienestar.</p>
      </div>
      
      {/* Formulario de registro */}
      <div className="space-y-4">
        <CampoEntrada placeholder="Nombre de usuario" />
        <CampoEntrada type="email" placeholder="Correo electrónico" />
        <CampoEntrada type="password" placeholder="Contraseña" />
        <CampoEntrada type="password" placeholder="Confirma tu contraseña" />
      </div>

      {/* Términos y condiciones */}
      <div className="text-sm text-gray-500 mt-4">
        <label className="flex items-start">
          <input type="checkbox" className="form-checkbox h-4 w-4 text-teal-600 mt-1" />
          <span className="ml-2">
            Acepto los <a href="#" className="text-teal-600">términos y condiciones</a> de uso 
            de la aplicación así como nuestras <a href="#" className="text-teal-600">políticas de privacidad</a>.
          </span>
        </label>
      </div>
      
      {/* Botón de registro */}
      <div className="mt-8">
        <BotonAccion onClick={alRegistrarse}>Crear cuenta</BotonAccion>
      </div>
      
      {/* Separador */}
      <div className="mt-8 text-center text-gray-500 text-sm relative">
        <span className="absolute left-0 top-1/2 w-full h-px bg-gray-200"></span>
        <span className="relative bg-white px-4">o regístrate con</span>
      </div>

      {/* Botones de redes sociales */}
      <div className="flex justify-center space-x-4 mt-6">
        <button className="h-12 w-12 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50">
          G
        </button>
        <button className="h-12 w-12 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50">
          O
        </button>
      </div>
      
      {/* Enlace a inicio de sesión */}
      <div className="mt-auto text-center py-4">
        <p className="text-gray-600">
          ¿Ya tienes una cuenta? {' '}
          <button 
            onClick={() => alNavegar('login')} 
            className="font-bold text-teal-600 hover:underline"
          >
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default PaginaRegistro;