import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '@/redux/slices/authSlice';
import { RootState } from '@/redux/store';
import { useCreateUserMutation } from '@/redux/lib/authApi';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [createUser] = useCreateUserMutation();
  const loading = useSelector((state: RootState) => state.auth.loading);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false,
  });
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one capital letter.');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character.');
    }
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long.');
    }
    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (name === 'password') {
      setPasswordErrors(validatePassword(value));
    }
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData({
      ...formData,
      phone: value || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordErrors([]);

    const passwordValidationErrors = validatePassword(formData.password);
    if (passwordValidationErrors.length > 0) {
      setPasswordErrors(passwordValidationErrors);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      console.log('New user:', user);

      await sendEmailVerification(user);
      setVerificationEmail(formData.email);
      setShowVerificationDialog(true);
      setIsResendDisabled(true);
      setResendCountdown(60);
    } catch (err: any) {
      console.error('Signup error:', err);
      const errorMessage = mapFirebaseError(err.code || err.message);
      setError(errorMessage);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let intervalId: NodeJS.Timeout | undefined;
    let countdownInterval: NodeJS.Timeout | undefined;

    if (showVerificationDialog) {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          intervalId = setInterval(async () => {
            try {
              await currentUser.reload();
              if (currentUser.emailVerified) {
                console.log('Email is verified');
                try {
                  const token = await currentUser.getIdToken();
                  await createUser({
                    email: formData.email,
                    password: formData.password,
                    confirm_password: formData.confirmPassword,
                    phone_number: formData.phone || undefined,
                    googleId: currentUser.uid || undefined,
                  }).unwrap();

                  dispatch(setCredentials({ token, userId: currentUser.uid }));
                  console.log('User created in backend: Signup successful');
                  setShowVerificationDialog(false);
                  navigate('/image-processor');
                  if (intervalId) {
                    clearInterval(intervalId);
                  }
                } catch (err: any) {
                  console.error('Backend user creation error:', err);
                  setError('Failed to create user in backend. Please try again.');
                }
              } else {
                console.log('Email is NOT verified');
              }
            } catch (err: any) {
              console.error('Error checking verification status:', err);
              setError('Error checking email verification. Please try again.');
            }
          }, 1000);
        }
      });

      if (isResendDisabled) {
        countdownInterval = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              setIsResendDisabled(false);
              clearInterval(countdownInterval!);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [showVerificationDialog, dispatch, navigate, createUser, formData.email, formData.password, formData.confirmPassword, formData.phone, isResendDisabled]);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      const token = await user.getIdToken();
      console.log('Google user:', user);

      await createUser({
        email: user.email || '',
        password: 'google-managed',
        confirm_password: 'google-managed',
        name: user.displayName || undefined,
        phone_number: formData.phone || undefined,
        googleId: user.uid || undefined,
      }).unwrap();

      dispatch(setCredentials({ token, userId: user.uid }));
      console.log('User created in backend: Google sign-in successful');
      navigate('/image-processor');
    } catch (error: any) {
      console.error('Google signup error:', error);
      setError(mapFirebaseError(error.code || error.message));
    }
  };

  const mapFirebaseError = (code: string): string => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'auth/invalid-api-key':
        return 'Authentication service is unavailable. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-up was cancelled.';
      case 'Email already in use':
        return 'This email is already registered.';
      default:
        return 'Signup failed. Please try again.';
    }
  };

  const handleResendVerification = async () => {
    console.log('Resending verification email to:', auth.currentUser);
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setError('Verification email resent. Please check your inbox.');
        setIsResendDisabled(true);
        setResendCountdown(60);
      } catch (err: any) {
        console.error('Resend verification error:', err);
        setError('Failed to resend verification email. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Create Your Account
        </h2>
        <p className="text-center text-sm text-gray-500">
          Start processing images with AI technology
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {passwordErrors.length > 0 && (
          <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm">
            <ul className="list-disc pl-5">
              {passwordErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full max-w-[280px] py-2 px-4 bg-white text-gray-700 font-semibold border border-gray-300 rounded-md hover:bg-gray-100 disabled:bg-gray-200 flex items-center justify-center"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Sign up with Google
          </button>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="px-3 text-sm text-gray-500">or sign up with email</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

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
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <PhoneInput
              international
              defaultCountry="IN"
              value={formData.phone}
              onChange={handlePhoneChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required
            />
            <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
              I agree to the{' '}
              <Link to="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </p>
      </div>

      {showVerificationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Verify Your Email
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please verify your email. A verification email has been sent to <strong>{verificationEmail}</strong>.
            </p>
            <div className="flex justify-between">
              <button
                onClick={handleResendVerification}
                disabled={isResendDisabled}
                className="py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 transition disabled:bg-gray-300 disabled:text-gray-500"
              >
                {isResendDisabled ? `Resend Email (${resendCountdown}s)` : 'Resend Email'}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;