import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { CorrectionMarkInput } from '../../shared/CorrectionMode';
import { TableBody, TableRow, TableCell } from '../table';

export function GradingSheetTableBody({
   students = [],
   selectedStudent = {},
   isCorrectionMode,
   isMissingObsMode,
   isAtRisk,
   isTermFinalized,
   targetStudentId,
   tempMark,
   originalMark,
   updateMark,
   DISPLAY_CLASS_INFO,
   showSTPOverlay,
   isExamExpanded,
   getSmartRemark,
   submissionStatus,
   onStudentClick
 }) {
   // Dynamic configuration definitions from subject profile metadata
   const sectionCount = DISPLAY_CLASS_INFO?.subjectConfig?.sectionCount || 2;
   const sectionFieldNames = (DISPLAY_CLASS_INFO?.sectionFieldNames || ['secA', 'secB', 'secC']).slice(0, sectionCount);
   const isLocked = isTermFinalized || submissionStatus === 'SUBMITTED' || students.some(s => s.isLocked);

    const isInteractive = (student) => {
      if (isCorrectionMode || isMissingObsMode) {
        return student.id === targetStudentId || student.index === targetStudentId || student.name === targetStudentId;
      }
      if (isLocked) return false;
      if (targetStudentId) {
        return student.id === targetStudentId || student.index === targetStudentId || student.name === targetStudentId;
      }
      return true;
    };

    const getCursorClass = (student) => {
       if (isCorrectionMode || isMissingObsMode) {
         return (student.id === targetStudentId || student.index === targetStudentId || student.name === targetStudentId)
           ? "cursor-pointer"
           : "";
       }
       if (targetStudentId && !isLocked) {
         return (student.id === targetStudentId || student.index === targetStudentId || student.name === targetStudentId)
           ? "cursor-pointer"
           : "";
       }
       if (isLocked) return "cursor-not-allowed";
       return "cursor-pointer";
     };

    const hasTarget = !!targetStudentId;

return (
      <TableBody className="divide-y divide-border bg-surface">
        {students.map((student, idx) => {
          const isSelected = selectedStudent?.id === student.id;
    const isTarget =
      (isCorrectionMode || isMissingObsMode || hasTarget) &&
      (student.id === targetStudentId || student.index === targetStudentId || student.name === targetStudentId);
    const isGhosted = (isCorrectionMode || isMissingObsMode || hasTarget) && !isTarget;
          const isAuditMissing = showSTPOverlay && student.auditStatus === 'MISSING';
          const canInteract = isInteractive(student);

          // Compute calculated weights on dynamically registered fields
          const rowTotal = sectionFieldNames.reduce((sum, key) => sum + (parseFloat(student[key]) || 0), 0);

          return (
            <TableRow
              key={student.id || idx}
              className={cn(
                "transition-colors group content-baseline border-l-4",
                isSelected && isAtRisk ? "bg-destructive/5 border-l-destructive" : isSelected ? "bg-success/5 border-l-success" : "border-l-transparent",
                isGhosted && "opacity-40 pointer-events-none filter saturate-50",
                isAuditMissing && "bg-danger/5 hover:bg-danger/10",
                 isLocked && "bg-muted",
                getCursorClass(student)
              )}
              onClick={() => {
                if (isLocked) return;
                if (canInteract && onStudentClick) {
                  onStudentClick(student);
                }
              }}
            >
              {/* Student ID / Index Column */}
              <TableCell className="px-4 py-3.5 text-xs font-semibold text-text-secondary border-r border-border">
                <div className="flex items-center gap-2">
                  {isAuditMissing && (
                    <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" aria-hidden="true" />
                  )}
                  {student.index}
                </div>
              </TableCell>

              {/* Student Name Column */}
              <TableCell className="px-4 py-3.5 text-xs font-medium text-text-primary border-r border-border">
                {student.name}
              </TableCell>
              
              {/* Standard Compressed SBA Display Column */}
              {!isExamExpanded && (
                <TableCell className="px-4 py-2 border-r border-border text-center w-28">
                  <input 
                    type="number" 
                    value={student.sba ?? ''} 
                    disabled={isLocked}
                    readOnly={isLocked}
                    onBlur={(e) => {
                      if (e.target.value === '' || e.target.value === null) {
                        updateMark(student.id, 'sba', 0);
                      }
                    }}
                    onChange={(e) => updateMark(student.id, 'sba', e.target.value)} 
                     className={`w-16 px-1 py-1 text-center text-xs font-medium rounded border transition-all ${
                       isLocked
                         ? 'bg-muted text-muted-foreground cursor-not-allowed border-border'
                         : 'bg-transparent text-text-primary border-transparent focus:border-border focus:bg-surface focus:outline-none focus:ring-2 focus:ring-muted'
                     }`}
                  />
                </TableCell>
              )}
              
              {/* Dynamic Section-Based Layout Mapping Engine */}
              {isExamExpanded && (
                <>
                  {sectionFieldNames.map((fieldName) => {
                    // Intercept and load Correction Input context explicitly on Section B targets
                    if (fieldName === 'secB' && isCorrectionMode) {
                      return (
                        <TableCell 
                          key={fieldName}
                          className={cn(
                            "px-4 py-2 border-r border-border text-center transition-all w-24", 
                             isTarget ? "bg-danger/5 ring-2 ring-danger ring-inset" : "bg-muted/30"
                          )}
                        >
                          <CorrectionMarkInput
                            student={student}
                            isTarget={isTarget}
                            tempMark={tempMark}
                            originalMark={originalMark}
                            onMarkChange={updateMark}
                            isTermFinalized={isTermFinalized}
                          />
                        </TableCell>
                      );
                    }

                     // Generic Dynamic Score Entry Cell
                     return (
                        <TableCell key={fieldName} className="px-4 py-2 border-r border-border text-center bg-muted/30 w-24">
                         <input 
                           type="number" 
                           value={student[fieldName] ?? student.sba ?? ''} 
                           disabled={isLocked}
                           readOnly={isLocked}
                           onBlur={(e) => {
                             if (e.target.value === '' || e.target.value === null) {
                               updateMark(student.id, fieldName, 0);
                             }
                           }}
                           onChange={(e) => updateMark(student.id, fieldName, e.target.value)} 
                            className={`w-16 px-1 py-1 text-center text-xs font-semibold rounded border transition-all ${
                              isLocked
                                ? 'bg-muted text-muted-foreground cursor-not-allowed border-border'
                                : 'bg-transparent text-text-primary border-transparent focus:border-border focus:bg-surface focus:outline-none focus:ring-2 focus:ring-muted'
                            }`}
                         />
                       </TableCell>
                     );
                  })}

                  {/* Cumulative Section Component Raw Total Weight */}
                  <TableCell className="px-4 py-3.5 text-xs font-bold text-text-primary border-r border-border text-center bg-muted/40 w-24">
                    {rowTotal}
                  </TableCell>
                </>
              )}

              {/* Aggregated Final Base Exam Summary Input */}
               <TableCell className="px-4 py-2 border-r border-border text-center w-36">
                <input 
                  type="number" 
                  value={student.exam ?? ''} 
                  disabled={isLocked}
                  readOnly={isLocked}
                  onBlur={(e) => {
                    if (e.target.value === '' || e.target.value === null) {
                      updateMark(student.id, 'exam', 0);
                    }
                  }}
                  onChange={(e) => updateMark(student.id, 'exam', e.target.value)} 
                   className={`w-16 px-1 py-1 text-center text-xs font-bold rounded border transition-all ${
                     isLocked
                       ? 'bg-muted text-muted-foreground cursor-not-allowed border-border'
                       : 'bg-transparent text-text-primary border-transparent focus:border-border focus:bg-surface focus:outline-none focus:ring-2 focus:ring-muted'
                   }`}
                />
              </TableCell>

              {/* Calculated Structural Metrics Outlets */}
              <TableCell className="px-4 py-3.5 text-xs font-bold text-text-primary border-r border-border text-center w-20 bg-muted/20">
                {student.final}
              </TableCell>
              
              <TableCell className="px-4 py-3.5 text-xs font-bold text-success border-r border-border text-center w-20 bg-success/10">
                {student.grade}
              </TableCell>

              {/* Realtime Smart Administrative Remark Output */}
              <TableCell className="px-6 py-3.5 align-middle">
                <div className="flex items-center gap-2 group/remark min-h-[20px]">
                  <Sparkles 
                    size={13} 
                    className="text-warning shrink-0 opacity-0 group-hover/remark:opacity-100 transition-opacity duration-200" 
                  />
                  <p className="text-xs font-semibold text-text-secondary italic tracking-wide uppercase leading-tight max-w-xs truncate">
                    {student.remark || getSmartRemark?.(student.grade) || 'No Remark'}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    );
}