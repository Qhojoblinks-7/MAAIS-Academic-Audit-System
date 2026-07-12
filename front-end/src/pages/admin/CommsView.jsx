import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  GraduationCap, 
  ClipboardCheck, 
  AlertTriangle, 
  UserPlus, 
  ArrowRight,
  Timer,
  ShieldAlert,
  FilePlus,
  Link as LinkIcon,
  FileText as FileIcon,
  ExternalLink,
  Plus,
  Trash2,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { useTimetableEntries } from '../../lib/hooks';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

export function CommsView() {
  const { user } = useRole();
  const navigate = useNavigate();
  const timetableQuery = useTimetableEntries();
  const timetableEntries = timetableQuery.data || [];

  const timetableData = useMemo(() => {
    if (timetableEntries.length > 0) {
      return timetableEntries.map((entry) => ({
        id: entry.id,
        day: entry.dayOfWeek || entry.day || 'Monday',
        startTime: entry.startTime,
        endTime: entry.endTime,
        subjectName: entry.subject?.name || entry.subjectName || 'Unknown',
        className: entry.classSection?.name || entry.className || 'Unknown',
        venue: entry.venue || 'TBD',
        type: entry.type || 'REGULAR',
        tasks: [],
        materials: [],
        missingObservations: 0,
        isClash: false,
      }));
    }
    return [];
  }, [timetableEntries]);

  const [view, setView] = React.useState('weekly');
  const [selectedDay, setSelectedDay] = React.useState('Monday');
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [hoveredId, setHoveredId] = React.useState(null);
  
  // Resource Management State
  const [selectedEntry, setSelectedEntry] = React.useState(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = React.useState(false);
  const [newMaterial, setNewMaterial] = React.useState({ title: '', url: '', type: 'LINK' });

  // Update current time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentPeriod = () => {
    const now = formatTime(currentTime);
    const day = DAYS[currentTime.getDay() - 1] || 'Monday';
    
    return timetableData.find(entry => 
      entry.day === day && 
      now >= entry.startTime && 
      now <= entry.endTime
    );
  };

  const getNextPeriod = () => {
    const now = formatTime(currentTime);
    const day = DAYS[currentTime.getDay() - 1] || 'Monday';
    
    const todayClasses = timetableData
      .filter(e => e.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
      
    return todayClasses.find(e => e.startTime > now);
  };

  const currentPeriod = getCurrentPeriod();
  const nextPeriod = getNextPeriod();

  const getTimePosition = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = (hours - 8) * 60 + minutes;
    return (totalMinutes / (10 * 60)) * 100;
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Now & Next Header */}
      <header className="px-8 pt-8 pb-6 bg-surface border-b border-border shadow-sm z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-primary-foreground">
              <Calendar size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-text-primary tracking-tight">Academic Schedule</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">System Sync Active</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-muted p-1 rounded-xl">
              <button 
                onClick={() => setView('daily')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all",
                  view === 'daily' ? "bg-surface text-brand-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <List size={16} />
                Daily Agenda
              </button>
              <button 
                onClick={() => setView('weekly')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all",
                  view === 'weekly' ? "bg-surface text-brand-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <LayoutGrid size={16} />
                Weekly Grid
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Current Period */}
          <div className={cn(
            "p-5 rounded-2xl border-2 flex items-center justify-between transition-all",
            currentPeriod ? "bg-brand-primary/10 border-brand-primary" : "bg-muted border-border"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                currentPeriod ? "bg-brand-primary text-primary-foreground" : "bg-muted text-text-secondary"
              )}>
                <Timer size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-0.5">Live Period</p>
                <h3 className="text-base font-black text-text-primary leading-tight">
                  {currentPeriod ? `${currentPeriod.subjectName} - ${currentPeriod.className}` : 'No Active Session'}
                </h3>
                {currentPeriod && (
                  <p className="text-[10px] font-bold text-brand-primary flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {currentPeriod.venue}
                  </p>
                )}
              </div>
            </div>
            {currentPeriod && (
              <button 
                onClick={() => navigate('/grading')}
                className="px-4 py-2 bg-brand-primary text-primary-foreground rounded-xl font-black text-[10px] hover:bg-brand-primary transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2"
              >
                Open Sheet
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Next Period */}
          <div className="p-5 bg-surface border border-border rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-text-secondary">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-0.5">Coming Up Next</p>
                <h3 className="text-base font-black text-text-primary leading-tight">
                  {nextPeriod ? `${nextPeriod.subjectName} - ${nextPeriod.className}` : 'End of Day'}
                </h3>
                {nextPeriod && (
                  <p className="text-[10px] font-bold text-text-secondary mt-0.5">Starts at {nextPeriod.startTime}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-0.5">PostgreSQL Lock</p>
              <p className="text-xs font-black text-destructive">4 Days Remaining</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {view === 'weekly' ? (
           <div className="h-full flex flex-col p-6 overflow-auto scrollbar-hide">
            <div className="min-w-[1000px] flex-1 flex flex-col">
              {/* Days Header */}
              <div className="flex border-b border-border pb-4">
                <div className="w-20" />
                {DAYS.map(day => (
                  <div key={day} className="flex-1 text-center">
                    <span className="text-sm font-black text-text-primary uppercase tracking-widest">{day}</span>
                  </div>
                ))}
              </div>

              {/* Grid Body */}
              <div className="flex-1 relative mt-4">
                {/* Time Indicators */}
                <div className="absolute inset-0 flex flex-col">
                  {HOURS.map(hour => (
                    <div key={hour} className="flex-1 border-t border-border relative">
                      <span className="absolute -left-16 -top-2.5 text-[10px] font-black text-text-secondary">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* Smart Indicator (Current Time Line) */}
                {currentTime.getDay() >= 1 && currentTime.getDay() <= 5 && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-destructive z-20 pointer-events-none flex items-center"
                    style={{ top: `${getTimePosition(formatTime(currentTime))}%` }}
                  >
                    <div className="w-2 h-2 bg-destructive rounded-full -ml-1" />
                    <div className="px-2 py-0.5 bg-destructive text-primary-foreground text-[8px] font-black rounded-full ml-2">
                      {formatTime(currentTime)}
                    </div>
                  </div>
                )}

                {/* Entries */}
                <div className="absolute inset-0 flex">
                  <div className="w-20" />
                  {DAYS.map(day => (
                    <div key={day} className="flex-1 relative border-r border-border last:border-r-0">
                      {timetableData.filter(e => e.day === day).map(entry => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onMouseEnter={() => setHoveredId(entry.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          className={cn(
                            "absolute left-1 right-1 rounded-xl p-2 border shadow-sm cursor-pointer group transition-all z-10 overflow-hidden flex flex-col",
                            entry.type === 'LAB' ? "bg-brand-primary/10 border-brand-primary" :
                            entry.type === 'SUBSTITUTION' ? "bg-brand-primary/10 border-brand-primary" :
                            "bg-surface border-border",
                            entry.isClash && "border-destructive ring-2 ring-destructive",
                            hoveredId === entry.id && "z-30 h-auto min-h-[120px] shadow-xl ring-2 ring-brand-primary/20"
                          )}
                          style={{
                            top: `${getTimePosition(entry.startTime)}%`,
                            height: hoveredId === entry.id ? 'auto' : `${getTimePosition(entry.endTime) - getTimePosition(entry.startTime)}%`
                          }}
                        >
                          <div className="flex justify-between items-start mb-1 shrink-0">
                            <span className={cn(
                              "text-[7px] font-black uppercase tracking-wider px-1 py-0.5 rounded",
                              entry.type === 'LAB' ? "bg-brand-primary/20 text-brand-primary" :
                              entry.type === 'SUBSTITUTION' ? "bg-brand-primary/20 text-brand-primary" :
                              "bg-muted text-text-secondary"
                            )}>
                              {entry.type}
                            </span>
                            <div className="flex gap-1">
                              {entry.missingObservations && (
                                <div className="w-3.5 h-3.5 bg-warning text-primary-foreground rounded-full flex items-center justify-center text-[8px] font-black">
                                  !
                                </div>
                              )}
                              {entry.isClash && (
                                <AlertTriangle size={10} className="text-destructive" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-h-0">
                            <h4 className="text-[10px] font-black text-text-primary leading-tight truncate group-hover:whitespace-normal">{entry.subjectName}</h4>
                            <p className="text-[8px] font-bold text-text-secondary truncate group-hover:whitespace-normal">{entry.className}</p>
                          </div>

                          <div className="mt-1 flex items-center gap-1 text-[7px] font-black text-text-secondary uppercase shrink-0">
                            <MapPin size={8} /> <span className="truncate">{entry.venue}</span>
                          </div>

                          {/* Expanded Content on Hover */}
                          <AnimatePresence>
                            {hoveredId === entry.id && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-2 pt-2 border-t border-border space-y-2"
                              >
                                {entry.tasks && (
                                  <div className="space-y-1">
                                    {entry.tasks.slice(0, 2).map((task, i) => (
                                      <div key={i} className="flex items-center gap-1">
                                        <div className="w-1 h-1 bg-brand-primary rounded-full" />
                                        <span className="text-[8px] font-bold text-text-secondary truncate">{task}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-1">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); navigate('/grading'); }}
                                    className="flex-1 py-1 bg-brand-primary text-primary-foreground text-[8px] font-black rounded-lg hover:bg-brand-primary transition-all"
                                  >
                                    Open Sheet
                                  </button>
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      setSelectedEntry(entry);
                                      setIsResourceModalOpen(true);
                                    }}
                                    className="flex-1 py-1 bg-surface border border-brand-primary text-brand-primary text-[8px] font-black rounded-lg hover:bg-brand-primary/10 transition-all flex items-center justify-center gap-1"
                                  >
                                    <LinkIcon size={8} />
                                    Materials
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
           <div className="h-full flex flex-col p-8 overflow-y-auto scrollbar-hide">
            <div className="max-w-3xl mx-auto w-full">
               <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => saetSelectedDay(day)}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap",
                      selectedDay === day ? "bg-brand-primary text-primary-foreground shadow-lg" : "bg-surface text-text-secondary hover:bg-muted"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {timetableData.filter(e => e.day === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(entry => (
                  <motion.div
                    key={entry.id}
                    layout
                    onMouseEnter={() => setHoveredId(entry.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      "bg-surface rounded-2xl p-5 border border-border flex flex-col group hover:border-brand-primary transition-all shadow-sm overflow-hidden",
                      entry.isClash && "border-destructive bg-destructive/30"
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-20 text-center border-r border-border pr-6 shrink-0">
                        <p className="text-base font-black text-text-primary">{entry.startTime}</p>
                        <p className="text-[9px] font-bold text-text-secondary uppercase">{entry.endTime}</p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-lg font-black text-text-primary truncate">{entry.subjectName}</h4>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0",
                            entry.type === 'LAB' ? "bg-brand-primary/10 text-brand-primary" :
                            entry.type === 'SUBSTITUTION' ? "bg-brand-primary/10 text-brand-primary" :
                            "bg-muted text-text-secondary"
                          )}>
                            {entry.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-xs font-bold text-text-secondary truncate">{entry.className}</p>
                          <span className="text-muted shrink-0">•</span>
                          <p className="text-xs font-bold text-text-secondary flex items-center gap-1 truncate">
                            <MapPin size={12} /> {entry.venue}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {entry.missingObservations && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning rounded-xl text-warning">
                            <ShieldAlert size={14} />
                            <span className="text-[9px] font-black uppercase">{entry.missingObservations} Missing</span>
                          </div>
                        )}
                        <button 
                          onClick={() => navigate('/grading')}
                          className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-text-secondary group-hover:bg-brand-primary group-hover:text-primary-foreground transition-all shadow-sm"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {hoveredId === entry.id && entry.tasks && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-border"
                        >
                          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-3">Session Tasks</p>
                          <div className="grid grid-cols-2 gap-3">
                            {entry.tasks.map((task, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-lg border border-border">
                                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
                                <span className="text-[10px] font-bold text-text-primary">{task}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex gap-3">
                            <button 
                              onClick={() => navigate('/grading')}
                              className="flex-1 py-2 bg-brand-primary text-primary-foreground text-xs font-black rounded-xl hover:bg-brand-primary transition-all"
                            >
                              Open Grading Sheet
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEntry(entry);
                                setIsResourceModalOpen(true);
                              }}
                              className="flex-1 py-2 bg-surface border border-brand-primary text-brand-primary text-xs font-black rounded-xl hover:bg-brand-primary/10 transition-all flex items-center justify-center gap-2"
                            >
                              <FilePlus size={14} />
                              Attach Materials
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
                
                {timetableData.filter(e => e.day === selectedDay).length === 0 && (
                  <div className="text-center py-20 bg-surface rounded-3xl border-2 border-dashed border-border">
                    <Calendar className="mx-auto text-muted mb-4" size={48} />
                    <h3 className="text-lg font-black text-text-primary">No Classes Scheduled</h3>
                    <p className="text-sm font-bold text-text-secondary">Enjoy your free period!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resource Management Modal */}
      <AnimatePresence>
        {isResourceModalOpen && selectedEntry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResourceModalOpen(false)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-background rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 bg-surface border-b border-border flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-primary-foreground">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-text-primary tracking-tight">Learning Materials</h3>
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{selectedEntry.subjectName} — {selectedEntry.className}</p>
                  </div>
                </div>
                <button onClick={() => setIsResourceModalOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-all text-text-secondary">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                {/* Current Materials */}
                <div>
                  <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-4">Linked Resources</h4>
                  <div className="space-y-3">
                    {selectedEntry.materials?.length ? selectedEntry.materials.map(material => (
                      <div key={material.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-2xl group hover:border-brand-primary transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            material.type === 'PDF' ? "bg-destructive/10 text-destructive" : "bg-brand-primary/10 text-brand-primary"
                          )}>
                            {material.type === 'PDF' ? <FileIcon size={20} /> : <LinkIcon size={20} />}
                          </div>
                          <div>
                            <p className="text-[14px] font-black text-text-primary tracking-tight leading-none mb-1">{material.title}</p>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest leading-none">Added on {material.addedAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <a href={material.url} target="_blank" rel="noopener noreferrer" className="p-2 text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all">
                            <ExternalLink size={18} />
                          </a>
                          <button className="p-2 text-text-secondary hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-10 border-2 border-dashed border-border rounded-3xl">
                        <FileIcon className="mx-auto text-muted mb-2" size={32} />
                        <p className="text-xs font-bold text-text-secondary italic">No resources attached to this session.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add New Material Form: Only visible to teachers/HOD */}
                {user?.role !== 'STUDENT' && (
                  <div className="pt-8 border-t border-border">
                    <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-4">Attach New Material</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">Resource Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Week 4 Practical Guide" 
                            value={newMaterial.title}
                            onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-5 py-3.5 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all shadow-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">Resource Type</label>
                          <div className="flex p-1 bg-muted rounded-xl">
                            {['LINK', 'PDF'].map(t => (
                              <button
                                key={t}
                                onClick={() => setNewMaterial(prev => ({ ...prev, type: t }))}
                                className={cn(
                                  "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                  newMaterial.type === t ? "bg-surface text-brand-primary shadow-sm" : "text-text-secondary"
                                )}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">Link URL (or PDF storage path)</label>
                        <div className="relative">
                          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                          <input 
                            type="text" 
                            placeholder="https://..." 
                            value={newMaterial.url}
                            onChange={(e) => setNewMaterial(prev => ({ ...prev, url: e.target.value }))}
                            className="w-full pl-12 pr-5 py-3.5 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all shadow-sm"
                          />
                        </div>
                      </div>
                      <button className="w-full py-4 bg-brand-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all shadow-xl shadow-brand-primary/10 flex items-center justify-center gap-3">
                        <Plus size={16} />
                        Append to Session Registry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
