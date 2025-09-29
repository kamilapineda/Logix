import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);  // Obtiene usuario y estado de carga del contexto 

  if (loading) {
    return <div>Cargando...</div>; // Muestra indicador mientras valida sesión
  }

  if (!user) {
    return <Navigate to="/" />; // Redirige al inicio si no hay usuario
  } 

  return children; // Renderiza el contenido protegido si hay sesión
};

export default ProtectedRoute;
