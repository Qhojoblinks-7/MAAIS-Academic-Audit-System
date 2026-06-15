import React from 'react';
import { ObservationSidebar } from '../../components/shared/ObservationSidebar';
import { JustificationPopup } from '../../components/shared/CorrectionMode';
import { useGradingSheetLogic } from './useGradingSheetLogic';
import { GradingSheetHeader } from '../../components/ui/grading-sheet/GradingSheetHeader';
import { StpErrorBanner } from '../../components/ui/grading-sheet/StpErrorBanner';
import { GradingSheetTableHeader } from '../../components/ui/grading-sheet/GradingSheetTableHeader';
import { GradingSheetTableBody } from '../../components/ui/grading-sheet/GradingSheetTableBody';
import { GradingSheetFooter } from '../../components/ui/grading-sheet/GradingSheetFooter';
import { TermSealBanner } from '../../components/ui/grading-sheet/TermSealBanner';
import { GRADE_SCALE } from '../../constants/grading';
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
  const logic = useGradingSheetLogic({
    ...props,
    teacherId: props.teacherId,
  });

  const {
    // Data
    students,
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
    handleExportWAEC,
    updateBehavioralRating,
    updateBehavioralComment,
    updateFlagged,
    updateLabSafety,
  } = logic;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100">

      {/* ── LEFT / MAIN PANE ── */}
      <div className="flex-1 overflow-y-auto p-6 relative">

        {/* Database-locked seal */}
        {isTermFinalized && <TermSealBanner />}

        <div
          className={`max-w-full mx-auto transition-all duration-300 ${
            isTermFinalized ? 'opacity-75 pointer-events-none select-none' : ''
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
          onSave={() => {
            if (isTermFinalized) return;
            const sid = selectedStudent?.id;
            if (!sid) return;
            console.log('[WAEC STP §7] Behavioral ratings saved:', sid, {
              ratings: behavioralRatings[sid] || {},
              comment: behavioralComment[sid] || '',
              flagged: flaggedStudents[sid] || false,
              labSafetyCompliant: labSafetyCompliance[sid] || false,
            });
          }}
          onFlagChange={updateFlagged}
          safetyChecked={labSafetyCompliance[selectedStudent?.id] || false}
          onSafetyCheckChange={updateLabSafety}
        />
      )}

      {/* ── FR3 JUSTIFICATION POPUP ── */}
      <JustificationPopup
        isOpen={showJustificationPopup}
        onClose={handleCloseJustificationPopup}
        justification={justification}
        originalMark={originalMark}
        newValue={fieldToUpdate}
        onJustificationChange={setJustification}
        onSave={handleJustificationSave}
      />
    </div>
  );
}
