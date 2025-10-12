import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { User, Mail, Phone, MapPin, Edit3, Save, X, Shield } from 'lucide-react';
import { toast } from 'react-toastify';

// Validation schema for profile updates
const profileSchema = z.object({
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 characters')
    .regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'),
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must be less than 200 characters'),
  emergencyContact: z.string()
    .min(10, 'Emergency contact must be at least 10 characters'),
  academicLevel: z.string().min(1, 'Academic level is required'),
  major: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface StudentProfile {
  id: number;
  studentId: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
  academicLevel?: string;
  major?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentRequest {
  userId: string;
  classId: string;
  amount: number;
  paymentCompleted: boolean;
  paypalTransactionId?: string;
  enrollmentDate: string;
}
interface ClassItem {
  id: number;
  name: string;
  teacher: string;
  grade: string;
  type: string;
  description: string;
  image: string;
  schedule: string;
  //duration: string;
  //capacity: number;
  //location: string;
  price: string;
}



const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Fetch user data and student profile
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Get current user from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // Fetch student profile from backend
      const response = await fetch('http://localhost:8080/educamp/api/auth/me', {
        credentials: 'include', // Important for session cookies
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStudentProfile(result.student);
          // Pre-fill form with existing data
          if (result.student) {
            setValue('phoneNumber', result.student.phoneNumber || '');
            setValue('address', result.student.address || '');
            setValue('emergencyContact', result.student.emergencyContact || '');
            setValue('academicLevel', result.student.academicLevel || '');
            setValue('major', result.student.major || '');
          }
        }
      } else if (response.status === 401) {
        toast.error('Please login to view your profile');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsUpdating(true);
    try {
      const response = await fetch('http://localhost:8080/api/students/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Profile updated successfully!');
        setStudentProfile(result.student);
        setIsEditing(false);
        // Update local storage if user data changed
        if (result.student) {
          const updatedUser = { ...user, student: result.student };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to current values when canceling
      if (studentProfile) {
        setValue('phoneNumber', studentProfile.phoneNumber || '');
        setValue('address', studentProfile.address || '');
        setValue('emergencyContact', studentProfile.emergencyContact || '');
        setValue('academicLevel', studentProfile.academicLevel || '');
        setValue('major', studentProfile.major || '');
      }
    }
    setIsEditing(!isEditing);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please login to view your profile</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-lime-600 text-white px-6 py-2 rounded-lg hover:bg-lime-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate('/enrolled-classes')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Enrolled Classes
          </button>
        </div>
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-lime-500 to-green-500 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-lime-600">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-lime-100">{user.studentId || 'Student'}</p>
                  <p className="text-lime-200 text-sm mt-1">{user.email}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={handleEditToggle}
                    className="bg-white text-lime-600 px-4 py-2 rounded-lg hover:bg-lime-50 transition-colors flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleEditToggle}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={isUpdating}
                      className="bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-lime-600" />
                    Personal Information
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        {...register('phoneNumber')}
                        type="tel"
                        id="phoneNumber"
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent disabled:bg-gray-100"
                        placeholder="+1234567890"
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-600 mt-1">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <textarea
                        {...register('address')}
                        id="address"
                        disabled={!isEditing}
                        rows={3}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent disabled:bg-gray-100 resize-none"
                        placeholder="123 Main St, City, State 12345"
                      />
                    </div>
                    {errors.address && (
                      <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                    )}
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Academic Information
                  </h3>

                  <div>
                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        {...register('emergencyContact')}
                        type="tel"
                        id="emergencyContact"
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent disabled:bg-gray-100"
                        placeholder="+1987654321"
                      />
                    </div>
                    {errors.emergencyContact && (
                      <p className="text-sm text-red-600 mt-1">{errors.emergencyContact.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="academicLevel" className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Level *
                    </label>
                    <select
                      {...register('academicLevel')}
                      id="academicLevel"
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Select academic level</option>
                      <option value="Freshman">Freshman</option>
                      <option value="Sophomore">Sophomore</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                    {errors.academicLevel && (
                      <p className="text-sm text-red-600 mt-1">{errors.academicLevel.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1">
                      Major
                    </label>
                    <input
                      {...register('major')}
                      type="text"
                      id="major"
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Computer Science"
                    />
                    {errors.major && (
                      <p className="text-sm text-red-600 mt-1">{errors.major.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Read-only information */}
              {!isEditing && studentProfile && (
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Profile Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Student ID:</span>
                      <p className="font-mono text-gray-900">{studentProfile.studentId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <p className="text-gray-900">
                        {new Date(studentProfile.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;