const express = require('express');
const Radio = require('../models/Radio');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/radio/programas ──────────────────────────────────────────────────
router.get('/programas', async (req, res) => {
  try {
    const programas = await Radio.getProgramas();
    res.json(programas);
  } catch (err) {
    console.error('GET /radio/programas:', err.message);
    res.status(500).json({ error: 'Error al obtener programas de radio' });
  }
});

// ── GET /api/radio/ahora ──────────────────────────────────────────────────────
// Si radio inactiva → { ok:true, data:null }
// Si radio activa   → { ok:true, data: config }
router.get('/ahora', async (req, res) => {
  try {
    const config = await Radio.getConfig();
    if (!config || !config.activo) {
      return res.json({ ok: true, data: null });
    }
    res.json({ ok: true, data: config });
  } catch (err) {
    console.error('GET /radio/ahora:', err.message);
    res.status(500).json({ ok: false, error: 'Error al consultar radio' });
  }
});

// ── GET /api/radio/estado (admin) ─────────────────────────────────────────────
router.get('/estado', verificarToken, async (req, res) => {
  try {
    const config = await Radio.getConfig();
    res.json({ ok: true, data: config });
  } catch (err) {
    console.error('GET /radio/estado:', err.message);
    res.status(500).json({ ok: false, error: 'Error al obtener configuración' });
  }
});

// ── PUT /api/radio/estado (admin) ─────────────────────────────────────────────
router.put('/estado', verificarToken, async (req, res) => {
  try {
    const { activo, stream_url, nombre, descripcion } = req.body;
    if (typeof activo !== 'boolean') {
      return res.status(400).json({ ok: false, error: 'activo debe ser true o false' });
    }
    const config = await Radio.updateConfig({ activo, stream_url, nombre, descripcion });
    res.json({ ok: true, data: config });
  } catch (err) {
    console.error('PUT /radio/estado:', err.message);
    res.status(500).json({ ok: false, error: 'Error al actualizar configuración' });
  }
});

module.exports = router;
