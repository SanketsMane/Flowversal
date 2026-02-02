/**
 * Comprehensive Icon Library - 280+ Icons
 * Categories: Marketing, Support, Ecommerce, Project, AI, Engineering, HR, Business, Office, Technology
 */

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import {
  // Core Marketing (23 icons)
  TrendingUp, BarChart, PieChart, LineChart, Target, Megaphone, 
  Users, Globe, Share2, Heart, ThumbsUp, Eye, Star, Award, Trophy,
  Mail, MessageCircle, AtSign, Send, Rss, Radio, Tv, Newspaper,
  
  // Digital Marketing (20 icons)
  MousePointer, MousePointerClick, Activity, Presentation,
  BadgeDollarSign, TrendingDown,
  Sparkles, ExternalLink,
  
  // Customer Support (20 icons)
  Headphones, MessageSquare, MessagesSquare, HelpCircle, LifeBuoy,
  PhoneIncoming, PhoneOutgoing, Smile, Frown, Meh,
  
  // Ecommerce (20 icons)
  ShoppingCart, ShoppingBag, Store, Package, Box, Gift,
  CreditCard, Wallet, Receipt, DollarSign, Coins, BadgePercent,
  Truck, PackagePlus, PackageMinus, PackageSearch, Boxes, Container,
  
  // Project Management (20 icons)
  Briefcase, FolderKanban, CheckSquare, ClipboardList, ListChecks, 
  Calendar, Clock, Timer, Flag, Bookmark, 
  Rocket, Zap, Layout, 
  LayoutGrid, Trello, List, FileText, File, Files, FolderOpen,
  
  // AI & Machine Learning (13 icons)
  Brain, Cpu, BrainCircuit, Wand2, Bot, Binary, Network,
  Workflow, GitBranch, GitMerge, Share, Shuffle, Repeat, Layers,
  
  // Engineering & Development (20 icons)
  Code, Terminal, CodeSquare, Braces, GitBranchPlus, Github,
  Database, Server, Cloud, HardDrive, Laptop, Monitor, Smartphone,
  Wifi, Usb, Plug, Settings, Wrench, Hammer, Bug,
  
  // HR & People (10 icons)
  UserPlus, UserCheck, UserMinus, UserX, UsersRound, UserCog,
  UserSquare, UserCircle, Contact, IdCard,
  GraduationCap, School, BookOpen, LibraryBig,
  
  // Business & Finance (19 icons)
  Calculator, PiggyBank, BarChart2, BarChart3, BarChart4,
  Building, Building2, FileSpreadsheet,
  
  // Office & Productivity (20 icons)
  FileCheck, FilePlus, FileMinus, FileEdit, FolderPlus, FolderCheck,
  Archive, Inbox, Trash, Download, Upload, Save, Copy, Clipboard,
  ClipboardCheck, ClipboardCopy, ClipboardPaste, Pencil, Edit, Edit2,
  
  // Technology & Communication (20 icons)
  Phone, PhoneCall, Video, Mic, Speaker, Music, Image,
  Camera, Film, PlayCircle, PauseCircle, StopCircle, SkipForward,
  Hash, Link, Link2, Unlink, QrCode, ScanLine, Fingerprint, Shield,
  
  // UI & Navigation (18 icons)
  Home, Menu, Plus, Minus, Check, ChevronRight, ChevronLeft,
  ChevronUp, ChevronDown, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Maximize, Minimize, ZoomIn, ZoomOut, Search as SearchIcon,
  
  // Status & Alerts (14 icons)
  AlertCircle, AlertTriangle, Info, CheckCircle, XCircle,
  Bell, BellRing, BellOff, Lock, Unlock, Key,
  ShieldCheck, ShieldAlert,
  
  // Creative & Design (14 icons)
  Palette, Brush, Paintbrush, Pipette, Droplet,
  Scissors, Stamp, Sticker, Shapes, Circle, Square, Triangle, Hexagon,
  Pentagon,
  
  // Other (14 icons)
  MapPin, Map, Compass, Navigation, Anchor, Flame, Lightbulb, Sun,
  Moon, Stars, CloudRain, Coffee, Pizza, Plane,
  Tag, Tags, Percent
} from 'lucide-react';

export interface IconOption {
  name: string;
  component: React.ComponentType<{ className?: string }>;
  category: string;
}

// Explicitly define all icons with their categories
export const ICON_LIBRARY: IconOption[] = [
  // Marketing & Digital Marketing (43 icons)
  { name: 'TrendingUp', component: TrendingUp, category: 'Marketing' },
  { name: 'BarChart', component: BarChart, category: 'Marketing' },
  { name: 'PieChart', component: PieChart, category: 'Marketing' },
  { name: 'LineChart', component: LineChart, category: 'Marketing' },
  { name: 'Target', component: Target, category: 'Marketing' },
  { name: 'Megaphone', component: Megaphone, category: 'Marketing' },
  { name: 'Users', component: Users, category: 'Marketing' },
  { name: 'Globe', component: Globe, category: 'Marketing' },
  { name: 'Share2', component: Share2, category: 'Marketing' },
  { name: 'Heart', component: Heart, category: 'Marketing' },
  { name: 'ThumbsUp', component: ThumbsUp, category: 'Marketing' },
  { name: 'Eye', component: Eye, category: 'Marketing' },
  { name: 'Star', component: Star, category: 'Marketing' },
  { name: 'Award', component: Award, category: 'Marketing' },
  { name: 'Trophy', component: Trophy, category: 'Marketing' },
  { name: 'Mail', component: Mail, category: 'Marketing' },
  { name: 'MessageCircle', component: MessageCircle, category: 'Marketing' },
  { name: 'AtSign', component: AtSign, category: 'Marketing' },
  { name: 'Send', component: Send, category: 'Marketing' },
  { name: 'Rss', component: Rss, category: 'Marketing' },
  { name: 'Radio', component: Radio, category: 'Marketing' },
  { name: 'Tv', component: Tv, category: 'Marketing' },
  { name: 'Newspaper', component: Newspaper, category: 'Marketing' },
  { name: 'MousePointer', component: MousePointer, category: 'Marketing' },
  { name: 'MousePointerClick', component: MousePointerClick, category: 'Marketing' },
  { name: 'Activity', component: Activity, category: 'Marketing' },
  { name: 'Presentation', component: Presentation, category: 'Marketing' },
  { name: 'BadgeDollarSign', component: BadgeDollarSign, category: 'Marketing' },
  { name: 'TrendingDown', component: TrendingDown, category: 'Marketing' },
  { name: 'Sparkles', component: Sparkles, category: 'Marketing' },
  { name: 'ExternalLink', component: ExternalLink, category: 'Marketing' },
  { name: 'UserPlus', component: UserPlus, category: 'Marketing' },
  { name: 'UsersRound', component: UsersRound, category: 'Marketing' },
  { name: 'Rocket', component: Rocket, category: 'Marketing' },
  { name: 'Tag', component: Tag, category: 'Marketing' },
  { name: 'Tags', component: Tags, category: 'Marketing' },
  { name: 'Percent', component: Percent, category: 'Marketing' },
  { name: 'Share', component: Share2, category: 'Marketing' },

  // Customer Support (22 icons)
  { name: 'Headphones', component: Headphones, category: 'Support' },
  { name: 'MessageSquare', component: MessageSquare, category: 'Support' },
  { name: 'MessagesSquare', component: MessagesSquare, category: 'Support' },
  { name: 'HelpCircle', component: HelpCircle, category: 'Support' },
  { name: 'LifeBuoy', component: LifeBuoy, category: 'Support' },
  { name: 'PhoneCall', component: PhoneCall, category: 'Support' },
  { name: 'PhoneIncoming', component: PhoneIncoming, category: 'Support' },
  { name: 'PhoneOutgoing', component: PhoneOutgoing, category: 'Support' },
  { name: 'UserCheck', component: UserCheck, category: 'Support' },
  { name: 'UserCog', component: UserCog, category: 'Support' },
  { name: 'ClipboardList', component: ClipboardList, category: 'Support' },
  { name: 'CheckCircle', component: CheckCircle, category: 'Support' },
  { name: 'Clock', component: Clock, category: 'Support' },
  { name: 'Timer', component: Timer, category: 'Support' },
  { name: 'Bell', component: Bell, category: 'Support' },
  { name: 'BellRing', component: BellRing, category: 'Support' },
  { name: 'AlertCircle', component: AlertCircle, category: 'Support' },
  { name: 'Info', component: Info, category: 'Support' },
  { name: 'ShieldCheck', component: ShieldCheck, category: 'Support' },
  { name: 'Smile', component: Smile, category: 'Support' },
  { name: 'Frown', component: Frown, category: 'Support' },
  { name: 'Meh', component: Meh, category: 'Support' },

  // Ecommerce (20 icons)
  { name: 'ShoppingCart', component: ShoppingCart, category: 'Ecommerce' },
  { name: 'ShoppingBag', component: ShoppingBag, category: 'Ecommerce' },
  { name: 'Store', component: Store, category: 'Ecommerce' },
  { name: 'Package', component: Package, category: 'Ecommerce' },
  { name: 'Box', component: Box, category: 'Ecommerce' },
  { name: 'Gift', component: Gift, category: 'Ecommerce' },
  { name: 'CreditCard', component: CreditCard, category: 'Ecommerce' },
  { name: 'Wallet', component: Wallet, category: 'Ecommerce' },
  { name: 'Receipt', component: Receipt, category: 'Ecommerce' },
  { name: 'DollarSign', component: DollarSign, category: 'Ecommerce' },
  { name: 'Coins', component: Coins, category: 'Ecommerce' },
  { name: 'BadgePercent', component: BadgePercent, category: 'Ecommerce' },
  { name: 'Truck', component: Truck, category: 'Ecommerce' },
  { name: 'PackagePlus', component: PackagePlus, category: 'Ecommerce' },
  { name: 'PackageMinus', component: PackageMinus, category: 'Ecommerce' },
  { name: 'PackageSearch', component: PackageSearch, category: 'Ecommerce' },
  { name: 'Boxes', component: Boxes, category: 'Ecommerce' },
  { name: 'Container', component: Container, category: 'Ecommerce' },
  { name: 'Building', component: Building, category: 'Ecommerce' },
  { name: 'Building2', component: Building2, category: 'Ecommerce' },

  // Project Management (20 icons)
  { name: 'Briefcase', component: Briefcase, category: 'Project' },
  { name: 'FolderKanban', component: FolderKanban, category: 'Project' },
  { name: 'CheckSquare', component: CheckSquare, category: 'Project' },
  { name: 'ListChecks', component: ListChecks, category: 'Project' },
  { name: 'Calendar', component: Calendar, category: 'Project' },
  { name: 'Flag', component: Flag, category: 'Project' },
  { name: 'Bookmark', component: Bookmark, category: 'Project' },
  { name: 'Zap', component: Zap, category: 'Project' },
  { name: 'Layout', component: Layout, category: 'Project' },
  { name: 'LayoutGrid', component: LayoutGrid, category: 'Project' },
  { name: 'Trello', component: Trello, category: 'Project' },
  { name: 'List', component: List, category: 'Project' },
  { name: 'FileText', component: FileText, category: 'Project' },
  { name: 'File', component: File, category: 'Project' },
  { name: 'Files', component: Files, category: 'Project' },
  { name: 'FolderOpen', component: FolderOpen, category: 'Project' },

  // AI & Machine Learning (13 icons)
  { name: 'Brain', component: Brain, category: 'AI' },
  { name: 'Cpu', component: Cpu, category: 'AI' },
  { name: 'BrainCircuit', component: BrainCircuit, category: 'AI' },
  { name: 'Wand2', component: Wand2, category: 'AI' },
  { name: 'Bot', component: Bot, category: 'AI' },
  { name: 'Binary', component: Binary, category: 'AI' },
  { name: 'Network', component: Network, category: 'AI' },
  { name: 'Workflow', component: Workflow, category: 'AI' },
  { name: 'GitBranch', component: GitBranch, category: 'AI' },
  { name: 'GitMerge', component: GitMerge, category: 'AI' },
  { name: 'Shuffle', component: Shuffle, category: 'AI' },
  { name: 'Repeat', component: Repeat, category: 'AI' },
  { name: 'Layers', component: Layers, category: 'AI' },

  // Engineering (20 icons)
  { name: 'Code', component: Code, category: 'Engineering' },
  { name: 'Terminal', component: Terminal, category: 'Engineering' },
  { name: 'CodeSquare', component: CodeSquare, category: 'Engineering' },
  { name: 'Braces', component: Braces, category: 'Engineering' },
  { name: 'GitBranchPlus', component: GitBranchPlus, category: 'Engineering' },
  { name: 'Github', component: Github, category: 'Engineering' },
  { name: 'Database', component: Database, category: 'Engineering' },
  { name: 'Server', component: Server, category: 'Engineering' },
  { name: 'Cloud', component: Cloud, category: 'Engineering' },
  { name: 'HardDrive', component: HardDrive, category: 'Engineering' },
  { name: 'Laptop', component: Laptop, category: 'Engineering' },
  { name: 'Monitor', component: Monitor, category: 'Engineering' },
  { name: 'Smartphone', component: Smartphone, category: 'Engineering' },
  { name: 'Wifi', component: Wifi, category: 'Engineering' },
  { name: 'Usb', component: Usb, category: 'Engineering' },
  { name: 'Plug', component: Plug, category: 'Engineering' },
  { name: 'Settings', component: Settings, category: 'Engineering' },
  { name: 'Wrench', component: Wrench, category: 'Engineering' },
  { name: 'Hammer', component: Hammer, category: 'Engineering' },
  { name: 'Bug', component: Bug, category: 'Engineering' },

  // HR & People (14 icons)
  { name: 'UserMinus', component: UserMinus, category: 'HR' },
  { name: 'UserX', component: UserX, category: 'HR' },
  { name: 'UserSquare', component: UserSquare, category: 'HR' },
  { name: 'UserCircle', component: UserCircle, category: 'HR' },
  { name: 'Contact', component: Contact, category: 'HR' },
  { name: 'IdCard', component: IdCard, category: 'HR' },
  { name: 'GraduationCap', component: GraduationCap, category: 'HR' },
  { name: 'School', component: School, category: 'HR' },
  { name: 'BookOpen', component: BookOpen, category: 'HR' },
  { name: 'LibraryBig', component: LibraryBig, category: 'HR' },

  // Business & Finance (8 icons)
  { name: 'Calculator', component: Calculator, category: 'Business' },
  { name: 'PiggyBank', component: PiggyBank, category: 'Business' },
  { name: 'BarChart2', component: BarChart2, category: 'Business' },
  { name: 'BarChart3', component: BarChart3, category: 'Business' },
  { name: 'BarChart4', component: BarChart4, category: 'Business' },
  { name: 'FileSpreadsheet', component: FileSpreadsheet, category: 'Business' },

  // Office & Productivity (20 icons)
  { name: 'FileCheck', component: FileCheck, category: 'Office' },
  { name: 'FilePlus', component: FilePlus, category: 'Office' },
  { name: 'FileMinus', component: FileMinus, category: 'Office' },
  { name: 'FileEdit', component: FileEdit, category: 'Office' },
  { name: 'FolderPlus', component: FolderPlus, category: 'Office' },
  { name: 'FolderCheck', component: FolderCheck, category: 'Office' },
  { name: 'Archive', component: Archive, category: 'Office' },
  { name: 'Inbox', component: Inbox, category: 'Office' },
  { name: 'Trash', component: Trash, category: 'Office' },
  { name: 'Download', component: Download, category: 'Office' },
  { name: 'Upload', component: Upload, category: 'Office' },
  { name: 'Save', component: Save, category: 'Office' },
  { name: 'Copy', component: Copy, category: 'Office' },
  { name: 'Clipboard', component: Clipboard, category: 'Office' },
  { name: 'ClipboardCheck', component: ClipboardCheck, category: 'Office' },
  { name: 'ClipboardCopy', component: ClipboardCopy, category: 'Office' },
  { name: 'ClipboardPaste', component: ClipboardPaste, category: 'Office' },
  { name: 'Pencil', component: Pencil, category: 'Office' },
  { name: 'Edit', component: Edit, category: 'Office' },
  { name: 'Edit2', component: Edit2, category: 'Office' },

  // Technology & Communication (20 icons)
  { name: 'Phone', component: Phone, category: 'Technology' },
  { name: 'Video', component: Video, category: 'Technology' },
  { name: 'Mic', component: Mic, category: 'Technology' },
  { name: 'Speaker', component: Speaker, category: 'Technology' },
  { name: 'Music', component: Music, category: 'Technology' },
  { name: 'Image', component: Image, category: 'Technology' },
  { name: 'Camera', component: Camera, category: 'Technology' },
  { name: 'Film', component: Film, category: 'Technology' },
  { name: 'PlayCircle', component: PlayCircle, category: 'Technology' },
  { name: 'PauseCircle', component: PauseCircle, category: 'Technology' },
  { name: 'StopCircle', component: StopCircle, category: 'Technology' },
  { name: 'SkipForward', component: SkipForward, category: 'Technology' },
  { name: 'Hash', component: Hash, category: 'Technology' },
  { name: 'Link', component: Link, category: 'Technology' },
  { name: 'Link2', component: Link2, category: 'Technology' },
  { name: 'Unlink', component: Unlink, category: 'Technology' },
  { name: 'QrCode', component: QrCode, category: 'Technology' },
  { name: 'ScanLine', component: ScanLine, category: 'Technology' },
  { name: 'Fingerprint', component: Fingerprint, category: 'Technology' },
  { name: 'Shield', component: Shield, category: 'Technology' },

  // UI & Navigation (18 icons)
  { name: 'Home', component: Home, category: 'UI' },
  { name: 'Menu', component: Menu, category: 'UI' },
  { name: 'Plus', component: Plus, category: 'UI' },
  { name: 'Minus', component: Minus, category: 'UI' },
  { name: 'Check', component: Check, category: 'UI' },
  { name: 'ChevronRight', component: ChevronRight, category: 'UI' },
  { name: 'ChevronLeft', component: ChevronLeft, category: 'UI' },
  { name: 'ChevronUp', component: ChevronUp, category: 'UI' },
  { name: 'ChevronDown', component: ChevronDown, category: 'UI' },
  { name: 'ArrowRight', component: ArrowRight, category: 'UI' },
  { name: 'ArrowLeft', component: ArrowLeft, category: 'UI' },
  { name: 'ArrowUp', component: ArrowUp, category: 'UI' },
  { name: 'ArrowDown', component: ArrowDown, category: 'UI' },
  { name: 'Maximize', component: Maximize, category: 'UI' },
  { name: 'Minimize', component: Minimize, category: 'UI' },
  { name: 'ZoomIn', component: ZoomIn, category: 'UI' },
  { name: 'ZoomOut', component: ZoomOut, category: 'UI' },
  { name: 'SearchIcon', component: SearchIcon, category: 'UI' },

  // Status & Alerts (11 icons)
  { name: 'AlertTriangle', component: AlertTriangle, category: 'Status' },
  { name: 'XCircle', component: XCircle, category: 'Status' },
  { name: 'BellOff', component: BellOff, category: 'Status' },
  { name: 'Lock', component: Lock, category: 'Status' },
  { name: 'Unlock', component: Unlock, category: 'Status' },
  { name: 'Key', component: Key, category: 'Status' },
  { name: 'ShieldAlert', component: ShieldAlert, category: 'Status' },

  // Creative & Design (14 icons)
  { name: 'Palette', component: Palette, category: 'Creative' },
  { name: 'Brush', component: Brush, category: 'Creative' },
  { name: 'Paintbrush', component: Paintbrush, category: 'Creative' },
  { name: 'Pipette', component: Pipette, category: 'Creative' },
  { name: 'Droplet', component: Droplet, category: 'Creative' },
  { name: 'Scissors', component: Scissors, category: 'Creative' },
  { name: 'Stamp', component: Stamp, category: 'Creative' },
  { name: 'Sticker', component: Sticker, category: 'Creative' },
  { name: 'Shapes', component: Shapes, category: 'Creative' },
  { name: 'Circle', component: Circle, category: 'Creative' },
  { name: 'Square', component: Square, category: 'Creative' },
  { name: 'Triangle', component: Triangle, category: 'Creative' },
  { name: 'Hexagon', component: Hexagon, category: 'Creative' },
  { name: 'Pentagon', component: Pentagon, category: 'Creative' },

  // Other (14 icons)
  { name: 'MapPin', component: MapPin, category: 'Other' },
  { name: 'Map', component: Map, category: 'Other' },
  { name: 'Compass', component: Compass, category: 'Other' },
  { name: 'Navigation', component: Navigation, category: 'Other' },
  { name: 'Anchor', component: Anchor, category: 'Other' },
  { name: 'Flame', component: Flame, category: 'Other' },
  { name: 'Lightbulb', component: Lightbulb, category: 'Other' },
  { name: 'Sun', component: Sun, category: 'Other' },
  { name: 'Moon', component: Moon, category: 'Other' },
  { name: 'Stars', component: Stars, category: 'Other' },
  { name: 'CloudRain', component: CloudRain, category: 'Other' },
  { name: 'Coffee', component: Coffee, category: 'Other' },
  { name: 'Pizza', component: Pizza, category: 'Other' },
  { name: 'Plane', component: Plane, category: 'Other' },
];

interface IconLibraryProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export function IconLibrary({ selectedIcon, onSelectIcon, onClose, theme = 'dark' }: IconLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Get unique categories
  const categories = ['All', ...Array.from(new Set(ICON_LIBRARY.map(icon => icon.category))).sort()];
  
  // Filter icons
  const filteredIcons = ICON_LIBRARY.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10100] p-4" onClick={onClose}>
      <div 
        className={`${bgMain} border ${borderColor} rounded-xl max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - FIXED HEIGHT */}
        <div className={`flex-shrink-0 p-5 border-b ${borderColor} flex items-center justify-between`}>
          <div>
            <h2 className={`text-2xl ${textColor} mb-1`}>Icon Library</h2>
            <p className={`text-sm ${textSecondary}`}>
              <span className="text-[#00C6FF] font-semibold">{filteredIcons.length}</span> icons available • {categories.length - 1} categories
            </p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg ${hoverBg} ${textColor} transition-colors`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search - FIXED HEIGHT */}
        <div className={`flex-shrink-0 p-4 border-b ${borderColor}`}>
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${textSecondary}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons by name... (e.g., brain, rocket, cart)"
              className={`w-full pl-12 pr-4 py-3 rounded-xl border ${borderColor} ${bgCard} ${textColor} placeholder:${textSecondary} focus:outline-none focus:ring-2 focus:ring-[#00C6FF] transition-all`}
              autoFocus
            />
          </div>
        </div>

        {/* Category Filter - FIXED HEIGHT, SCROLLABLE HORIZONTALLY */}
        <div className={`flex-shrink-0 px-4 py-3 border-b ${borderColor} overflow-x-auto scrollbar-hide`}>
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => {
              const count = category === 'All' 
                ? ICON_LIBRARY.length 
                : ICON_LIBRARY.filter(i => i.category === category).length;
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all font-medium ${ 
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white shadow-lg'
                      : `${bgCard} ${textSecondary} border ${borderColor} ${hoverBg}`
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Icons Grid - FLEXIBLE, SCROLLABLE VERTICALLY */}
        <div className="flex-1 overflow-y-auto p-5 min-h-0">
          {filteredIcons.length > 0 ? (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4">
              {filteredIcons.map((icon) => {
                const IconComponent = icon.component;
                const isSelected = icon.name === selectedIcon;
                
                return (
                  <button
                    key={icon.name}
                    onClick={() => {
                      onSelectIcon(icon.name);
                      onClose();
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20 border-[#00C6FF] shadow-lg'
                        : `${bgCard} border-transparent ${hoverBg} hover:border-[#00C6FF]/50`
                    }`}
                  >
                    <IconComponent className={`w-6 h-6 transition-colors flex-shrink-0 ${isSelected ? 'text-[#00C6FF]' : textColor}`} />
                    <span className={`text-[9px] ${isSelected ? 'text-[#00C6FF] font-medium' : textSecondary} text-center leading-none whitespace-nowrap overflow-hidden text-ellipsis w-full`}>
                      {icon.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20 flex items-center justify-center mb-4">
                <Search className={`w-10 h-10 ${textSecondary}`} />
              </div>
              <p className={`text-lg ${textColor} mb-2`}>No icons found</p>
              <p className={`${textSecondary}`}>Try a different search term or category</p>
            </div>
          )}
        </div>

        {/* Footer - FIXED HEIGHT */}
        <div className={`flex-shrink-0 p-4 border-t ${borderColor} flex items-center justify-between bg-gradient-to-r from-[#00C6FF]/5 to-[#9D50BB]/5`}>
          <p className={`text-sm ${textSecondary}`}>
            Selected: <span className={`${textColor} font-semibold`}>{selectedIcon || 'None'}</span>
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to get icon component by name
export function getIconComponent(iconName: string): React.ComponentType<{ className?: string }> | null {
  const icon = ICON_LIBRARY.find(i => i.name === iconName);
  return icon?.component || null;
}

// Helper to render icon by name
export function RenderIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const IconComponent = getIconComponent(name);
  if (!IconComponent) return null;
  return <IconComponent className={className} style={style} />;
}