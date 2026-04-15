import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingState from '../common/LoadingState';
import { useAuth } from '../../hooks/useAuth';

function ProtectedRoute() {
  const { hydrated, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!hydrated) {
    return <LoadingState label="Restoring your secure session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;