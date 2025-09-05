import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Register from '../components/Register';
import Login from '../components/Login';

function AuthPage() {
  const location = useLocation();
  // Por defecto, muestra el login, a menos que un enlace nos diga lo contrario
  const [showLogin, setShowLogin] = useState(location.state?.showLogin !== false);

  useEffect(() => {
    if (location.state) {
      setShowLogin(location.state.showLogin);
    }
  }, [location.state]);

  return (
    
    <div className="bg-slate-900 min-h-screen flex items-center justify-center text-white p-4">
            {/* --- NUEVO: Botón de Volver al Inicio, fuera del contenedor principal --- */}
      <div className="absolute top-8 left-8"> {/* Posiciona el botón arriba a la izquierda */}
        <Link to="/" className="text-blue-400 hover:underline text-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Inicio
        </Link>
      </div>
      {/* Contenedor principal para la layout de dos columnas */}
      <div className="flex bg-slate-800 rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full mx-auto">
        
        {/* === Columna Izquierda: Formularios === */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-center text-blue-400 mb-8">
            LogiX
          </h1>
          
          {showLogin ? (
            <div>
              <Login />
              <p className="text-center mt-6 text-slate-400">
                ¿No tienes una cuenta?{' '}
                <button 
                  onClick={() => setShowLogin(false)} 
                  className="font-semibold text-blue-400 hover:underline"
                >
                  Regístrate
                </button>
              </p>
            </div>
          ) : (
            <div>
              <Register />
              <p className="text-center mt-6 text-slate-400">
                ¿Ya tienes una cuenta?{' '}
                <button 
                  onClick={() => setShowLogin(true)} 
                  className="font-semibold text-blue-400 hover:underline"
                >
                  Inicia Sesión
                </button>
              </p>
            </div>
          )}
        </div>

        {/* === Columna Derecha: Imagen === */}
        {/* La clase 'hidden md:flex' oculta la imagen en pantallas pequeñas (móviles) */}
        <div className="hidden md:flex md:w-1/2 bg-slate-700 items-center justify-center p-8">
          {/* Asegúrate de que la ruta a tu imagen sea correcta */}
          <img src="/image_baf334.png" alt="LogiX Logo" className="max-w-xs h-auto" />
        </div>
      </div>
    </div>
  );
}

export default AuthPage;