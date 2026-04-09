const { Pool } = require('pg');
require('dotenv').config();

// En produccion se activa SSL.
// Si el proveedor usa certificado propio (Railway, Render, Supabase) puedes
// pasar DB_SSL_CERT con el contenido del CA cert para verificacion completa.
// Si lo dejas sin DB_SSL_CERT se usa rejectUnauthorized:false — solo acceptable
// si confias en la red privada del proveedor (p.ej. Railway internal networking).
const sslConfig = (() => {
  if (process.env.NODE_ENV !== 'production') return false;
  if (process.env.DB_SSL_CERT) return { ca: process.env.DB_SSL_CERT };
  return { rejectUnauthorized: false }; // fallback documentado
})();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en cliente PostgreSQL:', err.message);
});

module.exports = pool;
