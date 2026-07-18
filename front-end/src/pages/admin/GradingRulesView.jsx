import React, { useState, useEffect } from 'react';
import { 
  Settings2, ShieldCheck, AlertTriangle, Save, 
  Plus, Trash2, Edit3, Lock, Unlock,
  HelpCircle, ChevronRight, Gauge,
  Palette, History, Info, ShieldAlert,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { useUI } from '../../context/UIContext';
import { useNavigate } from 'react-router-dom';
import { useActiveYear, useLockTerm, useUnlockTerm, useComplianceWarnings, useTermSummary, useAllClasses, useUpdateGradingRules, useAllDepartments } from '../../lib/hooks';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';


const DEFAULT_REMARK_POOL = {
  Distinction: ['Exceptional performance.', 'Outstanding academic rigor.', 'A masterclass in the subject.'],
  Credit: ['Good work, stay focused.', 'Solid performance with room for growth.', 'Commendable effort.'],
  Pass: ['Satisfactory, but needs more practice.', 'Meeting minimum requirements.', 'Steady progress.'],
  Fail: ['Requires urgent intervention.', 'Inadequate mastery of concepts.', 'Needs intensive remedial support.']
};

const DEFAULT_BOUNDARIES = [
  { id: 'b-1', min: 80, max: 100, grade: 'A1', remark: 'Excellent: Exceptional performance in all components.', suggestionPool: DEFAULT_REMARK_POOL.Distinction },
  { id: 'b-2', min: 70, max: 79, grade: 'B2', remark: 'Very Good: Highly commendable effort and focus.', suggestionPool: DEFAULT_REMARK_POOL.Distinction },
  { id: 'b-3', min: 65, max: 69, grade: 'B3', remark: 'Good: Solid understanding of core concepts.', suggestionPool: DEFAULT_REMARK_POOL.Credit },
  { id: 'b-4', min: 60, max: 64, grade: 'C4', remark: 'Credit: Satisfactory performance with consistent results.', suggestionPool: DEFAULT_REMARK_POOL.Credit },
  { id: 'b-5', min: 55, max: 59, grade: 'C5', remark: 'Credit: Can do better with more effort.', suggestionPool: DEFAULT_REMARK_POOL.Credit },
  { id: 'b-6', min: 50, max: 54, grade: 'C6', remark: 'Credit: Average performance; needs steady improvement.', suggestionPool: DEFAULT_REMARK_POOL.Credit },
  { id: 'b-7', min: 45, max: 49, grade: 'D7', remark: 'Pass: Meeting minimum standards for the subject.', suggestionPool: DEFAULT_REMARK_POOL.Pass },
  { id: 'b-8', min: 40, max: 44, grade: 'E8', remark: 'Pass: Weak performance; requires reinforcement.', suggestionPool: DEFAULT_REMARK_POOL.Pass },
  { id: 'b-9', min: 0, max: 39, grade: 'F9', remark: 'Fail: Poor performance; remedial sessions highly recommended.', suggestionPool: DEFAULT_REMARK_POOL.Fail },
];

export const GradingRulesView = () => {
  const { isTermFinalized, setIsTermFinalized } = useUI();
  const TERM_DISPLAY = { TERM_1: 'Term 1', TERM_2: 'Term 2', TERM_3: 'Term 3', SEMESTER_1: 'Semester 1', SEMESTER_2: 'Semester 2' };
  const [caWeight, setCaWeight] = useState(30);
  const [examWeight, setExamWeight] = useState(70);
  const [boundaries, setBoundaries] = useState(DEFAULT_BOUNDARIES);
  const [normalizationEnabled, setNormalizationEnabled] = useState(true);
    const [departmentalOverrideEnabled, setDepartmentalOverrideEnabled] = useState(false);
    const [departmentOverrides, setDepartmentOverrides] = useState({});
    
    const [deadlineDate, setDeadlineDate] = useState('2026-07-15');
   const [deadlineTime, setDeadlineTime] = useState('23:59');
const [showSealConfirm, setShowSealConfirm] = useState(false);
    const [initialState, setInitialState] = useState({});
    const [showComplianceResult, setShowComplianceResult] = useState(false);
    const [complianceWarnings, setComplianceWarnings] = useState([]);
    
    const navigate = useNavigate();

    const activeYearQuery = useActiveYear();
    const lockTermMutation = useLockTerm();
    const unlockTermMutation = useUnlockTerm();
    const updateGradingRulesMutation = useUpdateGradingRules();
    const departmentsQuery = useAllDepartments();
    const complianceQuery = useComplianceWarnings();

    const departments = departmentsQuery.data || [];
    const activeTerm = activeYearQuery.data?.terms?.find(t => t.isActive);

    const termSummaryQuery = useTermSummary(activeTerm?.id);

useEffect(() => {
       setInitialState({
         caWeight,
         examWeight,
         boundaries,
         normalizationEnabled,
         departmentalOverrideEnabled,
         departmentOverrides,
         deadlineDate,
         deadlineTime
       });
     }, []);

    const handleWeightChange = (value) => {
      setCaWeight(value);
      setExamWeight(100 - value);
    };

    const handleBoundaryChange = (id, field, value) => {
      setBoundaries(prevBoundaries =>
        prevBoundaries.map(b =>
          b.id === id ? { ...b, [field]: value } : b
        )
      );
    };

    const handleDeleteBoundary = (id) => {
      setBoundaries(prevBoundaries => prevBoundaries.filter(b => b.id !== id));
    };

    const handleAddBoundary = () => {
      const newId = `b-${Date.now()}`;
      const newBoundary = {
        id: newId,
        min: 0,
        max: 0,
        grade: 'PLC',
        remark: '',
        suggestionPool: []
      };
      setBoundaries(prevBoundaries => [...prevBoundaries, newBoundary]);
    };

const handleAuditTrailClick = () => {
       navigate('/audit');
     };

    const runComplianceSuite = () => {
      if (complianceQuery.data) {
        setComplianceWarnings(complianceQuery.data);
        setShowComplianceResult(true);
      } else if (complianceQuery.isError) {
        setComplianceWarnings([{ severity: 'high', msg: 'Failed to fetch compliance data.' }]);
        setShowComplianceResult(true);
      }
    };

 const handleCommitChanges = async () => {
      if (isTermFinalized) {
        toast.info('Unlock the term first before committing changes.');
        return;
      }

      try {
        const submissionDeadline = `${deadlineDate}T${deadlineTime}:00`;

        const payload = {
          termId: activeTerm?.id,
          caWeight,
          examWeight,
          normalizationEnabled,
          submissionDeadline,
        };

        await updateGradingRulesMutation.mutateAsync(payload);

        setInitialState({
          ...initialState,
          ...payload,
        });
        toast.success('Changes committed successfully!');
      } catch (error) {
        console.error('Failed to commit changes:', error);
        const reason = error?.response?.data?.freezeReason || error?.message || 'Please try again.';
        toast.error(`Failed to commit changes: ${reason}`);
      }
     };

    const getTimeRemaining = () => {
      const deadline = new Date(`${deadlineDate}T${deadlineTime}:00`);
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        return 'DEADLINE PASSED';
      }

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      const remainingHours = hours % 24;
      const remainingMinutes = minutes % 60;

      // Format as e.g., "5d 3h 2m"
      let parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (remainingHours > 0) parts.push(`${remainingHours}h`);
      if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`);

      return parts.join(' ');
    };

    return (
    <div className="flex-1 p-8 bg-muted overflow-y-auto relative">
      {/* Final Seal Confirmation Modal */}
      <AnimatePresence>
        {showSealConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowSealConfirm(false)}
               className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-md bg-surface rounded-[2.5rem] p-10 shadow-3xl overflow-hidden border border-border"
             >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-destructive" />
                <div className="w-20 h-20 bg-destructive/10 rounded-[2rem] flex items-center justify-center mb-8 mx-auto">
                    <ShieldAlert size={40} className="text-destructive" />
                </div>
                
                <h3 className="text-2xl font-black text-text-primary text-center italic font-display mb-4">Execute Final Seal?</h3>
                <p className="text-text-secondary text-center text-sm font-medium leading-relaxed mb-8">
                  This action will <span className="font-black text-destructive">permanently freeze</span> all marks and assessments for this term. Publication protocols will trigger immediately.
                </p>

                 <div className="space-y-4 mb-10">
                    <div className="p-4 bg-muted rounded-2xl border border-border">
                       <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Target Term</p>
                       <p className="text-sm font-black text-text-primary">
                         {termSummaryQuery.isLoading ? 'Loading...' : termSummaryQuery.data?.termLabel || '�'}
                       </p>
                    </div>
                    <div className="p-4 bg-muted rounded-2xl border border-border">
                       <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Impact Radius</p>
                       <p className="text-sm font-black text-text-primary">
                         {termSummaryQuery.isLoading
                           ? 'Loading...'
                           : `${termSummaryQuery.data?.studentCount?.toLocaleString() ?? '�'} Students & ${termSummaryQuery.data?.gradeEntryCount?.toLocaleString() ?? '�'} Grade Entries`}
                       </p>
                    </div>
                 </div>

                <div className="flex gap-4">
                   <button 
                     onClick={() => setShowSealConfirm(false)}
                     className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
                   >
                     Abort
                   </button>
                     <button 
                       onClick={() => {
                         if (activeTerm?.id) {
                           lockTermMutation.mutate(activeTerm.id, {
                             onSuccess: () => {
                               setIsTermFinalized(true);
                               setShowSealConfirm(false);
                               toast.success('Term sealed successfully. Grading is now locked.');
                             },
                             onError: (error) => {
                               const reason = error?.response?.data?.freezeReason || error?.message || 'Please try again.';
                               toast.error(`Failed to seal term: ${reason}`);
                             },
                           });
                         } else {
                           setIsTermFinalized(true);
                           setShowSealConfirm(false);
                         }
                       }}
                      className="flex-1 py-4 bg-destructive text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-destructive/20 hover:bg-destructive transition-all"
                    >
                      {lockTermMutation.isPending ? 'Sealing...' : 'Finalize Term'}
                    </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black italic font-display text-text-primary tracking-tight leading-none">
              The Grading Rules
            </h1>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mt-3">
              Standardized Assessment Logic & WAEC Calibration
            </p>
          </div>
          <div className="flex gap-3">
              <button 
                onClick={handleAuditTrailClick}
                className="flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-muted transition-all"
              >
                <History size={14} /> Audit Trail
              </button>
              {!isTermFinalized && (
                <button 
                  onClick={handleCommitChanges}
                  className="flex items-center gap-2 px-8 py-3 bg-brand-dark text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-dark/20 hover:bg-brand-dark transition-all"
                >
                  <Save size={14} /> Commit Changes
                </button>
              )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* 1. Weighting Toggle (The Split) */}
          <div className={cn(
            "lg:col-span-2 space-y-8 transition-opacity",
            isTermFinalized && "opacity-60 pointer-events-none"
          )}>
            <section className="bg-surface rounded-[2.5rem] border border-border p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Gauge size={80} className="text-text-primary" />
              </div>
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-[13px] font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <Settings2 size={16} className="text-brand-primary" />
                    The Global Weighting Toggle
                  </h3>
                  <p className="text-[9px] font-bold text-text-secondary mt-1 uppercase tracking-widest leading-relaxed">
                    Define the Continuous Assessment (CA) vs. Examination Split
                  </p>
                </div>
                <div className="px-3 py-1 bg-muted rounded-lg text-[9px] font-black text-text-secondary uppercase tracking-widest">
                  Standard WASSCE 30/70
                </div>
              </div>

              <div className="space-y-12 py-6">
                <div className="relative">
                  <div className="flex justify-between mb-8 px-4">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-text-secondary uppercase mb-2 tracking-widest">Continuous Assessment</p>
                      <h4 className="text-5xl font-black italic font-display text-text-primary tracking-tighter">{caWeight}%</h4>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-text-secondary uppercase mb-2 tracking-widest">Final Examination</p>
                      <h4 className="text-5xl font-black italic font-display text-text-primary tracking-tighter text-right">{examWeight}%</h4>
                    </div>
                  </div>
                  
                  <div className="relative h-4 bg-muted rounded-full cursor-pointer flex items-center group/slider">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={caWeight}
                      disabled={isTermFinalized}
                      onChange={(e) => handleWeightChange(parseInt(e.target.value) || 0)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div 
                      className="absolute left-0 top-0 h-full bg-brand-primary rounded-l-full transition-all duration-300" 
                      style={{ width: `${caWeight}%` }}
                    />
                    <div 
                      className="absolute h-8 w-8 bg-surface border-4 border-border rounded-full shadow-xl transition-all duration-300 cursor-grab active:scale-95 z-20"
                      style={{ left: `calc(${caWeight}% - 16px)` }}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-[8px] font-black text-text-secondary uppercase tracking-[0.4em] pointer-events-none">
                      Dynamic Split
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-2xl border border-border">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={cn(
                        "w-5 h-5 rounded-md border-2 border-border flex items-center justify-center transition-all",
                        normalizationEnabled ? "bg-brand-dark border-border" : ""
                      )}>
                        {normalizationEnabled && <ShieldCheck size={12} className="text-primary-foreground" />}
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={normalizationEnabled}
                          disabled={isTermFinalized}
                          onChange={(e) => setNormalizationEnabled(e.target.checked)}
                        />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-text-primary uppercase tracking-widest">Auto-Normalization</p>
                        <p className="text-[9px] font-bold text-text-secondary uppercase tracking-tighter mt-0.5">Scale all raw scores to 100% automatically</p>
                      </div>
                    </label>
</div>
                   <div className="p-4 bg-brand-primary/50 rounded-2xl border border-brand-primary/10">
                      <div className="flex items-start gap-3 mb-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <div className={cn(
                            "w-5 h-5 rounded-md border-2 border-border flex items-center justify-center transition-all",
                            departmentalOverrideEnabled ? "bg-brand-primary border-brand-primary" : ""
                          )}>
                            {departmentalOverrideEnabled && <ShieldCheck size={12} className="text-primary-foreground" />}
                            <input 
                              type="checkbox" 
                              className="sr-only" 
                              checked={departmentalOverrideEnabled}
                              disabled={isTermFinalized}
                              onChange={(e) => setDepartmentalOverrideEnabled(e.target.checked)}
                            />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-brand-primary uppercase tracking-widest">Departmental Override</p>
                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-tighter mt-0.5">Allow Tech/Voc to use 40/60 split.</p>
                          </div>
                        </label>
                      </div>
{departmentalOverrideEnabled && (
                         <div className="mt-3 pt-3 border-t border-brand-primary/50">
                           <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Departments Requiring Override</p>
                           <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                             {departments.map(dept => (
                               <label key={dept.id} className="flex items-center gap-2 cursor-pointer">
                                 <div className={cn(
                                   "w-4 h-4 rounded border border-border flex items-center justify-center transition-all",
                                   departmentOverrides[dept.id] ? "bg-brand-primary border-brand-primary" : ""
                                 )}>
                                   {departmentOverrides[dept.id] && <ShieldCheck size={10} className="text-primary-foreground" />}
                                   <input 
                                     type="checkbox" 
                                     className="sr-only" 
                                     checked={departmentOverrides[dept.id] || false}
                                     disabled={isTermFinalized}
                                     onChange={(e) => setDepartmentOverrides(prev => ({ ...prev, [dept.id]: e.target.checked }))}
                                   />
                                 </div>
                                 <span className="text-[10px] font-bold text-text-secondary">{dept.name || dept.label}</span>
                               </label>
                             ))}
                           </div>
                         </div>
                       )}
                       {!departmentalOverrideEnabled && departments.length > 0 && (
                         <div className="mt-3 pt-3 border-t border-brand-primary/50">
                           <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Available Departments</p>
                           <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-hide">
                             {departments.map(dept => (
                               <span key={dept.id} className="px-2 py-1 bg-surface border border-brand-primary rounded-lg text-[9px] font-bold text-brand-primary">
                                 {dept.name || dept.label}
                               </span>
                             ))}
                           </div>
                         </div>
                       )}
                   </div>
                 </div>
               </div>
             </section>

{/* 2. Grade Boundary Configuration (The WAEC Scale) */}
             <section className="bg-surface rounded-[2.5rem] border border-border shadow-sm overflow-visible">
                <div className="p-10 border-b border-border flex justify-between items-center">
                  <div>
                    <h3 className="text-[13px] font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <Palette size={16} className="text-brand-primary" />
                        WAEC Scale Calibration
                    </h3>
                    <p className="text-[9px] font-bold text-text-secondary mt-1 uppercase tracking-widest">Mapping Percentage Thresholds to Terminal Grades</p>
                  </div>
                   <button 
                     onClick={() => toast.info('WAEC calibration maps score ranges to terminal grades (A1-F9). Adjust boundaries carefully � they directly affect transcript quality and ranking.')}
                     className="p-3 bg-muted text-text-secondary rounded-xl hover:text-text-primary transition-colors"
                   >
                     <HelpCircle size={18} />
                   </button>
                </div>
                <div className="overflow-visible">
                   <Table containerClassName="overflow-visible">
                    <TableHeader>
                      <TableRow className="bg-muted border-b border-border">
                         <TableHead className="px-10 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Score Range (%)</TableHead>
                         <TableHead className="px-10 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Grade</TableHead>
                         <TableHead className="px-10 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Automated Remark (Smart Logic)</TableHead>
                         <TableHead className="px-10 py-5"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border relative">
                      {boundaries.map((b) => (
                        <TableRow key={b.id} className="hover:bg-muted/50 transition-colors group overflow-visible">
<TableCell className="px-6 py-6 overflow-visible">
                            <div className="flex items-center gap-3">
                               <input 
                                 type="number" 
                                 value={b.min}
                                 disabled={isTermFinalized}
                                 // Safe input handling: string allows backspacing clean fields
                                 onChange={(e) => handleBoundaryChange(b.id, 'min', e.target.value === '' ? '' : parseInt(e.target.value))}
                                 className="w-16 px-3 py-2 bg-muted border border-border rounded-xl text-[12px] font-black font-mono text-center outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                               />
                               <span className="text-muted font-black">�</span>
                               <input 
                                 type="number" 
                                 value={b.max}
                                 disabled={isTermFinalized}
                                 onChange={(e) => handleBoundaryChange(b.id, 'max', e.target.value === '' ? '' : parseInt(e.target.value))}
                                 className="w-16 px-3 py-2 bg-muted border border-border rounded-xl text-[12px] font-black font-mono text-center outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                               />
                            </div>
                          </TableCell>
                          <TableCell className="px-10 py-6 text-center">
                            <span className={cn(
                              "px-4 py-2 rounded-xl text-[14px] font-black italic font-display border",
                              b.grade.startsWith('A') ? "bg-brand-primary/10 text-brand-primary border-brand-primary" :
                              b.grade.startsWith('B') ? "bg-brand-primary/10 text-brand-primary border-brand-primary" :
                              b.grade.startsWith('C') ? "bg-warning/10 text-warning border-warning" :
                              "bg-destructive/10 text-destructive border-destructive"
                            )}>
                              {b.grade}
</span>
                             </TableCell>
                             <TableCell className="px-12 py-6 relative flex-1">
                               <Edit3 size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-hover:text-brand-primary transition-colors" />
                               <input 
                                 type="text"
                                 value={b.remark}
                                 disabled={isTermFinalized}
                                 onChange={(e) => handleBoundaryChange(b.id, 'remark', e.target.value)}
                                 className="w-full pl-10 pr-4 py-3 bg-transparent border border-transparent hover:border-border rounded-xl text-[12px] font-bold text-text-secondary outline-none focus:bg-surface focus:ring-2 focus:ring-brand-primary/20 transition-all font-sans"
                               />
                             </TableCell>
                             <TableCell className="px-10 py-6 text-right flex items-center gap-2 justify-end">
                              <div className="relative group/suggest">
                                <button 
                                  disabled={isTermFinalized}
                                  className="p-2 bg-muted text-text-secondary rounded-lg hover:bg-brand-primary hover:text-primary-foreground disabled:hover:bg-muted disabled:hover:text-text-secondary transition-all border border-border"
                                >
                                  <Sparkles size={14} />
                                </button>
                                {!isTermFinalized && (
                                  <div className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-2xl shadow-2xl border border-border p-2 hidden group-hover/suggest:block z-[1000] scrollbar-hide flex flex-col">
                                    <div className="px-3 py-2 border-b border-border mb-1">
                                      <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Smart Suggestions</p>
                                    </div>
                                    {b.suggestionPool?.map((suggestion, idx) => (
                                        <button 
                                        key={idx}
                                        onClick={() => handleBoundaryChange(b.id, 'remark', suggestion)}
                                        className="w-full text-left px-3 py-2 text-[10px] font-bold text-text-secondary hover:bg-muted rounded-lg transition-colors leading-tight flex items-center"
                                      >
                                        {suggestion}
                                      </button>
                                    ))}
                                    {(!b.suggestionPool || b.suggestionPool.length === 0) && (
                                      <div className="px-3 py-2 text-[10px] font-medium text-text-secondary italic">No templates for this category.</div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <button 
                                disabled={isTermFinalized}
                                onClick={() => handleDeleteBoundary(b.id)}
                                className="text-muted hover:text-destructive disabled:hover:text-muted transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={16} />
                              </button>
                           </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
               
               <div className="p-8 bg-muted border-t border-border">
                  <button 
                    disabled={isTermFinalized}
                    onClick={handleAddBoundary}
                    className="w-full py-4 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-3 text-text-secondary hover:text-text-secondary hover:border-border disabled:opacity-50 disabled:pointer-events-none transition-all"
                  >
                    <Plus size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Insert New Threshold</span>
                  </button>
               </div>
            </section>
          </div>

          {/* 3. The "Final Seal" (Validation Lock) */}
          <div className="space-y-8">
            <section className="bg-brand-charcoal rounded-[2.5rem] p-10 text-primary-foreground shadow-2xl relative overflow-hidden">
                 <div className="absolute -bottom-10 -right-10 opacity-10 text-primary-foreground pointer-events-none">
                  <Lock size={200} />
                </div>
               
                 <div className="relative z-10">
                   <div className="flex items-start justify-between mb-8">
                     <div className="w-16 h-16 bg-primary-foreground/10 backdrop-blur-xl border border-primary-foreground/20 rounded-[1.5rem] flex items-center justify-center">
                       {isTermFinalized ? <Lock className="text-primary-foreground" size={32} /> : <Unlock className="text-primary-foreground/80" size={32} />}
                     </div>
                     <span className={cn(
                       "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border",
                       isTermFinalized 
                         ? "bg-destructive/25 text-destructive border-destructive/40 animate-pulse" 
                         : "bg-primary-foreground/15 text-primary-foreground border-primary-foreground/30"
                     )}>
                       {isTermFinalized ? 'TERM LOCKED' : 'TERM UNLOCKED'}
                     </span>
                   </div>
                   
                   <h3 className="text-2xl font-black text-primary-foreground italic font-display tracking-tight leading-none mb-3">Terminal Validation Lock</h3>
                   <p className="text-[10px] font-bold text-primary-foreground/70 uppercase tracking-widest leading-relaxed mb-10">
                     {isTermFinalized 
                       ? 'Grading is suspended. No teacher can modify marks. Use Emergency Unlock to restore access.' 
                       : 'Encrypt and freeze the database for report generation. Once locked, no teacher can modify marks.'}
                   </p>
                 
                  <div className="space-y-6 mb-12">
                    <div className="flex justify-between items-end">
                       <label className="text-[9px] font-black text-primary-foreground/60 uppercase tracking-[0.2em] block mb-3">Submission Deadline</label>
                       <span className={cn(
                         "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2",
                         getTimeRemaining() === 'DEADLINE PASSED' ? "bg-destructive text-primary-foreground" : "bg-primary-foreground text-brand-charcoal"
                       )}>
                         {getTimeRemaining()}
                       </span>
                    </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="relative">
                         <input 
                           type="date" 
                           value={deadlineDate}
                           disabled={isTermFinalized}
                           onChange={(e) => setDeadlineDate(e.target.value)}
                           className="w-full bg-surface border border-primary-foreground/15 rounded-2xl px-5 py-4 text-xs font-black italic font-display text-foreground outline-none focus:ring-2 focus:ring-primary-foreground/30 transition-all"
                         />
                     </div>
                     <div className="relative">
                         <input 
                           type="time" 
                           value={deadlineTime}
                           disabled={isTermFinalized}
                           onChange={(e) => setDeadlineTime(e.target.value)}
                           className="w-full bg-surface border border-primary-foreground/15 rounded-2xl px-5 py-4 text-xs font-black italic font-display text-foreground outline-none focus:ring-2 focus:ring-primary-foreground/30 transition-all"
                         />
                     </div>
                   </div>
                 </div>

                  <button 
                   onClick={() => {
                      if (isTermFinalized) {
                        if (activeTerm?.id) {
                          unlockTermMutation.mutate(activeTerm.id, {
                            onSuccess: () => {
                              setIsTermFinalized(false);
                              toast.success('Term unlocked. Teachers can now modify grades.');
                            },
                            onError: (error) => {
                              const reason = error?.response?.data?.freezeReason || error?.message || 'Please try again.';
                              toast.error(`Failed to unlock term: ${reason}`);
                            },
                          });
                        } else {
                          setIsTermFinalized(false);
                          toast.success('Term unlocked. Teachers can now modify grades.');
                        }
                      } else {
                        setShowSealConfirm(true);
                      }
                    }}
                  className={cn(
                    "w-full py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3",
                    isTermFinalized 
                      ? "bg-destructive text-primary-foreground shadow-destructive/40" 
                      : "bg-brand-primary text-primary-foreground shadow-brand-primary/40"
                  )}
                 >
                    {isTermFinalized ? <Unlock size={16} /> : <Lock size={16} />}
                    {isTermFinalized ? 'Emergency Unlock Portal' : `Apply Final Seal (Lock ${TERM_DISPLAY[activeTerm?.termNumber] || activeTerm?.termNumber || 'Term'})`}
                 </button>
                 
                 {isTermFinalized && (
                   <p className="text-[9px] font-black text-destructive uppercase tracking-widest text-center mt-6 animate-pulse">
                     Database is currently Read-Only
                   </p>
                 )}
               </div>
            </section>

<section className="bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm">
              <h3 className="text-[12px] font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2 mb-8">
                <AlertTriangle size={18} className="text-warning" />
                System Warnings
              </h3>
              <div className="space-y-4">
                {!showComplianceResult ? (
                  <div className="p-4 rounded-2xl border flex gap-4 items-start bg-muted border-border text-text-secondary">
                    <div className="mt-1"><Info size={14} /></div>
                    <p className="text-[11px] font-bold leading-tight">Run Compliance Suite to generate live diagnostics.</p>
                  </div>
                ) : complianceWarnings.map((w, i) => (
                  <div key={i} className={cn(
                    "p-4 rounded-2xl border flex gap-4 items-start",
                    w.severity === 'high' ? "bg-destructive/10 border-destructive text-destructive" :
                    w.severity === 'low' ? "bg-warning/10 border-warning text-warning" :
                    "bg-brand-primary/10 border-brand-primary text-brand-primary"
                  )}>
                    <div className="mt-1">
                      {w.severity === 'high' ? <ShieldCheck size={14} /> : <Info size={14} />}
                    </div>
                    <p className="text-[11px] font-bold leading-tight">{w.msg}</p>
                  </div>
                ))}
              </div>
              
              <button onClick={runComplianceSuite} className="w-full mt-8 py-4 bg-brand-dark text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-brand-dark/10">
                Run Compliance Suite
              </button>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};
