import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, BarChart2, Users } from 'lucide-react';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

    // Cerrar sesión y redirigir al inicio
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Si no hay usuario, no mostrar header
  if (!user) return null;

  // Limpiar el rol y definir ruta del dashboard
  const roleClean = user.role?.replace(/^['"]+|['"]+$/g, "");
  const dashboardPath = roleClean === "Profesor" ? "/professor" : "/student";

  return (
    <header className="bg-slate-900 text-white shadow-md w-full z-20 sticky top-0">
      <div className="container mx-auto flex justify-between items-center py-3 px-6">
        
        {/* Logo */}
        <Link
          to={dashboardPath}
          className="text-3xl font-extrabold text-gradient bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent hover:opacity-90 transition duration-300"
        >
          LogiX
        </Link>

        {/* Botones */}
        <div className="flex items-center gap-4">
          {roleClean === "Estudiante" && (
            <>
              <Link
                to="/student/stats"
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full shadow-md w-52 text-center transition transform hover:scale-105"
              >
                <BarChart2 size={18} />
                Mis Estadísticas
              </Link>

              <Link
                to="/student/badges"
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-full shadow-md w-52 text-center transition transform hover:scale-105"
              >
                <Users size={18} />
                Mis Insignias
              </Link>
            </>
          )}

          {roleClean === "Profesor" && (
            <Link
              to="/professor/stats"
              className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded-full shadow-md w-52 text-center transition transform hover:scale-105"
            >
              <Users size={18} />
              Estadísticas Estudiantes
            </Link>
          )}
        </div>

        {/* Perfil */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center justify-center w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full shadow-md transition"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full border border-slate-600"
              />
            ) : (
              <User size={20} />
            )}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg py-2 z-50">
              <Link
                to="/profile"
                className="block px-4 py-2 hover:bg-slate-700 transition"
                onClick={() => setProfileOpen(false)}
              >
                Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-700 transition text-red-400"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;
