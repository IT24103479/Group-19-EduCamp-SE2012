import React, { useState } from 'react';
import { User, LogOut, Bell } from 'lucide-react';
import ProfileModal from '../pages/admin/AdminProfile';

const Topbar: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    // Logout logic would go here
    console.log('Logging out...');
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open profile"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

export default Topbar;