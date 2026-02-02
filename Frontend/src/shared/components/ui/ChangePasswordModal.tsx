import { X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useModal } from '@/core/stores/ModalContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { theme } = useTheme();
  const { showError } = useModal();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const bgModal = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      showError('Password Mismatch', 'Passwords do not match! Please make sure both passwords are identical.');
      return;
    }
    console.log('Change password');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={`${bgModal} rounded-2xl max-w-xl w-full border ${borderColor} shadow-2xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderColor}`}>
          <h2 className={`text-xl ${textPrimary}`}>Change Password</h2>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg ${inputBg} border ${borderColor} flex items-center justify-center hover:border-[#00C6FF]/50 transition-all`}
          >
            <X className={`w-4 h-4 ${textSecondary}`} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email (Read-only) */}
          <div>
            <label className={`block mb-2 ${textSecondary} text-sm`}>Email</label>
            <input
              type="email"
              value="justin@gmail.com"
              disabled
              className={`w-full ${inputBg} border ${borderColor} rounded-lg px-4 py-2.5 ${textSecondary} cursor-not-allowed`}
            />
          </div>

          {/* Current Password */}
          <div>
            <label className={`block mb-2 ${textSecondary} text-sm`}>Current Password</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="Enter current password"
              className={`w-full ${inputBg} border ${borderColor} rounded-lg px-4 py-2.5 ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className={`block mb-2 ${textSecondary} text-sm`}>New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Enter new password"
              className={`w-full ${inputBg} border ${borderColor} rounded-lg px-4 py-2.5 ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className={`block mb-2 ${textSecondary} text-sm`}>Confirm New Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              className={`w-full ${inputBg} border ${borderColor} rounded-lg px-4 py-2.5 ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] via-[#0072FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all flex items-center justify-center hover:scale-105"
            >
              <span className="text-center">Change Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
