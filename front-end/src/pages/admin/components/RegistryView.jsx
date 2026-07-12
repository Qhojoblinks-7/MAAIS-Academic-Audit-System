import React from 'react';
import { Search, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { registryStats, adminUsers } from '../data';

export function RegistryView() {
  return (
    <div className="space-y-3 px-1 sm:px-0">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {registryStats.map((stat, i) => (
          <div key={i} className="bg-surface p-3 rounded-xl border border-border shadow-xs flex flex-col justify-between">
            <div>
              <p className="text-[16px] font-black text-foreground tracking-tighter leading-none">{stat.value}</p>
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wider mt-1 leading-none">{stat.label}</p>
            </div>
            <p className="text-[7.5px] font-black text-success uppercase tracking-wider mt-2 bg-success/10 w-fit px-1.5 py-0.5 rounded-md font-mono">
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Action Bar & High-Density Node Feed */}
      <div className="bg-surface rounded-xl border border-border shadow-xs overflow-hidden">
        {/* Filter Controls Header */}
        <div className="p-2.5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between bg-muted/10 gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
              <input 
                type="text" 
                placeholder="Search nodes..." 
                className="w-full h-8 pl-8 pr-3 bg-surface border border-border rounded-lg text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-success/10 transition-all"
              />
            </div>
            
            <div className="flex gap-0.5 p-0.5 bg-muted/20 rounded-lg shrink-0">
              {['ALL', 'TEACH', 'HOD', 'STUD'].map((role) => (
                <button key={role} className="px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider hover:bg-surface transition-all text-muted-foreground hover:text-foreground whitespace-nowrap">
                  {role}
                </button>
              ))}
            </div>
          </div>
          
          <button className="h-8 px-4 bg-success hover:bg-success/80 text-primary-foreground rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0 active:scale-[0.99]">
            <UserPlus size={12} />
            Onboard Entity
          </button>
        </div>

        {/* High-Density Row List (Replaces Table) */}
        <div className="divide-y divide-border">
          {adminUsers.map((user) => (
            <div 
              key={user.id} 
              className="p-2 sm:p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/20 transition-colors group"
            >
              {/* Identity Column */}
              <div className="flex items-center gap-2.5 min-w-0 sm:w-1/3">
                <div className="w-7 h-7 rounded-lg bg-muted/20 border border-border flex items-center justify-center text-foreground/50 font-bold text-[11px] group-hover:bg-success/10 group-hover:text-success transition-colors shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-foreground tracking-tight leading-none mb-0.5 truncate">{user.name}</p>
                  <p className="text-[8px] font-medium text-muted-foreground font-mono truncate">Last: {user.lastLogin}</p>
                </div>
              </div>

              {/* Attributes Container */}
              <div className="flex items-center justify-between sm:justify-start gap-4 sm:w-2/3 min-w-0">
                {/* Authorization Status */}
                <div className="sm:w-1/3">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider inline-block font-mono",
                    user.role === 'SUPER_ADMIN' || user.role === 'HEADMASTER' ? 'bg-brand-dark/10 text-brand-dark' :
                    user.role === 'HOD' ? 'bg-brand-primary/10 text-brand-primary' :
                    user.role === 'TEACHER' ? 'bg-success/10 text-success' : 'bg-muted/20 text-muted-foreground'
                  )}>
                    {user.role}
                  </span>
                </div>

                {/* Sub-Node Department */}
                <div className="sm:w-1/3 truncate">
                  <span className="text-[10px] font-bold text-foreground/80 uppercase tracking-wider font-mono">
                    {user.dept}
                  </span>
                </div>

                {/* Protocol Lifecycle Status */}
                <div className="flex items-center gap-1.5 sm:w-1/3 sm:justify-center">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    user.status === 'ACTIVE' ? "bg-success/100 animate-pulse" : "bg-border"
                  )} />
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider",
                    user.status === 'ACTIVE' ? "text-success" : "text-muted-foreground"
                  )}>
                    {user.status === 'ACTIVE' ? 'Online' : 'Dormant'}
                  </span>
                </div>

                {/* Actions Control Deck */}
                <div className="flex items-center justify-end gap-0.5 shrink-0 sm:ml-auto md:opacity-0 md:group-hover:opacity-100 transition-all duration-150 transform md:translate-x-1 md:group-hover:translate-x-0">
                  <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/10 rounded-md transition-all">
                    <Edit2 size={11} />
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-all">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}