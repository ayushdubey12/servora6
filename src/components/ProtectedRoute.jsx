import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based gating. When `roles` is provided, only those roles may enter.
  if (roles && roles.length > 0 && user?.role && !roles.includes(user.role)) {
    // Send each role to the area it belongs to.
    const home =
      user.role === 'chef' ? '/kitchen'
      : user.role === 'waiter' ? '/staff'
      : '/dashboard';
    return <Navigate to={home} replace />;
  }

  return children;
}
