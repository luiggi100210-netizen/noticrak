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
    // Enriquecer con count de noticias por autor (útil para la UI de eliminar)
    const conCount = await Promise.all(
      usuarios.map(async u => ({
        ...u,
        noticias_count: await Usuario.countNoticias(u.id),
      }))
    );
    res.json(conCount);
  } catch (err) {
    console.error('GET /auth/usuarios:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── PUT /api/auth/usuarios/:id (solo admin) ───────────────────────────────────
// Actualiza nombre, email, rol, activo. Password se cambia aparte.
router.put('/usuarios/:id', soloAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const { nombre, email, rol, activo, password } = req.body;

  // Validaciones
  if (rol !== undefined && !['periodista', 'admin'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido. Use: periodista | admin' });
  }

  try {
    const existente = await Usuario.getById(id);
    if (!existente) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No permitir que el último admin activo se degrade o desactive a sí mismo
    const esSelf = req.usuario?.id === id;
    const degradandose = rol !== undefined && rol !== 'admin' && existente.rol === 'admin';
    const desactivandose = activo === false && existente.activo === true && existente.rol === 'admin';

    if (esSelf && (degradandose || desactivandose)) {
      return res.status(400).json({ error: 'No puedes cambiar tu propio rol ni desactivarte' });
    }

    if ((degradandose || desactivandose) && !esSelf) {
      const adminsActivos = await Usuario.countAdminsActivos();
      if (adminsActivos <= 1) {
        return res.status(400).json({ error: 'Debe quedar al menos un admin activo' });
      }
    }

    // Si se cambia email, validar que no esté en uso por otro usuario
    if (email && email.toLowerCase().trim() !== existente.email) {
      const conflicto = await Usuario.getByEmail(email);
      if (conflicto && conflicto.id !== id) {
        return res.status(409).json({ error: 'Ese email ya está en uso' });
      }
    }

    const actualizado = await Usuario.update(id, { nombre, email, rol, activo });

    // Cambio de password opcional en el mismo request
    if (password && String(password).length >= 8) {
      const hash = await bcrypt.hash(password, 10);
      await Usuario.updatePassword(id, hash);
    } else if (password) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    res.json(actualizado);
  } catch (err) {
    console.error('PUT /auth/usuarios/:id:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ── DELETE /api/auth/usuarios/:id (solo admin) ────────────────────────────────
// Las noticias del autor quedan con autor_id = NULL (FK ON DELETE SET NULL).
router.delete('/usuarios/:id', soloAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // No permitir auto-borrado
  if (req.usuario?.id === id) {
    return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  }

  try {
    const existente = await Usuario.getById(id);
    if (!existente) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Proteger al último admin activo
    if (existente.rol === 'admin' && existente.activo) {
      const adminsActivos = await Usuario.countAdminsActivos();
      if (adminsActivos <= 1) {
        return res.status(400).json({ error: 'Debe quedar al menos un admin activo' });
      }
    }

    const borrado = await Usuario.remove(id);
    if (!borrado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ ok: true, mensaje: 'Usuario eliminado. Sus noticias quedaron sin autor asignado.' });
  } catch (err) {
    console.error('DELETE /auth/usuarios/:id:', err.message);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
