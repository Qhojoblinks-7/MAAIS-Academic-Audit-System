import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowRight, Timer, LayoutGrid, List, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../components/ui/tooltip';

export function TimetableHeader({ currentPeriod, nextPeriod, formatTime, view, setView }) {
  const navigate = useNavigate();

  const renderLivePeriodCard = () => {
    const isActive = !!currentPeriod;
    
    return (
      <div className={cn(
        "p-5 rounded-2xl border-2 flex items-center justify-between transition-all duration-200",
        isActive ? "bg-success/10 border-success/30" : "bg-muted border-border"
      )}>
        <div className="flex items-center gap-4 min-w-0">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            isActive ? "bg-success text-surface" : "bg-muted-foreground/20 text-text-secondary"
          )}>
            <Timer size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-0.5">Live Period</p>
            <h3 className="text-base font-black text-text-primary leading-tight truncate">
              {isActive ? `${currentPeriod.subjectName} — ${currentPeriod.className}` : 'No Active Session'}
            </h3>
            {isActive && (
              <p className="text-[10px] font-bold text-success mt-1 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={10} className="shrink-0" /> {currentPeriod.venue}
              </p>
            )}
          </div>
        </div>
        {isActive && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => navigate('/grading')}
                className="px-4 py-2 bg-success hover:bg-success/80 text-surface rounded-xl font-black text-[10px] uppercase tracking-wider transition-all shadow-lg shadow-brand-dark/10 flex items-center gap-2 shrink-0"
              >
                Open Sheet
                <ArrowRight size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>Open grading sheet for this period</TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };

  const renderNextPeriodCard = () => {
    const hasNext = !!nextPeriod;
    
    return (
      <div className="p-5 bg-surface border border-border rounded-2xl flex items-center justify-between min-w-0">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-text-secondary shrink-0 border border-border">
            <Clock size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-0.5">Coming Up Next</p>
            <h3 className="text-base font-black text-text-primary leading-tight truncate">
              {hasNext ? `${nextPeriod.subjectName} — ${nextPeriod.className}` : 'End of Day'}
            </h3>
            {hasNext && (
              <p className="text-[10px] font-bold text-text-secondary mt-1 uppercase tracking-wider">
                Starts at {nextPeriod.startTime}
              </p>
            )}
          </div>
        </div>

        <div className="text-right shrink-0 pl-4 border-l border-border">
          <div className="flex items-center gap-1 justify-end text-danger mb-0.5">
            <ShieldAlert size={12} />
            <p className="text-[9px] font-black uppercase tracking-widest">PostgreSQL Lock</p>
          </div>
          <p className="text-xs font-black text-danger bg-danger/10 px-2 py-0.5 rounded-md inline-block">
            4 Days Remaining
          </p>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <header className="px-8 pt-8 pb-6 bg-surface border-b border-border shadow-sm z-10 select-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center text-surface shadow-md shadow-brand-dark/10">
              <Calendar size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-text-primary tracking-tight">Academic Schedule</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">System Sync Active</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-muted p-1 rounded-xl border border-border">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => setView('daily')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer",
                      view === 'daily' ? "bg-surface text-brand-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    <List size={14} />
                    Daily Agenda
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>Switch to daily view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={() => setView('weekly')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer",
                      view === 'weekly' ? "bg-surface text-brand-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    <LayoutGrid size={14} />
                    Weekly Grid
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>Switch to weekly view</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          {renderLivePeriodCard()}
          {renderNextPeriodCard()}
        </div>
      </header>
    </TooltipProvider>
  );
}
