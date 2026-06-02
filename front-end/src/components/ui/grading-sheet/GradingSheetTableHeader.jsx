import React from 'react';
import { MinusCircle, PlusCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

export function GradingSheetTableHeader({ 
  DISPLAY_CLASS_INFO, 
  isExamExpanded, 
  setIsExamExpanded,
  isTermFinalized 
}) {
  const activeSections = DISPLAY_CLASS_INFO?.activeSections || [];
  const subjectConfig = DISPLAY_CLASS_INFO?.subjectConfig;

  return (
    <thead>
      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
        <th className="px-4 py-3 text-left w-16 border-r border-slate-100">ID</th>
        <th className="px-4 py-3 text-left border-r border-slate-100">Student Name</th>
        
        {/* Compact Default Mode (SBA Column Only) */}
        {!isExamExpanded && (
          <th className="px-4 py-3 text-center w-28 border-r border-slate-100 text-slate-700 font-semibold">
            {subjectConfig?.sbaLabel || 'SBA (30%)'}
          </th>
        )}
        
        {/* Expanded Mode — Individual Milestone/Section Breakdown */}
        {isExamExpanded && (
          <>
            {activeSections.map((section, idx) => (
              <th 
                key={`sec-hdr-${idx}`} 
                className="px-4 py-3 text-center w-24 border-r border-slate-100 text-slate-600 bg-slate-50/50"
              >
                {section}
              </th>
            ))}
            <th className="px-4 py-3 text-center w-24 border-r border-slate-100 bg-slate-100/50 text-slate-700 font-semibold">
              Total ({subjectConfig?.maxRaw || 100})
            </th>
          </>
        )}
        
        {/* Exam Score Summary Trigger */}
        <th className="px-4 py-3 text-center w-36 border-r border-slate-100">
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
        </th>
        
        <th className="px-4 py-3 text-center w-20 border-r border-slate-100 text-slate-700 font-semibold">Final</th>
        <th className="px-4 py-3 text-center w-20 border-r border-slate-100 text-slate-700 font-semibold">Grade</th>
        <th className="px-6 py-3 text-left tracking-normal text-slate-400">Smart Remark</th>
      </tr>
    </thead>
  );
}