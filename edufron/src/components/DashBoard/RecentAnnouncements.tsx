import React from 'react';
import { Bell, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  message: string;
  date: Date;
  priority: 'high' | 'medium' | 'low';
  author: string;
}

const RecentAnnouncements: React.FC = () => {
  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'Exam Schedule Released',
      message: 'Mid-term examination schedule has been published. Please check your individual timetables.',
      date: new Date('2025-01-15'),
      priority: 'high',
      author: 'Academic Office'
    },
    {
      id: '2',
      title: 'Library Hours Extended',
      message: 'Library will remain open until 10 PM during exam week.',
      date: new Date('2025-01-14'),
      priority: 'medium',
      author: 'Library Staff'
    },
    {
      id: '3',
      title: 'New Study Materials Available',
      message: 'Additional practice problems for Mathematics and Physics are now available in the resources section.',
      date: new Date('2025-01-13'),
      priority: 'low',
      author: 'Teaching Staff'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-lime-100 text-lime-800 border-lime-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 font-inter">Recent Announcements</h3>
        <Bell className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="border-l-4 border-lime-500 pl-4 py-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 font-inter">{announcement.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 font-roboto">{announcement.message}</p>
                <div className="flex items-center text-xs text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(announcement.date, 'MMM dd, yyyy')}
                  </div>
                  <span>by {announcement.author}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAnnouncements;