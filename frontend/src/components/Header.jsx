import { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Si no hay usuario logueado, no mostramos el Header
  if (!user) {
    return null;
  }

  // Determinamos el rol para mostrar un saludo apropiado o un enlace a su dashboard
  const userRoleText = user.role === "'Profesor'" ? "Profesor" : "Estudiante";
  const dashboardPath = user.role === "'Profesor'" ? "/professor" : "/student";

  return (
    <header className="bg-slate-800 text-white p-4 shadow-lg w-full z-10"> {/* Sombra y z-index */}
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo o Nombre de la App - ahora como un Link al dashboard */}
        <Link to={dashboardPath} className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors duration-200">
          LogiX
        </Link>

        {/* Info de Usuario y Botón de Logout */}
        <div className="flex items-center space-x-4">
          <span className="text-lg text-slate-300">
            {userRoleText}: <span className="font-semibold text-blue-300">{user.name || user.email}</span>
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-5 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;