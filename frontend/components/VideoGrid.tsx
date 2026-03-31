'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircleIcon } from '@heroicons/react/24/solid';
import { getVideos, type Noticia, getCategoriaColor, getCategoriaLabel } from '../lib/api';

export default function VideoGrid() {
  const [videos, setVideos] = useState<Noticia[]>([]);
  const [selected, setSelected] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVideos()
      .then(data => {
        setVideos(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="videos" className="my-8">
        <h2 className="text-2xl font-bold mb-4">Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-200 dark:bg-slate-700 h-40 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (videos.length === 0) return null;

  const getEmbedUrl = (url: string) => {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    return url;
  };

  return (
    <section id="videos" className="my-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Videos</h2>
        <Link href="/seccion/videos" className="text-sm text-primary-600 hover:underline font-medium">
          Ver todos →
        </Link>
      </div>

      {/* Main video player */}
      {selected && (
        <div className="mb-6 bg-black rounded-2xl overflow-hidden aspect-video max-h-96">
          {selected.video_url ? (
            <iframe
              src={getEmbedUrl(selected.video_url)}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media"
              title={selected.titulo}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
              <span className="text-slate-500">No hay video disponible</span>
            </div>
          )}
        </div>
      )}

      {/* Video grid thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {videos.map(video => (
          <button
            key={video.id}
            onClick={() => setSelected(video)}
            className={`group relative rounded-xl overflow-hidden text-left transition-all ${
              selected?.id === video.id
                ? 'ring-2 ring-primary-500 scale-[0.98]'
                : 'hover:scale-[0.99]'
            }`}
          >
            <div className="relative h-32">
              {video.imagen_url ? (
                <Image src={video.imagen_url} alt={video.titulo} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-700" />
              )}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <PlayCircleIcon className="absolute inset-0 m-auto w-10 h-10 text-white opacity-90" />
              <span className={`absolute top-2 left-2 categoria-badge ${getCategoriaColor(video.categoria)} text-[10px]`}>
                {getCategoriaLabel(video.categoria)}
              </span>
            </div>
            <div className="p-2 bg-white dark:bg-slate-800">
              <p className="text-xs font-semibold line-clamp-2">{video.titulo}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
