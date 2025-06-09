// src/components/AuthProvider.tsx
import { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { setCredentials, clearCredentials, setLoading } from '@/redux/slices/authSlice';
import { RootState } from '@/redux/store';
import { persistor } from '@/redux/store';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
  dispatch(setLoading(true));

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        await user.reload(); // Refresh user data
        if (user.emailVerified) {
          // Only set credentials and redirect if email is verified
          const token = await user.getIdToken();
          dispatch(setCredentials({ token, userId: user.uid }));
          if (!isAuthenticated) {
            navigate('/image-processor');
          }
        } else {
          // If email is not verified, do not set credentials or redirect
          console.log('User authenticated but email not verified');
          dispatch(clearCredentials());
          if (isAuthenticated) {
            await persistor.purge(); // Clear Redux state if previously authenticated
            navigate('/login');
          }
        }
      } else {
        // No user is signed in
        dispatch(clearCredentials());
        if (isAuthenticated) {
          await persistor.purge(); // Clear Redux state
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Auth state error:', error);
      dispatch(clearCredentials());
      navigate('/login');
    } finally {
      dispatch(setLoading(false)); // Always set loading to false
    }
  });

  return () => unsubscribe();
}, [dispatch, navigate, isAuthenticated]);

  return <>{children}</>;
};