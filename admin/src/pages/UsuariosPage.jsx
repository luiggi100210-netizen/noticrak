import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function UsuariosPage() {
  const [usuarios, setUsuarios]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [exito, setExito]         = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'periodista' });
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/usuarios');
      setUsuarios(data);
    } catch {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.password) {
      setError('Todos los campos son requeridos');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await api.post('/auth/register', form);
      setExito(`✅ Usuario ${form.email} creado correctamente`);
      setForm({ nombre: '', email: '', password: '', rol: 'periodista' });
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el usuario');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">{usuarios.length} usuarios registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setMostrarForm(!mostrarForm); setError(''); setExito(''); }}>
          {mostrarForm ? '✕ Cancelar' : '+ Nuevo periodista'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {exito && <div className="alert alert-success">{exito}</div>}

      {/* Formulario nuevo usuario */}
      {mostrarForm && (
        <form onSubmit={handleSubmit} className="form-card form-card-sm">
          <h3 className="form-card-title">Crear nuevo usuario</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre completo <span className="required">*</span></label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Juan Pérez" />
            </div>
            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="juan@noticrack.pe" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Contraseña <span className="required">*</span></label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Mínimo 8 caracteres" />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select name="rol" value={form.rol} onChange={handleChange}>
                <option value="periodista">Periodista</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-success" disabled={guardando}>
            {guardando ? 'Creando...' : '✅ Crear usuario'}
          </button>
        </form>
      )}

      {/* Tabla de usuarios */}
      {loading ? (
        <div className="table-skeleton">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton row-skeleton" />)}
        </div>
      ) : usuarios.length === 0 ? (
        <div className="empty-state"><span>👥</span><p>No hay usuarios registrados</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="user-row">
                      <div className="user-avatar-sm">{u.nombre?.[0]?.toUpperCase()}</div>
                      {u.nombre}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.rol}`}>{u.rol}</span></td>
                  <td>
                    <span className={`badge ${u.activo ? 'badge-publicado' : 'badge-borrador'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="col-fecha">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('es-PE') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
