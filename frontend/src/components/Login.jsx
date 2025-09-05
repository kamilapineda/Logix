// 1. Importa los nuevos hooks: useContext y useNavigate
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// 2. Importa nuestro AuthContext (el tablón de anuncios)
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // 3. Prepara los hooks para usarlos
  const navigate = useNavigate(); // Hook para la navegación
  const { login } = useContext(AuthContext); // Hook para usar la función 'login' de nuestro contexto

// Dentro de tu componente Login.jsx

const handleSubmit = async (event) => {
  event.preventDefault();
  setMessage('');
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    console.log('Paquete recibido del backend:', data); 

    if (response.ok) {
        localStorage.setItem('authToken', data.token);
      // --- ¡AQUÍ ESTÁ EL ARREGLO! ---
      const loggedInUser = data.user; // Quitamos el [0]

      login(loggedInUser); 
      
      console.log('Rol del usuario que inició sesión:', loggedInUser.role);

      if (loggedInUser.role === "'Profesor'") { // Aún comparamos con las comillas
        navigate('/professor');
      } else {
        navigate('/student');
      }
    } else {
      setMessage(`Error: ${data.error || 'Credenciales inválidas.'}`);
    }
  } catch (error) {
    setMessage('Error de conexión. Inténtalo de nuevo.');
    console.error('El error detallado es:', error);
  }
};

  return (
    // ... El JSX del formulario no cambia ...
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
  )
}

export default Login;