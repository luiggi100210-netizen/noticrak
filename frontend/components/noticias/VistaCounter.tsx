'use client';

import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface VistaCounterProps {
  noticiaId: string;
}

export default function VistaCounter({ noticiaId }: VistaCounterProps) {
  useEffect(() => {
    fetch(`${API_URL}/noticias/${noticiaId}/vistas`, { method: 'PUT' }).catch(() => {});
  }, [noticiaId]);

  return null;
}
