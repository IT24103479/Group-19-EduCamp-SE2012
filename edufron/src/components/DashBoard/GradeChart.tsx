import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GradeChart: React.FC = () => {
  const data = [
    { subject: 'Math', grade: 85, target: 90 },
    { subject: 'Physics', grade: 92, target: 88 },
    { subject: 'Chemistry', grade: 78, target: 85 },
    { subject: 'Biology', grade: 88, target: 90 },
    { subject: 'English', grade: 94, target: 92 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter">Grade Overview</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="subject" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="grade" fill="#65a30d" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-lime-600 rounded mr-2"></div>
          <span className="text-sm text-gray-600 font-roboto">Current Grade</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
          <span className="text-sm text-gray-600 font-roboto">Target Grade</span>
        </div>
      </div>
    </div>
  );
};

export default GradeChart;