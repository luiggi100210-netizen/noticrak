import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Noticia } from '../../lib/api';
import CategoryBadge from '../ui/CategoryBadge';

const CAT_COLORS: Record<string, string> = {
  cusco:           '#f59e0b',
  nacional:        '#2563eb',
  politica:        '#dc2626',
  economia:        '#16a34a',
  deportes:        '#f97316',
  tecnologia:      '#9333ea',
  internacional:   '#0284c7',
  entretenimiento: '#ec4899',
};

interface NoticiaCardProps {
  noticia: Noticia;
  variant?: 'hero' | 'featured' | 'stack' | 'list' | 'grid';
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
            <div
              className="w-full h-full flex items-start p-5"
              style={{ backgroundColor: CAT_COLORS[noticia.categoria] ?? '#334155' }}
            >
              <span className="font-heading text-white/60 text-5xl font-black uppercase tracking-widest leading-none">
                {noticia.categoria}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <CategoryBadge categoria={noticia.categoria} className="mb-2" />
            <h2
              className="font-heading text-white font-bold text-2xl lg:text-3xl leading-tight mb-2 group-hover:underline"
            >
              {noticia.titulo}
            </h2>
            {noticia.resumen && (
              <p className="text-slate-300 text-sm line-clamp-2">{noticia.resumen}</p>
            )}
            <div className="mt-3 text-xs space-y-0.5">
              {noticia.autor_nombre && (
                <p className="font-medium text-slate-200 truncate">
                  {noticia.autor_nombre}
                </p>
              )}
              <p className="text-slate-400">{tiempoRelativo}</p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/noticias/${noticia.slug}`} className="group block">
        <div className="relative h-52 lg:h-60 rounded-xl overflow-hidden">
          {noticia.imagen_url ? (
            <Image
              src={noticia.imagen_url}
              alt={noticia.titulo}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full flex items-start p-4"
              style={{ backgroundColor: CAT_COLORS[noticia.categoria] ?? '#334155' }}
            >
              <span className="font-heading text-white/50 text-4xl font-black uppercase tracking-widest leading-none">
                {noticia.categoria}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <CategoryBadge categoria={noticia.categoria} className="mb-1.5" />
            <h2
              className="font-heading text-white font-bold text-lg lg:text-xl leading-tight mb-1.5 group-hover:underline"
            >
              {noticia.titulo}
            </h2>
            <div className="text-xs space-y-0.5">
              {noticia.autor_nombre && (
                <p className="font-medium text-slate-200 truncate">
                  {noticia.autor_nombre}
                </p>
              )}
              <p className="text-slate-300">{tiempoRelativo}</p>
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
            className="font-heading font-semibold text-sm leading-snug line-clamp-3 group-hover:text-primary-600 transition-colors"
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
            className="font-heading font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors"
          >
            {noticia.titulo}
          </h3>
          <div className="mt-1 text-xs space-y-0.5">
            {noticia.autor_nombre && (
              <p className="font-medium text-slate-600 dark:text-slate-300 truncate">
                {noticia.autor_nombre}
              </p>
            )}
            <p className="text-slate-400 dark:text-slate-500">{tiempoRelativo}</p>
          </div>
        </div>
      </Link>
    );
  }

  // grid (default)
  return (
    <Link href={`/noticias/${noticia.slug}`} className="group block noticia-card-hover">
      {noticia.imagen_url ? (
        <div className="relative h-44 rounded-lg overflow-hidden mb-3">
          <Image
            src={noticia.imagen_url}
            alt={noticia.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div
          className="h-44 rounded-lg mb-3 flex items-end p-3"
          style={{ backgroundColor: CAT_COLORS[noticia.categoria] ?? '#334155' }}
        >
          <span className="font-heading text-white/30 text-5xl font-black uppercase leading-none">
            {noticia.categoria.slice(0, 3)}
          </span>
        </div>
      )}
      <CategoryBadge categoria={noticia.categoria} className="mb-2" />
      <h3
        className="font-heading font-semibold leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors mb-2"
      >
        {noticia.titulo}
      </h3>
      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
        {noticia.autor_nombre && (
          <p className="font-medium text-slate-600 dark:text-slate-300 truncate">
            {noticia.autor_nombre}
          </p>
        )}
        <p className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
          <span>{tiempoRelativo}</span>
          <span aria-hidden>•</span>
          <span>{(noticia.vistas ?? 0).toLocaleString()} vistas</span>
        </p>
      </div>
    </Link>
  );
}
