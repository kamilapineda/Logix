const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');
const bcrypt = require('bcrypt');

// Respuesta de prueba para comprobar que el backend funciona
const test = (req, res) => {
  res.send('¡Hola, mundo desde el backend de LogiX!');
};

// Registro de usuario con validación de rol y contraseña hasheada
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role !== 'Estudiante' && role !== 'Profesor') {
      return res.status(400).json({ error: 'Rol no válido.' });
    }

    // Encriptar la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario en la base de datos
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, role }])
      .select('id, name, email, role, avatar, bio, grade, institution')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ message: 'Usuario registrado con éxito', user: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inesperado en el servidor' });
  }
};

// Inicio de sesión con validación de credenciales y generación de token
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Crear token con expiración de 5 horas
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

// Guardar token en cookie segura
const cookieOptions = {
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 5, // 5 horas
  secure: process.env.NODE_ENV === 'production', // true en producción con HTTPS
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};

res.cookie('token', token, cookieOptions);
res.json({
  message: 'Login exitoso',
  user: {
    id: user.id,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    grade: user.grade,
    institution: user.institution,
  },
});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inesperado en el servidor' });
  }
};

// Validación del token y renovación si sigue siendo válido
const validateToken = async (req, res) => {
  try {
    const token = req.cookies.token; // 🔑 ahora lo sacamos de la cookie

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
      }

      // Buscar usuario asociado al token
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role, avatar, bio, grade, institution')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Renovar token
      const newToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '5h' }
      );

      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 5,
      });

      res.json({ user });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error validando token' });
  }
};

// Cierra sesión eliminando la cookie del token
const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada correctamente' });
};

module.exports = {
  register,
  login,
  test,
  validateToken,
  logout,
};
