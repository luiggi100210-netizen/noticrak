import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getNoticiaBySlug, getCategoriaColor, getCategoriaLabel, getNoticias } from '../../../lib/api';
import NoticiaCard from '../../../components/noticias/NoticiaCard';
import CategoryBadge from '../../../components/ui/CategoryBadge';
import VistaCounter from '../../../components/noticias/VistaCounter';
import Divider from '../../../components/ui/Divider';
import type { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { noticia } = await getNoticiaBySlug(params.slug);
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

export default async function NoticiaPage({ params }: PageProps) {
  let data;
  try {
    data = await getNoticiaBySlug(params.slug);
  } catch {
    notFound();
  }

  const { noticia, relacionadas } = data;

  // Más noticias de la misma categoría (3 cards)
  const masDeCategoria = await getNoticias({
    categoria: noticia.categoria,
    limite: 4,
  }).catch(() => ({ noticias: [] }));

  const otrasDeCategoria = masDeCategoria.noticias
    .filter((n) => n.slug !== noticia.slug)
    .slice(0, 3);

  const getEmbedUrl = (url: string) => {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return url;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Vista counter (client component silencioso) */}
      <VistaCounter noticiaId={noticia.id} />

      <div className="flex gap-10">
        {/* Artículo principal */}
        <article className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav className="text-sm text-slate-400 mb-4 flex items-center gap-1">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Inicio
            </Link>
            <span>›</span>
            <Link
              href={`/seccion/${noticia.categoria}`}
              className="hover:text-blue-600 transition-colors"
            >
              {getCategoriaLabel(noticia.categoria)}
            </Link>
          </nav>

          {/* Categoría badge */}
          <CategoryBadge categoria={noticia.categoria} className="mb-4" />

          {/* Titular */}
          <h1
            className="text-3xl sm:text-4xl font-bold leading-tight mb-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {noticia.titulo}
          </h1>

          {/* Subtítulo / resumen */}
          {noticia.resumen && (
            <p className="text-xl text-slate-500 dark:text-slate-400 font-light border-l-4 border-blue-500 pl-4 mb-6 leading-relaxed">
              {noticia.resumen}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            {noticia.autor_nombre && (
              <span>
                Por{' '}
                <strong className="text-slate-700 dark:text-slate-300">
                  {noticia.autor_nombre}
                </strong>
              </span>
            )}
            {noticia.fecha_publicacion && (
              <time dateTime={noticia.fecha_publicacion}>
                {format(new Date(noticia.fecha_publicacion), "d 'de' MMMM 'de' yyyy, HH:mm", {
                  locale: es,
                })}
              </time>
            )}
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full text-white ${getCategoriaColor(noticia.categoria)}`}
            >
              {getCategoriaLabel(noticia.categoria)}
            </span>
            <span>{noticia.vistas.toLocaleString()} vistas</span>
          </div>

          {/* Imagen principal */}
          {noticia.imagen_url && (
            <div className="relative h-72 sm:h-[420px] rounded-xl overflow-hidden mb-6">
              <Image
                src={noticia.imagen_url}
                alt={noticia.titulo}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Video embed */}
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

          {/* Cuerpo con tipografía editorial */}
          <div
            className="prose prose-slate dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:font-serif
              prose-p:text-base prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-blockquote:border-l-blue-500"
            style={{ fontFamily: 'Georgia, serif' }}
            dangerouslySetInnerHTML={{ __html: noticia.contenido || '' }}
          />

          {/* Tags */}
          {noticia.tags && noticia.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              {noticia.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm text-slate-600 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Más noticias de esta categoría */}
          {otrasDeCategoria.length > 0 && (
            <section className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-700">
              <Divider texto={`Más noticias de ${getCategoriaLabel(noticia.categoria)}`} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {otrasDeCategoria.map((n) => (
                  <NoticiaCard key={n.id} noticia={n} variant="grid" />
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Sidebar relacionadas */}
        {relacionadas.length > 0 && (
          <aside className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <Divider texto="Noticias relacionadas" />
              <div className="space-y-4">
                {relacionadas.slice(0, 5).map((n) => (
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
