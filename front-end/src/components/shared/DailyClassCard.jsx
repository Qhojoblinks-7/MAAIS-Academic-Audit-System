import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin, ShieldAlert, BookOpen, FilePlus, FileText, Link as LinkIcon, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export function DailyClassCard({ entry, user, hoveredId, setHoveredId, selectedEntry, setIsResourceModalOpen, newMaterial, setNewMaterial }) {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      onMouseEnter={() => setHoveredId(entry.id)}
      onMouseLeave={() => setHoveredId(null)}
      className={cn(
        "bg-card rounded-2xl p-5 border border-border flex flex-col group hover:border-brand-primary/20 transition-all shadow-sm overflow-hidden",
        entry.isClash && "border-destructive/20 bg-destructive/5"
      )}
    >
      <div className="flex items-center gap-6">
        <div className="w-20 text-center border-r border-border pr-6 shrink-0">
          <p className="text-base font-black text-foreground">{entry.startTime}</p>
          <p className="text-[9px] font-bold text-muted-foreground uppercase">{entry.endTime}</p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-lg font-black text-foreground truncate">{entry.subjectName}</h4>
            <span className={cn(
              "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0",
              entry.type === 'LAB' ? "bg-success/10 text-success" :
              entry.type === 'SUBSTITUTION' ? "bg-brand-secondary/10 text-brand-secondary" :
              "bg-muted text-muted-foreground"
            )}>
              {entry.type}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xs font-bold text-muted-foreground truncate">{entry.className}</p>
            <span className="text-border shrink-0">•</span>
            <p className="text-xs font-bold text-muted-foreground flex items-center gap-1 truncate">
              <MapPin size={12} /> {entry.venue}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {entry.missingObservations && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 border border-warning/20 rounded-xl text-warning">
              <ShieldAlert size={14} />
              <span className="text-[9px] font-black uppercase">{entry.missingObservations} Missing</span>
            </div>
          )}
          <button
            onClick={() => navigate('/grading')}
            className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-brand-primary group-hover:text-primary-foreground transition-all shadow-sm"
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
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3">Session Tasks</p>
            <div className="grid grid-cols-2 gap-3">
              {entry.tasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-lg border border-border">
                  <div className="w-1.5 h-1.5 bg-success rounded-full" />
                  <span className="text-[10px] font-bold text-foreground">{task}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => navigate('/grading')}
                className="flex-1 py-2 bg-brand-primary text-primary-foreground text-xs font-black rounded-xl hover:bg-brand-primary/90 transition-all"
              >
                Open Grading Sheet
              </button>
              {user?.role !== 'STUDENT' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEntry(entry);
                    setIsResourceModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-card border border-brand-primary text-brand-primary text-xs font-black rounded-xl hover:bg-brand-primary/10 transition-all flex items-center justify-center gap-2"
                >
                  <FilePlus size={14} />
                  Attach Materials
                </button>
              )}
            </div>
            {entry.materials?.length > 0 && (
              <div className="mt-4">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3">Materials</p>
                <div className="flex flex-wrap gap-2">
                  {entry.materials.map((mat, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-xl border border-border text-[10px] font-bold text-muted-foreground"
                    >
                      {mat.type === 'PDF' ? <FileText size={12} className="text-destructive" /> : <LinkIcon size={12} className="text-brand-secondary" />}
                      {mat.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
   );
}
