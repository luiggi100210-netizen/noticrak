const express = require('express');
const Categoria = require('../models/Categoria');

const router = express.Router();

// ── GET /api/categorias ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const categorias = await Categoria.getAll();
    res.json(categorias);
  } catch (err) {
    console.error('GET /categorias:', err.message);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// ── GET /api/categorias/:slug ─────────────────────────────────────────────────
// Devuelve la categoría con sus noticias recientes publicadas
router.get('/:slug', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    const resultado = await Categoria.getConNoticias(req.params.slug, limite);
    if (!resultado) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(resultado);
  } catch (err) {
    console.error('GET /categorias/:slug:', err.message);
    res.status(500).json({ error: 'Error al obtener la categoría' });
  }
});

module.exports = router;
