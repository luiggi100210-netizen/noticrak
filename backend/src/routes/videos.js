const express = require('express');
const Video = require('../models/Video');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/videos ───────────────────────────────────────────────────────────
// Query params: categoria, estado, limite, pagina
router.get('/', async (req, res) => {
  try {
    const { categoria, estado, limite, pagina } = req.query;
    const resultado = await Video.getAll({
      categoria,
      estado: estado || 'publicado',
      limite: parseInt(limite) || 12,
      pagina: parseInt(pagina) || 1,
    });
    res.json(resultado);
  } catch (err) {
    console.error('GET /videos:', err.message);
    res.status(500).json({ error: 'Error al obtener videos' });
  }
});

// ── GET /api/videos/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const video = await Video.getById(id);
    if (!video) return res.status(404).json({ error: 'Video no encontrado' });
    res.json(video);
  } catch (err) {
    console.error('GET /videos/:id:', err.message);
    res.status(500).json({ error: 'Error al obtener el video' });
  }
});

// ── POST /api/videos ──────────────────────────────────────────────────────────
router.post('/', verificarToken, async (req, res) => {
  const { titulo, descripcion, url, imagen_url, duracion, categoria_id, estado } = req.body;

  if (!titulo || !url) {
    return res.status(400).json({ error: 'Título y URL son requeridos' });
  }

  try {
    const video = await Video.create({
      titulo, descripcion, url, imagen_url, duracion,
      categoria_id, estado,
      autor_id: req.usuario.id,
    });
    res.status(201).json(video);
  } catch (err) {
    console.error('POST /videos:', err.message);
    res.status(500).json({ error: 'Error al crear el video' });
  }
});

// ── PUT /api/videos/:id ───────────────────────────────────────────────────────
router.put('/:id', verificarToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const video = await Video.update(id, req.body);
    if (!video) return res.status(404).json({ error: 'Video no encontrado' });
    res.json(video);
  } catch (err) {
    console.error('PUT /videos/:id:', err.message);
    res.status(500).json({ error: 'Error al actualizar el video' });
  }
});

// ── DELETE /api/videos/:id ────────────────────────────────────────────────────
router.delete('/:id', verificarToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const eliminado = await Video.delete(id);
    if (!eliminado) return res.status(404).json({ error: 'Video no encontrado' });
    res.json({ mensaje: 'Video eliminado', id: eliminado.id });
  } catch (err) {
    console.error('DELETE /videos/:id:', err.message);
    res.status(500).json({ error: 'Error al eliminar el video' });
  }
});

module.exports = router;
