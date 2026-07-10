import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from '../../components/ui/toast';
import { ObservationSidebar } from '../../components/shared/ObservationSidebar';
import { JustificationPopup } from '../../components/shared/CorrectionMode';
import { useGradingSheetLogic } from './useGradingSheetLogic';
import { GradingSheetHeader } from '../../components/ui/grading-sheet/GradingSheetHeader';
import { StpErrorBanner } from '../../components/ui/grading-sheet/StpErrorBanner';
import { GradingSheetTableHeader } from '../../components/ui/grading-sheet/GradingSheetTableHeader';
import { GradingSheetTableBody } from '../../components/ui/grading-sheet/GradingSheetTableBody';
import { GradingSheetFooter } from '../../components/ui/grading-sheet/GradingSheetFooter';
import { TermSealBanner } from '../../components/ui/grading-sheet/TermSealBanner';
import { teacherService } from '../../services/teacherService';
import { GRADE_SCALE } from '../../constants/grading';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';

// ── Prop-types-free JSdoc for documentation only ─────────────────────────────
/**
 * GradingSheet — thin orchestrator + render.
 *
 * All state ownership (students, UI flags, behavioural maps, edit logic) lives
 * in `useGradingSheetLogic`.  This component is responsible only for composing
 * the layout and wiring up the six sub-components that cover each visual zone.
 *
 * Props:
 *  classInfo         — { id, subject, className, programme, studentCount, form, academicYear }
 *  students          — student mark row array
 *  subjectConfig     — map<subject, { sections, maxRaw, sectionCount, hasPractical, … }>
 *  stpRules          — array of { check, message } rules (optional; DEFAULT_STP_RULES used)
 *  isTermFinalized   — locks all edits
 *  isCorrectionMode  — HOD revision flow
 *  isMissingObsMode  — compliance mode
 *  revisionId        — deep-link target for corrections
 *  targetStudentId   — pre-select a student row on mount
 *  missingObsId      — compliance-mode anchor
 *
 * Exposes GRADE_SCALE via named export.
 */
export function GradingSheet(props) {
  const navigate = useNavigate();
  const logic = useGradingSheetLogic({
    ...props,
    teacherId: props.teacherId,
  });

  const [sidebarSaving, setSidebarSaving] = React.useState(false);

  const {
    // Data
    students,
    setStudents,
    selectedStudent,
    setSelectedStudent,
    // Config
    DISPLAY_CLASS_INFO,
    isCorrectionMode,
    isMissingObsMode,
    isTermFinalized,
    isSubmissionLocked,
    missingCount,
    // UI flags
    submissionStatus,
    isExamExpanded,
    setIsExamExpanded,
    isSidebarOpen,
    setIsSidebarOpen,
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
    // Behavioural
    behavioralRatings,
    behavioralComment,
    flaggedStudents,
    labSafetyCompliance,
    // Business logic
    updateMark,
    handleJustificationSave,
    handleCloseJustificationPopup,
    runSTPValidation,
    handleSaveDraft,
    handleSubmitToHOD,
    handleSaveBehavioralRatings,
    handleExportWAEC,
    updateBehavioralRating,
    updateBehavioralComment,
    updateFlagged,
    updateLabSafety,
    handleRequestRevision,
    showRevisionModal,
    setShowRevisionModal,
    revisionText,
    setRevisionText,
    revisionSubmitting,
    doRequestRevision,
    stpValidating,
    noAssignmentWarning,
  } = logic;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100">
      {noAssignmentWarning && (
        <div className="flex-1 flex items-center justify-center bg-background p-6">
          <div className="max-w-md bg-surface border border-border rounded-2xl shadow-sm p-8 text-center">
            <AlertTriangle size={32} className="text-warning mx-auto mb-4" />
            <h2 className="text-lg font-bold text-text-primary mb-2">Class Access Required</h2>
            <p className="text-sm text-text-secondary mb-4">
              You are not assigned to this class section. Grade entry is restricted to assigned teachers only.
            </p>
            <p className="text-xs text-text-secondary mb-6">
              Use the <strong>Observation Hub</strong> to log behavioral observations for any student in your subject.
            </p>
            <Button onClick={() => navigate('/missing-observations')} className="bg-brand-primary text-white">
              Go to Observation Hub
            </Button>
          </div>
        </div>
      )}

      {!noAssignmentWarning && (
      <div className="flex-1 flex overflow-hidden bg-slate-100">

      {/* ── LEFT / MAIN PANE ── */}
      <div className="flex-1 overflow-y-auto p-6 relative">

        {/* Database-locked seal */}
        {isTermFinalized && <TermSealBanner />}

        <div
          className={`max-w-full mx-auto transition-all duration-300 ${
            isTermFinalized
              ? 'opacity-40 pointer-events-none select-none grayscale'
              : ''
          }`}
        >
          {/* Header */}
          <GradingSheetHeader
            DISPLAY_CLASS_INFO={DISPLAY_CLASS_INFO}
            isCorrectionMode={isCorrectionMode}
            isMissingObsMode={isMissingObsMode}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            runSTPValidation={runSTPValidation}
            missingCount={missingCount}
            isTermFinalized={isTermFinalized}
            onExportWAEC={handleExportWAEC}
            stpValidating={stpValidating}
          />

          {/* STP error overlay */}
          <StpErrorBanner
            showSTPOverlay={showSTPOverlay}
            stpErrors={stpErrors}
            onClose={() => setShowSTPOverlay(false)}
          />

{/* HTML table */}
           <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto">
             <Table className="min-w-[800px]">
               <GradingSheetTableHeader
                 DISPLAY_CLASS_INFO={DISPLAY_CLASS_INFO}
                 isExamExpanded={isExamExpanded}
                 setIsExamExpanded={setIsExamExpanded}
                 isTermFinalized={isTermFinalized}
               />
               <GradingSheetTableBody
                 students={students}
                 selectedStudent={selectedStudent}
                 isCorrectionMode={isCorrectionMode}
                 isMissingObsMode={isMissingObsMode}
                 isTermFinalized={isTermFinalized}
                 targetStudentId={props.targetStudentId}
                 tempMark={tempMark}
                 setTempMark={setTempMark}
                 originalMark={originalMark}
                 updateMark={updateMark}
                 DISPLAY_CLASS_INFO={DISPLAY_CLASS_INFO}
                 showSTPOverlay={showSTPOverlay}
                 isExamExpanded={isExamExpanded}
                 getSmartRemark={(g) => GRADE_SCALE[g]?.label || ''}
                 submissionStatus={submissionStatus}
                 onStudentClick={(student) => {
                   setSelectedStudent(student);
                   setIsSidebarOpen(true);
                 }}
               />
             </Table>
           </div>

          {/* Footer controls */}
          <GradingSheetFooter
            isSubmissionLocked={isSubmissionLocked}
            missingCount={missingCount}
            onSaveDraft={handleSaveDraft}
            onSubmitToHOD={handleSubmitToHOD}
            hasDraftChanges={submissionStatus === 'DRAFT'}
            onRequestRevision={handleRequestRevision}
          />
        </div>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      {isSidebarOpen && (
        <ObservationSidebar
          mode={
            isCorrectionMode ? 'correction' :
            isMissingObsMode ? 'compliance' : 'behavioral'
          }
          student={selectedStudent}
          onClose={() => setIsSidebarOpen(false)}
          ratings={behavioralRatings[selectedStudent?.id] || {}}
          onRatingChange={updateBehavioralRating}
          comment={behavioralComment[selectedStudent?.id] || ''}
          onCommentChange={updateBehavioralComment}
           onSave={async () => {
             if (isTermFinalized || sidebarSaving) return;
             const sid = selectedStudent?.id;
             if (!sid) return;
             const comment = behavioralComment[sid] || '';
             const labSafety = labSafetyCompliance[sid] || false;
             const flagged = flaggedStudents[sid] || false;

             setSidebarSaving(true);
             try {
                if (isMissingObsMode && selectedStudent?.gradeEntryId) {
                  await teacherService.createObservation({
                    gradeEntryId: selectedStudent.gradeEntryId,
                    comment,
                    observationText: comment,
                    labSafety,
                    flagged,
                  });
                   toast.success('Observation saved successfully');
                   setStudents(prev => prev.map(s =>
                     s.id === selectedStudent.id
                       ? { ...s, auditStatus: 'COMPLETE' }
                       : s
                   ));
                   updateFlagged(flagged);
                   updateLabSafety(labSafety);
                 } else if (isMissingObsMode) {
                 toast.error('Cannot save observation: grade entry not found for this student');
               } else {
                 await handleSaveBehavioralRatings();
               }
             } catch (err) {
               console.error('Failed to save observation:', err);
               toast.error(err?.message || 'Failed to save observation');
             } finally {
               setSidebarSaving(false);
             }
           }}
          onFlagChange={updateFlagged}
          isFlagged={flaggedStudents[selectedStudent?.id] || false}
          safetyChecked={labSafetyCompliance[selectedStudent?.id] || false}
          onSafetyCheckChange={updateLabSafety}
          disabled={isTermFinalized}
          saving={sidebarSaving}
        />
      )}

      {/* ── FR3 JUSTIFICATION POPUP ── */}
      <JustificationPopup
        isOpen={showJustificationPopup}
        onClose={handleCloseJustificationPopup}
        justification={justification}
        originalMark={originalMark}
        newValue={valueToUpdate}
        onJustificationChange={setJustification}
        onSave={handleJustificationSave}
      />

      {showRevisionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRevisionModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Request Grade Revision</h3>
              <button
                onClick={() => setShowRevisionModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-xs text-gray-500 font-medium">
                Student: <span className="text-gray-900 font-bold">{selectedStudent?.name || 'N/A'}</span>
                {selectedStudent?.index && <span className="text-gray-400 ml-2">Index: {selectedStudent.index}</span>}
              </p>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Issue / Reason for Revision</label>
                <textarea
                  value={revisionText}
                  onChange={(e) => setRevisionText(e.target.value)}
                  placeholder="Describe what needs to be revised..."
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs font-medium text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                  rows={4}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/40">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={doRequestRevision}
                disabled={!revisionText.trim() || revisionSubmitting}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                {revisionSubmitting ? <span className="animate-pulse">Submitting...</span> : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    )}
    </div>
  );
}
