export interface AdminProfileProps {
  name: string;
  id: number;
  email: string;
  role: string;
  description: string;
  position: string;
  phone: string;
  address: string;
  birthday: string;
  joiningDate: string;
  createdAt: string;
  updatedAt: string;
}

// For your modal component props
export interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
}