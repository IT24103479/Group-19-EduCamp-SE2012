// types/payment.ts
export interface PaymentDTO {
  amount: number;
  currency: string;
  classId: number;
  userId: number;
  description?: string;
}
