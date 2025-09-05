const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  // 1. Buscamos el "pase" (token) en los encabezados de la petición
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  // 2. Si no hay pase, le negamos el acceso
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: No se proporcionó token.' });
  }

  try {
    // 3. Verificamos si el pase es auténtico usando nuestra palabra secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Si es auténtico, adjuntamos la info del usuario a la petición
    //    para que el siguiente en la fila (el controlador) pueda usarla.
    req.user = decoded;

    // 5. Le decimos "puedes pasar"
    next();
  } catch (error) {
    // Si el pase es falso o ha expirado, le negamos el acceso
    res.status(403).json({ error: 'Acceso denegado: Token no válido.' });
  }
};

module.exports = authMiddleware;