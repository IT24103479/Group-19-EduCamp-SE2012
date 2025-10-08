import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DashboardCard from '../../components/DashboardCard';
import UpcomingClasses from '../../components/UpcomingClasses';
import RecentAnnouncements from '../../components/RecentAnnouncements';
import GradeChart from '../../components/GradeChart';
import { BookOpen, TrendingUp, CheckCircle, Calendar, FileText, User, Settings, LogOut } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    // Load user data from localStorage or API
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8081/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const profileMenuItems = [
    {
      label: 'View Profile',
      icon: User,
      onClick: () => navigate('/profile'),
    },
    {
      label: 'Account Settings',
      icon: Settings,
      onClick: () => navigate('/settings'),
    },
    {
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-green-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Profile Navigation */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-inter">
              Welcome back, {user?.firstName || 'Student'}!
            </h1>
            <p className="text-gray-600 mt-2 font-roboto">
              {user?.studentId ? `Student ID: ${user.studentId}` : "Here's what's happening with your studies today."}
            </p>
          </div>

          {/* Profile Navigation Button */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 hover:shadow-md transition-all hover:border-lime-300"
            >
              <div className="w-10 h-10 bg-lime-100 rounded-full flex items-center justify-center">
                <span className="text-lime-700 font-semibold text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 font-inter">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 font-roboto">View Profile</p>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 font-inter">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-roboto">{user?.email}</p>
                  {user?.studentId && (
                    <p className="text-xs text-lime-600 mt-1 font-mono">{user.studentId}</p>
                  )}
                </div>

                {/* Menu Items */}
                {profileMenuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.onClick();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-lime-50 hover:text-lime-700 transition-colors"
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Close dropdown when clicking outside */}
        {showProfileMenu && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowProfileMenu(false)}
          />
        )}

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Courses"
            value="5"
            icon={BookOpen}
            color="lime"
          />
          <DashboardCard
            title="Pending Assignments"
            value="3"
            icon={FileText}
            color="amber"
          />
          <DashboardCard
            title="Average Grade"
            value="87.4%"
            icon={TrendingUp}
            color="blue"
            trend={{ value: 5.2, isPositive: true }}
          />
          <DashboardCard
            title="Completed Tasks"
            value="12"
            icon={CheckCircle}
            color="gray"
            trend={{ value: 8.1, isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Classes and Announcements */}
          <div className="lg:col-span-2 space-y-8">
            <UpcomingClasses />
            <RecentAnnouncements />
          </div>

          {/* Right Column - Grade Chart */}
          <div className="lg:col-span-1">
            <GradeChart />
          </div>
        </div>

        {/* Quick Actions - Updated with Profile Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center p-4 bg-lime-50 hover:bg-lime-100 rounded-lg transition-colors group"
            >
              <User className="w-8 h-8 text-lime-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-900 font-roboto">My Profile</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
              <Calendar className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-900 font-roboto">View Schedule</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors group">
              <FileText className="w-8 h-8 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-900 font-roboto">Submit Assignment</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
              <BookOpen className="w-8 h-8 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-900 font-roboto">Study Resources</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;