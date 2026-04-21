import type { Noticia } from '../../lib/api';
import NoticiaCard from './NoticiaCard';
import Divider from '../ui/Divider';

interface SeccionNoticiasProps {
  titulo: string;
  noticias: Noticia[];
}

export default function SeccionNoticias({ titulo, noticias }: SeccionNoticiasProps) {
  // Si no hay noticias, no renderizar la sección (evita "próximamente" repetido)
  if (!noticias || noticias.length === 0) return null;

  return (
    <section>
      <Divider texto={titulo} />
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
    </section>
  );
}
