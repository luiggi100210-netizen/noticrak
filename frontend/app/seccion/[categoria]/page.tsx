export const revalidate = 60;

import { notFound } from 'next/navigation';
import { getNoticias, CATEGORIAS, getCategoriaLabel, getCategoriaColor } from '../../../lib/api';
import NoticiaCard from '../../../components/noticias/NoticiaCard';
import Divider from '../../../components/ui/Divider';
import CargarMas from '../../../components/noticias/CargarMas';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ pagina?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const label = getCategoriaLabel(categoria);
  return {
    title: `${label} — NotiCrack`,
    description: `Últimas noticias de ${label} en NotiCrack`,
  };
}

export default async function SeccionPage({ params, searchParams }: PageProps) {
  const { categoria } = await params;
  const { pagina: paginaStr = '1' } = await searchParams;

  const categoriaKeys = CATEGORIAS.map(c => c.key);
  if (!categoriaKeys.includes(categoria)) notFound();

  const pagina = parseInt(paginaStr);
  const LIMITE = 20;

  const result = await getNoticias({ categoria, pagina, limite: LIMITE })
    .catch(() => ({ noticias: [], total: 0, pagina: 1, totalPaginas: 1 }));

  const label = getCategoriaLabel(categoria);
  const color = getCategoriaColor(categoria);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="text-sm text-slate-400 mb-3 flex items-center gap-1">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span>›</span>
          <span className="text-slate-600 dark:text-slate-300">{label}</span>
        </nav>
        <div className="flex items-center gap-4">
          <span className={`w-2 h-14 ${color} rounded-full flex-shrink-0`} />
          <div>
            <h1 className="font-heading text-4xl font-bold">{label}</h1>
            <p className="text-slate-400 mt-1 text-sm">{result.total} noticias</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIAS.filter(c => c.key !== categoria).map(cat => (
          <Link key={cat.key} href={`/seccion/${cat.key}`}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            {cat.label}
          </Link>
        ))}
      </div>

      {result.noticias.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <p className="text-5xl mb-4">📰</p>
          <p className="text-xl font-semibold">Sin noticias en esta sección</p>
          <Link href="/" className="inline-block mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <NoticiaCard noticia={result.noticias[0]} variant="hero" />
          </div>
          <Divider texto={`Todas las noticias de ${label}`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {result.noticias.slice(1).map(n => (
              <NoticiaCard key={n.id} noticia={n} variant="grid" />
            ))}
          </div>
          {result.totalPaginas > 1 && (
            <div className="mt-10 flex flex-col items-center gap-4">
              {pagina < result.totalPaginas && (
                <CargarMas categoria={categoria} paginaActual={pagina} totalPaginas={result.totalPaginas} />
              )}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {pagina > 1 && (
                  <Link href={`/seccion/${categoria}?pagina=${pagina - 1}`}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition-colors text-sm">
                    ← Anterior
                  </Link>
                )}
                <span className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm">
                  {pagina} / {result.totalPaginas}
                </span>
                {pagina < result.totalPaginas && (
                  <Link href={`/seccion/${categoria}?pagina=${pagina + 1}`}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition-colors text-sm">
                    Siguiente →
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
