import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { BookOpen, Calendar, FileText, User, Settings, LogOut, CreditCard, Clock, Users, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE } from '../../lib/api';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load and verify session
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Fetch today's classes after user is set
            fetchTodaysClasses();
          } else {
            const localUser = localStorage.getItem('user');
            if (localUser) {
              setUser(JSON.parse(localUser));
              fetchTodaysClasses();
            }
          }
        } else if (res.status === 401 || res.status === 403) {
          toast.info('Your session has expired. Please log in again.');
          handleLogout();
        } else {
          console.warn('Unexpected response:', res.status);
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        toast.error('Cannot connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // Fetch today's classes
  const fetchTodaysClasses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/students/today-classes`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTodaysClasses(data.classes || []);
        }
      } else {
        console.warn('Failed to fetch today\'s classes:', res.status);
      }
    } catch (error) {
      console.error('Error fetching today\'s classes:', error);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      navigate('/login');
    }
  };

  const profileMenuItems = [
  { 
    label: 'View Profile', 
    icon: User, 
    onClick: () => navigate('/profile'),
    highlight: true
  },
  { 
    label: 'Account Settings', 
    icon: Settings, 
    onClick: () => navigate('/settings') 
  },
  { 
    label: 'Logout', 
    icon: LogOut, 
    onClick: handleLogout 
  },
];


  // Format timetable for display
  const formatTimetable = (timetable: string) => {
    if (!timetable) return 'No schedule available';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const lines = timetable.split(';').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.toUpperCase().includes(today)) {
        return line.trim();
      }
    }
    
    return 'No classes scheduled for today';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-green-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-inter">
              Welcome, {user?.firstName || 'Student'}!
            </h1>
            <p className="text-gray-600 mt-1 font-roboto text-sm">
              {user?.studentId
                ? `Student ID: ${user.studentId}`
                : "Here's what's happening with your studies today."}
            </p>
          </div>

          {/* Profile Button */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2 hover:shadow-md transition-all hover:border-lime-300"
            >
              <div className="w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center">
                <span className="text-lime-700 font-semibold text-xs">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-900 font-inter">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 font-roboto">View Profile</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 font-inter">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 font-roboto">{user?.email}</p>
                  {user?.studentId && (
                    <p className="text-xs text-lime-600 mt-0.5 font-mono">{user.studentId}</p>
                  )}
                </div>

                {profileMenuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.onClick();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-lime-50 hover:text-lime-700 transition-colors"
                  >
                    <item.icon className="w-3 h-3 mr-2" />
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Classes Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 font-inter">
                  Today's Classes
                </h3>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lime-600"></div>
                </div>
              ) : todaysClasses.length > 0 ? (
                <div className="space-y-3">
                  {todaysClasses.map((classItem, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-lime-300 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-lime-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-gray-900 font-inter truncate">
                          {classItem.className}
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{classItem.teacher}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>Grade {classItem.grade}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimetable(classItem.timetable)}</span>
                          </div>
                        </div>
                        {classItem.subjects && classItem.subjects.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {classItem.subjects.map((subject: string, subjectIndex: number) => (
                              <span
                                key={subjectIndex}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-lime-100 text-lime-800"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-roboto text-sm">No classes scheduled for today</p>
                  <p className="text-xs text-gray-400 mt-0.5">Enjoy your day off!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3 font-inter">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center p-3 bg-lime-50 hover:bg-lime-100 rounded-lg transition-colors group"
            >
              <User className="w-6 h-6 text-lime-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-gray-900 font-roboto">My Profile</span>
            </button>
            <button
              onClick={() => navigate('/submissions')}
              className="flex flex-col items-center p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors group"
            >
              <FileText className="w-6 h-6 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-gray-900 font-roboto">Submit Assignment</span>
            </button>
            <button
              onClick={() => navigate('/resources')}
              className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <BookOpen className="w-6 h-6 text-gray-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-gray-900 font-roboto">Study Materials</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;