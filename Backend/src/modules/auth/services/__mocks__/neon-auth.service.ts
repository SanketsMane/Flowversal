
// Manual mock for NeonAuthService
export const neonAuthService = {
  signUp: jest.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com' },
    session: { access_token: 'test-token', refresh_token: 'test-refresh-token', expires_in: 3600, token_type: 'bearer' }
  }),
  signIn: jest.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com' },
    session: { access_token: 'test-token', refresh_token: 'test-refresh-token', expires_in: 3600, token_type: 'bearer' }
  }),
  refreshSession: jest.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com' },
    session: { access_token: 'test-token', refresh_token: 'test-refresh-token', expires_in: 3600, token_type: 'bearer' }
  }),
  getUser: jest.fn().mockResolvedValue({ id: 'test-user-id', email: 'test@example.com', created_at: new Date().toISOString() }),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: 'test-user-id', type: 'access' }),
  requestPasswordReset: jest.fn().mockResolvedValue(undefined),
  confirmPasswordReset: jest.fn().mockResolvedValue(undefined),
  changePassword: jest.fn().mockResolvedValue(undefined),
  getUserById: jest.fn().mockResolvedValue({ id: 'test-user-id', email: 'test@example.com' }), // Match getUser
};

export class NeonAuthService {
  signUp = neonAuthService.signUp;
  signIn = neonAuthService.signIn;
  refreshSession = neonAuthService.refreshSession;
  getUser = neonAuthService.getUser;
  verifyAccessToken = neonAuthService.verifyAccessToken;
}
