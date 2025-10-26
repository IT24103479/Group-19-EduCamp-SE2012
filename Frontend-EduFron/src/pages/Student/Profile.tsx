import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
  User, Mail, Phone, MapPin, Edit3, Save, X, Calendar, 
  GraduationCap, Shield, BookOpen, Clock, Cake
} from 'lucide-react';
import { toast } from 'react-toastify';

// Validation schema for editable fields
const profileSchema = z.object({
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 characters')
    .regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'),
  emergencyContact: z.string()
    .min(10, 'Emergency contact must be at least 10 characters')
    .regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'),
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must be less than 200 characters'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface StudentProfile {
  id: number;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  emergencyContact: string;
  grade: string;
  dateOfBirth: string;
  gender: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
  age: number;
  underage: boolean;
  assignedCourses: string[];
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset 
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Secure fetch helper (handles session expiry globally)
  const secureFetch = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, { 
      ...options, 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      }
    });

    if (response.status === 401 || response.status === 403) {
      toast.info('Session expired. Please login again.');
      localStorage.removeItem('user');
      navigate('/login');
      throw new Error('Unauthorized');
    }

    return response;
  };

  //  Verify session before fetching profile
  useEffect(() => {
    const verifyAndFetchProfile = async () => {
      try {
        const meResponse = await fetch('VITE_BACKEND_URL/api/auth/me', {
          credentials: 'include',
        });

        if (meResponse.status === 401 || meResponse.status === 403) {
          toast.info('Your session has expired. Please login again.');
          navigate('/login');
          return;
        }

        await fetchProfileData();
      } catch (error) {
        console.error('Session check failed:', error);
        toast.error('Unable to verify session. Please try again.');
        navigate('/login');
      }
    };

    verifyAndFetchProfile();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);

      const response = await secureFetch('VITE_BACKEND_URL/api/students/profile');
      console.log('Profile API Response Status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Profile API Response Data:', result);

        if (result.success && result.profile) {
          setStudentProfile(result.profile);
          reset({
            phoneNumber: result.profile.phoneNumber || '',
            emergencyContact: result.profile.emergencyContact || '',
            address: result.profile.address || '',
          });
        } else {
          toast.error(result.message || 'Failed to load profile');
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Failed to load profile data');
    } finally { 
      setIsLoading(false); 
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    try {
      console.log('Submitting profile data:', data);
      
      const response = await secureFetch('VITE_BACKEND_URL/api/students/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Update API Response:', result);
      
      if (response.ok && result.success) {
        toast.success('Profile updated successfully!');
        setStudentProfile(result.profile);
        setIsEditing(false);
      } else if (result.errors) {
        Object.values(result.errors).forEach((error: any) => toast.error(error));
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Network error. Please try again.');
    } finally { 
      setIsUpdating(false); 
    }
  };

  const handleEditToggle = () => {
    if (isEditing && studentProfile) {
      reset({
        phoneNumber: studentProfile.phoneNumber || '',
        emergencyContact: studentProfile.emergencyContact || '',
        address: studentProfile.address || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Loading state
  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading your profile...</p>
      </div>
    </div>
  );

  // ✅ Retry button on load failure
  if (!studentProfile) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-600 mb-4">Unable to load profile data</p>
        <button 
          onClick={fetchProfileData} 
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                  {studentProfile.profilePicture ? (
                    <img 
                      src={studentProfile.profilePicture} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {studentProfile.firstName?.[0]}{studentProfile.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    {studentProfile.firstName} {studentProfile.lastName}
                  </h1>
                  <p className="text-emerald-100 text-lg mt-1">
                    {studentProfile.studentNumber}
                  </p>
                  <p className="text-emerald-200 mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {studentProfile.email}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button 
                    onClick={handleEditToggle}
                    className="bg-white text-emerald-600 px-6 py-3 rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-all duration-200 font-medium shadow-md"
                  >
                    <Edit3 className="w-5 h-5" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleEditToggle}
                      className="bg-slate-500 text-white px-6 py-3 rounded-lg hover:bg-slate-600 flex items-center gap-2 transition-all duration-200 font-medium"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                    <button 
                      onClick={handleSubmit(onSubmit)}
                      disabled={isUpdating}
                      className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <Save className="w-5 h-5" />
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Read-only Fields */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Student Number</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span className="font-mono text-slate-900">{studentProfile.studentNumber}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900">{studentProfile.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Cake className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900">
                      {studentProfile.dateOfBirth ? formatDate(studentProfile.dateOfBirth) : 'Not set'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Age</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-900">
                      {studentProfile.age || 'N/A'} years
                      {studentProfile.underage && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                          Underage
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Gender</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900">{studentProfile.gender || 'Not specified'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Grade</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <GraduationCap className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-900">{studentProfile.grade || 'Not assigned'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Contact Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600" />
                Contact Information
                {isEditing && (
                  <span className="text-sm font-normal text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    Editing
                  </span>
                )}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      {...register('phoneNumber')}
                      type="tel"
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
                      placeholder="+1234567890"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-2 text-sm text-red-600">{errors.phoneNumber.message}</p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Emergency Contact *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      {...register('emergencyContact')}
                      type="tel"
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
                      placeholder="+1987654321"
                    />
                  </div>
                  {errors.emergencyContact && (
                    <p className="mt-2 text-sm text-red-600">{errors.emergencyContact.message}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                    <textarea
                      {...register('address')}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors resize-none"
                      placeholder="123 Main Street, City, State, ZIP Code"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Additional Information */}
          <div className="space-y-8">
            {/* Academic Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Academic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Courses</label>
                  <div className="space-y-2">
                    {studentProfile.assignedCourses && studentProfile.assignedCourses.length > 0 ? (
                      studentProfile.assignedCourses.map((course, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-slate-900">{course}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 text-sm p-3 bg-slate-50 rounded-lg border border-slate-200">
                        No courses assigned yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Metadata Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Profile Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-700">Member Since</span>
                  <span className="text-sm text-slate-900">{formatDate(studentProfile.createdAt)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-700">Last Updated</span>
                  <span className="text-sm text-slate-900">{formatDateTime(studentProfile.updatedAt)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-700">Profile Status</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    studentProfile.underage 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {studentProfile.underage ? 'Underage Student' : 'Active Student'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            {!isEditing && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button 
                    onClick={handleEditToggle}
                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 transition-colors font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-slate-600 text-white py-3 px-4 rounded-lg hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors font-medium"
                  >
                    <User className="w-4 h-4" />
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Profile Info */}
        {/* (Same rest of your UI structure as before — no logic changes needed) */}
      </main>

      <Footer />
    </div>
  );
};

export default Profile;