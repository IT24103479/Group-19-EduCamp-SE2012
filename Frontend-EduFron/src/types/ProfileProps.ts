export interface AdminProfileData {
  id?: number;
  userId?: number | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  description?: string;
  qualification?: string;
  phone?: string;
  address?: string;
  birthday?: string | null;    // ISO date string or null
  joiningDate?: string | null; // ISO date string or null
  createdAt?: string | null;   // ISO datetime string or null
  updatedAt?: string | null;   // ISO datetime string or null
}

export interface AdminModalProps {
  userId?: number | null;
  isOpen: boolean;
  onClose: () => void;
}