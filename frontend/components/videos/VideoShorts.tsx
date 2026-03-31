'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Video } from '../../lib/api';

interface VideoShortsProps {
  videos: Video[];
}

export default function VideoShorts({ videos }: VideoShortsProps) {
  if (!videos.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {videos.slice(0, 4).map((video) => (
        <VideoShortCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function VideoShortCard({ video }: { video: Video }) {
  const [hovered, setHovered] = useState(false);
  const tiempo = formatDistanceToNow(new Date(video.created_at), { addSuffix: true, locale: es });

  return (
    <Link href={`/videos?id=${video.id}`} className="group flex gap-3">
      {/* Miniatura cuadrada 72px */}
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
        {/* Overlay play */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-8 h-8 bg-blue-600/90 rounded-full flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-0.5">
        {video.categoria_nombre && (
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600 leading-none mb-1">
            {video.categoria_nombre}
          </p>
        )}
        <h4
          className="text-xs font-semibold line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors mb-1"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {video.titulo}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          {video.duracion && <span className="font-mono">{video.duracion}</span>}
          {video.duracion && <span>·</span>}
          <span>{tiempo}</span>
        </div>
      </div>
    </Link>
  );
}
