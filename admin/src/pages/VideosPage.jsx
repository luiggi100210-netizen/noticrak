import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { CATEGORIAS } from './NuevaNoticiaPage';

const POR_PAGINA = 20;

export default function VideosPage() {
  const navigate = useNavigate();
  const [videos, setVideos]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [pagina, setPagina]       = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filtrocat, setFiltrocat] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limite: POR_PAGINA, pagina, ...(filtrocat && { categoria: filtrocat }) };
      const { data } = await api.get('/videos', { params });
      setVideos(data.videos || []);
      setTotal(data.total || 0);
    } catch {
      setError('Error al cargar los videos');
    } finally {
      setLoading(false);
    }
  }, [pagina, filtrocat]);

  useEffect(() => { cargar(); }, [cargar]);

  const eliminar = async (id) => {
    try {
      await api.delete(`/videos/${id}`);
      setConfirmId(null);
      cargar();
    } catch {
      setError('Error al eliminar el video');
    }
  };

  const catColor = (slug) => CATEGORIAS.find(c => c.slug === slug)?.color || '#888';
  const totalPaginas = Math.ceil(total / POR_PAGINA);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Videos</h1>
          <p className="page-subtitle">{total} videos en total</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/videos/nuevo')}>
          + Nuevo video
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filtros-bar">
        <select value={filtrocat} onChange={e => { setFiltrocat(e.target.value); setPagina(1); }}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map(c => <option key={c.id} value={c.slug}>{c.nombre}</option>)}
        </select>
        {filtrocat && (
          <button className="btn btn-ghost" onClick={() => setFiltrocat('')}>Limpiar</button>
        )}
      </div>

      {loading ? (
        <div className="table-skeleton">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton row-skeleton" />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state"><span>🎬</span><p>No hay videos</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoría</th>
                <th>Duración</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id}>
                  <td className="col-titulo">
                    <span className="titulo-cell" title={v.titulo}>{v.titulo}</span>
                  </td>
                  <td>
                    <span className="cat-dot-label">
                      <span className="cat-dot" style={{ backgroundColor: catColor(v.categoria_slug) }} />
                      {v.categoria_nombre || '—'}
                    </span>
                  </td>
                  <td>{v.duracion || '—'}</td>
                  <td>
                    <span className={`badge badge-${v.estado}`}>
                      {v.estado === 'publicado' ? '● Publicado' : '○ Borrador'}
                    </span>
                  </td>
                  <td className="col-fecha">
                    {v.created_at ? new Date(v.created_at).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td className="col-acciones">
                    <a href={v.url} target="_blank" rel="noreferrer" className="btn-icon" title="Ver video">▶️</a>
                    {confirmId === v.id ? (
                      <span className="confirm-row">
                        <button className="btn-icon btn-danger" onClick={() => eliminar(v.id)}>✓</button>
                        <button className="btn-icon" onClick={() => setConfirmId(null)}>✕</button>
                      </span>
                    ) : (
                      <button className="btn-icon btn-danger" onClick={() => setConfirmId(v.id)} title="Eliminar">🗑️</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}>← Anterior</button>
          <span className="pagination-info">Página {pagina} de {totalPaginas}</span>
          <button className="btn btn-ghost" disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)}>Siguiente →</button>
        </div>
      )}
    </div>
  );
}
