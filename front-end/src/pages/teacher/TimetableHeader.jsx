import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowRight, Timer, LayoutGrid, List, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

export function TimetableHeader({ currentPeriod, nextPeriod, formatTime, view, setView }) {
  const navigate = useNavigate();

  // 1. Live Period Section Card Component View
  const renderLivePeriodCard = () => {
    const isActive = !!currentPeriod;
    
    return (
      <Card className={cn("p-5 flex items-center justify-between transition-all duration-200", isActive ? "bg-success/10 border-success/20" : "bg-muted border-border")}>
        <div className="flex items-center gap-4 min-w-0">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            isActive ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
          )}>
            <Timer size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Live Period</p>
            <h3 className="text-base font-black text-foreground leading-tight truncate">
              {isActive ? `${currentPeriod.subjectName} — ${currentPeriod.className}` : 'No Active Session'}
            </h3>
            {isActive && (
              <p className="text-[10px] font-bold text-success flex items-center gap-1 mt-1 uppercase tracking-wider">
                <MapPin size={10} className="shrink-0" /> {currentPeriod.venue}
              </p>
            )}
          </div>
        </div>
        {isActive && (
          <Button 
            onClick={() => navigate('/grading')}
            className="gap-2 font-bold shadow-lg"
          >
            Open Sheet
            <ArrowRight size={14} />
          </Button>
        )}
      </Card>
    );
  };

  // 2. Next Up Section Card Component View
  const renderNextPeriodCard = () => {
    const hasNext = !!nextPeriod;
    
    return (
      <Card className="p-5 flex items-center justify-between min-w-0">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground shrink-0 border border-border">
            <Clock size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Coming Up Next</p>
            <h3 className="text-base font-black text-foreground leading-tight truncate">
              {hasNext ? `${nextPeriod.subjectName} — ${nextPeriod.className}` : 'End of Day'}
            </h3>
            {hasNext && (
              <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                Starts at {nextPeriod.startTime}
              </p>
            )}
          </div>
        </div>

        {/* Database Lock Warning Anchor Block */}
        <div className="text-right shrink-0 pl-4 border-l border-border">
          <div className="flex items-center gap-1 justify-end text-destructive mb-0.5">
            <ShieldAlert size={12} />
            <p className="text-[9px] font-black uppercase tracking-widest">PostgreSQL Lock</p>
          </div>
          <p className="text-xs font-black text-destructive bg-destructive/10 px-2 py-0.5 rounded-md inline-block">
            4 Days Remaining
          </p>
        </div>
      </Card>
    );
  };

  return (
    <header className="px-8 pt-8 pb-6 bg-card border-b border-border shadow-sm z-10 select-none">
      {/* Upper Navigation Action Bar Area */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-md shadow-brand-primary/10">
            <Calendar size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Academic Schedule</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">System Sync Active</p>
            </div>
          </div>
        </div>

        {/* Agenda Grid Toggles */}
        <div className="flex items-center gap-4">
          <div className="flex bg-muted p-1 rounded-xl border border-border">
            <Button 
              variant={view === 'daily' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('daily')}
              className="justify-center gap-2 font-bold"
            >
              <List size={14} />
              Daily Agenda
            </Button>
            <Button 
              variant={view === 'weekly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('weekly')}
              className="justify-center gap-2 font-bold"
            >
              <LayoutGrid size={14} />
              Weekly Grid
            </Button>
          </div>
        </div>
      </div>

      {/* Main Stats Dynamic Information Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {renderLivePeriodCard()}
        {renderNextPeriodCard()}
      </div>
    </header>
  );
}