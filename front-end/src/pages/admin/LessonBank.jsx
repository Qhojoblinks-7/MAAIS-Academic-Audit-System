import React from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from '../../components/ui/skeleton';
import { Layers, CheckCircle2, Users, GripVertical } from 'lucide-react';

export const LessonBank = ({ unassignedLessons, isLoading, onDragStart, isFinalized, teacherWorkload, completionPercent }) => {
  return (
    <div className="bg-surface rounded-[2.5rem] border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
          <Layers size={16} className="text-success" />
          Lesson Bank
        </h3>
        <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest bg-muted px-2 py-1 rounded-lg">
          {unassignedLessons.length} unscheduled
        </span>
      </div>
      <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-4">
        Drag lessons to the timetable grid
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
          {unassignedLessons.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 size={32} className="text-success mx-auto mb-2" />
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                All lessons scheduled
              </p>
            </div>
          ) : (
            unassignedLessons.map((lesson) => (
              <div
                key={lesson.id}
                draggable={!isFinalized}
                onDragStart={isFinalized ? undefined : (e) => onDragStart(e, lesson)}
                className={cn(
                  'p-3 bg-muted border border-border rounded-xl transition-all group relative overflow-hidden cursor-grab active:cursor-grabbing hover:border-text-secondary',
                  isFinalized && 'opacity-50 cursor-not-allowed',
                )}
              >
                <div className={cn('absolute left-0 top-0 bottom-0 w-1', lesson.color)} />
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[11px] font-black italic text-text-primary leading-tight">
                    {lesson.subject}
                  </p>
                  <GripVertical size={12} className="text-muted group-hover:text-text-primary transition-colors" />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Users size={10} className="text-muted" />
                  <span className="text-[9px] font-bold text-text-secondary uppercase">{lesson.teacher}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <div className="bg-brand-primary/10 border border-brand-primary p-4 rounded-2xl">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">
            Scheduling Progress
          </p>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${completionPercent}%` }} />
          </div>
          <p className="text-[9px] font-bold text-text-secondary mt-1">{completionPercent}% complete</p>
        </div>
      </div>
    </div>
  );
};
