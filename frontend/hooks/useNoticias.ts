'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNoticias, type Noticia } from '../lib/api';

interface UseNoticiasParams {
  categoria?: string;
  limite?: number;
  pagina?: number;
}

export function useNoticias(params?: UseNoticiasParams) {
  const [data, setData] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { categoria, limite, pagina } = params || {};

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNoticias({ categoria, limite, pagina });
      setData(result.noticias);
    } catch {
      setError('Error al cargar noticias');
    } finally {
      setLoading(false);
    }
  }, [categoria, limite, pagina]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
