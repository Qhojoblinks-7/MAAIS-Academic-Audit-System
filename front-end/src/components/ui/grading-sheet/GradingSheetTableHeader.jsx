import React from 'react';
import { MinusCircle, PlusCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { TableHead, TableRow, TableHeader } from '../table';

export function GradingSheetTableHeader({ 
  DISPLAY_CLASS_INFO, 
  isExamExpanded, 
  setIsExamExpanded,
  isTermFinalized 
}) {
  const activeSections = DISPLAY_CLASS_INFO?.activeSections || [];
  const subjectConfig = DISPLAY_CLASS_INFO?.subjectConfig;

  return (
    <TableHeader>
      <TableRow className="bg-muted border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
        <TableHead className="px-4 py-3 text-left w-16 border-r border-border">ID</TableHead>
        <TableHead className="px-4 py-3 text-left border-r border-border">Student Name</TableHead>
        
        {/* Compact Default Mode (SBA Column Only) */}
        {!isExamExpanded && (
          <TableHead className="px-4 py-3 text-center w-28 border-r border-border text-foreground font-semibold">
            {subjectConfig?.sbaLabel || 'SBA (30%)'}
          </TableHead>
        )}
        
        {/* Expanded Mode — Individual Milestone/Section Breakdown */}
        {isExamExpanded && (
          <>
            {activeSections.map((section, idx) => (
              <TableHead 
                key={`sec-hdr-${idx}`} 
                className="px-4 py-3 text-center w-24 border-r border-border text-foreground bg-muted/50"
              >
                {section}
              </TableHead>
            ))}
            <TableHead className="px-4 py-3 text-center w-24 border-r border-border bg-muted/40 text-foreground font-semibold">
              Total ({subjectConfig?.maxRaw || 100})
            </TableHead>
          </>
        )}
        
        {/* Exam Score Summary Trigger */}
        <TableHead className="px-4 py-3 text-center w-36 border-r border-border">
          <div className="flex items-center justify-center gap-2">
            <span className="text-foreground font-semibold">
              {subjectConfig?.examLabel || 'Exam (70%)'}
            </span>
            <button 
              type="button"
              onClick={() => setIsExamExpanded(!isExamExpanded)} 
              className="text-muted-foreground hover:text-success transition-colors outline-none focus:ring-1 focus:ring-success rounded-full cursor-pointer"
              title={isExamExpanded ? "Collapse Breakdown Columns" : "Expand Section Details"}
            >
              {isExamExpanded ? <MinusCircle size={15} /> : <PlusCircle size={15} />}
            </button>
          </div>
        </TableHead>
        
        <TableHead className="px-4 py-3 text-center w-20 border-r border-border text-foreground font-semibold">Final</TableHead>
        <TableHead className="px-4 py-3 text-center w-20 border-r border-border text-foreground font-semibold">Grade</TableHead>
        <TableHead className="px-6 py-3 text-left tracking-normal text-muted-foreground">Smart Remark</TableHead>
      </TableRow>
    </TableHeader>
  );
}