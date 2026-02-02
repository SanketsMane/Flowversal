import { env } from '../../../core/config/env';

export function validatePasswordPolicy(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!password || password.length < env.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${env.PASSWORD_MIN_LENGTH} characters`);
  }
  if (env.PASSWORD_REQUIRE_SYMBOL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must include a symbol');
  }
  if (env.PASSWORD_REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push('Password must include a number');
  }
  if (env.PASSWORD_REQUIRE_UPPER && !/[A-Z]/.test(password)) {
    errors.push('Password must include an uppercase letter');
  }
  return { valid: errors.length === 0, errors };
}

