import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, GraduationCap, BookOpen, UserCheck } from 'lucide-react';

const Sidebar: React.FC = () => {
  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/teachers', icon: GraduationCap, label: 'Teachers' },
    { path: '/classes', icon: BookOpen, label: 'Classes' },
    { path: '/enrollments', icon: UserCheck, label: 'Enrollments' },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;