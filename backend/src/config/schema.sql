-- ============================================================
-- NotiCrack - Schema PostgreSQL
-- Portal de noticias Cusco, Perú
-- ============================================================

-- Extensión para timestamps automáticos
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  UNIQUE NOT NULL,
  password    VARCHAR(255)  NOT NULL,
  rol         VARCHAR(20)   NOT NULL DEFAULT 'periodista'
                            CHECK (rol IN ('periodista', 'admin')),
  activo      BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: categorias
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
  id      SERIAL PRIMARY KEY,
  nombre  VARCHAR(50)  NOT NULL,
  slug    VARCHAR(50)  UNIQUE NOT NULL,
  color   VARCHAR(20),
  activo  BOOLEAN      NOT NULL DEFAULT true
);

-- ============================================================
-- TABLA: noticias
-- ============================================================
CREATE TABLE IF NOT EXISTS noticias (
  id                 SERIAL PRIMARY KEY,
  titulo             VARCHAR(300)  NOT NULL,
  slug               VARCHAR(300)  UNIQUE NOT NULL,
  subtitulo          TEXT,
  cuerpo             TEXT          NOT NULL,
  categoria_id       INT           REFERENCES categorias(id) ON DELETE SET NULL,
  autor_id           INT           REFERENCES usuarios(id)   ON DELETE SET NULL,
  imagen_url         TEXT,
  estado             VARCHAR(20)   NOT NULL DEFAULT 'borrador'
                                   CHECK (estado IN ('borrador', 'publicado')),
  destacada          BOOLEAN       NOT NULL DEFAULT false,
  tags               TEXT[],
  fuente             VARCHAR(100),
  vistas             INT           NOT NULL DEFAULT 0,
  fecha_publicacion  TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_noticias_estado       ON noticias(estado);
CREATE INDEX IF NOT EXISTS idx_noticias_categoria    ON noticias(categoria_id);
CREATE INDEX IF NOT EXISTS idx_noticias_destacada    ON noticias(destacada);
CREATE INDEX IF NOT EXISTS idx_noticias_fecha        ON noticias(fecha_publicacion DESC);
CREATE INDEX IF NOT EXISTS idx_noticias_slug         ON noticias(slug);

-- ============================================================
-- TABLA: videos
-- ============================================================
CREATE TABLE IF NOT EXISTS videos (
  id           SERIAL PRIMARY KEY,
  titulo       VARCHAR(300)  NOT NULL,
  descripcion  TEXT,
  url          TEXT          NOT NULL,
  imagen_url   TEXT,
  duracion     VARCHAR(10),
  categoria_id INT           REFERENCES categorias(id) ON DELETE SET NULL,
  autor_id     INT           REFERENCES usuarios(id)   ON DELETE SET NULL,
  estado       VARCHAR(20)   NOT NULL DEFAULT 'publicado'
                             CHECK (estado IN ('borrador', 'publicado')),
  vistas       INT           NOT NULL DEFAULT 0,
  created_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_estado    ON videos(estado);
CREATE INDEX IF NOT EXISTS idx_videos_categoria ON videos(categoria_id);

-- ============================================================
-- TABLA: radio_config
-- ============================================================
CREATE TABLE IF NOT EXISTS radio_config (
  id          SERIAL PRIMARY KEY,
  activo      BOOLEAN NOT NULL DEFAULT false,
  stream_url  TEXT DEFAULT '',
  nombre      VARCHAR(100) DEFAULT 'NotiCrack Radio',
  descripcion VARCHAR(200) DEFAULT 'Noticias & Talk',
  updated_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO radio_config (activo, stream_url, nombre, descripcion)
VALUES (false, '', 'NotiCrack Radio', 'Noticias & Talk')
ON CONFLICT DO NOTHING;

-- TABLA: radio_programas
-- ============================================================
CREATE TABLE IF NOT EXISTS radio_programas (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100),
  conductor   VARCHAR(100),
  hora_inicio TIME,
  hora_fin    TIME,
  dias        TEXT[],
  activo      BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_noticias_updated_at
  BEFORE UPDATE ON noticias
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Usuarios: los passwords se hashean con bcrypt (salt 10) desde Node.js.
-- NO se insertan aquí en texto plano. El script init-db.js
-- hace el hash antes de ejecutar el INSERT correspondiente.

-- Categorías
INSERT INTO categorias (nombre, slug, color) VALUES
  ('Política',         'politica',        '#c0392b'),
  ('Economía',         'economia',        '#27ae60'),
  ('Deportes',         'deportes',        '#e67e22'),
  ('Tecnología',       'tecnologia',      '#2980b9'),
  ('Internacional',    'internacional',   '#8e44ad'),
  ('Entretenimiento',  'entretenimiento', '#e91e63'),
  ('Cusco y Regiones', 'cusco',           '#00897b'),
  ('Nacional',         'nacional',        '#f57c00')
ON CONFLICT (slug) DO NOTHING;

-- Noticias de ejemplo (Cusco — categoria_id = 7, autor_id = 1)
INSERT INTO noticias (titulo, slug, subtitulo, cuerpo, categoria_id, autor_id, estado, destacada, tags, fuente, fecha_publicacion) VALUES
(
  'Municipalidad del Cusco lanza plan de renovación del centro histórico',
  'municipalidad-cusco-plan-renovacion-centro-historico',
  'La iniciativa busca preservar el patrimonio arquitectónico inca y colonial de la ciudad imperial.',
  '<p>La Municipalidad Provincial del Cusco presentó este lunes un ambicioso plan de renovación urbana que abarca las principales calles del centro histórico declarado Patrimonio de la Humanidad por la UNESCO.</p>
<p>El proyecto contempla la restauración de fachadas coloniales, mejora del sistema de alcantarillado y la peatonalización de cuatro cuadras adicionales en el eje de la plaza de Armas.</p>
<p>El alcalde indicó que la inversión supera los 12 millones de soles y será ejecutada en tres etapas durante los próximos 18 meses, priorizando las calles Hatunrumiyoc, Loreto y Triunfo.</p>
<blockquote><em>"Cusco merece una ciudad que esté a la altura de su historia milenaria"</em>, afirmó el burgomaestre durante la presentación del plan.</blockquote>
<p>Los comerciantes del centro han sido informados con anticipación para coordinar el horario de atención durante las obras.</p>',
  7, 1, 'publicado', true,
  ARRAY['cusco', 'municipalidad', 'patrimonio', 'obras'],
  'Municipalidad del Cusco',
  NOW() - INTERVAL '2 hours'
),
(
  'Festival Inti Raymi 2024 batirá récord de visitantes según proyecciones',
  'festival-inti-raymi-2024-record-visitantes',
  'Más de 150 000 turistas nacionales y extranjeros se esperan para la festividad del Sol en junio.',
  '<p>La Dirección Regional de Comercio Exterior y Turismo del Cusco (Dircetur) proyecta que el Inti Raymi 2024 superará el récord histórico de visitantes, estimando la llegada de 150 000 turistas durante la semana de celebraciones.</p>
<p>La fiesta del Sol, que se celebra cada 24 de junio en la fortaleza de Sacsayhuamán, atrae anualmente a viajeros de todo el mundo que llegan para presenciar la representación del ritual inca en honor al dios Inti.</p>
<p>Este año la puesta en escena contará con más de 700 actores entre danzarines, músicos y personajes de la corte inca, y se ha ampliado el aforo en la explanada de Sacsayhuamán en un 20 % respecto al año anterior.</p>
<p>El sector hotelero del Cusco ya reporta más del 95 % de ocupación para las fechas del evento, por lo que las autoridades recomiendan reservar con anticipación.</p>',
  7, 2, 'publicado', false,
  ARRAY['inti raymi', 'turismo', 'cusco', 'festival'],
  'Dircetur Cusco',
  NOW() - INTERVAL '5 hours'
),
(
  'Nuevo hospital regional del Cusco iniciará construcción en el segundo trimestre',
  'nuevo-hospital-regional-cusco-construccion-segundo-trimestre',
  'La obra demandará una inversión de 320 millones de soles y tendrá capacidad para 400 camas.',
  '<p>El Gobierno Regional del Cusco confirmó que la construcción del nuevo hospital regional dará inicio en abril, luego de que el expediente técnico recibiera la aprobación definitiva del Ministerio de Salud.</p>
<p>El nosocomio, que se ubicará en el distrito de San Jerónimo, contará con 400 camas de hospitalización, 12 quirófanos, unidad de cuidados intensivos neonatales y un moderno centro de diagnóstico por imágenes.</p>
<p>La obra tiene un plazo de ejecución de 36 meses y será ejecutada por un consorcio que ganó la buena pro en diciembre pasado tras un proceso de licitación pública internacional.</p>
<p>El gobernador regional destacó que la infraestructura beneficiará directamente a más de un millón de habitantes de Cusco y las provincias altas de Espinar, Chumbivilcas y Canas.</p>',
  7, 1, 'publicado', false,
  ARRAY['salud', 'hospital', 'cusco', 'infraestructura'],
  'Gobierno Regional Cusco',
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (slug) DO NOTHING;

-- Programas de radio
INSERT INTO radio_programas (nombre, conductor, hora_inicio, hora_fin, dias, activo) VALUES
  ('La Rotativa del Sur',    'Marco Quispe', '08:00', '12:00',
   ARRAY['lunes','martes','miercoles','jueves','viernes'], true),
  ('Noticias del Mediodía',  'Ana Huanca',   '12:00', '14:00',
   ARRAY['lunes','martes','miercoles','jueves','viernes'], true)
ON CONFLICT DO NOTHING;
