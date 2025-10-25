export interface Subject { 
  id: number; 
  name: string; 
}

export interface Teacher { 
  id: number; 
  firstName: string;
  lastName: string;
  name?: string; // optional fallback
}

export interface ClassItem {
  id?: number;        // optional
  grade: string;
  fee: number;
  timetable: string;
  teacher?: Teacher | null;
  subjects?: Subject[];
}
