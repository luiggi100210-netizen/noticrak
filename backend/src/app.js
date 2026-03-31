require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ── Middlewares globales ──────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/noticias',   require('./routes/noticias'));
app.use('/api/videos',     require('./routes/videos'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/upload',     require('./routes/upload'));
app.use('/api/radio',      require('./routes/radio'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ mensaje: 'NotiCrack API v1.0 ✅', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ── Error handler global ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Arrancar servidor ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 API NotiCrack corriendo en http://localhost:${PORT}`);
});
