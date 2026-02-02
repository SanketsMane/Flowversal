import { useDrop } from 'react-dnd';
import { Plus, Layers } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { MAX_STEPS } from './constants';

interface AddStepButtonProps {
  onAdd: () => void;
  isFirst?: boolean;
  disabled?: boolean;
}

export function AddStepButton({ onAdd, isFirst = false, disabled = false }: AddStepButtonProps) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const panelBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'FORM_ELEMENT',
    drop: (item: { elementType: string }) => {
      if (item.elementType === 'workflow-step' && !disabled) {
        onAdd();
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver() && (monitor.getItem() as { elementType: string })?.elementType === 'workflow-step',
    }),
  }));

  if (isFirst) {
    return (
      <div ref={drop} className="max-w-3xl mx-auto">
        <div className={`${panelBg} ${borderColor} border-2 ${isOver ? 'border-cyan-500 bg-cyan-500/5' : 'border-dashed'} rounded-lg p-12 text-center transition-all`}>
          <Layers className={`w-16 h-16 mx-auto mb-4 ${textColor} opacity-30`} />
          <p className={`${textColor} text-lg mb-4`}>Create Your First Workflow Step</p>
          <button
            onClick={onAdd}
            disabled={disabled}
            className={`px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 mx-auto ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Plus className="w-5 h-5" />
            Add Workflow Step
          </button>
          <p className={`${textColor} opacity-60 text-sm mt-4`}>
            or drag "Workflow Step" from the left panel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={drop} className={`${borderColor} border-2 ${isOver && !disabled ? 'border-cyan-500 bg-cyan-500/5' : 'border-dashed'} rounded-lg p-6 text-center transition-all`}>
      <button
        onClick={onAdd}
        disabled={disabled}
        className={`w-full py-3 ${textColor} hover:text-cyan-500 transition-colors flex items-center justify-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Plus className="w-5 h-5" />
        {disabled ? `Maximum ${MAX_STEPS} Steps Allowed` : 'Add Another Step'}
      </button>
    </div>
  );
}
