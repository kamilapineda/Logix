import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Este componente es nuestro "guardia de seguridad".
// Recibe como 'children' la página que queremos proteger.
const ProtectedRoute = ({ children }) => {
  // 1. Lee el "tablón de anuncios" para ver si hay un usuario.
  const { user } = useContext(AuthContext);

  // 2. Si NO hay un usuario...
  if (!user) {
    // ...lo redirige a la página de inicio de sesión ("/").
    return <Navigate to="/" />;
  }

  // 3. Si SÍ hay un usuario, le permite ver la página.
  return children;
};

export default ProtectedRoute;