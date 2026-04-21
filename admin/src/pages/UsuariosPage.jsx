import { useState, useEffect } from 'react';
import api from '../lib/api';

const FORM_INICIAL = { nombre: '', email: '', password: '', rol: 'periodista' };

export default function UsuariosPage() {
  const [usuarios, setUsuarios]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [exito, setExito]         = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm]           = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  // Modales de editar y eliminar
  const [editando, setEditando]   = useState(null); // usuario seleccionado
  const [eliminando, setEliminando] = useState(null);

  // Usuario logueado — evita que se borre/edite a sí mismo desde la UI
  const yo = JSON.parse(localStorage.getItem('usuario') || '{}');

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

  const limpiarMensajes = () => { setError(''); setExito(''); };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    limpiarMensajes();
    if (!form.nombre || !form.email || !form.password) {
      setError('Todos los campos son requeridos');
      return;
    }
    setGuardando(true);
    try {
      await api.post('/auth/register', form);
      setExito(`✅ Usuario ${form.email} creado correctamente`);
      setForm(FORM_INICIAL);
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
        <button className="btn btn-primary" onClick={() => { setMostrarForm(!mostrarForm); limpiarMensajes(); }}>
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
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="juan@noticrack.com" />
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
                <th>Noticias</th>
                <th>Registro</th>
                <th style={{ width: 140 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => {
                const esYo = u.id === yo.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="user-row">
                        <div className="user-avatar-sm">{u.nombre?.[0]?.toUpperCase()}</div>
                        {u.nombre}
                        {esYo && <span className="badge badge-borrador" style={{ marginLeft: 8 }}>Tú</span>}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.rol}`}>{u.rol}</span></td>
                    <td>
                      <span className={`badge ${u.activo ? 'badge-publicado' : 'badge-borrador'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{u.noticias_count ?? 0}</td>
                    <td className="col-fecha">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('es-PE') : '—'}
                    </td>
                    <td>
                      <div className="acciones-row">
                        <button
                          className="btn-icon"
                          title="Editar"
                          onClick={() => { limpiarMensajes(); setEditando({ ...u, password: '' }); }}
                        >✏️</button>
                        <button
                          className="btn-icon btn-icon-danger"
                          title={esYo ? 'No puedes eliminarte a ti mismo' : 'Eliminar'}
                          disabled={esYo}
                          onClick={() => { limpiarMensajes(); setEliminando(u); }}
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal editar */}
      {editando && (
        <ModalEditar
          usuario={editando}
          esYo={editando.id === yo.id}
          onCancelar={() => setEditando(null)}
          onGuardado={(msg) => { setExito(msg); setEditando(null); cargar(); }}
          onError={(msg) => setError(msg)}
        />
      )}

      {/* Modal eliminar */}
      {eliminando && (
        <ModalEliminar
          usuario={eliminando}
          onCancelar={() => setEliminando(null)}
          onEliminado={(msg) => { setExito(msg); setEliminando(null); cargar(); }}
          onError={(msg) => setError(msg)}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Modal de editar usuario
// ════════════════════════════════════════════════════════════════════════════
function ModalEditar({ usuario, esYo, onCancelar, onGuardado, onError }) {
  const [form, setForm] = useState({
    nombre:   usuario.nombre || '',
    email:    usuario.email || '',
    rol:      usuario.rol || 'periodista',
    activo:   !!usuario.activo,
    password: '',
  });
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim()) {
      onError('Nombre y email son requeridos');
      return;
    }
    if (form.password && form.password.length < 8) {
      onError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setGuardando(true);
    try {
      const payload = { nombre: form.nombre, email: form.email, rol: form.rol, activo: form.activo };
      if (form.password) payload.password = form.password;
      await api.put(`/auth/usuarios/${usuario.id}`, payload);
      onGuardado(`✅ Usuario ${form.email} actualizado`);
    } catch (err) {
      onError(err.response?.data?.error || 'Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancelar}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Editar usuario</h3>
          <button className="btn-icon" onClick={onCancelar}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre completo</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Rol</label>
              <select name="rol" value={form.rol} onChange={handleChange} disabled={esYo}>
                <option value="periodista">Periodista</option>
                <option value="admin">Admin</option>
              </select>
              {esYo && <small style={{ color: '#888' }}>No puedes cambiar tu propio rol</small>}
            </div>
            <div className="form-group">
              <label>&nbsp;</label>
              <label className="checkbox-label">
                <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} disabled={esYo} />
                <span>Activo</span>
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Nueva contraseña (opcional)</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Dejar vacío para no cambiar"
              autoComplete="new-password"
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Modal de confirmación de eliminación
// ════════════════════════════════════════════════════════════════════════════
function ModalEliminar({ usuario, onCancelar, onEliminado, onError }) {
  const [borrando, setBorrando] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');

  const textoRequerido = 'ELIMINAR';
  const puedeEliminar = confirmacion === textoRequerido;

  const handleEliminar = async () => {
    if (!puedeEliminar) return;
    setBorrando(true);
    try {
      const { data } = await api.delete(`/auth/usuarios/${usuario.id}`);
      onEliminado(data?.mensaje || `✅ Usuario ${usuario.email} eliminado`);
    } catch (err) {
      onError(err.response?.data?.error || 'Error al eliminar el usuario');
    } finally {
      setBorrando(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancelar}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⚠️ Eliminar usuario</h3>
          <button className="btn-icon" onClick={onCancelar}>✕</button>
        </div>
        <div className="modal-body">
          <p>Estás por eliminar a <strong>{usuario.nombre}</strong> ({usuario.email}).</p>
          {usuario.noticias_count > 0 && (
            <div className="alert alert-error" style={{ margin: '12px 0' }}>
              <strong>Este usuario tiene {usuario.noticias_count} noticia{usuario.noticias_count === 1 ? '' : 's'} publicada{usuario.noticias_count === 1 ? '' : 's'}.</strong>
              <br />
              Al eliminarlo, esas noticias quedarán <strong>sin autor asignado</strong> pero NO se borrarán.
            </div>
          )}
          <p style={{ marginTop: 12 }}>Esta acción <strong>no se puede deshacer</strong>.</p>
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Para confirmar, escribe <code>{textoRequerido}</code>:</label>
            <input
              type="text"
              value={confirmacion}
              onChange={e => setConfirmacion(e.target.value)}
              placeholder={textoRequerido}
              autoFocus
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
          <button
            className="btn btn-danger"
            onClick={handleEliminar}
            disabled={!puedeEliminar || borrando}
          >
            {borrando ? 'Eliminando...' : '🗑️ Eliminar definitivamente'}
          </button>
        </div>
      </div>
    </div>
  );
}
