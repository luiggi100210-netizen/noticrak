export const dynamic = 'force-dynamic';

import { getPortada, getVideosApi, API_URL, type Noticia } from '../lib/api';
import RadioPlayer from '../components/radio/RadioPlayer';
import NoticiaHero from '../components/noticias/NoticiaHero';
import SeccionNoticias from '../components/noticias/SeccionNoticias';
import GrillaCategoria from '../components/noticias/GrillaCategoria';
import UltimaHoraBar from '../components/noticias/UltimaHoraBar';
import ClimaWidget from '../components/widgets/ClimaWidget';
import CambioWidget from '../components/widgets/CambioWidget';
import TendenciasWidget from '../components/widgets/TendenciasWidget';
import SeccionVideos from '../components/videos/SeccionVideos';

const PORTADA_VACIA = {
  cusco: [], politica: [], nacional: [], economia: [],
  deportes: [], internacional: [], tecnologia: [],
  entretenimiento: [], destacada: null,
};

// Filtra noticias cuyo id ya fue usado y marca los nuevos como usados
function dedupe(noticias: Noticia[], usados: Set<number>): Noticia[] {
  const out: Noticia[] = [];
  for (const n of noticias) {
    if (!usados.has(n.id)) {
      usados.add(n.id);
      out.push(n);
    }
  }
  return out;
}

export default async function HomePage() {
  const [portada, radioRes, videosRes] = await Promise.all([
    getPortada().catch(() => PORTADA_VACIA),
    fetch(`${API_URL}/radio/ahora`, { cache: 'no-store' })
      .then(r => r.json())
      .catch(() => ({ ok: true, data: null })),
    getVideosApi({ limite: 4 }).catch(() => ({ videos: [], total: 0, pagina: 1, totalPaginas: 1 })),
  ]);

  const radioData = radioRes?.data ?? null;
  const videos = videosRes.videos ?? [];

  // ── Dedupe: cada noticia aparece UNA SOLA VEZ en la home ──────────
  const usados = new Set<number>();

  // 1. Hero destacada
  if (portada.destacada) usados.add(portada.destacada.id);

  // 2. Secundarias del hero (4 primeras de cusco+politica+nacional sin la destacada)
  const secundariasHero = dedupe(
    [...portada.cusco, ...portada.politica, ...portada.nacional],
    usados
  ).slice(0, 4);
  secundariasHero.forEach(n => usados.add(n.id));

  // 3. Re-filtrar secciones quitando esos IDs
  const cusco         = dedupe(portada.cusco, usados);
  const politica      = dedupe(portada.politica, usados);
  const nacional      = dedupe(portada.nacional, usados);
  const economia      = dedupe(portada.economia, usados);
  const deportes      = dedupe(portada.deportes, usados);
  const internacional = dedupe(portada.internacional, usados);
  const tecnologia    = dedupe(portada.tecnologia, usados);
  const entretenim    = dedupe(portada.entretenimiento, usados);

  // Helper: un bloque solo se renderiza si alguna sección tiene contenido
  const bloque2 = politica.length > 0 || nacional.length > 0;
  const bloque3 = economia.length > 0 || deportes.length > 0 || internacional.length > 0;
  const bloque4 = tecnologia.length > 0 || entretenim.length > 0;

  return (
    <main>
      {/* ── ÚLTIMA HORA BAR ───────────────────────────── */}
      <UltimaHoraBar />

      {/* ── HERO ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        {portada.destacada ? (
          <NoticiaHero
            principal={portada.destacada}
            secundarias={secundariasHero}
          />
        ) : (
          <div className="hero-placeholder">
            <p>Próximamente las últimas noticias de Cusco y el mundo</p>
          </div>
        )}
      </div>

      {/* ── RADIO (si el admin la activó) ─────────────── */}
      {radioData && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <RadioPlayer config={radioData} />
        </div>
      )}

      {/* ── CUSCO + SIDEBAR ───────────────────────────── */}
      <div className="page-grid">
        {cusco.length > 0 ? (
          <SeccionNoticias titulo="Cusco y Regiones" noticias={cusco} />
        ) : (
          <div />
        )}
        <aside className="sidebar">
          <ClimaWidget />
          <CambioWidget />
          <TendenciasWidget />
        </aside>
      </div>

      {/* ── POLÍTICA + NACIONAL (2 columnas) ──────────── */}
      {bloque2 && (
        <div className="seccion-bloque">
          <div className="grid-2col">
            <SeccionNoticias titulo="Política" noticias={politica} />
            <SeccionNoticias titulo="Nacional" noticias={nacional} />
          </div>
        </div>
      )}

      {/* ── ECONOMÍA · DEPORTES · INTERNACIONAL (3 col) ── */}
      {bloque3 && (
        <div className="seccion-bloque">
          <div className="grid-3col">
            <GrillaCategoria titulo="Economía"      noticias={economia.slice(0, 3)} />
            <GrillaCategoria titulo="Deportes"      noticias={deportes.slice(0, 3)} />
            <GrillaCategoria titulo="Internacional" noticias={internacional.slice(0, 3)} />
          </div>
        </div>
      )}

      {/* ── TECNOLOGÍA + ENTRETENIMIENTO (2 columnas) ─── */}
      {bloque4 && (
        <div className="seccion-bloque">
          <div className="grid-2col">
            <GrillaCategoria titulo="Tecnología"      noticias={tecnologia.slice(0, 3)} />
            <GrillaCategoria titulo="Entretenimiento" noticias={entretenim.slice(0, 3)} />
          </div>
        </div>
      )}

      {/* ── VIDEOS ────────────────────────────────────── */}
      {videos.length > 0 && (
        <div className="seccion-bloque">
          <SeccionVideos videos={videos} />
        </div>
      )}
    </main>
  );
}
