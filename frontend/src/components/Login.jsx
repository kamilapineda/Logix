import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProfileAPI } from '../services/api';

function Login() {
  const [email, setEmail] = useState(''); // Estado para el correo
  const [password, setPassword] = useState(''); // Estado para la contraseña
  const [message, setMessage] = useState(''); // Estado para mostrar mensajes

  const navigate = useNavigate(); // Hook para redirección
  const { login } = useContext(AuthContext); // Acceso al contexto de autenticación

  const handleSubmit = async (event) => {
    event.preventDefault(); // Previene recarga del formulario
    setMessage('');

    try {
      // Hacemos la petición al backend para login
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // Respuesta del backend
      console.log('Paquete recibido del backend:', data);

      if (!response.ok) {
        setMessage(`Error: ${data.error || 'Credenciales inválidas.'}`);
        return;
      }

      // Pedimos el perfil completo al backend
      try {
        const profile = await getProfileAPI();
        login(profile); // Guardamos el perfil en el contexto
        localStorage.setItem('user', JSON.stringify(profile)); 

        console.log('Perfil cargado:', profile);

        if (profile.role === "Profesor" || profile.role === "'Profesor'") {
          navigate('/professor');
        } else {
          navigate('/student');
        }
      } catch (err) {
        console.error("Error obteniendo perfil:", err);

        // Si falla, usamos el usuario del login
        login(data.user); 
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.user.role === "Profesor" || data.user.role === "'Profesor'") {
          navigate('/professor');
        } else {
          navigate('/student');
        }
      }

    } catch (error) {
      setMessage('Error de conexión. Inténtalo de nuevo.'); // Error de red
      console.error('El error detallado es:', error);
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-96">
      <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Email:</label>
          <input 
            type="email" 
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Contraseña:</label>
          <input 
            type="password" 
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
        >
          Ingresar
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}

export default Login;
