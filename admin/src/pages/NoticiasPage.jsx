import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { CATEGORIAS } from './NuevaNoticiaPage';

const POR_PAGINA = 20;

export default function NoticiasPage() {
  const navigate = useNavigate();
  const [noticias, setNoticias]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [pagina, setPagina]       = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [filtros, setFiltros]     = useState({ categoria: '', estado: '' });
  const [confirmId, setConfirmId] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        limite: POR_PAGINA,
        pagina,
        ...(filtros.estado    && { estado: filtros.estado }),
        ...(filtros.categoria && { categoria: filtros.categoria }),
      };
      // Intentar ruta admin primero, caer en pública si no existe
      const res = await api.get('/noticias', { params });
      setNoticias(res.data.noticias || []);
      setTotal(res.data.total || 0);
    } catch {
      setError('Error al cargar las noticias');
    } finally {
      setLoading(false);
    }
  }, [pagina, filtros]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleFiltro = (e) => {
    setFiltros(f => ({ ...f, [e.target.name]: e.target.value }));
    setPagina(1);
  };

  const eliminar = async (id) => {
    try {
      await api.delete(`/noticias/${id}`);
      setConfirmId(null);
      cargar();
    } catch {
      setError('Error al eliminar la noticia');
    }
  };

  const totalPaginas = Math.ceil(total / POR_PAGINA);

  const catColor = (slug) => CATEGORIAS.find(c => c.slug === slug)?.color || '#888';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Noticias</h1>
          <p className="page-subtitle">{total} noticias en total</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/noticias/nueva')}>
          + Nueva noticia
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filtros */}
      <div className="filtros-bar">
        <select name="categoria" value={filtros.categoria} onChange={handleFiltro}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map(c => <option key={c.id} value={c.slug}>{c.nombre}</option>)}
        </select>
        <select name="estado" value={filtros.estado} onChange={handleFiltro}>
          <option value="">Todos los estados</option>
          <option value="publicado">Publicado</option>
          <option value="borrador">Borrador</option>
        </select>
        <button className="btn btn-ghost" onClick={() => { setFiltros({ categoria:'', estado:'' }); setPagina(1); }}>
          Limpiar filtros
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="table-skeleton">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton row-skeleton" />)}
        </div>
      ) : noticias.length === 0 ? (
        <div className="empty-state">
          <span>📰</span>
          <p>No hay noticias con esos filtros</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Titular</th>
                <th>Categoría</th>
                <th>Autor</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {noticias.map(n => (
                <tr key={n.id}>
                  <td className="col-titulo">
                    <span className="titulo-cell" title={n.titulo}>{n.titulo}</span>
                  </td>
                  <td>
                    <span className="cat-dot-label">
                      <span className="cat-dot" style={{ backgroundColor: catColor(n.categoria_slug) }} />
                      {n.categoria_nombre || n.categoria_slug || '—'}
                    </span>
                  </td>
                  <td>{n.autor_nombre || '—'}</td>
                  <td className="col-fecha">
                    {n.fecha_publicacion
                      ? new Date(n.fecha_publicacion).toLocaleDateString('es-PE')
                      : '—'}
                  </td>
                  <td>
                    <span className={`badge badge-${n.estado}`}>
                      {n.estado === 'publicado' ? '● Publicado' : '○ Borrador'}
                    </span>
                  </td>
                  <td className="col-acciones">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => navigate(`/noticias/editar/${n.id}`)}
                      title="Editar"
                    >✏️</button>
                    {confirmId === n.id ? (
                      <span className="confirm-row">
                        <button className="btn-icon btn-danger" onClick={() => eliminar(n.id)}>✓</button>
                        <button className="btn-icon" onClick={() => setConfirmId(null)}>✕</button>
                      </span>
                    ) : (
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => setConfirmId(n.id)}
                        title="Eliminar"
                      >🗑️</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="pagination">
          <button
            className="btn btn-ghost"
            disabled={pagina === 1}
            onClick={() => setPagina(p => p - 1)}
          >← Anterior</button>
          <span className="pagination-info">Página {pagina} de {totalPaginas}</span>
          <button
            className="btn btn-ghost"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina(p => p + 1)}
          >Siguiente →</button>
        </div>
      )}
    </div>
  );
}
