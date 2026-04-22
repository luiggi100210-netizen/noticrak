const express = require('express');
const Noticia = require('../models/Noticia');
const { verificarToken, soloAdmin } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/noticias ─────────────────────────────────────────────────────────
// Query params: categoria, estado, limite, pagina, destacada, buscar
router.get('/', async (req, res) => {
  try {
    const { categoria, estado, limite, pagina, destacada, buscar } = req.query;
    const resultado = await Noticia.getAll({
      categoria,
      estado: estado || 'publicado',
      limite:   parseInt(limite)  || 12,
      pagina:   parseInt(pagina)  || 1,
      destacada: destacada !== undefined ? destacada === 'true' : undefined,
      buscar,
    });
    res.json(resultado);
  } catch (err) {
    console.error('GET /noticias:', err.message);
    res.status(500).json({ error: 'Error al obtener noticias' });
  }
});

// ── GET /api/noticias/admin/todas  (admin: todas sin filtro de estado) ─────────
router.get('/admin/todas', soloAdmin, async (req, res) => {
  try {
    const { categoria, estado, limite, pagina, buscar } = req.query;
    const resultado = await Noticia.getAll({
      categoria,
      estado: estado || 'todas',
      limite: parseInt(limite) || 20,
      pagina: parseInt(pagina) || 1,
      buscar,
    });
    res.json(resultado);
  } catch (err) {
    console.error('GET /noticias/admin/todas:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/noticias/admin/:id  (admin: noticia por ID numérico) ──────────────
router.get('/admin/:id', soloAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
  try {
    const noticia = await Noticia.getById(id);
    if (!noticia) return res.status(404).json({ error: 'Noticia no encontrada' });
    res.json(noticia);
  } catch (err) {
    console.error('GET /noticias/admin/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/noticias/destacadas ──────────────────────────────────────────────
router.get('/destacadas', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 5;
    const noticias = await Noticia.getDestacadas(limite);
    res.json(noticias);
  } catch (err) {
    console.error('GET /noticias/destacadas:', err.message);
    res.status(500).json({ error: 'Error al obtener noticias destacadas' });
  }
});

// ── GET /api/noticias/ticker ──────────────────────────────────────────────────
router.get('/ticker', async (req, res) => {
  try {
    const resultado = await Noticia.getAll({ estado: 'publicado', limite: 10, pagina: 1 });
    res.json(resultado.noticias);
  } catch (err) {
    console.error('GET /noticias/ticker:', err.message);
    res.status(500).json({ error: 'Error al obtener ticker' });
  }
});

// ── GET /api/noticias/portada ─────────────────────────────────────────────────
router.get('/portada', async (req, res) => {
  try {
    const portada = await Noticia.getPortada();
    res.json(portada);
  } catch (err) {
    console.error('GET /noticias/portada:', err.message);
    res.status(500).json({ error: 'Error al obtener portada' });
  }
});

// ── GET /api/noticias/:slug ───────────────────────────────────────────────────
router.get('/:slug', async (req, res) => {
  try {
    const noticia = await Noticia.getBySlug(req.params.slug);
    if (!noticia) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }
    res.json(noticia);
  } catch (err) {
    console.error('GET /noticias/:slug:', err.message);
    res.status(500).json({ error: 'Error al obtener la noticia' });
  }
});

// ── POST /api/noticias ────────────────────────────────────────────────────────
router.post('/', verificarToken, async (req, res) => {
  const { titulo, subtitulo, cuerpo, categoria_id, imagen_url, imagenes, estado, destacada, tags, fuente, autor_id } = req.body;

  if (!titulo || !cuerpo) {
    return res.status(400).json({ error: 'Título y cuerpo son requeridos' });
  }

  // Solo los admins pueden asignar un autor distinto al propio.
  // Los periodistas solo pueden publicar bajo su propio nombre.
  const esAdmin = req.usuario.rol === 'admin';
  const autorFinal = esAdmin && autor_id ? Number(autor_id) : req.usuario.id;

  try {
    const noticia = await Noticia.create({
      titulo, subtitulo, cuerpo, categoria_id,
      autor_id: autorFinal,
      imagen_url, imagenes, estado, destacada, tags, fuente,
    });
    res.status(201).json(noticia);
  } catch (err) {
    console.error('POST /noticias:', err.message);
    res.status(500).json({ error: 'Error al crear la noticia' });
  }
});

// ── PUT /api/noticias/:id ─────────────────────────────────────────────────────
router.put('/:id', verificarToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const existente = await Noticia.getById(id);
    if (!existente) return res.status(404).json({ error: 'Noticia no encontrada' });

    const esAdmin = req.usuario.rol === 'admin';
    const esAutor = existente.autor_id === req.usuario.id;
    if (!esAdmin && !esAutor) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta noticia' });
    }

    // Solo los admins pueden reasignar autor
    const cambios = { ...req.body };
    if (!esAdmin) delete cambios.autor_id;

    const noticia = await Noticia.update(id, cambios);
    res.json(noticia);
  } catch (err) {
    console.error('PUT /noticias/:id:', err.message);
    res.status(500).json({ error: 'Error al actualizar la noticia' });
  }
});

// ── DELETE /api/noticias/:id ──────────────────────────────────────────────────
router.delete('/:id', verificarToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const existente = await Noticia.getById(id);
    if (!existente) return res.status(404).json({ error: 'Noticia no encontrada' });

    const esAdmin = req.usuario.rol === 'admin';
    const esAutor = existente.autor_id === req.usuario.id;
    if (!esAdmin && !esAutor) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta noticia' });
    }

    const eliminada = await Noticia.delete(id);
    res.json({ mensaje: 'Noticia eliminada', id: eliminada.id });
  } catch (err) {
    console.error('DELETE /noticias/:id:', err.message);
    res.status(500).json({ error: 'Error al eliminar la noticia' });
  }
});

// ── PUT /api/noticias/:id/vistas ──────────────────────────────────────────────
router.put('/:id/vistas', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const resultado = await Noticia.sumarVista(id);
    if (!resultado) return res.status(404).json({ error: 'Noticia no encontrada' });
    res.json({ vistas: resultado.vistas });
  } catch (err) {
    console.error('PUT /noticias/:id/vistas:', err.message);
    res.status(500).json({ error: 'Error al registrar vista' });
  }
});

module.exports = router;
