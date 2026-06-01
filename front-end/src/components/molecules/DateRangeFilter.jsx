import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const presets = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'This term', value: 'term' },
  { label: 'Custom', value: 'custom' },
];

export function DateRangeFilter({ value, onChange, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customRange, setCustomRange] = useState({ from: '', to: '' });

  const handlePresetSelect = (preset) => {
    if (onChange) {
      onChange({ preset, ...customRange });
    }
    if (preset !== 'custom') {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <Calendar size={12} />
        {presets.find(p => p.value === value?.preset)?.label || 'Date Range'}
        <ChevronDown size={12} className={isOpen ? 'rotate-180' : ''} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg p-2 z-50">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetSelect(preset.value)}
              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 rounded-lg"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
