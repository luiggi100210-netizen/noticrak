const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { verificarToken, soloAdmin } = require('../middleware/auth');

const router = express.Router();

/** Genera un JWT con { id, nombre, email, rol }, expira en 8 horas */
function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son requeridos' });
  }

  try {
    // getByEmail incluye el campo password (necesario para bcrypt.compare)
    const usuario = await Usuario.getByEmail(email);

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      return res.status(401).json({ error: 'Cuenta desactivada' });
    }

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = firmarToken(usuario);

    res.json({
      token,
      usuario: {
        id:     usuario.id,
        nombre: usuario.nombre,
        email:  usuario.email,
        rol:    usuario.rol,
      },
    });
  } catch (err) {
    console.error('POST /auth/login:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── POST /api/auth/register (solo admin puede crear periodistas) ───────────────
router.post('/register', soloAdmin, async (req, res) => {
  const { nombre, email, password, rol = 'periodista' } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y password son requeridos' });
  }

  if (!['periodista', 'admin'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido. Use: periodista | admin' });
  }

  try {
    const existe = await Usuario.getByEmail(email);
    if (existe) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nuevo = await Usuario.create({
      nombre: nombre.trim(),
      email:  email.toLowerCase().trim(),
      passwordHash,
      rol,
    });

    // Nunca devolver el hash en la respuesta
    res.status(201).json({ usuario: nuevo });
  } catch (err) {
    console.error('POST /auth/register:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.getById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    console.error('GET /auth/me:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── PUT /api/auth/password ────────────────────────────────────────────────────
router.put('/password', verificarToken, async (req, res) => {
  const { passwordActual, passwordNueva } = req.body;

  if (!passwordActual || !passwordNueva) {
    return res.status(400).json({ error: 'Se requieren passwordActual y passwordNueva' });
  }

  if (passwordNueva.length < 8) {
    return res.status(400).json({ error: 'La nueva password debe tener al menos 8 caracteres' });
  }

  try {
    // getByEmail / getById sin password → necesitamos getByEmail para obtener el hash
    const usuarioConHash = await Usuario.getByEmail(req.usuario.email);
    if (!usuarioConHash) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const passwordOk = await bcrypt.compare(passwordActual, usuarioConHash.password);
    if (!passwordOk) {
      return res.status(401).json({ error: 'La password actual es incorrecta' });
    }

    const nuevoHash = await bcrypt.hash(passwordNueva, 10);
    await Usuario.updatePassword(req.usuario.id, nuevoHash);

    res.json({ mensaje: 'Password actualizada correctamente' });
  } catch (err) {
    console.error('PUT /auth/password:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── GET /api/auth/usuarios (solo admin) ───────────────────────────────────────
router.get('/usuarios', soloAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.json(usuarios);
  } catch (err) {
    console.error('GET /auth/usuarios:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
