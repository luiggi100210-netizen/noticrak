export const dynamic = 'force-dynamic';

import { getVideosApi } from '../../lib/api';
import VideoPlayer from '../../components/videos/VideoPlayer';
import VideoGrid from '../../components/videos/VideoGrid';
import VideoShorts from '../../components/videos/VideoShorts';
import Divider from '../../components/ui/Divider';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Videos — NotiCrack',
  description: 'Últimos videos y transmisiones en vivo de NotiCrack',
};

export default async function VideosPage() {
  const resultado = await getVideosApi({ limite: 12 }).catch(() => ({
    videos: [],
    total: 0,
    pagina: 1,
    totalPaginas: 1,
  }));

  const { videos } = resultado;

  if (!videos.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <p className="text-5xl mb-4">🎬</p>
        <p className="text-xl font-semibold">No hay videos publicados aún</p>
        <Link href="/" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const [videoDestacado, ...restVideos] = videos;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
        <span>›</span>
        <span className="text-slate-600 dark:text-slate-300">Videos</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Player principal + info */}
        <div className="lg:col-span-2">
          <VideoPlayer video={videoDestacado} />

          {/* Info del video destacado */}
          <div className="mt-4">
            {videoDestacado.categoria_nombre && (
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-2">
                {videoDestacado.categoria_nombre}
              </p>
            )}
            <h1
              className="text-2xl font-bold mb-2 leading-snug"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {videoDestacado.titulo}
            </h1>

            {videoDestacado.descripcion && (
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                {videoDestacado.descripcion}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 pb-4 border-b border-slate-200 dark:border-slate-700">
              {videoDestacado.autor_nombre && (
                <span>Por <strong className="text-slate-600 dark:text-slate-300">{videoDestacado.autor_nombre}</strong></span>
              )}
              <span>
                {formatDistanceToNow(new Date(videoDestacado.created_at), { addSuffix: true, locale: es })}
              </span>
              <span>{videoDestacado.vistas.toLocaleString()} vistas</span>
              {videoDestacado.duracion && <span>Duración: {videoDestacado.duracion}</span>}
            </div>
          </div>
        </div>

        {/* Sidebar: 4 videos secundarios */}
        <aside>
          <Divider texto="Más videos" />
          <div className="space-y-4">
            {restVideos.slice(0, 4).map((video) => {
              const tiempo = formatDistanceToNow(new Date(video.created_at), {
                addSuffix: true,
                locale: es,
              });
              return (
                <Link
                  key={video.id}
                  href={`/videos?id=${video.id}`}
                  className="group flex gap-3"
                >
                  <div className="relative w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
                    {video.imagen_url && (
                      <img
                        src={video.imagen_url}
                        alt={video.titulo}
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      />
                    )}
                    {video.duracion && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs font-mono px-1 py-0.5 rounded">
                        {video.duracion}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <h4
                      className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors mb-1"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {video.titulo}
                    </h4>
                    <p className="text-xs text-slate-400">{tiempo}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Grilla de 4 videos */}
      {restVideos.length >= 4 && (
        <section className="mt-10">
          <Divider texto="Videos recientes" />
          <VideoGrid videos={restVideos.slice(4, 8)} />
        </section>
      )}

      {/* Clips rápidos */}
      {restVideos.length > 8 && (
        <section className="mt-10">
          <Divider texto="Clips rápidos" />
          <VideoShorts videos={restVideos.slice(8, 12)} />
        </section>
      )}
    </div>
  );
}
