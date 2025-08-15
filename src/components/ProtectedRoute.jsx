import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de ruta protegida que verifica que el usuario esté
 * autenticado y tenga uno de los roles permitidos. Si no cumple
 * alguna de las condiciones, redirige al usuario a la página de login
 * o al dashboard correspondiente a su rol.
 */
export default function ProtectedRoute({ roles, children }) {
  const { token, user } = useAuth();
  const location = useLocation();

  // Si no hay token o usuario, redirigir al login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // Si el rol del usuario no está permitido, redirigir al dashboard propio
  if (roles && !roles.includes(user.role)) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/usuario';
    return <Navigate to={redirectPath} replace />;
  }
  return children;
}