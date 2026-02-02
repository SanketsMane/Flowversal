/**
 * Field Options Manager Component
 * Phase 3 Part 2 - Enhanced Field Properties
 * 
 * Manage options for radio/dropdown/checklist fields
 */

import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { Plus, Trash2, GripVertical, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

interface FieldOptionsManagerProps {
  options: string[];
  onChange: (options: string[]) => void;
}

export function FieldOptionsManager({ options = [], onChange }: FieldOptionsManagerProps) {
  const { theme } = useTheme();
  const [newOption, setNewOption] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const handleAdd = () => {
    if (newOption.trim()) {
      onChange([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleDelete = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(options[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const updated = [...options];
      updated[editingIndex] = editValue.trim();
      onChange(updated);
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="space-y-3">
      <label className={`${textSecondary} text-sm block`}>Options</label>

      {/* Options List */}
      <div className="space-y-2">
        {options.map((option, index) => (
          <div
            key={index}
            className={`${bgCard} border ${borderColor} rounded-lg p-3 flex items-center gap-2`}
          >
            {/* Drag Handle */}
            <GripVertical className={`${textSecondary} h-4 w-4 cursor-move`} />

            {/* Option Value */}
            {editingIndex === index ? (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleSaveEdit)}
                className={`flex-1 ${bgInput} border ${borderColor} ${textPrimary}`}
                autoFocus
              />
            ) : (
              <span className={`flex-1 ${textPrimary}`}>{option}</span>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1">
              {editingIndex === index ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveEdit}
                    className="h-8 w-8 p-0 hover:bg-[#00C6FF]/10"
                  >
                    <Check className="h-4 w-4 text-[#00C6FF]" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 p-0 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(index)}
                    className="h-8 w-8 p-0 hover:bg-[#00C6FF]/10"
                  >
                    <Edit2 className="h-4 w-4 text-[#00C6FF]" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(index)}
                    className="h-8 w-8 p-0 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}

        {options.length === 0 && (
          <div className={`${bgCard} border ${borderColor} border-dashed rounded-lg p-6 text-center`}>
            <p className={`${textSecondary} text-sm`}>No options yet</p>
            <p className={`${textSecondary} text-xs mt-1`}>Add your first option below</p>
          </div>
        )}
      </div>

      {/* Add New Option */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter new option..."
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, handleAdd)}
          className={`flex-1 ${bgInput} border ${borderColor} ${textPrimary}`}
        />
        <Button
          onClick={handleAdd}
          disabled={!newOption.trim()}
          className="bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Quick Actions */}
      {options.length > 0 && (
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChange([])}
            className={`${textSecondary} border-${borderColor} hover:bg-red-500/10 hover:text-red-500`}
          >
            Clear All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChange([...options].reverse())}
            className={`${textSecondary} border-${borderColor}`}
          >
            Reverse Order
          </Button>
        </div>
      )}
    </div>
  );
}
