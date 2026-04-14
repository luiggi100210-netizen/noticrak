import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Noticia } from '../../lib/api';
import CategoryBadge from '../ui/CategoryBadge';

interface SidebarCardProps {
  noticia: Noticia;
  numero?: number;
}

export default function SidebarCard({ noticia, numero }: SidebarCardProps) {
  const tiempo = formatDistanceToNow(new Date(noticia.fecha_publicacion), {
    addSuffix: true,
    locale: es,
  });

  return (
    <Link
      href={`/noticias/${noticia.slug}`}
      className="group flex gap-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
    >
      {/* Número o imagen */}
      {noticia.imagen_url ? (
        <div className="relative w-20 h-16 flex-shrink-0 rounded overflow-hidden">
          <Image
            src={noticia.imagen_url}
            alt={noticia.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : numero !== undefined ? (
        <span className="text-3xl font-black text-slate-200 dark:text-slate-700 w-8 flex-shrink-0 leading-none mt-1">
          {numero}
        </span>
      ) : (
        <div className="w-20 h-16 flex-shrink-0 rounded bg-slate-100 dark:bg-slate-800" />
      )}

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <CategoryBadge categoria={noticia.categoria} className="mb-1 text-[10px]" />
        <h4
          className="text-sm font-semibold leading-snug line-clamp-3 group-hover:text-primary-600 transition-colors"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {noticia.titulo}
        </h4>
        <p className="text-[11px] text-slate-400 mt-1">{tiempo}</p>
      </div>
    </Link>
  );
}
