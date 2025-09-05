import { useState } from 'react';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Estudiante');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(''); 
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('¡Registro exitoso!');
      } else {
        setMessage(`Error: ${data.error || 'No se pudo registrar.'}`);
      }
    } catch (error) {
      setMessage('Error de conexión. Inténtalo de nuevo.');
      // Añade esta línea para usar la variable 'error'
      console.error('El error detallado es:', error);
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-96">
      <h2 className="text-2xl font-bold mb-6 text-center">Registro de Aventurero</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Nombre:</label>
          <input 
            type="text" 
            placeholder="Tu nombre de aventurero"
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
            placeholder="Una contraseña secreta"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Registrarse como:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Estudiante">Estudiante</option>
            <option value="'Profesor'">Profesor</option>
          </select>
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
        >
          Registrarse
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  )
}

export default Register;