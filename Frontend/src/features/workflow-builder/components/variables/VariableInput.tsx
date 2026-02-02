/**
 * Variable Input Component
 * Phase 4 Part 3 - Variable System
 * 
 * Input field with variable auto-suggestion
 */

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../../components/ThemeContext';
import { useVariables } from '../../stores/variableStore';
import { VariableDefinition } from '../../types/variable.types';
import { buildVariableReference } from '../../utils/variable.parser';
import { Input } from '../../../../components/ui/input';
import { Braces } from 'lucide-react';

interface VariableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function VariableInput({
  value,
  onChange,
  placeholder = 'Enter value or {{variable}}',
  className = '',
  disabled = false,
}: VariableInputProps) {
  const { theme } = useTheme();
  const { variables, searchVariables } = useVariables();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<VariableDefinition[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgHover = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Check if we should show suggestions
    const cursorPos = e.target.selectionStart || 0;
    setCursorPosition(cursorPos);
    updateSuggestions(newValue, cursorPos);
  };

  // Update suggestions based on input
  const updateSuggestions = (text: string, cursorPos: number) => {
    // Check if cursor is after {{
    const beforeCursor = text.substring(0, cursorPos);
    const lastOpenBrace = beforeCursor.lastIndexOf('{{');
    
    if (lastOpenBrace === -1) {
      setShowSuggestions(false);
      return;
    }

    const afterOpenBrace = beforeCursor.substring(lastOpenBrace + 2);
    const hasCloseBrace = afterOpenBrace.includes('}}');

    if (hasCloseBrace) {
      setShowSuggestions(false);
      return;
    }

    // Get search query
    const query = afterOpenBrace.trim();

    // Search variables
    const results = query
      ? searchVariables(query)
      : variables.slice(0, 10);

    setSuggestions(results);
    setShowSuggestions(results.length > 0);
    setSelectedIndex(0);
  };

  // Insert variable at cursor
  const insertVariable = (variable: VariableDefinition) => {
    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    
    // Find the {{ before cursor
    const lastOpenBrace = beforeCursor.lastIndexOf('{{');
    
    if (lastOpenBrace === -1) return;

    // Build new value
    const before = value.substring(0, lastOpenBrace);
    const reference = buildVariableReference(variable.path);
    const newValue = before + reference + afterCursor;

    onChange(newValue);
    setShowSuggestions(false);

    // Move cursor after inserted variable
    setTimeout(() => {
      const newCursorPos = before.length + reference.length;
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      inputRef.current?.focus();
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      // Show suggestions on {{ or trigger key
      if (e.key === '{' && value[cursorPosition - 1] === '{') {
        updateSuggestions(value, cursorPosition);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;

      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          insertVariable(suggestions[selectedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-10 ${className}`}
        />
        
        {/* Variable icon */}
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSecondary}`}>
          <Braces className="h-4 w-4" />
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className={`absolute z-50 mt-1 w-full ${bgCard} border ${borderColor} rounded-lg shadow-2xl max-h-64 overflow-y-auto`}
        >
          {suggestions.map((variable, index) => (
            <button
              key={variable.id}
              onClick={() => insertVariable(variable)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-3 py-2 text-left ${
                index === selectedIndex
                  ? 'bg-[#00C6FF]/20 border-l-2 border-[#00C6FF]'
                  : bgHover
              } ${
                index > 0 ? `border-t ${borderColor}` : ''
              } transition-colors`}
            >
              <div className={`${textPrimary} font-medium text-sm mb-1`}>
                {variable.name}
              </div>
              <div className={`${textSecondary} text-xs font-mono`}>
                {buildVariableReference(variable.path)}
              </div>
              {variable.description && (
                <div className={`${textSecondary} text-xs mt-1`}>
                  {variable.description}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Hint */}
      {!showSuggestions && !disabled && (
        <div className={`${textSecondary} text-xs mt-1`}>
          Type <code className="px-1 py-0.5 bg-[#2A2A3E] rounded">{'{{'}</code> to insert variables
        </div>
      )}
    </div>
  );
}