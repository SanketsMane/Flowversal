/**
 * Update Profile Modal
 * Allows users to update their profile details.
 * Matches the design from the user's screenshot.
 */

import { useAuth } from '@/core/auth/AuthContext';
import { Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateProfileModal({ isOpen, onClose }: UpdateProfileModalProps) {
  const { user, updateProfile } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  
  // State for form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize state from user object
  useEffect(() => {
    if (user) {
      // Split name into first and last name if possible
      const nameParts = (user.name || '').split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      
      // Note: Phone number is not currently in the User interface. 
      // If it becomes available in user metadata, we can map it here.
      // e.g. setPhone(user.user_metadata?.phone || '');
    }
  }, [user, isOpen]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isOpen || !isMounted) return null;

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const { success, error } = await updateProfile({ name: fullName });
      
      if (success) {
        toast.success('Profile updated successfully');
        onClose();
      } else {
        toast.error(error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Update Profile</h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Photo</label>
            <div className="border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30 h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-50/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center shadow-lg text-white">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-900">Drag your image here</p>
                <p className="text-[10px] text-gray-500 mt-0.5">(Only *.jpeg and *.png images will be accepted)</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:border-[#00C6FF] focus:ring-2 focus:ring-[#00C6FF]/10 transition-all text-sm text-gray-900"
                placeholder="First Name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:border-[#00C6FF] focus:ring-2 focus:ring-[#00C6FF]/10 transition-all text-sm text-gray-900"
                placeholder="Last Name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:border-[#00C6FF] focus:ring-2 focus:ring-[#00C6FF]/10 transition-all text-sm text-gray-900"
                placeholder="Phone Number"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-70"
            >
              {isSubmitting ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
