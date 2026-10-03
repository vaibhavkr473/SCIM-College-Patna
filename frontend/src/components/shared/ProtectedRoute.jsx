import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <LoadingSpinner message="Checking your session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile && !allowedRoles.includes(profile.role)) {
    if (profile.role === 'admin' || profile.role === 'co_member') return <Navigate to="/admin" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
}
