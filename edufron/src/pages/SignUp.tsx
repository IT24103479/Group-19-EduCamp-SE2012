import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';

// ✅ Updated validation schema to match backend RegistrationDto
const signUpSchema = z
  .object({
    firstName: z.string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters'),
    lastName: z.string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ✅ Infer TypeScript type from schema
type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const autoLogin = async (email: string, password: string) => {
    try {
      console.log('Attempting auto-login...');
      
      const loginResponse = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const loginResult = await loginResponse.json();
      console.log('Auto-login response:', loginResult);

      if (loginResponse.ok && loginResult.success) {
        // Store user data
        if (loginResult.user) {
          localStorage.setItem('user', JSON.stringify(loginResult.user));
          localStorage.setItem('isAuthenticated', 'true');
        }
        
        toast.success('Welcome to EduCamp! Account created and logged in successfully.');
        navigate('/dashboard');
        return true;
      } else {
        console.warn('Auto-login failed:', loginResult.message);
        return false;
      }
    } catch (loginError) {
      console.error('Auto-login error:', loginError);
      return false;
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      // ✅ Prepare data exactly as your Spring Boot RegistrationDto expects
      const registrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      console.log('Sending registration request...', registrationData);

      // ✅ Registration API call
      const response = await fetch('http://localhost:8081/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();
      console.log('Registration response:', result);

      if (response.ok && result.success) {
        toast.success('Account created successfully! Logging you in...');
        
        // ✅ Auto-login after successful registration
        const loginSuccess = await autoLogin(data.email, data.password);
        
        if (!loginSuccess) {
          // If auto-login fails, redirect to login page
          toast.info('Account created! Please login with your credentials.');
          navigate('/login');
        }
      } else {
        // ✅ Handle backend validation errors
        if (result.errors) {
          Object.values(result.errors).forEach((error: any) => {
            toast.error(error);
          });
        } else if (result.message) {
          if (result.message.includes('already registered')) {
            toast.error('This email is already registered. Please use a different email or login.');
          } else {
            toast.error(result.message);
          }
        } else {
          toast.error('Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Create Student Account</h2>
            <p className="mt-2 text-slate-600">Join EduCamp as a student</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      {...register('firstName')}
                      type="text"
                      id="firstName"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="First name"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      {...register('lastName')}
                      type="text"
                      id="lastName"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Last name"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
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
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Create a password (min. 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Informational Note */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> A student profile will be automatically created for you with a unique Student ID.
                  You will be automatically logged in after registration.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Student Account'}
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;