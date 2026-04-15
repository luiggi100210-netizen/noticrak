'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Video } from '../../lib/api';
import VideoModal from './VideoModal';

interface VideoShortsProps {
  videos: Video[];
}

export default function VideoShorts({ videos }: VideoShortsProps) {
  const [selected, setSelected] = useState<Video | null>(null);

  if (!videos.length) return null;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {videos.slice(0, 4).map((video) => (
          <VideoShortCard key={video.id} video={video} onPlay={() => setSelected(video)} />
        ))}
      </div>
      <VideoModal video={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function VideoShortCard({ video, onPlay }: { video: Video; onPlay: () => void }) {
  const [hovered, setHovered] = useState(false);
  const tiempo = formatDistanceToNow(new Date(video.created_at), { addSuffix: true, locale: es });

  return (
    <button onClick={onPlay} className="group flex gap-3 text-left w-full">
      <div
        className="relative w-[72px] h-[72px] flex-shrink-0 rounded-lg overflow-hidden bg-slate-800"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {video.imagen_url && (
          <Image
            src={video.imagen_url}
            alt={video.titulo}
            fill
            className={`object-cover transition-opacity duration-200 ${hovered ? 'opacity-60' : 'opacity-90'}`}
          />
        )}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-8 h-8 bg-primary-600/90 rounded-full flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 py-0.5">
        {video.categoria_nombre && (
          <p className="text-xs font-bold uppercase tracking-wide text-primary-600 leading-none mb-1">
            {video.categoria_nombre}
          </p>
        )}
        <h4 className="font-heading text-xs font-semibold line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors mb-1">
          {video.titulo}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          {video.duracion && <span className="font-mono">{video.duracion}</span>}
          {video.duracion && <span>·</span>}
          <span>{tiempo}</span>
        </div>
      </div>
    </button>
  );
}
