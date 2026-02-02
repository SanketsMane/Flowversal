import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, AlertCircle } from 'lucide-react';
import { useAppThemeStore, getThemeClasses } from '@/core/stores/app/themeStore';
import { useAuth } from '@/core/auth/AuthContext';

interface SignupProps {
  onSignup: () => void;
  onLoginClick: () => void;
}

export function Signup({ onSignup, onLoginClick }: SignupProps) {
  const { theme } = useAppThemeStore();
  const themeClasses = getThemeClasses(theme);
  const { signup, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await signup(formData.email, formData.password, formData.name);
      if (result.success) {
        onSignup();
      } else {
        setError(result.error || 'Failed to sign up. Please try again.');
      }
    } catch (err) {
      setError('Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        onSignup();
      } else {
        setError(result.error || 'Failed to sign up with Google.');
      }
    } catch (err) {
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.bgMain} flex items-center justify-center p-4`}>
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00C6FF]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#9D50BB]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Signup Card */}
      <div className={`${themeClasses.bgCard} rounded-2xl border ${themeClasses.border} p-8 w-full max-w-md ${themeClasses.shadow} relative z-10 my-8`}>
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl mb-2 ${themeClasses.textPrimary}`}>Create Account</h2>
          <p className={themeClasses.textSecondary}>Join Flowversal and automate your workflows</p>
        </div>
        {/* Google Signup Button */}
        <button
          onClick={handleGoogleSignup}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg border ${themeClasses.border} ${themeClasses.textPrimary} ${themeClasses.borderHover} transition-all flex items-center justify-center gap-3 mb-6 group hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex-1 h-px ${themeClasses.divider}`}></div>
          <span className={`text-sm ${themeClasses.textSecondary}`}>or</span>
          <div className={`flex-1 h-px ${themeClasses.divider}`}></div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
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
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className={`block mb-2 ${themeClasses.textSecondary} text-sm`}>Confirm Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textTertiary}`} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
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
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-center">{isLoading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        {/* Terms */}
        <p className={`text-xs ${themeClasses.textSecondary} text-center mt-4`}>
          By signing up, you agree to our{' '}
          <a href="#" className="text-[#00C6FF] hover:text-[#0072FF]">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-[#00C6FF] hover:text-[#0072FF]">
            Privacy Policy
          </a>
        </p>

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
          <div className="mt-4 text-sm text-red-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}