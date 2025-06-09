import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '@/redux/slices/authSlice';
import { RootState } from '@/redux/store';
import { useCreateUserMutation, useResetPasswordMutation } from '@/redux/lib/authApi';
import toast, { Toaster } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [createUser] = useCreateUserMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [dialogEmail, setDialogEmail] = useState('');
  const [dialogPhone, setDialogPhone] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/image-processor');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await auth.setPersistence(
        formData.rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();
      dispatch(setCredentials({ token, userId: user.uid }));
      navigate('/image-processor');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = mapFirebaseError(err.code || err.message);
      setError(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const token = await user.getIdToken();
      console.log('Google user:', user.uid);

      await createUser({
        email: user.email || '',
        password: 'google-managed',
        confirm_password: 'google-managed',
        name: user.displayName || undefined,
        googleId: user.uid || undefined,
      }).unwrap();

      dispatch(setCredentials({ token, userId: user.uid }));
      navigate('/image-processor');
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(mapFirebaseError(error.code || error.message));
    }
  };

  const handleForgotPasswordClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowForgotPasswordDialog(true);
  };

  const handleSendResetEmail = async () => {
    if (!dialogEmail) {
      setError('Please enter an email address.');
      return;
    }

    const promise = resetPassword({ email: dialogEmail }).unwrap();

    toast.promise(
      promise,
      {
        loading: 'Sending reset email...',
        success: <b>Reset email sent!</b>,
        error: (err: any) => {
          const message = err?.data?.message || mapFirebaseError(err?.code || err?.message || 'Failed to send reset email');
          setError(message);
          return <b>{message}</b>;
        },
      }
    );

    try {
      await promise;
      setShowForgotPasswordDialog(false);
      setDialogEmail('');
      setDialogPhone('');
    } catch (err) {
      // Error handled inside toast
    }
  };

  const handleSendOTP = () => {
    if (!dialogPhone) {
      setError('Please enter a phone number.');
      return;
    }
    console.log('Sending OTP to:', dialogPhone);
    setError('OTP functionality not implemented yet.');
    setShowForgotPasswordDialog(false);
    setDialogEmail('');
    setDialogPhone('');
  };

  const mapFirebaseError = (code: string): string => {
    switch (code) {
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/invalid-api-key':
        return 'Authentication service is unavailable. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled.';
      case 'Email already in use':
        return 'This email is already registered.';
      default:
        return 'Login failed. Please try again.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <Toaster />
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Welcome to AI WORLD
        </h2>
        <p className="text-center text-sm text-gray-500">
          Log in to your ImageProcessor account
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <a
                href="#"
                onClick={handleForgotPasswordClick}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full max-w-[280px] py-2 px-4 bg-white text-gray-700 font-semibold border border-gray-300 rounded-md hover:bg-gray-100 disabled:bg-gray-200 flex items-center justify-center"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5villemr-2"
            />
            Sign in with Google
          </button>
        </div>

        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>

      {showForgotPasswordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Reset Password</h3>
            <p className="text-sm text-gray-600">Choose how to reset your password:</p>

            <div>
              <label htmlFor="dialogEmail" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="dialogEmail"
                value={dialogEmail}
                onChange={(e) => setDialogEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="dialogPhone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="dialogPhone"
                value={dialogPhone}
                onChange={(e) => setDialogPhone(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="flex justify-between space-x-2">
              <Button
                onClick={handleSendResetEmail}
                disabled={isResetting}
              >
                Send Reset Email
              </Button>
              <Button
                onClick={handleSendOTP}
              >
                Send OTP to Phone
              </Button>
            </div>

            <button
              onClick={() => {
                setShowForgotPasswordDialog(false);
                setDialogEmail('');
                setDialogPhone('');
                setError('');
              }}
              className="w-full py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;