export const dynamic = 'force-dynamic';

import { getPortada, getVideosApi, API_URL } from '../lib/api';
import RadioPlayer from '../components/radio/RadioPlayer';
import NoticiaHero from '../components/noticias/NoticiaHero';
import SeccionNoticias from '../components/noticias/SeccionNoticias';
import GrillaCategoria from '../components/noticias/GrillaCategoria';
import ClimaWidget from '../components/widgets/ClimaWidget';
import CambioWidget from '../components/widgets/CambioWidget';
import TendenciasWidget from '../components/widgets/TendenciasWidget';
import SeccionVideos from '../components/videos/SeccionVideos';

const PORTADA_VACIA = {
  cusco: [], politica: [], nacional: [], economia: [],
  deportes: [], internacional: [], tecnologia: [],
  entretenimiento: [], destacada: null,
};

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

  // Secundarias del hero: tomar de varias categorías, EXCLUYENDO la destacada.
  // NO se quitan de las secciones — cada sección mantiene su contenido completo.
  const destacadaId = portada.destacada?.id;
  const secundariasHero = [
    ...portada.cusco,
    ...portada.politica,
    ...portada.nacional,
  ].filter(n => n.id !== destacadaId).slice(0, 4);

  // Helper: un bloque solo se renderiza si alguna sección tiene contenido
  const bloque2 = portada.politica.length > 0 || portada.nacional.length > 0;
  const bloque3 = portada.economia.length > 0 || portada.deportes.length > 0 || portada.internacional.length > 0;
  const bloque4 = portada.tecnologia.length > 0 || portada.entretenimiento.length > 0;

  return (
    <main>
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
        <SeccionNoticias titulo="Cusco y Regiones" noticias={portada.cusco} />
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
            <SeccionNoticias titulo="Política" noticias={portada.politica} />
            <SeccionNoticias titulo="Nacional" noticias={portada.nacional} />
          </div>
        </div>
      )}

      {/* ── ECONOMÍA · DEPORTES · INTERNACIONAL (3 col) ── */}
      {bloque3 && (
        <div className="seccion-bloque">
          <div className="grid-3col">
            <GrillaCategoria titulo="Economía"      noticias={portada.economia.slice(0, 3)} />
            <GrillaCategoria titulo="Deportes"      noticias={portada.deportes.slice(0, 3)} />
            <GrillaCategoria titulo="Internacional" noticias={portada.internacional.slice(0, 3)} />
          </div>
        </div>
      )}

      {/* ── TECNOLOGÍA + ENTRETENIMIENTO (2 columnas) ─── */}
      {bloque4 && (
        <div className="seccion-bloque">
          <div className="grid-2col">
            <GrillaCategoria titulo="Tecnología"      noticias={portada.tecnologia.slice(0, 3)} />
            <GrillaCategoria titulo="Entretenimiento" noticias={portada.entretenimiento.slice(0, 3)} />
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
