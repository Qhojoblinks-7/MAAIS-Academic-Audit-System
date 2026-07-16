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
  useBroadcastTimetable,
  useFinalizeTimetable,
  useTimeSlots,
  useCreateTimeSlot,
  useUpdateTimeSlot,
  useDeleteTimeSlot,
  useReorderTimeSlots,
} from '../../lib/hooks';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DAY_MAP = {
  Monday: 'MONDAY',
  Tuesday: 'TUESDAY',
  Wednesday: 'WEDNESDAY',
  Thursday: 'THURSDAY',
  Friday: 'FRIDAY',
};

const DEPT_COLORS = {
  Science: 'bg-brand-primary',
  'General Arts': 'bg-brand-secondary',
  Business: 'bg-warning',
  Vocational: 'bg-success',
  HomeEconomics: 'bg-destructive',
  'Visual Arts': 'bg-warning',
  default: 'bg-muted',
};

const getDeptColor = (subject) => {
  if (!subject) return DEPT_COLORS.default;
  const deptName = subject.department?.name || subject.departmentName || '';
  return DEPT_COLORS[deptName] || DEPT_COLORS.default;
};

export const MasterTimetable = () => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassLabel, setSelectedClassLabel] = useState('');
  const [activeTrack, setActiveTrack] = useState('Gold');
  const [isBroadcasted, setIsBroadcasted] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  const trackClassesQuery = useAllClasses(activeTrack);
  const allClassesQuery = useAllClasses();
  const rawClasses = trackClassesQuery.data;
  const allClasses = allClassesQuery.data;
  const allClassesArray = Array.isArray(allClasses) && allClasses.length > 0 
    ? allClasses 
    : (allClasses?.data || allClasses?.items || []);
  const trackClassesArray = Array.isArray(rawClasses) 
    ? rawClasses 
    : (rawClasses?.data || rawClasses?.items || []);
  const classes = trackClassesArray.length > 0 
    ? trackClassesArray 
    : allClassesArray;
  const classOptions = useMemo(() => {
    const opts = (Array.isArray(classes) ? classes : [])
      .filter((c) => c.name || c.className)
      .map((c) => ({
        id: c.id,
        label: c.name || c.className || 'Unknown Class',
        level: c.level || null,
        program: c.program || c.stream || null,
        name: c.name || c.className,
        track: c.track || activeTrack,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return opts;
  }, [classes, activeTrack]);

const selectedClass = classOptions.find((c) => c.id === selectedClassId) || classOptions[0];
  const selectedClassName = selectedClass?.label || selectedClassLabel;

  const trackTimetableQuery = useTimetableEntries({ track: activeTrack });
  const allTimetableQuery = useTimetableEntries();
  const rawTimetableEntries = trackTimetableQuery.data;
  const allTimetableEntriesArray = Array.isArray(allTimetableQuery.data) 
    ? allTimetableQuery.data 
    : (allTimetableQuery.data?.data || allTimetableQuery.data?.items || []);
  const timetableEntries = (Array.isArray(rawTimetableEntries) && rawTimetableEntries.length > 0)
    ? rawTimetableEntries
    : (rawTimetableEntries?.data || rawTimetableEntries?.items || allTimetableEntriesArray || []);

  const trackAssignmentsQuery = useClassAssignments(selectedClassId, activeTrack);
  const allAssignmentsQuery = useClassAssignments(selectedClassId);
  const allAssignmentsArray = Array.isArray(allAssignmentsQuery.data) 
    ? allAssignmentsQuery.data 
    : (allAssignmentsQuery.data?.data || allAssignmentsQuery.data?.items || []);
  const assignments = (trackAssignmentsQuery.data?.length > 0) 
    ? trackAssignmentsQuery.data 
    : (allAssignmentsArray || []);

  const createMutation = useCreateTimetableEntry();
  const updateMutation = useUpdateTimetableEntry();
  const deleteMutation = useDeleteTimetableEntry();
  const broadcastMutation = useBroadcastTimetable();
  const finalizeMutation = useFinalizeTimetable();

  const [schedule, setSchedule] = useState({});
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [savingSlot, setSavingSlot] = useState(null);
  const [isManagingSlots, setIsManagingSlots] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({ label: '', startTime: '', endTime: '', isBreak: false });

  const timeSlotsQuery = useTimeSlots();
  const createTimeSlotMutation = useCreateTimeSlot();
  const updateTimeSlotMutation = useUpdateTimeSlot();
  const deleteTimeSlotMutation = useDeleteTimeSlot();
  const reorderTimeSlotsMutation = useReorderTimeSlots();

  const DEFAULT_TIME_SLOTS = [
    { id: '1', startTime: '08:00', endTime: '08:40', label: 'Period 1', isBreak: false, sortOrder: 1 },
    { id: '2', startTime: '08:40', endTime: '09:20', label: 'Period 2', isBreak: false, sortOrder: 2 },
    { id: '3', startTime: '09:20', endTime: '10:00', label: 'Period 3', isBreak: false, sortOrder: 3 },
    { id: 'break1', startTime: '10:00', endTime: '10:30', label: 'Snack Break', isBreak: true, sortOrder: 4 },
    { id: '4', startTime: '10:30', endTime: '11:10', label: 'Period 4', isBreak: false, sortOrder: 5 },
    { id: '5', startTime: '11:10', endTime: '11:50', label: 'Period 5', isBreak: false, sortOrder: 6 },
    { id: '6', startTime: '11:50', endTime: '12:30', label: 'Period 6', isBreak: false, sortOrder: 7 },
    { id: 'break2', startTime: '12:30', endTime: '13:30', label: 'Lunch Break', isBreak: true, sortOrder: 8 },
    { id: '7', startTime: '13:30', endTime: '14:10', label: 'Period 7', isBreak: false, sortOrder: 9 },
    { id: '8', startTime: '14:10', endTime: '14:50', label: 'Period 8', isBreak: false, sortOrder: 10 },
  ];

  const TIME_SLOTS = useMemo(() => {
    const data = timeSlotsQuery.data;
    if (Array.isArray(data) && data.length > 0) {
      return data.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
    return DEFAULT_TIME_SLOTS;
  }, [timeSlotsQuery.data]);

  React.useEffect(() => {
    if (classOptions.length > 0 && !selectedClassId) {
      setSelectedClassId(classOptions[0].id);
      setSelectedClassLabel(classOptions[0].label);
    }
  }, [classOptions]);

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
      const className = entry.className || entry.classSection?.name || entry.class?.name || selectedClassName || 'Unknown Class';

      built[slotKey] = {
        id: entry.id,
        subject: entry.subject?.name || entry.subjectName || 'Unknown',
        class: className,
        teacher: entry.teacher
          ? `${entry.teacher.firstName || ''} ${entry.teacher.lastName || ''}`.trim() || entry.teacherName || 'Unknown'
          : 'Unknown',
        color: getDeptColor(entry.subject),
        entryId: entry.id,
        subjectId: entry.subjectId,
        teacherId: entry.teacherId,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        classSectionId: entry.classId,
        room: entry.room || entry.venue || '-',
      };
    });
    setSchedule({ [selectedClassName || '']: built });
  }, [timetableEntries, selectedClassName]);

  const getSlotIdFromTime = (time) => {
    if (!time) return null;
    const normalized = String(time).slice(0, 5);
    const slot = TIME_SLOTS.find(
      (s) => s.startTime === normalized && !s.isBreak,
    );
    return slot?.id || null;
  };

  const getEntryForSlot = (day, slotId) => {
    const dayKey = DAY_MAP[day] || day;
    const key = `${dayKey}-${slotId}`;
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
    const slot = TIME_SLOTS.find((s) => s.id === slotId);
    if (!slot || slot.isBreak) return;

    const dayKey = DAY_MAP[day] || day;

    const startTime = slot.startTime;
    const endTime = slot.endTime;

    setSavingSlot(`${dayKey}-${slotId}`);

    try {
      const body = {
        classId: selectedClassId,
        subjectId: lesson.subjectId,
        teacherId: lesson.teacherId,
        dayOfWeek: dayKey,
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
        classSchedule[`${dayKey}-${slotId}`] = newEntry;
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

  const handleCreateTimeSlot = async () => {
    if (!slotForm.label || !slotForm.startTime || !slotForm.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createTimeSlotMutation.mutateAsync({
        ...slotForm,
        sortOrder: TIME_SLOTS.length,
      });
      setSlotForm({ label: '', startTime: '', endTime: '', isBreak: false });
      setIsManagingSlots(false);
      toast.success('Time slot created');
    } catch (err) {
      toast.error(err?.message || 'Failed to create time slot');
    }
  };

  const handleUpdateTimeSlot = async () => {
    if (!editingSlot) return;
    try {
      await updateTimeSlotMutation.mutateAsync({ id: editingSlot.id, ...slotForm });
      setEditingSlot(null);
      setSlotForm({ label: '', startTime: '', endTime: '', isBreak: false });
      setIsManagingSlots(false);
      toast.success('Time slot updated');
    } catch (err) {
      toast.error(err?.message || 'Failed to update time slot');
    }
  };

  const handleDeleteTimeSlot = async (id) => {
    try {
      await deleteTimeSlotMutation.mutateAsync(id);
      toast.success('Time slot deleted');
    } catch (err) {
      toast.error(err?.message || 'Failed to delete time slot');
    }
  };

  const startEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      label: slot.label,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBreak: slot.isBreak,
    });
    setIsManagingSlots(true);
  };

  const cancelSlotManagement = () => {
    setIsManagingSlots(false);
    setEditingSlot(null);
    setSlotForm({ label: '', startTime: '', endTime: '', isBreak: false });
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
    try {
      await broadcastMutation.mutateAsync({ classId: selectedClassId, track: activeTrack });
      setIsBroadcasted(true);
      setTimeout(() => setIsBroadcasted(false), 4000);
    } catch (err) {
      toast.error(err?.message || 'Failed to broadcast timetable');
    }
  };

  const handleFinalizeGrid = async () => {
    try {
      await finalizeMutation.mutateAsync({ classId: selectedClassId, track: activeTrack });
      setIsFinalized(true);
    } catch (err) {
      toast.error(err?.message || 'Failed to finalize timetable');
    }
  };

const conflicts = useMemo(() => {
    const teacherTimeRegistry = {};
    const conflictMap = {};

    Object.entries(schedule).forEach(([className, classSlots]) => {
      Object.entries(classSlots).forEach(([slotKey, lesson]) => {
        if (!lesson || !lesson.teacher) return;
        const registryKey = `${lesson.teacher}-${activeTrack}-${slotKey}`;
        if (!teacherTimeRegistry[registryKey]) {
          teacherTimeRegistry[registryKey] = [];
        }
        teacherTimeRegistry[registryKey].push(className);
      });
    });

    Object.entries(schedule).forEach(([className, classSlots]) => {
      Object.entries(classSlots).forEach(([slotKey, lesson]) => {
        if (!lesson || !lesson.teacher) return;
        const registryKey = `${lesson.teacher}-${activeTrack}-${slotKey}`;
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
  }, [schedule, activeTrack]);

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

  const isLoading = trackClassesQuery.isLoading || allClassesQuery.isLoading || trackTimetableQuery.isLoading || allTimetableQuery.isLoading || trackAssignmentsQuery.isLoading || allAssignmentsQuery.isLoading || timeSlotsQuery.isLoading;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="p-8 space-y-8 flex-1 overflow-y-auto scrollbar-hide">
        <Toaster />
        {(isBroadcasted || isFinalized) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'p-4 rounded-[2rem] border flex items-center gap-3',
              isFinalized
                ? 'bg-warning/10 border-warning text-warning'
                : 'bg-brand-primary/10 border-brand-primary text-brand-primary',
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
          <div className="flex items-center gap-2 p-1 bg-surface border border-border rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveTrack('Gold')}
              className={cn(
                'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                activeTrack === 'Gold'
                  ? 'bg-warning text-primary-foreground shadow-lg'
                  : 'text-text-secondary hover:bg-muted',
              )}
            >
              Gold Track
            </button>
            <button
              onClick={() => setActiveTrack('Green')}
              className={cn(
                'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                activeTrack === 'Green'
                  ? 'bg-brand-primary text-primary-foreground shadow-lg'
                  : 'text-text-secondary hover:bg-muted',
              )}
            >
              Green Track
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsManagingSlots(!isManagingSlots)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                isManagingSlots
                  ? 'bg-brand-primary/10 border border-brand-primary text-brand-primary'
                  : 'bg-surface border border-border text-text-secondary hover:bg-muted',
              )}
            >
              <Clock size={14} /> {isManagingSlots ? 'Cancel Editing' : 'Manage Time Slots'}
            </button>
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
              className="px-6 py-3 bg-surface border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-border transition-all disabled:opacity-50"
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
                  ? 'bg-brand-primary/10 border border-brand-primary text-brand-primary'
                  : 'bg-surface border border-border text-text-secondary hover:bg-muted',
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
                  ? 'bg-warning text-primary-foreground shadow-lg'
                  : 'bg-brand-dark text-primary-foreground shadow-xl shadow-brand-dark/20 hover:bg-brand-dark/90',
              )}
            >
              <Save size={14} /> {isFinalized ? 'Finalized' : 'Finalize Grid'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm h-full flex flex-col">
              <h3 className="text-[12px] font-black text-text-primary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Layers size={18} className="text-success" />
                Unassigned Logic
              </h3>
              <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-6">
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
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest text-center py-8">
                      All assignments scheduled
                    </p>
                  ) : (
                    unassignedLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        draggable={!isFinalized}
                        onDragStart={isFinalized ? undefined : (e) => handleDragStart(e, lesson)}
                        className={cn(
                          'p-4 bg-muted border border-border rounded-2xl transition-all group relative overflow-hidden',
                          isFinalized
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-grab active:cursor-grabbing hover:border-text-secondary',
                        )}
                      >
                        <div className={cn('absolute left-0 top-0 bottom-0 w-1', lesson.color)} />
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[12px] font-black italic text-text-primary leading-tight">
                            {lesson.subject}
                          </p>
                          <GripVertical size={14} className="text-muted group-hover:text-text-primary transition-colors" />
                        </div>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                          {lesson.class}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Users size={10} className="text-muted" />
                          <span className="text-[9px] font-bold text-text-secondary uppercase">{lesson.teacher}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-border">
                <div className="bg-brand-primary/10 border border-brand-primary p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1 flex items-center gap-2">
                    <CheckCircle2 size={12} /> Optimization Tip
                  </p>
                  <p className="text-[9px] font-medium text-brand-primary leading-relaxed uppercase tracking-wider italic">
                    Place Core subjects in early slots for better cognitive load.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-9">
            {isManagingSlots && (
              <div className="mb-6">
                <div className="bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm">
                  <h3 className="text-[12px] font-black text-text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Clock size={18} className="text-brand-primary" />
                    {editingSlot ? 'Edit Time Slot' : 'Create Time Slot'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">Label</label>
                      <input
                        type="text"
                        value={slotForm.label}
                        onChange={(e) => setSlotForm((prev) => ({ ...prev, label: e.target.value }))}
                        placeholder="e.g. Period 1"
                        className="w-full px-5 py-3 bg-background border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">Start Time</label>
                      <input
                        type="time"
                        value={slotForm.startTime}
                        onChange={(e) => setSlotForm((prev) => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-5 py-3 bg-background border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">End Time</label>
                      <input
                        type="time"
                        value={slotForm.endTime}
                        onChange={(e) => setSlotForm((prev) => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-5 py-3 bg-background border border-border rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest ml-1">Type</label>
                      <div className="flex p-1 bg-background rounded-xl">
                        <button
                          onClick={() => setSlotForm((prev) => ({ ...prev, isBreak: false }))}
                          className={cn(
                            'flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                            !slotForm.isBreak ? 'bg-brand-primary text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-text-primary',
                          )}
                        >
                          Period
                        </button>
                        <button
                          onClick={() => setSlotForm((prev) => ({ ...prev, isBreak: true }))}
                          className={cn(
                            'flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                            slotForm.isBreak ? 'bg-warning text-primary-foreground shadow-sm' : 'text-text-secondary hover:text-text-primary',
                          )}
                        >
                          Break
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={editingSlot ? handleUpdateTimeSlot : handleCreateTimeSlot}
                      className="px-8 py-3 bg-brand-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all shadow-xl shadow-brand-primary/10"
                    >
                      <Save size={14} className="inline mr-2" />
                      {editingSlot ? 'Update Slot' : 'Create Slot'}
                    </button>
                    <button
                      onClick={cancelSlotManagement}
                      className="px-8 py-3 bg-surface border border-border text-text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all"
                    >
                      Cancel
                    </button>
                  </div>

                  {!editingSlot && TIME_SLOTS.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-4">Current Time Slots</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {TIME_SLOTS.map((slot) => (
                          <div
                            key={slot.id}
                            className={cn(
                              'p-4 rounded-2xl border flex items-center justify-between',
                              slot.isBreak ? 'bg-muted/30 border-border' : 'bg-background border-border',
                            )}
                          >
                            <div>
                              <p className="text-[11px] font-black text-text-primary">{slot.label}</p>
                              <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                                <Clock size={10} className="inline mr-1" />
                                {slot.startTime} - {slot.endTime}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => startEditSlot(slot)}
                                className="p-2 text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                              >
                                <Copy size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteTimeSlot(slot.id)}
                                className="p-2 text-text-secondary hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isFinalized && (
              <div className="mb-6 p-4 bg-warning/10 border border-warning rounded-[2rem] flex items-center gap-3">
                <AlertTriangle size={18} className="text-warning" />
                <p className="text-[10px] font-black text-warning uppercase tracking-widest">
                  Grid Finalized — Schedule locked into registrar records.
                </p>
              </div>
            )}
            {trackTimetableQuery.isLoading ? (
              <div className="bg-surface rounded-[2.5rem] border border-border shadow-sm p-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="bg-surface rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-background border-b border-border">
                        <TableHead className="px-6 py-6 text-[10px] font-black text-text-secondary uppercase tracking-widest border-r border-border sticky left-0 z-10 bg-background">
                          Time Slot
                        </TableHead>
                        {DAYS.map((day) => (
                          <TableHead
                            key={day}
                            className="px-6 py-6 text-[10px] font-black text-text-primary uppercase tracking-widest text-center min-w-[200px]"
                          >
                            {day}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                     <TableBody>
                       {TIME_SLOTS.map((slot) => {
                         const isBreak = slot.isBreak;
                         return (
                           <TableRow key={slot.id} className={cn(isBreak ? 'bg-muted/50' : '')}>
                            <TableCell className="px-6 py-8 border-r border-border sticky left-0 z-10 bg-surface">
                              <p className="text-[12px] font-black text-text-primary italic leading-none mb-1">
                                {slot.label}
                              </p>
                              <div className="flex items-center gap-2 text-[9px] font-black text-text-secondary uppercase">
                                 <Clock size={10} /> {slot.startTime} - {slot.endTime}
                              </div>
                            </TableCell>
                            {DAYS.map((day) => {
                              const slotKey = `${day}-${slot.id}`;
                              const lesson = getEntryForSlot(day, slot.id);
                              const conflictLookupKey = `${selectedClassName}-${DAY_MAP[day] || day}-${slot.id}`;
                              const conflict = conflicts[conflictLookupKey];

                              if (isBreak) {
                                return (
                                  <TableCell key={day} className="px-4 py-4 text-center">
                                    <div className="text-[9px] font-black text-muted uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                                      <div className="w-8 h-px bg-muted" />
                                      {slot.label}
                                      <div className="w-8 h-px bg-muted" />
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
                                        ? 'border-transparent bg-muted p-4'
                                        : isFinalized
                                        ? 'border-border bg-muted/30'
                                        : 'border-border hover:border-text-secondary hover:bg-muted/50 cursor-pointer',
                                      conflict ? 'bg-destructive/10 border-destructive ring-4 ring-destructive/10' : '',
                                      dragOverSlot === slotKey && !isFinalized
                                        ? 'bg-muted border-border scale-[1.02]'
                                        : '',
                                    )}
                                  >
                                    {lesson ? (
                                      <div className="w-full relative">
                                        <div className={cn('absolute -left-4 top-0 bottom-0 w-1', lesson.color)} />
                                        <div className="flex justify-between items-start mb-1">
                                          <p className="text-[13px] font-black italic text-text-primary leading-tight">
                                            {lesson.subject}
                                          </p>
                                          <button
                                            onClick={() => removeLesson(slotKey)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted hover:text-destructive"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                                          {lesson.class}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-2">
                                          <MapPin size={10} className="text-muted" />
                                          <span className="text-[8px] font-black text-text-secondary uppercase">
                                            Room {lesson.room || 'B3'}
                                          </span>
                                        </div>

                                        {conflict && (
                                          <div
                                            className="mt-3 p-2 bg-destructive text-primary-foreground rounded-lg flex items-center gap-2"
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
                                      <Plus size={20} className="text-muted group-hover:text-text-secondary transition-colors" />
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
