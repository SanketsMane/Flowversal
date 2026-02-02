import { useState } from 'react';

interface LogicOperatorProps {
  value: 'OR' | 'AND';
  onChange: (value: 'OR' | 'AND') => void;
  theme: string;
}

export function LogicOperator({ value, onChange, theme }: LogicOperatorProps) {
  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-100';
  const textColor = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div className="flex items-center justify-center my-2">
      <button
        onClick={() => onChange(value === 'OR' ? 'AND' : 'OR')}
        className={`px-4 py-1.5 ${bgColor} ${textColor} text-xs rounded-full hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 hover:text-[#00C6FF] transition-all border border-[#2A2A3E]`}
      >
        {value}
      </button>
    </div>
  );
}
