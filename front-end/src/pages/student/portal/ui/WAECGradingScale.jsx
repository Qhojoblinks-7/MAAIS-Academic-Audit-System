import React from 'react';
import { cn } from './cn';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const GRADES = [
  { label: 'A1', range: '75-100%', interpretation: 'Excellent' },
  { label: 'B2', range: '70-74%', interpretation: 'Very Good' },
  { label: 'B3', range: '65-69%', interpretation: 'Good' },
  { label: 'C4', range: '60-64%', interpretation: 'Credit' },
  { label: 'C5', range: '55-59%', interpretation: 'Credit' },
  { label: 'C6', range: '50-54%', interpretation: 'Credit' },
  { label: 'D7', range: '45-49%', interpretation: 'Pass' },
  { label: 'E8', range: '40-44%', interpretation: 'Pass' },
  { label: 'F9', range: '0-39%', interpretation: 'Fail' },
];

export function WAECGradingScale() {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm w-full">
      <h2 className="text-lg sm:text-xl font-black text-text-primary mb-4">WAEC Grading Scale</h2>
      
      {/* 1. Mobile View Mode: Replaces tables with high-contrast indicator list cards */}
      <div className="block sm:hidden space-y-2">
        {GRADES.map((grade, index) => {
          const isFail = grade.label === 'F9';
          return (
            <div 
              key={index} 
              className="flex items-center justify-between p-3.5 bg-background rounded-xl border border-border/50"
            >
              <div className="flex items-center gap-3">
                {/* Visual Grade Badge Icon */}
                <span className={cn(
                  "w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center shadow-sm border",
                  isFail 
                    ? "bg-danger/10 text-danger border-danger/20" 
                    : "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                )}>
                  {grade.label}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-text-primary">
                    {grade.interpretation}
                  </span>
                  <span className="text-[11px] font-medium text-text-secondary mt-0.5">
                    Score Matrix Interval
                  </span>
                </div>
              </div>
              <span className="text-xs font-black bg-surface px-2.5 py-1.5 rounded-lg border border-border/60 text-text-secondary">
                {grade.range}
              </span>
            </div>
          );
        })}
      </div>

{/* 2. Desktop View Mode: Standard table grid layout activated smoothly above mobile break margins */}
       <div className="hidden sm:block overflow-x-auto">
         <Table className="min-w-full divide-y divide-border">
           <TableHeader>
             <TableRow className="bg-background rounded-lg">
               <TableHead scope="col" className="px-5 py-3 text-left text-xs font-black text-text-secondary uppercase tracking-widest rounded-l-xl">
                 Grade
               </TableHead>
               <TableHead scope="col" className="px-5 py-3 text-left text-xs font-black text-text-secondary uppercase tracking-widest">
                 Score Range
               </TableHead>
               <TableHead scope="col" className="px-5 py-3 text-left text-xs font-black text-text-secondary uppercase tracking-widest rounded-r-xl">
                 Interpretation
               </TableHead>
             </TableRow>
           </TableHeader>
           <TableBody className="divide-y divide-border bg-surface">
             {GRADES.map((grade, index) => (
               <TableRow key={index} className="transition-colors hover:bg-background/40">
                 <TableCell className="px-5 py-3.5 text-sm font-black text-text-primary">{grade.label}</TableCell>
                 <TableCell className="px-5 py-3.5 text-sm font-medium text-text-secondary">{grade.range}</TableCell>
                 <TableCell className="px-5 py-3.5 text-sm font-medium text-text-secondary">{grade.interpretation}</TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
       </div>

    </div>
  );
}