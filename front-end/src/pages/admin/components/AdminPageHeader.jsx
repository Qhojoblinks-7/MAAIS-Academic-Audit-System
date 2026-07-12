import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function AdminPageHeader({ title, subtitle, icon: Icon, actions, backLink, rightElement }) {
  return (
    <header className="px-8 py-6 bg-surface border-b border-border shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          {backLink && (
             <Link to={backLink} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 hover:text-foreground transition-all">
              <ChevronRight size={10} className="rotate-180" />
              <span>Back</span>
            </Link>
          )}
          <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">
            {subtitle}
          </h1>
        </div>
        {rightElement && <div className="flex items-center gap-3">{rightElement}</div>}
      </div>
    </header>
  );
}
