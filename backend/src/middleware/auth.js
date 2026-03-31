const jwt = require('jsonwebtoken');

/**
 * Extrae y verifica el JWT del header Authorization: Bearer <token>.
 * Si es válido agrega req.usuario = { id, nombre, email, rol }.
 * Si falla responde 401.
 */
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = {
      id:     payload.id,
      nombre: payload.nombre,
      email:  payload.email,
      rol:    payload.rol,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado, vuelve a iniciar sesión' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

/**
 * Middleware de rol admin.
 * Llama verificarToken internamente: úsalo SOLO (no encadenes verificarToken antes).
 *
 *   router.post('/ruta', soloAdmin, handler)   ← correcto
 *   router.post('/ruta', verificarToken, soloAdmin, handler)  ← redundante
 */
function soloAdmin(req, res, next) {
  // Reutiliza verificarToken pasando un next interno
  verificarToken(req, res, () => {
    if (req.usuario?.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado: se requiere rol administrador' });
    }
    next();
  });
}

module.exports = { verificarToken, soloAdmin };
