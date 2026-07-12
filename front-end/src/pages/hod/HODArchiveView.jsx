import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HODArchiveHeader } from '../../components/atoms/HODArchiveHeader';
import { HODVaultView } from '../../components/organisms/HODVaultView';
import { HODPromotionTerminal } from '../../components/organisms/HODPromotionTerminal';
import { HODComplianceAudits } from '../../components/organisms/HODComplianceAudits';
import { HODArchiveDetailView } from './HODArchiveDetailView';
import { useArchivedDepartmentData } from '@/lib/hooks/api/hod';
import { useComplianceCohortPerformance, useComplianceTimeline, usePromotionMetrics, useTriggerPromotion, useLockedTerms } from '@/lib/hooks/api/hod';
import { useSearchVault } from '@/lib/hooks/api/archive';
import { useBreadcrumb } from '../../context/BreadcrumbContext';

function normalizeStudent(record, lockedTermIds = []) {
  if (!record) return null;
  const hasSealedGrades = (record.grades || []).some(g => lockedTermIds.includes(g.termId));
  const baseStatus = record.status || 'Archive Inbound';
  return {
    id: record.id,
    name: record.name || '',
    index: String(record.indexNumber || ''),
    graduationYear: String(record.year || ''),
    currentClass: record.className || '',
    department: '',
    consistencyScore: 0,
    status: hasSealedGrades ? 'SECURE' : baseStatus,
    hodComment: '',
    finalWassce: 'Pending',
    history: [],
    observations: [],
    interventions: [],
  };
}

export function HODArchiveView() {
  const { setBreadcrumb } = useBreadcrumb();
  const [activeSubTab, setActiveSubTab] = useState('VAULT');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');

  const {
    data: archivedData = [],
    isLoading: archiveLoading,
    isFetching: archiveFetching,
    refetch: refetchArchives,
  } = useArchivedDepartmentData();

  const {
    data: complianceCohorts = [],
    isLoading: cohortLoading,
  } = useComplianceCohortPerformance();

  const {
    data: timelineData = [],
    isLoading: timelineLoading,
  } = useComplianceTimeline();

  const complianceLoading = cohortLoading || timelineLoading;

  const {
    data: lockedTerms = [],
    isLoading: lockedTermsLoading,
  } = useLockedTerms();

  const transformedCohorts = useMemo(() => {
    return (complianceCohorts || []).map(item => ({
      ...item,
      year: String(item.year || '').replace('Cohort', '').trim(),
    }));
  }, [complianceCohorts]);

  const transformedTimeline = useMemo(() => {
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return (timelineData || []).map(item => {
      let formattedTime = item.time || '';
      if (formattedTime.length === 7 && formattedTime.includes('-')) {
        const [, m] = formattedTime.split('-');
        const month = MONTHS[parseInt(m, 10) - 1] || m;
        formattedTime = `${month} ${formattedTime.split('-')[0]}`;
      }
      return {
        ...item,
        time: formattedTime,
      };
    });
  }, [timelineData]);

  const {
    data: promotionMetrics = { seniorSize: 0, clearedCount: 0, clearanceRate: 0 },
    isLoading: metricsLoading,
  } = usePromotionMetrics();

  const promotionMutation = useTriggerPromotion();
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionProgress, setPromotionProgress] = useState(0);
  const [promotionLogged, setPromotionLogged] = useState(false);

  const {
    data: vaultSearchResult,
    isLoading: vaultDetailLoading,
  } = useSearchVault(selectedStudentId ? { indexNumber: selectedStudentId } : {});

  useEffect(() => {
    if (selectedStudentId && vaultSearchResult) {
      const raw = vaultSearchResult?.[0];
      if (raw) {
        const reportCards = raw.reportCards || [];
        const history = reportCards.map(rc => ({
          term: rc.term?.academicYear?.label || '—',
          finalGrade: rc.averageScore || 0,
        }));
        setSelectedStudent({
          id: raw.id,
          name: raw.name || `${raw.firstName || ''} ${raw.lastName || ''}`,
          index: raw.indexNumber || '',
          graduationYear: raw.graduationYear || '',
          currentClass: raw.currentClass?.name || '',
          department: raw.department?.name || '',
          consistencyScore: 0,
          status: raw.archivedAt ? 'Archived & Verified' : 'Archive Inbound',
          hodComment: '',
          finalWassce: 'Pending',
          history,
          observations: [],
          interventions: [],
        });
      }
    }
  }, [selectedStudentId, vaultSearchResult]);

  useEffect(() => {
    const tabLabel = activeSubTab === 'VAULT' ? 'Vault' : activeSubTab === 'PROMOTION' ? 'Promotion' : 'Compliance';
    const crumbs = [{ label: 'Department Vault', path: '/hod/archive' }, { label: tabLabel, path: null }];
    if (selectedStudent) {
      crumbs.push({ label: selectedStudent.name, path: null });
    }
    setBreadcrumb(crumbs);
  }, [activeSubTab, selectedStudent, setBreadcrumb]);

  const students = useMemo(() => {
    const lockedIds = (lockedTerms || []).map(t => t.id);
    return (archivedData || []).map(record => normalizeStudent(record, lockedIds));
  }, [archivedData, lockedTerms]);

  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return students.filter(s => {
      const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.index.toLowerCase().includes(q);
      const matchesClass = selectedClass === 'ALL' || s.currentClass === selectedClass;
      const matchesYear = selectedYear === 'ALL' || s.graduationYear === selectedYear;
      return matchesSearch && matchesClass && matchesYear;
    });
  }, [students, searchTerm, selectedClass, selectedYear]);

  const uniqueClasses = useMemo(() => {
    const classes = [...new Set(students.map(s => s.currentClass))].filter(Boolean);
    return ['ALL', ...classes.sort()];
  }, [students]);

  const uniqueYears = useMemo(() => {
    const years = [...new Set(students.map(s => s.graduationYear))].filter(Boolean);
    return ['ALL', ...years.sort()];
  }, [students]);

  const handleBack = () => {
    setSelectedStudent(null);
    setSelectedStudentId(null);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSelectedStudentId(student.id);
  };

  const handleGlobalPromotion = async () => {
    setIsPromoting(true);
    setPromotionProgress(0);

    const interval = setInterval(() => {
      setPromotionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const activeYearRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/academic/years/active`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!activeYearRes.ok) throw new Error('Failed to fetch active academic year');
      const activeYear = await activeYearRes.json();

      await promotionMutation.mutateAsync(activeYear.id || activeYear.data?.id);

      setTimeout(() => {
        setIsPromoting(false);
        setPromotionLogged(true);
        refetchArchives();
      }, 400);
    } catch (err) {
      console.error('Promotion failed:', err);
      setIsPromoting(false);
      setPromotionProgress(0);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F9F9F7] relative">
      <HODArchiveHeader 
        activeSubTab={activeSubTab} 
        onTabChange={setActiveSubTab}
        onStudentSelect={handleStudentSelect}
      />

      {/* Global Decorative Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.012] select-none z-0">
        <h1 className="text-[14vw] font-black rotate-[-20deg] text-slate-950 uppercase">HOD REGISTRY</h1>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative z-10 w-full">
        <AnimatePresence mode="wait">
          {selectedStudent ? (
            <motion.div 
              key="detail_view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex-1 h-full w-full overflow-hidden"
            >
              {vaultDetailLoading ? (
                <div className="flex-1 h-full w-full overflow-y-auto flex items-center justify-center">
                  <div className="text-xs text-muted-foreground font-medium">Loading student record...</div>
                </div>
              ) : (
                <HODArchiveDetailView 
                  student={selectedStudent} 
                  onBack={handleBack} 
                />
              )}
            </motion.div>
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {activeSubTab === 'VAULT' && (
                <HODVaultView 
                  students={students}
                  filteredStudents={filteredStudents}
                  onStudentSelect={handleStudentSelect}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedClass={selectedClass}
                  onClassChange={setSelectedClass}
                  selectedYear={selectedYear}
                  onYearChange={setSelectedYear}
                  totalAlumniCount={students.length}
                  departmentAverage="N/A"
                  verifiedSealsCount={lockedTerms.length}
                  hasSealedTerms={lockedTerms.length > 0}
                />
              )}

              {activeSubTab === 'PROMOTION' && (
                <HODPromotionTerminal 
                  isPromoting={isPromoting}
                  promotionProgress={promotionProgress}
                  promotionLogged={promotionLogged}
                  onInitiatePromotion={handleGlobalPromotion}
                  seniorCount={promotionMetrics.seniorSize}
                  clearedCount={promotionMetrics.clearedCount}
                />
              )}

              {activeSubTab === 'COMPLIANCE' && (
                <HODComplianceAudits 
                  performanceData={transformedCohorts}
                  auditLogs={transformedTimeline}
                />
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
