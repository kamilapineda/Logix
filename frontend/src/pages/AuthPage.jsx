import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Register from '../components/Register';
import Login from '../components/Login';

//logo desde assets
import Logo from '../assets/Images/Logo.png';

function AuthPage() {
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(location.state?.showLogin !== false);

    // Cambiar entre login/registro según el estado de la ruta
  useEffect(() => {
    if (location.state) {
      setShowLogin(location.state.showLogin);
    }
  }, [location.state]);

  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center text-white p-4">
    
<div className="absolute top-8 left-8">
  <Link
    to="/"
    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  </Link>
</div>

      <div className="flex bg-slate-800 rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full mx-auto">
        
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
      
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

        <div className="hidden md:flex md:w-1/2 bg-slate-700 items-center justify-center p-8">
          <img src={Logo} alt="LogiX Logo" className="max-w-xs h-auto" />
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
