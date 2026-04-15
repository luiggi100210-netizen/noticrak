export const dynamic = 'force-dynamic';

import { getPortada, getVideosApi, API_URL } from '../lib/api';
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

  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 pt-6">
        {portada.destacada ? (
          <NoticiaHero
            principal={portada.destacada}
            secundarias={[
              ...portada.cusco,
              ...portada.politica,
              ...portada.nacional,
            ].filter(n => n.id !== portada.destacada!.id).slice(0, 4)}
          />
        ) : (
          <div className="hero-placeholder">
            <p>Próximamente las últimas noticias de Cusco y el mundo</p>
          </div>
        )}
      </div>

      {radioData && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <RadioPlayer config={radioData} />
        </div>
      )}

      <div className="page-grid">
        <SeccionNoticias titulo="Cusco y Regiones" noticias={portada.cusco} />
        <aside className="sidebar">
          <ClimaWidget />
          <CambioWidget />
          <TendenciasWidget />
        </aside>
      </div>

      <div className="seccion-bloque">
        <div className="grid-2col">
          <SeccionNoticias titulo="Política"  noticias={portada.politica} />
          <SeccionNoticias titulo="Nacional"  noticias={portada.nacional} />
        </div>
      </div>

      <div className="seccion-bloque">
        <div className="grid-3col">
          <GrillaCategoria titulo="Economía"       noticias={portada.economia.slice(0, 3)} />
          <GrillaCategoria titulo="Deportes"       noticias={portada.deportes.slice(0, 3)} />
          <GrillaCategoria titulo="Internacional"  noticias={portada.internacional.slice(0, 3)} />
        </div>
      </div>

      <div className="seccion-bloque">
        <div className="grid-2col">
          <GrillaCategoria titulo="Tecnología"      noticias={portada.tecnologia.slice(0, 3)} />
          <GrillaCategoria titulo="Entretenimiento" noticias={portada.entretenimiento.slice(0, 3)} />
        </div>
      </div>

      {videos.length > 0 && (
        <div className="seccion-bloque">
          <SeccionVideos videos={videos} />
        </div>
      )}
    </main>
  );
}
