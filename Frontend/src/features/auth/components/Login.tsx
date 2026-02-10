import { useAuth } from '@/core/auth/AuthContext';
import { getThemeClasses, useAppThemeStore } from '@/core/stores/app/themeStore';
import { SetupGuide } from '@/shared/components/ui/SetupGuide';
import flowversalLogoDark from 'figma:asset/6002bc04b2fb15d40304d81c459c74499954d9ad.png';
import flowversalLogoLight from 'figma:asset/a343b12e588be649c0fd15261a16aac9163083d0.png';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, Settings } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
  onSignupClick: () => void;
  onForgotPasswordClick: () => void;
}

export function Login({ onLogin, onSignupClick, onForgotPasswordClick }: LoginProps) {
  const { theme } = useAppThemeStore();
  const themeClasses = getThemeClasses(theme);
  const { login, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        onLogin();
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        // OAuth will redirect, no need to do anything
      } else if (result.error === 'PROVIDER_NOT_ENABLED') {
        // Show setup guide automatically
        setShowSetupGuide(true);
        setError('');
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (err) {
      setError('Google login failed');
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

      {/* Setup Guide Button (Top Right) */}
      <button
        onClick={() => setShowSetupGuide(true)}
        className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-sm text-gray-400 hover:text-white transition-all"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Setup Google OAuth</span>
      </button>

      {/* Setup Guide Modal */}
      <SetupGuide isOpen={showSetupGuide} onClose={() => setShowSetupGuide(false)} />

      {/* Login Card */}
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
          <h2 className={`text-3xl mb-2 ${themeClasses.textPrimary}`}>Welcome Back</h2>
          <p className={themeClasses.textSecondary}>Sign in to continue to your dashboard</p>
        </div>

        {/* Google Login - Temporarily disabled for migration (BUG-010 fix)
        <button
          onClick={handleGoogleLogin}
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
          <span>Continue with Google</span>
        </button>
        */}

        {/* Divider - Only show when Google login is enabled
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex-1 h-px ${themeClasses.divider}`}></div>
          <span className={`text-sm ${themeClasses.textSecondary}`}>or</span>
          <div className={`flex-1 h-px ${themeClasses.divider}`}></div>
        </div>
        */}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
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

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-sm text-[#00C6FF] hover:text-[#0072FF] transition-colors"
              disabled={isLoading}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Sign Up Link */}
        <div className={`text-center mt-6 ${themeClasses.textSecondary}`}>
          Don't have an account?{' '}
          <button
            onClick={onSignupClick}
            className="text-[#00C6FF] hover:text-[#0072FF] transition-colors"
            disabled={isLoading}
          >
            Sign Up
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