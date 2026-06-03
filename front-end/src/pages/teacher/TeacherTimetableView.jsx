import React, { useState, useEffect } from 'react';
import { useRole } from '../../context/RoleContext';
import { useTeacherTimetable } from '../../hooks/useTeacherTimetable';
import { WeeklyTimetableView } from './WeeklyTimetableView';
import { DailyTimetableView } from './DailyTimetableView';
import { ResourceModal } from './ResourceModal';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../components/ui/tooltip';
import { Button } from '../../components/ui/button';

import { 
  Clock, 
  Calendar, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  FilePlus, 
  AlertCircle, 
  RefreshCw, 
  BookOpen 
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function TeacherTimetableView() {
  const { user } = useRole();
  const { timetable: fetchedTimetable, loading, error } = useTeacherTimetable();

  const [view, setView] = useState('weekly');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredId, setHoveredId] = useState(null);

  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', url: '', type: 'LINK' });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timetable = fetchedTimetable || [];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentPeriod = () => {
    const now = formatTime(currentTime);
    const day = DAYS[currentTime.getDay() - 1] || 'Monday';
    return timetable.find(entry => 
      entry.day === day && now >= entry.startTime && now <= entry.endTime
    );
  };

  const getNextPeriod = () => {
    const now = formatTime(currentTime);
    const day = DAYS[currentTime.getDay() - 1] || 'Monday';
    const todayClasses = timetable
      .filter(e => e.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return todayClasses.find(e => e.startTime > now);
  };

  const getTimePosition = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = (hours - 8) * 60 + minutes;
    return (totalMinutes / (10 * 60)) * 100;
  };

  const currentPeriod = getCurrentPeriod();
  const nextPeriod = getNextPeriod();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-background backdrop-blur-md items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-[3px] border-success/30 border-t-success rounded-full animate-spin" />
          <BookOpen size={16} className="absolute inset-0 m-auto text-success animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-text-primary tracking-tight">Syncing Schedule Vault</p>
          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest mt-0.5">WAEC STP Compliance T-AR-1.1</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col bg-background backdrop-blur-md p-6 justify-center items-center">
        <div className="bg-surface rounded-2xl p-6 max-w-sm text-center border border-border shadow-xl shadow-brand-dark/5">
          <div className="w-12 h-12 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={22} />
          </div>
          <h3 className="text-sm font-bold text-text-primary">Data Boundary Isolation Timeout</h3>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed">
            We could not pull your specific subject data profile securely. Please reload to re-authenticate context.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="default"
            size="sm"
            className="mt-5 gap-2"
          >
            <RefreshCw size={12} />
            Re-verify Security Token
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex-1 flex flex-col lg:flex-row bg-background overflow-hidden">
        
        <div className="w-full lg:w-80 bg-surface border-b lg:border-b-0 lg:border-r border-border p-5 flex flex-col shrink-0 gap-5">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-success uppercase bg-success/10 px-2 py-1 rounded-md">
              Live Schedule Portal
            </span>
            <h1 className="text-xl font-bold text-text-primary mt-2 tracking-tight">Your Classes</h1>
            <p className="text-xs text-text-secondary mt-0.5">Isolated department access view.</p>
          </div>

          <div className="bg-muted p-1 rounded-xl flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setView('weekly')}
                    variant={view === 'weekly' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="flex-1"
                  >
                    <Layers size={14} />
                    Weekly View
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>Weekly schedule grid</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setView('daily')}
                    variant={view === 'daily' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="flex-1"
                  >
                    <Calendar size={14} />
                    Daily Grid
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>Daily class list</TooltipContent>
              </Tooltip>
          </div>

          <hr className="border-border" />

          <div className="flex flex-col gap-3 flex-1 overflow-y-auto no-scrollbar">
            
            <div className="bg-brand-dark rounded-xl p-4 text-surface shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 bg-white/5 rounded-bl-full translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform" />
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Happening Now
              </div>
              
              {currentPeriod ? (
                <div className="mt-3">
                  <h3 className="text-base font-bold tracking-tight">{currentPeriod.subject}</h3>
                  <p className="text-xs text-text-secondary font-medium mt-0.5">{currentPeriod.className} • Room {currentPeriod.room}</p>
                  <div className="flex items-center gap-1.5 mt-4 text-[11px] text-text-secondary font-medium bg-white/10 w-fit px-2 py-1 rounded-md">
                    <Clock size={12} />
                    {currentPeriod.startTime} - {currentPeriod.endTime}
                  </div>
                </div>
              ) : (
                <div className="mt-3 py-2 text-text-secondary text-xs font-medium italic">
                  No active class session right now.
                </div>
              )}
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                <Sparkles size={11} className="text-warning" />
                Up Next Today
              </div>

              {nextPeriod ? (
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">{nextPeriod.subject}</h3>
                    <p className="text-[11px] text-text-secondary mt-0.5 font-semibold">{nextPeriod.className} • Room {nextPeriod.room}</p>
                    <p className="text-[10px] text-success font-bold mt-2 bg-success/10 px-1.5 py-0.5 rounded w-fit">
                      Starts {nextPeriod.startTime}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-text-secondary border border-border">
                    <ArrowRight size={14} />
                  </div>
                </div>
              ) : (
                <div className="mt-3 py-2 text-text-secondary text-xs font-medium italic">
                  Done for the day!
                </div>
              )}
            </div>
            
          </div>

          {view === 'daily' && (
            <Button
              onClick={() => {
                setSelectedEntry(currentPeriod || timetable[0]);
                setIsResourceModalOpen(true);
              }}
              disabled={timetable.length === 0}
              className="w-full gap-2"
            >
              <FilePlus size={14} />
              Attach Lesson Materials
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {view === 'weekly' ? (
            <WeeklyTimetableView
              timetable={timetable}
              currentTime={currentTime}
              getTimePosition={getTimePosition}
              formatTime={formatTime}
              setHoveredId={setHoveredId}
              hoveredId={hoveredId}
            />
          ) : (
            <DailyTimetableView
              timetable={timetable}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              setHoveredId={setHoveredId}
              hoveredId={hoveredId}
              user={user}
              selectedEntry={selectedEntry}
              setSelectedEntry={setSelectedEntry}
              setIsResourceModalOpen={setIsResourceModalOpen}
              newMaterial={newMaterial}
              setNewMaterial={setNewMaterial}
            />
          )}
        </div>

        <ResourceModal
          isOpen={isResourceModalOpen}
          onClose={() => setIsResourceModalOpen(false)}
          selectedEntry={selectedEntry}
          user={user}
          newMaterial={newMaterial}
          setNewMaterial={setNewMaterial}
        />
      </div>
    </TooltipProvider>
  );
}
