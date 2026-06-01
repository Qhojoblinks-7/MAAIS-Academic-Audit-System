﻿import React, { useState, useMemo } from 'react';
import { 
  Building2, School, BookOpen, Layers, 
  ChevronRight, ChevronDown, Plus, MoreVertical,
  CheckCircle2, XCircle, Users, LayoutGrid,
  Settings2, Hash, Clock, ShieldCheck,
  AlertTriangle, Filter, Search, Download,
  Map, BookMarked, Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { GradingRulesView } from './GradingRulesView';

// --- Mock Data ---

const MOCK_YEARS = [
  {
    id: 'YG1',
    name: 'SHS 1',
    programs: [
      {
        id: 'P1-SCI',
        name: 'Science',
        classrooms: [
          { id: 'C1-S1', name: '1 Science 1', capacity: 45, studentsCount: 42, houseDistribution: { 'Guggisberg': 12, 'Aggrey': 10, 'Nkrumah': 20 } },
          { id: 'C1-S2', name: '1 Science 2', capacity: 45, studentsCount: 46, houseDistribution: { 'Guggisberg': 15, 'Aggrey': 15, 'Nkrumah': 16 } },
        ]
      },
      {
        id: 'P1-ART',
        name: 'General Arts',
        classrooms: [
          { id: 'C1-A1', name: '1 Arts 1', capacity: 50, studentsCount: 48, houseDistribution: { 'Guggisberg': 22, 'Aggrey': 26 } },
        ]
      }
    ]
  },
  {
    id: 'YG2',
    name: 'SHS 2',
    programs: [
      {
        id: 'P2-BUS',
        name: 'Business',
        classrooms: [
          { id: 'C2-B1', name: '2 Business 1', capacity: 40, studentsCount: 38, houseDistribution: { 'Nkrumah': 38 } },
        ]
      }
    ]
  },
  {
    id: 'YG3',
    name: 'SHS 3',
    programs: [
      {
        id: 'P3-SCI',
        name: 'Science',
        classrooms: [
          { id: 'C3-S1', name: '3 Science 1', capacity: 45, studentsCount: 44, houseDistribution: { 'Guggisberg': 10, 'Aggrey': 10, 'Nkrumah': 24 } },
        ]
      }
    ]
  }
];

const MOCK_SUBJECTS = [
  { id: 'S1', code: 'CORE-MT', name: 'Core Mathematics', type: 'Core', creditHours: 4, applicablePrograms: [] },
  { id: 'S2', code: 'CORE-EN', name: 'English Language', type: 'Core', creditHours: 4, applicablePrograms: [] },
  { id: 'S3', code: 'CORE-SC', name: 'Integrated Science', type: 'Core', creditHours: 3, applicablePrograms: [] },
  { id: 'S4', code: 'ELEC-PHY', name: 'Elective Physics', type: 'Elective', creditHours: 4, applicablePrograms: ['Science'] },
  { id: 'S5', code: 'ELEC-ACC', name: 'Cost Accounting', type: 'Elective', creditHours: 4, applicablePrograms: ['Business'] },
  { id: 'S6', code: 'ELEC-LIT', name: 'Lit-In-English', type: 'Elective', creditHours: 3, applicablePrograms: ['General Arts'] },
];

export function AcademicArchitect() {
  const [activeTab, setActiveTab] = useState('Blueprint');
  const [expandedYears, setExpandedYears] = useState(['YG1', 'YG3']);
  const [expandedPrograms, setExpandedPrograms] = useState(['P1-SCI', 'P3-SCI']);

  // --- Helpers ---
  
  const toggleYear = (id) => {
    setExpandedYears(prev => prev.includes(id) ? prev.filter(y => y !== id) : [...prev, id]);
  };

  const toggleProgram = (id) => {
    setExpandedPrograms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-200/60 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <span>Academic Engine</span>
              <ChevronRight size={10} />
              <span className="text-slate-900 uppercase">Academic Architect</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight leading-none">
              Institutional Structural Governance
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            {[
              { id: 'Blueprint', label: 'Class Structures', icon: Building2 },
              { id: 'Curriculum', label: 'Subject Mapping', icon: BookOpen },
              { id: 'Grading', label: 'Grading Protocol', icon: Gauge },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {activeTab === 'Blueprint' ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* Hierarchical Tree View */}
              <div className="xl:col-span-8 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em]">Institutional Blueprint</h3>
                      <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-widest italic">Physical & Logical Entity Tree</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20">
                      <Plus size={14} /> Add Year Group
                    </button>
                  </div>

                  <div className="space-y-4">
                    {MOCK_YEARS.map((year) => (
                      <div key={year.id} className="space-y-3">
                        {/* Year Node */}
                        <div 
                          onClick={() => toggleYear(year.id)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all",
                            expandedYears.includes(year.id) ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 text-slate-900 hover:bg-slate-100"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                              expandedYears.includes(year.id) ? "bg-white/10 text-white" : "bg-white text-slate-400 border border-slate-200"
                            )}>
                              {expandedYears.includes(year.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                            <span className="text-sm font-black italic font-display tracking-tight">{year.name}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className={cn("text-[9px] font-black uppercase tracking-widest", expandedYears.includes(year.id) ? "text-white/40" : "text-slate-400")}>Pop. Census</p>
                              <p className="text-[11px] font-black italic font-display">{year.programs.reduce((acc, p) => acc + p.classrooms.reduce((acc2, c) => acc2 + c.studentsCount, 0), 0)} Units</p>
                            </div>
                            <MoreVertical size={16} className={cn(expandedYears.includes(year.id) ? "text-white/40" : "text-slate-300")} />
                          </div>
                        </div>

                        {/* Programs Sub-tree */}
                        <AnimatePresence>
                          {expandedYears.includes(year.id) && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-8 space-y-3 overflow-hidden border-l-2 border-slate-100 ml-8"
                            >
                              {year.programs.map((program) => (
                                <div key={program.id} className="space-y-3">
                                  {/* Program Node */}
                                  <div 
                                    onClick={(e) => { e.stopPropagation(); toggleProgram(program.id); }}
                                    className={cn(
                                      "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all",
                                      expandedPrograms.includes(program.id) ? "bg-emerald-50 text-emerald-900 border border-emerald-100 shadow-sm" : "bg-white border border-slate-100 hover:bg-slate-50"
                                    )}
                                  >
                                    <div className="flex items-center gap-4">
                                      <School size={16} className={cn(expandedPrograms.includes(program.id) ? "text-emerald-600" : "text-slate-300")} />
                                      <span className="text-[12px] font-black uppercase tracking-widest">{program.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{program.classrooms.length} Structural Nodes</span>
                                      {expandedPrograms.includes(program.id) ? <ChevronDown size={14} className="text-emerald-400" /> : <ChevronRight size={14} className="text-slate-300" />}
                                    </div>
                                  </div>

                                  {/* Classrooms Sub-tree */}
                                  <AnimatePresence>
                                    {expandedPrograms.includes(program.id) && (
                                      <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="pl-4 space-y-2 border-l-2 border-emerald-100/50"
                                      >
                                        {program.classrooms.map((classroom) => (
                                          <div key={classroom.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-300 transition-all shadow-sm group">
                                            <div className="flex items-center gap-5">
                                              <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center transition-all group-hover:bg-slate-900 group-hover:text-white">
                                                <Layers size={18} />
                                              </div>
                                              <div>
                                                <p className="text-[14px] font-black italic font-display text-slate-900 leading-none mb-1">{classroom.name}</p>
                                                <div className="flex items-center gap-2">
                                                  <Users size={10} className="text-slate-300" />
                                                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.15em]">{classroom.studentsCount} Linked Profiles</span>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                              <div className="text-center min-w-[80px]">
                                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Capacity Load</p>
                                                <div className="flex items-center gap-2">
                                                  <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden min-w-[50px]">
                                                    <div 
                                                      className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        classroom.studentsCount >= classroom.capacity ? "bg-rose-500" : "bg-emerald-500"
                                                      )}
                                                      style={{ width: `${Math.min((classroom.studentsCount / classroom.capacity) * 100, 100)}%` }}
                                                    />
                                                  </div>
                                                  <span className={cn(
                                                    "text-[10px] font-black italic font-display",
                                                    classroom.studentsCount >= classroom.capacity ? "text-rose-600" : "text-emerald-600 font-mono"
                                                  )}>
                                                    {classroom.studentsCount}/{classroom.capacity}
                                                  </span>
                                                </div>
                                                {classroom.studentsCount > classroom.capacity && (
                                                  <div className="flex items-center gap-1 mt-1 justify-center">
                                                    <AlertTriangle size={8} className="text-rose-500" />
                                                    <span className="text-[7px] font-black text-rose-500 uppercase tracking-tighter">Capacity Threshold Exceeded</span>
                                                  </div>
                                                )}
                                              </div>
                                              
                                              <div className="h-8 w-px bg-slate-100" />

                                              <div className="flex -space-x-2">
                                                {Object.entries(classroom.houseDistribution).map(([house, count], i) => (
                                                  <div 
                                                    key={house} 
                                                    title={`${house}: ${count} Students`}
                                                    className={cn(
                                                      "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm ring-1 ring-slate-100",
                                                      i === 0 ? "bg-blue-500" : i === 1 ? "bg-amber-500" : "bg-emerald-500"
                                                    )}
                                                  >
                                                    {house[0]}
                                                  </div>
                                                ))}
                                              </div>
                                              
                                              <button className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                                <MoreVertical size={18} />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                        <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center gap-3 text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all">
                                          <Plus size={16} />
                                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Classroom Unit</span>
                                        </button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logical Insights Panel */}
              <div className="xl:col-span-4 space-y-8 sticky top-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/10">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.25em] mb-8 text-white/60">Load Distribution Matrix</h3>
                  <div className="space-y-6">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Top Program Load</p>
                       <div className="flex justify-between items-baseline mb-2">
                          <span className="text-3xl font-black italic font-display">Science</span>
                          <span className="text-emerald-400 text-sm font-black italic font-display">+12%</span>
                       </div>
                       <p className="text-[10px] text-white/60 font-medium leading-relaxed italic uppercase tracking-wider">High resource demand in SHS 1 Cluster detected.</p>
                       <div className="mt-6 flex gap-2">
                         <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full w-4/5 bg-emerald-500" />
                         </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                         <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Total Class Units</p>
                         <p className="text-2xl font-black italic font-display">24</p>
                      </div>
                      <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                         <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Avg Occupancy</p>
                         <p className="text-2xl font-black italic font-display font-mono">92%</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-8 py-5 bg-white text-slate-900 rounded-[2rem] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
                    <Download size={16} /> Structural Export
                  </button>
                </div>

                <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-amber-200 text-amber-700 rounded-xl flex items-center justify-center">
                      <AlertTriangle size={20} />
                    </div>
                    <h3 className="text-[11px] font-black text-amber-900 uppercase tracking-[0.25em]">Capacity Anomalies</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-2xl border border-amber-200/50">
                       <div className="flex justify-between items-center mb-1">
                         <span className="text-[12px] font-black text-slate-900 italic font-display tracking-tight leading-none">1 Science 2</span>
                         <span className="text-[10px] font-black text-rose-600 italic font-display font-mono">⚠️ Overflow</span>
                       </div>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">46 / 45 Standard Capacity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'Curriculum' ? (
            /* Subject Mapping Matrix */
            <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-8 border-b border-slate-100 shrink-0 bg-white">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                      <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em]">Curriculum Allocation Matrix</h3>
                      <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-widest italic">Multi-Program Subject Logical Grid</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="relative">
                         <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                         <input 
                           type="text" 
                           placeholder="Search Subject Protocol..." 
                           className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold outline-none w-64"
                         />
                       </div>
                       <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                         <Map size={16} /> Auto-Sync Core
                       </button>
                    </div>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {['All Classes', 'SHS 1 Cluster', 'SHS 2 Cluster', 'SHS 3 Cluster', 'Science Only', 'Arts Only'].map((f, i) => (
                      <button 
                        key={i} 
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 whitespace-nowrap",
                          i === 0 ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[250px] bg-slate-50 border-r border-slate-200 sticky left-0 z-30">Subject Logic Unit</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center w-[100px]">Credits</th>
                        {MOCK_YEARS.flatMap(y => y.programs.flatMap(p => p.classrooms)).map(cls => (
                          <th key={cls.id} className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-tighter text-center min-w-[100px] hover:bg-slate-100 transition-colors">
                            <span className="italic font-display">{cls.name.split(' ')[0]}</span>
                            <span className="block text-[8px] opacity-40 font-black mt-0.5">{cls.name.split(' ').slice(1).join(' ')}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MOCK_SUBJECTS.map((sub) => (
                        <tr key={sub.id} className="group hover:bg-slate-50/50">
                          <td className="px-8 py-5 border-r border-slate-100 bg-white sticky left-0 z-10 group-hover:bg-slate-50 shadow-[5px_0_15px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm",
                                sub.type === 'Core' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                              )}>
                                {sub.type === 'Core' ? <ShieldCheck size={16} /> : <BookMarked size={16} />}
                              </div>
                              <div>
                                <p className="text-[13px] font-black italic font-display text-slate-900 leading-none mb-1">{sub.name}</p>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{sub.code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center border-r border-slate-100">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-sm font-black italic font-display text-slate-900">{sub.creditHours}</span>
                              <Clock size={10} className="text-slate-300" />
                            </div>
                          </td>
                          {MOCK_YEARS.flatMap(y => y.programs.flatMap(p => p.classrooms)).map(cls => {
                            const isCore = sub.type === 'Core';
                            const progName = cls.name.toLowerCase().includes('science') ? 'Science' : 
                                            cls.name.toLowerCase().includes('arts') ? 'General Arts' : 
                                            cls.name.toLowerCase().includes('bus') ? 'Business' : '';
                            const isProgramMatch = sub.applicablePrograms.includes(progName);
                            const isRecommended = isCore || isProgramMatch;

                            return (
                              <td key={cls.id} className={cn(
                                "px-4 py-5 text-center border-r border-slate-50 transition-colors",
                                isCore ? "bg-emerald-50/20" : ""
                              )}>
                                <div className="flex items-center justify-center">
                                  <label className="relative flex items-center cursor-pointer group/toggle">
                                    <input type="checkbox" defaultChecked={isRecommended} className="peer sr-only" />
                                    <div className={cn(
                                      "w-10 h-6 bg-slate-100 rounded-full peer-checked:bg-slate-900 transition-all shadow-inner border border-slate-200",
                                      isCore && "opacity-50 cursor-not-allowed"
                                    )}>
                                      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-4 shadow-sm" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 opacity-0 group-hover/toggle:opacity-100 pointer-events-none transition-opacity">
                                      {isRecommended && <CheckCircle2 size={10} className="text-emerald-500 fill-white" />}
                                    </div>
                                  </label>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-200 shrink-0 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-8">
                     <div className="flex items-center gap-3">
                       <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Curriculum Nodes</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Elective Protocol</span>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <button className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Discard Draft</button>
                      <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform">
                        <ShieldCheck size={16} /> Deploy Architecture
                      </button>
                   </div>
                </div>
              </div>

              {/* Subject Mapping Key & Validation */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Subject Logic', value: '32', icon: BookMarked, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Weighted Unit Load', value: '142', icon: Hash, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Integrity Rating', value: 'High', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Conflicting Nodes', value: '0', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center justify-between">
                    <div className={cn("w-12 h-12 rounded-[1.25rem] flex items-center justify-center", stat.bg, stat.color)}>
                      <stat.icon size={22} />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-xl font-black italic font-display text-slate-900 leading-none">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="-mx-8 -my-8 h-[calc(100vh-200px)]">
              <GradingRulesView />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}