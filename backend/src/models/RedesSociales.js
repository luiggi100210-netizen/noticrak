const pool = require('../config/database');

async function getAll() {
  const { rows } = await pool.query(
    'SELECT * FROM redes_sociales ORDER BY orden ASC'
  );
  return rows;
}

async function getActivas() {
  const { rows } = await pool.query(
    "SELECT red, url FROM redes_sociales WHERE activo = true AND url != '' ORDER BY orden ASC"
  );
  return rows;
}

async function update(id, { url, activo }) {
  const { rows } = await pool.query(
    'UPDATE redes_sociales SET url = $1, activo = $2 WHERE id = $3 RETURNING *',
    [url, activo, id]
  );
  return rows[0];
}

module.exports = { getAll, getActivas, update };
