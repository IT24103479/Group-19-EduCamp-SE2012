import React from 'react';
import { 
  FileText, Calendar, Download, Eye, Clock, 
  CheckCircle, AlertCircle, Star, MessageCircle 
} from 'lucide-react';

export interface StudentSubmission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  fileName: string;
  fileSize: number;
  comments: string;
  submittedAt: string;
  gradedAt: string | null;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
  grade: number | null;
  maxPoints: number | null;
  feedback: string | null;
  studentName: string;
  studentNumber: string;
  hasFile: boolean;
  fileExtension: string;
  isPreviewable: boolean;
  className?: string;
  late?: boolean;
}

interface SubmissionCardProps {
  submission: StudentSubmission;
  onView: (submission: StudentSubmission) => void;
  onDownload: (submission: StudentSubmission) => void;
  className?: string;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ 
  submission, 
  onView, 
  onDownload,
  className = '' 
}) => {
  const getStatusConfig = (status?: string, isLate?: boolean) => {
    if (isLate) {
      return {
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'Late Submission'
      };
    }

    switch (status?.toUpperCase()) {
      case 'GRADED':
        return {
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Graded'
        };
      case 'SUBMITTED':
        return {
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: <FileText className="w-4 h-4" />,
          text: 'Submitted'
        };
      case 'LATE':
        return {
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          icon: <Clock className="w-4 h-4" />,
          text: 'Late'
        };
      default:
        return {
          color: 'text-slate-600 bg-slate-50 border-slate-200',
          icon: <FileText className="w-4 h-4" />,
          text: status || 'Pending'
        };
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not submitted';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getGradePercentage = (): string | null => {
    if (submission.grade == null || submission.maxPoints == null || submission.maxPoints === 0) {
      return null;
    }
    return `${Math.round((submission.grade / submission.maxPoints) * 100)}%`;
  };

  const getGradeColor = (): string => {
    if (submission.grade == null || submission.maxPoints == null) return 'text-slate-700';
    
    const percentage = (submission.grade / submission.maxPoints) * 100;
    if (percentage >= 90) return 'text-emerald-600';
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const statusConfig = getStatusConfig(submission.status, submission.late);
  const gradePercentage = getGradePercentage();
  const gradeColor = getGradeColor();

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 ${className}`}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0 mt-1">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 text-lg truncate">
              {submission.assignmentTitle || 'Untitled Assignment'}
            </h3>
            <p className="text-sm text-slate-600 mt-1 truncate">
              {submission.fileName || 'No file name'}
            </p>
            {submission.className && (
              <p className="text-sm text-slate-500 mt-1">
                Class: {submission.className}
              </p>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${statusConfig.color}`}>
          {statusConfig.icon}
          <span>{statusConfig.text}</span>
        </span>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">Submitted: {formatDate(submission.submittedAt)}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span>Size: {formatFileSize(submission.fileSize)}</span>
        </div>

        {submission.gradedAt && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Graded: {formatDate(submission.gradedAt)}</span>
          </div>
        )}

        {submission.late && (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="text-orange-600">Submitted Late</span>
          </div>
        )}
      </div>

      {/* Grade Section */}
      {submission.grade != null && submission.maxPoints != null && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className={`font-semibold ${gradeColor}`}>
                Grade: {submission.grade}/{submission.maxPoints}
              </span>
              {gradePercentage && (
                <span className={`text-sm ${gradeColor}`}>({gradePercentage})</span>
              )}
            </div>
            {gradePercentage && (
              <div className="w-20 bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    gradePercentage >= '90%' ? 'bg-emerald-500' :
                    gradePercentage >= '80%' ? 'bg-green-500' :
                    gradePercentage >= '70%' ? 'bg-yellow-500' :
                    gradePercentage >= '60%' ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: gradePercentage }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments Section */}
      {submission.comments && (
        <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-start space-x-2">
            <MessageCircle className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-slate-900 text-sm">Student Comments:</strong>
              <p className="text-slate-700 text-sm mt-1">{submission.comments}</p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {submission.feedback && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <MessageCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-blue-900 text-sm">Teacher Feedback:</strong>
              <p className="text-blue-800 text-sm mt-1">{submission.feedback}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onView(submission)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors flex-1 min-w-[120px] justify-center"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </button>
        
        <button
          onClick={() => onDownload(submission)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex-1 min-w-[140px] justify-center"
        >
          <Download className="w-4 h-4" />
          <span>Download File</span>
        </button>
      </div>
    </div>
  );
};

export default SubmissionCard;