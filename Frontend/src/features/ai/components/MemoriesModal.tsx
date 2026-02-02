import { useTheme } from '@/core/theme/ThemeContext';
import { Brain, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { useMemoryStore } from '../stores/memoryStore';

interface MemoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemoriesModal({ isOpen, onClose }: MemoriesModalProps) {
  const { theme } = useTheme();
  const { memories, addMemory, removeMemory, updateMemory } = useMemoryStore();
  const [newMemory, setNewMemory] = useState('');

  // Flowversal theme colors
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newMemory.trim()) {
      addMemory(newMemory.trim());
      setNewMemory('');
      toast.success('Memory added');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        className={`relative w-full max-w-2xl max-h-[600px] flex flex-col rounded-2xl border ${borderColor} ${bgCard} shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${borderColor} flex-shrink-0`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h2 className={`font-semibold ${textPrimary}`}>Memories</h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-white/10 ${textSecondary} transition-colors`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add Input */}
        <div className={`p-4 border-b ${borderColor} ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'} flex-shrink-0`}>
          <div className="flex gap-3 items-start">
            <textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="Add a new memory..."
              rows={3}
              className={`flex-1 ${inputBg} border ${borderColor} rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00C6FF] ${textPrimary} placeholder:${textSecondary} transition-colors resize-none`}
              autoFocus
            />
            <button
              onClick={handleAdd}
              disabled={!newMemory.trim()}
              className={`p-3 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white disabled:opacity-50 hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20 flex-shrink-0 self-stretch flex items-center justify-center`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of Memories */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {memories.length === 0 && (
            <div className={`text-center py-8 ${textSecondary}`}>
              <p className="text-sm">No memories yet.</p>
            </div>
          )}
          
          {memories.map((memory) => (
            <div 
              key={memory.id} 
              className={`group flex items-start justify-between gap-3 p-3 rounded-xl border ${borderColor} ${inputBg} hover:border-[#00C6FF]/30 transition-all`}
            >
              <textarea
                value={memory.content}
                onChange={(e) => updateMemory(memory.id, e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none ${textPrimary} text-sm resize-none leading-relaxed p-0 focus:ring-0 scrollbar-thin scrollbar-thumb-gray-400/20`}
                rows={Math.max(2, Math.min(8, Math.ceil(memory.content.length / 60)))}
              />
              <button
                onClick={() => removeMemory(memory.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-all flex-shrink-0"
                title="Remove memory"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        
        {/* Footer info */}
        <div className={`p-3 border-t ${borderColor} text-center`}>
            <p className={`text-[10px] ${textSecondary}`}>
                {memories.length} {memories.length === 1 ? 'memory' : 'memories'} stored
            </p>
        </div>
      </div>
    </div>,
    document.body
  );
}

