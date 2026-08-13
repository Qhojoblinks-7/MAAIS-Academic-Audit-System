import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Search, ChevronRight, TrendingUp, ShieldCheck, Users, Award, BookOpen,
  ChevronLeft, Filter, X, Lock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { teacherService } from '../../services';

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

const getStudentObservations = (studentId, observations) => {
  return (observations || [])
    .filter(o => o.studentId === studentId)
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

export function MobileArchiveView() {
  const { user } = useRole();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('REGISTRY');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
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
            grades: student.grades || [],
            interventions: [],
            observations: getStudentObservations(student.id, obsArray),
            hodComment: null,
            consistencyScore: getStudentConsistencyScore(history)
          });
        }

        setStudents(Object.values(classMap).flatMap(c => c.students));
      } catch (err) {
        console.error('[MobileArchiveView] Failed to load archive:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadArchive();
  }, [teacherId]);

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

  const tabs = [
    { id: 'REGISTRY', label: 'Registry', icon: Database },
    { id: 'INTERVENTIONS', label: 'Interventions', icon: Award },
    { id: 'OBS_SUMMARY', label: 'Observations', icon: BookOpen },
  ];

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-6 text-center">
        <div>
          <p className="text-sm font-bold text-primary">{error.message || 'Failed to load archive'}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-brand-primary text-surface rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-transform">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0 overflow-x-hidden no-scrollbar">
      {/* Header */}
      <header className="bg-surface border-b border-border px-3 py-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button onClick={() => navigate(-1)} className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0 active:scale-95 transition-transform">
              <ChevronLeft size={16} className="text-primary" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-primary truncate leading-tight">Archives</h1>
              <p className="text-[9px] font-bold text-secondary uppercase tracking-widest truncate">Instructor Archives</p>
            </div>
          </div>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="appearance-none bg-surface border border-border rounded-lg px-2 py-1.5 pr-6 text-[9px] font-black uppercase tracking-wider text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-sm"
          >
            {tabs.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide min-w-0 pb-24">
        {/* Registry Tab */}
        {activeTab === 'REGISTRY' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-3 space-y-3">
            {/* KPI Cards - Horizontal Scroll */}
            <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pt-3">
              <div className="snap-start shrink-0 w-48 bg-surface p-4 rounded-2xl border border-border/60 shadow-sm relative group">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-secondary uppercase tracking-wider mb-0.5 truncate">Total Alumni</p>
                    <p className="text-[10px] font-semibold text-secondary leading-tight truncate">Active & Graduated</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-black text-primary tracking-tight leading-none whitespace-nowrap">{totalAlumni}</p>
                  </div>
                </div>
              </div>
              <div className="snap-start shrink-0 w-48 bg-surface p-4 rounded-2xl border border-border/60 shadow-sm relative group">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-secondary uppercase tracking-wider mb-0.5 truncate">Avg Score</p>
                    <p className="text-[10px] font-semibold text-secondary leading-tight truncate">Historical aggregate</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-black text-primary tracking-tight leading-none whitespace-nowrap">{cumulativeAverage}%</p>
                  </div>
                </div>
              </div>
              <div className="snap-start shrink-0 w-48 bg-surface p-4 rounded-2xl border border-border/60 shadow-sm relative group">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-secondary uppercase tracking-wider mb-0.5 truncate">Sealed</p>
                    <p className="text-[10px] font-semibold text-secondary leading-tight truncate">Tamper-proof storage</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-black text-primary tracking-tight leading-none whitespace-nowrap">{sealedCount}</p>
                  </div>
                </div>
              </div>
              <div className="snap-start shrink-0 w-48 bg-surface p-4 rounded-2xl border border-border/60 shadow-sm relative group">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-secondary uppercase tracking-wider mb-0.5 truncate">Security</p>
                    <p className="text-[10px] font-semibold text-secondary leading-tight truncate">Secure Level 4 Crypt</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-2xl font-black text-primary tracking-tight leading-none whitespace-nowrap">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={14} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-surface border border-border rounded-xl text-xs font-medium text-primary placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="appearance-none bg-surface border border-border rounded-xl px-3 py-2 pr-8 text-[10px] font-bold text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-sm"
              >
                <option value="ALL">All Classes</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <select
                value={selectedCohortYear}
                onChange={(e) => setSelectedCohortYear(e.target.value)}
                className="appearance-none bg-surface border border-border rounded-xl px-3 py-2 pr-8 text-[10px] font-bold text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-sm"
              >
                <option value="ALL">All Years</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Student List */}
            <div className="space-y-2">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 bg-surface rounded-2xl border border-border border-dashed">
                  <p className="text-xs font-bold text-secondary">No archived students found.</p>
                </div>
              ) : (
                filteredStudents.map((student, i) => {
                  const scores = student.history.map(h => h.finalGrade);
                  const avgGrade = scores.length > 0
                    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) + '%'
                    : 'N/A';

                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => setSelectedStudent(student)}
                      className="bg-surface rounded-2xl border border-border shadow-sm p-3.5 flex items-center gap-3 cursor-pointer active:bg-muted/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-primary truncate">{student.name}</p>
                        <p className="text-[10px] font-bold text-secondary truncate">{student.currentClass}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-primary">{avgGrade}</p>
                        <p className="text-[9px] font-bold text-secondary">{student.graduationYear}</p>
                      </div>
                      <ChevronRight size={14} className="text-secondary shrink-0" />
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* Interventions Tab */}
        {activeTab === 'INTERVENTIONS' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-3 space-y-3">
            {students.flatMap(s => (s.interventions || []).map(int => ({ ...int, studentName: s.name, class: s.currentClass, studentId: s.id }))).length === 0 ? (
              <div className="text-center py-8 bg-surface rounded-2xl border border-border border-dashed">
                <p className="text-xs font-bold text-secondary">No interventions recorded.</p>
              </div>
            ) : (
              students.flatMap(s => (s.interventions || []).map(int => ({ ...int, studentName: s.name, class: s.currentClass, studentId: s.id }))).map((item, idx) => (
                <div key={idx} className="bg-surface rounded-2xl border border-border shadow-sm p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black text-primary truncate">{item.studentName}</p>
                    <span className="text-[9px] font-bold text-secondary uppercase shrink-0">{item.term}</span>
                  </div>
                  <p className="text-[10px] font-medium text-secondary">Reason: <span className="text-primary">{item.reason}</span></p>
                  <p className="text-[10px] font-medium text-secondary">Action: <span className="text-primary italic">"{item.action}"</span></p>
                  <p className="text-[10px] font-bold text-success">Outcome: {item.outcome}</p>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Observations Tab */}
        {activeTab === 'OBS_SUMMARY' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-3 space-y-3">
            {students.flatMap(s => (s.observations || []).map(obs => ({ ...obs, studentName: s.name, class: s.currentClass }))).length === 0 ? (
              <div className="text-center py-8 bg-surface rounded-2xl border border-border border-dashed">
                <p className="text-xs font-bold text-secondary">No observations archived.</p>
              </div>
            ) : (
              students.flatMap(s => (s.observations || []).map(obs => ({ ...obs, studentName: s.name, class: s.currentClass }))).map((entry, idx) => (
                <div key={idx} className="bg-surface rounded-2xl border border-border shadow-sm p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black text-primary truncate">{entry.studentName}</p>
                    <span className="text-[9px] font-bold text-secondary uppercase shrink-0">{entry.type}</span>
                  </div>
                  <p className="text-[10px] font-medium text-secondary italic leading-relaxed">"{entry.comment}"</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[9px] font-bold text-secondary">{entry.teacherName}</span>
                    <span className="text-[9px] font-mono text-secondary">{entry.date}</span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-surface w-full max-w-lg max-h-[80vh] rounded-t-3xl sm:rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-black text-primary">{selectedStudent.name}</h3>
                <button onClick={() => setSelectedStudent(null)} className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <X size={16} className="text-primary" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/40 rounded-xl p-3">
                    <p className="text-[9px] font-bold text-secondary uppercase tracking-wider">Class</p>
                    <p className="text-xs font-black text-primary mt-0.5">{selectedStudent.currentClass}</p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-3">
                    <p className="text-[9px] font-bold text-secondary uppercase tracking-wider">WASSCE</p>
                    <p className="text-xs font-black text-primary mt-0.5">{selectedStudent.finalWassce}</p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-3">
                    <p className="text-[9px] font-bold text-secondary uppercase tracking-wider">Year</p>
                    <p className="text-xs font-black text-primary mt-0.5">{selectedStudent.graduationYear}</p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-3">
                    <p className="text-[9px] font-bold text-secondary uppercase tracking-wider">Status</p>
                    <p className="text-xs font-black text-primary mt-0.5">{selectedStudent.status}</p>
                  </div>
                </div>

                {selectedStudent.history && selectedStudent.history.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Grade History</h4>
                    <div className="space-y-2">
                      {selectedStudent.history.map((h, i) => (
                        <div key={i} className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2">
                          <span className="text-[10px] font-bold text-secondary">{h.term}</span>
                          <span className="text-xs font-black text-primary">{h.finalGrade}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStudent.observations && selectedStudent.observations.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Observations</h4>
                    <div className="space-y-2">
                      {selectedStudent.observations.map((obs, i) => (
                        <div key={i} className="bg-muted/30 rounded-xl p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-brand-primary uppercase">{obs.type}</span>
                            <span className="text-[9px] font-bold text-secondary">{obs.date}</span>
                          </div>
                          <p className="text-[10px] font-medium text-secondary italic">"{obs.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
