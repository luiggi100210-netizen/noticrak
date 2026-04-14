'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CarruselProps {
  imagenes: string[];      // array de URLs
  titulo: string;
  imagenPrincipal?: string; // primera imagen (imagen_url)
}

export default function Carrusel({ imagenes, titulo, imagenPrincipal }: CarruselProps) {
  // Combinar imagen principal con el resto
  const todas = [
    ...(imagenPrincipal ? [imagenPrincipal] : []),
    ...imagenes.filter(url => url !== imagenPrincipal),
  ].filter(Boolean);

  const [actual, setActual] = useState(0);

  if (todas.length === 0) return null;

  // Si solo hay una imagen, mostrarla sin controles
  if (todas.length === 1) {
    return (
      <div className="relative h-64 sm:h-80 lg:h-[400px] rounded-lg overflow-hidden mb-6">
        <Image src={todas[0]} alt={titulo} fill className="object-cover" priority />
      </div>
    );
  }

  const anterior = () => setActual(a => (a - 1 + todas.length) % todas.length);
  const siguiente = () => setActual(a => (a + 1) % todas.length);

  return (
    <div className="mb-6">
      {/* Imagen principal */}
      <div className="relative h-64 sm:h-80 lg:h-[400px] rounded-lg overflow-hidden group">
        <Image
          src={todas[actual]}
          alt={`${titulo} — foto ${actual + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          priority={actual === 0}
        />

        {/* Overlay oscuro en bordes para controles */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Botón anterior */}
        <button
          onClick={anterior}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          aria-label="Foto anterior"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Botón siguiente */}
        <button
          onClick={siguiente}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
          aria-label="Foto siguiente"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Contador */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {actual + 1} / {todas.length}
        </div>
      </div>

      {/* Miniaturas */}
      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
        {todas.map((url, i) => (
          <button
            key={i}
            onClick={() => setActual(i)}
            className={`relative flex-shrink-0 w-16 h-12 rounded overflow-hidden transition-all ${
              i === actual
                ? 'ring-2 ring-primary-600 opacity-100'
                : 'opacity-60 hover:opacity-90'
            }`}
          >
            <Image src={url} alt={`Miniatura ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
