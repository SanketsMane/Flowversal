/**
 * Admin Login Page
 * Secure login for admin panel access only - SEPARATE from main app auth
 */

import React, { useState } from 'react';
import { Sparkles, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useAdminUsersStore } from '@/core/stores/admin/adminUsersStore';
import { useAdminAuthStore } from '@/core/stores/admin/adminAuthStore';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { validateAdminCredentials, updateLastLogin } = useAdminUsersStore();
  const { loginAdmin } = useAdminAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validate admin credentials
    const adminUser = validateAdminCredentials(email, password);

    if (adminUser) {
      // Update last login time
      updateLastLogin(adminUser.id);

      // Set admin session in admin auth store (separate from main app)
      loginAdmin(adminUser.id, adminUser.email, adminUser.name, adminUser.role);
    } else {
      setError('Invalid email or password. Please try again.');
    }

    setLoading(false);
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setError('');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sending reset email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setError('');
    alert(`Password reset instructions have been sent to ${email}.\n\nFor demo purposes, use:\nEmail: admin@admin.com\nPassword: admin@123`);
    setShowForgotPassword(false);
    setLoading(false);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-[#0E0E1F] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-[#CFCFE8]">Enter your email to receive reset instructions</p>
          </div>

          {/* Reset Form */}
          <div className="bg-[#1A1A2E] border border-[#2A2A3E] rounded-xl p-8">
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CFCFE8]" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@admin.com"
                    className="pl-10 bg-[#0E0E1F] border-[#2A2A3E] text-white placeholder:text-[#6B6B8D] focus:border-[#00C6FF]"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#00C6FF] to-[#0072FF] hover:shadow-lg hover:shadow-[#00C6FF]/50 text-white"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  variant="outline"
                  className="w-full border-[#2A2A3E] text-[#CFCFE8] hover:text-white hover:bg-[#2A2A3E]"
                >
                  Back to Login
                </Button>
              </div>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-400 text-center">
                For security reasons, password reset is only available to registered admin accounts.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E1F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-[#CFCFE8]">Sign in to access the admin dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#1A1A2E] border border-[#2A2A3E] rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CFCFE8]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@admin.com"
                  className="pl-10 bg-[#0E0E1F] border-[#2A2A3E] text-white placeholder:text-[#6B6B8D] focus:border-[#00C6FF]"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CFCFE8]" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 bg-[#0E0E1F] border-[#2A2A3E] text-white placeholder:text-[#6B6B8D] focus:border-[#00C6FF]"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CFCFE8] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00C6FF] to-[#0072FF] hover:shadow-lg hover:shadow-[#00C6FF]/50 text-white"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-[#CFCFE8] hover:text-white transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-400 text-center">
              <strong>Demo Credentials:</strong><br />
              Email: admin@admin.com<br />
              Password: admin@123
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#6B6B8D]">
              Admin access is restricted. Only authorized users can sign in.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#6B6B8D]">
            Protected by Flowversal Security
          </p>
        </div>
      </div>
    </div>
  );
}