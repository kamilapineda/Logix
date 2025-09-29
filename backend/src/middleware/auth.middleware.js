const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Buscar token en cookie o en header Authorization
  const token =
    req.cookies?.token || // cookie httpOnly (preferida)
    (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]); // Bearer TOKEN

  // Si no hay token, bloquear acceso
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: No se proporcionó token.' });
  }

  try {
    // Verificar token con la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

     // Guardar datos del usuario en la request
    req.user = decoded;

    // Pasar al siguiente middleware
    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error.message);
    return res.status(403).json({ error: 'Acceso denegado: Token no válido o expirado.' });
  }
};

module.exports = authMiddleware;
