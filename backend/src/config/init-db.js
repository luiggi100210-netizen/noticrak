const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// ── Usuarios iniciales ────────────────────────────────────────────────────────
// Las contraseñas se leen desde variables de entorno.
// Define SEED_ADMIN_PASSWORD y SEED_PERIODISTA_PASSWORD en .env antes de correr.
const SEED_ADMIN_PASSWORD     = process.env.SEED_ADMIN_PASSWORD;
const SEED_PERIODISTA_PASSWORD = process.env.SEED_PERIODISTA_PASSWORD;

if (!SEED_ADMIN_PASSWORD || !SEED_PERIODISTA_PASSWORD) {
  console.error('❌ SEED_ADMIN_PASSWORD y SEED_PERIODISTA_PASSWORD deben estar definidas en .env');
  process.exit(1);
}

const USUARIOS_SEED = [
  { nombre: 'Admin NotiCrack', email: 'admin@noticrack.pe', password: SEED_ADMIN_PASSWORD,     rol: 'admin' },
  { nombre: 'Marco Quispe',    email: 'marco@noticrack.pe', password: SEED_PERIODISTA_PASSWORD, rol: 'periodista' },
];

async function initDB() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // 1. Separar el schema en DDL (CREATE TABLE) y seeds (INSERT)
    const schemaCompleto = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const separador = '-- DATOS INICIALES';
    const [ddl, seeds] = schemaCompleto.split(separador);

    // 1a. Ejecutar solo el DDL (tablas e índices)
    await client.query(ddl);
    console.log('✅ Tablas creadas correctamente');

    // 2. Hashear e insertar usuarios con bcrypt (salt 10) ANTES que los seeds
    console.log('🔐 Hasheando passwords con bcrypt (salt 10)...');
    for (const u of USUARIOS_SEED) {
      const hash = await bcrypt.hash(u.password, 10);
      await client.query(
        `INSERT INTO usuarios (nombre, email, password, rol)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [u.nombre, u.email.toLowerCase(), hash, u.rol]
      );
      console.log(`   ✔ ${u.email} (${u.rol}) — hash generado`);
    }

    // 3. Ejecutar seeds (categorias, noticias, radio) ahora que los usuarios existen
    if (seeds) await client.query(seeds);

    console.log('✅ Datos iniciales insertados');
    console.log('🎉 Base de datos NotiCrack lista');
    console.log('');
    console.log('  Usuarios creados:');
    console.log('  ─────────────────────────────────────────');
    for (const u of USUARIOS_SEED) {
      console.log(`  ${u.rol.padEnd(12)} ${u.email}`);
    }
    console.log('  ─────────────────────────────────────────');
    console.log('  ⚠ Usa las contraseñas definidas en tus variables de entorno');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDB();
