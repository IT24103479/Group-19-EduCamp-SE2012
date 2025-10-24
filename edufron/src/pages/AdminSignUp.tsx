import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Validation schema (matches backend AdminRegistrationDto)
const adminSignUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  adminLevel: z.string().min(1, 'Admin level is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/, 
      'Password must include uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type AdminSignUpFormData = z.infer<typeof adminSignUpSchema>;

const AdminSignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<AdminSignUpFormData>({
    resolver: zodResolver(adminSignUpSchema),
  });

  // Auto-login helper
  const autoLogin = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();
      console.log('Auto-login response:', result);

      if (res.ok && result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('isAuthenticated', 'true');
        toast.success('Welcome to EduCamp Admin!');
        
        return true;
      } else {
        toast.error(result.message || 'Auto-login failed.');
        return false;
      }
    } catch (err) {
      console.error('Auto-login error:', err);
      toast.error('Could not reach the server.');
      return false;
    }
  };
  // Admin Registration submit
  const onSubmit = async (data: AdminSignUpFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        adminLevel: data.adminLevel,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      console.log('Registering admin...', payload);

      const response = await fetch('http://localhost:8081/api/auth/register/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Admin registration response:', result);

      if (response.ok && result.success) {
        toast.success('Admin account created successfully! Logging you in...');
        const success = await autoLogin(data.email, data.password);

        if (!success) {
          toast.info('Please login manually.');
          navigate('/login');
        }
      } else {
        if (result.message?.includes('already registered')) {
          toast.error('This email is already registered. Try logging in.');
        } else if (result.errors) {
          Object.values(result.errors).forEach((msg: any) => toast.error(msg));
        } else {
          toast.error(result.message || 'Admin registration failed. Try again.');
        }
      }
    } catch (err) {
      console.error('Admin registration error:', err);
      toast.error('Server unreachable or network error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Create Admin Account</h2>
            <p className="mt-2 text-slate-600">Join EduCamp as an administrator</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input {...register('firstName')} type="text"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="First name" />
                  </div>
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input {...register('lastName')} type="text"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Last name" />
                  </div>
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input {...register('email')} type="email"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter your email" />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              {/* Admin Level */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Admin Level *</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select {...register('adminLevel')}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select Admin Level</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="SUPPORT">Support</option>
                  </select>
                </div>
                {errors.adminLevel && <p className="mt-1 text-sm text-red-600">{errors.adminLevel.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Create a password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Confirm your password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> An admin account will be created with full administrative privileges.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {isLoading ? 'Creating Admin Account...' : 'Create Admin Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-600 hover:text-emerald-500 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-slate-600 text-sm">
                Need a different account type?{' '}
                <Link to="/register/student" className="text-emerald-600 hover:text-emerald-500 font-medium">
                  Register as Student
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

export default AdminSignUp;