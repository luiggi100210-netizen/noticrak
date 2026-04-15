'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Noticia } from '../../lib/api';
import { getCategoriaLabel } from '../../lib/api';

interface GrillaVideosProps {
  videos: Noticia[];
}

export default function GrillaVideos({ videos }: GrillaVideosProps) {
  if (!videos.length) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function VideoCard({ video }: { video: Noticia }) {
  const [hovered, setHovered] = useState(false);
  const tiempo = formatDistanceToNow(new Date(video.fecha_publicacion), {
    addSuffix: true,
    locale: es,
  });
  const isLive = video.tags?.includes('live') || video.tags?.includes('en-vivo');

  return (
    <Link href={`/noticias/${video.slug}`} className="group block">
      <div
        className="relative h-40 rounded-lg overflow-hidden mb-2 bg-slate-900"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {video.imagen_url && (
          <Image
            src={video.imagen_url}
            alt={video.titulo}
            fill
            className={`object-cover transition-opacity duration-300 ${
              hovered ? 'opacity-60' : 'opacity-80'
            }`}
          />
        )}

        {/* Play icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            hovered ? 'opacity-100' : 'opacity-70'
          }`}
        >
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-5 h-5 text-slate-900 ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* LIVE badge */}
        {isLive && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">
            LIVE
          </span>
        )}
      </div>

      {/* Category kicker */}
      <p className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-1">
        {getCategoriaLabel(video.categoria)}
      </p>

      {/* Title */}
      <h3
        className="font-heading text-sm font-semibold line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors mb-1"
      >
        {video.titulo}
      </h3>

      {/* Metadata */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>{tiempo}</span>
        <span>·</span>
        <span>{video.vistas.toLocaleString()} vistas</span>
      </div>
    </Link>
  );
}
