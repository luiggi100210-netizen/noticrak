import type { Noticia } from '../../lib/api';
import NoticiaCard from './NoticiaCard';
import Divider from '../ui/Divider';

interface GrillaCategoriaProps {
  titulo: string;
  noticias: Noticia[];
}

export default function GrillaCategoria({ titulo, noticias }: GrillaCategoriaProps) {
  return (
    <section>
      <Divider texto={titulo} />
      {noticias.length === 0 ? (
        <div className="sin-noticias">
          <p>Próximamente noticias de esta sección</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Primera noticia: card con imagen */}
          <NoticiaCard noticia={noticias[0]} variant="featured" />

          {/* Resto: lista horizontal con thumbnail */}
          {noticias.length > 1 && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {noticias.slice(1).map((n) => (
                <div key={n.id} className="py-2">
                  <NoticiaCard noticia={n} variant="stack" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
