'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getNoticias, CATEGORIAS, getCategoriaLabel, getCategoriaColor, type Noticia } from '../../../lib/api';
import NoticiaCard from '../../../components/noticias/NoticiaCard';
import Divider from '../../../components/ui/Divider';
import Link from 'next/link';

const LIMITE = 20;

export default function SeccionClientPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoria = Array.isArray(params.categoria) ? params.categoria[0] : params.categoria;
  const paginaStr = searchParams.get('pagina') || '1';
  const pagina = parseInt(paginaStr);

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [noticiasMas, setNoticiasMas] = useState<Noticia[]>([]);

  const categoriaKeys = CATEGORIAS.map(c => c.key);
  const esValida = categoriaKeys.includes(categoria ?? '');

  const cargar = useCallback(async () => {
    if (!categoria || !esValida) return;
    setCargando(true);
    try {
      const res = await getNoticias({ categoria, pagina, limite: LIMITE })
        .catch(() => ({ noticias: [] as Noticia[], total: 0, pagina: 1, totalPaginas: 1 }));
      setNoticias(res.noticias);
      setTotal(res.total);
      setTotalPaginas(res.totalPaginas);
      setNoticiasMas([]);
    } finally {
      setCargando(false);
    }
  }, [categoria, pagina, esValida]);

  useEffect(() => { cargar(); }, [cargar]);

  const cargarMas = async () => {
    if (cargandoMas) return;
    setCargandoMas(true);
    try {
      const paginaSiguiente = pagina + Math.ceil(noticiasMas.length / LIMITE) + 1;
      const res = await getNoticias({ categoria, pagina: paginaSiguiente, limite: LIMITE })
        .catch(() => ({ noticias: [] as Noticia[] }));
      setNoticiasMas(prev => [...prev, ...res.noticias]);
    } finally {
      setCargandoMas(false);
    }
  };

  if (!esValida) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Sección no encontrada</h1>
        <Link href="/" className="btn-primary">Volver al inicio</Link>
      </div>
    );
  }

  const label = getCategoriaLabel(categoria ?? '');
  const color = getCategoriaColor(categoria ?? '');
  const todasLasNoticias = [...noticias, ...noticiasMas];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-slate-400 mb-3 flex items-center gap-1">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span>›</span>
          <span className="text-slate-600 dark:text-slate-300">{label}</span>
        </nav>
        <div className="flex items-center gap-4">
          <span className={`w-2 h-14 ${color} rounded-full flex-shrink-0`} />
          <div>
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>{label}</h1>
            {!cargando && <p className="text-slate-400 mt-1 text-sm">{total} noticias</p>}
          </div>
        </div>
      </div>

      {/* Otras categorías */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIAS.filter(c => c.key !== categoria).map(cat => (
          <Link
            key={cat.key}
            href={`/seccion/${cat.key}`}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {cargando ? (
        <div className="animate-pulse space-y-4">
          <div className="h-[420px] bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-44 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      ) : todasLasNoticias.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <p className="text-5xl mb-4">📰</p>
          <p className="text-xl font-semibold">Sin noticias en esta sección</p>
          <p className="mt-2">Pronto habrá contenido aquí</p>
          <Link href="/" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Volver al inicio
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <NoticiaCard noticia={todasLasNoticias[0]} variant="hero" />
          </div>

          <Divider texto={`Todas las noticias de ${label}`} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {todasLasNoticias.slice(1).map(n => (
              <NoticiaCard key={n.id} noticia={n} variant="grid" />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="mt-10 flex flex-col items-center gap-4">
              {pagina < totalPaginas && (
                <button
                  onClick={cargarMas}
                  disabled={cargandoMas}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {cargandoMas ? 'Cargando...' : 'Cargar más noticias'}
                </button>
              )}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {pagina > 1 && (
                  <Link href={`/seccion/${categoria}?pagina=${pagina - 1}`}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition-colors text-sm">
                    ← Anterior
                  </Link>
                )}
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm">
                  {pagina} / {totalPaginas}
                </span>
                {pagina < totalPaginas && (
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
