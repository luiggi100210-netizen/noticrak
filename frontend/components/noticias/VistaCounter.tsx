'use client';

import { useEffect } from 'react';
import api from '../../lib/api';

interface VistaCounterProps {
  noticiaId: string;
}

export default function VistaCounter({ noticiaId }: VistaCounterProps) {
  useEffect(() => {
    api.put(`/noticias/${noticiaId}/vistas`).catch(() => {});
  }, [noticiaId]);

  return null;
}
