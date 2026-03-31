import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Noticia, getCategoriaColor, getCategoriaLabel } from '../lib/api';

interface NoticiaCardProps {
  noticia: Noticia;
  size?: 'sm' | 'md' | 'lg';
}

export default function NoticiaCard({ noticia, size = 'md' }: NoticiaCardProps) {
  const timeAgo = noticia.fecha_publicacion
    ? formatDistanceToNow(new Date(noticia.fecha_publicacion), { addSuffix: true, locale: es })
    : '';

  if (size === 'lg') {
    return (
      <article className="noticia-card group">
        <Link href={`/noticias/${noticia.slug}`}>
          <div className="relative h-64 sm:h-80 overflow-hidden">
            {noticia.imagen_url ? (
              <Image
                src={noticia.imagen_url}
                alt={noticia.titulo}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <span className="text-slate-400 text-6xl">📰</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className={`categoria-badge ${getCategoriaColor(noticia.categoria)} mb-2`}>
                {getCategoriaLabel(noticia.categoria)}
              </span>
              <h2 className="text-white text-xl font-bold line-clamp-2 mt-1">{noticia.titulo}</h2>
              <p className="text-slate-300 text-sm mt-1">{timeAgo}</p>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (size === 'sm') {
    return (
      <article className="flex gap-3 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
        {noticia.imagen_url && (
          <Link href={`/noticias/${noticia.slug}`} className="flex-shrink-0">
            <div className="relative w-20 h-16 rounded-lg overflow-hidden">
              <Image src={noticia.imagen_url} alt={noticia.titulo} fill className="object-cover" />
            </div>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <span className={`categoria-badge ${getCategoriaColor(noticia.categoria)} text-[10px] mb-1`}>
            {getCategoriaLabel(noticia.categoria)}
          </span>
          <Link href={`/noticias/${noticia.slug}`}>
            <h3 className="text-sm font-semibold line-clamp-2 hover:text-primary-600 transition-colors">{noticia.titulo}</h3>
          </Link>
          <p className="text-xs text-slate-400 mt-1">{timeAgo}</p>
        </div>
      </article>
    );
  }

  // md (default)
  return (
    <article className="noticia-card group">
      <Link href={`/noticias/${noticia.slug}`}>
        <div className="relative h-48 overflow-hidden">
          {noticia.imagen_url ? (
            <Image
              src={noticia.imagen_url}
              alt={noticia.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
              <span className="text-4xl opacity-30">📰</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <span className={`categoria-badge ${getCategoriaColor(noticia.categoria)} mb-2`}>
            {getCategoriaLabel(noticia.categoria)}
          </span>
          <h3 className="font-bold text-base line-clamp-2 mt-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {noticia.titulo}
          </h3>
          {noticia.resumen && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{noticia.resumen}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400">{timeAgo}</span>
            {noticia.autor_nombre && (
              <span className="text-xs text-slate-400">Por {noticia.autor_nombre}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
