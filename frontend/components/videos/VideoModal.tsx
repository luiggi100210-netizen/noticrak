'use client';

import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import VideoPlayer from './VideoPlayer';
import type { Video } from '../../lib/api';

interface VideoModalProps {
  video: Video | null;
  onClose: () => void;
}

export default function VideoModal({ video, onClose }: VideoModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    if (!video) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [video, onClose]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-semibold"
          aria-label="Cerrar"
        >
          <XMarkIcon className="w-5 h-5" />
          Cerrar
        </button>

        {/* Player */}
        <VideoPlayer video={video} />

        {/* Info debajo */}
        <div className="mt-3 px-1">
          {video.categoria_nombre && (
            <p className="text-xs font-bold uppercase tracking-wide text-primary-400 mb-1">
              {video.categoria_nombre}
            </p>
          )}
          <h3 className="font-heading text-white font-bold text-lg leading-snug">
            {video.titulo}
          </h3>
          {video.descripcion && (
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{video.descripcion}</p>
          )}
        </div>
      </div>
    </div>
  );
}
