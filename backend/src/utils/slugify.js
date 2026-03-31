/**
 * Convierte un texto en slug URL-amigable.
 * Maneja tildes, ñ y caracteres especiales del español.
 * "Debate Presidencial 2026" → "debate-presidencial-2026"
 */
const MAPA_TILDES = {
  á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u',
  Á: 'a', É: 'e', Í: 'i', Ó: 'o', Ú: 'u',
  ä: 'a', ë: 'e', ï: 'i', ö: 'o', ü: 'u',
  Ä: 'a', Ë: 'e', Ï: 'i', Ö: 'o', Ü: 'u',
  à: 'a', è: 'e', ì: 'i', ò: 'o', ù: 'u',
  â: 'a', ê: 'e', î: 'i', ô: 'o', û: 'u',
  ñ: 'n', Ñ: 'n',
  ç: 'c', Ç: 'c',
  ý: 'y', ÿ: 'y',
};

function crearSlug(texto) {
  return texto
    .toString()
    .replace(/[áéíóúÁÉÍÓÚäëïöüÄËÏÖÜàèìòùâêîôûñÑçÇýÿ]/g, c => MAPA_TILDES[c] || c)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // elimina caracteres no permitidos
    .replace(/[\s_]+/g, '-')         // espacios y guiones bajos → guión
    .replace(/-{2,}/g, '-')          // guiones dobles → uno solo
    .replace(/^-+|-+$/g, '');        // limpia guiones al inicio/fin
}

module.exports = crearSlug;
