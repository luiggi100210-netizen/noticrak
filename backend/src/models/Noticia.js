const pool = require('../config/database');
const crearSlug = require('../utils/slugify');

const Noticia = {
  /**
   * Lista paginada con filtros opcionales.
   * @param {object} opts - { categoria, estado, limite, pagina, destacada, buscar }
   */
  async getAll({ categoria, estado = 'publicado', limite = 12, pagina = 1, destacada, buscar } = {}) {
    const params = [];
    const condiciones = [];
    let idx = 1;

    condiciones.push(`n.estado = $${idx++}`);
    params.push(estado);

    if (categoria) {
      condiciones.push(`c.slug = $${idx++}`);
      params.push(categoria);
    }

    if (destacada !== undefined) {
      condiciones.push(`n.destacada = $${idx++}`);
      params.push(destacada);
    }

    if (buscar) {
      condiciones.push(
        `(to_tsvector('spanish', n.titulo || ' ' || COALESCE(n.subtitulo,'') || ' ' || n.cuerpo) @@ plainto_tsquery('spanish', $${idx++}))`
      );
      params.push(buscar);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    const sql = `
      SELECT
        n.id::text, n.titulo, n.slug,
        n.subtitulo AS resumen,
        n.imagen_url,
        n.estado, (n.estado = 'publicado') AS publicado,
        n.destacada AS destacado,
        n.tags, n.fuente, n.vistas,
        n.fecha_publicacion, n.updated_at AS "createdAt",
        c.slug    AS categoria,
        c.slug    AS categoria_slug,
        c.nombre  AS categoria_nombre,
        c.color   AS categoria_color,
        u.nombre  AS autor_nombre
      FROM noticias n
      LEFT JOIN categorias c ON c.id = n.categoria_id
      LEFT JOIN usuarios   u ON u.id = n.autor_id
      ${where}
      ORDER BY n.fecha_publicacion DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(parseInt(limite), offset);

    const countSql = `
      SELECT COUNT(*) AS total
      FROM noticias n
      LEFT JOIN categorias c ON c.id = n.categoria_id
      ${where}
    `;

    const [rows, countRow] = await Promise.all([
      pool.query(sql, params),
      pool.query(countSql, params.slice(0, params.length - 2)),
    ]);

    return {
      noticias: rows.rows,
      total: parseInt(countRow.rows[0].total),
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      totalPaginas: Math.ceil(parseInt(countRow.rows[0].total) / parseInt(limite)),
    };
  },

  /** Noticias destacadas */
  async getDestacadas(limite = 5) {
    const { rows } = await pool.query(
      `SELECT
         n.id::text, n.titulo, n.slug, n.subtitulo AS resumen, n.imagen_url,
         n.destacada AS destacado, (n.estado = 'publicado') AS publicado,
         n.tags, n.vistas, n.fecha_publicacion, n.updated_at AS "createdAt",
         c.slug AS categoria, c.slug AS categoria_slug,
         c.nombre AS categoria_nombre, c.color AS categoria_color,
         u.nombre AS autor_nombre
       FROM noticias n
       LEFT JOIN categorias c ON c.id = n.categoria_id
       LEFT JOIN usuarios   u ON u.id = n.autor_id
       WHERE n.estado = 'publicado' AND n.destacada = true
       ORDER BY n.fecha_publicacion DESC
       LIMIT $1`,
      [limite]
    );
    return rows;
  },

  /** Una noticia completa por slug, con relacionadas */
  async getBySlug(slug) {
    const { rows } = await pool.query(
      `SELECT
         n.id::text, n.titulo, n.slug,
         n.subtitulo AS resumen,
         n.cuerpo    AS contenido,
         n.imagen_url,
         n.imagenes,
         n.estado, (n.estado = 'publicado') AS publicado,
         n.destacada AS destacado,
         n.tags, n.fuente, n.vistas,
         n.fecha_publicacion, n.updated_at AS "createdAt",
         c.slug    AS categoria,
         c.nombre  AS categoria_nombre,
         c.color   AS categoria_color,
         u.nombre  AS autor_nombre
       FROM noticias n
       LEFT JOIN categorias c ON c.id = n.categoria_id
       LEFT JOIN usuarios   u ON u.id = n.autor_id
       WHERE n.slug = $1 AND n.estado = 'publicado'`,
      [slug]
    );
    const noticia = rows[0] || null;
    if (!noticia) return null;

    // Relacionadas: misma categoría, distinta noticia
    const { rows: rel } = await pool.query(
      `SELECT
         n.id::text, n.titulo, n.slug, n.subtitulo AS resumen,
         n.imagen_url, n.vistas, n.fecha_publicacion, n.updated_at AS "createdAt",
         c.slug AS categoria, c.nombre AS categoria_nombre, c.color AS categoria_color,
         u.nombre AS autor_nombre
       FROM noticias n
       LEFT JOIN categorias c ON c.id = n.categoria_id
       LEFT JOIN usuarios   u ON u.id = n.autor_id
       WHERE c.slug = $1 AND n.slug != $2 AND n.estado = 'publicado'
       ORDER BY n.fecha_publicacion DESC
       LIMIT 5`,
      [noticia.categoria, slug]
    );

    return { noticia, relacionadas: rel };
  },

  /** Crea una noticia nueva */
  async create({ titulo, subtitulo, cuerpo, categoria_id, autor_id, imagen_url, estado, destacada, tags, fuente, imagenes = [] }) {
    const baseSlug   = crearSlug(titulo);
    const estadoFinal = estado || 'borrador';
    const valores    = (slug) => [
      titulo, slug, subtitulo || null, cuerpo, categoria_id || null, autor_id || null,
      imagen_url || null, estadoFinal, destacada || false, tags || [], fuente || null, imagenes || [],
    ];
    const sql = `INSERT INTO noticias
         (titulo, slug, subtitulo, cuerpo, categoria_id, autor_id, imagen_url, estado, destacada, tags, fuente, imagenes, fecha_publicacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, NOW())
       RETURNING *`;

    try {
      const { rows } = await pool.query(sql, valores(baseSlug));
      return rows[0];
    } catch (err) {
      // Colision de slug por insercion concurrente — reintenta con sufijo de tiempo
      if (err.code === '23505') {
        const slugUnico = `${baseSlug}-${Date.now()}`;
        const { rows } = await pool.query(sql, valores(slugUnico));
        return rows[0];
      }
      throw err;
    }
  },

  /** Actualiza una noticia existente */
  async update(id, { titulo, subtitulo, cuerpo, categoria_id, imagen_url, estado, destacada, tags, fuente, imagenes }) {
    // Recalcula slug solo si cambia el título
    let slugUpdate = '';
    const params = [];
    const sets = [];
    let idx = 1;

    if (titulo !== undefined) {
      sets.push(`titulo = $${idx++}`);
      params.push(titulo);
      const newSlug = crearSlug(titulo);
      sets.push(`slug = $${idx++}`);
      params.push(newSlug);
    }
    if (subtitulo !== undefined)  { sets.push(`subtitulo = $${idx++}`);   params.push(subtitulo); }
    if (cuerpo !== undefined)     { sets.push(`cuerpo = $${idx++}`);      params.push(cuerpo); }
    if (categoria_id !== undefined){ sets.push(`categoria_id = $${idx++}`); params.push(categoria_id); }
    if (imagen_url !== undefined) { sets.push(`imagen_url = $${idx++}`);  params.push(imagen_url); }
    if (destacada !== undefined)  { sets.push(`destacada = $${idx++}`);   params.push(destacada); }
    if (tags !== undefined)       { sets.push(`tags = $${idx++}`);        params.push(tags); }
    if (fuente !== undefined)     { sets.push(`fuente = $${idx++}`);      params.push(fuente); }
    if (imagenes !== undefined)  { sets.push(`imagenes = $${idx++}`);    params.push(imagenes); }

    if (estado !== undefined) {
      sets.push(`estado = $${idx++}`);
      params.push(estado);
      if (estado === 'publicado') {
        sets.push(`fecha_publicacion = COALESCE(fecha_publicacion, NOW())`);
      }
    }

    if (!sets.length) throw new Error('No hay campos para actualizar');

    sets.push(`updated_at = NOW()`);
    params.push(id);

    const { rows } = await pool.query(
      `UPDATE noticias SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return rows[0] || null;
  },

  /** Elimina una noticia */
  async delete(id) {
    const { rows } = await pool.query(
      'DELETE FROM noticias WHERE id = $1 RETURNING id',
      [id]
    );
    return rows[0] || null;
  },

  /** Noticia por ID numérico (para admin) */
  async getById(id) {
    const { rows } = await pool.query(
      `SELECT
         n.id::text, n.titulo, n.slug,
         n.subtitulo AS resumen, n.subtitulo,
         n.cuerpo    AS contenido, n.cuerpo,
         n.imagen_url, n.imagenes, n.estado,
         (n.estado = 'publicado') AS publicado,
         n.destacada AS destacado, n.destacada,
         n.tags, n.fuente, n.vistas,
         n.fecha_publicacion, n.updated_at AS "createdAt",
         n.categoria_id,
         n.autor_id,
         c.slug    AS categoria,
         c.slug    AS categoria_slug,
         c.nombre  AS categoria_nombre,
         c.color   AS categoria_color,
         u.nombre  AS autor_nombre
       FROM noticias n
       LEFT JOIN categorias c ON c.id = n.categoria_id
       LEFT JOIN usuarios   u ON u.id = n.autor_id
       WHERE n.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  /** Una sola query que trae hasta 4 noticias de cada categoría para la portada */
  async getPortada() {
    const CATS = ['cusco','politica','nacional','economia','deportes','internacional','tecnologia','entretenimiento'];

    const { rows } = await pool.query(
      `SELECT * FROM (
        SELECT
          n.id::text, n.titulo, n.slug,
          n.subtitulo AS resumen,
          n.imagen_url,
          n.estado, (n.estado = 'publicado') AS publicado,
          n.destacada AS destacado,
          n.tags, n.fuente, n.vistas,
          n.fecha_publicacion, n.updated_at AS "createdAt",
          c.slug   AS categoria,
          c.slug   AS categoria_slug,
          c.nombre AS categoria_nombre,
          c.color  AS categoria_color,
          u.nombre AS autor_nombre,
          ROW_NUMBER() OVER (
            PARTITION BY c.slug
            ORDER BY n.fecha_publicacion DESC
          ) AS rn
        FROM noticias n
        LEFT JOIN categorias c ON c.id = n.categoria_id
        LEFT JOIN usuarios   u ON u.id = n.autor_id
        WHERE n.estado = 'publicado'
          AND c.slug = ANY($1)
      ) ranked
      WHERE rn <= 4
      ORDER BY categoria, fecha_publicacion DESC`,
      [CATS]
    );

    // Inicializar todas las categorías con []
    const portada = Object.fromEntries(CATS.map(cat => [cat, []]));

    for (const row of rows) {
      const { rn, ...noticia } = row;
      if (portada[noticia.categoria]) {
        portada[noticia.categoria].push(noticia);
      }
    }

    // Destacada: busca la noticia más reciente con destacada=true (fijada por el editor)
    // Si no hay ninguna fijada, usa la noticia más reciente de todas las categorías
    const { rows: fijadas } = await pool.query(
      `SELECT
         n.id::text, n.titulo, n.slug, n.subtitulo AS resumen,
         n.imagen_url, n.estado, (n.estado = 'publicado') AS publicado,
         n.destacada AS destacado, n.tags, n.fuente, n.vistas,
         n.fecha_publicacion, n.updated_at AS "createdAt",
         c.slug AS categoria, c.slug AS categoria_slug,
         c.nombre AS categoria_nombre, c.color AS categoria_color,
         u.nombre AS autor_nombre
       FROM noticias n
       LEFT JOIN categorias c ON c.id = n.categoria_id
       LEFT JOIN usuarios   u ON u.id = n.autor_id
       WHERE n.estado = 'publicado' AND n.destacada = true
       ORDER BY n.fecha_publicacion DESC
       LIMIT 1`
    );

    if (fijadas.length > 0) {
      return { ...portada, destacada: fijadas[0] };
    }

    const masReciente = rows.slice().sort(
      (a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion)
    )[0];
    const destacada = masReciente ? (({ rn, ...n }) => n)(masReciente) : null;

    return { ...portada, destacada };
  },

  /** Suma +1 a las vistas */
  async sumarVista(id) {
    const { rows } = await pool.query(
      'UPDATE noticias SET vistas = vistas + 1 WHERE id = $1 RETURNING vistas',
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = Noticia;
