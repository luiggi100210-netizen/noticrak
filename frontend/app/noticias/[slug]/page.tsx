export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import sanitizeHtml from 'sanitize-html';
import { getNoticiaBySlug, getCategoriaColor, getCategoriaLabel, getNoticias } from '../../../lib/api';
import CategoryBadge from '../../../components/ui/CategoryBadge';
import VistaCounter from '../../../components/noticias/VistaCounter';
import SidebarCard from '../../../components/noticias/SidebarCard';
import Carrusel from '../../../components/noticias/Carrusel';
import type { Metadata } from 'next';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 's', 'b', 'i',
    'h2', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'li',
    'a', 'img', 'figure', 'figcaption',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
  },
  allowedSchemes: ['https', 'http'],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: 'noopener noreferrer' },
    }),
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { noticia } = await getNoticiaBySlug(slug);
    return {
      title: noticia.titulo,
      description: noticia.resumen || noticia.titulo,
      openGraph: {
        title: noticia.titulo,
        description: noticia.resumen,
        images: noticia.imagen_url ? [{ url: noticia.imagen_url, alt: noticia.titulo }] : [],
        type: 'article',
      },
    };
  } catch {
    return { title: 'Noticia no encontrada' };
  }
}

const getEmbedUrl = (url: string) => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return url;
};

export default async function NoticiaPage({ params }: PageProps) {
  const { slug } = await params;
  let data: Awaited<ReturnType<typeof getNoticiaBySlug>>;
  try {
    data = await getNoticiaBySlug(slug);
  } catch {
    notFound();
  }

  const { noticia, relacionadas } = data;

  // Noticias de la misma categoría para "Puedes interesar"
  const puedesInteresar = relacionadas.length > 0
    ? relacionadas.slice(0, 6)
    : await getNoticias({ categoria: noticia.categoria, limite: 6 })
        .then(r => r.noticias.filter(n => n.slug !== noticia.slug).slice(0, 6))
        .catch(() => []);

  // Notas recomendadas: noticias recientes de otras categorías
  const notasRecomendadas = await getNoticias({ limite: 5 })
    .then(r => r.noticias.filter(n => n.slug !== noticia.slug).slice(0, 5))
    .catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <VistaCounter noticiaId={noticia.id} />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-400 mb-4 flex items-center gap-1">
        <Link href="/" className="hover:text-primary-600 transition-colors">Inicio</Link>
        <span>›</span>
        <Link href={`/seccion/${noticia.categoria}`} className="hover:text-primary-600 transition-colors capitalize">
          {getCategoriaLabel(noticia.categoria)}
        </Link>
      </nav>

      <div className="flex gap-8">

        {/* ── ARTÍCULO PRINCIPAL ─────────────────────────────── */}
        <article className="flex-1 min-w-0">

          <CategoryBadge categoria={noticia.categoria} className="mb-3" />

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4 text-slate-900 dark:text-white" style={{ fontFamily: 'Georgia, serif' }}>
            {noticia.titulo}
          </h1>

          {noticia.resumen && (
            <p className="text-xl text-slate-600 dark:text-slate-300 border-l-4 border-primary-600 pl-4 mb-5 leading-relaxed font-light" style={{ fontFamily: 'Georgia, serif' }}>
              {noticia.resumen}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-5 pb-5 border-b border-slate-200 dark:border-slate-700">
            {noticia.autor_nombre && (
              <span>Por <strong className="text-slate-700 dark:text-slate-300">{noticia.autor_nombre}</strong></span>
            )}
            {noticia.fecha_publicacion && (
              <time dateTime={noticia.fecha_publicacion}>
                {format(new Date(noticia.fecha_publicacion), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
              </time>
            )}
            <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full text-white ${getCategoriaColor(noticia.categoria)}`}>
              {getCategoriaLabel(noticia.categoria)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {noticia.vistas.toLocaleString()}
            </span>
          </div>

          {/* Imagen principal o carrusel */}
          {(noticia.imagen_url || (noticia.imagenes && noticia.imagenes.length > 0)) && (
            <Carrusel
              imagenes={noticia.imagenes || []}
              titulo={noticia.titulo}
              imagenPrincipal={noticia.imagen_url}
            />
          )}

          {/* Video embed */}
          {noticia.video_url && (
            <div className="aspect-video rounded-lg overflow-hidden mb-6">
              <iframe
                src={getEmbedUrl(noticia.video_url)}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title={noticia.titulo}
              />
            </div>
          )}

          {/* Cuerpo del artículo */}
          <div
            className="articulo-cuerpo"
            style={{ fontFamily: 'Georgia, serif' }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(noticia.contenido || '', SANITIZE_OPTIONS) }}
          />

          {/* Tags */}
          {noticia.tags && noticia.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-5 border-t border-slate-200 dark:border-slate-700">
              {noticia.tags.map(tag => (
                <span key={tag} className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm text-slate-600 dark:text-slate-300">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* ── SIDEBAR ────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-6 w-72 xl:w-80 flex-shrink-0">
          <div className="sticky top-20 flex flex-col gap-6">

            {/* Puedes interesar */}
            {puedesInteresar.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-primary-600">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                    Puedes interesar
                  </span>
                </div>
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                  {puedesInteresar.map((n, i) => (
                    <SidebarCard key={n.id} noticia={n} numero={i + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* Notas recomendadas */}
            {notasRecomendadas.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-slate-800 dark:border-slate-400">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100">
                    Notas Recomendadas
                  </span>
                </div>
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                  {notasRecomendadas.map(n => (
                    <SidebarCard key={n.id} noticia={n} />
                  ))}
                </div>
              </div>
            )}

          </div>
        </aside>

      </div>
    </div>
  );
}
