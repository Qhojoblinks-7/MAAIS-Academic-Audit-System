import React, { useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useVirtualizer } from '@tanstack/react-virtual';
import { CorrectionMarkInput } from '../../shared/CorrectionMode';
import { TableBody, TableCell, TableRow } from '../table';

const GradeSheetRow = React.memo(function GradeSheetRow({
  student,
  idx,
  selectedStudent,
  isCorrectionMode,
  isMissingObsMode,
  isAtRisk,
  isTermFinalized,
  targetStudentId,
  isExamExpanded,
  sectionFieldNames,
  isLocked,
  showSTPOverlay,
  updateMark,
  getSmartRemark,
  submissionStatus,
  onStudentClick,
}) {
  const isSelected = selectedStudent?.id === student.id;
  const isTarget =
    (isCorrectionMode || isMissingObsMode || !!targetStudentId) &&
    (student.id === targetStudentId || student.index === targetStudentId || student.name === targetStudentId);
  const isGhosted = (isCorrectionMode || isMissingObsMode || !!targetStudentId) && !isTarget;
  const isAuditMissing = showSTPOverlay && student.auditStatus === 'MISSING';

  const canInteract = (() => {
    if (isCorrectionMode || isMissingObsMode) {
      return student.id === targetStudentId || student.index === targetStudentId || student.name === targetStudentId;
    }
    if (isLocked) return false;
    if (targetStudentId) {
      return student.id === targetStudentId || student.index === targetStudentId || student.name === targetStudentId;
    }
    return true;
  })();

  const cursorClass = (() => {
    if (isCorrectionMode || isMissingObsMode) {
      return isTarget ? "cursor-pointer" : "";
    }
    if (targetStudentId && !isLocked) {
      return isTarget ? "cursor-pointer" : "";
    }
    if (isLocked) return "cursor-not-allowed";
    return "cursor-pointer";
  })();

  const rowTotal = React.useMemo(
    () => sectionFieldNames.reduce((sum, key) => sum + (parseFloat(student[key]) || 0), 0),
    [student.secA, student.secB, student.secC, sectionFieldNames]
  );

  const rowClassName = cn(
    "transition-colors group content-baseline border-l-4",
    isSelected && isAtRisk ? "bg-destructive/5 border-l-destructive" : isSelected ? "bg-success/5 border-l-success" : "border-l-transparent",
    isGhosted && "opacity-40 pointer-events-none filter saturate-50",
    isAuditMissing && "bg-danger/5 hover:bg-danger/10",
    isLocked && "bg-muted",
    cursorClass
  );

  const inputBaseClass = `w-16 px-1 py-1 text-center text-xs rounded border transition-all ${
    isLocked
      ? 'bg-muted text-muted-foreground cursor-not-allowed border-border'
      : 'bg-transparent text-text-primary border-transparent focus:border-border focus:bg-surface focus:outline-none focus:ring-2 focus:ring-muted'
  }`;

  const handleStudentClick = () => {
    if (isLocked) return;
    if (canInteract && onStudentClick) onStudentClick(student);
  };

  const handleSbaBlur = (e) => {
    if (e.target.value === '' || e.target.value === null) updateMark(student.id, 'sba', 0);
  };
  const handleSbaChange = (e) => updateMark(student.id, 'sba', e.target.value);

  const handleExamBlur = (e) => {
    if (e.target.value === '' || e.target.value === null) updateMark(student.id, 'exam', 0);
  };
  const handleExamChange = (e) => updateMark(student.id, 'exam', e.target.value);

  const handleSectionBlur = (fieldName) => (e) => {
    if (e.target.value === '' || e.target.value === null) updateMark(student.id, fieldName, 0);
  };
  const handleSectionChange = (fieldName) => (e) => updateMark(student.id, fieldName, e.target.value);

  return (
    <TableRow
      key={student.id || idx}
      className={rowClassName}
      onClick={handleStudentClick}
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
            onBlur={handleSbaBlur}
            onChange={handleSbaChange}
            className={inputBaseClass}
          />
        </TableCell>
      )}

      {/* Dynamic Section-Based Layout Mapping Engine */}
      {isExamExpanded && (
        <>
          {sectionFieldNames.map((fieldName) => {
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
                    onMarkChange={updateMark}
                    isTermFinalized={isTermFinalized}
                  />
                </TableCell>
              );
            }

            return (
              <TableCell key={fieldName} className="px-4 py-2 border-r border-border text-center bg-muted/30 w-24">
                <input
                  type="number"
                  value={student[fieldName] ?? student.sba ?? ''}
                  disabled={isLocked}
                  readOnly={isLocked}
                  onBlur={handleSectionBlur(fieldName)}
                  onChange={handleSectionChange(fieldName)}
                  className={inputBaseClass}
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
          onBlur={handleExamBlur}
          onChange={handleExamChange}
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
});

GradeSheetRow.displayName = 'GradeSheetRow';

const ITEM_HEIGHT = 48;

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
   onStudentClick,
  }) {
    const sectionCount = DISPLAY_CLASS_INFO?.subjectConfig?.sectionCount || 2;
    const sectionFieldNames = (DISPLAY_CLASS_INFO?.sectionFieldNames || ['secA', 'secB', 'secC']).slice(0, sectionCount);
    const isLocked = isTermFinalized || submissionStatus === 'SUBMITTED' || students.some(s => s.isLocked);

    const scrollParentRef = useRef(null);

    const rowVirtualizer = useVirtualizer({
      count: students.length,
      getScrollElement: () => scrollParentRef.current,
      estimateSize: () => ITEM_HEIGHT,
      overscan: 5,
      onChangeScrollDebounceMs: 50,
    });

    const virtualRows = rowVirtualizer.virtualItems;
    const totalHeight = students.length * ITEM_HEIGHT;

    const rowProps = {
      isCorrectionMode,
      isMissingObsMode,
      isAtRisk,
      isTermFinalized,
      targetStudentId,
      isExamExpanded,
      sectionFieldNames,
      isLocked,
      showSTPOverlay,
      updateMark,
      getSmartRemark,
      submissionStatus,
      onStudentClick,
      selectedStudent,
    };

    // For datasets that fit comfortably, render normally (no virtualization overhead)
    if (students.length <= 20) {
      return (
        <TableBody className="divide-y divide-border bg-surface">
          {students.map((student, idx) => (
            <GradeSheetRow key={student.id || idx} {...rowProps} student={student} idx={idx} />
          ))}
          {students.length === 0 && (
            <tr>
              <TableCell colSpan={10} className="h-24 text-center text-xs text-text-secondary">
                No students found for this selection.
              </TableCell>
            </tr>
          )}
        </TableBody>
      );
    }

    // For large datasets, use virtualized rendering
    return (
      <TableBody className="divide-y divide-border bg-surface">
        <tr>
          <TableCell colSpan={10} className="p-0">
            <div
              ref={scrollParentRef}
              className="overflow-y-auto"
              style={{ maxHeight: '500px' }}
            >
              <div style={{ height: `${totalHeight}px`, width: '100%', position: 'relative' }}>
                {virtualRows.map((virtualRow) => {
                  const student = students[virtualRow.index];
                  if (!student) return null;
                  return (
                    <div
                      key={`virtual-row-${virtualRow.index}`}
                      className="absolute left-0 right-0"
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <table className="w-full table-fixed border-collapse">
                        <tbody>
                          <GradeSheetRow {...rowProps} student={student} idx={virtualRow.index} />
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
          </TableCell>
        </tr>
      </TableBody>
    );
  }
