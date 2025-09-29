import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';

// ✅ Zod schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ✅ Infer TS type from schema
type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      console.log('Attempting login...', data);

      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      console.log('Login response status:', response.status);

      const result = await response.json();
      console.log('Login response data:', result);

      if (response.ok && result.success) {
        toast.success('Login successful!');
        console.log('User data:', result.user);
        
        // Store user data in localStorage or context if needed
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // Handle specific error messages
        if (result.message?.includes('Invalid email or password')) {
          toast.error('Invalid email or password. Please try again.');
        } else if (result.message?.includes('deactivated')) {
          toast.error('Account is deactivated. Please contact support.');
        } else {
          toast.error(result.message || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Test backend connection (optional)
  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/auth/me', {
        credentials: 'include',
      });
      console.log('Backend connection test:', response.status);
    } catch (error) {
      console.error('Backend connection failed:', error);
    }
  };

  // Test connection on component mount (optional)
  React.useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="mt-2 text-slate-600">Sign in to your EduCamp account</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your password"
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

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-slate-700"
                  >
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                <strong>Demo:</strong> Use the credentials from your registered account
              </p>
            </div>

            {/* Signup Link */}
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-emerald-600 hover:text-emerald-500 font-medium"
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
  );
};

export default Login;