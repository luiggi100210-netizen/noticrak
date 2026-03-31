import { Navigate } from 'react-router-dom';

/**
 * Envuelve rutas protegidas.
 * Si no hay token en localStorage redirige a /login.
 * Si se pasa soloAdmin=true y el rol no es 'admin' redirige a /dashboard.
 */
export default function ProtectedRoute({ children, soloAdmin = false }) {
  const token   = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (soloAdmin && usuario?.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
