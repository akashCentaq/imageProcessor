// src/RootRedirect.tsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const RootRedirect = () => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  if (process.env.NODE_ENV === 'development') {
    console.log('RootRedirect rendering:', { isAuthenticated, loading });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/image-processor" replace /> : <Navigate to="/login" replace />;
};

export default RootRedirect;