import React from 'react';
import { Calendar, FileUp } from 'lucide-react';
import type { AvailableAssignment } from '../types/submission';

interface AssignmentCardProps {
  assignment: AvailableAssignment;
  onSubmit: (assignmentId: number) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onSubmit }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <FileUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">{assignment.assignmentTitle || 'Untitled Assignment'}</h3>
            <p className="text-sm text-slate-600 mt-1">{assignment.className || 'General Assignment'}</p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          {assignment.status || 'Available'}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Due: {formatDate(assignment.dueDate)}</span>
        </div>
        {assignment.maxPoints != null && (
          <div className="flex items-center space-x-2">
            <span>Max Points: {assignment.maxPoints}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onSubmit(assignment.assignmentId)}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
      >
        <FileUp className="w-4 h-4" />
        <span>Submit Assignment</span>
      </button>
    </div>
  );
};

export default AssignmentCard;
