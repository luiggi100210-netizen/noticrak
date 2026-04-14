import Link from 'next/link';
import type { Noticia } from '../../lib/api';

interface Props {
  noticias: Noticia[];
}

export default function UltimaHoraBar({ noticias }: Props) {
  if (!noticias || noticias.length === 0) return null;
  // Duplicar para loop infinito
  const items = [...noticias, ...noticias];
  return (
    <div className="ultima-hora-bar flex items-center gap-0 overflow-hidden">
      <span className="label">Última Hora</span>
      <div className="flex-1 overflow-hidden relative ml-3">
        <div className="ultima-hora-scroll">
          {items.map((n, i) => (
            <Link
              key={`${n.id}-${i}`}
              href={`/noticias/${n.slug}`}
              className="hover:underline text-xs font-semibold"
            >
              {n.titulo}
              <span className="mx-5 opacity-40">•</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
