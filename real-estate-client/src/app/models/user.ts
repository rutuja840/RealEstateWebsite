export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  profileImage?: string;
  createdAt: string;
  isActive: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  fullName: string;
  phoneNumber: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    userId: number;
    fullName: string;
    email: string;
    role: string;
    token: string;
  };
}