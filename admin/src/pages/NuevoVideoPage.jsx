import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { CATEGORIAS } from './NuevaNoticiaPage';

export default function NuevoVideoPage() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ titulo: '', descripcion: '', url: '', imagen_url: '', categoria_id: '', duracion: '', estado: 'publicado' });
  const [preview, setPreview]   = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]       = useState('');
  const [exito, setExito]       = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleImagen = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('imagen', file);
    setSubiendo(true);
    try {
      const { data } = await api.post('/upload/imagen', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, imagen_url: data.url }));
      setPreview(data.url);
    } catch {
      setError('Error al subir la miniatura');
    } finally {
      setSubiendo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) { setError('El título es requerido'); return; }
    if (!form.url.trim())    { setError('La URL del video es requerida'); return; }
    if (!form.categoria_id)  { setError('Selecciona una categoría'); return; }

    setGuardando(true);
    setError('');
    try {
      await api.post('/videos', {
        ...form,
        categoria_id: parseInt(form.categoria_id),
      });
      setExito('✅ Video guardado correctamente');
      setTimeout(() => navigate('/videos'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el video');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Nuevo video</h1>
          <p className="page-subtitle">Agrega un video al portal</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/videos')}>← Volver</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {exito && <div className="alert alert-success">{exito}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label>Título <span className="required">*</span></label>
          <input type="text" name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título del video" />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={4} placeholder="Descripción del video..." />
        </div>

        <div className="form-group">
          <label>URL del video <span className="required">*</span></label>
          <input type="url" name="url" value={form.url} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." />
        </div>

        <div className="form-group">
          <label>Categoría <span className="required">*</span></label>
          <div className="categoria-pills">
            {CATEGORIAS.map(cat => (
              <button
                key={cat.id} type="button"
                className={`categoria-pill ${parseInt(form.categoria_id) === cat.id ? 'selected' : ''}`}
                style={{
                  borderColor: cat.color,
                  backgroundColor: parseInt(form.categoria_id) === cat.id ? cat.color : 'transparent',
                  color: parseInt(form.categoria_id) === cat.id ? '#fff' : cat.color,
                }}
                onClick={() => setForm(f => ({ ...f, categoria_id: cat.id }))}
              >{cat.nombre}</button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Imagen miniatura</label>
          <div className="upload-area">
            {preview ? (
              <div className="upload-preview">
                <img src={preview} alt="Miniatura" />
                <button type="button" className="btn-remove-img" onClick={() => { setPreview(''); setForm(f => ({ ...f, imagen_url: '' })); }}>✕</button>
              </div>
            ) : (
              <label className="upload-label">
                <input type="file" accept="image/*" onChange={handleImagen} hidden />
                <span className="upload-icon">🖼️</span>
                <span>{subiendo ? 'Subiendo...' : 'Subir miniatura'}</span>
                <span className="upload-hint">JPG, PNG, WebP — máx. 10MB</span>
              </label>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duración</label>
            <input type="text" name="duracion" value={form.duracion} onChange={handleChange} placeholder="12:34" />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="publicado">Publicado</option>
              <option value="borrador">Borrador</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-success btn-full" disabled={guardando}>
            {guardando ? 'Guardando...' : '✅ Guardar video'}
          </button>
        </div>
      </form>
    </div>
  );
}
