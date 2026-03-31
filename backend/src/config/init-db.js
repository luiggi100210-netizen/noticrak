const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// ── Usuarios iniciales ────────────────────────────────────────────────────────
const USUARIOS_SEED = [
  { nombre: 'Admin NotiCrack', email: 'admin@noticrack.pe', password: 'Admin2024!', rol: 'admin' },
  { nombre: 'Marco Quispe',    email: 'marco@noticrack.pe', password: 'Marco2024!', rol: 'periodista' },
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
    console.log('  Credenciales de acceso:');
    console.log('  ─────────────────────────────────────────');
    for (const u of USUARIOS_SEED) {
      console.log(`  ${u.rol.padEnd(12)} ${u.email}  /  ${u.password}`);
    }
    console.log('  ─────────────────────────────────────────');
    console.log('  ⚠ Cambia estas contraseñas en producción');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDB();
