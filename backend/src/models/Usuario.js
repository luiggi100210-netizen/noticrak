const pool = require('../config/database');

const Usuario = {
  /**
   * Busca un usuario por email.
   * INCLUYE el campo password (necesario para bcrypt.compare en login).
   * @returns {object|null}
   */
  async getByEmail(email) {
    const { rows } = await pool.query(
      `SELECT id, nombre, email, password, rol, activo, created_at
       FROM usuarios
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  },

  /**
   * Busca un usuario por ID.
   * NO incluye el campo password.
   * @returns {object|null}
   */
  async getById(id) {
    const { rows } = await pool.query(
      `SELECT id, nombre, email, rol, activo, created_at
       FROM usuarios
       WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Crea un usuario nuevo.
   * Recibe passwordHash (ya hasheado con bcrypt antes de llamar este método).
   * Devuelve el usuario sin password.
   * @param {{ nombre, email, passwordHash, rol }} data
   * @returns {object}
   */
  async create({ nombre, email, passwordHash, rol = 'periodista' }) {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol, activo, created_at`,
      [nombre.trim(), email.toLowerCase().trim(), passwordHash, rol]
    );
    return rows[0];
  },

  /**
   * Actualiza el hash de password de un usuario.
   * @param {number} id
   * @param {string} passwordHash  - Nuevo hash bcrypt
   */
  async updatePassword(id, passwordHash) {
    const { rows } = await pool.query(
      `UPDATE usuarios
       SET password = $1
       WHERE id = $2
       RETURNING id, nombre, email, rol`,
      [passwordHash, id]
    );
    return rows[0] || null;
  },

  /**
   * Lista todos los usuarios.
   * NO incluye passwords.
   * @returns {object[]}
   */
  async getAll() {
    const { rows } = await pool.query(
      `SELECT id, nombre, email, rol, activo, created_at
       FROM usuarios
       ORDER BY created_at ASC`
    );
    return rows;
  },

  /**
   * Actualiza campos de un usuario.
   * Solo actualiza los campos recibidos (patch parcial).
   * NO actualiza password (usar updatePassword).
   * Si se recibe email, valida unicidad contra otros usuarios.
   * @param {number} id
   * @param {{ nombre?, email?, rol?, activo? }} cambios
   * @returns {object|null}
   */
  async update(id, cambios) {
    const campos = [];
    const valores = [];
    let idx = 1;

    if (cambios.nombre !== undefined) {
      campos.push(`nombre = $${idx++}`);
      valores.push(String(cambios.nombre).trim());
    }
    if (cambios.email !== undefined) {
      campos.push(`email = $${idx++}`);
      valores.push(String(cambios.email).toLowerCase().trim());
    }
    if (cambios.rol !== undefined) {
      campos.push(`rol = $${idx++}`);
      valores.push(cambios.rol);
    }
    if (cambios.activo !== undefined) {
      campos.push(`activo = $${idx++}`);
      valores.push(!!cambios.activo);
    }

    if (campos.length === 0) return this.getById(id);

    valores.push(id);
    const { rows } = await pool.query(
      `UPDATE usuarios
       SET ${campos.join(', ')}
       WHERE id = $${idx}
       RETURNING id, nombre, email, rol, activo, created_at`,
      valores
    );
    return rows[0] || null;
  },

  /**
   * Cuenta cuántas noticias tiene asignadas un usuario como autor.
   * Útil antes de eliminar para advertir o bloquear.
   * @param {number} id
   * @returns {number}
   */
  async countNoticias(id) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM noticias
       WHERE autor_id = $1`,
      [id]
    );
    return rows[0]?.total ?? 0;
  },

  /**
   * Cuenta admins activos. Útil para prevenir que el último admin
   * se borre a sí mismo y deje el sistema sin acceso.
   * @returns {number}
   */
  async countAdminsActivos() {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM usuarios
       WHERE rol = 'admin' AND activo = true`
    );
    return rows[0]?.total ?? 0;
  },

  /**
   * Elimina un usuario por ID.
   * Las noticias con autor_id apuntando a este usuario quedan con
   * autor_id = NULL gracias al LEFT JOIN del SELECT.
   * @param {number} id
   * @returns {boolean} true si se borró alguna fila
   */
  async remove(id) {
    const { rowCount } = await pool.query(
      `DELETE FROM usuarios WHERE id = $1`,
      [id]
    );
    return rowCount > 0;
  },
};

module.exports = Usuario;
