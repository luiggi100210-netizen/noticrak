import type { MetadataRoute } from 'next';
import { getNoticias, CATEGORIAS } from '../lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://noticrack.pe';

export const revalidate = 3600; // Regenera el sitemap cada hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const rutasEstaticas: MetadataRoute.Sitemap = [
    { url: SITE_URL,                 lastModified: now, changeFrequency: 'hourly',  priority: 1.0 },
    { url: `${SITE_URL}/videos`,     lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${SITE_URL}/buscar`,     lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const rutasCategorias: MetadataRoute.Sitemap = CATEGORIAS.map(c => ({
    url: `${SITE_URL}/seccion/${c.key}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Últimas noticias publicadas (hasta 200 más recientes)
  let rutasNoticias: MetadataRoute.Sitemap = [];
  try {
    const { noticias } = await getNoticias({ limite: 200 });
    rutasNoticias = noticias.map(n => ({
      url: `${SITE_URL}/noticias/${n.slug}`,
      lastModified: new Date(n.fecha_publicacion || n.createdAt || now),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch {
    // Si la API falla, devolvemos solo las rutas estáticas — mejor un sitemap parcial que ninguno.
  }

  return [...rutasEstaticas, ...rutasCategorias, ...rutasNoticias];
}
