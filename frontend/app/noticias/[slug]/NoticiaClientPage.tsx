'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import sanitizeHtml from 'sanitize-html';
import { getNoticiaBySlug, getCategoriaColor, getCategoriaLabel, getNoticias, type Noticia } from '../../../lib/api';
import NoticiaCard from '../../../components/noticias/NoticiaCard';
import CategoryBadge from '../../../components/ui/CategoryBadge';
import VistaCounter from '../../../components/noticias/VistaCounter';
import Divider from '../../../components/ui/Divider';

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

const getEmbedUrl = (url: string) => {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return url;
};

export default function NoticiaClientPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [relacionadas, setRelacionadas] = useState<Noticia[]>([]);
  const [otrasDeCategoria, setOtrasDeCategoria] = useState<Noticia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [noEncontrada, setNoEncontrada] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const cargar = async () => {
      setCargando(true);
      setNoEncontrada(false);
      try {
        const data = await getNoticiaBySlug(slug);
        setNoticia(data.noticia);
        setRelacionadas(data.relacionadas);

        const masRes = await getNoticias({ categoria: data.noticia.categoria, limite: 4 })
          .catch(() => ({ noticias: [] as Noticia[] }));
        setOtrasDeCategoria(masRes.noticias.filter(n => n.slug !== slug).slice(0, 3));
      } catch {
        setNoEncontrada(true);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [slug]);

  if (cargando) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4" />
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8" />
        <div className="h-[420px] bg-slate-200 dark:bg-slate-700 rounded-xl mb-8" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (noEncontrada || !noticia) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Noticia no encontrada</h1>
        <p className="text-slate-400 mb-8">La noticia que buscas no existe o fue eliminada.</p>
        <Link href="/" className="btn-primary">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <VistaCounter noticiaId={noticia.id} />

      <div className="flex gap-10">
        <article className="flex-1 min-w-0">
          <nav className="text-sm text-slate-400 mb-4 flex items-center gap-1">
            <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
            <span>›</span>
            <Link href={`/seccion/${noticia.categoria}`} className="hover:text-blue-600 transition-colors">
              {getCategoriaLabel(noticia.categoria)}
            </Link>
          </nav>

          <CategoryBadge categoria={noticia.categoria} className="mb-4" />

          <h1 className="font-heading text-3xl sm:text-4xl font-bold leading-tight mb-4">
            {noticia.titulo}
          </h1>

          {noticia.resumen && (
            <p className="text-xl text-slate-500 dark:text-slate-400 font-light border-l-4 border-blue-500 pl-4 mb-6 leading-relaxed">
              {noticia.resumen}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            {noticia.autor_nombre && (
              <span>Por <strong className="text-slate-700 dark:text-slate-300">{noticia.autor_nombre}</strong></span>
            )}
            {noticia.fecha_publicacion && (
              <time dateTime={noticia.fecha_publicacion}>
                {format(new Date(noticia.fecha_publicacion), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
              </time>
            )}
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-white ${getCategoriaColor(noticia.categoria)}`}>
              {getCategoriaLabel(noticia.categoria)}
            </span>
            <span>{noticia.vistas.toLocaleString()} vistas</span>
          </div>

          {noticia.imagen_url && (
            <div className="relative h-72 sm:h-[420px] rounded-xl overflow-hidden mb-6">
              <Image src={noticia.imagen_url} alt={noticia.titulo} fill className="object-cover" priority />
            </div>
          )}

          {noticia.video_url && (
            <div className="aspect-video rounded-xl overflow-hidden mb-6">
              <iframe
                src={getEmbedUrl(noticia.video_url)}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
                title={noticia.titulo}
              />
            </div>
          )}

          <div
            className="font-heading prose prose-slate dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:font-serif
              prose-p:text-base prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-blockquote:border-l-blue-500"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(noticia.contenido || '', SANITIZE_OPTIONS) }}
          />

          {noticia.tags && noticia.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              {noticia.tags.map(tag => (
                <span key={tag} className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm text-slate-600 dark:text-slate-300">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {otrasDeCategoria.length > 0 && (
            <section className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-700">
              <Divider texto={`Más noticias de ${getCategoriaLabel(noticia.categoria)}`} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {otrasDeCategoria.map(n => (
                  <NoticiaCard key={n.id} noticia={n} variant="grid" />
                ))}
              </div>
            </section>
          )}
        </article>

        {relacionadas.length > 0 && (
          <aside className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <Divider texto="Noticias relacionadas" />
              <div className="space-y-4">
                {relacionadas.slice(0, 5).map(n => (
                  <NoticiaCard key={n.id} noticia={n} variant="stack" />
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
