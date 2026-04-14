export const dynamic = 'force-dynamic';

import { getNoticias } from '../../lib/api';
import NoticiaCard from '../../components/noticias/NoticiaCard';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q = '' } = await searchParams;
  return {
    title: q ? `Búsqueda: "${q}" - NotiCrack` : 'Buscar - NotiCrack',
    description: q ? `Resultados para "${q}" en NotiCrack` : 'Buscar noticias en NotiCrack',
  };
}

export default async function BuscarPage({ searchParams }: PageProps) {
  const { q: qRaw = '' } = await searchParams;
  const q = qRaw.trim();

  const resultado = q
    ? await getNoticias({ buscar: q, limite: 30 }).catch(() => ({ noticias: [], total: 0, pagina: 1, totalPaginas: 1 }))
    : { noticias: [], total: 0, pagina: 1, totalPaginas: 1 };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="text-sm text-slate-400 mb-3">
          <Link href="/" className="hover:text-blue-600">Inicio</Link>
          <span className="mx-2">›</span>
          <span className="text-slate-600 dark:text-slate-300">Búsqueda</span>
        </nav>
        {q ? (
          <div>
            <h1 className="text-3xl font-bold">
              Resultados para: <span className="text-blue-600">&ldquo;{q}&rdquo;</span>
            </h1>
            <p className="text-slate-400 mt-1">
              {resultado.total} {resultado.total === 1 ? 'noticia encontrada' : 'noticias encontradas'}
            </p>
          </div>
        ) : (
          <h1 className="text-3xl font-bold">Buscar noticias</h1>
        )}
      </div>

      <form method="GET" action="/buscar" className="mb-8">
        <div className="flex gap-3 max-w-2xl">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Escribe tu búsqueda..."
            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            autoFocus
          />
          <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            Buscar
          </button>
        </div>
      </form>

      {!q ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl font-semibold">Ingresa un término para buscar</p>
        </div>
      ) : resultado.noticias.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">😔</p>
          <p className="text-xl font-semibold">No encontramos resultados</p>
          <p className="mt-2">No hay noticias que coincidan con <strong>&ldquo;{q}&rdquo;</strong></p>
          <Link href="/" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resultado.noticias.map(noticia => {
            const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            const partes = noticia.titulo.split(regex);
            return (
              <div key={noticia.id}>
                <NoticiaCard noticia={noticia} variant="grid" />
                <p className="text-sm mt-1 text-slate-500 dark:text-slate-400 line-clamp-1">
                  {partes.map((parte, i) =>
                    regex.test(parte) ? (
                      <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 text-inherit rounded px-0.5">{parte}</mark>
                    ) : (
                      <span key={i}>{parte}</span>
                    )
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
