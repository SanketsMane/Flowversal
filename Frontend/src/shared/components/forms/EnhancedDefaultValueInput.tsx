import { useState, useRef, useEffect } from 'react';
import { Plus, X, Calendar as CalendarIcon, Clock, Upload, Link as LinkIcon, Check } from 'lucide-react';

interface EnhancedDefaultValueInputProps {
  fieldType: string;
  value: string;
  onChange: (value: string) => void;
  onOpenVariables?: () => void;
  options?: string[];
  onOptionsChange?: (options: string[]) => void;
  isActive?: boolean;
  theme: string;
  placeholder?: string;
  toggleState?: boolean;
  onToggleChange?: (state: boolean) => void;
  dateValue?: string;
  onDateChange?: (date: string) => void;
  timeValue?: string;
  onTimeChange?: (time: string) => void;
  variableInsertMode?: 'replace' | 'append';
  onDropdownToggle?: (isOpen: boolean, dropdownHeight?: number) => void;
}

export function EnhancedDefaultValueInput({
  fieldType,
  value,
  onChange,
  onOpenVariables,
  options = [],
  onOptionsChange,
  isActive = false,
  theme,
  placeholder = 'Enter default value',
  toggleState,
  onToggleChange,
  dateValue,
  onDateChange,
  timeValue,
  onTimeChange,
  variableInsertMode = 'replace',
  onDropdownToggle
}: EnhancedDefaultValueInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [uploadMode, setUploadMode] = useState<'computer' | 'link' | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Theme colors
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgDropdown = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-100';

  // Notify parent when dropdown opens/closes
  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      const height = dropdownRef.current.offsetHeight;
      onDropdownToggle?.(true, height);
    } else {
      onDropdownToggle?.(false);
    }
  }, [showDropdown, onDropdownToggle]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setUploadMode(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize selected options for checklist
  useEffect(() => {
    if (fieldType === 'checklist' && value) {
      setSelectedOptions(value.split(',').map(v => v.trim()).filter(Boolean));
    }
  }, [fieldType, value]);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectOption = (option: string) => {
    onChange(option);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleToggleChecklistOption = (option: string) => {
    let newSelected: string[];
    if (selectedOptions.includes(option)) {
      newSelected = selectedOptions.filter(o => o !== option);
    } else {
      newSelected = [...selectedOptions, option];
    }
    setSelectedOptions(newSelected);
    onChange(newSelected.join(', '));
  };

  const handleDateSelect = (date: string) => {
    onDateChange?.(date);
    onChange(date);
    setShowDropdown(false);
  };

  const handleTimeSelect = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const formatted = `${hour12}:${minutes} ${ampm}`;
    
    onTimeChange?.(time);
    onChange(formatted);
    setShowDropdown(false);
  };

  const handleToggleClick = () => {
    const newState = !toggleState;
    onToggleChange?.(newState);
    onChange(newState ? 'true' : 'false');
  };

  const handleFileUrlAdd = () => {
    if (fileUrl.trim()) {
      onChange(fileUrl.trim());
      setFileUrl('');
      setUploadMode(null);
      setShowDropdown(false);
    }
  };

  const renderDropdownContent = () => {
    if (['text', 'notes', 'number', 'email', 'richtext', 'textarea', 'url'].includes(fieldType)) {
      return null;
    }
    
    switch (fieldType) {
      case 'radio':
      case 'dropdown':
        return (
          <div className="p-2">
            <div className="mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search options..."
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textColor} text-sm`}
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full px-3 py-2 text-left text-sm ${textColor} ${hoverBg} rounded transition-colors flex items-center justify-between`}
                  >
                    <span>{opt}</span>
                    {value === opt && <Check className="w-4 h-4 text-[#00C6FF]" />}
                  </button>
                ))
              ) : (
                <div className={`px-3 py-2 text-sm ${textSecondary} text-center`}>
                  {searchQuery ? `No options found for "${searchQuery}"` : 'No options available'}
                </div>
              )}
            </div>
            {searchQuery && filteredOptions.length === 0 && (
              <button
                onClick={() => {
                  if (onOptionsChange) {
                    onOptionsChange([...options, searchQuery]);
                    handleSelectOption(searchQuery);
                  }
                }}
                className={`w-full mt-2 px-3 py-2 text-sm border ${borderColor} ${textColor} ${hoverBg} rounded transition-colors flex items-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                Add "{searchQuery}"
              </button>
            )}
            <button
              onClick={() => {
                setShowDropdown(false);
                onOpenVariables?.();
              }}
              className={`w-full mt-2 px-3 py-2 text-sm border ${borderColor} text-[#00C6FF] ${hoverBg} rounded transition-colors flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              Add Variable
            </button>
          </div>
        );

      case 'checklist':
        return (
          <div className="p-2">
            <div className="mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search options..."
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textColor} text-sm`}
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => (
                  <label
                    key={idx}
                    className={`w-full px-3 py-2 text-sm ${textColor} ${hoverBg} rounded transition-colors flex items-center gap-2 cursor-pointer`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(opt)}
                      onChange={() => handleToggleChecklistOption(opt)}
                      className="w-4 h-4 rounded border-gray-300 text-[#00C6FF] focus:ring-[#00C6FF]"
                    />
                    <span className="flex-1">{opt}</span>
                  </label>
                ))
              ) : (
                <div className={`px-3 py-2 text-sm ${textSecondary} text-center`}>
                  {searchQuery ? `No options found for "${searchQuery}"` : 'No options available'}
                </div>
              )}
            </div>
            {searchQuery && filteredOptions.length === 0 && (
              <button
                onClick={() => {
                  if (onOptionsChange) {
                    onOptionsChange([...options, searchQuery]);
                    handleToggleChecklistOption(searchQuery);
                  }
                }}
                className={`w-full mt-2 px-3 py-2 text-sm border ${borderColor} ${textColor} ${hoverBg} rounded transition-colors flex items-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                Add "{searchQuery}"
              </button>
            )}
            <button
              onClick={() => {
                setShowDropdown(false);
                onOpenVariables?.();
              }}
              className={`w-full mt-2 px-3 py-2 text-sm border ${borderColor} text-[#00C6FF] ${hoverBg} rounded transition-colors flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              Add Variable
            </button>
          </div>
        );

      case 'date':
      case 'date-picker':
        return (
          <div className="p-3">
            <div className="mb-3">
              <input
                type="date"
                value={dateValue || ''}
                onChange={(e) => handleDateSelect(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textColor}`}
              />
            </div>
            <button
              onClick={() => {
                setShowDropdown(false);
                onOpenVariables?.();
              }}
              className={`w-full px-3 py-2 text-sm border ${borderColor} text-[#00C6FF] ${hoverBg} rounded transition-colors flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              Add Variable
            </button>
          </div>
        );

      case 'time':
        return (
          <div className="p-3">
            <div className="mb-3">
              <input
                type="time"
                value={timeValue || ''}
                onChange={(e) => handleTimeSelect(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textColor}`}
              />
            </div>
            <button
              onClick={() => {
                setShowDropdown(false);
                onOpenVariables?.();
              }}
              className={`w-full px-3 py-2 text-sm border ${borderColor} text-[#00C6FF] ${hoverBg} rounded transition-colors flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              Add Variable
            </button>
          </div>
        );

      case 'toggle':
        return (
          <div className="p-3">
            <div className="flex items-center gap-3 justify-center mb-3">
              <button
                onClick={handleToggleClick}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  toggleState ? 'bg-[#00C6FF]' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    toggleState ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${textSecondary}`}>
                {toggleState ? 'On (true)' : 'Off (false)'}
              </span>
            </div>
            <button
              onClick={() => {
                setShowDropdown(false);
                onOpenVariables?.();
              }}
              className={`w-full px-3 py-2 text-sm border ${borderColor} text-[#00C6FF] ${hoverBg} rounded transition-colors flex items-center gap-2`}
            >
              <Plus className="w-4 h-4" />
              Add Variable / Custom Text
            </button>
          </div>
        );

      case 'file':
      case 'image':
      case 'uploaded':
        return (
          <div className="p-3">
            {!uploadMode ? (
              <div className="space-y-2">
                <button
                  onClick={() => setUploadMode('computer')}
                  className={`w-full px-4 py-3 border ${borderColor} ${textColor} ${hoverBg} rounded-lg transition-colors flex items-center gap-3`}
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload from Computer</span>
                </button>
                <button
                  onClick={() => setUploadMode('link')}
                  className={`w-full px-4 py-3 border ${borderColor} ${textColor} ${hoverBg} rounded-lg transition-colors flex items-center gap-3`}
                >
                  <LinkIcon className="w-5 h-5" />
                  <span>Add from Link</span>
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onOpenVariables?.();
                  }}
                  className={`w-full px-3 py-2 text-sm border ${borderColor} text-[#00C6FF] ${hoverBg} rounded transition-colors flex items-center gap-2`}
                >
                  <Plus className="w-4 h-4" />
                  Add Variable
                </button>
              </div>
            ) : uploadMode === 'computer' ? (
              <div className="space-y-3">
                <input
                  type="file"
                  accept={fieldType === 'image' ? 'image/*' : '*'}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const fileName = e.target.files[0].name;
                      const simulatedUrl = `https://storage.flowversal.com/uploads/${fileName}`;
                      setFileUrl(simulatedUrl);
                    }
                  }}
                  className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${textColor} text-sm`}
                />
                {fileUrl && (
                  <p className={`text-xs ${textSecondary} truncate`}>{fileUrl}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleFileUrlAdd}
                    disabled={!fileUrl}
                    className={`flex-1 px-4 py-2 bg-[#00C6FF] text-white rounded-lg hover:bg-[#00B8EC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                  >
                    Add File
                  </button>
                  <button
                    onClick={() => {
                      setUploadMode(null);
                      setFileUrl('');
                    }}
                    className={`px-4 py-2 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-500/10 transition-colors text-sm`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder={fieldType === 'image' ? 'https://example.com/image.jpg' : 'https://example.com/file.pdf'}
                  className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textColor} text-sm`}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleFileUrlAdd}
                    disabled={!fileUrl}
                    className={`flex-1 px-4 py-2 bg-[#00C6FF] text-white rounded-lg hover:bg-[#00B8EC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                  >
                    Add Link
                  </button>
                  <button
                    onClick={() => {
                      setUploadMode(null);
                      setFileUrl('');
                    }}
                    className={`px-4 py-2 border ${borderColor} ${textColor} rounded-lg hover:bg-gray-500/10 transition-colors text-sm`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderIcon = () => {
    switch (fieldType) {
      case 'date':
      case 'date-picker':
        return <CalendarIcon className="w-4 h-4 text-[#00C6FF]" />;
      case 'time':
        return <Clock className="w-4 h-4 text-[#00C6FF]" />;
      case 'file':
      case 'image':
      case 'uploaded':
        return <Upload className="w-4 h-4 text-[#00C6FF]" />;
      default:
        return null;
    }
  };

  const shouldShowDropdownOnClick = ['radio', 'dropdown', 'checklist', 'date', 'date-picker', 'time', 'toggle', 'file', 'image', 'uploaded'].includes(fieldType);

  return (
    <div className="relative">
      {/* Dropdown renders ABOVE when shown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className={`absolute z-[9999] bottom-full mb-2 w-full ${bgDropdown} border ${borderColor} rounded-lg shadow-2xl overflow-hidden`}
          style={{ maxHeight: '400px' }}
        >
          <div className="max-h-96 overflow-y-auto">
            {renderDropdownContent()}
          </div>
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => {
            if (shouldShowDropdownOnClick) {
              setShowDropdown(!showDropdown);
            }
          }}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-20 rounded-lg ${bgInput} border ${
            isActive ? 'border-[#00C6FF] ring-2 ring-[#00C6FF]/20' : borderColor
          } ${textColor} transition-all text-sm`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {renderIcon()}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenVariables?.();
            }}
            className={`p-1 rounded ${hoverBg} text-[#00C6FF] hover:bg-[#00C6FF]/10 transition-colors`}
            title="Add variable"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
