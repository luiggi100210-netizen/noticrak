import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import NuevaNoticiaPage from './NuevaNoticiaPage';

export default function EditarNoticiaPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [noticia, setNoticia]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get(`/noticias/admin/${id}`)
      .catch(() => api.get(`/noticias/por-id/${id}`)
        // Fallback: obtener por listado y filtrar (si el backend no tiene ruta por ID)
        .catch(() => api.get('/noticias', { params: { estado: 'todos', limite: 100 } }))
      )
      .then(res => {
        // Normalizar la respuesta según lo que devuelva el backend
        const data = res.data?.noticia || res.data;
        if (!data?.id) {
          // Buscar en el listado
          return api.get('/noticias', { params: { limite: 200 } }).then(r => {
            const encontrada = r.data.noticias?.find(n => String(n.id) === String(id));
            if (!encontrada) throw new Error('No encontrada');
            return { data: encontrada };
          });
        }
        return { data };
      })
      .then(({ data }) => {
        // Adaptar tags a string para el formulario
        setNoticia({
          ...data,
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
          categoria_id: data.categoria_id || '',
        });
      })
      .catch(() => setError('No se pudo cargar la noticia'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="page">
      <div className="loading-center">
        <div className="spinner" />
        <p>Cargando noticia...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="page">
      <div className="alert alert-error">{error}</div>
      <button className="btn btn-secondary" onClick={() => navigate('/noticias')}>← Volver</button>
    </div>
  );

  return (
    <NuevaNoticiaPage
      noticiaInicial={noticia}
      modoEdicion={true}
      noticiaId={id}
    />
  );
}
