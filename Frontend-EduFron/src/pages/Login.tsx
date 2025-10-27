import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_BASE } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

// ✅ Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // ✅ Main login function
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      console.log('Attempting login...', data);

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookie-based sessions
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      console.log('Login response:', result);

      if (response.ok && result.success) {
        toast.success('Login successful!');
        
        // Update the AuthContext with the user data
        if (result.user) {
          setUser(result.user);
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('sessionId', result.sessionId);
        }

        // ✅ Redirect user based on role
        const role = result.user?.role?.toUpperCase();
        console.log('User role detected:', role);
        console.log('About to navigate based on role...');
        
        switch (role) {
          case 'STUDENT':
            console.log('Navigating to /dashboard for STUDENT');
            navigate('/dashboard');
            break;
          case 'TEACHER':
            console.log('Navigating to /teacher-dashboard for TEACHER');
            navigate('/teacher-dashboard');
            break;
          case 'ADMIN':
            console.log('Navigating to /admin/dashboard for ADMIN');
            navigate('/admin/dashboard');
            break;
          default:
            console.log('No specific role match, navigating to /dashboard');
            navigate('/dashboard');
        }
      } else {
        // Handle backend validation or session errors
        console.error('Login failed with response:', result);
        
        if (result.message?.includes('Invalid email or password')) {
          toast.error('Invalid email or password. Please check your credentials and try again.');
        } else if (result.message?.includes('deactivated')) {
          toast.error('Your account has been deactivated. Contact support.');
        } else if (result.message?.includes('not found') || result.message?.includes('does not exist')) {
          toast.error('No account found with this email. Please register first or check your email address.');
        } else {
          toast.error(result.message || 'Login failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Cannot connect to server. Please check if the backend is running.');
        console.error('Backend URL being used:', API_BASE);
      } else if (error.name === 'SyntaxError') {
        toast.error('Invalid response from server. Please try again.');
      } else {
        toast.error('Unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  //  Optional: test backend session endpoint
  const testBackendConnection = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include',
      });
      console.log('Backend /me test:', res.status);
       console.log('Document cookies:', document.cookie);
    } catch (err) {
      console.error('Backend connection failed:', err);
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <>
      <style>{`
        /* Login form specific watermark removal */
        .login-form input:-webkit-autofill,
        .login-form input:-webkit-autofill:hover,
        .login-form input:-webkit-autofill:focus,
        .login-form input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          -webkit-text-fill-color: #213547 !important;
          background-color: white !important;
          background-image: none !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
        
        .login-form input {
          background-color: white !important;
          background-image: none !important;
          -webkit-appearance: none !important;
          appearance: none !important;
        }
        
        .login-form input:focus {
          background-color: white !important;
          background-image: none !important;
        }
        
        .login-form input::placeholder {
          color: #64748b !important;
          opacity: 0.7 !important;
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
        <Header />

      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="mt-2 text-slate-600">Sign in to your EduCamp account</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 login-form">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter your email"
                  style={{
                    backgroundColor: 'white !important',
                    backgroundImage: 'none !important',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: '0 0',
                    backgroundSize: 'auto',
                    backgroundAttachment: 'scroll',
                    WebkitBoxShadow: '0 0 0 1000px white inset !important',
                    WebkitTextFillColor: '#213547 !important',
                    transition: 'background-color 5000s ease-in-out 0s'
                  }}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full px-4 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your password"
                    style={{
                      backgroundColor: 'white !important',
                      backgroundImage: 'none !important',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: '0 0',
                      backgroundSize: 'auto',
                      backgroundAttachment: 'scroll',
                      WebkitBoxShadow: '0 0 0 1000px white inset !important',
                      WebkitTextFillColor: '#213547 !important',
                      transition: 'background-color 5000s ease-in-out 0s'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me / Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-emerald-600 hover:text-emerald-500"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Hint */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Use your registered credentials to log in.
              </p>
            </div>

            {/* Signup Link */}
            <div className="mt-6 text-center" style={{ zIndex: 10, position: 'relative' }}>
              <p className="text-slate-600" style={{ marginBottom: '0.5rem' }}>
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-emerald-600 hover:text-emerald-500 font-medium"
                  style={{ 
                    textDecoration: 'underline',
                    display: 'inline-block',
                    padding: '2px 4px'
                  }}
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
};

export default Login;