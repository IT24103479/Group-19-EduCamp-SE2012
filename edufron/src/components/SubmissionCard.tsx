import React from 'react';
import { FileText, Calendar, Download, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { StudentSubmission } from '../types/submission';

interface SubmissionCardProps {
  submission: StudentSubmission;
  onView: (submission: StudentSubmission) => void;
  onDownload: (submission: StudentSubmission) => void;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission, onView, onDownload }) => {
  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'GRADED':
        return { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <CheckCircle className="w-4 h-4" />, text: 'Graded' };
      case 'LATE':
        return { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: <AlertCircle className="w-4 h-4" />, text: 'Late' };
      default:
        return { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <FileText className="w-4 h-4" />, text: 'Submitted' };
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const statusConfig = getStatusConfig(submission.status);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">{submission.assignmentTitle || 'Untitled Assignment'}</h3>
            <p className="text-sm text-slate-600 mt-1">{submission.fileName || 'No file name'}</p>
            {submission.className && <p className="text-sm text-slate-500 mt-1">Class: {submission.className}</p>}
          </div>
        </div>
        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
          {statusConfig.icon}
          <span>{statusConfig.text}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Submitted: {formatDate(submission.submittedAt)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>Size: {formatFileSize(submission.fileSize)}</span>
        </div>
        {submission.grade != null && (
          <div className="flex items-center space-x-2">
            <span className="font-medium text-emerald-700">
              Grade: {submission.grade}{submission.maxPoints ? `/${submission.maxPoints}` : ''}
            </span>
          </div>
        )}
        {submission.late && (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-orange-600">Submitted Late</span>
          </div>
        )}
      </div>

      {submission.comments && (
        <div className="mb-4">
          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <strong className="text-slate-900">Comments:</strong> {submission.comments}
          </p>
        </div>
      )}

      {submission.feedback && (
        <div className="mb-4">
          <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <strong className="text-emerald-900">Feedback:</strong> {submission.feedback}
          </p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => onView(submission)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </button>
        <button
          onClick={() => onDownload(submission)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};

export default SubmissionCard;
