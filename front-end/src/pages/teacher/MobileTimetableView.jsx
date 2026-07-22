import React, { useState } from 'react';
import { Clock, MapPin, BookOpen, FilePlus, ChevronLeft, CalendarDays } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useTeacherTimetable } from '../../hooks/useTeacherTimetable';
import { useRole } from '../../context/RoleContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function MobileTimetableView() {
  const navigate = useNavigate();
  const { user } = useRole();
  const { timetable, loading, error } = useTeacherTimetable();
  const [selectedDay, setSelectedDay] = useState('Monday');

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentDayTimetable = () => {
    return timetable.filter(e => e.day === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getDayInitials = (day) => {
    return day.slice(0, 3).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-success/30 border-t-success rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-primary">Loading Schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="text-center">
          <p className="text-sm font-bold text-primary">Unable to load timetable</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-success text-white rounded-xl text-xs font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const dayClasses = getCurrentDayTimetable();

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button 
              onClick={() => navigate(-1)}
              className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-transform"
            >
              <ChevronLeft size={18} className="text-primary" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-black text-primary truncate leading-tight">My Timetable</h1>
              <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest truncate">Live Schedule</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => document.getElementById('day-selector')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors shrink-0"
            aria-label="Jump to days"
          >
            <CalendarDays size={16} />
          </button>
        </div>
      </header>

      {/* Day Selector */}
      <div id="day-selector" className="bg-surface border-b border-border px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap",
                selectedDay === day 
                  ? "bg-success text-white" 
                  : "bg-muted text-secondary hover:bg-border"
              )}
            >
              <span className="text-[10px] leading-none">{getDayInitials(day)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {dayClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <CalendarIcon size={48} className="text-secondary mb-4" />
            <h3 className="text-lg font-black text-primary mb-2">No Classes</h3>
            <p className="text-sm font-bold text-secondary">Enjoy your free period!</p>
          </div>
        ) : (
          <div className="space-y-3">
              {dayClasses.map((entry, idx) => (
                <div
                  key={entry.id}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="bg-card rounded-2xl p-4 border border-border animate-in fade-in slide-in-from-bottom-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-16 text-center">
                      <p className="text-base font-black text-primary">{entry.startTime}</p>
                      <p className="text-xs font-bold text-secondary">{entry.endTime}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-black uppercase",
                      entry.type === 'LAB' ? "bg-success/10 text-success" :
                      entry.type === 'SUBSTITUTION' ? "bg-brand-secondary/10 text-brand-secondary" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {entry.type}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-primary mb-2">{entry.subjectName}</h4>
                  
                  <div className="flex items-center gap-3 text-xs font-bold text-secondary mb-3">
                    <span className="truncate">{entry.className}</span>
                    <span className="text-border">•</span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin size={12} /> {entry.room || entry.venue}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                       onClick={() => navigate(`/teacher/grading-mobile?subject=${encodeURIComponent(entry.subjectName)}&class=${encodeURIComponent(entry.className)}`)}
                      className="flex-1 py-2.5 bg-success/10 text-success rounded-xl text-xs font-black hover:bg-success/20 transition-all"
                    >
                      Grade Now
                    </button>
                    <button
                      onClick={() => {}}
                      className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-secondary"
                    >
                      <BookOpen size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}