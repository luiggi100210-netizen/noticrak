import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  resumen?: string;
  contenido?: string;
  categoria: string;
  imagen_url?: string;
  imagenes?: string[];
  video_url?: string;
  tags: string[];
  publicado: boolean;
  destacado: boolean;
  vistas: number;
  autor_nombre?: string;
  fecha_publicacion: string;
  createdAt: string;
}

export interface PaginatedResponse {
  noticias: Noticia[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export const getNoticias = async (params?: {
  categoria?: string;
  pagina?: number;
  limite?: number;
  buscar?: string;
  destacado?: boolean;  // alias — se envía como "destacada" al backend
}): Promise<PaginatedResponse> => {
  const { destacado, ...rest } = params || {};
  const query = destacado !== undefined ? { ...rest, destacada: destacado } : rest;
  const { data } = await api.get('/noticias', { params: query });
  return data;
};

export const getNoticiaBySlug = async (slug: string): Promise<{
  noticia: Noticia;
  relacionadas: Noticia[];
}> => {
  const { data } = await api.get(`/noticias/${slug}`);
  return data;
};

export interface PortadaResponse {
  cusco:           Noticia[];
  politica:        Noticia[];
  nacional:        Noticia[];
  economia:        Noticia[];
  deportes:        Noticia[];
  internacional:   Noticia[];
  tecnologia:      Noticia[];
  entretenimiento: Noticia[];
  destacada:       Noticia | null;
}

export const getPortada = async (): Promise<PortadaResponse> => {
  const { data } = await api.get('/noticias/portada');
  return data;
};

export const getTickerNoticias = async (): Promise<Noticia[]> => {
  const { data } = await api.get('/noticias/ticker');
  return data;
};


export interface Video {
  id: number;
  titulo: string;
  descripcion?: string;
  url: string;
  imagen_url?: string;
  duracion?: string;
  estado: string;
  vistas: number;
  created_at: string;
  categoria_nombre?: string;
  categoria_slug?: string;
  categoria_color?: string;
  autor_nombre?: string;
}

export interface VideosResponse {
  videos: Video[];
  total: number;
  pagina: number;
  totalPaginas: number;
}

export interface RadioPrograma {
  id: number;
  nombre: string;
  conductor?: string;
  hora_inicio: string;
  hora_fin: string;
  dias: string[];
  activo?: boolean;
}

export interface RadioAhoraResponse {
  enAire: boolean;
  programa?: RadioPrograma;
  mensaje?: string;
}

export const getVideosApi = async (params?: {
  categoria?: string;
  limite?: number;
  pagina?: number;
}): Promise<VideosResponse> => {
  const { data } = await api.get('/videos', { params });
  return data;
};


export const getRadioProgramas = async (): Promise<RadioPrograma[]> => {
  const { data } = await api.get('/radio/programas');
  return data;
};

export const CATEGORIAS = [
  { key: 'cusco', label: 'Cusco', color: 'bg-amber-500' },
  { key: 'nacional', label: 'Nacional', color: 'bg-blue-600' },
  { key: 'politica', label: 'Política', color: 'bg-red-600' },
  { key: 'economia', label: 'Economía', color: 'bg-green-600' },
  { key: 'deportes', label: 'Deportes', color: 'bg-orange-500' },
  { key: 'tecnologia', label: 'Tecnología', color: 'bg-purple-600' },
  { key: 'internacional', label: 'Internacional', color: 'bg-sky-600' },
  { key: 'entretenimiento', label: 'Entretenimiento', color: 'bg-pink-500' },
];

export const getCategoriaColor = (categoria: string): string => {
  return CATEGORIAS.find(c => c.key === categoria)?.color || 'bg-gray-500';
};

export const getCategoriaLabel = (categoria: string): string => {
  return CATEGORIAS.find(c => c.key === categoria)?.label || categoria;
};

export default api;
