// types/submission.ts
export interface StudentSubmission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  enrollmentId: number;
  filePath: string;
  fileName: string;
  fileSize: number;
  comments?: string;
  submittedAt: string;
  gradedAt?: string;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
  grade?: number;
  feedback?: string;
  studentName: string;
  studentNumber: string;
  className?: string;
  maxPoints?: number;
  late?: boolean;
}

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

export interface SubmissionResponse {
  success: boolean;
  message: string;
  submission?: StudentSubmission;
  submissions?: StudentSubmission[];
}

export interface AssignmentResponse {
  success: boolean;
  message: string;
  assignments?: AvailableAssignment[];
  assignment?: AvailableAssignment;
}