import React, { useState } from 'react';
import { FileText, FileSpreadsheet, BookOpen, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const FORMATS = [
  {
    id: 'csv',
    label: 'CSV',
    description: 'Comma-separated for Excel/Google Sheets',
    icon: FileSpreadsheet,
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Print-ready document',
    icon: FileText,
  },
  {
    id: 'broadsheet',
    label: 'Broadsheet',
    description: 'WAEC official broadsheet format',
    icon: BookOpen,
  },
];

export function ExportFormatSelector({
  value: controlledValue,
  onChange,
  disabled = false,
  className,
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(FORMATS[0].id);

  const currentFormatId = isControlled ? controlledValue : internalValue;
  const currentFormat = FORMATS.find((f) => f.id === currentFormatId) || FORMATS[0];

  const handleSelect = (id) => {
    if (onChange) {
      onChange(id);
    }
    if (!isControlled) {
      setInternalValue(id);
    }
    setInternalOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
        Export Format
      </label>

      <button
        type="button"
        onClick={() => !disabled && setInternalOpen(!internalOpen)}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2 text-xs font-medium border rounded-xl flex items-center gap-2 transition-all',
          disabled
            ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
        )}
      >
        {React.createElement(currentFormat.icon, { size: 14 })}
        <span className="flex-1 text-left">{currentFormat.label}</span>
        <ChevronDown
          size={12}
          className={cn(
            'text-gray-400 transition-transform',
            internalOpen && 'rotate-180'
          )}
        />
      </button>

      {internalOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setInternalOpen(false)}
          />
          <div className="absolute top-full mt-1 w-full bg-white rounded-xl border border-gray-100 shadow-lg p-1 z-50">
            {FORMATS.map((format) => {
              const isActive = currentFormatId === format.id;
              return (
                <button
                  key={format.id}
                  type="button"
                  onClick={() => handleSelect(format.id)}
                  className={cn(
                    'w-full px-3 py-2.5 text-left rounded-lg flex items-start gap-2.5 transition-all',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  )}
                >
                  <format.icon size={15} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium">{format.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {format.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
