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
        className="px-3 py-1.5 bg-surface border-border rounded-lg text-xs font-medium text-foreground hover:bg-muted flex items-center gap-2"
      >
        <Calendar size={12} />
        {presets.find(p => p.value === value?.preset)?.label || 'Date Range'}
        <ChevronDown size={12} className={isOpen ? 'rotate-180' : ''} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-48 bg-surface rounded-xl border border-border shadow-lg p-2 z-50">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetSelect(preset.value)}
              className="w-full px-3 py-2 text-left text-xs hover:bg-muted rounded-lg"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
