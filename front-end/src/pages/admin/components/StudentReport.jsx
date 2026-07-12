import React from 'react';
import { cn } from '../../../lib/utils';
import { 
  Database, 
  User, 
  ShieldCheck, 
  Printer, 
  TrendingUp, 
  History, 
  FileText
} from 'lucide-react';
import { getWAECGrade } from '../ArchiveView';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

export function StudentReport({ selectedStudent, reportConfig, setReportConfig }) {
  if (!selectedStudent) return null;

  return (
    <div className="flex-1 overflow-hidden flex flex-col items-center bg-surface z-10 w-full">
      {/* High-Density Report Configuration & Export Header */}
      <div className="w-full max-w-7xl mt-2 sm:mt-3 pb-3 flex flex-col sm:flex-row items-center justify-between border-b border-border px-4 gap-2.5 mx-auto">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <select 
            value={reportConfig.range}
            onChange={(e) => setReportConfig({...reportConfig, range: e.target.value})}
            className="bg-surface h-8 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-border outline-none cursor-pointer"
          >
            <option>Full Journey</option>
            <option>Phase Report (SHS 2)</option>
          </select>
          <div className="flex items-center gap-1.5 h-8 px-3 bg-success/10 text-success rounded-lg text-[9px] font-black uppercase tracking-wider border border-success/20 font-mono">
            <ShieldCheck size={12} className="text-success" />
            Audit: {selectedStudent.index}-99X
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setReportConfig({...reportConfig, selectedStudent: null})}
            className="flex-1 sm:flex-none h-8 px-4 bg-muted/20 text-muted-foreground rounded-lg text-[10px] font-bold hover:bg-muted/30 transition-all uppercase tracking-wider border border-border cursor-pointer"
          >
            Return
          </button>
          <button className="flex-1 sm:flex-none h-8 flex items-center justify-center gap-1.5 px-4 bg-brand-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:bg-success/80 transition-all shadow-xs cursor-pointer">
            <Printer size={12} />
            Print Transcript
          </button>
        </div>
      </div>

      {/* Main High-Density Report Body */}
      <div className="flex-1 w-full max-w-7xl overflow-y-auto no-scrollbar relative p-3 sm:p-5 mx-auto space-y-6">
        
        {/* Compressed Profile Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/20 rounded-xl border border-border/70 gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`} 
                alt={selectedStudent.name} 
                className="w-14 h-14 rounded-2xl bg-surface border border-border p-0.5 shadow-xs"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-brand-primary text-primary-foreground rounded-lg flex items-center justify-center border border-surface shadow-xs">
                <User size={10} />
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black text-foreground tracking-tight leading-none mb-1 truncate">{selectedStudent.name}</h2>
              <p className="text-success font-black uppercase tracking-wider text-[8px] font-mono">Scholastic Longitudinal Portfolio</p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 bg-surface border border-border rounded text-[8px] font-bold text-muted-foreground font-mono">ID: {selectedStudent.index}</span>
                <span className="px-1.5 py-0.5 bg-surface border border-border rounded text-[8px] font-bold text-muted-foreground uppercase tracking-wider">{selectedStudent.department} Dept</span>
                <span className="px-1.5 py-0.5 bg-success/10 text-success border border-success/20 rounded text-[8px] font-black uppercase tracking-wider">{selectedStudent.consistencyScore} Performer</span>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right shrink-0 border-t sm:border-0 pt-2 sm:pt-0 border-border/60 flex items-center sm:flex-col justify-between sm:justify-center gap-1">
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider font-mono">Registry Log</span>
            <p className="text-[10px] font-bold text-foreground/80 font-mono">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* 1. ACADEMIC JOURNALS FEED (Table-free) */}
        <section>
          <header className="flex items-center gap-2 mb-3 border-b border-success/20 pb-1.5">
            <Database size={14} className="text-success" />
            <h3 className="text-[11px] font-black text-success uppercase tracking-wider">1. Terminal Performance Breakdown</h3>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['SHS 1-T1', 'SHS 1-T2', 'SHS 1-T3', 'SHS 2-T1', 'SHS 2-T2', 'SHS 2-T3'].map((term, tIdx) => (
              <div key={term} className="bg-surface rounded-xl border border-border shadow-xs overflow-hidden flex flex-col">
                {/* Minimal Row Group Header */}
                <div className="bg-muted/30 px-3 py-2 border-b border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 bg-brand-primary text-primary-foreground rounded-md flex items-center justify-center text-[9px] font-mono shrink-0">
                      {String(tIdx + 1).padStart(2, '0')}
                    </div>
                    <h4 className="text-[10px] font-black text-foreground/80 uppercase tracking-wider truncate font-mono">{term}</h4>
                  </div>
                  <span className="text-[7.5px] font-black text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono shrink-0">Official Record</span>
                </div>
                
                {/* High-Density Row Grid (Replaces Table) */}
                <div className="divide-y divide-border">
                  {['Core Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'Elective Subject 1', 'Elective Subject 2'].map((subj, sIdx) => {
                    const baseGrade = selectedStudent.history[tIdx]?.finalGrade || 70;
                    const classScore = Math.round((baseGrade * 0.3) + (sIdx % 2 === 0 ? 2 : -2));
                    const examScore = Math.round((baseGrade * 0.7) + (sIdx % 3 === 0 ? -3 : 4));
                    const total = classScore + examScore;
                    const letterGrade = getWAECGrade(total);

                    return (
                      <div key={subj} className="p-2 flex items-center justify-between gap-3 hover:bg-success/10 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-foreground truncate tracking-tight">{subj}</p>
                          <div className="flex items-center gap-2 text-[8px] font-medium text-muted-foreground font-mono mt-0.5">
                            <span>CLS: <b className="text-foreground/60 font-bold">{classScore}</b></span>
                            <span>EXM: <b className="text-foreground/60 font-bold">{examScore}</b></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8.5px] font-black font-mono w-6 text-center leading-none",
                            total >= 70 ? "bg-success/10 text-success border border-success/20" :
                            total >= 50 ? "bg-warning/10 text-warning border border-warning/20" :
                            "bg-destructive/5 text-destructive border border-destructive/20"
                          )}>
                            {letterGrade}
                          </span>
                          <span className={cn(
                            "text-[13px] font-black font-mono tracking-tighter w-10 text-right",
                            total >= 75 ? "text-success" :
                            total < 50 ? "text-destructive" : "text-foreground/80"
                          )}>{total}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* High-Density Summary Widgets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
            <div className="bg-success/10 p-2.5 rounded-xl border border-success/20 flex items-center justify-between">
              <span className="text-[8px] font-bold text-success uppercase tracking-wider font-mono">Cumulative GPA</span>
              <p className="text-sm font-black text-success font-mono">
                {(selectedStudent.history.reduce((acc, h) => acc + h.finalGrade, 0) / selectedStudent.history.length).toFixed(1)}%
              </p>
            </div>
            <div className="bg-success/10 p-2.5 rounded-xl border border-success/20 flex items-center justify-between">
              <span className="text-[8px] font-bold text-success uppercase tracking-wider font-mono">Consistency</span>
              <p className="text-sm font-black text-success font-mono">{selectedStudent.consistencyScore}</p>
            </div>
            <div className="bg-success/10 p-2.5 rounded-xl border border-success/20 flex items-center justify-between">
              <span className="text-[8px] font-bold text-success uppercase tracking-wider font-mono">Mastery Rank</span>
              <p className="text-sm font-black text-success font-mono">Top 15%</p>
            </div>
            <div className="bg-success p-2.5 rounded-xl text-primary-foreground flex items-center justify-between col-span-2 lg:col-span-1">
              <span className="text-[8px] font-bold text-success uppercase tracking-wider font-mono">Vault Registry</span>
              <p className="text-[11px] font-black font-mono tracking-tight text-primary-foreground/80">MAAIS-V5</p>
            </div>
          </div>
        </section>

        {/* 2. PERFORMANCE TRAJECTORY CHART */}
        <section>
          <header className="flex items-center gap-2 mb-3 border-b border-success/20 pb-1.5">
            <TrendingUp size={14} className="text-success" />
            <h3 className="text-[11px] font-black text-success uppercase tracking-wider">2. Longitudinal Trajectory</h3>
          </header>
          <div className="bg-muted/20 p-3 rounded-xl border border-border h-[180px] sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={selectedStudent.history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="subScreenTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#065F46" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#065F46" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#9ca3af', fontFamily: 'monospace' }} dy={5} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#9ca3af', fontFamily: 'monospace' }} />
                <Area 
                  type="monotone" 
                  dataKey="finalGrade" 
                  stroke="#065F46" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#subScreenTrend)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 3. OBSERVATIONS & INTERVENTIONS MIX */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section>
            <header className="flex items-center gap-2 mb-2.5 border-b border-success/20 pb-1.5">
              <History size={14} className="text-success" />
              <h3 className="text-[11px] font-black text-success uppercase tracking-wider">3. Observation Archive</h3>
            </header>
            <div className="space-y-2">
              {selectedStudent.observations.map((obs) => (
                <div key={obs.id} className="p-2.5 bg-surface border-l-2 border-warning border-y border-r border-border rounded-r-lg shadow-2xs">
                  <div className="flex justify-between items-center mb-1 gap-2">
                    <span className="text-[7.5px] font-black text-warning bg-warning/10 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">{obs.type}</span>
                    <span className="text-[8px] font-bold text-muted-foreground font-mono">{obs.date}</span>
                  </div>
                  <p className="text-[11px] font-medium text-foreground/80 italic leading-snug">"{obs.comment}"</p>
                  <p className="text-[7.5px] font-black text-muted-foreground mt-1.5 uppercase tracking-wider font-mono">— Logged by {obs.teacherName}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <header className="flex items-center gap-2 mb-2.5 border-b border-success/20 pb-1.5">
              <ShieldCheck size={14} className="text-success" />
              <h3 className="text-[11px] font-black text-success uppercase tracking-wider">4. Intervention History</h3>
            </header>
            <div className="space-y-2">
              {selectedStudent.interventions.map((int) => (
                <div key={int.id} className="bg-brand-primary text-primary-foreground p-3 rounded-xl border border-border relative overflow-hidden shadow-2xs">
                  <div className="absolute top-2 right-2 text-[6.5px] font-black text-success bg-success/10 px-1.5 py-0.5 rounded font-mono tracking-wider">AUDIT OK</div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                    <p className="text-[8px] font-black uppercase tracking-wider font-mono text-muted-foreground">{int.year} {int.term} Milestone</p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[7.5px] font-black text-muted-foreground uppercase tracking-wider font-mono">Action taken</p>
                      <p className="text-[11px] font-medium italic text-primary-foreground/80">{int.action}</p>
                    </div>
                    <div className="bg-surface/5 p-2 rounded-lg border border-primary-foreground/5">
                      <p className="text-[7.5px] font-black text-success uppercase tracking-wider font-mono mb-0.5">Outcome</p>
                      <p className="text-[10.5px] font-bold italic text-border">{int.outcome}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 4. CONCLUDING SUMMARY TEXTAREA */}
        <section>
          <header className="flex items-center gap-2 mb-2.5 border-b border-success/20 pb-1.5">
            <User size={14} className="text-success" />
            <h3 className="text-[11px] font-black text-success uppercase tracking-wider">5. Final Professional Assessment</h3>
          </header>
          <div className="bg-muted/30 p-4 rounded-xl border border-border">
            <textarea 
              value={reportConfig.concludingSummary}
              onChange={(e) => setReportConfig({...reportConfig, concludingSummary: e.target.value})}
              placeholder="Enter final longitudinal summary here..."
              className="w-full bg-transparent border-none focus:outline-none text-sm font-bold text-foreground/80 italic leading-relaxed placeholder:text-muted-foreground resize-none h-24"
            />
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 opacity-40">
              <div className="text-center font-black text-[8px] text-foreground uppercase tracking-wider font-mono border-r border-border">Teacher Sign-off</div>
              <div className="text-center font-black text-[8px] text-foreground uppercase tracking-wider font-mono">Registrar Stamp</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}