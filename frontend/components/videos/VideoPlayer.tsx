'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Video } from '../../lib/api';


interface VideoPlayerProps {
  video: Video;
}

/** Devuelve la URL de embed si la plataforma lo permite, o null si no */
function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

  // Facebook, TikTok, Instagram y el resto NO permiten embed → abrir en nueva pestaña
  return null;
}

function getPlatformLabel(url: string): string {
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook';
  if (url.includes('tiktok.com')) return 'TikTok';
  if (url.includes('instagram.com')) return 'Instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'X / Twitter';
  return 'Ver video';
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  const esLive   = video.estado === 'live' || video.estado === 'en_vivo';
  const embedUrl = getEmbedUrl(video.url);

  const handlePlay = () => {
    if (embedUrl) {
      setPlaying(true);
    } else {
      window.open(video.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900">
      {playing && embedUrl ? (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          title={video.titulo}
        />
      ) : (
        <>
          {/* Thumbnail */}
          {video.imagen_url && !imgError ? (
            <Image
              src={video.imagen_url}
              alt={video.titulo}
              fill
              className="object-cover"
              priority
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <span className="text-6xl">🎬</span>
            </div>
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* LIVE / duración badge */}
          {esLive ? (
            <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              EN VIVO
            </span>
          ) : video.duracion ? (
            <span className="absolute bottom-16 right-4 bg-black/70 text-white text-xs font-mono px-2 py-0.5 rounded">
              {video.duracion}
            </span>
          ) : null}

          {/* Play button */}
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 group"
            aria-label="Reproducir video"
          >
            <div className="w-20 h-20 bg-primary-600 hover:bg-primary-500 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-200 group-hover:scale-110">
              <svg className="w-9 h-9 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            {/* Si no es embebible, muestra en qué plataforma se abrirá */}
            {!embedUrl && (
              <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Ver en {getPlatformLabel(video.url)} →
              </span>
            )}
          </button>
        </>
      )}
    </div>
  );
}
