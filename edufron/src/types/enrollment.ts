export interface EnrollmentDTO {
  amount: number;
  currency: string;
  classId: number;
  userId: number;
  description?: string;
  status?: string;
  enrolledAt?: string;
}