const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');
const bcrypt = require('bcrypt');

// FUNCIÓN DE PRUEBA
const test = (req, res) => {
  res.send('¡Hola, mundo desde el backend de LogiX!');
};

// FUNCIÓN DE REGISTRO - VERSIÓN MEJORADA
const register = async (req, res) => {
  try {
    // 1. Ahora también recibimos el 'rol' desde el frontend
    const { name, email, password, role } = req.body;

    // Validamos que el rol sea uno de los permitidos
    if (role !== 'Estudiante' && role !== "'Profesor'") {
        return res.status(400).json({ error: 'Rol no válido.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabase
      .from('users')
      // 2. Usamos la variable 'role' al insertar el nuevo usuario
      .insert([{ name, email, password: hashedPassword, role: role }])
      .select();
      
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ message: 'Usuario registrado con éxito', user: data });
  } catch (error) {
    res.status(500).json({ error: 'Error inesperado en el servidor' });
  }
};

// FUNCIÓN DE LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ 
      message: 'Login exitoso', 
      token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ error: 'Error inesperado en el servidor' });
  }
};

// EXPORTACIONES
module.exports = {
  register,
  login,
  test,
};