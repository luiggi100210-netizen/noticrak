'use client';

import { useState } from 'react';

interface VideoThumbProps {
  src?: string | null;
  alt: string;
  duracion?: string | null;
}

export default function VideoThumb({ src, alt, duracion }: VideoThumbProps) {
  const [error, setError] = useState(false);

  return (
    <div className="relative w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <span className="text-2xl">🎬</span>
      )}
      {duracion && (
        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs font-mono px-1 py-0.5 rounded">
          {duracion}
        </span>
      )}
    </div>
  );
}
