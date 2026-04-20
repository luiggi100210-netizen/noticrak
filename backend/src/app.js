require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// ── Validar variables de entorno críticas al arrancar ─────────────────────────
const requiredEnv = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnv = requiredEnv.filter(name => !process.env[name]);
if (missingEnv.length > 0) {
  console.error(`❌ Faltan variables de entorno: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const app = express();

// Confiar en el proxy de Render/Vercel/cPanel para leer X-Forwarded-For correctamente
app.set('trust proxy', 1);

// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta más tarde.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión, intenta en 15 minutos.' },
});

app.use(globalLimiter);

// ── Middlewares globales ──────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'https://noticrack.com',
  'https://www.noticrack.com',
  'https://admin.noticrack.com',
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Sin caché en todas las respuestas API ─────────────────────────────────────
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma':        'no-cache',
    'Expires':       '0',
    'Surrogate-Control': 'no-store',
  });
  next();
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/noticias',   require('./routes/noticias'));
app.use('/api/videos',     require('./routes/videos'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/upload',     require('./routes/upload'));
app.use('/api/radio',      require('./routes/radio'));
app.use('/api/redes',      require('./routes/redes'));

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
