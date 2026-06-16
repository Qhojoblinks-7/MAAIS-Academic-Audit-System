import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getAuthToken } from '../../services/auth';

const DAY_MAP = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
};

const DAY_TYPE_STYLES = {
  CLASS: 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary',
  LAB: 'bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary',
  BREAK: 'bg-border/40 text-text-secondary',
  SPORTS: 'bg-success/10 border-success/20 text-success',
  STUDY: 'bg-text-secondary/10 border-text-secondary/20 text-text-secondary',
  ASSEMBLY: 'bg-warning/10 border-warning/20 text-warning',
};

export function StudentTimetable() {
  const [schedule, setSchedule] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch('/api/v1/timetable/student-schedule', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setSchedule(data);
        }
      } catch (e) {
        console.error('Failed to fetch timetable:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const DAY_SCHEDULES = Object.entries(schedule).map(([dayKey, items]) => ({
    day: DAY_MAP[dayKey] || dayKey,
    items: (items || []).map((entry) => ({
      time: entry.startTime || '',
      subject: entry.subject?.name || 'Unknown',
      room: entry.room || '-',
      type: entry.subject?.type === 'ELECTIVE' ? 'LAB' : 'CLASS',
    })),
  }));

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 md:p-8 lg:p-12 pb-24 no-scrollbar">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-text-secondary">Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 md:p-8 lg:p-12 pb-24 no-scrollbar">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 no-scrollbar">
        
        {/* Module Title Area */}
        <header className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-brand-dark rounded-xl sm:rounded-2xl flex items-center justify-center text-surface shrink-0 shadow-lg shadow-brand-dark/10">
            <Calendar size={24} className="sm:hidden" />
            <Calendar size={28} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight uppercase italic">
              My Timetable
            </h1>
            <p className="text-[9px] sm:text-[10px] font-black text-text-secondary uppercase tracking-widest mt-0.5 truncate">
              Weekly class &amp; lab schedule
            </p>
          </div>
        </header>

        {/* Schedule List */}
        <div className="space-y-4 sm:space-y-6">
          {DAY_SCHEDULES.length > 0 ? DAY_SCHEDULES.map(({ day, items }, dIdx) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dIdx * 0.04 }}
              className="bg-surface rounded-2xl sm:rounded-[2rem] border border-border shadow-sm overflow-hidden"
            >
              {/* Day Section Header */}
              <div className="bg-background/50 px-4 sm:px-6 py-3.5 border-b border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-text-secondary shrink-0" />
                  <span className="text-sm font-black text-text-primary uppercase tracking-wide italic">
                    {day}
                  </span>
                </div>
                <span className="text-[9px] font-black text-text-secondary bg-surface border border-border/60 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                  {items.filter(i => i.type !== 'BREAK' && i.type !== 'ASSEMBLY').length} Sessions
                </span>
              </div>

              {/* Day Card Timings Rows */}
              <div className="divide-y divide-border/40">
                {items.map((item, idx) => {
                  const isBreak = item.type === 'BREAK';
                  
                  if (isBreak) {
                    return (
                      <div 
                        key={idx} 
                        className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-4 px-4 sm:px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-wider bg-background/40 min-w-0"
                      >
                        <span className="font-mono text-text-secondary shrink-0">{item.time}</span>
                        <span className="text-text-secondary truncate">{item.subject}</span>
                        {item.room !== '-' && <span className="text-border font-normal normal-case truncate xs:ml-auto">@{item.room}</span>}
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={idx} 
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-background/40 transition-all min-w-0"
                    >
                      {/* Period Clock Component Block */}
                      <div className="text-[10px] font-black text-text-secondary uppercase tracking-wider font-mono shrink-0 sm:min-w-[75px]">
                        {item.time}
                      </div>
                      
                      {/* Data Meta Wrapper Capsule */}
                      <div className={cn(
                        "flex-1 px-4 py-3 rounded-xl border flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 min-w-0", 
                        DAY_TYPE_STYLES[item.type] || DAY_TYPE_STYLES.CLASS
                      )}>
                        <div className="min-w-0">
                          <p className="text-[13px] font-black tracking-tight text-inherit truncate leading-snug">
                            {item.subject}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-inherit opacity-75 min-w-0">
                            <MapPin size={11} className="shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                              {item.room}
                            </span>
                          </div>
                        </div>
                        
                        <div className="shrink-0 self-start xs:self-center">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-surface border border-current/10 rounded-md">
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )) : (
            <p className="text-center text-text-secondary py-8">No timetable data available</p>
          )}
        </div>
      </div>
    </div>
  );
}