import { User, CreditCard, Lightbulb, HeadphonesIcon, X } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

interface SettingsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  onSubscriptionClick: () => void;
  onUserGuideClick: () => void;
  onSupportClick: () => void;
}

export function SettingsDropdown({
  isOpen,
  onClose,
  onProfileClick,
  onSubscriptionClick,
  onUserGuideClick,
  onSupportClick,
}: SettingsDropdownProps) {
  const { theme } = useTheme();

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  if (!isOpen) return null;

  const menuItems = [
    { icon: User, label: 'Profile', onClick: onProfileClick },
    { icon: CreditCard, label: 'Subscription', onClick: onSubscriptionClick },
    { icon: Lightbulb, label: 'Start User Guide', onClick: onUserGuideClick },
    { icon: HeadphonesIcon, label: 'Support', onClick: onSupportClick },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose}></div>

      {/* Dropdown */}
      <div
        className={`fixed left-64 bottom-20 ${bgCard} border ${borderColor} rounded-xl shadow-2xl z-50 w-64 overflow-hidden`}
      >
        <div className="p-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} rounded-lg transition-colors text-left`}
              >
                <Icon className={`w-5 h-5 ${textSecondary}`} />
                <span className={textPrimary}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
