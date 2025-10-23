// src/types.ts

export interface Subject {
  id: number;
  name: string;
}

export interface Teacher {
  id: number;
  name: string;
  subject: string;
  email: string;
  contact: string;   // previously missing
  qualification: string;
  b_day: string;
  j_date: string;
}

export interface ClassItem {
  id: number;
  grade: string;
  fee: number;
  timetable: string;
  teacher?: Teacher;
  subjects: Subject[];
}

export interface Payment {
  id: number;
  userId: number;
  classId: number;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
}
