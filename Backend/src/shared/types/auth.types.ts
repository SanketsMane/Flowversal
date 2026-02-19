export interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  onboardingCompleted?: boolean;
  // Author: Sanket — dbUser is the MongoDB user object cached by auth middleware
  // to avoid repeated DB lookups (fixes N+1 query pattern)
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

