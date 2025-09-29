import { useState } from 'react';

function Register() {
    // Estados para datos del formulario y mensajes
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Estudiante');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

   // Validación de contraseña (mínimo 8 caracteres y 1 mayúscula)
  const validatePassword = (pwd) => /^(?=.*[A-Z]).{8,}$/.test(pwd);

   // Validación de email con regex
  const validateEmail = (mail) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

  // Manejo del envío de formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    // Validaciones básicas
    if (!validateEmail(email)) return setMessage('El formato del correo no es válido.');
    if (!validatePassword(password)) return setMessage('La contraseña debe tener al menos 8 caracteres e incluir una mayúscula.');
    if (password !== confirmPassword) return setMessage('Las contraseñas no coinciden.');

    try {
      // Petición al backend para registrar usuario
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('¡Registro exitoso!');
        // Reinicia formulario tras registro exitoso
        setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setRole('Estudiante');
      } else {
        setMessage(`Error: ${data.error || 'No se pudo registrar.'}`);
      }
    } catch {
      setMessage('Error de conexión. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Registrarse</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 text-sm font-medium">Nombre</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-1.5 bg-slate-700 rounded border border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-1.5 bg-slate-700 rounded border border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <label className="block mb-1 text-sm font-medium">Contraseña</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-1.5 pr-14 bg-slate-700 rounded border border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-7 text-blue-400 hover:text-blue-500 text-xs font-semibold"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        <div className="relative">
          <label className="block mb-1 text-sm font-medium">Repetir contraseña</label>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-1.5 pr-14 bg-slate-700 rounded border border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-2 top-7 text-blue-400 hover:text-blue-500 text-xs font-semibold"
          >
            {showConfirm ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Registrarse como</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-1.5 bg-slate-700 rounded border border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Estudiante">Estudiante</option>
            <option value="Profesor">Profesor</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1.5 px-3 rounded transition-colors duration-300"
        >
          Registrarse
        </button>
      </form>
      {message && <p className="mt-3 text-center text-sm">{message}</p>}
    </div>
  );
}

export default Register;
