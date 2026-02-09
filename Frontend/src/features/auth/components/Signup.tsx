import { useAuth } from '@/core/auth/AuthContext';
import { getThemeClasses, useAppThemeStore } from '@/core/stores/app/themeStore';
import flowversalLogoDark from 'figma:asset/6002bc04b2fb15d40304d81c459c74499954d9ad.png';
import flowversalLogoLight from 'figma:asset/a343b12e588be649c0fd15261a16aac9163083d0.png';
import { AlertCircle, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';

interface SignupProps {
  onSignup: () => void;
  onLoginClick: () => void;
}

export function Signup({ onSignup, onLoginClick }: SignupProps) {
  const { theme } = useAppThemeStore();
  const themeClasses = getThemeClasses(theme);
  const { signup } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Password strength validation - Author: Sanket
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character');
    return errors;
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    setPasswordErrors(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate password strength
    const errors = validatePassword(formData.password);
    if (errors.length > 0) {
      setError('Password does not meet requirements');
      setIsLoading(false);
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signup(formData.email, formData.password, formData.name);
      if (result.success) {
        onSignup();
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.bgMain} flex items-center justify-center p-4`}>
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00C6FF]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#9D50BB]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Signup Card */}
      <div className={`${themeClasses.bgCard} rounded-2xl border ${themeClasses.border} p-8 w-full max-w-md ${themeClasses.shadow} relative z-10`}>
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={theme === 'dark' ? flowversalLogoDark : flowversalLogoLight} 
              alt="Flowversal" 
              className="h-8" 
            />
          </div>
          <h2 className={`text-3xl mb-2 ${themeClasses.textPrimary}`}>Create Account</h2>
          <p className={themeClasses.textSecondary}>Start building powerful workflows</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className={`block mb-2 ${themeClasses.textSecondary} text-sm`}>Full Name</label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textTertiary}`} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className={`w-full ${themeClasses.bgInput} border ${themeClasses.border} rounded-lg pl-11 pr-4 py-3 ${themeClasses.textPrimary} placeholder:${themeClasses.textSecondary} focus:outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className={`block mb-2 ${themeClasses.textSecondary} text-sm`}>Email Address</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textTertiary}`} />
              <input
                autoFocus
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className={`w-full ${themeClasses.bgInput} border ${themeClasses.border} rounded-lg pl-11 pr-4 py-3 ${themeClasses.textPrimary} placeholder:${themeClasses.textSecondary} focus:outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className={`block mb-2 ${themeClasses.textSecondary} text-sm`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textTertiary}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Create a strong password"
                className={`w-full ${themeClasses.bgInput} border ${themeClasses.border} rounded-lg pl-11 pr-11 py-3 ${themeClasses.textPrimary} placeholder:${themeClasses.textSecondary} focus:outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${themeClasses.textTertiary} hover:text-[#00C6FF] transition-colors`}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Password Requirements */}
            {passwordErrors.length > 0 && formData.password && (
              <div className="mt-2 space-y-1">
                {passwordErrors.map((err, i) => (
                  <p key={i} className="text-xs text-red-500 flex items-center gap-1">
                    <span>•</span> {err}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className={`block mb-2 ${themeClasses.textSecondary} text-sm`}>Confirm Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textTertiary}`} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter your password"
                className={`w-full ${themeClasses.bgInput} border ${themeClasses.border} rounded-lg pl-11 pr-11 py-3 ${themeClasses.textPrimary} placeholder:${themeClasses.textSecondary} focus:outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${themeClasses.textTertiary} hover:text-[#00C6FF] transition-colors`}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || passwordErrors.length > 0}
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-center">{isLoading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        {/* Login Link */}
        <div className={`text-center mt-6 ${themeClasses.textSecondary}`}>
          Already have an account?{' '}
          <button
            onClick={onLoginClick}
            className="text-[#00C6FF] hover:text-[#0072FF] transition-colors"
            disabled={isLoading}
          >
            Sign In
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-500 mt-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
