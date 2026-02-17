export interface User {
  id: string; // Internal MongoDB ID
  neonUserId?: string; // External Neon ID
  email: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Consistency
  updatedAt?: string; // Consistency
  role?: string;
  full_name?: string;
  onboardingCompleted?: boolean;
  dbUser?: any;
}

export interface AuthContext {
  user: User;
  token: string;
}

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  aud: string;
  role: string;
  iat: number;
  exp: number;
}

