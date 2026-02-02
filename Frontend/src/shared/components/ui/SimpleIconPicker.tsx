/**
 * Simple Icon Picker - Actually works with Lucide React icons
 */

import { useState } from 'react';
import { 
  Briefcase, Rocket, Target, Zap, Star, Flag, Award, Compass, Heart, Lightbulb,
  Code, Database, Mail, Phone, Calendar, Clock, CheckSquare, Folder, Users,
  LayoutGrid, Trello, List, Bookmark, Package, Gift, ShoppingCart, Cpu,
  Cloud, Camera, Palette, Pencil, Brush, Globe, Share2, TrendingUp, BarChart,
  Settings, Bell, Lock, Key, Shield, Search, Filter, Edit, Trash, Download,
  Upload, Send, Inbox, File, FileText, Image, Video, Music, Headphones,
  MessageCircle, AtSign, Hash, Repeat, ThumbsUp, Eye, Sun, Moon, ChevronRight,
  Plus, X, Check, AlertCircle, Info, HelpCircle, Sparkles, Gem, Crown, Diamond
} from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

const ICONS_MAP = {
  // Business
  Briefcase, TrendingUp, BarChart, Target, Award, Flag,
  // Tech
  Code, Database, Cpu, Cloud, Zap, Settings,
  // Creative
  Palette, Pencil, Brush, Camera, Image, Sparkles,
  // Communication
  Mail, Phone, MessageCircle, AtSign, Send, Inbox,
  // Productivity
  Calendar, Clock, CheckSquare, Folder, FileText, File,
  // Social
  Users, Globe, Share2, Heart, ThumbsUp, Eye,
  // Project
  Rocket, Compass, Star, Lightbulb, Gift, Package,
  // Board
  LayoutGrid, Trello, List, Bookmark, Gem, Crown, Diamond,
  // Actions
  Plus, Edit, Trash, Download, Upload, Search, Filter,
  // Status
  Check, X, AlertCircle, Info, HelpCircle, Bell, Lock, Key, Shield,
  // Media
  Video, Music, Headphones, Hash, Repeat,
  // UI
  Sun, Moon, ChevronRight, ShoppingCart
};

const ICON_NAMES = Object.keys(ICONS_MAP);

interface SimpleIconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
  onBrowseAll?: () => void;
}

export function SimpleIconPicker({ selectedIcon, onSelectIcon, onBrowseAll }: SimpleIconPickerProps) {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  const filteredIcons = search.trim()
    ? ICON_NAMES.filter(name => name.toLowerCase().includes(search.toLowerCase()))
    : ICON_NAMES;

  return (
    <div>
      {/* Search */}
      <div className="relative mb-3">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons..."
          className={`w-full pl-10 pr-4 py-2 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
        />
      </div>

      {/* Icon Grid */}
      <div className={`${bgCard} rounded-lg border ${borderColor} p-3 max-h-48 overflow-y-auto`}>
        <div className="grid grid-cols-8 gap-2">
          {filteredIcons.map((iconName) => {
            const IconComponent = ICONS_MAP[iconName as keyof typeof ICONS_MAP];
            const isSelected = iconName === selectedIcon;
            
            return (
              <button
                key={iconName}
                onClick={() => onSelectIcon(iconName)}
                className={`p-2 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-[#00C6FF] bg-[#00C6FF]/10 scale-110'
                    : `${borderColor} ${hoverBg}`
                }`}
                title={iconName}
              >
                <IconComponent className="w-4 h-4 mx-auto" />
              </button>
            );
          })}
        </div>
      </div>

      <p className={`text-xs ${textSecondary} mt-2 text-center`}>
        {filteredIcons.length} icons available
      </p>
    </div>
  );
}

// Helper to render any icon by name
export function RenderIconByName({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const IconComponent = ICONS_MAP[name as keyof typeof ICONS_MAP];
  if (!IconComponent) return <Briefcase className={className} style={style} />;
  return <IconComponent className={className} style={style} />;
}
