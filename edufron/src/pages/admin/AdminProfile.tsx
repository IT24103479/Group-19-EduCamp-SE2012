import React, { useState,useEffect  } from 'react';
import { X, Edit2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProfileProps } from '../../types/ProfileProps';
import { de } from 'zod/v4/locales';



interface AdminProfileProps {
  profile: ProfileProps;
   id: number;
userId?: number | null;
  isOpen: boolean;
  onClose: () => void;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  description: string;
  position: string;
  phone: string;
  address: string;
  birthday: string;
  joiningDate: string;
  createdAt: string;
  updatedAt: string;
}

const AdminProfile: React.FC<AdminProfileProps> = ({ id, isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const userId = 5;
  const [profile, setProfile] = useState<AdminProfileProps>({
    name: '',
    id: 0,
    userId: userId,
    position: '',
    phone: '',
    address: '',
    birthday: '',
    joiningDate: '',
    createdAt: '',
    updatedAt: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    description: 'Capable and dedicated professional with a passion for education and technology.',
    //joinDate: '2022-01-15',
  });
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/admin/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();

        // Convert dates to readable format
        const formatted = {
          ...data,
          birthday: data.birthday ? new Date(data.birthday).toLocaleDateString() : '',
          joiningDate: data.joiningDate ? new Date(data.joiningDate).toLocaleDateString() : '',
          createdAt: data.createdAt ? new Date(data.createdAt).toLocaleString() : '',
          updatedAt: data.updatedAt ? new Date(data.updatedAt).toLocaleString() : '',
          description: data.description || 'Capable and dedicated professional with a passion for education and technology.',
        };
        console.log('Fetched profile:', formatted);
        setProfile(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [profile, isOpen]);

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Add backend update call (PUT/PATCH /api/admin/{id})
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;


  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Admin Profile</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              aria-label="Close profile"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center mb-6">
  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center text-black text-2xl font-bold mb-4 sm:mb-0 sm:mr-6">
    {profile.firstName[0]}{profile.lastName[0]}
  </div>
  <div className="text-center sm:text-left">
    <h3 className="text-xl font-semibold text-gray-800">
      {profile.firstName} {profile.lastName}
    </h3>
    {/* Removed the blue pill from role */}
 {/*  {profile.role !== "Super Admin" && (
  <p className="text-gray-700">{profile.role}</p>
)}*/}
    <p className="text-gray-600">{profile.position}</p>
  </div>
</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  ) : (
                   <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  ) : (
                    <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  ) : (
                    <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  ) : (
                    <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profile.birthday}
                      onChange={(e) => handleInputChange('birthday', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  ) : (
                    <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{new Date(profile.birthday).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.role}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  ) : (
                    <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.position}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{new Date(profile.joiningDate).toLocaleDateString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{new Date(profile.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                  <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{new Date(profile.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              {isEditing ? (
                <textarea
                  value={profile.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              ) : (
                <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.address}</p>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              {isEditing ? (
                <textarea
                  value={profile.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              ) : (
                <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.description}</p>
              )}
            </div>
<div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
  {isEditing ? (
    <>
      <button
        onClick={() => setIsEditing(false)}
        className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <X className="w-4 h-4" />
        <span>Cancel</span>
      </button>
      <button
        onClick={handleSave}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Save className="w-4 h-4" />
        <span>Save Changes</span>
      </button>
    </>
  ) : (
    <button
      onClick={() => setIsEditing(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
    >
      <Edit2 className="w-4 h-4" />
      <span>Edit Profile</span>
    </button>
  )}
</div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminProfile;