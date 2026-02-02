import { Eye, Heart, Plus, Trash2, Edit, LucideIcon, Clock, ListPlus, FileCheck } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';

interface MyWorkflowCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  name: string;
  description: string;
  views: string;
  likes: string;
  isPro?: boolean;
  onClick?: () => void;
  // Additional MyWorkflows-specific props
  status: 'published' | 'pending' | 'rejected' | 'approved' | 'draft';
  createdDate: string;
  steps: number;
  onDelete?: () => void;
  onEdit?: () => void;
  onPlusClick?: (action: 'create' | 'attach') => void;
}

export function MyWorkflowCard({ 
  icon: Icon, 
  iconBgColor, 
  name, 
  description, 
  views, 
  likes,
  isPro = false,
  onClick,
  status,
  createdDate,
  steps,
  onDelete,
  onEdit,
  onPlusClick
}: MyWorkflowCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const { theme } = useTheme();

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  const getStatusBadge = () => {
    const badges = {
      published: {
        label: 'Published',
        bg: theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100',
        text: theme === 'dark' ? 'text-green-400' : 'text-green-700',
        border: theme === 'dark' ? 'border-green-500/30' : 'border-green-300',
      },
      pending: {
        label: 'Pending',
        bg: theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100',
        text: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700',
        border: theme === 'dark' ? 'border-yellow-500/30' : 'border-yellow-300',
      },
      approved: {
        label: 'Approved',
        bg: theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100',
        text: theme === 'dark' ? 'text-blue-400' : 'text-blue-700',
        border: theme === 'dark' ? 'border-blue-500/30' : 'border-blue-300',
      },
      rejected: {
        label: 'Rejected',
        bg: theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100',
        text: theme === 'dark' ? 'text-red-400' : 'text-red-700',
        border: theme === 'dark' ? 'border-red-500/30' : 'border-red-300',
      },
      draft: {
        label: 'Draft',
        bg: theme === 'dark' ? 'bg-gray-500/20' : 'bg-gray-100',
        text: theme === 'dark' ? 'text-gray-400' : 'text-gray-700',
        border: theme === 'dark' ? 'border-gray-500/30' : 'border-gray-300',
      },
    };

    const badge = badges[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${badge.bg} ${badge.text} ${badge.border}`}>
        {badge.label}
      </span>
    );
  };

  const showEditDelete = status === 'draft' || status === 'pending' || status === 'rejected';

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPlusMenu(!showPlusMenu);
  };

  const handleActionClick = (e: React.MouseEvent, action: 'create' | 'attach') => {
    e.stopPropagation();
    setShowPlusMenu(false);
    if (onPlusClick) {
      onPlusClick(action);
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowPlusMenu(false);
      }}
      className={`relative ${bgCard} rounded-xl p-4 border ${borderColor} transition-all duration-300 overflow-hidden cursor-pointer`}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 0 30px rgba(0,198,255,0.3)' : 'none'
      }}
    >
      {/* Gradient border on hover - full rounded corners */}
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 50%, #9D50BB 100%)',
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude'
          }}
        />
      )}

      {/* Top Row Layout: Icon (Left) | Status (Center) | Pro + Plus (Right) */}
      <div className="flex items-start justify-between mb-3">
        {/* Icon - Top Left */}
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
        </div>

        {/* Status Badge - Top Center */}
        <div className="flex-1 flex justify-center px-2">
          {getStatusBadge()}
        </div>

        {/* Right Section: Pro Badge + Plus Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Pro Badge */}
          {isPro && (
            <div className="px-2.5 py-1 rounded-md bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 border border-[#00C6FF]/30">
              <span className="text-xs text-[#00C6FF]">Pro</span>
            </div>
          )}

          {/* Plus Button with Dropdown - Only visible on hover */}
          {isHovered && (
            <div className="relative">
              <button 
                onClick={handlePlusClick}
                className={`w-7 h-7 rounded-lg ${theme === 'dark' ? 'bg-[#252540] border border-white/10 hover:border-[#00C6FF]/50' : 'bg-white border border-gray-200 hover:border-[#00C6FF]/50'} flex items-center justify-center hover:shadow-md transition-all group`}
              >
                <Plus className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} group-hover:text-[#00C6FF] transition-colors`} />
              </button>

              {showPlusMenu && (
                <div className={`absolute top-full right-0 mt-2 w-48 ${bgPanel} border ${borderColor} rounded-lg shadow-2xl overflow-hidden z-50`}>
                  <button
                    onClick={(e) => handleActionClick(e, 'create')}
                    className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} transition-colors text-left`}
                  >
                    <FileCheck className={`w-4 h-4 ${textSecondary}`} />
                    <div>
                      <p className={`${textPrimary} text-sm`}>Create Task</p>
                      <p className={`${textSecondary} text-xs`}>New task with workflow</p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleActionClick(e, 'attach')}
                    className={`w-full flex items-center gap-3 px-4 py-3 ${hoverBg} transition-colors text-left`}
                  >
                    <ListPlus className={`w-4 h-4 ${textSecondary}`} />
                    <div>
                      <p className={`${textPrimary} text-sm`}>Attach to Task</p>
                      <p className={`${textSecondary} text-xs`}>Link to existing task</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className={`${textPrimary} mb-2`}>{name}</h3>
      <p className={`${textSecondary} text-sm mb-4 line-clamp-2 min-h-[40px]`}>{description}</p>

      {/* Stats and Actions Row */}
      <div className={`flex items-center justify-between ${textSecondary} text-sm`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{views}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4" />
            <span>{likes}</span>
          </div>
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className={`w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-[#0E0E1F]/50' : 'bg-gray-100'} border ${borderColor} flex items-center justify-center hover:border-[#00C6FF]/50 transition-all group`}
        >
          <Heart 
            className={`w-4 h-4 transition-all ${
              isFavorited 
                ? 'fill-[#00C6FF] text-[#00C6FF]' 
                : `${textSecondary} group-hover:text-[#00C6FF]`
            }`} 
          />
        </button>
      </div>

      {/* Bottom Row: Workflow Metadata + Edit/Delete Buttons */}
      <div className={`flex items-center justify-between mt-4 pt-4 border-t ${borderColor}`}>
        {/* Workflow Metadata */}
        <div className={`flex items-center gap-2 ${textSecondary} text-xs`}>
          <span>{steps} {steps === 1 ? 'step' : 'steps'}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{createdDate}</span>
          </div>
        </div>

        {/* Edit/Delete Buttons (only for draft/pending/rejected) */}
        {showEditDelete && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className={`w-7 h-7 rounded-lg ${theme === 'dark' ? 'bg-[#0E0E1F]/50' : 'bg-gray-100'} border ${borderColor} flex items-center justify-center hover:border-blue-500/50 hover:bg-blue-500/10 transition-all`}
              >
                <Edit className="w-3.5 h-3.5 text-blue-500" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className={`w-7 h-7 rounded-lg ${theme === 'dark' ? 'bg-[#0E0E1F]/50' : 'bg-gray-100'} border ${borderColor} flex items-center justify-center hover:border-red-500/50 hover:bg-red-500/10 transition-all`}
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}