const express = require('express');
const Radio = require('../models/Radio');

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
// Devuelve el programa que está en emisión en este momento (hora Lima)
router.get('/ahora', async (req, res) => {
  try {
    const programa = await Radio.getProgramaActual();
    if (!programa) {
      return res.json({ enAire: false, mensaje: 'Sin programación en este momento' });
    }
    res.json({ enAire: true, programa });
  } catch (err) {
    console.error('GET /radio/ahora:', err.message);
    res.status(500).json({ error: 'Error al consultar la programación' });
  }
});

module.exports = router;
