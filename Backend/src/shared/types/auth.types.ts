export interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  onboardingCompleted?: boolean;
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

