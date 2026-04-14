import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export const CATEGORIAS = [
  { id: 1, nombre: 'Política',         slug: 'politica',        color: '#c0392b' },
  { id: 2, nombre: 'Economía',         slug: 'economia',        color: '#27ae60' },
  { id: 3, nombre: 'Deportes',         slug: 'deportes',        color: '#e67e22' },
  { id: 4, nombre: 'Tecnología',       slug: 'tecnologia',      color: '#2980b9' },
  { id: 5, nombre: 'Internacional',    slug: 'internacional',   color: '#8e44ad' },
  { id: 6, nombre: 'Entretenimiento',  slug: 'entretenimiento', color: '#e91e63' },
  { id: 7, nombre: 'Cusco y Regiones', slug: 'cusco',           color: '#00897b' },
  { id: 8, nombre: 'Nacional',         slug: 'nacional',        color: '#f57c00' },
];

const TIPOS = ['Noticia', 'Reportaje', 'Opinión', 'Video'];

const FORM_INICIAL = {
  titulo: '', subtitulo: '', cuerpo: '', categoria_id: '',
  imagen_url: '', tags: '', fuente: '', tipo: 'Noticia', destacada: false,
};

export default function NuevaNoticiaPage({ noticiaInicial, modoEdicion = false, noticiaId }) {
  const navigate  = useNavigate();
  const usuario   = JSON.parse(localStorage.getItem('usuario') || '{}');

  const [form, setForm]         = useState(noticiaInicial || { ...FORM_INICIAL, autor: usuario?.nombre || '' });
  const [preview, setPreview]   = useState(noticiaInicial?.imagen_url || '');
  const [subiendo, setSubiendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]       = useState('');
  const [exito, setExito]       = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImagen = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imagen', file);
    setSubiendo(true);
    setError('');

    try {
      const { data } = await api.post('/upload/imagen', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(f => ({ ...f, imagen_url: data.url }));
      setPreview(data.url);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setSubiendo(false);
    }
  };

  const enviar = async (estado) => {
    if (!form.titulo.trim()) { setError('El titular es requerido'); return; }
    if (!form.cuerpo.trim()) { setError('El cuerpo es requerido'); return; }
    if (!form.categoria_id)  { setError('Selecciona una categoría'); return; }

    setGuardando(true);
    setError('');

    const payload = {
      titulo:      form.titulo.trim(),
      subtitulo:   form.subtitulo.trim() || undefined,
      cuerpo:      form.cuerpo.trim(),
      categoria_id: parseInt(form.categoria_id),
      imagen_url:  form.imagen_url || undefined,
      tags:        form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      fuente:      form.fuente.trim() || undefined,
      destacada:   form.destacada,
      estado,
    };

    try {
      if (modoEdicion) {
        await api.put(`/noticias/${noticiaId}`, payload);
        setExito('Noticia actualizada correctamente');
      } else {
        await api.post('/noticias', payload);
        setExito(estado === 'publicado' ? '✅ Noticia publicada' : '📝 Borrador guardado');
        setTimeout(() => navigate('/noticias'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la noticia');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{modoEdicion ? 'Editar noticia' : 'Nueva noticia'}</h1>
          <p className="page-subtitle">
            {modoEdicion ? 'Modifica los campos y guarda los cambios' : 'Completa el formulario para crear una noticia'}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/noticias')}>
          ← Volver
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {exito && <div className="alert alert-success">{exito}</div>}

      <div className="form-layout">
        {/* Columna principal */}
        <div className="form-main">
          {/* Titular */}
          <div className="form-group">
            <label>Titular <span className="required">*</span></label>
            <input
              type="text" name="titulo" value={form.titulo}
              onChange={handleChange} placeholder="Escribe el titular de la noticia..."
              className="input-lg"
            />
          </div>

          {/* Subtítulo */}
          <div className="form-group">
            <label>Subtítulo / Bajada</label>
            <input
              type="text" name="subtitulo" value={form.subtitulo}
              onChange={handleChange} placeholder="Resumen o complemento del titular"
            />
          </div>

          {/* Cuerpo */}
          <div className="form-group">
            <label>Cuerpo de la noticia <span className="required">*</span></label>
            <textarea
              name="cuerpo" value={form.cuerpo} onChange={handleChange}
              rows={16} placeholder="Escribe aquí el contenido completo de la noticia. Puedes usar HTML básico (<p>, <strong>, <em>, <blockquote>)..."
            />
          </div>
        </div>

        {/* Columna lateral */}
        <div className="form-sidebar">

          {/* Categoría */}
          <div className="form-group">
            <label>Categoría <span className="required">*</span></label>
            <div className="categoria-pills">
              {CATEGORIAS.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`categoria-pill ${parseInt(form.categoria_id) === cat.id ? 'selected' : ''}`}
                  style={{
                    '--cat-color': cat.color,
                    borderColor: cat.color,
                    backgroundColor: parseInt(form.categoria_id) === cat.id ? cat.color : 'transparent',
                    color: parseInt(form.categoria_id) === cat.id ? '#fff' : cat.color,
                  }}
                  onClick={() => setForm(f => ({ ...f, categoria_id: cat.id }))}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Imagen */}
          <div className="form-group">
            <label>Imagen destacada</label>
            <div className="upload-area">
              {preview ? (
                <div className="upload-preview">
                  <img src={preview} alt="Preview" />
                  <button
                    type="button"
                    className="btn-remove-img"
                    onClick={() => { setPreview(''); setForm(f => ({ ...f, imagen_url: '' })); }}
                  >✕</button>
                </div>
              ) : (
                <label className="upload-label">
                  <input type="file" accept="image/*" onChange={handleImagen} hidden />
                  <span className="upload-icon">🖼️</span>
                  <span>{subiendo ? 'Subiendo...' : 'Haz clic para subir imagen'}</span>
                  <span className="upload-hint">JPG, PNG, WebP — máx. 10MB</span>
                </label>
              )}
            </div>
          </div>

          {/* Autor */}
          <div className="form-group">
            <label>Autor</label>
            <input type="text" name="autor" value={form.autor || usuario?.nombre || ''} readOnly className="input-readonly" />
          </div>

          {/* Tipo */}
          <div className="form-group">
            <label>Tipo</label>
            <select name="tipo" value={form.tipo} onChange={handleChange}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <input
              type="text" name="tags" value={form.tags} onChange={handleChange}
              placeholder="cusco, política, elecciones (separados por coma)"
            />
          </div>

          {/* Fuente */}
          <div className="form-group">
            <label>Fuente</label>
            <input
              type="text" name="fuente" value={form.fuente} onChange={handleChange}
              placeholder="Ej: Municipalidad del Cusco"
            />
          </div>

          {/* Destacada */}
          <div className="form-group form-check">
            <label className="check-label">
              <input
                type="checkbox" name="destacada"
                checked={form.destacada} onChange={handleChange}
              />
              <span>Marcar como destacada</span>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary btn-full"
              onClick={() => enviar('borrador')}
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : '💾 Guardar borrador'}
            </button>
            <button
              type="button"
              className="btn btn-success btn-full"
              onClick={() => enviar('publicado')}
              disabled={guardando}
            >
              {guardando ? 'Publicando...' : '🚀 Publicar ahora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
