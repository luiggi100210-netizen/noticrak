import type { Noticia } from '../../lib/api';
import NoticiaCard from './NoticiaCard';
import Divider from '../ui/Divider';

interface SeccionNoticiasProps {
  titulo: string;
  noticias: Noticia[];
}

export default function SeccionNoticias({ titulo, noticias }: SeccionNoticiasProps) {
  return (
    <section>
      <Divider texto={titulo} />
      {noticias.length === 0 ? (
        <div className="sin-noticias">
          <p>Próximamente noticias de esta sección</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Primera noticia: card grande con imagen */}
          <NoticiaCard noticia={noticias[0]} variant="featured" />

          {/* Resto: grilla responsive */}
          {noticias.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {noticias.slice(1).map((n) => (
                <NoticiaCard key={n.id} noticia={n} variant="grid" />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
