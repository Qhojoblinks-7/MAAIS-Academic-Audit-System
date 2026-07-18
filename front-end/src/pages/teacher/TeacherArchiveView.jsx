import React, { useState, useEffect, useMemo } from 'react';
import { EmptyState } from '../../components/molecules';
import { 
  Database, 
  Search, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Award, 
  BookOpen, 
  Lock,
  RefreshCw,
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TeacherArchiveDetailView } from './TeacherArchiveDetailView';
import { Card } from '../../components/ui/card';
import { teacherService } from '../../services';
import { useRole } from '../../context/RoleContext';
import { useBreadcrumb } from '../../context/BreadcrumbContext';

// --- Utility Helpers ---
const gradeToScore = (grade) => {
  const grades = { A1: 90, B2: 75, B3: 65, C4: 60, C5: 55, C6: 50, D7: 45, E8: 40 };
  return grades[grade] || 35;
};

const buildHistoryFromGrades = (grades) => {
  if (!Array.isArray(grades) || !grades.length) return [];
  const termMap = {};
  
  for (const g of grades) {
    const termLabel = g.term?.academicYear?.label
      ? `${g.term.academicYear.label} ${g.term.termNumber?.replace('TERM_', 'Term ') || ''}`
      : (g.term?.id || 'Recorded Term');
      
    if (!termMap[termLabel]) {
      termMap[termLabel] = { term: termLabel, grades: [] };
    }
    termMap[termLabel].grades.push(g.totalScore || 0);
  }
  
  return Object.values(termMap).map(t => ({
    term: t.term,
    finalGrade: Math.round(t.grades.reduce((a, b) => a + b, 0) / t.grades.length),
    behaviorRating: 4
  }));
};

const getStudentObservations = (studentName, observations) => {
  return (observations || [])
    .filter(o => o.student?.toLowerCase() === studentName?.toLowerCase())
    .map((o, idx) => ({
      id: o.id || idx,
      type: o.type,
      date: o.date,
      comment: o.comment,
      teacherName: o.teacher || 'Unknown'
    }));
};

const getStudentConsistencyScore = (history) => {
  if (!history || !history.length) return 95;
  const scores = history.map(h => h.finalGrade);
  return Math.round((Math.max(...scores) - Math.min(...scores)) / Math.max(...scores) * 100) || 100;
};

const getStudentWASSCE = (grades) => {
  if (!Array.isArray(grades) || !grades.length) return 'Pending';
  const latest = grades[grades.length - 1];
  return latest.grade ? `${latest.grade} - Verified` : 'Pending';
};

const getGraduationYear = (promotions, archivedAt) => {
  if (Array.isArray(promotions) && promotions.length > 0) {
    const last = promotions[promotions.length - 1];
    const label = last.academicYear?.label || '';
    const parts = label.split('/');
    if (parts.length === 2 && parts[1]) return parts[1].trim();
  }
  if (archivedAt) return new Date(archivedAt).getFullYear().toString();
  return new Date().getFullYear().toString();
};

export function TeacherArchiveView() {
  const { user } = useRole();
  const { setBreadcrumb } = useBreadcrumb();
  const [activeSubTab, setActiveSubTab] = useState('REGISTRY');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedCohortYear, setSelectedCohortYear] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const teacherId = user?.profileId || user?.id;

  useEffect(() => {
    async function loadArchive() {
      if (!teacherId) return;
      try {
        setLoading(true);
        setError(null);

        const [vaultResults, observations] = await Promise.all([
          teacherService.getTeacherArchive(),
          teacherService.getObservationLogs(),
        ]);

        const studentData = Array.isArray(vaultResults) ? vaultResults : [];
        const obsArray = Array.isArray(observations?.data) ? observations.data : Array.isArray(observations) ? observations : [];

        const classMap = {};
        for (const student of studentData) {
          const className = student.currentClass?.name || 'Unknown Class';
          if (!classMap[className]) {
            classMap[className] = {
              className,
              id: `arch-${className}`,
              status: 'Archive Sealed',
              year: getGraduationYear(student.promotions, student.archivedAt),
              students: []
            };
          }
          const history = buildHistoryFromGrades(student.grades);
          const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ');

          classMap[className].students.push({
            id: student.id,
            name: fullName,
            index: student.indexNumber,
            currentClass: className,
            status: 'Archive Sealed',
            finalWassce: getStudentWASSCE(student.grades),
            graduationYear: getGraduationYear(student.promotions, student.archivedAt),
            history,
            interventions: [],
            observations: getStudentObservations(fullName, obsArray),
            hodComment: null,
            consistencyScore: getStudentConsistencyScore(history)
          });
        }

        setStudents(Object.values(classMap).flatMap(c => c.students));
      } catch (err) {
        console.error('[TeacherArchiveView] Failed to load archive:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadArchive();
  }, [teacherId]);

  useEffect(() => {
    const tabLabel = activeSubTab === 'REGISTRY' ? 'Records' : activeSubTab === 'INTERVENTIONS' ? 'Interventions' : 'Observation Summary';
    const crumbs = [{ label: 'My Teaching Archive', path: '/teacher/archive' }, { label: tabLabel, path: null }];
    if (selectedStudent) {
      crumbs.push({ label: selectedStudent.name, path: null });
    }
    setBreadcrumb(crumbs);
  }, [activeSubTab, selectedStudent, setBreadcrumb]);

  // Derived Values
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.index.includes(searchTerm);
      const matchesClass = selectedClass === 'ALL' || s.currentClass === selectedClass;
      const matchesYear = selectedCohortYear === 'ALL' || s.graduationYear === selectedCohortYear;
      return matchesSearch && matchesClass && matchesYear;
    });
  }, [students, searchTerm, selectedClass, selectedCohortYear]);

  const uniqueClasses = useMemo(() => [...new Set(students.map(s => s.currentClass))].sort(), [students]);
  const uniqueYears = useMemo(() => [...new Set(students.map(s => s.graduationYear))].sort(), [students]);

  const totalAlumni = students.length;
  const sealedCount = students.filter(s => s.status === 'Archive Sealed').length;
  
  const totalGrades = students.flatMap(s => (s.history || []).map(h => h.finalGrade));
  const cumulativeAverage = totalGrades.length > 0 ? (totalGrades.reduce((a, b) => a + b, 0) / totalGrades.length).toFixed(1) : 'N/A';

  // Fixed Structural Weights for Uniform Row Alignments
  const rowGridStructure = "grid grid-cols-[1.5fr_1fr_0.8fr] md:grid-cols-[2fr_1.2fr_1fr_1fr_1.2fr_0.4fr] gap-4 items-center";

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-sm bg-white border p-6 rounded-2xl shadow-sm space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <RefreshCw size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Archive Unreachable</h3>
            <p className="text-xs text-muted-foreground mt-1">Failed to securely download decrypted historical ledgers.</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Retry Validation Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 relative text-slate-900 font-sans">
      
      {/* Absolute Overlay Spinner */}
      {loading && (
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="text-center space-y-3 bg-white p-6 rounded-2xl border shadow-sm">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold tracking-widest text-slate-800 uppercase">Syncing Academic Archive...</p>
          </div>
        </div>
      )}
      
      {/* Navbar Container */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-xs shrink-0">
            <Database size={18} />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-slate-900">Instructor Archives</h1>
            <p className="text-xs font-semibold text-slate-400 uppercase mt-0.5">Applied Sciences / Alumni Ledger Matrix</p>
          </div>
        </div>

        {/* Global Functional View Segment Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 overflow-x-auto scrollbar-none">
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
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap",
                activeSubTab === tab.id 
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/40" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Dynamic Workspace Frame */}
      <div className="flex-1 overflow-hidden flex flex-col relative z-10 w-full">
          {selectedStudent ? (
             <div
               className="flex-1 h-full w-full overflow-hidden animate-in fade-in"
             >
              <TeacherArchiveDetailView 
                student={selectedStudent}
                onBack={() => setSelectedStudent(null)}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
              
              {activeSubTab === 'REGISTRY' && (
                 <div
                   className="space-y-6 animate-in fade-in"
                 >
                  {/* Analytic Display Segment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { title: 'Total Rostered Students', val: totalAlumni, note: 'Active & Graduated', icon: Users, color: "text-blue-600" },
                      { title: 'Cumulative Avg Score', val: `${cumulativeAverage}%`, note: 'Historical aggregate', icon: TrendingUp, color: "text-indigo-600" },
                      { title: 'Cryptographic Seals', val: sealedCount, note: 'Tamper-proof storage', icon: ShieldCheck, color: "text-emerald-600" },
                      { title: 'Database Security', val: 'Active', note: 'Secure Level 4 Crypt', icon: Lock, color: "text-slate-600" }
                    ].map((card, idx) => (
                      <Card key={idx} className="p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4 bg-white">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 shrink-0">
                          <card.icon size={18} className={card.color} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">{card.title}</p>
                          <div className="flex items-baseline gap-1.5 mt-1.5">
                            <span className="text-xl font-black text-slate-900 tracking-tight">{card.val}</span>
                            <span className="text-xs font-medium text-slate-400 truncate">{card.note}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Operational Filtering Matrix Panel */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Filter size={14} className="text-slate-400" />
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Filter Matrix Engine</h3>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 uppercase">Frozen Records Directory</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Search Index Input */}
                      <div className="relative flex items-center h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-slate-900/10 transition-all">
                        <Search className="text-slate-400 mr-2 shrink-0" size={14} />
                        <input 
                          type="text" 
                          placeholder="Search identifier, moniker or index..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-transparent border-none text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-full font-medium"
                        />
                      </div>

                      {/* Filter Class Option Map */}
                      <div className="flex items-center h-10 bg-slate-50 border border-slate-200 rounded-xl px-3">
                        <span className="text-xs font-bold text-slate-400 uppercase mr-2 shrink-0">Stream:</span>
                        <select 
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="bg-transparent border-none text-xs text-slate-900 font-bold focus:outline-none cursor-pointer w-full"
                        >
                          <option value="ALL">All Cohort Divisions</option>
                          {uniqueClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>

                      {/* Filter Grad Term Year Select */}
                      <div className="flex items-center h-10 bg-slate-50 border border-slate-200 rounded-xl px-3">
                        <span className="text-xs font-bold text-slate-400 uppercase mr-2 shrink-0">Cohort:</span>
                        <select 
                          value={selectedCohortYear}
                          onChange={(e) => setSelectedCohortYear(e.target.value)}
                          className="bg-transparent border-none text-xs text-slate-900 font-bold focus:outline-none cursor-pointer w-full"
                        >
                          <option value="ALL">All Graduation Years</option>
                          {uniqueYears.map(year => (
                            <option key={year} value={year}>Class of {year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Core Table Spreadsheet Layout Container */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <header className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Cohort Records Archive</h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Read-Only qualitative diaries and finalized transcripts.</p>
                      </div>
                      <div className="text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs">
                        Records matching: <span className="text-slate-900 font-black">{filteredStudents.length}</span>
                      </div>
                    </header>

                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[750px] divide-y divide-slate-100">
                        
                        {/* Table Structured Grid Column Headers */}
                        <div className={cn("px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70 border-b border-slate-100", rowGridStructure)}>
                          <div>Student Profile</div>
                          <div>Stream Group</div>
                          <div>Cumulative Avg</div>
                          <div className="text-center">WASSCE Status</div>
                          <div>Security Seal</div>
                          <div className="text-right">Action</div>
                        </div>

                        {/* Interactive Data Row Grid Loop */}
                        <div className="divide-y divide-slate-100 bg-white">
                          {filteredStudents.length === 0 ? (
                            <div className="px-6 py-12 text-center text-slate-400 text-xs font-medium">
                              No records correspond to the input filter query metrics.
                            </div>
                          ) : (
                            filteredStudents.map(student => {
                              const scores = student.history.map(h => h.finalGrade);
                              const avgGrade = scores.length > 0 
                                ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) + '%' 
                                : 'N/A';

                              return (
                                <div 
                                  key={student.id}
                                  className={cn(
                                    "px-6 py-3.5 hover:bg-slate-50/80 group transition-colors duration-150 items-center",
                                    rowGridStructure
                                  )}
                                >
                                  {/* Identity Cell block */}
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img 
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name)}`} 
                                      alt="Student Avatar" 
                                      className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 p-0.5 shrink-0"
                                    />
                                    <div className="min-w-0 truncate">
                                      <p className="text-xs font-bold text-slate-900 truncate leading-tight">{student.name}</p>
                                      <p className="text-xs font-mono font-medium text-slate-400 uppercase mt-0.5 tracking-tight">{student.index}</p>
                                    </div>
                                  </div>

                                  {/* Class Vector Stream Tag Box */}
                                  <div className="text-xs text-slate-600 font-semibold truncate">
                                    {student.currentClass}
                                  </div>

                                  {/* Metric Badge */}
                                  <div>
                                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 border border-slate-200 text-slate-700">
                                      {avgGrade}
                                    </span>
                                  </div>

                                  {/* External Exam Tracking Component */}
                                  <div className="text-center">
                                    <span className={cn(
                                      "px-2 py-0.5 font-mono text-xs font-bold rounded-md text-white whitespace-nowrap",
                                      student.finalWassce === 'Pending' ? "bg-slate-400" : "bg-slate-900"
                                    )}>
                                      WAEC: {student.finalWassce.split(' ')[0]}
                                    </span>
                                  </div>

                                  {/* Status Validation Sealed Verification Element */}
                                  <div>
                                    <span className={cn(
                                      "px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full border inline-flex items-center gap-1.5 whitespace-nowrap",
                                      student.status === 'Archive Sealed' && "bg-emerald-50 text-emerald-700 border-emerald-200/50",
                                      student.status === 'Archive Inbound' && "bg-blue-50 text-blue-700 border-blue-200/50",
                                      student.status === 'Empty Archive' && "bg-amber-50 text-amber-700 border-amber-200/50"
                                    )}>
                                      <ShieldCheck size={11} className="shrink-0" />
                                      {student.status}
                                    </span>
                                  </div>

                                  {/* Action Control Drawer Hook Trigger */}
                                  <div className="text-right">
                                    <button 
                                      onClick={() => setSelectedStudent(student)}
                                      className="p-1.5 bg-slate-50 group-hover:bg-slate-900 border border-slate-200 group-hover:border-slate-900 rounded-lg text-slate-400 group-hover:text-white transition-all inline-flex items-center justify-center cursor-pointer"
                                      aria-label={`Open dossier for ${student.name}`}
                                    >
                                      <ChevronRight size={14} />
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
                </div>
              )}

              {/* Interventions Segment Log Section */}
              {activeSubTab === 'INTERVENTIONS' && (
                 <div
                   className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in"
                 >
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Historical Remedial Actions</h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Audit trail of supportive localized tutoring interventions finalized in past terms.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {students.flatMap(s => (s.interventions || []).map(int => ({ ...int, studentName: s.name, class: s.currentClass, studentId: s.id }))).length === 0 ? (
                      <EmptyState context="results" variant="compact" />
                    ) : (
                      students.flatMap(s => (s.interventions || []).map(int => ({ ...int, studentName: s.name, class: s.currentClass, studentId: s.id }))).map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50/60 border border-slate-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded tracking-wide uppercase">COACHING FILE</span>
                              <p className="text-xs font-bold text-slate-900 truncate">{item.studentName} <span className="text-slate-400 font-normal">({item.class})</span></p>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">
                              Trigger Cause: <span className="text-slate-500 font-normal">{item.reason}</span>
                            </p>
                            <p className="text-xs text-slate-600 font-medium">
                              Coaching Strategy: <span className="text-slate-500 font-normal italic">"{item.action}"</span>
                            </p>
                          </div>

                          <div className="text-left md:text-right shrink-0 border-l-2 md:border-l-0 md:border-r-2 border-slate-900 pl-3 md:pl-0 pr-0 md:pr-3">
                            <p className="text-xs font-bold text-slate-800 italic">{item.outcome}</p>
                            <span className="text-xs font-mono text-slate-400 block mt-0.5">Term: {item.term}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Past Qualitative Observations Summary Frame Section */}
              {activeSubTab === 'OBS_SUMMARY' && (
                 <div
                   className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in"
                 >
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">Historical Qualitative Observations</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Archive of developmental progress reports and performance logs from previous years.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {students.flatMap(s => (s.observations || []).map(obs => ({ ...obs, studentName: s.name, class: s.currentClass }))).length === 0 ? (
                      <p className="text-xs font-medium text-slate-400 text-center col-span-2 py-6">No locked structural observations archived inside this current vault scope.</p>
                    ) : (
                      students.flatMap(s => (s.observations || []).map(obs => ({ ...obs, studentName: s.name, class: s.currentClass }))).map((entry, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center bg-white border border-slate-200/60 px-3 py-1.5 rounded-lg gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate leading-tight">{entry.studentName}</p>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{entry.class}</p>
                              </div>
                              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase shrink-0">{entry.type}</span>
                            </div>
                            
                            <p className="text-xs font-medium italic text-slate-600 leading-relaxed px-1">
                              "{entry.comment}"
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-400 pt-2 border-t border-slate-200/60 px-1 gap-2">
                            <span className="truncate">By: {entry.teacherName}</span>
                            <span className="font-mono text-xs tracking-tight shrink-0">{entry.date}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
      </div>

    </div>
  );
}