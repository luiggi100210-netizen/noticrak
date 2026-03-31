const pool = require('../config/database');

const Radio = {
  /** Todos los programas activos ordenados por hora de inicio */
  async getProgramas() {
    const { rows } = await pool.query(
      `SELECT id, nombre, conductor, hora_inicio, hora_fin, dias, activo
       FROM radio_programas
       WHERE activo = true
       ORDER BY hora_inicio ASC`
    );
    return rows;
  },

  /**
   * Programa que está en emisión ahora mismo.
   * Compara la hora actual (Lima, UTC-5) con hora_inicio y hora_fin,
   * y verifica que el día de la semana esté en el array 'dias'.
   */
  async getProgramaActual() {
    // Días en español (mismo formato que se usa en los INSERT)
    const DIAS_ES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
    const horaActual = ahora.toTimeString().slice(0, 5); // "HH:MM"
    const diaActual = DIAS_ES[ahora.getDay()];

    const { rows } = await pool.query(
      `SELECT id, nombre, conductor, hora_inicio, hora_fin, dias
       FROM radio_programas
       WHERE activo = true
         AND $1::time >= hora_inicio
         AND $1::time <  hora_fin
         AND $2 = ANY(dias)
       LIMIT 1`,
      [horaActual, diaActual]
    );
    return rows[0] || null;
  },
};

module.exports = Radio;
