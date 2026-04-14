const { Client } = require('pg');

const DB = 'postgresql://neondb_owner:npg_RMCi9YLnjF2u@ep-little-forest-aea3nen8.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require';

const NOTICIAS = [
  {
    titulo: 'Municipalidad del Cusco anuncia renovación total del centro histórico para el 2026',
    slug: 'municipalidad-cusco-renovacion-centro-historico-2026',
    resumen: 'La alcaldía presentó un ambicioso plan de restauración de las calles y fachadas del centro histórico de la ciudad imperial, con una inversión de 45 millones de soles.',
    contenido: '<p>La Municipalidad Provincial del Cusco presentó este miércoles el Plan Integral de Renovación del Centro Histórico 2026, un ambicioso proyecto que contempla la restauración de calles, plazas y fachadas coloniales en el corazón de la ciudad imperial.</p><p>El alcalde anunció una inversión de 45 millones de soles que serán ejecutados en tres etapas a lo largo del año. La primera etapa abarcará la Plaza de Armas y las calles aledañas, seguida de la zona de San Blas y finalmente el barrio de San Pedro.</p><p>"Cusco merece un centro histórico que esté a la altura de su historia y de la cantidad de turistas que nos visitan cada año", declaró la autoridad municipal ante centenares de vecinos y empresarios del sector turismo.</p>',
    categoria: 'cusco',
    imagen_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80',
    autor_id: 1,
    destacada: true,
    estado: 'publicado',
  },
  {
    titulo: 'Festival Inti Raymi 2026 promete ser el más grande de la última década',
    slug: 'festival-inti-raymi-2026-mas-grande-decada',
    resumen: 'Más de 3,000 artistas y danzantes participarán en la celebración del Inti Raymi este 24 de junio en la fortaleza de Sacsayhuamán.',
    contenido: '<p>El Ministerio de Cultura confirmó que el Festival del Sol 2026 contará con la participación de más de 3,000 artistas y danzantes de todo el país, convirtiéndose en la edición más grande de los últimos diez años.</p><p>La celebración incluirá representaciones de las cuatro regiones del Tawantinsuyo y contará con transmisión en vivo por canales nacionales e internacionales.</p>',
    categoria: 'cusco',
    imagen_url: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&q=80',
    autor_id: 1,
    destacada: false,
    estado: 'publicado',
  },
  {
    titulo: 'Nuevo hospital regional del Cusco iniciará operaciones en agosto de 2026',
    slug: 'nuevo-hospital-regional-cusco-agosto-2026',
    resumen: 'El moderno establecimiento de salud contará con 450 camas y equipamiento de última generación para atender a más de 1.2 millones de cusqueños.',
    contenido: '<p>El Gobierno Regional del Cusco anunció que el nuevo Hospital Regional Antonio Lorena, con una inversión de 800 millones de soles, iniciará operaciones en agosto de 2026 tras años de construcción.</p><p>El nosocomio contará con 450 camas, unidades de cuidados intensivos, cirugías especializadas y la más moderna tecnología médica disponible en el país.</p>',
    categoria: 'cusco',
    imagen_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
    autor_id: 1,
    destacada: false,
    estado: 'publicado',
  },
  {
    titulo: 'Congreso aprueba proyecto de ley para fortalecer la educación intercultural bilingüe',
    slug: 'congreso-aprueba-ley-educacion-intercultural-bilingue',
    resumen: 'La norma beneficiará a más de 500 mil estudiantes de comunidades quechua, aymara y amazónicas en todo el país.',
    contenido: '<p>El Pleno del Congreso de la República aprobó por amplia mayoría el proyecto de ley que fortalece la educación intercultural bilingüe en el país, destinando un presupuesto adicional de 1,200 millones de soles para el sector.</p><p>La norma contempla la formación y contratación de nuevos docentes especializados en lenguas originarias, así como la producción de material educativo en quechua, aymara y las principales lenguas amazónicas.</p>',
    categoria: 'nacional',
    imagen_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    autor_id: 1,
    destacada: false,
    estado: 'publicado',
  },
  {
    titulo: 'Gobierno anuncia plan de inversión en infraestructura vial por S/ 12,000 millones',
    slug: 'gobierno-plan-inversion-infraestructura-vial-12000-millones',
    resumen: 'El paquete de obras incluye carreteras, puentes y túneles en las regiones más alejadas del país, con prioridad en la sierra y selva.',
    contenido: '<p>El Ejecutivo presentó el Plan Nacional de Infraestructura Vial 2026-2030, un paquete de inversiones por 12,000 millones de soles para la construcción y mejoramiento de carreteras en todo el territorio nacional.</p><p>Cusco, Puno, Apurímac y Loreto serán las regiones con mayor número de proyectos, buscando conectar comunidades que actualmente permanecen aisladas durante los meses de lluvia.</p>',
    categoria: 'nacional',
    imagen_url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80',
    autor_id: 1,
    destacada: false,
    estado: 'publicado',
  },
  {
    titulo: 'Selección peruana de fútbol cierra concentración antes del clasificatorio',
    slug: 'seleccion-peruana-futbol-concentracion-clasificatorio',
    resumen: 'La Blanquirroja realizó su último entrenamiento antes del crucial partido de clasificatorio que se jugará el próximo viernes en el Estadio Nacional.',
    contenido: '<p>La selección peruana de fútbol cerró su concentración en la Videna con una práctica intensa donde el entrenador definió la once titular para el partido clasificatorio del viernes.</p><p>El equipo llega con bajas importantes en el mediocampo, aunque la delantera muestra su mejor nivel de los últimos años. Los hinchas ya colmaron las entradas disponibles para el encuentro.</p>',
    categoria: 'deportes',
    imagen_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    autor_id: 1,
    destacada: false,
    estado: 'publicado',
  },
  {
    titulo: 'Economía peruana crece 3.8% en el primer trimestre del año',
    slug: 'economia-peruana-crece-primer-trimestre-2026',
    resumen: 'El INEI reporta que el crecimiento económico es impulsado principalmente por el sector minero, agropecuario y la recuperación del turismo receptivo.',
    contenido: '<p>El Instituto Nacional de Estadística e Informática (INEI) reveló que la economía peruana registró un crecimiento del 3.8% en el primer trimestre del año, superando las expectativas de los analistas que proyectaban un 3.2%.</p><p>Los sectores que más aportaron al crecimiento fueron la minería metálica con 6.2%, el sector agropecuario con 4.1% y los servicios turísticos con un notable 8.5%, recuperándose de la caída post-pandemia.</p>',
    categoria: 'economia',
    imagen_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    autor_id: 1,
    destacada: false,
    estado: 'publicado',
  },
  {
    titulo: 'Cusco lanza primera red de internet gratuito en zonas rurales de la región',
    slug: 'cusco-lanza-red-internet-gratuito-zonas-rurales',
    resumen: 'El proyecto conectará a más de 200 comunidades campesinas con acceso a internet de alta velocidad financiado por el Gobierno Regional.',
    contenido: '<p>El Gobierno Regional del Cusco puso en marcha el programa "Cusco Conectado", que llevará internet gratuito de alta velocidad a más de 200 comunidades rurales de la región durante el 2026.</p><p>El proyecto, financiado con 45 millones de soles del canon minero, utilizará tecnología de fibra óptica y antenas satelitales para superar las barreras geográficas de la zona andina.</p>',
    categoria: 'tecnologia',
    imagen_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    autor_id: 1,
    destacada: false,
    estado: 'publicado',
  },
];

async function seed() {
  const client = new Client({ connectionString: DB });
  await client.connect();

  for (const n of NOTICIAS) {
    await client.query(
      `INSERT INTO noticias (titulo, slug, resumen, contenido, categoria, imagen_url, autor_id, destacada, estado, fecha_publicacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
       ON CONFLICT (slug) DO NOTHING`,
      [n.titulo, n.slug, n.resumen, n.contenido, n.categoria, n.imagen_url, n.autor_id, n.destacada, n.estado]
    );
    console.log(`✔ ${n.categoria} — ${n.titulo.slice(0, 50)}...`);
  }

  const { rows } = await client.query('SELECT COUNT(*) FROM noticias');
  console.log(`\n✅ Total noticias en BD: ${rows[0].count}`);
  await client.end();
}

seed().catch(e => { console.error(e.message); process.exit(1); });
