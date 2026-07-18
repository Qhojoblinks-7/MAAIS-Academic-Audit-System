import React from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  Users, 
  ChevronRight, 
  Plus,
  LayoutGrid,
  List,
  PieChart,
  ArrowRight,
  Crown,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '../../../lib/utils';
import { buildDistribution } from '../hooks/useDepartments';

export function DepartmentGrid({ departments, viewType, setViewType, setSelectedDeptId, onSpawnClick }) {
  return (
    <>
      {/* 1. Page Title */}
      <header className="px-4 sm:px-8 py-4 bg-surface border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-black text-foreground italic font-display tracking-tight leading-none">
            The Digital Filing Cabinet
          </h1>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex bg-muted/20 p-1 rounded-xl border border-border">
            <button 
              onClick={() => setViewType('grid')}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all",
                viewType === 'grid' ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground/80"
              )}
            >
              <LayoutGrid size={12} />
              Folders
            </button>
            <button 
              onClick={() => setViewType('list')}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all",
                viewType === 'list' ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground/80"
              )}
            >
               <List size={12} />
               Staff
            </button>
          </div>
          <button 
            onClick={onSpawnClick}
            className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-primary-foreground rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-dark/90 transition-all shadow-lg shadow-brand-dark/10 group"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
            Spawn Dept
          </button>
        </div>
      </header>

       <div className="flex-1 flex overflow-hidden">
         <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-hide">
           <div className="max-w-7xl mx-auto">
             <section>
               <div className={cn(
                 "grid gap-4 sm:gap-5",
                 viewType === 'grid' 
                   ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" 
                   : "grid-cols-1"
               )}>
                {departments.map((dept, i) => (
                  <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedDeptId(dept.id)}
                    className="bg-surface rounded-2xl border border-border/50 p-5 shadow-sm hover:shadow-xl hover:border-border transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Background Icon Watermark */}
                    <div className={cn("absolute top-0 right-0 w-20 h-20 opacity-[0.02] -mr-4 -mt-4 group-hover:rotate-12 transition-transform", dept.color)}>
                      <Folder size={120} />
                    </div>

                    <div>
                      {/* Card Header Section */}
                      <div className="flex justify-between items-center mb-4 relative">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shadow-md", dept.color)}>
                          <Folder size={18} />
                        </div>
                        <div className={cn(
                          "px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest shadow-sm",
                          dept.validationStatus === 100 ? "bg-success/10 border-success/20 text-success" : "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
                        )}>
                          {dept.validationStatus}% Verified
                        </div>
                      </div>

                      {/* Content Titles */}
                      <h4 className="text-xl font-black italic font-display text-foreground tracking-tight leading-none mb-1.5">{dept.name}</h4>
                      <p className="text-xs text-muted-foreground font-bold leading-normal mb-4 line-clamp-2 uppercase tracking-wide">{dept.description}</p>
                    </div>

                    {/* Footer Stats Grid */}
                    <div className="space-y-3 pt-4 border-t border-border relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted/10 flex items-center justify-center text-muted-foreground shadow-inner group-hover:bg-muted/20 transition-colors">
                            <Users size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-foreground uppercase tracking-widest leading-none mb-0.5">{dept.teacherCount} Teachers</p>
                             <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Active Staff</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-border group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Compact HOD Section */}
                      <div className="p-2.5 bg-muted/10 rounded-xl flex items-center justify-between group-hover:bg-muted/10 transition-all border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-surface border border-border text-warning flex items-center justify-center shadow-sm shrink-0">
                            <Crown size={12} fill="currentColor" fillOpacity={0.2} />
                          </div>
                          <div className="truncate">
                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-0.5">Assigned HOD</p>
                            <p className="text-xs font-black text-foreground leading-none italic font-display truncate">{dept.hodName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Compliance Checklist */}
                      {dept.checklist && dept.checklist.length > 0 && (
                        <div className="p-2.5 bg-muted/10 rounded-xl border border-border/50">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-2">Compliance Checklist</p>
                          <div className="space-y-1.5">
                            {dept.checklist.slice(0, 4).map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full border ${item.completed ? 'bg-success/100 border-success' : 'border-border'} flex items-center justify-center shrink-0`}>
                                  {item.completed && <CheckCircle2 size={8} className="text-primary-foreground" />}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-wider ${item.completed ? 'text-foreground/80' : 'text-muted-foreground'}`}>{item.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Small Progress Tracker Bar */}
                      <div className="pt-0.5">
                        <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${dept.validationStatus}%` }}
                            transition={{ duration: 1.2 }}
                            className={cn("h-full rounded-full transition-all", 
                              dept.validationStatus === 100 ? "bg-success/100" : "bg-brand-primary"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside className="hidden xl:flex w-80 2xl:w-96 bg-surface border-l border-border/60 flex-col shrink-0">
          <div className="p-6 border-b border-border/60 flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-primary-foreground">
              <PieChart size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-0.5">Resource Pulse</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Institutional Equity Monitor</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide">
            <section>
              <h4 className="text-xs font-black text-foreground uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                <div className="w-6 h-[1.5px] bg-border" />
                The Balance Meter
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={buildDistribution(departments)} layout="vertical" margin={{ left: -20, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-brand-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-2xl ring-1 ring-surface/10">
                               {payload[0].value} Staff
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                     <Bar dataKey="teachers" radius={[0, 4, 4, 0]} barSize={16}>
                       {buildDistribution(departments).map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.hex || (index % 2 === 0 ? '#1e293b' : '#334155')} />
                       ))}
                     </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section>
              <h4 className="text-xs font-black text-foreground uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                <div className="w-6 h-[1.5px] bg-border" />
                Strategic Mapping
              </h4>
              <div className="space-y-4">
                {[
                   { name: 'Technical Stream', depts: ['Mathematics', 'Technical'], color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
                  { name: 'Medical Path', depts: ['Science', 'Languages'], color: 'text-destructive', bg: 'bg-destructive/5' },
                  { name: 'Global Commerce', depts: ['Business', 'Math', 'Languages'], color: 'text-warning', bg: 'bg-warning/10' },
                ].map((mapping, i) => (
                  <div key={i} className={cn("p-4 border border-border rounded-2xl group hover:border-border transition-all", mapping.bg)}>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className={cn("w-2 h-2 rounded-full", mapping.color.replace('text-', 'bg-'))} />
                      <p className="text-xs font-black text-foreground tracking-tight">{mapping.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {mapping.depts.map((d, di) => (
                        <span key={di} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-surface/60 text-foreground/60 rounded-lg group-hover:bg-brand-primary group-hover:text-primary-foreground transition-all">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </>
  );
}

export default DepartmentGrid;
