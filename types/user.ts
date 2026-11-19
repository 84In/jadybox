export type UserRole = "customer" | "admin";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  createdAt: string;
}