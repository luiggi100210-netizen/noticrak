import { getNoticias, getVideos } from '../lib/api';
import RadioPlayer from '../components/RadioPlayer';
import NoticiaHero from '../components/noticias/NoticiaHero';
import SeccionNoticias from '../components/noticias/SeccionNoticias';
import NoticiaCard from '../components/noticias/NoticiaCard';
import GrillaVideos from '../components/noticias/GrillaVideos';
import Divider from '../components/ui/Divider';
import Link from 'next/link';

export default async function HomePage() {
  const [destacadas, cusco, nacional, internacional, economia, entretenimiento, tecnologia, recientes, videos] =
    await Promise.all([
      getNoticias({ destacado: true, limite: 5 }).catch(() => ({ noticias: [], total: 0, pagina: 1, totalPaginas: 1 })),
      getNoticias({ categoria: 'cusco', limite: 4 }).catch(() => ({ noticias: [], total: 0, pagina: 1, totalPaginas: 1 })),
      getNoticias({ categoria: 'nacional', limite: 2 }).catch(() => ({ noticias: [], total: 0, pagina: 1, totalPaginas: 1 })),
      getNoticias({ categoria: 'internacional', limite: 2 }).catch(() => ({ noticias: [], total: 0, pagina: 1, totalPaginas: 1 })),
      getNoticias({ categoria: 'economia', limite: 3 }).catch(() => ({ noticias: [], total: 0, pagina: 1, totalPaginas: 1 })),
      getNoticias({ categoria: 'entretenimiento', limite: 3 }).catch(() => ({ noticias: [], total: 0, pagina: 1, totalPaginas: 1 })),
      getNoticias({ categoria: 'tecnologia', limite: 3 }).catch(() => ({ noticias: [], total: 0, pagina: 1, totalPaginas: 1 })),
      getNoticias({ limite: 20 }).catch(() => ({ noticias: [], total: 0, pagina: 1, totalPaginas: 1 })),
      getVideos().catch(() => []),
    ]);

  // Lo más leído: top 5 por vistas del set de recientes
  const masLeidos = [...recientes.noticias]
    .sort((a, b) => b.vistas - a.vistas)
    .slice(0, 5);

  // Cusco y Regiones: combinar cusco + nacional
  const cuscoRegiones = [...cusco.noticias, ...nacional.noticias].slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* 1. Radio Player */}
      <RadioPlayer />

      {/* 2. Hero grid */}
      {destacadas.noticias.length > 0 && (
        <section>
          <NoticiaHero
            principal={destacadas.noticias[0]}
            secundarias={destacadas.noticias.slice(1)}
          />
        </section>
      )}

      {/* 3 + 4 + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: secciones */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cusco y Regiones */}
          {cuscoRegiones.length > 0 && (
            <SeccionNoticias
              titulo="Cusco y Regiones"
              noticias={cuscoRegiones}
              mostrarNumero={true}
            />
          )}

          {/* Internacional */}
          {internacional.noticias.length > 0 && (
            <SeccionNoticias
              titulo="Internacional"
              noticias={internacional.noticias}
              mostrarNumero={false}
            />
          )}
        </div>

        {/* Right: Sidebar */}
        <aside className="space-y-6">
          {/* Clima Cusco */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 text-white">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-80">
              Clima Cusco
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-5xl">⛅</span>
              <div>
                <p className="text-4xl font-bold">14°C</p>
                <p className="text-sm opacity-80">Parcialmente nublado</p>
              </div>
            </div>
          </div>

          {/* Tipo de cambio */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-slate-500 dark:text-slate-400">
              Tipo de Cambio
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">USD → PEN</span>
                <span className="font-bold text-green-600">S/ 3.71</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">EUR → PEN</span>
                <span className="font-bold text-green-600">S/ 4.03</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-2">
                <span className="text-slate-500">BTC</span>
                <span className="font-bold text-orange-500">$ 3,021</span>
              </div>
            </div>
          </div>

          {/* Lo más leído */}
          {masLeidos.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <Divider texto="Lo más leído" />
              <div>
                {masLeidos.map((noticia, idx) => (
                  <Link
                    key={noticia.id}
                    href={`/noticias/${noticia.slug}`}
                    className="group flex gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                  >
                    <span className="text-2xl font-bold text-slate-200 dark:text-slate-700 w-6 flex-shrink-0 leading-none">
                      {idx + 1}
                    </span>
                    <p
                      className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {noticia.titulo}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* 5. Grilla inferior 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {economia.noticias.length > 0 && (
          <div>
            <Divider texto="Economía" />
            <div className="space-y-5">
              {economia.noticias.map((n) => (
                <NoticiaCard key={n.id} noticia={n} variant="grid" />
              ))}
            </div>
          </div>
        )}

        {entretenimiento.noticias.length > 0 && (
          <div>
            <Divider texto="Entretenimiento" />
            <div className="space-y-5">
              {entretenimiento.noticias.map((n) => (
                <NoticiaCard key={n.id} noticia={n} variant="grid" />
              ))}
            </div>
          </div>
        )}

        {tecnologia.noticias.length > 0 && (
          <div>
            <Divider texto="Tecnología" />
            <div className="space-y-5">
              {tecnologia.noticias.map((n) => (
                <NoticiaCard key={n.id} noticia={n} variant="grid" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Videos */}
      {Array.isArray(videos) && videos.length > 0 && (
        <section>
          <Divider texto="Videos" />
          <GrillaVideos videos={videos} />
        </section>
      )}
    </div>
  );
}
