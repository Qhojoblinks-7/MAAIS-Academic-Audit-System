import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Send } from 'lucide-react';

export function HODCommentInput({ onSubmit, placeholder = "Add HOD comment...", maxLength = 500, initialValue = "" }) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = () => {
    if (value.trim() && onSubmit) {
      onSubmit(value);
      setValue('');
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={3}
        className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-success/20 focus:border-success resize-none"
      />
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-xs",
          value.length < 10 ? "text-destructive" : "text-muted-foreground"
        )}>
          {value.length} / {maxLength} characters
          {value.length > 0 && value.length < 10 && " (Minimum 10 required)"}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || value.length < 10}
          className="px-3 py-1.5 bg-success text-background text-xs font-medium rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Send size={12} />
          Submit
        </button>
      </div>
    </div>
  );
}
