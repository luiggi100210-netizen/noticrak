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
};

module.exports = Usuario;
