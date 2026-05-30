import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mockApiData from '../../data/mockApiData.json';
import { HODArchiveHeader } from '../../components/atoms/HODArchiveHeader';
import { HODVaultView } from '../../components/organisms/HODVaultView';
import { HODPromotionTerminal } from '../../components/organisms/HODPromotionTerminal';
import { HODComplianceAudits } from '../../components/organisms/HODComplianceAudits';
import { HODArchiveDetailView } from './HODArchiveDetailView';

export function HODArchiveView() {
  const [activeSubTab, setActiveSubTab] = useState('VAULT');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');

  // Promotion Pipeline state
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionProgress, setPromotionProgress] = useState(0);
  const [promotionLogged, setPromotionLogged] = useState(false);

  // 1. Memoize raw array structural normalization
  const students = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const getDynamicStatus = (graduationYear) => {
      const year = parseInt(graduationYear, 10);
      if (isNaN(year) || year < currentYear) return 'Archived & Verified';
      if (year === currentYear || year === currentYear + 1) return 'Archive Inbound';
      return 'Empty Archive';
    };

    const getDynamicComment = (graduationYear) => {
      const year = parseInt(graduationYear, 10);
      if (isNaN(year) || year < currentYear) return `Student record certified. ${graduationYear} cohort securely archived.`;
      if (year === currentYear || year === currentYear + 1) return 'Active student file. Historical records compiling.';
      return 'Student profile initialized. Awaiting academic history.';
    };

    const items = mockApiData?.archive?.items || [];
    
    return items.flatMap(archiveItem => 
      (archiveItem?.students || []).map(student => ({
        id: student.id,
        name: student.name || '',
        index: String(student.indexNumber || student.index || ''),
        graduationYear: String(student.graduationYear || ''),
        currentClass: student.currentClass || '',
        department: archiveItem.subject || '',
        consistencyScore: student.consistencyScore || 0,
        status: getDynamicStatus(student.graduationYear),
        hodComment: getDynamicComment(student.graduationYear),
        finalWassce: student.finalWassce || 'Pending',
        history: student.history || [],
        observations: student.observations || [],
        interventions: student.interventions || []
      }))
    );
  }, []); // Re-computes only if mock data reference updates

  // 2. Memoize structural statistics based on base dataset
  const globalStats = useMemo(() => {
    const totalAlumniCount = students.length;
    const verifiedSealsCount = students.filter(s => s.status === 'Archived & Verified').length;
    const totalGradesArray = students.flatMap(s => s.history.map(h => h.finalGrade));
    
    const departmentAverage = totalGradesArray.length > 0 
      ? (totalGradesArray.reduce((a, b) => a + b, 0) / totalGradesArray.length).toFixed(1) 
      : 'N/A';

    return {
      totalAlumniCount,
      verifiedSealsCount,
      departmentAverage
    };
  }, [students]);

  // 3. Lightweight down-stream sorting & filtering calculations
  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    
    return students.filter(s => {
      const matchesSearch = !normalizedSearch || 
        s.name.toLowerCase().includes(normalizedSearch) || 
        s.index.toLowerCase().includes(normalizedSearch);
      
      const matchesClass = selectedClass === 'ALL' || s.currentClass === selectedClass;
      const matchesYear = selectedYear === 'ALL' || s.graduationYear === selectedYear;
      
      return matchesSearch && matchesClass && matchesYear;
    });
  }, [students, searchTerm, selectedClass, selectedYear]);

  // 4. Clean simulation side-effect protection
  const handleGlobalPromotion = () => {
    setIsPromoting(true);
    setPromotionProgress(0);
  };

  useEffect(() => {
    let intervalId;
    if (isPromoting) {
      intervalId = setInterval(() => {
        setPromotionProgress(prev => {
          if (prev >= 100) {
            clearInterval(intervalId);
            setIsPromoting(false);
            setPromotionLogged(true);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPromoting]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F9F9F7] relative">
      <HODArchiveHeader 
        activeSubTab={activeSubTab} 
        onTabChange={setActiveSubTab}
        onStudentSelect={setSelectedStudent}
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
              <HODArchiveDetailView 
                student={selectedStudent} 
                onBack={() => setSelectedStudent(null)} 
              />
            </motion.div>
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {activeSubTab === 'VAULT' && (
                <HODVaultView 
                  students={students}
                  filteredStudents={filteredStudents}
                  onStudentSelect={setSelectedStudent}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedClass={selectedClass}
                  onClassChange={setSelectedClass}
                  selectedYear={selectedYear}
                  onYearChange={setSelectedYear}
                  totalAlumniCount={globalStats.totalAlumniCount}
                  departmentAverage={globalStats.departmentAverage}
                  verifiedSealsCount={globalStats.verifiedSealsCount}
                />
              )}

              {activeSubTab === 'PROMOTION' && (
                <HODPromotionTerminal 
                  isPromoting={isPromoting}
                  promotionProgress={promotionProgress}
                  promotionLogged={promotionLogged}
                  onInitiatePromotion={handleGlobalPromotion}
                />
              )}

              {activeSubTab === 'COMPLIANCE' && <HODComplianceAudits />}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}