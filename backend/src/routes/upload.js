const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer: almacena en memoria para pasar el buffer a Cloudinary
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

/**
 * Verifica los magic bytes del buffer para confirmar que es una imagen real.
 * El Content-Type del cliente no es confiable; los bytes iniciales si.
 */
function getMimeFromBuffer(buf) {
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif';
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp';
  return null;
}

const MIME_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

/**
 * Sube un buffer a Cloudinary usando upload_stream.
 * Retorna la respuesta de Cloudinary (secure_url, public_id, etc.)
 */
function subirCloudinary(buffer, carpeta = 'noticrack') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: carpeta, resource_type: 'image', quality: 'auto:good' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
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
    const resultado = await subirCloudinary(req.file.buffer, 'noticrack/noticias');
    res.json({
      url:       resultado.secure_url,
      public_id: resultado.public_id,
      width:     resultado.width,
      height:    resultado.height,
      formato:   resultado.format,
    });
  } catch (err) {
    console.error('Upload Cloudinary:', err.message);
    res.status(500).json({ error: 'Error al subir la imagen a Cloudinary' });
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
    const resultado = await subirCloudinary(req.file.buffer, 'noticrack/avatares');
    res.json({ url: resultado.secure_url, public_id: resultado.public_id });
  } catch (err) {
    console.error('Upload avatar Cloudinary:', err.message);
    res.status(500).json({ error: 'Error al subir el avatar' });
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
