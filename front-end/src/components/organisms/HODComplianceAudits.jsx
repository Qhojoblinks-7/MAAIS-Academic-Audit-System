import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShieldCheck } from 'lucide-react';

export function HODComplianceAudits({ performanceData, auditLogs }) {
  const defaultPerformanceData = [
    { year: '2021', AvgGrade: 72.4, HighGrade: 91 },
    { year: '2022', AvgGrade: 76.8, HighGrade: 94 },
    { year: '2023', AvgGrade: 80.2, HighGrade: 96 },
    { year: '2024', AvgGrade: 83.1, HighGrade: 98 }
  ];

  const defaultAuditLogs = [
    { time: 'June 2024', event: 'Class of 2024 Dossier Lock', detail: '410 student records signed and generated as read-only PDF transcripts.', hash: 'MAAIS-L4-SEC-2024' },
    { time: 'June 2023', event: 'Class of 2023 Archive Sync', detail: 'Transcripts certified with verified National Exam results integration.', hash: 'MAAIS-L4-SEC-2023' },
    { time: 'July 2022', event: 'Class of 2022 Deep Archive Write', detail: 'Transferred terminal grading logs to secure offsite vault.', hash: 'MAAIS-L4-SEC-2022' }
  ];

  const chartData = performanceData || defaultPerformanceData;
  const logs = auditLogs || defaultAuditLogs;

  return (
    <motion.div 
      key="compliance"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto"
    >
      {/* Performance Chart tracking past averages */}
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-200/60 p-4 sm:p-8 shadow-sm">
        <header className="flex items-center gap-3 mb-5 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 shrink-0">
            <TrendingUp size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest leading-none truncate">
              Longitudinal Cohort Comparisons
            </h3>
            {/* Desktop Subtitle */}
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 hidden sm:block">
              Performance metrics mapping between completely graduated years
            </p>
            {/* Mobile Subtitle */}
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 sm:hidden">
              Graduated years performance
            </p>
          </div>
        </header>

        {/* Responsive Chart Container with safe mobile sizing handles */}
        <div className="h-[220px] sm:h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                axisLine={false} 
                tickLine={false} 
                dy={8}
              />
              <YAxis 
                domain={[50, 100]} 
                tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '12px', 
                  border: 'none', 
                  color: 'white', 
                  fontSize: '11px',
                  fontWeight: 800
                }} 
                formatter={(value) => [`${value}%`, 'Grade']}
              />
              <Bar dataKey="AvgGrade" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={45} />
              <Bar dataKey="HighGrade" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white border border-slate-200 p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm space-y-5">
        <div>
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
            Department Archive Compliance Record
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 leading-normal">
            Cryptographic trace timeline of finalized school files and verified board dispatch
          </p>
        </div>

        {/* Timeline Stack Container */}
        <div className="space-y-3 sm:space-y-4">
          {logs.map((item, idx) => (
            <div 
              key={idx} 
              className="p-4 sm:p-5 bg-slate-50 border-l-4 border-slate-900 border-y border-r border-slate-200/80 rounded-r-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all hover:border-slate-300"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Clean pure-CSS approach for mobile/desktop layout switches */}
                  <span className="hidden sm:inline-block text-[10px] font-black font-mono text-slate-500 bg-white border border-slate-200 rounded px-2 py-0.5 whitespace-nowrap">
                    {item.time} Cohort
                  </span>
                  <span className="sm:hidden text-[10px] font-black font-mono text-slate-500 bg-white border border-slate-200 rounded px-2 py-0.5 whitespace-nowrap">
                    {item.time.replace('Cohort', '').trim()}
                  </span>
                  
                  <h4 className="text-xs font-black text-slate-900 tracking-tight ml-1">
                    {item.event}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed max-w-2xl">
                  {item.detail}
                </p>
              </div>

              {/* Cryptographic Hash Badge */}
              <div className="shrink-0 self-start sm:self-center mt-1 sm:mt-0">
                <span className="font-mono text-[10px] font-extrabold bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg tracking-tight inline-block">
                  CRC32: {item.hash}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}