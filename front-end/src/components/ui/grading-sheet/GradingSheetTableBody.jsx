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
   const isLocked = isTermFinalized || submissionStatus === 'SUBMITTED';

   const isInteractive = (student) => {
     if (isCorrectionMode || isMissingObsMode) {
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
     return "cursor-pointer";
   };

return (
      <TableBody className="divide-y divide-slate-100 bg-surface">
        {students.map((student, idx) => {
          const isSelected = selectedStudent?.id === student.id;
          const isTarget =
            (isCorrectionMode || isMissingObsMode) &&
            (student.id === targetStudentId || student.index === targetStudentId || student.name === targetStudentId);
          const isGhosted = (isCorrectionMode || isMissingObsMode) && !isTarget;
          const isAuditMissing = showSTPOverlay && student.auditStatus === 'MISSING';
          const canInteract = isInteractive(student);

          // Compute calculated weights on dynamically registered fields
          const rowTotal = sectionFieldNames.reduce((sum, key) => sum + (parseFloat(student[key]) || 0), 0);

          return (
            <TableRow
              key={student.id || idx}
              className={cn(
                "transition-colors group content-baseline",
                isSelected ? "bg-slate-50" : "hover:bg-slate-50/60",
                isGhosted && "opacity-40 pointer-events-none filter saturate-50",
                isAuditMissing && "bg-danger/5 hover:bg-danger/10",
                getCursorClass(student)
              )}
              onClick={() => {
                if (canInteract && onStudentClick) {
                  onStudentClick(student);
                }
              }}
            >
              {/* Student ID / Index Column */}
              <TableCell className="px-4 py-3.5 text-[10px] font-semibold text-text-secondary border-r border-slate-100">
                <div className="flex items-center gap-2">
                  {isAuditMissing && (
                    <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" aria-hidden="true" />
                  )}
                  {student.index}
                </div>
              </TableCell>

              {/* Student Name Column */}
              <TableCell className="px-4 py-3.5 text-[11px] font-medium text-text-primary border-r border-slate-100">
                {student.name}
              </TableCell>
              
              {/* Standard Compressed SBA Display Column */}
              {!isExamExpanded && (
                <TableCell className="px-4 py-2 border-r border-slate-100 text-center w-28">
                  <input 
                    type="number" 
                    value={student.sba ?? ''} 
                    disabled={isLocked}
                    onBlur={(e) => {
                      if (e.target.value === '' || e.target.value === null) {
                        updateMark(student.id, 'sba', 0);
                      }
                    }}
                    onChange={(e) => updateMark(student.id, 'sba', e.target.value)} 
                    className="w-16 px-1 py-1 bg-transparent text-center text-[11px] font-medium text-text-primary rounded border border-transparent transition-all focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" 
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
                            "px-4 py-2 border-r border-slate-100 text-center transition-all w-24", 
                            isTarget ? "bg-danger/5 ring-2 ring-danger ring-inset" : "bg-slate-50/30"
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
                      <TableCell key={fieldName} className="px-4 py-2 border-r border-slate-100 text-center bg-slate-50/30 w-24">
                        <input 
                          type="number" 
                          value={student[fieldName] ?? ''} 
                          disabled={isLocked}
                          onBlur={(e) => {
                            if (e.target.value === '' || e.target.value === null) {
                              updateMark(student.id, fieldName, 0);
                            }
                          }}
                          onChange={(e) => updateMark(student.id, fieldName, e.target.value)} 
                          className="w-16 px-1 py-1 bg-transparent text-center text-[11px] font-semibold text-text-primary rounded border border-transparent transition-all focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" 
                        />
                      </TableCell>
                    );
                  })}

                  {/* Cumulative Section Component Raw Total Weight */}
                  <TableCell className="px-4 py-3.5 text-[11px] font-bold text-text-primary border-r border-slate-100 text-center bg-slate-100/40 w-24">
                    {rowTotal}
                  </TableCell>
                </>
              )}

              {/* Aggregated Final Base Exam Summary Input */}
              <TableCell className="px-4 py-2 border-r border-slate-100 text-center w-36">
                <input 
                  type="number" 
                  value={student.exam ?? ''} 
                  disabled={isLocked}
                  onBlur={(e) => {
                    if (e.target.value === '' || e.target.value === null) {
                      updateMark(student.id, 'exam', 0);
                    }
                  }}
                  onChange={(e) => updateMark(student.id, 'exam', e.target.value)} 
                  className="w-16 px-1 py-1 bg-transparent text-center text-[11px] font-bold text-text-primary rounded border border-transparent transition-all focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" 
                />
              </TableCell>

              {/* Calculated Structural Metrics Outlets */}
              <TableCell className="px-4 py-3.5 text-[11px] font-bold text-text-primary border-r border-slate-100 text-center w-20 bg-slate-50/20">
                {student.final}
              </TableCell>
              
              <TableCell className="px-4 py-3.5 text-[11px] font-bold text-success border-r border-slate-100 text-center w-20 bg-success/10">
                {student.grade}
              </TableCell>

              {/* Realtime Smart Administrative Remark Output */}
              <TableCell className="px-6 py-3.5 align-middle">
                <div className="flex items-center gap-2 group/remark min-h-[20px]">
                  <Sparkles 
                    size={13} 
                    className="text-warning shrink-0 opacity-0 group-hover/remark:opacity-100 transition-opacity duration-200" 
                  />
                  <p className="text-[11px] font-semibold text-text-secondary italic tracking-wide uppercase leading-tight max-w-xs truncate">
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