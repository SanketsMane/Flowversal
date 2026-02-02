import { useState } from 'react';
import { Check, CheckSquare, Edit, Plus, X } from 'lucide-react';
import type { Label } from '../types/taskDetail.types';

interface LabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLabel: (name: string, color: string) => void;
  existingLabels: Label[];
  theme: string;
}

const defaultCustomLabels: Label[] = [
  { id: '1', name: 'Red', color: 'bg-red-500' },
  { id: '2', name: 'Orange', color: 'bg-orange-500' },
  { id: '3', name: 'Yellow', color: 'bg-yellow-500' },
  { id: '4', name: 'Green', color: 'bg-green-500' },
  { id: '5', name: 'Blue', color: 'bg-blue-500' },
  { id: '6', name: 'Purple', color: 'bg-purple-500' },
  { id: '7', name: 'Pink', color: 'bg-pink-500' },
  { id: '8', name: 'Indigo', color: 'bg-indigo-500' },
  { id: '9', name: 'Teal', color: 'bg-teal-500' },
  { id: '10', name: 'Cyan', color: 'bg-cyan-500' },
];

export function LabelsModal({ isOpen, onClose, onAddLabel, existingLabels, theme }: LabelsModalProps) {
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelName, setEditingLabelName] = useState('');
  const [customLabels, setCustomLabels] = useState<Label[]>(defaultCustomLabels);

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  if (!isOpen) return null;

  const handleEditLabel = (id: string, currentName: string) => {
    setEditingLabelId(id);
    setEditingLabelName(currentName);
  };

  const handleSaveEdit = (id: string, color: string) => {
    if (editingLabelName.trim()) {
      setCustomLabels(customLabels.map(label =>
        label.id === id ? { ...label, name: editingLabelName } : label
      ));

      const updatedLabel = customLabels.find(l => l.id === id);
      if (updatedLabel) {
        const existingLabel = existingLabels.find(l => l.color === color);
        if (!existingLabel) {
          onAddLabel(editingLabelName, color);
        }
      }
    }
    setEditingLabelId(null);
    setEditingLabelName('');
  };

  const handleAddNewLabel = () => {
    const newId = `custom-${Date.now()}`;
    setCustomLabels([
      ...customLabels,
      { id: newId, name: 'New Label', color: 'bg-gray-500' }
    ]);
    setEditingLabelId(newId);
    setEditingLabelName('New Label');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={`${bgCard} rounded-xl w-full max-w-md border ${borderColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-4 border-b ${borderColor}`}>
          <div className="flex items-center justify-between">
            <h3 className={`${textPrimary}`}>Labels</h3>
            <button onClick={onClose} className={`p-1 rounded ${hoverBg}`}>
              <X className={`w-4 h-4 ${textSecondary}`} />
            </button>
          </div>
        </div>
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {customLabels.map(label => {
            const isAlreadyAdded = existingLabels.some(l => l.name === label.name && l.color === label.color);
            return (
              <div key={label.id} className="relative group">
                {editingLabelId === label.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingLabelName}
                      onChange={(e) => setEditingLabelName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(label.id, label.color);
                        }
                      }}
                      className={`flex-1 ${label.color} text-white px-4 py-2 rounded-lg outline-none placeholder-white/70`}
                      placeholder="Label name..."
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(label.id, label.color)}
                      className="px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                      type="button"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      if (!isAlreadyAdded) {
                        onAddLabel(label.name, label.color);
                      }
                    }}
                    className={`w-full ${label.color} text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center justify-between ${
                      isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <span>{label.name}</span>
                    <div className="flex items-center gap-1">
                      {isAlreadyAdded && (
                        <CheckSquare className="w-4 h-4" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditLabel(label.id, label.name);
                        }}
                        className="p-1 rounded hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                        type="button"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <button
            onClick={handleAddNewLabel}
            className={`w-full px-4 py-2 rounded-lg border-2 border-dashed ${borderColor} ${textSecondary} ${hoverBg} transition-all text-sm flex items-center justify-center gap-2`}
            type="button"
          >
            <Plus className="w-4 h-4" />
            Add New Label
          </button>
        </div>
      </div>
    </div>
  );
}

