import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../../components/ui/table';
import { toast, Toaster } from '../../../components/ui/toast.tsx';
import { Search, Map, ShieldCheck, BookMarked, Clock } from 'lucide-react';
import {
  useCurriculumMatrix,
  useUpsertCurriculumMapping,
  useRemoveCurriculumMapping,
  useBulkUpsertCurriculum,
  useDeployCurriculum,
} from '../../../lib/hooks';

export function CurriculumMatrixView({ displaySubjects: initialSubjects, displayClasses: initialClasses, academicYearId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({ yearGroup: 'ALL' });
  const [deploying, setDeploying] = useState(false);

  const subjects = useMemo(() => (initialSubjects || []).map(s => ({
    ...s,
    programs: s.applicablePrograms || [],
  })), [initialSubjects]);

  const classes = useMemo(() => initialClasses || [], [initialClasses]);

  const matrixQuery = useCurriculumMatrix(academicYearId);
  const upsertMutation = useUpsertCurriculumMapping();
  const removeMutation = useRemoveCurriculumMapping();
  const bulkUpsertMutation = useBulkUpsertCurriculum();
  const deployMutation = useDeployCurriculum();

  const backendAssignments = useMemo(() => {
    const map = {};
    if (matrixQuery.data) {
      matrixQuery.data.forEach(m => {
        if (!map[m.subjectId]) map[m.subjectId] = {};
        map[m.subjectId][m.classSectionId] = true;
      });
    }
    return map;
  }, [matrixQuery.data]);

  const [subjectStates, setSubjectStates] = useState(() => {
    const states = {};
    subjects.forEach(subject => {
      states[subject.id] = {
        ...subject,
        assignments: {},
      };
    });
    return states;
  });

  const isCore = (sub) => sub.type === 'Core';
  const programForClass = (cls) => {
    const name = (cls.name || '').toLowerCase();
    if (name.includes('science')) return 'Science';
    if (name.includes('arts') && !name.includes('visual')) return 'General Arts';
    if (name.includes('bus')) return 'Business';
    if (name.includes('home')) return 'Home Economics';
    if (name.includes('visual')) return 'Visual Arts';
    return '';
  };

  const isProgramMatch = (subject, cls) => {
    if (isCore(subject)) return true;
    const prog = programForClass(cls);
    return (subject.programs || []).length === 0 || (subject.programs || []).includes(prog);
  };

  const computeDefaultAssignment = useCallback((subject, cls) => {
    return isCore(subject) || isProgramMatch(subject, cls);
  }, []);

  useEffect(() => {
    if (subjects.length === 0) return;
    setSubjectStates(prev => {
      const next = {};
      subjects.forEach(subject => {
        const existing = prev[subject.id] || { ...subject, assignments: {} };
        next[subject.id] = {
          ...subject,
          assignments: { ...existing.assignments },
        };
        classes.forEach(cls => {
          if (!(cls.id in next[subject.id].assignments)) {
            next[subject.id].assignments[cls.id] = computeDefaultAssignment(subject, cls);
          }
        });
      });
      return next;
    });
  }, [subjects, classes, computeDefaultAssignment]);

  useEffect(() => {
    if (!matrixQuery.data || matrixQuery.isLoading) return;
    setSubjectStates(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(subjectId => {
        if (!next[subjectId].assignments) next[subjectId].assignments = {};
      });
      matrixQuery.data.forEach(m => {
        if (!next[m.subjectId]) {
          next[m.subjectId] = {
            id: m.subjectId,
            name: m.subjectName,
            code: m.subjectCode,
            type: m.subjectType,
            creditHours: m.creditHours || 3,
            programs: m.applicablePrograms || [],
            assignments: {},
          };
        }
        next[m.subjectId].assignments[m.classSectionId] = true;
      });
      return next;
    });
  }, [matrixQuery.data, matrixQuery.isLoading]);

  const toggleSubjectAssignment = useCallback((subjectId, classId) => {
    setSubjectStates(prev => {
      const subject = prev[subjectId];
      if (!subject || isCore(subject)) return prev;
      const current = subject.assignments?.[classId] ?? false;
      const next = !current;
      return {
        ...prev,
        [subjectId]: {
          ...subject,
          assignments: { ...subject.assignments, [classId]: next },
        },
      };
    });
  }, []);

  const persistAssignment = useCallback(async (subjectId, classId, assigned) => {
    if (!academicYearId) return;
    if (assigned) {
      await upsertMutation.mutateAsync({
        academicYearId,
        subjectId,
        classSectionId: classId,
      });
    } else {
      await removeMutation.mutateAsync({
        academicYearId,
        subjectId,
        classSectionId: classId,
      });
    }
  }, [academicYearId, upsertMutation, removeMutation]);

  const handleToggle = useCallback(async (subjectId, classId) => {
    const subject = subjectStates[subjectId];
    if (!subject || isCore(subject)) return;
    const next = !(subject.assignments?.[classId] ?? false);
    toggleSubjectAssignment(subjectId, classId);
    try {
      await persistAssignment(subjectId, classId, next);
      matrixQuery.refetch?.();
    } catch (err) {
      toggleSubjectAssignment(subjectId, classId);
      toast.error('Failed to update mapping');
    }
  }, [subjectStates, toggleSubjectAssignment, persistAssignment, matrixQuery]);

  const autoSyncCore = useCallback(() => {
    setSubjectStates(prev => {
      const updated = { ...prev };
      Object.entries(updated).forEach(([subId, sub]) => {
        if (isCore(sub)) {
          updated[subId] = {
            ...updated[subId],
            assignments: {
              ...updated[subId].assignments,
              ...classes.reduce((acc, cls) => ({ ...acc, [cls.id]: true }), {}),
            },
          };
        }
      });
      return updated;
    });
    toast.success('Core subjects synchronized across all classrooms');
  }, [classes]);

  const discardDraft = useCallback(async () => {
    setSubjectStates(prev => {
      const next = {};
      subjects.forEach(subject => {
        next[subject.id] = {
          ...subject,
          assignments: {},
        };
        classes.forEach(cls => {
          next[subject.id].assignments[cls.id] = computeDefaultAssignment(subject, cls);
        });
      });
      return next;
    });
    await matrixQuery.refetch?.();
    toast.info('Draft discarded - reverted to backend defaults');
  }, [subjects, classes, computeDefaultAssignment, matrixQuery]);

  const deployArchitecture = useCallback(async () => {
    if (!academicYearId) {
      toast.error('No academic year selected');
      return;
    }
    setDeploying(true);
    try {
      const assignments = [];
      Object.entries(subjectStates).forEach(([subjectId, subject]) => {
        Object.entries(subject.assignments || {}).forEach(([classId, assigned]) => {
          if (assigned) {
            assignments.push({ subjectId, classSectionId: classId });
          }
        });
      });

      await bulkUpsertMutation.mutateAsync({
        academicYearId,
        mappings: assignments,
      });

      await deployMutation.mutateAsync(academicYearId);

      await matrixQuery.refetch?.();
      toast.success(`Curriculum deployed - ${assignments.length} subject mappings locked`);
    } catch (err) {
      toast.error('Deployment failed: ' + (err.message || 'Unknown error'));
    } finally {
      setDeploying(false);
    }
  }, [academicYearId, subjectStates, bulkUpsertMutation, deployMutation, matrixQuery]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (s.code || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (activeFilters.yearGroup === 'ALL') return matchesSearch;
      const yearFromClass = activeFilters.yearGroup.replace(' Cluster', '');
      return matchesSearch && classes.some(cls =>
        cls.name.toLowerCase().includes(yearFromClass.toLowerCase()) &&
        subjectStates[s.id]?.assignments?.[cls.id]
      );
    });
  }, [subjects, searchQuery, activeFilters.yearGroup, subjectStates, classes]);

  const activeYearGroups = useMemo(() => {
    const years = new Set();
    classes.forEach(cls => {
      const year = (cls.name || '').split(' ')[0];
      if (year) years.add(year);
    });
    return ['ALL', ...Array.from(years).map(y => `${y} Cluster`).sort()];
  }, [classes]);

  const liveStats = useMemo(() => {
    const totalSubjects = filteredSubjects.length;
    let totalCredits = 0;
    let assignedCount = 0;
    filteredSubjects.forEach(sub => {
      totalCredits += sub.creditHours || 0;
      Object.values(subjectStates[sub.id]?.assignments || {}).forEach(assigned => {
        if (assigned) assignedCount += 1;
      });
    });
    const coreCount = filteredSubjects.filter(s => s.type === 'Core').length;
    const electiveCount = totalSubjects - coreCount;
    const expectedCoreAssignments = coreCount * classes.length;
    const coreCoverage = expectedCoreAssignments > 0
      ? Math.round((assignedCount - (assignedCount - expectedCoreAssignments)) / expectedCoreAssignments * 100)
      : 100;
    const conflicts = 0;
    const integrityRating = coreCoverage === 100 && conflicts === 0 ? 'High' : coreCoverage >= 80 ? 'Medium' : 'Low';

    return { totalSubjects, totalCredits, totalAssignments: assignedCount, integrityRating, conflicts, coreCount, electiveCount };
  }, [filteredSubjects, subjectStates, classes]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-8 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold outline-none w-64"
                />
              </div>
              <button
                onClick={autoSyncCore}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
              >
                <Map size={16} /> Auto-Sync Core
              </button>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide mt-6">
            {activeYearGroups.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveFilters(prev => ({ ...prev, yearGroup: f }))}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 whitespace-nowrap",
                  activeFilters.yearGroup === f ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Table className="min-w-[1200px]">
            <TableHeader className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
              <TableRow>
                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[250px] bg-slate-50 border-r border-slate-200 sticky left-0 z-30">Subject Logic Unit</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center w-[100px]">Credits</TableHead>
                {classes.map(cls => (
                  <TableHead key={cls.id} className="px-4 py-5 text-[10px] font-black text-slate-900 uppercase tracking-tighter text-center min-w-[100px] hover:bg-slate-100 transition-colors">
                    <span className="italic font-display">{cls.name.split(' ')[0]}</span>
                    <span className="block text-[8px] opacity-40 font-black mt-0.5">{cls.name.split(' ').slice(1).join(' ')}</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {filteredSubjects.map((sub) => {
                const state = subjectStates[sub.id];
                return (
                  <TableRow key={sub.id} className="group hover:bg-slate-50/50">
                    <TableCell className="px-8 py-5 border-r border-slate-100 bg-white sticky left-0 z-10 group-hover:bg-slate-50 shadow-[5px_0_15px_rgba(0,0,0,0.02)]">
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
                    </TableCell>
                    <TableCell className="px-6 py-5 text-center border-r border-slate-100">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-sm font-black italic font-display text-slate-900">{sub.creditHours}</span>
                        <Clock size={10} className="text-slate-300" />
                      </div>
                    </TableCell>
                    {classes.map(cls => {
                      const isAssigned = state?.assignments?.[cls.id] ?? false;
                      const core = sub.type === 'Core';

                      return (
                        <TableCell key={cls.id} className={cn(
                          "px-4 py-5 text-center border-r border-slate-50 transition-colors",
                          core ? "bg-emerald-50/20" : ""
                        )}>
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              aria-checked={isAssigned}
                              disabled={core}
                              onClick={() => handleToggle(sub.id, cls.id)}
                              className={cn(
                                "relative w-10 h-6 rounded-full transition-all shadow-inner border border-slate-200",
                                isAssigned ? "bg-slate-900" : "bg-slate-100",
                                core ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                              )}
                            >
                              <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                                isAssigned ? "left-5" : "left-1"
                              )} />
                            </button>
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <Toaster />
    </div>
  );
}