import { useState, useEffect } from 'react';
import api from '../lib/api';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  useEffect(() => {
    const cargar = async () => {
      try {
        const [pubRes, borRes, vidRes, catRes] = await Promise.all([
          api.get('/noticias', { params: { estado: 'publicado', limite: 1 } }),
          api.get('/noticias/admin/todas', { params: { estado: 'borrador',   limite: 1 } })
            .catch(() => api.get('/noticias', { params: { estado: 'borrador', limite: 1 } })),
          api.get('/videos', { params: { limite: 1 } }),
          api.get('/categorias'),
        ]);

        // Categoría con más noticias: aproximación con la lista de noticias recientes
        const noticias20 = await api.get('/noticias', { params: { estado: 'publicado', limite: 50 } });
        const conteo = {};
        noticias20.data.noticias?.forEach(n => {
          const cat = n.categoria_nombre || 'Sin categoría';
          conteo[cat] = (conteo[cat] || 0) + 1;
        });
        const topCat = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0];

        setStats({
          publicadas:  pubRes.data.total  ?? 0,
          borradores:  borRes.data.total  ?? 0,
          videos:      vidRes.data.total  ?? 0,
          categorias:  catRes.data.length ?? 0,
          topCategoria: topCat ? `${topCat[0]} (${topCat[1]})` : '—',
        });
      } catch (err) {
        setError('No se pudieron cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Bienvenido, {usuario?.nombre} 👋</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-grid">
          {[1,2,3,4].map(i => <div key={i} className="stat-card skeleton" />)}
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard icon="📰" label="Noticias publicadas" value={stats?.publicadas}  color="#3b82f6" />
            <StatCard icon="📝" label="Borradores"          value={stats?.borradores}  color="#f59e0b" />
            <StatCard icon="🎬" label="Videos"              value={stats?.videos}      color="#8b5cf6" />
            <StatCard icon="🏷️" label="Categorías activas"  value={stats?.categorias}  color="#10b981" />
          </div>

          <div className="dashboard-section">
            <h2 className="section-title">Resumen rápido</h2>
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">📈 Categoría con más contenido</span>
                <span className="info-value">{stats?.topCategoria}</span>
              </div>
              <div className="info-row">
                <span className="info-label">👤 Tu rol</span>
                <span className={`badge badge-${usuario?.rol}`}>{usuario?.rol}</span>
              </div>
              <div className="info-row">
                <span className="info-label">🕐 Última actualización</span>
                <span className="info-value">{new Date().toLocaleString('es-PE')}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
