import React from 'react';
import { AlertTriangle, Plus, Trash2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Skeleton } from '../../components/ui/skeleton';
import { DAY_MAP } from './MasterTimetable';

export const TimetableGrid = ({
  selectedClassName,
  TIME_SLOTS,
  DAYS,
  DAY_MAP,
  getEntryForSlot,
  conflicts,
  isFinalized,
  dragOverSlot,
  savingSlot,
  trackTimetableQuery,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveLesson,
  onCellClick,
  assignments,
}) => {
  if (trackTimetableQuery?.isLoading) {
    return (
      <div className="bg-surface rounded-[2.5rem] border border-border shadow-sm p-8 space-y-4">
        <Skeleton className="h-12 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[90px_repeat(5,1fr)] border-b border-border bg-background">
            <div className="p-4 border-r border-border sticky left-0 z-20 bg-background">
              <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Time</span>
            </div>
            {DAYS.map((day) => (
              <div key={day} className="p-4 text-center border-r border-border last:border-r-0">
                <span className="text-[11px] font-black text-text-primary uppercase tracking-widest">{day}</span>
              </div>
            ))}
          </div>

          {TIME_SLOTS.map((slot) => {
            const isBreak = slot.isBreak;
            return (
              <div key={slot.id} className={cn('grid grid-cols-[90px_repeat(5,1fr)] border-b border-border last:border-b-0', isBreak && 'bg-muted/30')}>
                <div className="p-3 border-r border-border sticky left-0 z-10 bg-surface flex flex-col justify-center">
                  <p className="text-[11px] font-black text-text-primary italic leading-none mb-1">{slot.label}</p>
                  {!isBreak && (
                    <div className="flex items-center gap-1 text-[8px] font-black text-text-secondary uppercase">
                      <Clock size={8} /> {slot.startTime} - {slot.endTime}
                    </div>
                  )}
                </div>
                {DAYS.map((day) => {
                  const slotKey = `${day}-${slot.id}`;
                  const lesson = getEntryForSlot(day, slot.id);
                  const conflictLookupKey = `${selectedClassName}-${DAY_MAP[day] || day}-${slot.id}`;
                  const conflict = conflicts[conflictLookupKey];

                  if (isBreak) {
                    return (
                      <div key={day} className="p-3 text-center border-r border-border last:border-r-0 flex items-center justify-center col-span-1">
                        <span className="text-[9px] font-black text-muted uppercase tracking-[0.3em]">BREAK</span>
                      </div>
                    );
                  }

                  const isDragOver = dragOverSlot === slotKey;

                  return (
                    <div
                      key={day}
                      className={cn(
                        'p-2 border-r border-border last:border-r-0 min-h-[100px] relative transition-all',
                        isFinalized && 'opacity-75',
                      )}
                      onDragOver={isFinalized ? undefined : (e) => onDragOver(e, slotKey)}
                      onDragLeave={isFinalized ? undefined : onDragLeave}
                      onDrop={isFinalized ? undefined : (e) => onDrop(e, slotKey)}
                    >
                      <div
                        className={cn(
                          'w-full h-full min-h-[90px] rounded-xl border-2 flex flex-col transition-all relative group',
                          lesson
                            ? 'border-transparent bg-muted'
                            : isFinalized
                            ? 'border-border bg-muted/20'
                            : 'border-border hover:border-text-secondary hover:bg-muted/40 cursor-pointer',
                          conflict && 'bg-destructive/10 border-destructive',
                          isDragOver && !isFinalized && !lesson && 'border-brand-primary bg-brand-primary/5',
                        )}
                        onClick={() => !lesson && !isFinalized && onCellClick?.(slotKey)}
                      >
                        {lesson ? (
                          <>
                            <div className={cn('absolute left-0 top-0 bottom-0 w-1.5 rounded-full', lesson.color)} />
                            <div className="p-3 pl-4 flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-black italic text-text-primary leading-tight truncate">
                                    {lesson.subject}
                                  </p>
                                  <p className="text-[10px] font-bold text-text-secondary mt-0.5">
                                    {lesson.teacher}
                                  </p>
                                </div>
                                <button
                                  onClick={() => onRemoveLesson(lesson.entryId, slotKey)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted hover:text-destructive shrink-0 ml-1"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                              <div className="flex items-center gap-1 mt-auto pt-1">
                                <Clock size={10} className="text-muted shrink-0" />
                                <span className="text-[8px] font-black text-text-secondary uppercase truncate">
                                  {lesson.startTime} - {lesson.endTime}
                                </span>
                              </div>

                              {conflict && (
                                <div
                                  className="mt-2 p-1.5 bg-destructive text-primary-foreground rounded-lg flex items-center gap-1.5"
                                  title={conflict.msg}
                                >
                                  <AlertTriangle size={10} className="shrink-0" />
                                  <span className="text-[8px] font-black uppercase tracking-tighter truncate">
                                    Clash: {conflict.teacher}
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Plus size={18} className="text-muted/50 group-hover:text-text-secondary transition-colors" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
