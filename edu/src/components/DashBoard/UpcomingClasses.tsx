import React from 'react';
import { Clock, MapPin } from 'lucide-react';

interface ClassItem {
  id: string;
  subject: string;
  time: string;
  location: string;
  instructor: string;
  color: string;
}

const UpcomingClasses: React.FC = () => {
  const classes: ClassItem[] = [
    {
      id: '1',
      subject: 'Mathematics',
      time: '10:00 AM - 11:30 AM',
      location: 'Room 101',
      instructor: 'Dr. Smith',
      color: 'bg-lime-100 text-lime-800 border-lime-200'
    },
    {
      id: '2',
      subject: 'Physics',
      time: '2:00 PM - 3:30 PM',
      location: 'Lab 205',
      instructor: 'Prof. Johnson',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: '3',
      subject: 'Chemistry',
      time: '4:00 PM - 5:30 PM',
      location: 'Lab 301',
      instructor: 'Dr. Williams',
      color: 'bg-amber-100 text-amber-800 border-amber-200'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter">Today's Classes</h3>
      <div className="space-y-4">
        {classes.map((classItem) => (
          <div key={classItem.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className={`w-4 h-4 rounded-full ${classItem.color.split(' ')[0]} mr-4 flex-shrink-0`}></div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 font-inter">{classItem.subject}</h4>
              <p className="text-sm text-gray-600 font-roboto">{classItem.instructor}</p>
              <div className="flex items-center mt-1 space-x-4">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {classItem.time}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  {classItem.location}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingClasses;