const router = require('express').Router();
const RedesSociales = require('../models/RedesSociales');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// Público: sólo las activas
router.get('/', async (req, res) => {
  try {
    const redes = await RedesSociales.getActivas();
    res.json({ ok: true, data: redes });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Admin: todas
router.get('/admin', verificarToken, soloAdmin, async (req, res) => {
  try {
    const redes = await RedesSociales.getAll();
    res.json({ ok: true, data: redes });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Admin: actualizar una red
router.put('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { url, activo } = req.body;
    const red = await RedesSociales.update(req.params.id, { url, activo });
    res.json({ ok: true, data: red });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
