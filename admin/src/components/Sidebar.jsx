import { NavLink, useNavigate } from 'react-router-dom';

const LINKS = [
  { to: '/dashboard',       label: 'Dashboard',      icon: '📊' },
  { to: '/noticias',        label: 'Noticias',        icon: '📰' },
  { to: '/noticias/nueva',  label: 'Nueva noticia',   icon: '✏️'  },
  { to: '/videos',          label: 'Videos',          icon: '🎬' },
  { to: '/videos/nuevo',    label: 'Nuevo video',     icon: '➕' },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const usuario   = JSON.parse(localStorage.getItem('usuario') || '{}');
  const esAdmin   = usuario?.rol === 'admin';

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="logo-text">Noti<span className="logo-crack">Crack</span></span>
        <span className="logo-badge">ADMIN</span>
      </div>

      {/* Usuario */}
      <div className="sidebar-user">
        <div className="user-avatar">{usuario?.nombre?.[0]?.toUpperCase() || 'U'}</div>
        <div>
          <div className="user-name">{usuario?.nombre || 'Usuario'}</div>
          <div className="user-rol">{usuario?.rol || 'periodista'}</div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
        {LINKS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}

        {esAdmin && (
          <>
            <NavLink
              to="/usuarios"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">👥</span>
              Usuarios
            </NavLink>
            <NavLink
              to="/radio"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">📻</span>
              Radio
            </NavLink>
            <NavLink
              to="/redes"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">📲</span>
              Redes Sociales
            </NavLink>
          </>
        )}
      </nav>

      {/* Cerrar sesión */}
      <button className="btn-logout" onClick={cerrarSesion}>
        <span>🚪</span> Cerrar sesión
      </button>
    </aside>
  );
}
