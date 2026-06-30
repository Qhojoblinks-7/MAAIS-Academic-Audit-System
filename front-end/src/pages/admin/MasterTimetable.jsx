import React, { useState, useMemo } from 'react';
import {
  Clock, Calendar, Users, Home,
  AlertCircle, ChevronRight, ChevronLeft,
  Filter, Download, Share2, Plus,
  MoreVertical, Search, GripVertical,
  CheckCircle2, AlertTriangle, Layers,
  Trash2, Copy, Save, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Skeleton } from '../../components/ui/skeleton';
import { toast, Toaster } from '../../components/ui/toast.tsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';
import {
  useAllClasses,
  useClassAssignments,
  useTimetableEntries,
  useCreateTimetableEntry,
  useUpdateTimetableEntry,
  useDeleteTimetableEntry,
} from '../../lib/hooks';

const TIME_SLOTS = [
  { id: '1', start: '08:00', end: '08:40', label: 'Period 1' },
  { id: '2', start: '08:40', end: '09:20', label: 'Period 2' },
  { id: '3', start: '09:20', end: '10:00', label: 'Period 3' },
  { id: 'break1', start: '10:00', end: '10:30', label: 'Snack Break' },
  { id: '4', start: '10:30', end: '11:10', label: 'Period 4' },
  { id: '5', start: '11:10', end: '11:50', label: 'Period 5' },
  { id: '6', start: '11:50', end: '12:30', label: 'Period 6' },
  { id: 'break2', start: '12:30', end: '13:30', label: 'Lunch Break' },
  { id: '7', start: '13:30', end: '14:10', label: 'Period 7' },
  { id: '8', start: '14:10', end: '14:50', label: 'Period 8' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DAY_MAP = {
  Monday: 'MONDAY',
  Tuesday: 'TUESDAY',
  Wednesday: 'WEDNESDAY',
  Thursday: 'THURSDAY',
  Friday: 'FRIDAY',
};

const DEPT_COLORS = {
  Science: 'bg-blue-500',
  'General Arts': 'bg-purple-500',
  Business: 'bg-amber-500',
  Vocational: 'bg-emerald-500',
  HomeEconomics: 'bg-rose-500',
  'Visual Arts': 'bg-orange-500',
  default: 'bg-slate-500',
};

const getDeptColor = (subject) => {
  if (!subject) return DEPT_COLORS.default;
  const deptName = subject.department?.name || subject.departmentName || '';
  return DEPT_COLORS[deptName] || DEPT_COLORS.default;
};

export const MasterTimetable = () => {
   const classesQuery = useAllClasses();
   const classes = classesQuery.data || [];

   const classOptions = useMemo(() => {
     return classes
       .filter((c) => c.level && c.name && c.track === activeTrack)
       .map((c) => ({
         id: c.id,
         label: `${c.level.replace('FORM_', 'SHS ')} ${c.program || 'General'} ${c.name}`,
         level: c.level,
         program: c.program,
         name: c.name,
         track: c.track,
       }))
       .sort((a, b) => a.label.localeCompare(b.label));
   }, [classes, activeTrack]);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassLabel, setSelectedClassLabel] = useState('');
  const [activeTrack, setActiveTrack] = useState('Gold');
  const [isBroadcasted, setIsBroadcasted] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  const selectedClass = classOptions.find((c) => c.id === selectedClassId) || classOptions[0];
  const selectedClassName = selectedClass?.label || selectedClassLabel;

  const timetableQuery = useTimetableEntries(
    selectedClassId ? { classId: selectedClassId, track: activeTrack } : { track: activeTrack },
  );
  const timetableEntries = timetableQuery.data || [];

  const assignmentsQuery = useClassAssignments(selectedClassId, activeTrack);
  const assignments = assignmentsQuery.data || [];

  const createMutation = useCreateTimetableEntry();
  const updateMutation = useUpdateTimetableEntry();
  const deleteMutation = useDeleteTimetableEntry();

  const [schedule, setSchedule] = useState({});
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [savingSlot, setSavingSlot] = useState(null);

  React.useEffect(() => {
    if (classOptions.length > 0 && !selectedClassId) {
      setSelectedClassId(classOptions[0].id);
      setSelectedClassLabel(classOptions[0].label);
    }
  }, [classOptions, selectedClassId, selectedClassLabel]);

  React.useEffect(() => {
    if (!selectedClassId || !timetableEntries.length) {
      setSchedule({});
      return;
    }

    const built = {};
    timetableEntries.forEach((entry) => {
      const slotId = getSlotIdFromTime(entry.startTime);
      if (!slotId) return;
      const dayKey = DAY_MAP[entry.dayOfWeek] || entry.dayOfWeek;
      const slotKey = `${dayKey}-${slotId}`;
      const className = entry.classSection?.name
        ? `${entry.classSection.level?.replace('FORM_', 'SHS ') || ''} ${entry.classSection.program || 'General'} ${entry.classSection.name}`
        : 'Unknown Class';

      built[slotKey] = {
        id: entry.id,
        subject: entry.subject?.name || 'Unknown',
        class: className,
        teacher: entry.teacher
          ? `${entry.teacher.firstName || ''} ${entry.teacher.lastName || ''}`.trim() || 'Unknown'
          : 'Unknown',
        color: getDeptColor(entry.subject),
        entryId: entry.id,
        subjectId: entry.subjectId,
        teacherId: entry.teacherId,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        classSectionId: entry.classId,
        room: entry.room,
      };
    });
    setSchedule((prev) => ({ ...prev, [selectedClassName || '']: built }));
  }, [timetableEntries, selectedClassId, selectedClassName]);

  const getSlotIdFromTime = (time) => {
    const slot = TIME_SLOTS.find(
      (s) => s.start === time || (!s.id.startsWith('break') && s.start === time),
    );
    return slot?.id;
  };

  const getEntryForSlot = (day, slotId) => {
    const key = `${day}-${slotId}`;
    return schedule[selectedClassName || '']?.[key] || null;
  };

  const handleDragStart = (e, lesson) => {
    e.dataTransfer.setData('lessonId', lesson.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, slotKey) => {
    e.preventDefault();
    setDragOverSlot(slotKey);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = async (e, slotKey) => {
    e.preventDefault();
    setDragOverSlot(null);

    const lessonId = e.dataTransfer.getData('lessonId');
    const lesson = assignments.find((a) => a.id === lessonId);
    if (!lesson) return;

    const [day, slotId] = slotKey.split('-');
    if (slotId.startsWith('break')) return;

    const slot = TIME_SLOTS.find((s) => s.id === slotId);
    if (!slot) return;

    const startTime = slot.start;
    const endTime = slot.end;

    setSavingSlot(slotKey);

try {
       const body = {
         classId: selectedClassId,
         subjectId: lesson.subjectId,
         teacherId: lesson.teacherId,
         dayOfWeek: DAY_MAP[day] || day.toUpperCase(),
         startTime,
         endTime,
         track: activeTrack,
       };

      const created = await createMutation.mutateAsync(body);
      const newEntry = {
        id: created.id,
        subject: lesson.subject?.name || 'Unknown',
        class: selectedClassName || 'Unknown',
        teacher: lesson.teacher
          ? `${lesson.teacher.firstName || ''} ${lesson.teacher.lastName || ''}`.trim() || 'Unknown'
          : 'Unknown',
        color: getDeptColor(lesson.subject),
        entryId: created.id,
        subjectId: created.subjectId,
        teacherId: created.teacherId,
        dayOfWeek: created.dayOfWeek,
        startTime: created.startTime,
        endTime: created.endTime,
        classSectionId: created.classId,
        room: created.room,
      };

      setSchedule((prev) => {
        const classSchedule = { ...(prev[selectedClassName || ''] || {}) };
        classSchedule[slotKey] = newEntry;
        return {
          ...prev,
          [selectedClassName || '']: classSchedule,
        };
      });
      toast.success('Timetable entry created successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to create timetable entry');
    } finally {
      setSavingSlot(null);
    }
  };

  const removeLesson = async (slotKey) => {
    const entry = schedule[selectedClassName || '']?.[slotKey];
    if (!entry?.entryId) return;

    try {
      await deleteMutation.mutateAsync(entry.entryId);
      setSchedule((prev) => {
        const classSchedule = { ...(prev[selectedClassName || ''] || {}) };
        delete classSchedule[slotKey];
        return {
          ...prev,
          [selectedClassName || '']: classSchedule,
        };
      });
      toast.success('Timetable entry removed');
    } catch (err) {
      toast.error(err?.message || 'Failed to remove entry');
    }
  };

  const handleDistributeToApps = async () => {
    setIsBroadcasted(true);
    setTimeout(() => setIsBroadcasted(false), 4000);
  };

  const handleFinalizeGrid = async () => {
    setIsFinalized(true);
  };

  const conflicts = useMemo(() => {
    const teacherTimeRegistry = {};
    const conflictMap = {};

    Object.entries(schedule).forEach(([className, classSlots]) => {
      Object.entries(classSlots).forEach(([slotKey, lesson]) => {
        if (!lesson || !lesson.teacher) return;
        const registryKey = `${lesson.teacher}-${slotKey}`;
        if (!teacherTimeRegistry[registryKey]) {
          teacherTimeRegistry[registryKey] = [];
        }
        teacherTimeRegistry[registryKey].push(className);
      });
    });

    Object.entries(schedule).forEach(([className, classSlots]) => {
      Object.entries(classSlots).forEach(([slotKey, lesson]) => {
        if (!lesson || !lesson.teacher) return;
        const registryKey = `${lesson.teacher}-${slotKey}`;
        const assignedClasses = teacherTimeRegistry[registryKey] || [];

        if (assignedClasses.length > 1) {
          const conflictingClasses = assignedClasses.filter((c) => c !== className);
          conflictMap[`${className}-${slotKey}`] = {
            type: 'TEACHER',
            msg: `Teacher Conflict: ${lesson.teacher} is simultaneously assigned to ${conflictingClasses.join(', ')}.`,
          };
        }
      });
    });

    return conflictMap;
  }, [schedule]);

  const currentClassSchedule = schedule[selectedClassName || ''] || {};
  const unassignedLessons = useMemo(() => {
    const scheduledAssignmentIds = new Set();
    Object.values(currentClassSchedule).forEach((lesson) => {
      if (lesson?.subjectId && lesson?.teacherId) {
        scheduledAssignmentIds.add(`${lesson.subjectId}-${lesson.teacherId}`);
      }
    });

    return assignments
      .filter((a) => {
        const key = `${a.subjectId}-${a.teacherId}`;
        return !scheduledAssignmentIds.has(key);
      })
      .map((a) => ({
        id: a.id,
        subject: a.subject?.name || 'Unknown',
        class: selectedClassName || 'Unknown',
        teacher: a.teacher
          ? `${a.teacher.firstName || ''} ${a.teacher.lastName || ''}`.trim() || 'Unknown'
          : 'Unknown',
        color: getDeptColor(a.subject),
        subjectId: a.subjectId,
        teacherId: a.teacherId,
      }));
  }, [assignments, currentClassSchedule]);

  const isLoading = classesQuery.isLoading || timetableQuery.isLoading;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="p-8 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
        <Toaster />
        {(isBroadcasted || isFinalized) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'p-4 rounded-[2rem] border flex items-center gap-3',
              isFinalized
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900',
            )}
          >
            {isFinalized ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <p className="text-[10px] font-black uppercase tracking-widest">
              {isFinalized
                ? 'Grid sealed into registrar records.'
                : 'Timetable broadcasted to student and teacher portals.'}
            </p>
          </motion.div>
        )}

        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start">
          <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveTrack('Gold')}
              className={cn(
                'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                activeTrack === 'Gold'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-50',
              )}
            >
              Gold Track
            </button>
            <button
              onClick={() => setActiveTrack('Green')}
              className={cn(
                'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                activeTrack === 'Green'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-50',
              )}
            >
              Green Track
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={selectedClassId}
              onChange={(e) => {
                const cls = classOptions.find((c) => c.id === e.target.value);
                if (cls) {
                  setSelectedClassId(cls.id);
                  setSelectedClassLabel(cls.label);
                }
              }}
              disabled={isLoading}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-slate-900/5 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <option>Loading classes...</option>
              ) : (
                classOptions.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.label}
                  </option>
                ))
              )}
            </select>
            <button
              onClick={handleDistributeToApps}
              disabled={isBroadcasted}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                isBroadcasted
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
              )}
            >
              <Share2 size={14} /> {isBroadcasted ? 'Broadcasted' : 'Distribute to Apps'}
            </button>
            <button
              onClick={handleFinalizeGrid}
              disabled={isFinalized}
              className={cn(
                'px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                isFinalized
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 hover:bg-black',
              )}
            >
              <Save size={14} /> {isFinalized ? 'Finalized' : 'Finalize Grid'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm h-full flex flex-col">
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Layers size={18} className="text-teal-500" />
                Unassigned Logic
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                Subject Mapping Backlog
              </p>

              {isLoading ? (
                <div className="flex-1 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
                  {unassignedLessons.length === 0 ? (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-8">
                      All assignments scheduled
                    </p>
                  ) : (
                    unassignedLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        draggable={!isFinalized}
                        onDragStart={isFinalized ? undefined : (e) => handleDragStart(e, lesson)}
                        className={cn(
                          'p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all group relative overflow-hidden',
                          isFinalized
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-grab active:cursor-grabbing hover:border-slate-300',
                        )}
                      >
                        <div className={cn('absolute left-0 top-0 bottom-0 w-1', lesson.color)} />
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[12px] font-black italic text-slate-900 leading-tight">
                            {lesson.subject}
                          </p>
                          <GripVertical size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {lesson.class}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Users size={10} className="text-slate-300" />
                          <span className="text-[9px] font-bold text-slate-500 uppercase">{lesson.teacher}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-slate-100">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <CheckCircle2 size={12} /> Optimization Tip
                  </p>
                  <p className="text-[9px] font-medium text-blue-700 leading-relaxed uppercase tracking-wider italic">
                    Place Core subjects in early slots for better cognitive load.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-9">
            {isFinalized && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-[2rem] flex items-center gap-3">
                <AlertTriangle size={18} className="text-amber-600" />
                <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
                  Grid Finalized — Schedule locked into registrar records.
                </p>
              </div>
            )}
            {timetableQuery.isLoading ? (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 border-b border-slate-200">
                        <TableHead className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 sticky left-0 z-10 bg-slate-50">
                          Time Slot
                        </TableHead>
                        {DAYS.map((day) => (
                          <TableHead
                            key={day}
                            className="px-6 py-6 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center min-w-[200px]"
                          >
                            {day}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {TIME_SLOTS.map((slot) => {
                        const isBreak = slot.id.startsWith('break');
                        return (
                          <TableRow key={slot.id} className={cn(isBreak ? 'bg-slate-50/50' : '')}>
                            <TableCell className="px-6 py-8 border-r border-slate-200 sticky left-0 z-10 bg-white">
                              <p className="text-[12px] font-black text-slate-900 italic leading-none mb-1">
                                {slot.label}
                              </p>
                              <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                                <Clock size={10} /> {slot.start} - {slot.end}
                              </div>
                            </TableCell>
                            {DAYS.map((day) => {
                              const slotKey = `${day}-${slot.id}`;
                              const lesson = getEntryForSlot(day, slot.id);
                              const conflictLookupKey = `${selectedClassName}-${slotKey}`;
                              const conflict = conflicts[conflictLookupKey];

                              if (isBreak) {
                                return (
                                  <TableCell key={day} className="px-4 py-4 text-center">
                                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                                      <div className="w-8 h-px bg-slate-100" />
                                      {slot.label}
                                      <div className="w-8 h-px bg-slate-100" />
                                    </div>
                                  </TableCell>
                                );
                              }

                              return (
                                <TableCell
                                  key={day}
                                  className={cn(
                                    'px-3 py-3 relative min-h-[140px]',
                                    isFinalized && 'opacity-75',
                                  )}
                                  onDragOver={isFinalized ? undefined : (e) => handleDragOver(e, slotKey)}
                                  onDragLeave={isFinalized ? undefined : handleDragLeave}
                                  onDrop={isFinalized ? undefined : (e) => handleDrop(e, slotKey)}
                                  data-slot-key={slotKey}
                                >
                                  <div
                                    className={cn(
                                      'w-full h-full min-h-[100px] border-2 border-dashed rounded-[1.5rem] flex items-center justify-center transition-all group',
                                      lesson
                                        ? 'border-transparent bg-slate-50 p-4'
                                        : isFinalized
                                        ? 'border-slate-100 bg-slate-50/30'
                                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer',
                                      conflict ? 'bg-rose-50 border-rose-100 ring-4 ring-rose-500/10' : '',
                                      dragOverSlot === slotKey && !isFinalized
                                        ? 'bg-slate-200 border-slate-400 scale-[1.02]'
                                        : '',
                                    )}
                                  >
                                    {lesson ? (
                                      <div className="w-full relative">
                                        <div className={cn('absolute -left-4 top-0 bottom-0 w-1', lesson.color)} />
                                        <div className="flex justify-between items-start mb-1">
                                          <p className="text-[13px] font-black italic text-slate-900 leading-tight">
                                            {lesson.subject}
                                          </p>
                                          <button
                                            onClick={() => removeLesson(slotKey)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-300 hover:text-rose-500"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                          {lesson.class}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-2">
                                          <MapPin size={10} className="text-slate-300" />
                                          <span className="text-[8px] font-black text-slate-500 uppercase">
                                            Room {lesson.room || 'B3'}
                                          </span>
                                        </div>

                                        {conflict && (
                                          <div
                                            className="mt-3 p-2 bg-rose-500 text-white rounded-lg flex items-center gap-2"
                                            title={conflict.msg}
                                          >
                                            <AlertTriangle size={10} className="shrink-0" />
                                            <span className="text-[8px] font-black uppercase tracking-tighter truncate">
                                              Clash: {lesson.teacher}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <Plus size={20} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                                    )}
                                  </div>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};