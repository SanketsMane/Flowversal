import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, X, Copy } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import type { FormElement } from './types';

interface CanvasElementProps {
  element: FormElement;
  containerIndex: number;
  elementIndex: number;
  onSelect: () => void;
  isSelected: boolean;
  onDelete: () => void;
  onCopy?: () => void;
  moveElement: (fromIndex: number, toIndex: number) => void;
}

export function CanvasElement({ 
  element, 
  containerIndex, 
  elementIndex, 
  onSelect, 
  isSelected,
  onDelete,
  onCopy,
  moveElement,
}: CanvasElementProps) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CANVAS_ELEMENT',
    item: { containerIndex, elementIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: 'CANVAS_ELEMENT',
    hover: (item: { containerIndex: number; elementIndex: number }) => {
      if (item.containerIndex === containerIndex && item.elementIndex !== elementIndex) {
        moveElement(item.elementIndex, elementIndex);
        item.elementIndex = elementIndex;
      }
    },
  }));

  const renderPreview = () => {
    if (element.hidden) {
      return (
        <div className="px-3 py-2 text-sm text-gray-400 italic">
          This field is hidden
        </div>
      );
    }

    if (element.grayedOut) {
      return (
        <div className="px-3 py-2 text-sm text-gray-400 italic opacity-50">
          {element.defaultValue || 'Grayed out with default value'}
        </div>
      );
    }

    switch (element.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={element.type === 'email' ? 'email' : 'text'}
            placeholder={element.placeholder || `Enter ${element.label.toLowerCase()}`}
            defaultValue={element.defaultValue}
            className={`w-full px-3 py-2 border ${borderColor} rounded ${textColor} ${bgInput} text-sm`}
            readOnly
          />
        );
      case 'number':
        return (
          <input
            type="number"
            placeholder={element.placeholder || 'Enter number'}
            defaultValue={element.defaultValue}
            className={`w-full px-3 py-2 border ${borderColor} rounded ${textColor} ${bgInput} text-sm`}
            readOnly
          />
        );
      case 'url':
        return (
          <div className="space-y-2">
            {element.linkUrl && element.linkName ? (
              <a href={element.linkUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline text-sm">
                {element.linkName}
              </a>
            ) : (
              <p className={`${textColor} opacity-50 text-sm`}>URL will appear here</p>
            )}
          </div>
        );
      case 'notes':
      case 'textarea':
        return (
          <textarea
            placeholder={element.placeholder || 'Enter notes'}
            defaultValue={element.defaultValue}
            className={`w-full px-3 py-2 border ${borderColor} rounded ${textColor} ${bgInput} text-sm`}
            rows={3}
            readOnly
          />
        );
      case 'rich-text':
        return (
          <div className={`w-full min-h-[100px] border ${borderColor} rounded ${bgInput} p-3`}>
            <p className={`${textColor} opacity-50 text-sm`}>Rich text editor area</p>
          </div>
        );
      case 'date-picker':
        return (
          <input
            type="date"
            defaultValue={element.defaultDate}
            className={`w-full px-3 py-2 border ${borderColor} rounded ${textColor} ${bgInput} text-sm cursor-pointer`}
            readOnly
          />
        );
      case 'time':
        return (
          <input
            type="time"
            defaultValue={element.defaultTime}
            className={`w-full px-3 py-2 border ${borderColor} rounded ${textColor} ${bgInput} text-sm cursor-pointer`}
            readOnly
          />
        );
      case 'dropdown':
        return (
          <select className={`w-full px-3 py-2 border ${borderColor} rounded ${textColor} ${bgInput} text-sm`} disabled>
            <option>Select an option</option>
            {element.options?.map((opt, idx) => (
              <option key={idx}>{opt}</option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {(element.options || ['Option 1', 'Option 2']).map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2">
                <input type="radio" name={`radio-${element.id}`} disabled />
                <span className={`${textColor} text-sm`}>{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'toggle':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked={element.toggleDefault} className="sr-only peer" disabled />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"></div>
            <span className={`ms-3 text-sm ${textColor}`}>Enable option</span>
          </label>
        );
      case 'checklist':
        return (
          <div className="space-y-2">
            {(element.options || ['Item 1', 'Item 2']).map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input type="checkbox" className="rounded" disabled />
                <span className={`${textColor} text-sm`}>{opt}</span>
              </div>
            ))}
          </div>
        );
      case 'uploaded':
      case 'image':
        return (
          <div className={`w-full h-24 border-2 border-dashed ${borderColor} rounded flex items-center justify-center`}>
            <span className={`${textColor} opacity-50 text-sm`}>Click to upload</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      data-connection-id={`step-${containerIndex}-field`}
      data-connection-type="form-field"
      className={`relative p-4 border-2 rounded-lg transition-all cursor-pointer ${
        isSelected 
          ? 'border-cyan-500 bg-cyan-500/5' 
          : `${borderColor} hover:border-cyan-500/50`
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Drag Handle, Copy and Delete Button */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <button className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-move`}>
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>
        {onCopy && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            className={`p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded hover:text-blue-500 transition-all ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            title="Copy field"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded hover:text-red-500 transition-all ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Element Label */}
      <div className="mb-2">
        <label className={`${textColor} text-sm flex items-center gap-1`}>
          {element.label}
          {element.required && <span className="text-red-500">*</span>}
        </label>
        {element.description && (
          <p className={`${textColor} opacity-60 text-xs mt-1`}>{element.description}</p>
        )}
      </div>

      {/* Element Preview */}
      {renderPreview()}
    </div>
  );
}
