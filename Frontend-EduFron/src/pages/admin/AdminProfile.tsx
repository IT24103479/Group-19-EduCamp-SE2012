import React, { useEffect, useState } from 'react';
import { X, Edit2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
//import type { AdminModalProps, AdminProfileData } from '../../types/ProfileProps';
import { API_BASE } from '../../lib/api';
type AdminProfileData = {
  id?: number | null;
  userId?: number | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: string | null;
  description?: string | null;
  position?: string | null;
  phone?: string | null;
  address?: string | null;
  birthday?: string | null;
  joiningDate?: string | null; // ISO date string
  createdAt?: string | null;
  updatedAt?: string | null;
  // accept possible alternate keys returned by backend
  [key: string]: any;
};

interface AdminModalProps {
  id?: number;
  userId?: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const safeFormatDate = (value?: string | null) => {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
};

const safeFormatDateTime = (value?: string | null) => {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : d.toLocaleString();
};

/**
 * AdminProfile component
 *
 * Important: Normalizes backend date fields into predictable keys:
 * - joiningDate: prefers joiningDate, falls back to j_date, join_date, joinDate, etc.
 * - birthday: prefers birthday, falls back to b_day, bday, etc.
 * - createdAt/updatedAt: handles created_at/updated_at variants.
 *
 * This ensures joiningDate is available as an ISO string the UI can format.
 */
const AdminProfile: React.FC<AdminModalProps> = ({ id, userId, isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<AdminProfileData>({
    id: undefined,
    userId: userId ?? id ?? null,
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    description: 'Capable and dedicated professional with a passion for education and technology.',
    qualification: 'University Degree in Education',
    phone: '',
    address: '',
    birthday: null,
    joiningDate: null,
  });

  // compute the id to fetch (prefer id prop, then userId, then fallback)
  const uid = id ?? userId ?? 13;

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const fetchProfile = async () => {
      try {
        console.log('AdminProfile: fetching admin for uid =', uid);
        const res = await fetch(`${API_BASE}/api/admin/${uid}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '<no body>');
          console.error('AdminProfile: fetch failed', res.status, text);
          return;
        }

        const data = await res.json();
        console.log('AdminProfile: fetched data from backend', data);
        if (cancelled) return;

        // Normalize possible backend field names to known frontend keys.
        const normalized: AdminProfileData = {
          ...data,
          // ID: backend may use id or userId or user_id
          id: data.id ?? data.userId ?? data.user_id ?? data.employeeId ?? null,

          // joiningDate: normalize a few naming variants (j_date, joiningDate, join_date, joinDate)
          joiningDate:
            data.joiningDate ??
            data.j_date ??
            data.join_date ??
            data.joinDate ??
            data.joining_date ??
            null,

          // birthday: normalize (birthday or b_day or bday)
          birthday: data.birthday ?? data.b_day ?? data.bday ?? null,

          // createdAt / updatedAt normalization
          createdAt: data.createdAt ?? data.created_at ?? null,
          updatedAt: data.updatedAt ?? data.updated_at ?? null,

          // other safe fallbacks
          firstName: data.firstName ?? data.first_name ?? data.first ?? '',
          lastName: data.lastName ?? data.last_name ?? data.last ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          position: data.position ?? data.job_title ?? null,
          role: data.role ?? '',
        };

        setProfile(prev => ({ ...prev, ...normalized }));
        console.log('AdminProfile: fetched data', normalized);
      } catch (err) {
        console.error('AdminProfile: error fetching admin profile', err);
      }
    };

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [uid, isOpen]);

  const handleInputChange = (field: keyof AdminProfileData, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: send update to backend
  };

  if (!isOpen) return null;

  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}` || 'N/A';

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
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors" aria-label="Close profile">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-400 rounded-full flex items-center justify-center text-black text-2xl font-bold mb-4 sm:mb-0 sm:mr-6">
                {initials}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-semibold text-gray-800">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-gray-600">{profile.position}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  {isEditing ? (
                    <input type="text" value={profile.firstName ?? ''} onChange={(e) => handleInputChange('firstName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  ) : (
                    <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  {isEditing ? (
                    <input type="text" value={profile.lastName ?? ''} onChange={(e) => handleInputChange('lastName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  ) : (
                    <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input type="email" value={profile.email ?? ''} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  ) : (
                    <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input type="tel" value={profile.phone ?? ''} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  ) : (
                    <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                  {isEditing ? (
                    <input type="date" value={profile.birthday ?? ''} onChange={(e) => handleInputChange('birthday', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  ) : (
                    <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{safeFormatDate(profile.birthday)}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.role}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{safeFormatDate(profile.joiningDate)}</p>
                </div>

                
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              {isEditing ? (
                <textarea value={profile.address ?? ''} onChange={(e) => handleInputChange('address', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              ) : (
                <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.address}</p>
              )}
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              {isEditing ? (
                <textarea value={profile.description ?? ''} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              ) : (
                <p className="inline-block bg-sky-200 text-sky-800 px-3 py-1 rounded-full">{profile.description}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button onClick={handleSave} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
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