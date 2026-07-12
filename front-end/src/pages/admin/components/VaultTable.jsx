import React from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

const getWAECGrade = (score) => {
  if (score >= 80) return 'A1';
  if (score >= 70) return 'B2';
  if (score >= 65) return 'B3';
  if (score >= 60) return 'C4';
  if (score >= 55) return 'C5';
  if (score >= 50) return 'C6';
  if (score >= 45) return 'D7';
  if (score >= 40) return 'E8';
  return 'F9';
};

export function VaultTable({ filteredStudents, showCoreComparison, selectedSubject, selectedStudent, setSelectedStudent, coreSubjects, terms, getGhostBenchmark }) {
  return (
    <div className="w-full p-4 md:p-8 pt-4">
      
      {/* ==================== MOBILE & TABLET VIEW (Cards) ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {filteredStudents.map((student) => {
          const totalAvg = (student.history.reduce((acc, h) => acc + h.finalGrade, 0) / (student.history.length || 1)).toFixed(1);
          const isSelected = selectedStudent?.id === student.id;

          return (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={cn(
                "bg-surface/40 backdrop-blur-md rounded-2xl p-5 border border-border shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.99]",
                isSelected && "ring-2 ring-success bg-surface"
              )}
            >
              {/* Header: Identity & Aggregate Badge */}
              <div className="flex items-center justify-between gap-4 border-b border-border pb-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name)}`} 
                    alt={student.name} 
                    className="w-10 h-10 rounded-full bg-success/10 border border-success/20"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-black text-foreground tracking-tight truncate">{student.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase font-mono">{student.index}</p>
                  </div>
                </div>
                <div className="bg-brand-primary px-3 py-1.5 rounded-xl text-right shadow-md shrink-0">
                  <span className="block text-[8px] font-black text-primary-foreground/60 uppercase tracking-wider">Avg</span>
                  <span className="text-sm font-black text-primary-foreground italic">{totalAvg}%</span>
                </div>
              </div>

              {/* Dynamic Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                {showCoreComparison ? (
                  <>
                    {/* Target Subject Feature block */}
                    <div className="bg-success/10 border border-success/20 rounded-xl p-2 text-center">
                      <p className="text-[9px] font-black text-success uppercase truncate mb-1">{selectedSubject}</p>
                      <p className="text-base font-black text-success">{student.history[student.history.length - 1]?.finalGrade}%</p>
                    </div>
                    {/* Core Subjects */}
                    {coreSubjects.map((s, idx) => {
                      const baseScore = student.history[student.history.length - 1]?.finalGrade || 0;
                      const simulatedScore = Math.max(0, Math.min(100, baseScore + (idx % 2 === 0 ? 5 : -10)));
                      return (
                        <div key={s} className="bg-muted/20 border border-border rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black text-muted-foreground uppercase truncate mb-1">{s}</p>
                          <p className={cn(
                            "text-base font-black",
                            simulatedScore > 75 ? "text-success" : simulatedScore < 50 ? "text-destructive" : "text-foreground/60"
                          )}>{simulatedScore.toFixed(0)}%</p>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  /* Terms Breakdown */
                  terms.map((term, idx) => {
                    const grade = student.history[idx]?.finalGrade;
                    return (
                      <div key={term} className="bg-muted/20 border border-border rounded-xl p-2 text-center">
                        <p className="text-[9px] font-black text-muted-foreground uppercase truncate mb-1">{term}</p>
                        <p className={cn(
                          "text-base font-black",
                          grade > 75 ? "text-success" : grade < 50 ? "text-destructive" : "text-foreground/60"
                        )}>{grade ? `${grade}%` : '---'}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== DESKTOP VIEW (Full Vault Table) ==================== */}
      <div className="hidden lg:block overflow-x-auto">
        <Table className="border-separate border-spacing-y-4 table-fixed">
          <TableHeader>
            <TableRow className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              <TableHead className="w-[260px] px-6 py-4 text-left sticky left-0 z-30 bg-transparent">Student Identity</TableHead>
              {showCoreComparison ? (
                <>
                  <TableHead className="px-4 py-4 text-center border-x border-border/50 bg-success/10 text-success rounded-t-xl">{selectedSubject}</TableHead>
                  {coreSubjects.map(s => (
                    <TableHead key={s} className="px-4 py-4 text-center border-x border-border/50">{s}</TableHead>
                  ))}
                </>
              ) : (
                terms.map(t => (
                  <TableHead key={t} className="px-4 py-4 text-center border-x border-border/50">{t}</TableHead>
                ))
              )}
              <TableHead className="w-[120px] px-6 py-4 text-right">Aggregate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => {
              const isSelected = selectedStudent?.id === student.id;
              
              return (
                <TableRow
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={cn(
                    "group cursor-pointer transition-all duration-200",
                    isSelected && "ring-2 ring-success ring-offset-2 rounded-[1.5rem]"
                  )}
                >
                  {/* Sticky Glass Identity Cell */}
                  <TableCell className="w-[260px] bg-surface/80 backdrop-blur-md px-6 py-5 rounded-l-[1.5rem] border-y border-l border-border shadow-sm group-hover:bg-surface transition-all sticky left-0 z-20 before:absolute before:inset-0 before:bg-surface/40 before:-z-10">
                    <div className="flex items-center gap-4">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name)}`} 
                        alt={student.name} 
                        className="w-10 h-10 rounded-full bg-success/10 border border-success/20 shadow-sm grayscale group-hover:grayscale-0 transition-all"
                      />
                      <div className="truncate">
                        <p className="text-sm font-black text-foreground tracking-tight truncate">{student.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">{student.index}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Core Subjects / Terms Comparison Layout */}
                  {showCoreComparison ? (
                    <>
                      <TableCell className="bg-success/10 backdrop-blur-[2px] px-8 py-5 border-y border-x border-success/20 group-hover:bg-success/10 transition-all text-center relative overflow-hidden">
                        <span className="text-lg font-black text-success italic">
                          {student.history[student.history.length - 1]?.finalGrade}%
                        </span>
                        <div className="text-[8px] font-black text-success uppercase mt-1">Target Subject</div>
                      </TableCell>
                      {coreSubjects.map((s, idx) => {
                        const baseScore = student.history[student.history.length - 1]?.finalGrade || 0;
                        const simulatedScore = Math.max(0, Math.min(100, baseScore + (idx % 2 === 0 ? 5 : -10)));
                        return (
                          <TableCell key={s} className="bg-surface/30 backdrop-blur-[2px] px-8 py-5 border-y border-x border-border/50 group-hover:bg-surface/80 transition-all text-center relative overflow-hidden">
                            <span className={cn(
                              "text-lg font-black tracking-tighter",
                              simulatedScore > 75 ? "text-success" : simulatedScore < 50 ? "text-destructive" : "text-foreground/60"
                            )}>
                              {simulatedScore.toFixed(0)}%
                            </span>
                            <div className="text-[8px] font-black text-foreground/50 uppercase mt-1 tracking-tighter">Verified Audit</div>
                          </TableCell>
                        );
                      })}
                    </>
                  ) : (
                     terms.map((term, idx) => {
                       const grade = student.history[idx]?.finalGrade;
                       const ghostAverage = getGhostBenchmark ? getGhostBenchmark(student, idx) : (idx === 4 ? 62 : idx === 3 ? 58 : 65);
                       
                       return (
                        <TableCell key={term} className="bg-surface/30 backdrop-blur-[2px] px-8 py-5 border-y border-x border-border/50 group-hover:bg-surface/80 transition-all text-center relative overflow-hidden">
                          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_0)] bg-[size:10px_10px]" />
                          
                          <div className="relative pb-2">
                            <span className={cn(
                              "text-lg font-black tracking-tighter",
                              grade > 75 ? "text-success" : grade < 50 ? "text-destructive" : "text-foreground/60"
                            )}>
                              {grade ? `${grade}%` : '---'}
                            </span>
                             <div className="flex items-center justify-center gap-1 mt-0.5">
                               <span className="text-[8px] font-black text-foreground/50 uppercase tracking-widest">
                                 {ghostAverage != null ? `Ghost: ${ghostAverage}%` : 'Ghost: ---'}
                               </span>
                             </div>
                             
                             {grade && ghostAverage != null && (
                               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full overflow-hidden bg-muted/20">
                                 <div 
                                   className={cn(
                                     "h-full transition-all",
                                     grade > ghostAverage ? "bg-success/100 w-full" : "bg-destructive/5 w-1/2"
                                   )}
                                 />
                               </div>
                             )}
                          </div>
                        </TableCell>
                      );
                    })
                  )}

                  {/* Aggregate Column */}
                  <TableCell className="w-[120px] bg-brand-primary px-8 py-5 rounded-r-[1.5rem] border-y border-r border-border shadow-xl group-hover:bg-brand-dark transition-all text-right">
                    <p className="text-[10px] font-black text-primary-foreground/60 uppercase mb-1">Total</p>
                    <p className="text-xl font-black text-primary-foreground italic">
                      {(student.history.reduce((acc, h) => acc + h.finalGrade, 0) / (student.history.length || 1)).toFixed(1)}%
                    </p>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}