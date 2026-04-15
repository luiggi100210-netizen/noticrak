'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Video } from '../../lib/api';

interface VideoGridProps {
  videos: Video[];
}

// Degradado oscuro por categoría
const GRADIENTES: Record<string, string> = {
  cusco: 'from-amber-900/70',
  nacional: 'from-blue-900/70',
  politica: 'from-red-900/70',
  economia: 'from-green-900/70',
  deportes: 'from-orange-900/70',
  tecnologia: 'from-purple-900/70',
  internacional: 'from-sky-900/70',
  entretenimiento: 'from-pink-900/70',
};

export default function VideoGrid({ videos }: VideoGridProps) {
  if (!videos.length) return null;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {videos.slice(0, 4).map((video) => (
        <VideoGridCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function VideoGridCard({ video }: { video: Video }) {
  const [hovered, setHovered] = useState(false);
  const slug = video.categoria_slug || '';
  const gradiente = GRADIENTES[slug] || 'from-slate-900/70';
  const esLive = video.estado === 'live' || video.estado === 'en_vivo';
  const tiempo = formatDistanceToNow(new Date(video.created_at), { addSuffix: true, locale: es });

  return (
    <Link href={`/videos?id=${video.id}`} className="group block">
      <div
        className="relative h-40 rounded-lg overflow-hidden mb-2 bg-slate-900 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {video.imagen_url && (
          <Image
            src={video.imagen_url}
            alt={video.titulo}
            fill
            className={`object-cover transition-all duration-300 ${hovered ? 'opacity-60 scale-105' : 'opacity-90'}`}
          />
        )}

        {/* Degradado categoría */}
        <div className={`absolute inset-0 bg-gradient-to-t ${gradiente} to-transparent`} />

        {/* Play overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-12 h-12 bg-blue-600/90 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* LIVE badge */}
        {esLive && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </span>
        )}

        {/* Duración */}
        {video.duracion && !esLive && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-mono px-1.5 py-0.5 rounded">
            {video.duracion}
          </span>
        )}
      </div>

      {/* Category kicker */}
      {video.categoria_nombre && (
        <p className="text-xs font-bold uppercase tracking-wide text-blue-600 mb-1">
          {video.categoria_nombre}
        </p>
      )}

      {/* Título */}
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
