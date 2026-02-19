/**
 * Chat Sidebar Component
 * Features: New Chat, Tools, Prompts, Memories, Chat History
 * Mobile: overlay drawer. Desktop: collapsible panel.
 * Author: Sanket
 */

import { useTheme } from '@/core/theme/ThemeContext';
import {
    Brain,
    ChevronDown, ChevronLeft, ChevronRight,
    Edit2,
    Eye,
    FileText,
    Menu,
    MessageSquare,
    PenSquare,
    Search,
    Trash2,
    Wrench,
    X,
} from 'lucide-react';
import { useState } from 'react';

export interface ChatConversation {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  isActive?: boolean;
}

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onOpenTools: () => void;
  onOpenPrompts: () => void;
  onOpenMemories: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  selectedToolsCount?: number;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onOpenTools,
  onOpenPrompts,
  onOpenMemories,
  isCollapsed = false,
  onToggleCollapse,
  selectedToolsCount = 0,
}: ChatSidebarProps) {
  const { theme } = useTheme();
  const [showOlderChats, setShowOlderChats] = useState(true);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatsHidden, setChatsHidden] = useState(false);
  // Mobile drawer open state
  const [mobileOpen, setMobileOpen] = useState(false);

  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';
  const activeBg = theme === 'dark' ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20' : 'bg-blue-100';

  const today = new Date();
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const todayConversations = filteredConversations.filter(
    (c) => new Date(c.timestamp).toDateString() === today.toDateString()
  );
  const olderConversations = filteredConversations.filter(
    (c) => new Date(c.timestamp).toDateString() !== today.toDateString()
  );

  const handleStartRename = (chat: ChatConversation) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };
  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) onRenameConversation(id, editTitle.trim());
    setEditingChatId(null);
    setEditTitle('');
  };

  // Sidebar content — shared between desktop and mobile drawer
  const SidebarContent = () => (
    <div className={`flex flex-col h-full ${bgColor}`}>
      {/* Header row */}
      <div className={`flex items-center justify-between px-3 pt-4 pb-2 border-b ${borderColor}`}>
        <span className="text-sm font-semibold bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] bg-clip-text text-transparent">
          Flowversal
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewChat}
            className={`p-1.5 rounded-lg ${hoverBg} ${textPrimary} transition-colors`}
            title="New Chat"
          >
            <PenSquare className="w-4 h-4" />
          </button>
          {/* Desktop collapse button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`hidden md:flex p-1.5 rounded-lg ${hoverBg} ${textSecondary} transition-colors`}
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className={`flex md:hidden p-1.5 rounded-lg ${hoverBg} ${textSecondary} transition-colors`}
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-3 space-y-1">
          <button
            onClick={onNewChat}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${hoverBg} ${textPrimary} transition-colors hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10`}
          >
            <PenSquare className="w-5 h-5" />
            <span className="text-sm font-medium">New Chat</span>
          </button>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenTools(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${hoverBg} ${textSecondary} transition-colors hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 relative`}
          >
            <Wrench className="w-5 h-5" />
            <span className="text-sm">Tools</span>
            {selectedToolsCount > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white text-xs flex items-center justify-center font-semibold shadow-lg animate-pulse">
                {selectedToolsCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenPrompts}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${hoverBg} ${textSecondary} transition-colors hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm">Prompts</span>
          </button>

          <button
            onClick={onOpenMemories}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${hoverBg} ${textSecondary} transition-colors hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10`}
          >
            <Brain className="w-5 h-5" />
            <span className="text-sm">Memories</span>
          </button>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="px-4 pb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className={`w-full px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-[#1A1A2E] border-white/10 text-white placeholder-[#CFCFE8]' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'} border focus:outline-none focus:border-[#00C6FF] text-sm`}
              autoFocus
            />
          </div>
        )}

        {/* Chats section */}
        <div className="mt-2 px-3">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Chats</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-1 rounded ${hoverBg} ${textSecondary} ${showSearch ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20' : ''}`}
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChatsHidden(!chatsHidden)}
                className={`p-1 rounded ${hoverBg} ${textSecondary} relative`}
                title={chatsHidden ? 'Show chats' : 'Hide chats'}
              >
                <Eye className="w-4 h-4" />
                {chatsHidden && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-0.5 bg-red-500 rotate-45" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Empty state */}
          {!chatsHidden && conversations.length === 0 && (
            <div className={`text-center py-6 ${textSecondary} text-xs`}>
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No chats yet.</p>
              <p>Start a new conversation!</p>
            </div>
          )}

          {/* Today's chats */}
          {!chatsHidden && todayConversations.length > 0 && (
            <div className="mb-3">
              <span className={`text-xs ${textSecondary} px-3 mb-1 block`}>Today</span>
              {todayConversations.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={activeConversationId === chat.id}
                  isHovered={hoveredChatId === chat.id}
                  isEditing={editingChatId === chat.id}
                  editTitle={editTitle}
                  onSelect={() => { onSelectConversation(chat.id); setMobileOpen(false); }}
                  onHover={() => setHoveredChatId(chat.id)}
                  onLeave={() => setHoveredChatId(null)}
                  onDelete={() => onDeleteConversation(chat.id)}
                  onStartRename={() => handleStartRename(chat)}
                  onSaveRename={() => handleSaveRename(chat.id)}
                  onEditTitleChange={setEditTitle}
                  theme={theme}
                />
              ))}
            </div>
          )}

          {/* Older chats */}
          {!chatsHidden && olderConversations.length > 0 && (
            <div>
              <button
                onClick={() => setShowOlderChats(!showOlderChats)}
                className={`flex items-center gap-2 px-3 py-1 ${textSecondary} text-xs w-full`}
              >
                {showOlderChats ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>Older</span>
              </button>
              {showOlderChats && (
                <div className="mt-1">
                  {olderConversations.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={activeConversationId === chat.id}
                      isHovered={hoveredChatId === chat.id}
                      isEditing={editingChatId === chat.id}
                      editTitle={editTitle}
                      onSelect={() => { onSelectConversation(chat.id); setMobileOpen(false); }}
                      onHover={() => setHoveredChatId(chat.id)}
                      onLeave={() => setHoveredChatId(null)}
                      onDelete={() => onDeleteConversation(chat.id)}
                      onStartRename={() => handleStartRename(chat)}
                      onSaveRename={() => handleSaveRename(chat.id)}
                      onEditTitleChange={setEditTitle}
                      theme={theme}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Collapsed desktop icon bar
  if (isCollapsed) {
    return (
      <>
        {/* Desktop collapsed icon bar */}
        <div className={`hidden md:flex w-16 h-full ${bgColor} border-r ${borderColor} flex-col items-center py-4 gap-4`}>
          <button
            onClick={onToggleCollapse}
            className={`p-2.5 rounded-xl ${hoverBg} ${textSecondary} transition-colors`}
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={onNewChat} className={`p-2.5 rounded-xl ${hoverBg} ${textPrimary} transition-colors`} title="New Chat">
            <PenSquare className="w-5 h-5" />
          </button>
          <button onClick={onOpenTools} className={`p-2.5 rounded-xl ${hoverBg} ${textSecondary} transition-colors`} title="Tools">
            <Wrench className="w-5 h-5" />
          </button>
          <button onClick={onOpenPrompts} className={`p-2.5 rounded-xl ${hoverBg} ${textSecondary} transition-colors`} title="Prompts">
            <FileText className="w-5 h-5" />
          </button>
          <button onClick={onOpenMemories} className={`p-2.5 rounded-xl ${hoverBg} ${textSecondary} transition-colors`} title="Memories">
            <Brain className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile hamburger button (always visible when sidebar is "collapsed" on mobile) */}
        <button
          onClick={() => setMobileOpen(true)}
          className={`md:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl ${bgColor} border ${borderColor} shadow-lg ${textPrimary}`}
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile overlay drawer */}
        {mobileOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className={`md:hidden fixed left-0 top-0 h-full w-72 z-50 border-r ${borderColor} shadow-2xl`}>
              <SidebarContent />
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <>
      {/* Desktop full sidebar */}
      <div className={`hidden md:flex w-72 h-full border-r ${borderColor} flex-col overflow-hidden`}>
        <SidebarContent />
      </div>

      {/* Mobile: hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className={`md:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl ${bgColor} border ${borderColor} shadow-lg ${textPrimary}`}
        title="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className={`md:hidden fixed left-0 top-0 h-full w-72 z-50 border-r ${borderColor} shadow-2xl`}>
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}

// Chat Item Component
interface ChatItemProps {
  chat: ChatConversation;
  isActive: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editTitle: string;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
  onDelete: () => void;
  onStartRename: () => void;
  onSaveRename: () => void;
  onEditTitleChange: (title: string) => void;
  theme: string;
}

function ChatItem({
  chat,
  isActive,
  isHovered,
  isEditing,
  editTitle,
  onSelect,
  onHover,
  onLeave,
  onDelete,
  onStartRename,
  onSaveRename,
  onEditTitleChange,
  theme,
}: ChatItemProps) {
  const activeBg = theme === 'dark' ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20' : 'bg-blue-100';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors ${isActive ? activeBg : hoverBg}`}
    >
      <MessageSquare className={`w-4 h-4 ${isActive ? 'text-[#00C6FF]' : textSecondary} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            onBlur={onSaveRename}
            onKeyDown={(e) => e.key === 'Enter' && onSaveRename()}
            className={`w-full text-sm bg-transparent border-b border-[#00C6FF] outline-none ${textPrimary}`}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`text-sm ${textPrimary} truncate block`}>{chat.title}</span>
        )}
      </div>
      {isHovered && !isEditing && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onStartRename(); }}
            className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-200'} ${textSecondary}`}
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-red-500/20' : 'hover:bg-red-100'} text-red-400`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
