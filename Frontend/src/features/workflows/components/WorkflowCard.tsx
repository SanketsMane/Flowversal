import { Eye, Heart, Plus, LucideIcon, ListPlus, FileCheck } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';

interface WorkflowCardProps {
  icon: LucideIcon | string;
  iconBgColor?: string;
  name: string;
  description: string;
  views?: string;
  likes?: string;
  isPro?: boolean;
  onClick?: () => void;
  onPlusClick?: (action: 'create' | 'attach') => void;
}

export function WorkflowCard({ 
  icon, 
  iconBgColor = 'rgba(0, 114, 255, 0.2)', 
  name, 
  description, 
  views = '0', 
  likes = '0',
  isPro = false,
  onClick,
  onPlusClick
}: WorkflowCardProps) {
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
  
  // Check if icon is a string (emoji) or a Lucide component
  const isEmojiIcon = typeof icon === 'string';
  const Icon = isEmojiIcon ? null : icon;

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
      
      {/* Pro Badge - positioned at top right, shifts left on hover when plus button appears */}
      {isPro && (
        <div 
          className={`absolute top-3 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 border border-[#00C6FF]/30 transition-all duration-300 ${isHovered ? 'right-12' : 'right-3'}`}
        >
          <span className="text-xs text-[#00C6FF]">Pro</span>
        </div>
      )}

      {/* Add Button with Dropdown - Only visible on hover */}
      {isHovered && (
        <div className="absolute top-3 right-3 z-10">
          <button 
            onClick={handlePlusClick}
            className={`w-7 h-7 rounded-lg ${theme === 'dark' ? 'bg-[#252540] border border-white/10 hover:border-[#00C6FF]/50' : 'bg-white border border-gray-200 hover:border-[#00C6FF]/50'} flex items-center justify-center hover:shadow-md transition-all group`}
          >
            <Plus className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} group-hover:text-[#00C6FF] transition-colors`} />
          </button>

          {showPlusMenu && (
            <div className={`absolute top-full right-0 mt-2 w-48 ${bgPanel} border ${borderColor} rounded-lg shadow-2xl overflow-hidden`}>
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

      {/* Icon */}
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: iconBgColor }}
      >
        {isEmojiIcon ? (
          <span className="text-2xl">{icon}</span>
        ) : Icon ? (
          <Icon className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
        ) : null}
      </div>

      {/* Content */}
      <h3 className={`${textPrimary} mb-2`}>{name}</h3>
      <p className={`${textSecondary} text-sm mb-4 line-clamp-2 min-h-[40px]`}>{description}</p>

      {/* Stats */}
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
    </div>
  );
}