const pool = require('../config/database');

const Video = {
  /** Lista videos con filtro opcional por categoría */
  async getAll({ categoria, estado = 'publicado', limite = 12, pagina = 1 } = {}) {
    const params = [];
    const condiciones = [];
    let idx = 1;

    condiciones.push(`v.estado = $${idx++}`);
    params.push(estado);

    if (categoria) {
      condiciones.push(`c.slug = $${idx++}`);
      params.push(categoria);
    }

    const where = `WHERE ${condiciones.join(' AND ')}`;
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    const sql = `
      SELECT
        v.id, v.titulo, v.descripcion, v.url, v.imagen_url,
        v.duracion, v.estado, v.vistas, v.created_at,
        c.nombre AS categoria_nombre, c.slug AS categoria_slug, c.color AS categoria_color,
        u.nombre AS autor_nombre
      FROM videos v
      LEFT JOIN categorias c ON c.id = v.categoria_id
      LEFT JOIN usuarios   u ON u.id = v.autor_id
      ${where}
      ORDER BY v.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(parseInt(limite), offset);

    const countSql = `
      SELECT COUNT(*) AS total
      FROM videos v
      LEFT JOIN categorias c ON c.id = v.categoria_id
      ${where}
    `;

    const [rows, countRow] = await Promise.all([
      pool.query(sql, params),
      pool.query(countSql, params.slice(0, params.length - 2)),
    ]);

    return {
      videos: rows.rows,
      total: parseInt(countRow.rows[0].total),
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(parseInt(countRow.rows[0].total) / parseInt(limite)),
    };
  },

  /** Un video por ID */
  async getById(id) {
    const { rows } = await pool.query(
      `SELECT
         v.*,
         c.nombre AS categoria_nombre, c.slug AS categoria_slug, c.color AS categoria_color,
         u.nombre AS autor_nombre
       FROM videos v
       LEFT JOIN categorias c ON c.id = v.categoria_id
       LEFT JOIN usuarios   u ON u.id = v.autor_id
       WHERE v.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  /** Crea un video nuevo */
  async create({ titulo, descripcion, url, imagen_url, duracion, categoria_id, autor_id, estado }) {
    const { rows } = await pool.query(
      `INSERT INTO videos (titulo, descripcion, url, imagen_url, duracion, categoria_id, autor_id, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [titulo, descripcion || null, url, imagen_url || null, duracion || null,
       categoria_id || null, autor_id || null, estado || 'publicado']
    );
    return rows[0];
  },

  /** Actualiza un video */
  async update(id, { titulo, descripcion, url, imagen_url, duracion, categoria_id, estado }) {
    const sets = [];
    const params = [];
    let idx = 1;

    if (titulo !== undefined)      { sets.push(`titulo = $${idx++}`);      params.push(titulo); }
    if (descripcion !== undefined) { sets.push(`descripcion = $${idx++}`); params.push(descripcion); }
    if (url !== undefined)         { sets.push(`url = $${idx++}`);         params.push(url); }
    if (imagen_url !== undefined)  { sets.push(`imagen_url = $${idx++}`);  params.push(imagen_url); }
    if (duracion !== undefined)    { sets.push(`duracion = $${idx++}`);    params.push(duracion); }
    if (categoria_id !== undefined){ sets.push(`categoria_id = $${idx++}`);params.push(categoria_id); }
    if (estado !== undefined)      { sets.push(`estado = $${idx++}`);      params.push(estado); }

    if (!sets.length) throw new Error('No hay campos para actualizar');

    params.push(id);
    const { rows } = await pool.query(
      `UPDATE videos SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return rows[0] || null;
  },

  /** Elimina un video */
  async delete(id) {
    const { rows } = await pool.query(
      'DELETE FROM videos WHERE id = $1 RETURNING id',
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = Video;
