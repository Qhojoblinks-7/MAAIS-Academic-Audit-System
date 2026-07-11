import { cn } from '../../lib/utils';
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export function SubjectFilter({ subjects = [], selected = [], onChange, className }) {
  const [open, setOpen] = useState(false);
  
  const toggleSubject = (subject) => {
    const newSelected = selected.includes(subject)
      ? selected.filter(s => s !== subject)
      : [...selected, subject];
    onChange?.(newSelected);
  };
  
  const isAllSelected = subjects.length > 0 && selected.length === subjects.length;
  const isIndeterminate = selected.length > 0 && selected.length < subjects.length;
  
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-foreground bg-surface border border-border rounded-xl hover:bg-muted"
      >
        Subject <ChevronDown size={12} />
      </button>
      
      {open && (
         <div className="absolute top-full left-0 mt-2 bg-surface border border-border rounded-xl shadow-lg p-2 z-10 min-w-[160px]">
           <label className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-muted rounded cursor-pointer">
             <input
               type="checkbox"
               checked={isAllSelected}
               ref={(el) => el && (el.indeterminate = isIndeterminate)}
               onChange={() => onChange?.(isAllSelected ? [] : [...subjects])}
             />
             <span className="font-medium">All</span>
           </label>
           <hr className="my-1" />
           {subjects.map(subject => (
             <label key={subject} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-muted rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(subject)}
                onChange={() => toggleSubject(subject)}
              />
              <span>{subject}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}