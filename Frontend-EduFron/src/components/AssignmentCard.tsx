import React from 'react';
import { Calendar, Clock, FileText, Upload } from 'lucide-react';

export interface AvailableAssignment {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  maxPoints: number;
  classId: number;
  className?: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignmentCardProps {
  assignment: AvailableAssignment;
  onSubmit: (assignmentId: number) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onSubmit }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = new Date() > new Date(assignment.dueDate);
  const daysUntilDue = Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getDueDateColor = () => {
    if (isOverdue) return 'text-red-600';
    if (daysUntilDue <= 1) return 'text-orange-600';
    if (daysUntilDue <= 3) return 'text-yellow-600';
    return 'text-slate-600';
  };

  const getDueDateText = () => {
    if (isOverdue) return 'Overdue';
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `Due in ${daysUntilDue} days`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg mb-1">{assignment.title}</h3>
            {assignment.className && (
              <p className="text-sm text-slate-600">Class: {assignment.className}</p>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDueDateColor()} bg-opacity-10 ${isOverdue ? 'bg-red-100' : daysUntilDue <= 3 ? 'bg-orange-100' : 'bg-slate-100'}`}>
          {getDueDateText()}
        </span>
      </div>

      {assignment.description && (
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{assignment.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Due: {formatDate(assignment.dueDate)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>Points: {assignment.maxPoints}</span>
        </div>
      </div>

      {isOverdue && (
        <div className="flex items-center space-x-2 text-red-600 text-sm mb-4 p-2 bg-red-50 rounded-lg">
          <Clock className="w-4 h-4" />
          <span>This assignment is overdue</span>
        </div>
      )}

      <button
        onClick={() => onSubmit(assignment.id)}
        disabled={isOverdue}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isOverdue
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <Upload className="w-4 h-4" />
        <span>{isOverdue ? 'Overdue' : 'Submit Assignment'}</span>
      </button>
    </div>
  );
};

export default AssignmentCard;