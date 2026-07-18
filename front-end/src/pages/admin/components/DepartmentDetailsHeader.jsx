import React from 'react';
import {
  GraduationCap,
  ChevronLeft,
  Download,
  Lock,
  ShieldCheck,
  Users,
  BookOpen,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useActiveYear } from '../../../lib/hooks';

const formatTermLabel = (termNumber) => {
  if (!termNumber) return null;
  return termNumber.replace('TERM_', 'Term ').replace('SEMESTER_', 'Semester ');
};

export function DepartmentDetailsHeader({ selectedDept, onBack, onExport, onFreeze, activeTab, setActiveTab }) {
  const isFrozen = selectedDept?.isFrozen;
  const headerBg = selectedDept?.dark || 'bg-brand-dark';

  const { data: activeYearData } = useActiveYear();
  const activeTerm = activeYearData?.terms?.find((t) => t.isActive);
  const yearLabel = activeYearData?.label || 'Current Academic Year';
  const termLabel = formatTermLabel(activeTerm?.termNumber);

  return (
    <div className={cn("p-6 text-primary-foreground shrink-0 relative overflow-hidden transition-colors duration-500", headerBg)}>
      {/* Decorative academic watermark */}
      <div className="absolute -top-10 -right-6 w-64 h-64 rounded-full bg-primary-foreground/5 pointer-events-none" />
      <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
        <GraduationCap size={200} />
      </div>

      {/* Top utility row */}
      <div className="flex justify-between items-start mb-6 relative">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl transition-all shadow-lg backdrop-blur-md flex items-center gap-2">
            <ChevronLeft size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest">Back to Departments</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary-foreground/50">
            <BookOpen size={12} />
            <span>{yearLabel}{termLabel ? ` • ${termLabel}` : ''}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-foreground/20 transition-all shadow-sm backdrop-blur-sm">
            <Download size={14} />
            Export Dossier
          </button>
          <button
            onClick={onFreeze}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all",
              isFrozen
                ? "bg-brand-primary text-primary-foreground shadow-brand-primary/20 hover:bg-brand-dark"
                : "bg-destructive text-primary-foreground shadow-destructive/20 hover:bg-destructive/90"
            )}
          >
            {isFrozen ? <ShieldCheck size={14} /> : <Lock size={14} />}
            {isFrozen ? 'Lift Department Freeze' : 'Initiate Freeze'}
          </button>
        </div>
      </div>

      {/* Identity + navigation row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-foreground/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-primary-foreground ring-1 ring-primary-foreground/30 shadow-xl shrink-0">
            <GraduationCap size={28} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-foreground/50 mb-0.5">Academic Department</p>
            <h2 className="text-2xl font-black italic font-display tracking-tight leading-none mb-1.5">{selectedDept.name} Department</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-foreground/10 rounded-full text-[8px] font-black uppercase tracking-widest text-primary-foreground ring-1 ring-primary-foreground/20">
                <BadgeCheck size={11} />
                {selectedDept.validationStatus}% Curriculum Validated
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary-foreground/70 uppercase tracking-[0.2em]">
                <Users size={11} />
                {selectedDept.teacherCount} Faculty
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setActiveTab('staff')} className={cn("text-[9px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg cursor-pointer", activeTab === 'staff' ? "text-primary-foreground bg-primary-foreground/15" : "text-primary-foreground/60 hover:text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/10")}>Faculty</button>
          <button onClick={() => setActiveTab('grading')} className={cn("text-[9px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg cursor-pointer", activeTab === 'grading' ? "text-primary-foreground bg-primary-foreground/15" : "text-primary-foreground/60 hover:text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/10")}>Grading</button>
          <button onClick={() => setActiveTab('vault')} className={cn("text-[9px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg cursor-pointer", activeTab === 'vault' ? "text-primary-foreground bg-primary-foreground/15" : "text-primary-foreground/60 hover:text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/10")}>Minutes</button>
        </div>
      </div>
    </div>
  );
}

export default DepartmentDetailsHeader;
