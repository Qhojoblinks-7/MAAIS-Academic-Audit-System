import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, ShieldCheck, Award, ShieldAlert } from 'lucide-react';
import { HODArchiveKPICard } from '../molecules/HODArchiveKPICard';
import { HODArchiveFilterMatrix } from '../molecules/HODArchiveFilterMatrix';
import { HODArchiveStudentRow } from '../molecules/HODArchiveStudentRow';
import { EmptyState } from '../molecules/EmptyState';

export function HODVaultView({ 
  students = [], 
  filteredStudents = [], 
  onStudentSelect,
  searchTerm,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedYear,
  onYearChange,
  totalAlumniCount,
  departmentAverage,
  verifiedSealsCount,
  hasSealedTerms = false
}) {
  
  // Memoized unique current class streams array
  const uniqueClasses = useMemo(() => {
    const classes = [...new Set(students.map(s => s.currentClass))].filter(Boolean);
    return ['ALL', ...classes.sort()];
  }, [students]);

  // Memoized unique target graduation years list
  const uniqueYears = useMemo(() => {
    const years = [...new Set(students.map(s => s.graduationYear))].filter(Boolean);
    return ['ALL', ...years.sort()];
  }, [students]);

  /**
   * SHARED DESIGN GRID SPECIFICATION
   * Defines matching space footprints for headers and row blocks alike.
   * Mobile: 3 columns (Identity, Grade/Status, Action)
   * Desktop (sm and up): 6 structural responsive data tracking fractions
   */
  const rowGridStructure = "grid grid-cols-[1.5fr_1fr_0.5fr] sm:grid-cols-[2fr_1.2fr_0.8fr_1fr_1.2fr_0.4fr] gap-2 sm:gap-4 items-center";

  return (
    <motion.div 
      key="vault"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto"
    >
      {hasSealedTerms && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert size={20} className="text-destructive" />
          </div>
          <div>
            <p className="text-xs font-black text-destructive uppercase tracking-wider">Seals Frozen — Archive Secured</p>
            <p className="text-xs font-bold text-destructive mt-0.5">All student dockets in The Vault are locked with tamper-evident SECURE status. Grade entry is suspended.</p>
          </div>
        </div>
      )}

      {/* Analytic KPI Grid Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HODArchiveKPICard 
          title="Total Rostered Students" 
          val={totalAlumniCount} 
          note="Current & Graduated profiles" 
          icon={Users} 
          color="blue"
        />
        <HODArchiveKPICard 
          title="Historic WASSCE Mean" 
          val={`${departmentAverage}%`} 
          note="Department-wide GPA" 
          icon={TrendingUp} 
          color="emerald"
        />
        <HODArchiveKPICard 
          title="HOD Verified Seals" 
          val={verifiedSealsCount} 
          note="Permanently validated" 
          icon={ShieldCheck} 
          color="amber"
        />
        <HODArchiveKPICard 
          title="Retention & Pass Key" 
          val="100.0%" 
          note="Zero compliance leakage" 
          icon={Award} 
          color="slate"
        />
      </div>

      {/* Filtering Management Block */}
      <HODArchiveFilterMatrix 
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedClass={selectedClass}
        onClassChange={onClassChange}
        selectedYear={selectedYear}
        onYearChange={onYearChange}
        availableClasses={uniqueClasses}
        availableYears={uniqueYears}
      />

      {/* Student Registry Container Frame */}
      <div className="bg-surface border border-border rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-sm">
        <header className="px-4 sm:px-8 py-4 sm:py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30">
          <div className="min-w-0">
            <h4 className="text-xs font-black text-foreground uppercase tracking-widest leading-none">
              Archives Dossiers
            </h4>
            <p className="text-xs text-muted-foreground font-bold uppercase mt-1.5 hidden sm:block">
              Select an active or alumni dossier to analyze longitudinal performance and view historical credentials
            </p>
            <p className="text-xs text-muted-foreground font-bold uppercase mt-1.5 sm:hidden">
              View student records &amp; credentials
            </p>
          </div>
          <span className="text-xs font-bold text-text-secondary bg-surface border border-border rounded-lg px-2.5 py-1 text-center whitespace-nowrap self-start sm:self-center">
            Displaying <span className="text-foreground font-black">{filteredStudents.length}</span> records
          </span>
        </header>

        {/* Scroll Containment Outer Viewport */}
        <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] sm:min-w-full divide-y divide-border">
            
            {/* Pure Grid Table Header */}
            <div className={`px-6 sm:px-8 py-4 text-xs font-black text-muted-foreground uppercase tracking-wider bg-muted/20 border-b border-border ${rowGridStructure}`}>
              <div>Student Identity</div>
              <div className="hidden sm:block">Stream / Batch</div>
              <div className="text-center sm:text-left">Grade</div>
              <div className="text-center hidden sm:block">WASSCE</div>
              <div className="text-center sm:text-left">Status</div>
              <div className="text-right">Action</div>
            </div>

            {/* Pure Grid Rows Container */}
            <div className="divide-y divide-border">
              {filteredStudents.length === 0 ? (
                <div className="px-8 py-16">
                  <EmptyState context="students" variant="compact" />
                </div>
              ) : (
                filteredStudents.map(student => (
                  <HODArchiveStudentRow 
                    key={student.id} 
                    student={student} 
                    onClick={onStudentSelect}
                    layoutClass={rowGridStructure} // Injected style synchronization token
                  />
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
