import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function RadioPage() {
  const [activo,      setActivo]      = useState(false);
  const [streamUrl,   setStreamUrl]   = useState('');
  const [nombre,      setNombre]      = useState('NotiCrack Radio');
  const [cargando,    setCargando]    = useState(true);
  const [guardando,   setGuardando]   = useState(false);
  const [mensaje,     setMensaje]     = useState('');
  const [error,       setError]       = useState('');

  useEffect(() => {
    api.get('/radio/estado')
      .then(({ data }) => {
        const c = data.data;
        setActivo(c.activo);
        setStreamUrl(c.stream_url || '');
        setNombre(c.nombre || 'NotiCrack Radio');
      })
      .catch(() => setError('No se pudo cargar la configuración'))
      .finally(() => setCargando(false));
  }, []);

  const guardar = async () => {
    setGuardando(true);
    setMensaje('');
    setError('');
    try {
      await api.put('/radio/estado', {
        activo,
        stream_url:  streamUrl || '',
        nombre:      nombre || 'NotiCrack Radio',
        descripcion: 'Noticias & Talk',
      });
      setMensaje('✅ Configuración guardada');
    } catch {
      setError('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="page">
        <div className="page-header"><h1 className="page-title">Radio</h1></div>
        <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📻 Radio en Vivo</h1>
          <p className="page-subtitle">
            Activa la radio cuando esté lista. El bloque aparecerá o desaparecerá en el sitio web automáticamente.
          </p>
        </div>
      </div>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* Toggle estado */}
      <div className="card" style={{ maxWidth: 520, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Estado de la radio</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {activo
                ? 'La radio está ACTIVA — los usuarios ven el player'
                : 'La radio está INACTIVA — los usuarios no ven el player'}
            </p>
          </div>

          <button
            onClick={() => { setActivo(v => !v); setMensaje(''); }}
            style={{
              position: 'relative',
              width: 56, height: 30,
              borderRadius: 15, border: 'none', cursor: 'pointer',
              backgroundColor: activo ? '#10b981' : '#cbd5e1',
              transition: 'background-color 0.2s',
              flexShrink: 0,
            }}
            aria-label={activo ? 'Desactivar radio' : 'Activar radio'}
          >
            <span style={{
              position: 'absolute', top: 3,
              left: activo ? 29 : 3,
              width: 24, height: 24, borderRadius: '50%',
              backgroundColor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,.25)',
              transition: 'left 0.2s',
            }} />
          </button>
        </div>

        {/* Indicador ONLINE / OFFLINE */}
        <div style={{
          marginTop: '1.25rem', padding: '0.75rem 1rem', borderRadius: 8,
          backgroundColor: activo ? '#d1fae5' : '#f1f5f9',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
        }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
            backgroundColor: activo ? '#10b981' : '#94a3b8',
            animation: activo ? 'pulse 1.5s infinite' : 'none',
          }} />
          <span style={{ fontWeight: 600, fontSize: 13, color: activo ? '#065f46' : '#475569' }}>
            {activo ? 'ONLINE' : 'OFFLINE'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
            {nombre}
          </span>
        </div>
      </div>

      {/* Nombre de la radio */}
      <div className="card" style={{ maxWidth: 520, marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Nombre de la emisora</h2>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="NotiCrack Radio"
          style={{
            width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6,
            border: '1px solid var(--border)', fontSize: 13, outline: 'none',
          }}
        />
      </div>

      {/* URL del stream */}
      <div className="card" style={{ maxWidth: 520, marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>URL del stream de audio</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>
          URL del servidor de streaming (Icecast, SHOUTcast, etc.). Déjalo vacío si aún no tienes.
        </p>
        <input
          type="url"
          value={streamUrl}
          onChange={e => setStreamUrl(e.target.value)}
          placeholder="https://stream.ejemplo.com/noticrack"
          style={{
            width: '100%', padding: '0.6rem 0.75rem', borderRadius: 6,
            border: '1px solid var(--border)', fontSize: 13, outline: 'none',
          }}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={guardar}
        disabled={guardando}
        style={{ minWidth: 160 }}
      >
        {guardando ? 'Guardando...' : '💾 Guardar cambios'}
      </button>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
