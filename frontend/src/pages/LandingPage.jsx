import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen flex flex-col items-center justify-center text-white p-6 text-center">

      {/* Título principal */}
      <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 drop-shadow-lg">
        Bienvenido a LogiX
      </h1>

      {/* Subtítulo */}
      <p className="text-lg md:text-2xl text-slate-300 max-w-3xl leading-relaxed mb-12">
        Tu aventura en el mundo del{" "}
        <span className="text-blue-400 font-semibold">pensamiento computacional</span>{" "}
        está a punto de comenzar.  
        Únete como <span className="text-green-400 font-semibold">profesor</span> para crear desafíos  
        o como <span className="text-blue-400 font-semibold">estudiante</span> para resolverlos.
      </p>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-6">
        <Link
          to="/auth"
          state={{ showLogin: true }}
          className="bg-blue-600 hover:bg-blue-700 px-10 py-4 rounded-xl font-bold text-lg shadow-lg transform transition hover:scale-105 hover:shadow-blue-500/30"
        >
          Iniciar Sesión
        </Link>
        <Link
          to="/auth"
          state={{ showLogin: false }}
          className="bg-green-600 hover:bg-green-700 px-10 py-4 rounded-xl font-bold text-lg shadow-lg transform transition hover:scale-105 hover:shadow-green-500/30"
        >
          Registrarse
        </Link>
      </div>

      {/* Footer */}
      <p className="text-sm text-slate-500 mt-16">
        © {new Date().getFullYear()} LogiX. Todos los derechos reservados.
      </p>
    </div>
  );
}

export default LandingPage;
