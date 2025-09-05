import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center text-white p-4 text-center">
      {/* Aquí podrías poner tu logo si lo tienes en la carpeta public */}
      {/* <img src="/images/logix-logo.png" alt="LogiX Logo" className="w-48 h-48 mb-6" /> */}
      
      <h1 className="text-6xl font-bold text-blue-500">
        Bienvenido a LogiX
      </h1>
      <p className="text-xl text-slate-300 mt-4 max-w-2xl">
        Tu aventura en el mundo del pensamiento computacional está a punto de comenzar. Únete como profesor para crear desafíos o como estudiante para resolverlos.
      </p>

      <div className="flex gap-4 mt-10">
        <Link 
          to="/auth"
          // Con 'state' le pasamos información a la siguiente ruta
          state={{ showLogin: true }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Iniciar Sesión
        </Link>
        <Link 
          to="/auth"
          state={{ showLogin: false }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Registrarse
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;