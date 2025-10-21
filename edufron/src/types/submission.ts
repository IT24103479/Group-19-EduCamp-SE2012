export interface AvailableAssignment {
  assignmentId: number;
  assignmentTitle: string;
  className?: string;
  dueDate?: string;
  maxPoints?: number;
  status: string;
}

export interface StudentSubmission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  className?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  comments: string;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
  grade: number | null;
  feedback: string;
  submittedAt: string;
  gradedAt: string | null;
  studentName: string;
  late: boolean;
  dueDate?: string;
  maxPoints?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  assignments?: T[];
  submissions?: T[];
}