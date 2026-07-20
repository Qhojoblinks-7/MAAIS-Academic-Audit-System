import React, { useState, useMemo } from 'react';
import {
  Clock, Share2, Save, X,
  CheckCircle2, AlertTriangle, Trash2, Plus, Users, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { toast, Toaster } from '../../components/ui/toast.tsx';
import {
  useAllClasses,
  useTimetableEntries,
  useCreateTimetableEntry,
  useDeleteTimetableEntry,
  useBroadcastTimetable,
  useFinalizeTimetable,
  useTimeSlots,
  useCreateTimeSlot,
  useUpdateTimeSlot,
  useDeleteTimeSlot,
  useClassAssignments,
} from '../../lib/hooks';
import { SlotManager } from './SlotManager';
import { TimetableGrid } from './TimetableGrid';

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
  'Home Economics': 'bg-success',
  Technical: 'bg-success',
  Languages: 'bg-brand-primary',
  default: 'bg-muted',
};

const getDeptColor = (subject) => {
  if (!subject) return DEPT_COLORS.default;
  const deptName = subject.department?.name || subject.departmentName || '';
  return DEPT_COLORS[deptName] || DEPT_COLORS.default;
};

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

export { DAYS, DAY_MAP, DEPT_COLORS, getDeptColor, DEFAULT_TIME_SLOTS };

export const MasterTimetable = ({ initialClassId = '' }) => {
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedClassLabel, setSelectedClassLabel] = useState('');
  const [activeTrack, setActiveTrack] = useState('Gold');
  const [isBroadcasted, setIsBroadcasted] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isManagingSlots, setIsManagingSlots] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({ label: '', startTime: '', endTime: '', isBreak: false });
  const [schedule, setSchedule] = useState({});
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [savingSlot, setSavingSlot] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);

  const allClassesQuery = useAllClasses();
  const classes = allClassesQuery.data || [];
  const classOptions = useMemo(() => {
    return (Array.isArray(classes) ? classes : [])
      .filter((c) => c.name || c.className)
      .map((c) => ({
        id: c.id,
        label: c.name || c.className || 'Unknown Class',
        track: c.track || activeTrack,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [classes, activeTrack]);

  const selectedClass = classOptions.find((c) => c.id === selectedClassId) || classOptions[0];
  const selectedClassName = selectedClass?.label || selectedClassLabel;

  const timetableQuery = useTimetableEntries({ classId: selectedClassId, track: activeTrack });
  const timetableEntries = timetableQuery.data || [];

  const assignmentsQuery = useClassAssignments(selectedClassId, activeTrack);
  const assignments = assignmentsQuery.data || [];

  const createMutation = useCreateTimetableEntry();
  const deleteMutation = useDeleteTimetableEntry();
  const broadcastMutation = useBroadcastTimetable();
  const finalizeMutation = useFinalizeTimetable();

  const timeSlotsQuery = useTimeSlots();
  const createTimeSlotMutation = useCreateTimeSlot();
  const updateTimeSlotMutation = useUpdateTimeSlot();
  const deleteTimeSlotMutation = useDeleteTimeSlot();

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
      built[slotKey] = {
        id: entry.id,
        subject: entry.subject?.name || entry.subjectName || 'Unknown',
        teacher: entry.teacher ? `${entry.teacher.firstName || ''} ${entry.teacher.lastName || ''}`.trim() || entry.teacherName || 'Unknown' : 'Unknown',
        color: getDeptColor(entry.subject),
        entryId: entry.id,
        subjectId: entry.subjectId,
        teacherId: entry.teacherId,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        classSectionId: entry.classId,
        room: entry.room || entry.venue || '-',
        subjectObj: entry.subject,
        teacherObj: entry.teacher,
      };
    });
    setSchedule({ [selectedClassName || '']: built });
  }, [timetableEntries, selectedClassName]);

  const getSlotIdFromTime = (time) => {
    if (!time) return null;
    const normalized = String(time).slice(0, 5);
    return TIME_SLOTS.find((s) => s.startTime === normalized && !s.isBreak)?.id || null;
  };

  const getEntryForSlot = (day, slotId) => {
    const dayKey = DAY_MAP[day] || day;
    return schedule[selectedClassName || '']?.[`${dayKey}-${slotId}`] || null;
  };

  const handleDragStart = (e, lesson) => {
    e.dataTransfer.setData('lessonId', lesson.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleQuickAdd = (slotKey) => {
    const [day, slotId] = slotKey.split('-');
    const slot = TIME_SLOTS.find((s) => s.id === slotId);
    if (!slot || slot.isBreak) return;
    const dayKey = DAY_MAP[day] || day;
    setSelectedSlot({ dayKey, slotId, startTime: slot.startTime, endTime: slot.endTime, key: slotKey });
    setShowSlotModal(true);
  };

  const handleSelectLessonForSlot = async (lesson) => {
    if (!selectedSlot) return;
    const { dayKey, slotId, startTime, endTime } = selectedSlot;
    try {
      const created = await createMutation.mutateAsync({
        classId: selectedClassId,
        subjectId: lesson.subjectId,
        teacherId: lesson.teacherId,
        dayOfWeek: dayKey,
        startTime,
        endTime,
        track: activeTrack,
      });
      const newEntry = {
        id: created.id,
        subject: lesson.subject?.name || 'Unknown',
        class: selectedClassName || 'Unknown',
        teacher: lesson.teacher ? `${lesson.teacher.firstName || ''} ${lesson.teacher.lastName || ''}`.trim() || 'Unknown' : 'Unknown',
        color: getDeptColor(lesson.subject),
        entryId: created.id,
        subjectId: created.subjectId,
        teacherId: created.teacherId,
        dayOfWeek: created.dayOfWeek,
        startTime: created.startTime,
        endTime: created.endTime,
        classSectionId: created.classId,
        room: created.room || '-',
        subjectObj: lesson.subject,
        teacherObj: lesson.teacher,
      };
      setSchedule((prev) => {
        const classSchedule = { ...(prev[selectedClassName || ''] || {}) };
        classSchedule[`${dayKey}-${slotId}`] = newEntry;
        return { ...prev, [selectedClassName || '']: classSchedule };
      });
      setShowSlotModal(false);
      setSelectedSlot(null);
      toast.success('Lesson scheduled');
    } catch (err) {
      toast.error(err?.message || 'Failed to schedule lesson');
    }
  };

  const closeSlotModal = () => {
    setShowSlotModal(false);
    setSelectedSlot(null);
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
    setSavingSlot(`${dayKey}-${slotId}`);
    try {
      const created = await createMutation.mutateAsync({
        classId: selectedClassId,
        subjectId: lesson.subjectId,
        teacherId: lesson.teacherId,
        dayOfWeek: dayKey,
        startTime: slot.startTime,
        endTime: slot.endTime,
        track: activeTrack,
      });
      const newEntry = {
        id: created.id,
        subject: lesson.subject?.name || 'Unknown',
        class: selectedClassName || 'Unknown',
        teacher: lesson.teacher ? `${lesson.teacher.firstName || ''} ${lesson.teacher.lastName || ''}`.trim() || 'Unknown' : 'Unknown',
        color: getDeptColor(lesson.subject),
        entryId: created.id,
        subjectId: created.subjectId,
        teacherId: created.teacherId,
        dayOfWeek: created.dayOfWeek,
        startTime: created.startTime,
        endTime: created.endTime,
        classSectionId: created.classId,
        room: created.room || '-',
        subjectObj: lesson.subject,
        teacherObj: lesson.teacher,
      };
      setSchedule((prev) => {
        const classSchedule = { ...(prev[selectedClassName || ''] || {}) };
        classSchedule[`${dayKey}-${slotId}`] = newEntry;
        return { ...prev, [selectedClassName || '']: classSchedule };
      });
      toast.success('Lesson scheduled');
    } catch (err) {
      toast.error(err?.message || 'Failed to schedule lesson');
    } finally {
      setSavingSlot(null);
    }
  };

  const removeLesson = async (entryId, slotKey) => {
    try {
      await deleteMutation.mutateAsync(entryId);
      setSchedule((prev) => {
        const classSchedule = { ...(prev[selectedClassName || ''] || {}) };
        delete classSchedule[slotKey];
        return { ...prev, [selectedClassName || '']: classSchedule };
      });
      toast.success('Lesson removed');
    } catch (err) {
      toast.error(err?.message || 'Failed to remove lesson');
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

  const startEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({ label: slot.label, startTime: slot.startTime, endTime: slot.endTime, isBreak: slot.isBreak });
    setIsManagingSlots(true);
  };

  const cancelSlotManagement = () => {
    setIsManagingSlots(false);
    setEditingSlot(null);
    setSlotForm({ label: '', startTime: '', endTime: '', isBreak: false });
  };

  const handleCreateTimeSlot = async () => {
    if (!slotForm.label || !slotForm.startTime || !slotForm.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await createTimeSlotMutation.mutateAsync({ ...slotForm, sortOrder: TIME_SLOTS.length });
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

  const conflicts = useMemo(() => {
    const teacherTimeRegistry = {};
    const conflictMap = {};
    Object.entries(schedule).forEach(([className, classSlots]) => {
      Object.entries(classSlots).forEach(([slotKey, lesson]) => {
        if (!lesson || !lesson.teacher) return;
        const registryKey = `${lesson.teacher}-${activeTrack}-${slotKey}`;
        if (!teacherTimeRegistry[registryKey]) teacherTimeRegistry[registryKey] = [];
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
            msg: `${lesson.teacher} is simultaneously assigned to ${conflictingClasses.join(', ')}.`,
            teacher: lesson.teacher,
            classes: conflictingClasses,
          };
        }
      });
    });
    return conflictMap;
  }, [schedule, activeTrack]);

  const currentClassSchedule = schedule[selectedClassName || ''] || {};
  const teacherWorkload = useMemo(() => {
    const workload = {};
    Object.values(currentClassSchedule).forEach((lesson) => {
      if (!lesson?.teacher) return;
      const teacherName = lesson.teacher;
      if (!workload[teacherName]) {
        workload[teacherName] = { name: teacherName, periods: 0, subjects: new Set(), color: lesson.color };
      }
      workload[teacherName].periods += 1;
      if (lesson.subject) workload[teacherName].subjects.add(lesson.subject);
    });
    return Object.values(workload).sort((a, b) => b.periods - a.periods);
  }, [currentClassSchedule]);

  const totalSlots = TIME_SLOTS.filter(s => !s.isBreak).length * DAYS.length;
  const filledSlots = Object.keys(currentClassSchedule).length;
  const completionPercent = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

  const isLoading = allClassesQuery.isLoading || timetableQuery.isLoading || assignmentsQuery.isLoading || timeSlotsQuery.isLoading;

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
        <Toaster />
        {(isBroadcasted || isFinalized) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'p-4 rounded-[2rem] border flex items-center gap-3',
              isFinalized ? 'bg-warning/10 border-warning text-warning' : 'bg-brand-primary/10 border-brand-primary text-brand-primary',
            )}
          >
            {isFinalized ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <p className="text-[10px] font-black uppercase tracking-widest">
              {isFinalized ? 'Grid sealed into registrar records.' : 'Timetable broadcasted to student and teacher portals.'}
            </p>
          </motion.div>
        )}

        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start">
          <div className="flex items-center gap-2 p-1 bg-surface border border-border rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveTrack('Gold')}
              className={cn('px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                activeTrack === 'Gold' ? 'bg-warning text-primary-foreground shadow-lg' : 'text-text-secondary hover:bg-muted',
              )}
            >
              Gold Track
            </button>
            <button
              onClick={() => setActiveTrack('Green')}
              className={cn('px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                activeTrack === 'Green' ? 'bg-brand-primary text-primary-foreground shadow-lg' : 'text-text-secondary hover:bg-muted',
              )}
            >
              Green Track
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsManagingSlots(!isManagingSlots)}
              className={cn('flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                isManagingSlots ? 'bg-brand-primary/10 border border-brand-primary text-brand-primary' : 'bg-surface border border-border text-text-secondary hover:bg-muted',
              )}
            >
              <Clock size={14} /> {isManagingSlots ? 'Cancel Editing' : 'Manage Slots'}
            </button>
            <select
              value={selectedClassId}
              onChange={(e) => {
                const cls = classOptions.find((c) => c.id === e.target.value);
                if (cls) { setSelectedClassId(cls.id); setSelectedClassLabel(cls.label); }
              }}
              disabled={isLoading}
              className="px-6 py-3 bg-surface border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-border transition-all disabled:opacity-50"
            >
              {isLoading ? <option>Loading classes...</option> : classOptions.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.label}</option>
              ))}
            </select>
            <button
              onClick={handleDistributeToApps}
              disabled={isBroadcasted}
              className={cn('flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                isBroadcasted ? 'bg-brand-primary/10 border border-brand-primary text-brand-primary' : 'bg-surface border border-border text-text-secondary hover:bg-muted',
              )}
            >
              <Share2 size={14} /> {isBroadcasted ? 'Broadcasted' : 'Distribute'}
            </button>
            <button
              onClick={handleFinalizeGrid}
              disabled={isFinalized}
              className={cn('px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                isFinalized ? 'bg-warning text-primary-foreground shadow-lg' : 'bg-brand-dark text-primary-foreground shadow-xl shadow-brand-dark/20 hover:bg-brand-dark/90',
              )}
            >
              <Save size={14} /> {isFinalized ? 'Finalized' : 'Finalize'}
            </button>
          </div>
        </div>

        {isManagingSlots && (
          <SlotManager
            isManagingSlots={isManagingSlots}
            editingSlot={editingSlot}
            slotForm={slotForm}
            setSlotForm={setSlotForm}
            TIME_SLOTS={TIME_SLOTS}
            onStartEdit={startEditSlot}
            onCreate={handleCreateTimeSlot}
            onUpdate={handleUpdateTimeSlot}
            onDelete={handleDeleteTimeSlot}
            onCancel={cancelSlotManagement}
          />
        )}

        {assignments.length > 0 && (
          <div className="bg-surface rounded-[2rem] border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <Layers size={14} className="text-success" />
                Unscheduled Lessons
              </h3>
              <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest bg-muted px-2 py-1 rounded-lg">
                {assignments.length} to schedule
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {assignments.map((assignment) => {
                const slotKey = `${selectedClassName}-${assignment.id}`;
                const isScheduled = Object.values(currentClassSchedule).some(
                  (lesson) => lesson.subjectId === assignment.subjectId && lesson.teacherId === assignment.teacherId
                );
                if (isScheduled) return null;
                return (
                  <div
                    key={assignment.id}
                    draggable={!isFinalized}
                    onDragStart={isFinalized ? undefined : (e) => handleDragStart(e, assignment)}
                    className={cn(
                      'p-3 bg-muted border border-border rounded-xl transition-all group relative overflow-hidden cursor-grab active:cursor-grabbing hover:border-text-secondary shrink-0',
                      isFinalized && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <div className={cn('absolute left-0 top-0 bottom-0 w-1', getDeptColor(assignment.subject))} />
                    <p className="text-[11px] font-black italic text-text-primary leading-tight pr-4">
                      {assignment.subject?.name || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Users size={10} className="text-muted" />
                      <span className="text-[9px] font-bold text-text-secondary uppercase">
                        {assignment.teacher ? `${assignment.teacher.firstName || ''} ${assignment.teacher.lastName || ''}`.trim() || 'Unknown' : 'Unknown'}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={12} className="text-muted" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <TimetableGrid
          selectedClassName={selectedClassName}
          TIME_SLOTS={TIME_SLOTS}
          DAYS={DAYS}
          DAY_MAP={DAY_MAP}
          getEntryForSlot={getEntryForSlot}
          conflicts={conflicts}
          isFinalized={isFinalized}
          dragOverSlot={dragOverSlot}
          savingSlot={savingSlot}
          trackTimetableQuery={timetableQuery}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onRemoveLesson={removeLesson}
          onCellClick={handleQuickAdd}
          assignments={assignments}
        />

        <div className="bg-surface rounded-[2.5rem] border border-border p-6 shadow-sm">
          <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-brand-primary" />
            Teacher Workload
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teacherWorkload.length === 0 ? (
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest text-center py-4 col-span-full">
                No lessons scheduled yet
              </p>
            ) : (
              teacherWorkload.map((tw) => (
                <div key={tw.name} className="p-4 bg-muted rounded-xl border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-black text-text-primary">{tw.name}</span>
                    <span className="text-[9px] font-bold text-text-secondary">{tw.periods} periods</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', tw.color)}
                      style={{ width: `${Math.min((tw.periods / totalSlots) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {[...tw.subjects].slice(0, 3).map((subj) => (
                      <span key={subj} className="text-[8px] font-bold text-text-secondary uppercase tracking-wider bg-background px-1.5 py-0.5 rounded">
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showSlotModal && selectedSlot && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md" onClick={closeSlotModal} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-lg bg-surface rounded-[3rem] shadow-2xl p-8 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black italic font-display text-text-primary">Add Lesson</h3>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">
                  {selectedSlot.dayKey} · {selectedSlot.startTime} - {selectedSlot.endTime}
                </p>
              </div>
              <button onClick={closeSlotModal} className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-2">
              {assignments.filter(a => !Object.values(currentClassSchedule).some(ls => ls.subjectId === a.subjectId && ls.teacherId === a.teacherId)).length === 0 ? (
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest text-center py-8">
                  All lessons are already scheduled
                </p>
              ) : (
                assignments
                  .filter(a => !Object.values(currentClassSchedule).some(ls => ls.subjectId === a.subjectId && ls.teacherId === a.teacherId))
                  .map((assignment) => (
                    <button
                      key={assignment.id}
                      onClick={() => handleSelectLessonForSlot(assignment)}
                      className="w-full p-4 bg-muted border border-border rounded-2xl text-left hover:border-text-secondary transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[12px] font-black italic text-text-primary">
                            {assignment.subject?.name || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Users size={10} className="text-muted" />
                            <span className="text-[10px] font-bold text-text-secondary uppercase">
                              {assignment.teacher ? `${assignment.teacher.firstName || ''} ${assignment.teacher.lastName || ''}`.trim() || 'Unknown' : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className={cn('w-1 h-8 rounded-full', getDeptColor(assignment.subject))} />
                      </div>
                    </button>
                  ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
