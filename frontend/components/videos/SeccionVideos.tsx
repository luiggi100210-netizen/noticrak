import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Video } from '../../lib/api';

interface SeccionVideosProps {
  videos: Video[];
}

function PlayIcon() {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div className="w-12 h-12 bg-primary-600/90 rounded-full flex items-center justify-center shadow-lg">
        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
  );
}

export default function SeccionVideos({ videos }: SeccionVideosProps) {
  if (!videos.length) return null;

  const [principal, ...resto] = videos;

  return (
    <div>
      {/* Cabecera de sección */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-primary-600">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-primary-600 rounded-sm" />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
            Videos
          </h2>
        </div>
        <Link
          href="/videos"
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-wide"
        >
          Ver todos →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Video principal */}
        <Link href="/videos" className="group lg:col-span-2 block">
          <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video mb-3">
            {principal.imagen_url ? (
              <Image
                src={principal.imagen_url}
                alt={principal.titulo}
                fill
                className="object-cover opacity-90 group-hover:opacity-70 transition-opacity duration-300 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <span className="text-4xl">🎬</span>
              </div>
            )}
            {/* Degradado oscuro inferior */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <PlayIcon />

            {/* Duración */}
            {principal.duracion && (
              <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-mono px-2 py-0.5 rounded">
                {principal.duracion}
              </span>
            )}

            {/* Categoría encima */}
            {principal.categoria_nombre && (
              <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded">
                {principal.categoria_nombre}
              </span>
            )}
          </div>

          <h3
            className="font-heading text-xl font-bold leading-snug group-hover:text-primary-600 transition-colors line-clamp-2"
          >
            {principal.titulo}
          </h3>
          {principal.descripcion && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
              {principal.descripcion}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            {formatDistanceToNow(new Date(principal.created_at), { addSuffix: true, locale: es })}
            {' · '}{principal.vistas.toLocaleString()} vistas
          </p>
        </Link>

        {/* Lista de videos secundarios */}
        {resto.length > 0 && (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {resto.slice(0, 3).map(video => (
              <Link key={video.id} href="/videos" className="group flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="relative w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900">
                  {video.imagen_url ? (
                    <Image
                      src={video.imagen_url}
                      alt={video.titulo}
                      fill
                      className="object-cover opacity-90 group-hover:opacity-70 transition-opacity duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                      <span className="text-2xl">🎬</span>
                    </div>
                  )}
                  <PlayIcon />
                  {video.duracion && (
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs font-mono px-1 py-0.5 rounded">
                      {video.duracion}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  {video.categoria_nombre && (
                    <p className="text-xs font-bold uppercase tracking-wide text-primary-600 mb-0.5">
                      {video.categoria_nombre}
                    </p>
                  )}
                  <h4
                    className="font-heading text-sm font-semibold line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors"
                  >
                    {video.titulo}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(video.created_at), { addSuffix: true, locale: es })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
