'use client';

import { useState } from 'react';
import { getNoticias, type Noticia } from '../../lib/api';
import NoticiaCard from './NoticiaCard';

interface CargarMasProps {
  categoria: string;
  paginaActual: number;
  totalPaginas: number;
}

export default function CargarMas({ categoria, paginaActual, totalPaginas }: CargarMasProps) {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [pagina, setPagina] = useState(paginaActual);
  const [cargando, setCargando] = useState(false);

  const hayMas = pagina < totalPaginas;

  const cargar = async () => {
    if (cargando || !hayMas) return;
    setCargando(true);
    try {
      const siguiente = pagina + 1;
      const result = await getNoticias({ categoria, pagina: siguiente, limite: 20 });
      setNoticias((prev) => [...prev, ...result.noticias]);
      setPagina(siguiente);
    } catch {
      // silencioso
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      {noticias.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
          {noticias.map((n) => (
            <NoticiaCard key={n.id} noticia={n} variant="grid" />
          ))}
        </div>
      )}

      {pagina < totalPaginas && (
        <button
          onClick={cargar}
          disabled={cargando}
          className="px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-semibold rounded-lg transition-colors"
        >
          {cargando ? 'Cargando...' : 'Cargar más noticias'}
        </button>
      )}
    </>
  );
}
