import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Search, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  Printer,
  Calendar,
  User,
  Users,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Award,
  BookOpen,
  Lock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TeacherArchiveDetailView } from './TeacherArchiveDetailView';

import mockApiData from '../../data/mockApiData.json';

// Teacher archive is sourced from centralized mock API data
// mockApiData.archive.items -> transform into the shape expected by this UI.

export function TeacherArchiveView() {
  const [activeSubTab, setActiveSubTab] = React.useState('REGISTRY');
  const [students] = React.useState(initialTeacherStudents);
  const [selectedStudent, setSelectedStudent] = React.useState(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedClass, setSelectedClass] = React.useState('ALL');
  const [selectedCohortYear, setSelectedCohortYear] = React.useState('ALL');

  // Filter computation
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.index.includes(searchTerm);
    const matchesClass = selectedClass === 'ALL' || s.currentClass === selectedClass;
    const matchesYear = selectedCohortYear === 'ALL' || s.graduationYear === selectedCohortYear;
    return matchesSearch && matchesClass && matchesYear;
  });

  const terms = ['SHS 1-T1', 'SHS 1-T2', 'SHS 1-T3', 'SHS 2-T1', 'SHS 2-T2', 'SHS 2-T3', 'SHS 3-T1', 'SHS 3-T2', 'SHS 3-T3'];

  // Global counts for analytics cards (both current badges and graduated alumni are managed here)
  const totalAlumni = students.length;
  const sealedCount = students.filter(s => s.status === 'Arhive Sealed').length;
  
  const totalGrades = students.flatMap(s => (s.history || []).map(h => h.finalGrade));
  const cumulativeAverage = totalGrades.length > 0 ? (totalGrades.reduce((a, b) => a + b, 0) / totalGrades.length).toFixed(1) : 'N/A';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F9F9F7] relative">
      
      {/* Header & Sub-Tab Bar */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-4 flex flex-col sm:flex-row justify-between items-center z-20 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
            <Database size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">Instructor Archives</h1>
            <p className="text-[10px] font-bold text-slate-450 uppercase leading-none mt-0.5">Academic Cohorts & Alumni Ledger / Applied Sciences Division</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
          {[
            { id: 'REGISTRY', label: 'Archived Dossiers', icon: Database },
            { id: 'INTERVENTIONS', label: 'Historical Interventions', icon: Award },
            { id: 'OBS_SUMMARY', label: 'Past Observations', icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                setSelectedStudent(null);
              }}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all outline-none",
                activeSubTab === tab.id ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.01] select-none z-0">
        <h1 className="text-[14vw] font-black rotate-[-20deg] text-slate-950 uppercase">PAST ARCHIVE</h1>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative z-10 w-full">
        <AnimatePresence mode="wait">
          
          {selectedStudent ? (
            <motion.div 
              key="detail_view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 h-full w-full overflow-hidden"
            >
              <TeacherArchiveDetailView 
                student={selectedStudent}
                onBack={() => setSelectedStudent(null)}
              />
            </motion.div>
          ) : (
            
            <div className="flex-1 overflow-y-auto no-scrollbar">
              
              {activeSubTab === 'REGISTRY' && (
                <motion.div 
                  key="registry"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 space-y-8 max-w-7xl mx-auto"
                >
                  
                  {/* Analytic Indicator Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { title: 'Total Rostered Students', val: totalAlumni, note: 'Current & Graduated cohorts', color: 'slate', icon: Users },
                      { title: 'Cumulative GPA Average', val: `${cumulativeAverage}%`, note: 'Overall average over past terms', color: 'slate', icon: TrendingUp },
                      { title: 'Cryptographic Seals', val: sealedCount, note: 'Tamper-proof department seals', color: 'slate', icon: ShieldCheck },
                      { title: 'Database Security', val: 'Active', note: 'Secure Level 4 Vault Integrity', color: 'slate', icon: Lock }
                    ].map((card, idx) => (
                      <div key={idx} className="bg-white rounded-[2rem] border border-slate-205/60 p-6 flex items-center justify-between shadow-sm">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">{card.val}</p>
                          <p className="text-[10px] font-semibold text-slate-450 uppercase">{card.note}</p>
                        </div>
                        <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white shrink-0 bg-slate-900">
                          <card.icon size={20} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Filter Row */}
                  <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-slate-900 rounded-full animate-pulse" />
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">ARCHIVE STORAGE FILTER MATRIX</h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Frozen Record Search Directory</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Search Index Input */}
                      <div className="relative flex items-center h-12 bg-slate-50 border border-slate-200 rounded-xl px-4">
                        <Search className="text-slate-400 mr-2 shrink-0" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search index, name or matric..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-transparent border-none text-xs text-slate-805 placeholder:text-slate-400 focus:outline-none w-full"
                        />
                      </div>

                      {/* Filter Class */}
                      <div className="relative flex items-center h-12 bg-slate-50 border border-slate-200 rounded-xl px-4">
                        <span className="text-[10px] font-bold text-slate-400 mr-2 shrink-0">GROUP:</span>
                        <select 
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="bg-transparent border-none text-xs text-slate-800 font-extrabold focus:outline-none cursor-pointer w-full"
                        >
                          <option value="ALL">All Cohort Divisions</option>
                          <option value="SHS 1 Agric B">SHS 1 Agric B (Current Form 1)</option>
                          <option value="SHS 2 Science B">SHS 2 Science B (Current Form 2)</option>
                          <option value="SHS 3 Science A">SHS 3 Science A (Current Form 3)</option>
                          <option value="Class of 2024 (Science)">Class of 2024 (Science Alumni)</option>
                          <option value="Class of 2023 (Science)">Class of 2023 (Science Alumni)</option>
                          <option value="Class of 2023 (Agric Science)">Class of 2023 (Agric Alumni)</option>
                        </select>
                      </div>

                      {/* Filter Year */}
                      <div className="relative flex items-center h-12 bg-slate-50 border border-slate-200 rounded-xl px-4">
                        <span className="text-[10px] font-bold text-slate-405 mr-2 shrink-0">YEAR:</span>
                        <select 
                          value={selectedCohortYear}
                          onChange={(e) => setSelectedCohortYear(e.target.value)}
                          className="bg-transparent border-none text-xs text-slate-800 font-extrabold focus:outline-none cursor-pointer w-full"
                        >
                          <option value="ALL">All Graduation/Cohort Years</option>
                          <option value="2028">Form 1 (Class of 2028)</option>
                          <option value="2027">Form 2 (Class of 2027)</option>
                          <option value="2026">Form 3 (Class of 2026)</option>
                          <option value="2024">Class of 2024</option>
                          <option value="2023">Class of 2023</option>
                        </select>
                      </div>

                    </div>
                  </div>

                  {/* Student Registry Table */}
                  <div className="bg-white border border-slate-200/60 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Cohort Dossiers Vault</h4>
                        <p className="text-[10px] text-slate-450 font-bold uppercase mt-1">Official transcripts and qualitative diaries stored in historical vault (Read-Only)</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-100 rounded-lg px-2 text-center py-1">
                        Viewing <span className="text-slate-900 font-black">{filteredStudents.length}</span> active and verified student profiles
                      </span>
                    </header>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/20">
                            <th className="px-8 py-4">Student Identity</th>
                            <th className="px-6 py-4">Current Stream / Batch</th>
                            <th className="px-6 py-4 text-center">Cumulative Grade</th>
                            <th className="px-6 py-4 text-center">WASSCE Code</th>
                            <th className="px-6 py-4 text-center">Archive Integrity Seal</th>
                            <th className="px-8 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredStudents.map(student => {
                            const scores = student.history.map(h => h.finalGrade);
                            const avgGrade = scores.length > 0 ? (scores.reduce((a,b)=>a+b, 0) / scores.length).toFixed(1) + '%' : 'No Past Terms';

                            return (
                              <tr 
                                key={student.id}
                                className="hover:bg-slate-50 group transition-all duration-150 cursor-pointer"
                                onClick={() => setSelectedStudent(student)}
                              >
                                <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
                                      alt="avatar" 
                                      className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-0.5"
                                    />
                                    <div>
                                      <p className="text-xs font-black text-slate-900 tracking-tight">{student.name}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase font-mono">{student.index}</p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-6 py-5 text-xs text-slate-650 font-extrabold text-slate-600">
                                  {student.currentClass}
                                </td>

                                <td className="px-6 py-5 text-center">
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold italic font-mono bg-slate-100 text-slate-800 border-2 border-slate-200/60">
                                    {avgGrade}
                                  </span>
                                </td>

                                <td className="px-6 py-5 text-center bg-transparent">
                                  <span className={cn(
                                    "px-3 py-1 font-mono text-xs font-black rounded-lg text-white",
                                    student.finalWassce === 'Pending' && "bg-slate-400",
                                    student.finalWassce === 'Building' && "bg-slate-300",
                                    student.finalWassce !== 'Pending' && student.finalWassce !== 'Building' && "bg-slate-900"
                                  )}>
                                    WAEC: {student.finalWassce}
                                  </span>
                                </td>

                                <td className="px-6 py-5 text-center">
                                  <span className={cn(
                                    "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border inline-flex items-center gap-1",
                                    student.status === 'Arhive Sealed' && "bg-emerald-50 text-emerald-800 border-emerald-100",
                                    student.status === 'Archive Inbound' && "bg-blue-50 text-blue-800 border-blue-100",
                                    student.status === 'Empty Archive' && "bg-amber-50 text-amber-800 border-amber-100"
                                  )}>
                                    <ShieldCheck size={11} />
                                    {student.status}
                                  </span>
                                </td>

                                <td className="px-8 py-5 text-right">
                                  <button className="p-2 hover:bg-slate-200 group-hover:bg-slate-900 rounded-xl text-slate-400 group-hover:text-white transition-all flex items-center justify-center ml-auto">
                                    <ChevronRight size={18} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </motion.div>
              )}

              {activeSubTab === 'INTERVENTIONS' && (
                <motion.div 
                  key="interventions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 max-w-5xl mx-auto space-y-8"
                >
                  <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                    <div>
                      <h4 className="text-xs font-black text-slate-905 uppercase tracking-widest leading-none">Historical Remedial Actions Catalog</h4>
                      <p className="text-[10px] text-slate-405 font-bold uppercase mt-1">Audit trail of supportive academic tutorial actions performed and finalized in previous terms</p>
                    </div>

                    <div className="space-y-4">
                      {students.flatMap(s => (s.interventions || []).map(int => ({ ...int, studentName: s.name, class: s.currentClass, studentId: s.id }))).map((item, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-slate-200 transition-all">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-[8px] font-black text-slate-800 bg-slate-200 px-2 py-0.5 rounded uppercase">COACHING FILE</span>
                              <p className="text-xs font-black text-slate-900">{item.studentName} — <span className="text-slate-400">{item.class}</span></p>
                            </div>
                            <p className="text-[11px] font-bold text-slate-650 leading-normal">
                              Trigger Cause: <span className="font-medium text-slate-500">{item.reason}</span>
                            </p>
                            <p className="text-[11px] font-bold text-slate-650 leading-normal">
                              Coaching Strategy: <span className="font-medium text-slate-550 italic">"{item.action}"</span>
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-xs font-black text-slate-800 italic border-l-2 md:border-l-0 md:border-r-2 border-slate-900 pl-3 md:pl-0 pr-0 md:pr-3 mb-1">
                              {item.outcome}
                            </p>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Term: {item.term}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSubTab === 'OBS_SUMMARY' && (
                <motion.div 
                  key="observations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 max-w-4xl mx-auto space-y-8"
                >
                  <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none font-sans">Historical Qualitative Notes</h3>
                      <p className="text-[10px] text-slate-450 font-bold uppercase mt-1">Registry of behavioral progress and student performance journals finalized in past years (Locked)</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {students.flatMap(s => (s.observations || []).map(obs => ({ ...obs, studentName: s.name, class: s.currentClass }))).map((entry, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 border-l-4 border-slate-900 border-y border-r border-slate-150 rounded-r-2xl space-y-3">
                          <div className="flex justify-between items-center bg-white border border-slate-150 px-4 py-2 rounded-xl">
                            <div>
                              <p className="text-xs font-black text-slate-900 leading-none">{entry.studentName}</p>
                              <p className="text-[8px] font-bold text-slate-450 uppercase tracking-wider mt-1">{entry.class}</p>
                            </div>
                            <span className="text-[8px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase">{entry.type}</span>
                          </div>
                          
                          <p className="text-xs font-semibold italic leading-relaxed text-slate-600 font-sans px-2">
                            "{entry.comment}"
                          </p>
                          
                          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-slate-450 px-2">
                            <span>Author: Instructor {entry.teacherName}</span>
                            <span className="font-mono">{entry.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
