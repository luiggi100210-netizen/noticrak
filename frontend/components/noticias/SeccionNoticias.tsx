import type { Noticia } from '../../lib/api';
import NoticiaCard from './NoticiaCard';
import Divider from '../ui/Divider';

interface SeccionNoticiasProps {
  titulo: string;
  noticias: Noticia[];
  mostrarNumero?: boolean;
}

export default function SeccionNoticias({
  titulo,
  noticias,
  mostrarNumero = true,
}: SeccionNoticiasProps) {
  return (
    <section>
      <Divider texto={titulo} />
      <div>
        {noticias.map((noticia, index) => (
          <NoticiaCard
            key={noticia.id}
            noticia={noticia}
            variant="list"
            numero={mostrarNumero ? index + 1 : undefined}
          />
        ))}
      </div>
    </section>
  );
}
