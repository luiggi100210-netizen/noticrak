import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Noticia } from '../../lib/api';
import CategoryBadge from '../ui/CategoryBadge';

interface NoticiaCardProps {
  noticia: Noticia;
  variant?: 'hero' | 'stack' | 'list' | 'grid';
  numero?: number;
}

export default function NoticiaCard({ noticia, variant = 'grid', numero }: NoticiaCardProps) {
  const tiempoRelativo = formatDistanceToNow(new Date(noticia.fecha_publicacion), {
    addSuffix: true,
    locale: es,
  });

  if (variant === 'hero') {
    return (
      <Link href={`/noticias/${noticia.slug}`} className="group block h-full">
        <div className="relative h-96 lg:h-[480px] rounded-xl overflow-hidden">
          {noticia.imagen_url ? (
            <Image
              src={noticia.imagen_url}
              alt={noticia.titulo}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
          ) : (
            <div className="w-full h-full bg-slate-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <CategoryBadge categoria={noticia.categoria} className="mb-2" />
            <h2
              className="text-white font-bold text-2xl lg:text-3xl leading-tight mb-2 group-hover:underline"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {noticia.titulo}
            </h2>
            {noticia.resumen && (
              <p className="text-slate-300 text-sm line-clamp-2">{noticia.resumen}</p>
            )}
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
              {noticia.autor_nombre && <span>{noticia.autor_nombre}</span>}
              <span>{tiempoRelativo}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'stack') {
    return (
      <Link href={`/noticias/${noticia.slug}`} className="group flex gap-3">
        {noticia.imagen_url && (
          <div className="relative w-24 h-20 flex-shrink-0 rounded overflow-hidden">
            <Image
              src={noticia.imagen_url}
              alt={noticia.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <CategoryBadge categoria={noticia.categoria} className="mb-1" />
          <h3
            className="font-semibold text-sm leading-snug line-clamp-3 group-hover:text-blue-600 transition-colors"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {noticia.titulo}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{tiempoRelativo}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'list') {
    return (
      <Link
        href={`/noticias/${noticia.slug}`}
        className="group flex gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
      >
        {numero !== undefined && (
          <span className="text-3xl font-bold text-slate-200 dark:text-slate-700 w-8 flex-shrink-0 leading-none">
            {numero}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <CategoryBadge categoria={noticia.categoria} className="mb-1" />
          <h3
            className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {noticia.titulo}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            {noticia.autor_nombre && <span>{noticia.autor_nombre}</span>}
            {noticia.autor_nombre && <span>·</span>}
            <span>{tiempoRelativo}</span>
          </div>
        </div>
      </Link>
    );
  }

  // grid (default)
  return (
    <Link href={`/noticias/${noticia.slug}`} className="group block">
      {noticia.imagen_url && (
        <div className="relative h-44 rounded-lg overflow-hidden mb-3">
          <Image
            src={noticia.imagen_url}
            alt={noticia.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CategoryBadge categoria={noticia.categoria} className="mb-2" />
      <h3
        className="font-semibold leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-2"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {noticia.titulo}
      </h3>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        {noticia.autor_nombre && <span>{noticia.autor_nombre}</span>}
        {noticia.autor_nombre && <span>·</span>}
        <span>{tiempoRelativo}</span>
        <span>·</span>
        <span>{noticia.vistas.toLocaleString()} vistas</span>
      </div>
    </Link>
  );
}
