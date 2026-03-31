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
