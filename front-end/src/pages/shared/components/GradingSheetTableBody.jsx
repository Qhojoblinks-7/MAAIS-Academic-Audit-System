import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CorrectionMarkInput } from '../../../components/shared/CorrectionMode';

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
   const sectionCount = DISPLAY_CLASS_INFO?.subjectConfig?.sectionCount || 2;
   const sectionFieldNames = (DISPLAY_CLASS_INFO?.sectionFieldNames || ['secA', 'secB', 'secC']).slice(0, sectionCount);
   const isLocked = isTermFinalized || submissionStatus === 'SUBMITTED';

  const isInteractive = (student) => {
    if (isCorrectionMode) {
      return student.id === targetStudentId || student.index === targetStudentId || student.name === targetStudentId;
    }
    if (isMissingObsMode) {
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
    <tbody className="divide-y divide-slate-100 bg-white">
      {students.map((student, idx) => {
        const isSelected = selectedStudent?.id === student.id;
        const isTarget =
          (isCorrectionMode || isMissingObsMode) &&
          (student.id === targetStudentId || student.index === targetStudentId || student.name === targetStudentId);
        const isGhosted = (isCorrectionMode || isMissingObsMode) && !isTarget;
        const isAuditMissing = showSTPOverlay && student.auditStatus === 'MISSING';
        const canInteract = isInteractive(student);

        const sectionKeys = sectionFieldNames;
        // WAEC STP FR2 milestone fields are dynamic via sectionFieldNames;
        // totalRaw sums whichever fields are active for the current subject.
        const rowTotal = sectionKeys.reduce((sum, key) => sum + (parseFloat(student[key]) || 0), 0);

        return (
          <tr
            key={student.id || idx}
            className={cn(
              "transition-colors group content-baseline",
              isSelected ? "bg-slate-50" : "hover:bg-slate-50/60",
              isGhosted && "opacity-40 pointer-events-none filter saturate-50",
              isAuditMissing && "bg-red-50/50 hover:bg-red-50",
              getCursorClass(student)
            )}
            onClick={() => {
              if (canInteract && onStudentClick) {
                onStudentClick(student);
              }
            }}
          >
            {/* Student ID / Index Column */}
            <td className="px-4 py-3.5 text-[10px] font-semibold text-slate-700 border-r border-slate-100">
              <div className="flex items-center gap-2">
                {isAuditMissing && (
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
                )}
                {student.index}
              </div>
            </td>

            {/* Student Name Column */}
            <td className="px-4 py-3.5 text-[11px] font-medium text-slate-900 border-r border-slate-100">
              {student.name}
            </td>
            
{/* Standard Compressed SBA Display Column */}
             {!isExamExpanded && (
               <td className="px-4 py-2 border-r border-slate-100 text-center w-28">
                 <input 
                   type="number" 
                   value={student.sba ?? ''} 
                   disabled={isLocked}
                   onBlur={(e) => {
                     // NaN-on-blank double-guard: write 0 if field is empty (WAEC STP T-AR-1.2)
                     if (e.target.value === '' || e.target.value === null) {
                       updateMark(student.id, 'sba', 0);
                     }
                   }}
                   onChange={(e) => updateMark(student.id, 'sba', e.target.value)} 
                   className="w-16 px-1 py-1 bg-transparent text-center text-[11px] font-medium text-slate-800 rounded border border-transparent transition-all focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" 
                 />
               </td>
             )}
            
            {/* Expanded Analytical Exam Components Columns */}
            {isExamExpanded && (
              <>
{/* Section A */}
                 <td className="px-4 py-2 border-r border-slate-100 text-center bg-slate-50/30 w-24">
                   <input 
                     type="number" 
                     value={student.secA ?? ''} 
                     disabled={isLocked}
                     onBlur={(e) => {
                       if (e.target.value === '' || e.target.value === null) {
                         updateMark(student.id, 'secA', 0);
                       }
                     }}
                     onChange={(e) => updateMark(student.id, 'secA', e.target.value)} 
                     className="w-16 px-1 py-1 bg-transparent text-center text-[11px] font-semibold text-slate-800 rounded border border-transparent transition-all focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" 
                   />
                 </td>

                {/* Section B / Dynamic Critical Correction Target Cell */}
                <td className={cn(
                  "px-4 py-2 border-r border-slate-100 text-center transition-all w-24", 
                  isTarget && isCorrectionMode ? "bg-red-50/80 ring-2 ring-red-500 ring-inset" : "bg-slate-50/30"
                )}>
                  <CorrectionMarkInput
                    student={student}
                    isTarget={isTarget && isCorrectionMode}
                    tempMark={tempMark}
                    originalMark={originalMark}
                    onMarkChange={updateMark}
                    isTermFinalized={isTermFinalized}
                  />
                </td>
                
{/* Optional Section C */}
                   {sectionCount === 3 && (
                     <td className="px-4 py-2 border-r border-slate-100 text-center bg-slate-50/30 w-24">
                       <input 
                         type="number" 
                         value={student.secC ?? ''} 
                         disabled={isLocked}
                         onBlur={(e) => {
                           if (e.target.value === '' || e.target.value === null) {
                             updateMark(student.id, 'secC', 0);
                           }
                         }}
                         onChange={(e) => updateMark(student.id, 'secC', e.target.value)} 
                         className="w-16 px-1 py-1 bg-transparent text-center text-[11px] font-semibold text-slate-800 rounded border border-transparent transition-all focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" 
                       />
                     </td>
                   )}
                
                {/* Cumulative Section Component Raw Total Weight */}
                <td className="px-4 py-3.5 text-[11px] font-bold text-slate-800 border-r border-slate-100 text-center bg-slate-100/40 w-24">
                  {rowTotal}
                </td>
              </>
            )}

{/* Aggregated Final Base Exam Summary Input */}
             <td className="px-4 py-2 border-r border-slate-100 text-center w-36">
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
                 className="w-16 px-1 py-1 bg-transparent text-center text-[11px] font-bold text-slate-900 rounded border border-transparent transition-all focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200" 
               />
             </td>

            {/* Calculated Structural Metrics Outlets */}
            <td className="px-4 py-3.5 text-[11px] font-bold text-slate-900 border-r border-slate-100 text-center w-20 bg-slate-50/20">
              {student.final}
            </td>
            
            <td className="px-4 py-3.5 text-[11px] font-bold text-emerald-700 border-r border-slate-100 text-center w-20 bg-emerald-50/30">
              {student.grade}
            </td>

            {/* Realtime Smart Administrative Remark Output */}
            <td className="px-6 py-3.5 align-middle">
              <div className="flex items-center gap-2 group/remark min-h-[20px]">
                <Sparkles 
                  size={13} 
                  className="text-amber-400 shrink-0 opacity-0 group-hover/remark:opacity-100 transition-opacity duration-200" 
                />
                <p className="text-[11px] font-semibold text-slate-500 italic tracking-wide uppercase leading-tight max-w-xs truncate">
                  {student.remark || getSmartRemark?.(student.grade) || 'No Remark'}
                </p>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}
