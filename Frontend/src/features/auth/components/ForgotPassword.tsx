import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { useAppThemeStore, getThemeClasses } from '@/core/stores/app/themeStore';
import { useAuth } from '@/core/auth/AuthContext';
import flowversalLogoDark from 'figma:asset/6002bc04b2fb15d40304d81c459c74499954d9ad.png';
import flowversalLogoLight from 'figma:asset/a343b12e588be649c0fd15261a16aac9163083d0.png';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const { theme } = useAppThemeStore();
  const themeClasses = getThemeClasses(theme);
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await resetPassword(email);

    if (result.success) {
      setEmailSent(true);
    } else {
      setError(result.error || 'Failed to send reset email');
    }

    setIsLoading(false);
  };

  return (
    <div className={`min-h-screen ${themeClasses.bgMain} flex items-center justify-center p-4`}>
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#00C6FF]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[#9D50BB]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Forgot Password Card */}
      <div className={`${themeClasses.bgCard} rounded-2xl border ${themeClasses.border} p-8 w-full max-w-md ${themeClasses.shadow} relative z-10`}>
        {!emailSent ? (
          <>
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <img 
                  src={theme === 'dark' ? flowversalLogoDark : flowversalLogoLight} 
                  alt="Flowversal" 
                  className="h-8" 
                />
              </div>
              <h2 className={`text-3xl mb-2 ${themeClasses.textPrimary}`}>Forgot Password?</h2>
              <p className={themeClasses.textSecondary}>
                No worries! Enter your email and we'll send you reset instructions
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className={`block mb-2 ${themeClasses.textSecondary} text-sm`}>Email Address</label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${themeClasses.textSecondary}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full ${themeClasses.bgInput} border ${themeClasses.border} rounded-lg pl-11 pr-4 py-3 ${themeClasses.textPrimary} placeholder:${themeClasses.textSecondary} focus:outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="text-center">
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </span>
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <h2 className={`text-2xl mb-3 ${themeClasses.textPrimary}`}>Check Your Email</h2>
              <p className={`${themeClasses.textSecondary} mb-4`}>
                We've sent access instructions to
              </p>
              <p className={`${themeClasses.textPrimary} mb-6 font-semibold`}>{email}</p>

              <div className={`${themeClasses.bgInput} border ${themeClasses.border} rounded-xl p-4 mb-6`}>
                <h3 className={`text-sm font-medium ${themeClasses.textPrimary} mb-2`}>Check your email!</h3>
                <p className={`${themeClasses.textSecondary} text-sm mb-4`}>
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <div className={`text-xs ${themeClasses.textSecondary} pt-3 border-t ${themeClasses.border}`}>
                  <p>
                    Didn't receive the email? Check your spam folder or{' '}
                    <button
                      onClick={() => setEmailSent(false)}
                      className="text-[#00C6FF] hover:text-[#0072FF]"
                    >
                      try again
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Back to Login Link */}
        <button
          onClick={onBackToLogin}
          className={`w-full flex items-center justify-center gap-2 mt-6 ${themeClasses.textSecondary} hover:text-[#00C6FF] transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>
      </div>
    </div>
  );
}