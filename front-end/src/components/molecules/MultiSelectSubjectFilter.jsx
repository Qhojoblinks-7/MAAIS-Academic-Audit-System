import React, { useState, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { EmptyState } from '../shared/EmptyState';

const DEFAULT_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Geography',
  'Government',
  'History',
  'ICT',
  'Food & Nutrition',
  'Clothing & Textiles',
];

export function MultiSelectSubjectFilter({
  subjects = DEFAULT_SUBJECTS,
  selected = [],
  onChange,
  searchPlaceholder = 'Search subjects...',
  label = 'Subjects',
  className,
}) {
  const [search, setSearch] = useState('');

  const filteredSubjects = useMemo(() => {
    if (!search.trim()) return subjects;
    return subjects.filter((s) =>
      s.toLowerCase().includes(search.toLowerCase())
    );
  }, [subjects, search]);

  const toggle = (subject) => {
    if (!onChange) return;
    const set = new Set(selected);
    if (set.has(subject)) {
      set.delete(subject);
    } else {
      set.add(subject);
    }
    onChange(Array.from(set));
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          {label}
        </label>
      )}

      <div className="relative">
        <Search
          size={12}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-100 rounded-xl p-1">
        {filteredSubjects.length === 0 && (
          <div className="text-center py-3">
            <EmptyState context="subjects" variant="compact" />
          </div>
        )}
        {filteredSubjects.map((subject) => {
          const isSelected = selected.includes(subject);
          return (
            <button
              key={subject}
              type="button"
              onClick={() => toggle(subject)}
              className={cn(
                'w-full px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition-all',
                isSelected
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'hover:bg-gray-50 text-gray-700'
              )}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded border flex items-center justify-center transition-all',
                  isSelected
                    ? 'bg-emerald-600 border-emerald-600'
                    : 'border-gray-300 bg-white'
                )}
              >
                {isSelected && <Check size={10} className="text-white" />}
              </span>
              {subject}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-[10px] text-gray-500">
          {selected.length} subject{selected.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
