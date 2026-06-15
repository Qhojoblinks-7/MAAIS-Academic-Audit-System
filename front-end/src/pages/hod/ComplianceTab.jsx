import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { 
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar
} from 'recharts';
import { cn } from '../../lib/utils';
import { Card } from '@/components/ui/card';

export function ComplianceTab() {
  // SSR Hydration Safe Check
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const graduatedPerformanceData = [
    { year: '2021 Cohort', AvgGrade: 72.4, HighGrade: 91 },
    { year: '2022 Cohort', AvgGrade: 76.8, HighGrade: 94 },
    { year: '2023 Cohort', AvgGrade: 80.2, HighGrade: 96 },
    { year: '2024 Cohort', AvgGrade: 83.1, HighGrade: 98 }
  ];

  const complianceTimeline = [
    { time: 'June 2024', event: 'Class of 2024 Dossier Lock', detail: '410 student records signed and generated as read-only PDF transcripts.', hash: 'MAAIS-L4-SEC-2024' },
    { time: 'June 2023', event: 'Class of 2023 Archive Sync', detail: 'Transcripts certified with verified National Exam results integration.', hash: 'MAAIS-L4-SEC-2023' },
    { time: 'July 2022', event: 'Class of 2022 Deep Archive Write', detail: 'Transferred terminal grading logs to secure offsite vault.', hash: 'MAAIS-L4-SEC-2022' }
  ];

  return (
    <motion.div 
      key="compliance"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto"
    >
      {/* Performance Chart Frame */}
      <Card className="rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-sm">
        <header className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-foreground shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest leading-none">
              Longitudinal Cohort Comparisons
            </h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1.5">
              Performance metrics mapping between completely graduated years
            </p>
          </div>
        </header>

        <div className="h-[280px] w-full">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graduatedPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214 32% 91%)" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 10, fontWeight: 800, fill: 'hsl(215 16% 47%)' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={[50, 100]} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: 'hsl(215 16% 47%)' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(222 47% 11%)', borderRadius: '12px', color: 'white', fontSize: '11px', fontWeight: 700, border: 'none' }} 
                />
                <Bar dataKey="AvgGrade" fill="hsl(222 47% 11%)" radius={[4, 4, 0, 0]} name="Cohort Average" maxBarSize={45} />
                <Bar dataKey="HighGrade" fill="hsl(215 16% 47%)" radius={[4, 4, 0, 0]} name="Peak Student Grade" maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-muted animate-pulse rounded-xl flex items-center justify-center text-xs text-muted-foreground font-medium" />
          )}
        </div>
      </Card>

      {/* Audit Timeline Logs Container */}
      <Card className="p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm space-y-6">
        <div>
          <h3 className="text-xs font-black text-foreground uppercase tracking-widest leading-none">
            Department Archive Compliance Record
          </h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1.5">
            Cryptographic trace timeline of finalized school files and verified board dispatch
          </p>
        </div>

        <div className="space-y-4">
          {complianceTimeline.map((item, idx) => (
            <div 
              key={idx} 
              className="p-4 sm:p-5 bg-muted border border-border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-[9px] font-black font-mono text-muted-foreground bg-card border border-border rounded-md px-2 py-0.5">
                    {item.time}
                  </span>
                  <h4 className="text-xs font-black text-foreground tracking-tight">
                    {item.event}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-2xl">
                  {item.detail}
                </p>
              </div>

              <span className="font-mono text-[10px] font-bold bg-muted text-foreground px-2.5 py-1 rounded-md shrink-0 self-start md:self-center">
                CRC32: {item.hash}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}