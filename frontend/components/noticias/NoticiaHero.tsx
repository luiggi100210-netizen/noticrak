import type { Noticia } from '../../lib/api';
import NoticiaCard from './NoticiaCard';

interface NoticiaHeroProps {
  principal: Noticia;
  secundarias: Noticia[];
}

export default function NoticiaHero({ principal, secundarias }: NoticiaHeroProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Noticia principal grande */}
      <div className="lg:col-span-2">
        <NoticiaCard noticia={principal} variant="hero" />
      </div>

      {/* Stack de hasta 4 secundarias */}
      <div className="flex flex-col gap-4 justify-between">
        {secundarias.slice(0, 4).map((noticia) => (
          <div key={noticia.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
            <NoticiaCard noticia={noticia} variant="stack" />
          </div>
        ))}
      </div>
    </div>
  );
}
