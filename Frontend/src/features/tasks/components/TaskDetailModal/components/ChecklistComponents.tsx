import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { ChecklistItem } from '../types/taskDetail.types';

interface ChecklistNameEditorProps {
  checklistId: string;
  name: string;
  isEditing: boolean;
  onUpdate: (checklistId: string, name: string) => void;
  onToggleEdit: (checklistId: string, isEditing: boolean) => void;
  textPrimary: string;
}

export function ChecklistNameEditor({
  checklistId,
  name,
  isEditing,
  onUpdate,
  onToggleEdit,
  textPrimary
}: ChecklistNameEditorProps) {
  const [editName, setEditName] = useState(name);

  useEffect(() => {
    setEditName(name);
  }, [name]);

  const handleSave = () => {
    if (editName.trim()) {
      onUpdate(checklistId, editName);
    }
    onToggleEdit(checklistId, false);
  };

  return isEditing ? (
    <input
      type="text"
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      onBlur={handleSave}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          handleSave();
        }
      }}
      className={`flex-1 bg-transparent border-b border-blue-500 outline-none ${textPrimary} text-sm sm:text-base`}
      autoFocus
    />
  ) : (
    <h3
      onClick={() => onToggleEdit(checklistId, true)}
      className={`${textPrimary} text-sm sm:text-base cursor-text`}
    >
      {name}
    </h3>
  );
}

interface ChecklistItemComponentProps {
  item: ChecklistItem;
  onToggle: () => void;
  onUpdate: (text: string) => void;
  onDelete: () => void;
  textPrimary: string;
  textSecondary: string;
  hoverBg: string;
}

export function ChecklistItemComponent({
  item,
  onToggle,
  onUpdate,
  onDelete,
  textPrimary,
  textSecondary,
  hoverBg
}: ChecklistItemComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);

  useEffect(() => {
    setEditText(item.text);
  }, [item.text]);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(editText);
    }
    setIsEditing(false);
  };

  return (
    <div className={`flex items-center gap-3 group ${hoverBg} p-2 rounded`}>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={onToggle}
        className="rounded flex-shrink-0"
      />
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSave();
            }
          }}
          className={`flex-1 bg-transparent border-b border-blue-500 outline-none ${textPrimary} text-sm`}
          autoFocus
        />
      ) : (
        <span
          onClick={() => {
            setEditText(item.text);
            setIsEditing(true);
          }}
          className={`flex-1 cursor-text text-sm ${item.completed ? 'line-through ' + textSecondary : textPrimary}`}
        >
          {item.text}
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={`opacity-0 group-hover:opacity-100 p-1 ${hoverBg} rounded flex-shrink-0`}
      >
        <Trash2 className={`w-3 h-3 sm:w-4 sm:h-4 ${textSecondary}`} />
      </button>
    </div>
  );
}

