import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function AdminPageHeader({ title, subtitle, icon: Icon, actions, backLink, rightElement }) {
  return (
    <header className="px-8 py-6 bg-white border-b border-slate-200/60 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          {backLink && (
            <Link to={backLink} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2 hover:text-slate-900 transition-all">
              <ChevronRight size={10} className="rotate-180" />
              <span>Back</span>
            </Link>
          )}
          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
            <span>Academic Engine</span>
            <ChevronRight size={10} />
            <span className="text-slate-900 uppercase">{title}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight leading-none">
            {subtitle}
          </h1>
        </div>
        {rightElement && <div className="flex items-center gap-3">{rightElement}</div>}
      </div>
    </header>
  );
}