export interface Subject { 
  id: number; 
  name: string; 
}

export interface Teacher { 
  id: number; 
  name: string; 
}

export interface ClassItem {
  id: number;
  grade: string;
  fee: number;
  timetable: string;
  teacher?: Teacher;
  subjects: Subject[];
}
