export interface User {
  id: string;
  googleId?: string | null;
  email: string;
  name?: string | null;
  role?: string; // Ensure role is string
  password?: string | null;
  phone_number?: string | null; // Ensure phone_number is string | null
  number_verified?: boolean; // Ensure number_verified is boolean
  plan?: string; // Ensure plan is string
  credits?: number; // Ensure credits is number
  createdAt: Date;
}