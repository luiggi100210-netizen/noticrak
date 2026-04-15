'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNoticias, type Noticia } from '../../lib/api';

export default function TendenciasWidget() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNoticias({ limite: 20 })
      .then((res) => {
        const top5 = [...res.noticias].sort((a, b) => b.vistas - a.vistas).slice(0, 5);
        setNoticias(top5);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
        Lo más leído
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-2 animate-pulse">
              <div className="w-6 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="flex-1 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <ol className="space-y-1">
          {noticias.map((noticia, idx) => (
            <li key={noticia.id}>
              <Link
                href={`/noticias/${noticia.slug}`}
                className="group flex gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
              >
                <span className="text-2xl font-bold text-blue-200 dark:text-blue-900 w-6 flex-shrink-0 leading-none">
                  {idx + 1}
                </span>
                <p
                  className="font-heading text-xs font-medium leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors"
                >
                  {noticia.titulo}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
