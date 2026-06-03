import React, { useState, useEffect } from 'react';
import { useRole } from '../../context/RoleContext';
import { useTeacherTimetable } from '../../hooks/useTeacherTimetable';
import { WeeklyTimetableView } from './WeeklyTimetableView';
import { DailyTimetableView } from './DailyTimetableView';
import { ResourceModal } from './ResourceModal';
import { useUI } from '../../context/UIContext';

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

import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

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

{"/* ── Loading Screen ── */"}
   if (loading) {
     return (
       <div className="flex-1 flex flex-col bg-muted backdrop-blur-md items-center justify-center gap-4">
         <div className="relative">
           <div className="w-12 h-12 border-[3px] border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
           <BookOpen size={16} className="absolute inset-0 m-auto text-brand-primary animate-pulse" />
         </div>
         <div className="text-center">
           <p className="text-sm font-bold text-muted-foreground">Syncing Schedule Vault</p>
           <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">WAEC STP Compliance T-AR-1.1</p>
         </div>
       </div>
     );
   }

   {"/* ── Error Screen ── */"}
   if (error) {
     return (
       <div className="flex-1 flex flex-col bg-muted backdrop-blur-md p-6 justify-center items-center">
         <Card className="p-6 max-w-sm text-center shadow-xl">
           <div className="w-12 h-12 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center justify-center mx-auto mb-3">
             <AlertCircle size={22} />
           </div>
           <h3 className="text-sm font-bold text-foreground">Data Boundary Isolation Timeout</h3>
           <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
             We could not pull your specific subject data profile securely. Please reload to re-authenticate context.
           </p>
           <Button 
             onClick={() => window.location.reload()} 
             className="mt-5 inline-flex items-center gap-2 font-bold shadow-sm"
           >
             <RefreshCw size={12} />
             Re-verify Security Token
           </Button>
         </Card>
       </div>
     );
   }

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-muted overflow-hidden">
      
      {/* LEFT: Live Status Command Column */}
      <div className="w-full lg:w-80 bg-card border-b lg:border-b-0 lg:border-r border-border p-5 flex flex-col shrink-0 gap-5">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-brand-primary uppercase bg-brand-primary/10 px-2 py-1 rounded-md">
            Live Schedule Portal
          </span>
          <h1 className="text-xl font-bold text-foreground mt-2 tracking-tight">Your Classes</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Isolated department access view.</p>
        </div>

        {/* View Segment Switcher */}
        <div className="bg-muted p-1 rounded-xl flex items-center gap-1">
          <Button
            variant={view === 'weekly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('weekly')}
            className="flex-1 justify-center gap-2 font-bold"
          >
            <Layers size={14} />
            Weekly View
          </Button>
          <Button
            variant={view === 'daily' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('daily')}
            className="flex-1 justify-center gap-2 font-bold"
          >
            <Calendar size={14} />
            Daily Grid
          </Button>
        </div>

        <hr className="border-border" />

        {/* Dynamic Class Insight HUD Cards */}
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto subtle-scrollbar">
          
          {/* Current Period Frame */}
          <Card className="p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 bg-foreground/5 rounded-bl-full translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform" />
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Happening Now
            </div>
            
            {currentPeriod ? (
              <div className="mt-3">
                <h3 className="text-base font-bold tracking-tight">{currentPeriod.subject}</h3>
                <p className="text-xs text-muted/80 font-medium mt-0.5">{currentPeriod.className} • Room {currentPeriod.room}</p>
                <div className="flex items-center gap-1.5 mt-4 text-[11px] text-muted/80 font-medium bg-foreground/10 w-fit px-2 py-1 rounded-md">
                  <Clock size={12} />
                  {currentPeriod.startTime} - {currentPeriod.endTime}
                </div>
              </div>
            ) : (
              <div className="mt-3 py-2 text-muted-foreground text-xs font-medium italic">
                No active class session right now.
              </div>
            )}
          </Card>

          {/* Up Next Frame */}
          <Card className="p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Sparkles size={11} className="text-warning" />
              Up Next Today
            </div>

            {nextPeriod ? (
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-foreground">{nextPeriod.subject}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-semibold">{nextPeriod.className} • Room {nextPeriod.room}</p>
                  <p className="text-[10px] text-brand-primary font-bold mt-2 bg-brand-primary/10 px-1.5 py-0.5 rounded w-fit">
                    Starts {nextPeriod.startTime}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-border">
                  <ArrowRight size={14} />
                </div>
              </div>
            ) : (
              <div className="mt-3 py-2 text-muted-foreground text-xs font-medium italic">
                Done for the day!
              </div>
            )}
          </Card>
          
        </div>

        {/* Global Floating Actions Anchor */}
        {view === 'daily' && (
          <Button
            onClick={() => {
              setSelectedEntry(currentPeriod || timetable[0]);
              setIsResourceModalOpen(true);
            }}
            disabled={timetable.length === 0}
            className="w-full justify-center gap-2 shadow-sm"
            variant="default"
          >
            <FilePlus size={14} />
            Attach Lesson Materials
          </Button>
        )}
      </div>

      {/* RIGHT: Primary Schedule View Canvas Frame */}
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

      {/* Global Context Resource Interstitial Modal */}
      <ResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        selectedEntry={selectedEntry}
        user={user}
        newMaterial={newMaterial}
        setNewMaterial={setNewMaterial}
      />
    </div>
  );
}