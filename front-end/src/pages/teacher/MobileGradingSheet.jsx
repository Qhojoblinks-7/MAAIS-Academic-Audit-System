import React, { useState, useRef } from 'react';
import { ChevronLeft, Save, Send, ShieldCheck, Lock, Sparkles, ChevronDown, ChevronUp, Download, Loader2, X, CheckCircle2, AlertTriangle, Smartphone } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useGradingSheetLogic } from '../shared/useGradingSheetLogic';
import { teacherService } from '../../services';
import { toast } from '../../components/ui/toast';
import { GRADE_SCALE } from '../../constants/grading';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

function getGradeColor(grade) {
  if (!grade) return 'bg-muted text-muted-foreground';
  if (['A1', 'B2'].includes(grade)) return 'bg-success/10 text-success border-success/20';
  if (['B3', 'C4', 'C5'].includes(grade)) return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
  if (['C6', 'D7'].includes(grade)) return 'bg-warning/10 text-warning border-warning/20';
  return 'bg-destructive/10 text-destructive border-destructive/20';
}

function getGradeLabel(grade) {
  return GRADE_SCALE[grade]?.label || '';
}

export function MobileGradingSheet(props) {
  const navigate = useNavigate();
  const [isObsOpen, setIsObsOpen] = useState(false);
  const [selectedStudentForObs, setSelectedStudentForObs] = useState(null);
  const [sidebarSaving, setSidebarSaving] = useState(false);
  const listRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    students,
    setStudents,
    selectedStudent,
    setSelectedStudent,
    DISPLAY_CLASS_INFO,
    isCorrectionMode,
    isMissingObsMode,
    isAtRisk,
    isTermFinalized,
    isSubmissionLocked,
    missingCount,
    submissionStatus,
    setIsExamExpanded,
    isExamExpanded,
    tempMark,
    setTempMark,
    showSTPOverlay,
    stpErrors,
    setShowSTPOverlay,
    showJustificationPopup,
    justification,
    setJustification,
    fieldToUpdate,
    studentToUpdate,
    originalMark,
    valueToUpdate,
    behavioralRatings,
    behavioralComment,
    flaggedStudents,
    labSafetyCompliance,
    updateMark,
    handleJustificationSave,
    handleCloseJustificationPopup,
    runSTPValidation,
    handleSaveDraft,
    handleSubmitToHOD,
    handleRequestRevision,
    showRevisionModal,
    setShowRevisionModal,
    revisionText,
    setRevisionText,
    revisionSubmitting,
    doRequestRevision,
    handleSaveBehavioralRatings,
    handleExportWAEC,
    stpValidating,
    autosaveStatus,
    lastSavedAt,
    updateBehavioralRating,
    updateBehavioralComment,
    updateFlagged,
    updateLabSafety,
    calculateScores,
  } = useGradingSheetLogic({
    ...props,
    teacherId: props.teacherId,
    isAtRisk: props.isAtRisk,
  });

  const subjectConfig = DISPLAY_CLASS_INFO?.subjectConfig || {};
  const activeSections = DISPLAY_CLASS_INFO?.activeSections || [];
  const sectionFieldNames = (DISPLAY_CLASS_INFO?.sectionFieldNames || ['secA', 'secB', 'secC']).slice(0, (subjectConfig?.sectionCount || 2));
  const isLocked = isTermFinalized || submissionStatus === 'SUBMITTED';

  const handleStudentTap = (student) => {
    if (isLocked) return;
    setSelectedStudent(student);
    setIsObsOpen(true);
  };

  const handleObsSave = async () => {
    if (isTermFinalized || sidebarSaving) return;
    const sid = selectedStudentForObs?.id;
    if (!sid) return;
    const comment = behavioralComment[sid] || '';
    const labSafety = labSafetyCompliance[sid] || false;
    const flagged = flaggedStudents[sid] || false;

    setSidebarSaving(true);
    try {
      await handleSaveBehavioralRatings();
      toast.success('Observation saved');
    } catch (err) {
      toast.error(err?.message || 'Failed to save observation');
    } finally {
      setSidebarSaving(false);
    }
  };

  const handleSaveDraftMobile = async () => {
    if (isTermFinalized) return;
    await handleSaveDraft();
  };

  const handleSubmitMobile = async () => {
    if (isTermFinalized || missingCount > 0) return;
    setIsSubmitting(true);
    try {
      await handleSubmitToHOD();
      toast.success('Submitted to HOD');
    } catch (err) {
      toast.error(err?.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportMobile = () => {
    handleExportWAEC();
  };

  const handleSTPMobile = () => {
    runSTPValidation();
  };

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 py-3 shrink-0 sticky top-0 z-20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-transform"
            >
              <ChevronLeft size={18} className="text-primary" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-black text-primary truncate leading-tight">
                {DISPLAY_CLASS_INFO?.subject}
              </h1>
              <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest truncate">
                {DISPLAY_CLASS_INFO?.className} • {DISPLAY_CLASS_INFO?.studentCount} Students
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleSTPMobile}
              disabled={stpValidating || isTermFinalized}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                stpValidating || isTermFinalized
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-brand-primary/10 text-brand-primary active:scale-95"
              )}
              aria-label="STP"
            >
              {stpValidating ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            </button>
            <button
              type="button"
              onClick={handleExportMobile}
              disabled={isSubmissionLocked}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                isSubmissionLocked
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-success/10 text-success active:scale-95"
              )}
              aria-label="Export WAEC"
            >
              <Download size={16} />
            </button>
            {isTermFinalized && (
              <span className="px-2 py-1 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-wider rounded-lg shrink-0">
                Locked
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Autosave indicator */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border flex items-center justify-between shrink-0">
        <span className="text-[10px] font-bold text-muted-foreground">
          {autosaveStatus === 'saving' && 'Saving...'}
          {autosaveStatus === 'saved' && lastSavedAt && `Saved at ${lastSavedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
          {autosaveStatus === 'idle' && 'Ready'}
          {autosaveStatus === 'error' && 'Save error — changes kept locally'}
          {autosaveStatus === 'locked' && 'Term finalized — records locked'}
        </span>
        <span className="text-[10px] font-black text-success uppercase tracking-widest">
          {submissionStatus === 'SUBMITTED' ? 'Submitted' : submissionStatus === 'DRAFT' ? 'Draft' : 'Editing'}
        </span>
      </div>

      {/* Student List */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-24">
        {students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Smartphone size={48} className="text-secondary mb-4" />
            <h3 className="text-lg font-black text-primary mb-2">No Students</h3>
            <p className="text-sm font-bold text-secondary">No students assigned to this class.</p>
          </div>
        )}

        {students.map((student, idx) => {
          const sba = Math.min(parseFloat(student.sba) || 0, 30);
          const exam = Math.min(parseFloat(student.exam) || 0, 70);
          const final = Math.round(sba + exam);
          let grade = 'F9';
          if (final >= 80) grade = 'A1';
          else if (final >= 70) grade = 'B2';
          else if (final >= 65) grade = 'B3';
          else if (final >= 60) grade = 'C4';
          else if (final >= 55) grade = 'C5';
          else if (final >= 50) grade = 'C6';
          else if (final >= 45) grade = 'D7';
          else if (final >= 40) grade = 'E8';

          const remark = student.remark || getGradeLabel(grade) || 'No Remark';
          const isSelected = selectedStudent?.id === student.id;
          const studentLocked = isLocked || student.isLocked;

          return (
            <motion.div
              key={student.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all",
                isSelected && "ring-2 ring-success ring-offset-1",
                student.auditStatus === 'MISSING' && "border-warning/30"
              )}
            >
              {/* Card Header - Tappable */}
              <div
                onClick={() => handleStudentTap(student)}
                className="p-4 flex items-center gap-3 active:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-black",
                  isSelected ? "bg-success text-background" : "bg-muted text-primary"
                )}>
                  {student.index || idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-foreground truncate">{student.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                    {remark}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-lg font-black px-2.5 py-1 rounded-lg border", getGradeColor(grade))}>
                    {grade}
                  </span>
                  {isObsOpen && isSelected ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>
              </div>

              {/* Expandable Grade Inputs */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-border/50 space-y-3">
                      {/* SBA Input */}
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest w-20 shrink-0">
                          {subjectConfig?.sbaLabel || 'SBA (30%)'}
                        </label>
                        <input
                          type="number"
                          value={student.sba ?? ''}
                          disabled={studentLocked}
                          onChange={(e) => updateMark(student.id, 'sba', e.target.value)}
                          className={cn(
                            "flex-1 px-3 py-2.5 rounded-xl border text-sm font-bold text-center transition-all",
                            studentLocked
                              ? "bg-muted text-muted-foreground cursor-not-allowed border-border"
                              : "bg-surface border-border focus:border-success focus:ring-2 focus:ring-success/20 text-foreground"
                          )}
                          placeholder="0"
                          inputMode="numeric"
                        />
                      </div>

                      {/* Section inputs when expanded */}
                      {isExamExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2"
                        >
                          {sectionFieldNames.map((fieldName, idx) => (
                            <div key={fieldName} className="flex items-center gap-3">
                              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest w-20 shrink-0">
                                {activeSections[idx] || `Section ${idx + 1}`}
                              </label>
                              <input
                                type="number"
                                value={student[fieldName] ?? ''}
                                disabled={studentLocked}
                                onChange={(e) => updateMark(student.id, fieldName, e.target.value)}
                                className={cn(
                                  "flex-1 px-3 py-2.5 rounded-xl border text-sm font-bold text-center transition-all",
                                  studentLocked
                                    ? "bg-muted text-muted-foreground cursor-not-allowed border-border"
                                    : "bg-surface border-border focus:border-success focus:ring-2 focus:ring-success/20 text-foreground"
                                )}
                                placeholder="0"
                                inputMode="numeric"
                              />
                            </div>
                          ))}
                          <div className="flex items-center gap-3">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest w-20 shrink-0">
                              Total
                            </label>
                            <div className="flex-1 px-3 py-2.5 rounded-xl bg-muted text-sm font-black text-center text-muted-foreground">
                              {sectionFieldNames.reduce((sum, key) => sum + (parseFloat(student[key]) || 0), 0)}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Exam Input */}
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest w-20 shrink-0">
                          {subjectConfig?.examLabel || 'Exam (70%)'}
                        </label>
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            value={student.exam ?? ''}
                            disabled={studentLocked}
                            onChange={(e) => updateMark(student.id, 'exam', e.target.value)}
                            className={cn(
                              "w-full px-3 py-2.5 rounded-xl border text-sm font-bold text-center transition-all",
                              studentLocked
                                ? "bg-muted text-muted-foreground cursor-not-allowed border-border"
                                : "bg-surface border-border focus:border-success focus:ring-2 focus:ring-success/20 text-foreground"
                            )}
                            placeholder="0"
                            inputMode="numeric"
                          />
                          <button
                            type="button"
                            onClick={() => setIsExamExpanded(!isExamExpanded)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-success transition-colors p-1"
                          >
                            {isExamExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Final & Grade Display */}
                      <div className="flex items-center gap-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest w-20 shrink-0">
                          Final
                        </label>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 px-3 py-2.5 rounded-xl bg-muted/50 text-sm font-black text-center text-foreground">
                            {final}
                          </div>
                          <div className={cn("px-3 py-2.5 rounded-xl border text-sm font-black", getGradeColor(grade))}>
                            {grade}
                          </div>
                        </div>
                      </div>

                      {/* Observation Button */}
                      <button
                        onClick={() => handleStudentTap(student)}
                        className={cn(
                          "w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                          student.auditStatus === 'MISSING'
                            ? "bg-warning/10 text-warning border border-warning/20"
                            : "bg-success/10 text-success border border-success/20"
                        )}
                      >
                        {student.auditStatus === 'MISSING' ? (
                          <><AlertTriangle size={12} /> Log Observation</>
                        ) : (
                          <><CheckCircle2 size={12} /> View Observation</>
                        )}
                       </button>
              </div>
            </motion.div>
          )}
         </AnimatePresence>
            </motion.div>
          );
        })}
       </div>

      {/* Bottom Action Bar */}
      {!isTermFinalized && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-4 py-3 z-30 pb-safe">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraftMobile}
              disabled={isSubmissionLocked}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                isSubmissionLocked
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-muted border border-border text-foreground"
              )}
            >
              <Save size={14} /> Save Draft
            </button>
            <button
              onClick={handleSubmitMobile}
              disabled={isSubmissionLocked || missingCount > 0}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                isSubmissionLocked || missingCount > 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-success text-background shadow-lg shadow-success/20"
              )}
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          {missingCount > 0 && (
            <p className="text-[10px] font-bold text-warning text-center mt-2 uppercase tracking-wider">
              {missingCount} observation{missingCount !== 1 ? 's' : ''} missing
            </p>
          )}
        </div>
      )}

      {/* Term Finalized Overlay */}
      {isTermFinalized && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface rounded-3xl border border-border shadow-2xl p-6 text-center max-w-sm">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 bg-destructive/10 text-destructive">
              <Lock size={28} />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">Term Finalized</h3>
            <p className="text-xs font-medium text-muted-foreground mb-4">
              Database records are locked. Grade entry is no longer available for this term.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 bg-muted border border-border rounded-xl text-xs font-black uppercase tracking-widest text-foreground"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* Observation Bottom Sheet */}
      <AnimatePresence>
        {isObsOpen && selectedStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setIsObsOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-[2rem] border-t border-border shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-base font-black text-foreground">
                    {isMissingObsMode ? 'Guided Observation' : isCorrectionMode ? 'Correction Bridge' : 'Behavioral Observation'}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground mt-0.5">
                    {selectedStudent.name} • Index {selectedStudent.index}
                  </p>
                </div>
                <button
                  onClick={() => setIsObsOpen(false)}
                  className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-muted-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Student Avatar */}
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedStudent.name || 'default')}`}
                  alt=""
                  className="w-12 h-12 rounded-full bg-success/10 border-2 border-background shadow-md object-cover"
                />
                <div>
                  <p className="text-sm font-black text-foreground">{selectedStudent.name}</p>
                  <p className="text-xs font-bold text-muted-foreground">Index: {selectedStudent.index}</p>
                </div>
              </div>

              {/* Ratings */}
              <div className="space-y-4">
                {[
                  { label: 'Lab Safety', id: 'lab_safety', desc: 'Workshop safety & PPE' },
                  { label: 'Behavioral', id: 'behavioral', desc: 'Punctuality & conduct' },
                  { label: 'Resource Economy', id: 'resource_economy', desc: 'Material conservation' },
                  { label: 'Hygienic Practices', id: 'hygienic_practices', desc: 'Personal & workspace hygiene' },
                ].map((rating) => (
                  <div key={rating.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-foreground uppercase tracking-tight">{rating.label}</span>
                      <span className="text-[10px] font-medium text-muted-foreground">{rating.desc}</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => {
                        const currentRating = behavioralRatings[selectedStudent.id]?.[rating.id];
                        const isActive = currentRating === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => updateBehavioralRating(rating.id, num)}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl border-2 text-xs font-black transition-all active:scale-95",
                              isActive
                                ? "bg-success border-success text-background shadow-md"
                                : "border-border text-text-secondary hover:border-success hover:text-success"
                            )}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Safety & Status */}
              <div className="space-y-3 pt-3 border-t border-border">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => updateLabSafety(!labSafetyCompliance[selectedStudent.id])}
                    className={cn(
                      "w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all shrink-0",
                      labSafetyCompliance[selectedStudent.id] ? "bg-success border-success" : "border-border"
                    )}
                  >
                    {labSafetyCompliance[selectedStudent.id] && <CheckCircle2 size={14} className="text-background" />}
                  </div>
                  <span className="text-xs font-bold text-foreground">Lab Safety Compliant</span>
                </label>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    Flag for Review
                  </span>
                  <button
                    type="button"
                    onClick={() => updateFlagged(!flaggedStudents[selectedStudent.id])}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative p-1 shrink-0",
                      flaggedStudents[selectedStudent.id] ? "bg-destructive" : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full shadow-md transition-all",
                      flaggedStudents[selectedStudent.id] ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2 pt-3 border-t border-border">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Observation Note</label>
                <textarea
                  value={behavioralComment[selectedStudent.id] || ''}
                  onChange={(e) => updateBehavioralComment(e.target.value)}
                  placeholder="Add observation notes..."
                  className="w-full h-24 bg-muted border border-border rounded-xl p-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/20 resize-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="px-5 py-3 border-t border-border bg-surface shrink-0 pb-safe">
              <button
                onClick={handleObsSave}
                disabled={isTermFinalized || sidebarSaving}
                className={cn(
                  "w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                  isTermFinalized || sidebarSaving
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-success text-background shadow-lg shadow-success/20"
                )}
              >
                {sidebarSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {sidebarSaving ? 'Saving...' : 'Save Observation'}
              </button>
             </div>
           </motion.div>
           </>
         )}
       </AnimatePresence>

       {/* STP Error Overlay */}
      <AnimatePresence>
        {showSTPOverlay && stpErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <div className="bg-surface rounded-3xl border border-destructive/20 shadow-2xl p-6 max-w-sm w-full">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-destructive/10 text-destructive">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-black text-foreground text-center mb-2">STP Validation Issues</h3>
              <ul className="space-y-2 mb-4">
                {stpErrors.map((err, i) => (
                  <li key={i} className="text-xs font-medium text-destructive flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowSTPOverlay(false)}
                className="w-full py-3 bg-muted border border-border rounded-xl text-xs font-black uppercase tracking-widest text-foreground"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Justification Popup */}
      <AnimatePresence>
        {showJustificationPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <div className="bg-surface rounded-3xl border border-border shadow-2xl p-6 max-w-sm w-full">
              <h3 className="text-base font-black text-foreground mb-2">Justification Required</h3>
              <p className="text-xs font-medium text-muted-foreground mb-3">
                You are correcting a submitted grade. Please provide a reason.
              </p>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Enter justification..."
                className="w-full h-24 bg-muted border border-border rounded-xl p-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCloseJustificationPopup}
                  className="flex-1 py-2.5 bg-muted border border-border rounded-xl text-xs font-black uppercase tracking-widest text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJustificationSave}
                  disabled={!justification.trim()}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest",
                    justification.trim()
                      ? "bg-brand-primary text-background"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revision Modal */}
      <AnimatePresence>
        {showRevisionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <div className="bg-surface rounded-3xl border border-border shadow-2xl p-6 max-w-sm w-full">
              <h3 className="text-base font-black text-foreground mb-2">Request Grade Revision</h3>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Student: <span className="font-bold text-foreground">{selectedStudent?.name || 'N/A'}</span>
              </p>
              <textarea
                value={revisionText}
                onChange={(e) => setRevisionText(e.target.value)}
                placeholder="Describe what needs to be revised..."
                className="w-full h-32 bg-muted border border-border rounded-xl p-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRevisionModal(false)}
                  className="flex-1 py-2.5 bg-muted border border-border rounded-xl text-xs font-black uppercase tracking-widest text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={doRequestRevision}
                  disabled={!revisionText.trim() || revisionSubmitting}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest",
                    revisionText.trim() && !revisionSubmitting
                      ? "bg-amber-600 text-white"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {revisionSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MobileGradingSheet;
