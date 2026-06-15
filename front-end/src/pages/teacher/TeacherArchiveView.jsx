import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Search, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Award, 
  BookOpen, 
  Lock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TeacherArchiveDetailView } from './TeacherArchiveDetailView';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

import mockApiData from '../../data/mockApiData.json';

const gradeToScore = (grade) => {
  if (grade === 'A1') return 90;
  if (grade === 'B2') return 75;
  if (grade === 'B3') return 65;
  if (grade === 'C4') return 60;
  if (grade === 'C5') return 55;
  if (grade === 'C6') return 50;
  if (grade === 'D7') return 45;
  if (grade === 'E8') return 40;
  return 35;
};

const getStudentAcademicHistory = (studentName, archiveItem) => {
  const hist = mockApiData.studentAcademicHistory?.items?.find(h => 
    h.studentId?.toLowerCase().includes(studentName.split(' ')[0].toLowerCase().slice(0,4)) ||
    mockApiData.studentAcademicHistory?.items?.find(h => h.studentId?.toLowerCase() === studentName.toLowerCase())
  );
  if (!hist) {
    return [{
      term: archiveItem?.term || 'Archived Term',
      finalGrade: archiveItem ? gradeToScore(archiveItem.students?.find(s => s.name === studentName)?.grade) : 78,
      behaviorRating: 4
    }];
  }
  return hist.termHistory.map(t => ({
    term: t.term,
    finalGrade: Math.round(t.gpa * 15),
    behaviorRating: Math.floor(t.gpa)
  }));
};

const getStudentObservations = (studentName) => {
  return (mockApiData.teacher.observations?.items || [])
    .filter(o => o.student?.toLowerCase() === studentName?.toLowerCase())
    .map((o, idx) => ({
      id: o.id || idx,
      type: o.type,
      date: o.date,
      comment: o.comment,
      teacherName: o.teacherName || 'Unknown'
    }));
};

const getStudentInterventions = (studentName) => {
  const alertItems = mockApiData.interventionAlerts?.items || [];
  
  return alertItems
    .filter(a => a.studentName?.toLowerCase() === studentName?.toLowerCase())
    .map((a, idx) => ({
      id: a.id || idx,
      term: a.term || 'Archived Term',
      reason: a.reason,
      action: 'Academic intervention program initiated',
      outcome: a.resolved ? 'Successfully resolved' : 'Under review'
    }));
};

const getStudentHODComment = (studentName) => {
  const log = mockApiData.auditLogs?.items?.find(l => l.target?.includes(studentName) && l.hodComment);
  return log?.hodComment || null;
};

const getStudentConsistencyScore = (studentName) => {
  const hist = mockApiData.studentAcademicHistory?.items?.find(h => 
    h.studentId?.toLowerCase().includes(studentName.split(' ')[0].toLowerCase().slice(0,4))
  );
  if (!hist || !hist.termHistory?.length) return 95;
  const scores = hist.termHistory.map(t => t.gpa);
  return Math.round((Math.max(...scores) - Math.min(...scores)) / Math.max(...scores) * 100) || 100;
};

const getStudentWASSCE = (studentName, archiveItem) => {
  const studentGrade = archiveItem?.students?.find(s => s.name === studentName)?.grade;
  
  if (studentGrade) {
    return `${studentGrade} - Verified`;
  }
  return 'Pending';
};

const initialTeacherStudents = (mockApiData.archive?.items || []).flatMap(archiveItem => 
  (archiveItem.students || []).map(s => ({
    id: s.id,
    name: s.name,
    index: s.indexNumber,
    currentClass: archiveItem.className,
    status: archiveItem.status === 'LOCKED' ? 'Arhive Sealed' : 'Archive Inbound',
    finalWassce: getStudentWASSCE(s.name, archiveItem),
    graduationYear: archiveItem.year?.split('/')[1] || archiveItem.year?.replace('2023/2024', '2024').replace('2024/2025', '2025').replace('2025/2026', '2026') || '2026',
    history: getStudentAcademicHistory(s.name, archiveItem),
    interventions: getStudentInterventions(s.name),
    observations: getStudentObservations(s.name),
    hodComment: getStudentHODComment(s.name),
    consistencyScore: getStudentConsistencyScore(s.name)
  }))
);

export function TeacherArchiveView() {
  const [activeSubTab, setActiveSubTab] = useState('REGISTRY');
  const [students] = useState(initialTeacherStudents);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedCohortYear, setSelectedCohortYear] = useState('ALL');

  // Filter computation
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.index.includes(searchTerm);
    const matchesClass = selectedClass === 'ALL' || s.currentClass === selectedClass;
    const matchesYear = selectedCohortYear === 'ALL' || s.graduationYear === selectedCohortYear;
    return matchesSearch && matchesClass && matchesYear;
  });

  // Global counts for analytics cards
  const totalAlumni = students.length;
  const sealedCount = students.filter(s => s.status === 'Arhive Sealed').length;
  
  const totalGrades = students.flatMap(s => (s.history || []).map(h => h.finalGrade));
  const cumulativeAverage = totalGrades.length > 0 ? (totalGrades.reduce((a, b) => a + b, 0) / totalGrades.length).toFixed(1) : 'N/A';

  /**
   * ROBUST RESPONSIVE GRID CONFIGURATION
   * Standardizes visual column weights across row-containers and headers.
   * Mobile viewports: 3 tracking segments (Identity, Grade/Status, Action Layout)
   * Desktop viewports: 6 clean data compartments
   */
  const rowGridStructure = "grid grid-cols-[1.5fr_1fr_0.5fr] md:grid-cols-[2fr_1.2fr_1fr_1.3fr_1.2fr_0.4fr] gap-4 items-center";

return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted relative">
      
      {/* Header & Sub-Tab Bar */}
      <div className="bg-card border-b border-border px-8 py-4 flex flex-col sm:flex-row justify-between items-center z-20 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-foreground text-background rounded-xl flex items-center justify-center shadow-md">
            <Database size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black text-foreground uppercase tracking-widest font-sans">Instructor Archives</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mt-0.5">Academic Cohorts & Alumni Ledger / Applied Sciences Division</p>
          </div>
        </div>

        <div className="flex bg-muted p-0.5 rounded-xl border border-border overflow-x-auto max-w-full">
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
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all outline-none whitespace-nowrap",
                activeSubTab === tab.id ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
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
        <h1 className="text-[14vw] font-black rotate-[-20deg] text-foreground uppercase">PAST ARCHIVE</h1>
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
                  className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto"
                >
                  
                   {/* Analytic Indicator Cards */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     {[
                       { title: 'Total Rostered Students', val: totalAlumni, note: 'Current & Graduated cohorts', icon: Users },
                       { title: 'Cumulative GPA Average', val: `${cumulativeAverage}%`, note: 'Overall average over past terms', icon: TrendingUp },
                       { title: 'Cryptographic Seals', val: sealedCount, note: 'Tamper-proof department seals', icon: ShieldCheck },
                       { title: 'Database Security', val: 'Active', note: 'Secure Level 4 Vault Integrity', icon: Lock }
                     ].map((card, idx) => (
                       <Card key={idx} className="p-6 rounded-2xl shadow-sm flex flex-col gap-3 ring-0">
                         <div className="flex items-center gap-3">
                           <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-foreground border border-border shrink-0">
                             <card.icon size={20} />
                           </div>
                           <div>
                             <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">{card.title}</p>
                             <div className="flex items-baseline gap-1">
                               <span className="text-2xl font-black text-foreground leading-none">{card.val}</span>
                               <span className="text-[11px] font-bold text-muted-foreground">{card.note}</span>
                             </div>
                           </div>
                         </div>
                       </Card>
                     ))}
                   </div>

{/* Filter Row */}
                   <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm space-y-4">
                     <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                       <div className="flex items-center gap-2 self-start md:self-auto">
                         <span className="w-2.5 h-2.5 bg-foreground rounded-full animate-pulse" />
                         <h3 className="text-xs font-black text-foreground uppercase tracking-widest">ARCHIVE STORAGE FILTER MATRIX</h3>
                       </div>
                       <span className="text-[10px] font-bold text-muted-foreground uppercase self-start md:self-auto">Frozen Record Search Directory</span>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {/* Search Index Input */}
                       <div className="relative flex items-center h-12 bg-muted border border-border rounded-xl px-4">
                         <Search className="text-muted-foreground mr-2 shrink-0" size={16} />
                         <input 
                           type="text" 
                           placeholder="Search index, name or matric..." 
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="bg-transparent border-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full"
                         />
                       </div>

                       {/* Filter Class */}
                       <div className="relative flex items-center h-12 bg-muted border border-border rounded-xl px-4">
                         <span className="text-[10px] font-bold text-muted-foreground mr-2 shrink-0">GROUP:</span>
                         <select 
                           value={selectedClass}
                           onChange={(e) => setSelectedClass(e.target.value)}
                           className="bg-transparent border-none text-xs text-foreground font-extrabold focus:outline-none cursor-pointer w-full"
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
                       <div className="relative flex items-center h-12 bg-muted border border-border rounded-xl px-4">
                         <span className="text-[10px] font-bold text-muted-foreground mr-2 shrink-0">YEAR:</span>
                         <select 
                           value={selectedCohortYear}
                           onChange={(e) => setSelectedCohortYear(e.target.value)}
                           className="bg-transparent border-none text-xs text-foreground font-extrabold focus:outline-none cursor-pointer w-full"
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

                  {/* Student Registry Frame */}
                  <div className="bg-white border border-slate-200/60 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <header className="px-6 sm:px-8 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Cohort Dossiers Vault</h4>
                        <p className="text-[10px] text-slate-450 font-bold uppercase mt-1">Official transcripts and qualitative diaries stored in historical vault (Read-Only)</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-100 rounded-lg px-2 py-1 text-center self-start sm:self-center whitespace-nowrap">
                        Viewing <span className="text-slate-900 font-black">{filteredStudents.length}</span> active and verified student profiles
                      </span>
                    </header>

                    {/* Scroll Containment Outer Viewport */}
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[650px] sm:min-w-full divide-y divide-slate-100">
                        
                        {/* Pure Grid Table Header */}
                        <div className={cn(
                          "px-6 sm:px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/20 border-b border-slate-100",
                          rowGridStructure
                        )}>
                          <div>Student Identity</div>
                          <div className="hidden md:block">Current Stream / Batch</div>
                          <div className="text-center md:text-left">Cumulative Grade</div>
                          <div className="text-center hidden md:block">WASSCE Code</div>
                          <div className="text-center md:text-left">Archive Integrity Seal</div>
                          <div className="text-right">Action</div>
                        </div>

                        {/* Pure Grid Rows Container */}
                        <div className="divide-y divide-slate-100">
                          {filteredStudents.length === 0 ? (
                            <div className="px-8 py-16 text-center">
                              <p className="text-sm font-medium text-slate-400">
                                No students match current filter parameters
                              </p>
                            </div>
                          ) : (
                            filteredStudents.map(student => {
                              const scores = student.history.map(h => h.finalGrade);
                              const avgGrade = scores.length > 0 ? (scores.reduce((a,b)=>a+b, 0) / scores.length).toFixed(1) + '%' : 'No Past Terms';

                              return (
                                <div 
                                  key={student.id}
                                  onClick={() => setSelectedStudent(student)}
                                  className={cn(
                                    "px-6 sm:px-8 py-4 hover:bg-slate-50 group transition-all duration-150 cursor-pointer",
                                    rowGridStructure
                                  )}
                                >
                                  {/* 1. Identity Component block */}
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img 
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
                                      alt="avatar" 
                                      className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-0.5 shrink-0 hidden sm:block"
                                    />
                                    <div className="truncate">
                                      <p className="text-xs font-black text-slate-900 tracking-tight truncate">{student.name}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase font-mono mt-0.5">{student.index}</p>
                                    </div>
                                  </div>

                                  {/* 2. Stream Element Box (Hidden on Mobile viewports) */}
                                  <div className="hidden md:block text-xs text-slate-600 font-extrabold truncate">
                                    {student.currentClass}
                                  </div>

                                  {/* 3. Grade Metric Tag */}
                                  <div className="text-center md:text-left">
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold italic font-mono bg-slate-100 text-slate-800 border border-slate-200/60">
                                      {avgGrade}
                                    </span>
                                  </div>

                                  {/* 4. WASSCE Code Column (Hidden on Mobile viewports) */}
                                  <div className="hidden md:block text-center">
                                    <span className={cn(
                                      "px-3 py-1 font-mono text-xs font-black rounded-lg text-white whitespace-nowrap",
                                      student.finalWassce === 'Pending' && "bg-slate-400",
                                      student.finalWassce === 'Building' && "bg-slate-300",
                                      student.finalWassce !== 'Pending' && student.finalWassce !== 'Building' && "bg-slate-900"
                                    )}>
                                      WAEC: {student.finalWassce.split(' ')[0]}
                                    </span>
                                  </div>

                                  {/* 5. Authorization Status Tag element */}
                                  <div className="text-center md:text-left">
                                    <span className={cn(
                                      "px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border inline-flex items-center gap-1 whitespace-nowrap",
                                      student.status === 'Arhive Sealed' && "bg-emerald-50 text-emerald-800 border-emerald-100",
                                      student.status === 'Archive Inbound' && "bg-blue-50 text-blue-800 border-blue-100",
                                      student.status === 'Empty Archive' && "bg-amber-50 text-amber-800 border-amber-100"
                                    )}>
                                      <ShieldCheck size={11} className="shrink-0" />
                                      <span className="hidden sm:inline">{student.status}</span>
                                      <span className="sm:hidden">{student.status === 'Arhive Sealed' ? 'Sealed' : 'Inbound'}</span>
                                    </span>
                                  </div>

                                  {/* 6. Navigation Control Arrow Button */}
                                  <div className="text-right">
                                    <button className="p-2 hover:bg-slate-200 group-hover:bg-slate-900 rounded-xl text-slate-400 group-hover:text-white transition-all flex items-center justify-center ml-auto">
                                      <ChevronRight size={16} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                      </div>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* Interventions Section Frame View */}
              {activeSubTab === 'INTERVENTIONS' && (
                <motion.div 
                  key="interventions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8"
                >
                  <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-6">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Historical Remedial Actions Catalog</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Audit trail of supportive academic tutorial actions performed and finalized in previous terms</p>
                    </div>

                    <div className="space-y-4">
                      {students.flatMap(s => (s.interventions || []).map(int => ({ ...int, studentName: s.name, class: s.currentClass, studentId: s.id }))).map((item, idx) => (
                        <div key={idx} className="p-4 sm:p-6 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-200 transition-all">
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[8px] font-black text-slate-800 bg-slate-200 px-2 py-0.5 rounded uppercase">COACHING FILE</span>
                              <p className="text-xs font-black text-slate-900 truncate">{item.studentName} — <span className="text-slate-400">{item.class}</span></p>
                            </div>
                            <p className="text-[11px] font-bold text-slate-650 leading-normal">
                              Trigger Cause: <span className="font-medium text-slate-500">{item.reason}</span>
                            </p>
                            <p className="text-[11px] font-bold text-slate-650 leading-normal">
                              Coaching Strategy: <span className="font-medium text-slate-550 italic">"{item.action}"</span>
                            </p>
                          </div>

                          <div className="text-left md:text-right shrink-0 border-l-2 md:border-l-0 md:border-r-2 border-slate-900 pl-3 md:pl-0 pr-0 md:pr-3">
                            <p className="text-xs font-black text-slate-800 italic mb-1">
                              {item.outcome}
                            </p>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block">Term: {item.term}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Past Observations Section Frame View */}
              {activeSubTab === 'OBS_SUMMARY' && (
                <motion.div 
                  key="observations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8"
                >
                  <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-6 sm:p-8 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none font-sans">Historical Qualitative Notes</h3>
                      <p className="text-[10px] text-slate-450 font-bold uppercase mt-1">Registry of behavioral progress and student performance journals finalized in past years (Locked)</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {students.flatMap(s => (s.observations || []).map(obs => ({ ...obs, studentName: s.name, class: s.currentClass }))).map((entry, idx) => (
                        <div key={idx} className="p-4 sm:p-6 bg-slate-50 border-l-4 border-slate-900 border-y border-r border-slate-150 rounded-r-2xl space-y-3">
                          <div className="flex justify-between items-center bg-white border border-slate-150 px-4 py-2 rounded-xl gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 leading-none truncate">{entry.studentName}</p>
                              <p className="text-[8px] font-bold text-slate-450 uppercase tracking-wider mt-1 truncate">{entry.class}</p>
                            </div>
                            <span className="text-[8px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase shrink-0">{entry.type}</span>
                          </div>
                          
                          <p className="text-xs font-semibold italic leading-relaxed text-slate-600 font-sans px-2">
                            "{entry.comment}"
                          </p>
                          
                          <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider text-slate-450 px-2 gap-2">
                            <span className="truncate">Author: Instructor {entry.teacherName}</span>
                            <span className="font-mono shrink-0">{entry.date}</span>
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