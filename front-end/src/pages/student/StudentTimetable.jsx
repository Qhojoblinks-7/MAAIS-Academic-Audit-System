import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStudentStore } from '../../stores/useStudentStore';
import { useStudentTimetable, useStudentPortalData } from '../../hooks/api/useStudentApi';
import { useRole } from '../../context/RoleContext';

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

class StudentTimetableErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('StudentTimetable Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 md:p-8 lg:p-12 pb-24 no-scrollbar">
          <div className="max-w-4xl mx-auto">
            <div className="bg-surface rounded-2xl border border-border p-6 text-center">
              <h2 className="text-lg font-bold text-text-primary mb-2">Unable to load timetable</h2>
              <p className="text-sm text-text-secondary">
                {this.state.error?.message || 'Please try again later.'}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function StudentTimetable() {
  const { user } = useRole();
  const { data: portalData, loading: portalLoading, error: portalError } = useStudentPortalData(user?.id || null);
  const { timetable, loading, error, refetch } = useStudentTimetable(portalData?.student?.currentClassId);
  const store = useStudentStore();

  useEffect(() => {
    if (error) {
      store.setTimetableError(error);
    }
  }, [error, store]);

  const source = Array.isArray(timetable) && timetable.length > 0 
    ? timetable 
    : (Array.isArray(store.timetable) ? store.timetable : []);
  
  const derivedSchedules = source.length > 0 
    ? Object.entries(
        source.reduce((acc, entry) => {
          if (!entry) return acc;
          const dayKey = entry.dayOfWeek || entry.day;
          const day = DAY_MAP[dayKey] || dayKey || 'Unknown';
          if (!acc[day]) acc[day] = [];
          acc[day].push(entry);
          return acc;
        }, {}),
      ).map(([day, items]) => ({
        day,
        items: (items || []).map((entry) => ({
          time: `${entry.startTime || entry.start_time || ''} - ${entry.endTime || entry.end_time || ''}`,
          subject: entry.subject?.name || entry.subjectName || 'Unknown',
          room: entry.room || '-',
          type: entry.type || 'CLASS',
        })),
      }))
    : [];

  if (loading && source.length === 0) {
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
              Weekly class & lab schedule
            </p>
          </div>
        </header>

        <div className="space-y-4 sm:space-y-6">
          {derivedSchedules.length > 0 ? derivedSchedules.map(({ day, items }) => (
            <div
              key={day}
              className="bg-surface rounded-2xl sm:rounded-[2rem] border border-border shadow-sm overflow-hidden"
            >
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
                      <div className="text-[10px] font-black text-text-secondary uppercase tracking-wider font-mono shrink-0 sm:min-w-[75px]">
                        {item.time}
                      </div>

                      <div className={cn(
                        'flex-1 px-4 py-3 rounded-xl border flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 min-w-0',
                        DAY_TYPE_STYLES[item.type] || DAY_TYPE_STYLES.CLASS,
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
            </div>
          )) : (
            <div className="bg-surface rounded-2xl sm:rounded-[2rem] border border-border shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 text-center text-text-secondary text-sm">
                {loading ? 'Loading timetable...' : 'No timetable entries found for your class.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StudentTimetableWithErrorBoundary = (props) => (
  <StudentTimetableErrorBoundary>
    <StudentTimetable {...props} />
  </StudentTimetableErrorBoundary>
);

export default StudentTimetableWithErrorBoundary;