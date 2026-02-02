/**
 * Droppable Input Component
 * Input field that accepts dropped variables from INPUT/OUTPUT panels
 */

import React, { useState, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { X } from 'lucide-react';

interface DroppableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  theme: string;
  multiline?: boolean;
  rows?: number;
}

export function DroppableInput({
  value,
  onChange,
  placeholder,
  className = '',
  theme,
  multiline = false,
  rows = 1,
}: DroppableInputProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'VARIABLE',
    drop: (item: { variablePath: string; displayName: string; value: any }) => {
      handleVariableDrop(item.variablePath);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const handleVariableDrop = (variablePath: string) => {
    const variable = `{{${variablePath}}}`;
    const element = inputRef.current;
    
    if (element) {
      const start = element.selectionStart || value.length;
      const end = element.selectionEnd || value.length;
      const before = value.substring(0, start);
      const after = value.substring(end);
      const newValue = before + variable + after;
      
      onChange(newValue);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        const newPosition = start + variable.length;
        element.setSelectionRange(newPosition, newPosition);
        element.focus();
      }, 0);
    }
  };

  const handleSelectionChange = () => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
  };

  // Extract variables from value
  const variableMatches = value.match(/\{\{([^}]+)\}\}/g) || [];
  const hasVariables = variableMatches.length > 0;

  const dropZoneBorder = isOver && canDrop
    ? 'border-[#00C6FF] ring-2 ring-[#00C6FF]/30'
    : canDrop
    ? 'border-[#00C6FF]/50'
    : borderColor;

  // Common props for both input and textarea
  const commonProps = {
    ref: drop as any,
    value,
    onChange: (e: any) => onChange(e.target.value),
    onSelect: handleSelectionChange,
    onClick: handleSelectionChange,
    onKeyUp: handleSelectionChange,
    placeholder,
    className: `${className} border ${dropZoneBorder} ${textPrimary} transition-all ${
      isOver && canDrop ? 'bg-[#00C6FF]/5' : ''
    }`,
  };

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          {...commonProps}
          ref={(ref) => {
            inputRef.current = ref;
            drop(ref as any);
          }}
          rows={rows}
        />
      ) : (
        <input
          {...commonProps}
          ref={(ref) => {
            inputRef.current = ref;
            drop(ref as any);
          }}
          type="text"
        />
      )}
      
      {/* Drop indicator */}
      {canDrop && (
        <div className="absolute -top-6 left-0 right-0 flex justify-center pointer-events-none">
          <span className="text-xs text-[#00C6FF] bg-[#00C6FF]/10 px-2 py-0.5 rounded">
            {isOver ? 'Drop to insert variable' : 'Drop variable here'}
          </span>
        </div>
      )}

      {/* Variable badges */}
      {hasVariables && !isOver && (
        <div className="absolute -bottom-6 left-0 flex gap-1 flex-wrap pointer-events-none">
          {variableMatches.slice(0, 3).map((match, index) => (
            <span
              key={index}
              className="text-[10px] bg-[#00C6FF]/20 text-[#00C6FF] px-1.5 py-0.5 rounded font-mono"
            >
              {match}
            </span>
          ))}
          {variableMatches.length > 3 && (
            <span className="text-[10px] bg-[#00C6FF]/20 text-[#00C6FF] px-1.5 py-0.5 rounded">
              +{variableMatches.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
