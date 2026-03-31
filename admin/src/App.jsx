import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

import LoginPage        from './pages/LoginPage';
import DashboardPage    from './pages/DashboardPage';
import NoticiasPage     from './pages/NoticiasPage';
import NuevaNoticiaPage from './pages/NuevaNoticiaPage';
import EditarNoticiaPage from './pages/EditarNoticiaPage';
import VideosPage       from './pages/VideosPage';
import NuevoVideoPage   from './pages/NuevoVideoPage';
import UsuariosPage     from './pages/UsuariosPage';

/** Layout con sidebar para rutas protegidas */
function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

function PrivatePage({ children, soloAdmin = false }) {
  return (
    <ProtectedRoute soloAdmin={soloAdmin}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  const token = localStorage.getItem('token');

  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={
        token ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />

      {/* Protegidas */}
      <Route path="/dashboard"          element={<PrivatePage><DashboardPage /></PrivatePage>} />
      <Route path="/noticias"           element={<PrivatePage><NoticiasPage /></PrivatePage>} />
      <Route path="/noticias/nueva"     element={<PrivatePage><NuevaNoticiaPage /></PrivatePage>} />
      <Route path="/noticias/editar/:id" element={<PrivatePage><EditarNoticiaPage /></PrivatePage>} />
      <Route path="/videos"             element={<PrivatePage><VideosPage /></PrivatePage>} />
      <Route path="/videos/nuevo"       element={<PrivatePage><NuevoVideoPage /></PrivatePage>} />
      <Route path="/usuarios"           element={<PrivatePage soloAdmin><UsuariosPage /></PrivatePage>} />

      {/* Raíz → dashboard o login */}
      <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
