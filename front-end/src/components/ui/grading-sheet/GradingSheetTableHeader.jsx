import React from 'react';
import { MinusCircle, PlusCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { TableHead, TableRow } from '../table';

export function GradingSheetTableHeader({ 
  DISPLAY_CLASS_INFO, 
  isExamExpanded, 
  setIsExamExpanded,
  isTermFinalized 
}) {
  const activeSections = DISPLAY_CLASS_INFO?.activeSections || [];
  const subjectConfig = DISPLAY_CLASS_INFO?.subjectConfig;

  return (
    <TableRow className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
      <TableHead className="px-4 py-3 text-left w-16 border-r border-slate-100">ID</TableHead>
      <TableHead className="px-4 py-3 text-left border-r border-slate-100">Student Name</TableHead>
      
      {/* Compact Default Mode (SBA Column Only) */}
      {!isExamExpanded && (
        <TableHead className="px-4 py-3 text-center w-28 border-r border-slate-100 text-slate-700 font-semibold">
          {subjectConfig?.sbaLabel || 'SBA (30%)'}
        </TableHead>
      )}
      
      {/* Expanded Mode — Individual Milestone/Section Breakdown */}
      {isExamExpanded && (
        <>
          {activeSections.map((section, idx) => (
            <TableHead 
              key={`sec-hdr-${idx}`} 
              className="px-4 py-3 text-center w-24 border-r border-slate-100 text-slate-600 bg-slate-50/50"
            >
              {section}
            </TableHead>
          ))}
          <TableHead className="px-4 py-3 text-center w-24 border-r border-slate-100 bg-slate-100/50 text-slate-700 font-semibold">
            Total ({subjectConfig?.maxRaw || 100})
          </TableHead>
        </>
      )}
      
      {/* Exam Score Summary Trigger */}
      <TableHead className="px-4 py-3 text-center w-36 border-r border-slate-100">
        <div className="flex items-center justify-center gap-2">
          <span className="text-slate-700 font-semibold">
            {subjectConfig?.examLabel || 'Exam (70%)'}
          </span>
          <button 
            type="button"
            onClick={() => setIsExamExpanded(!isExamExpanded)} 
            className="text-slate-400 hover:text-emerald-600 transition-colors outline-none focus:ring-1 focus:ring-emerald-500 rounded-full"
            title={isExamExpanded ? "Collapse Breakdown Columns" : "Expand Section Details"}
          >
            {isExamExpanded ? <MinusCircle size={15} /> : <PlusCircle size={15} />}
          </button>
        </div>
      </TableHead>
      
      <TableHead className="px-4 py-3 text-center w-20 border-r border-slate-100 text-slate-700 font-semibold">Final</TableHead>
      <TableHead className="px-4 py-3 text-center w-20 border-r border-slate-100 text-slate-700 font-semibold">Grade</TableHead>
      <TableHead className="px-6 py-3 text-left tracking-normal text-slate-400">Smart Remark</TableHead>
    </TableRow>
  );
}