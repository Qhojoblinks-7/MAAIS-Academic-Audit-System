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
  Crown
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
import mockApiData from '../../../data/mockApiData.json';

export function DepartmentGrid({ departments, viewType, setViewType, setSelectedDeptId, onSpawnClick }) {
  return (
    <>
      {/* 1. Breadcrumbs Header */}
      <header className="px-4 sm:px-8 py-4 bg-white border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">
            <span className="hover:text-slate-900 cursor-pointer">Registry</span>
            <ChevronRight size={10} />
            <span className="hover:text-slate-900 cursor-pointer">Identity Manager</span>
            <ChevronRight size={10} />
            <span className="text-slate-900">Departmental Hierarchy</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 italic font-display tracking-tight leading-none">
            The Digital Filing Cabinet
          </h1>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setViewType('grid')}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all",
                viewType === 'grid' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid size={12} />
              Folders
            </button>
            <button 
              onClick={() => setViewType('list')}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all",
                viewType === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List size={12} />
              Registry
            </button>
          </div>
          <button 
            onClick={onSpawnClick}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/10 group"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
            Spawn Dept
          </button>
        </div>
      </header>

       <div className="flex-1 flex overflow-hidden">
         <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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
                    className="bg-white rounded-2xl border border-slate-200/50 p-5 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Background Icon Watermark */}
                    <div className={cn("absolute top-0 right-0 w-20 h-20 opacity-[0.02] -mr-4 -mt-4 group-hover:rotate-12 transition-transform", dept.color)}>
                      <Folder size={120} />
                    </div>

                    <div>
                      {/* Card Header Section */}
                      <div className="flex justify-between items-center mb-4 relative">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md", dept.color)}>
                          <Folder size={18} />
                        </div>
                        <div className={cn(
                          "px-2.5 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest shadow-sm",
                          dept.validationStatus === 100 ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-blue-50 border-blue-100 text-blue-700"
                        )}>
                          {dept.validationStatus}% Verified
                        </div>
                      </div>

                      {/* Content Titles */}
                      <h4 className="text-xl font-black italic font-display text-slate-900 tracking-tight leading-none mb-1.5">{dept.name}</h4>
                      <p className="text-[11px] text-slate-400 font-bold leading-normal mb-4 line-clamp-2 uppercase tracking-wide">{dept.description}</p>
                    </div>

                    {/* Footer Stats Grid */}
                    <div className="space-y-3 pt-4 border-t border-slate-50 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-slate-100 transition-colors">
                            <Users size={14} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mb-0.5">{dept.teacherCount} Teachers</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Active Staff Nodes</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-200 group-hover:text-slate-999 group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Compact HOD Section */}
                      <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between group-hover:bg-slate-100/50 transition-all border border-slate-100/50">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 text-amber-600 flex items-center justify-center shadow-sm shrink-0">
                            <Crown size={12} fill="currentColor" fillOpacity={0.2} />
                          </div>
                          <div className="truncate">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Assigned HOD</p>
                            <p className="text-[12px] font-black text-slate-900 leading-none italic font-display truncate">{dept.hodName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Small Progress Tracker Bar */}
                      <div className="pt-0.5">
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${dept.validationStatus}%` }}
                            transition={{ duration: 1.2 }}
                            className={cn("h-full rounded-full transition-all", 
                              dept.validationStatus === 100 ? "bg-emerald-500" : "bg-blue-500"
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

        <aside className="hidden xl:flex w-80 2xl:w-96 bg-white border-l border-slate-200/60 flex-col shrink-0">
          <div className="p-6 border-b border-slate-200/60 flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <PieChart size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-0.5">Resource Pulse</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Institutional Equity Monitor</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-10">
            <section>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                <div className="w-6 h-[1.5px] bg-slate-200" />
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
                            <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-2xl ring-1 ring-white/10">
                              {payload[0].value} Staff Nodes
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="teachers" radius={[0, 4, 4, 0]} barSize={16}>
                      {buildDistribution(departments).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1e293b' : '#334155'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                <div className="w-6 h-[1.5px] bg-slate-200" />
                Strategic Mapping
              </h4>
              <div className="space-y-4">
                {[
                  { name: 'Technical Stream', depts: ['Mathematics', 'Vocational'], color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { name: 'Medical Path', depts: ['Science', 'Languages'], color: 'text-rose-600', bg: 'bg-rose-50' },
                  { name: 'Global Commerce', depts: ['Business', 'Math', 'Languages'], color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((mapping, i) => (
                  <div key={i} className="p-4 border border-slate-100 rounded-2xl group hover:border-slate-300 transition-all">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className={cn("w-2 h-2 rounded-full", mapping.color.replace('text-', 'bg-'))} />
                      <p className="text-xs font-black text-slate-900 tracking-tight">{mapping.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {mapping.depts.map((d, di) => (
                        <span key={di} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all">
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