const express = require('express');
const multer  = require('multer');
const axios   = require('axios');
const FormData = require('form-data');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// URL del script PHP en cPanel
// Usar IP directa porque www.noticrack.com apunta a Vercel (no al cPanel)
const CPANEL_UPLOAD_URL = process.env.CPANEL_UPLOAD_URL || 'http://198.58.106.39/~noticrac/upload.php';
const CPANEL_UPLOAD_TOKEN = process.env.CPANEL_UPLOAD_TOKEN || 'noticrack_upload_2024_secret';

// Multer: almacena en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (permitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG, PNG, WebP o GIF'), false);
    }
  },
});

function getMimeFromBuffer(buf) {
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp';
  return null;
}

const MIME_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const MIME_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' };

/**
 * Envía el buffer de imagen al script PHP en cPanel y retorna la URL pública.
 */
async function subirACPanel(buffer, mimeType, carpeta = 'noticias') {
  const form = new FormData();
  const ext  = MIME_EXT[mimeType] || 'jpg';
  form.append('imagen', buffer, {
    filename:    `imagen_${Date.now()}.${ext}`,
    contentType: mimeType,
  });
  form.append('carpeta', carpeta);

  const response = await axios.post(CPANEL_UPLOAD_URL, form, {
    headers: {
      ...form.getHeaders(),
      'X-Upload-Token': CPANEL_UPLOAD_TOKEN,
    },
    timeout: 30000,
    maxContentLength: 15 * 1024 * 1024,
  });

  return response.data; // { url, filename, size }
}

// ── POST /api/upload/imagen ───────────────────────────────────────────────────
router.post('/imagen', verificarToken, upload.single('imagen'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen' });
  }

  const mimeReal = getMimeFromBuffer(req.file.buffer);
  if (!mimeReal || !MIME_PERMITIDOS.has(mimeReal)) {
    return res.status(400).json({ error: 'El archivo no es una imagen válida (JPG, PNG, WebP o GIF)' });
  }

  try {
    const resultado = await subirACPanel(req.file.buffer, mimeReal, 'noticias');
    res.json({
      url:      resultado.url,
      filename: resultado.filename,
      size:     resultado.size,
    });
  } catch (err) {
    console.error('Upload cPanel:', err.message);
    res.status(500).json({ error: 'Error al subir la imagen al servidor' });
  }
});

// ── POST /api/upload/avatar ───────────────────────────────────────────────────
router.post('/avatar', verificarToken, upload.single('imagen'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen' });
  }

  const mimeReal = getMimeFromBuffer(req.file.buffer);
  if (!mimeReal || !MIME_PERMITIDOS.has(mimeReal)) {
    return res.status(400).json({ error: 'El archivo no es una imagen válida (JPG, PNG, WebP o GIF)' });
  }

  try {
    const resultado = await subirACPanel(req.file.buffer, mimeReal, 'avatares');
    res.json({ url: resultado.url, filename: resultado.filename });
  } catch (err) {
    console.error('Upload avatar cPanel:', err.message);
    res.status(500).json({ error: 'Error al subir el avatar' });
  }
});

// ── POST /api/upload/video-thumbnail ─────────────────────────────────────────
// Sube la imagen de portada de un video
router.post('/video-thumbnail', verificarToken, upload.single('imagen'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ninguna imagen' });
  }

  const mimeReal = getMimeFromBuffer(req.file.buffer);
  if (!mimeReal || !MIME_PERMITIDOS.has(mimeReal)) {
    return res.status(400).json({ error: 'El archivo no es una imagen válida (JPG, PNG, WebP o GIF)' });
  }

  try {
    const resultado = await subirACPanel(req.file.buffer, mimeReal, 'videos');
    res.json({ url: resultado.url, filename: resultado.filename });
  } catch (err) {
    console.error('Upload video-thumbnail cPanel:', err.message);
    res.status(500).json({ error: 'Error al subir la imagen del video' });
  }
});

// Manejo de errores de multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Error de archivo: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
