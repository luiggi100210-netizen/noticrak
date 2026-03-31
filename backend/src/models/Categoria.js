const pool = require('../config/database');

const Categoria = {
  /** Todas las categorías activas */
  async getAll() {
    const { rows } = await pool.query(
      `SELECT id, nombre, slug, color, activo
       FROM categorias
       WHERE activo = true
       ORDER BY nombre ASC`
    );
    return rows;
  },

  /** Una categoría por slug */
  async getBySlug(slug) {
    const { rows } = await pool.query(
      'SELECT id, nombre, slug, color, activo FROM categorias WHERE slug = $1',
      [slug]
    );
    return rows[0] || null;
  },

  /** Categoría con sus noticias recientes publicadas */
  async getConNoticias(slug, limite = 10) {
    const cat = await this.getBySlug(slug);
    if (!cat) return null;

    const { rows } = await pool.query(
      `SELECT
         n.id, n.titulo, n.slug, n.subtitulo, n.imagen_url,
         n.destacada, n.vistas, n.fecha_publicacion,
         u.nombre AS autor_nombre
       FROM noticias n
       LEFT JOIN usuarios u ON u.id = n.autor_id
       WHERE n.categoria_id = $1 AND n.estado = 'publicado'
       ORDER BY n.fecha_publicacion DESC
       LIMIT $2`,
      [cat.id, limite]
    );

    return { ...cat, noticias: rows };
  },
};

module.exports = Categoria;
