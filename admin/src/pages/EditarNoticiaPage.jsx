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
      .then(res => {
        const data = res.data;
        setNoticia({
          ...data,
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
          categoria_id: data.categoria_id || '',
          imagenes: Array.isArray(data.imagenes) ? data.imagenes : [],
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
