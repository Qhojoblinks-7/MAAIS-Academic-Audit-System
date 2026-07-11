import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertTriangle, BookOpen, FileText, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export function WeeklyClassCard({ entry, hoveredId, setHoveredId }) {
  const navigate = useNavigate();
  const isHovered = hoveredId === entry.id;
  const isMicroSlot = entry._height && entry._height < 8;

return (
    <motion.div
      layout
      onMouseEnter={() => setHoveredId(entry.id)}
      onMouseLeave={() => setHoveredId(null)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        height: isHovered ? 'auto' : '100%'
      }}
      className={cn(
        "w-full h-full rounded-xl border shadow-sm cursor-pointer transition-all flex flex-col p-2 select-none text-left bg-card",
        entry.type === 'LAB' && "bg-success/5 border-success/20",
        entry.type === 'SUBSTITUTION' && "bg-brand-secondary/5 border-brand-secondary/20",
        entry.type !== 'LAB' && entry.type !== 'SUBSTITUTION' && "bg-card border-border",
        entry.isClash && "border-destructive ring-2 ring-destructive/20",
        isHovered ? "absolute top-0 left-0 right-0 shadow-2xl ring-2 ring-brand-primary/20 bg-card p-3 min-h-[220px] overflow-visible" : "overflow-hidden"
      )}
    >
      {/* 1. BADGE ROW */}
      <div className="flex justify-between items-center w-full mb-1 shrink-0">
        <span className={cn(
          "text-xs font-black uppercase tracking-wider px-1 py-0.5 rounded leading-none shrink-0",
          entry.type === 'LAB' && "bg-success/20 text-success",
          entry.type === 'SUBSTITUTION' && "bg-brand-secondary/20 text-brand-secondary",
          entry.type !== 'LAB' && entry.type !== 'SUBSTITUTION' && "bg-muted text-muted-foreground"
        )}>
          {entry.type}
        </span>
        <div className="flex gap-0.5 items-center shrink-0">
          {entry.missingObservations && (
            <AlertCircle size={8} className="text-warning fill-warning" />
          )}
          {entry.isClash && (
            <AlertTriangle size={8} className="text-destructive" />
          )}
        </div>
      </div>

      {/* 2. SUBJECT NAME BLOCK */}
      <div className={cn("w-full min-h-0 text-left", !isHovered ? "block" : "flex-1 flex flex-col justify-start")}>
        <h4 className={cn(
          "font-black text-foreground leading-tight tracking-tight text-left break-words block",
          isHovered ? "text-xs whitespace-normal" : "text-xs line-clamp-2"
        )}>
          {entry.subjectName}
        </h4>
        
        {isHovered && (
          <p className="font-bold text-muted-foreground text-xs whitespace-normal leading-none mt-1 text-left">
            {entry.className}
          </p>
        )}
      </div>

      {/* 3. EXTRA INFO HOVER DRAWER */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col gap-2 mt-2 pt-2 border-t border-border text-left"
          >
            {/* Venue */}
            <div className="flex items-center gap-0.5 text-muted-foreground uppercase font-black text-xs shrink-0 text-left">
              <MapPin size={7} className="shrink-0" /> 
              <span className="truncate">{entry.venue}</span>
            </div>

            {/* Tasks */}
            {entry.tasks?.length > 0 && (
              <div className="space-y-1">
                {entry.tasks.slice(0, 2).map((task, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-success rounded-full shrink-0" />
                    <span className="text-xs font-bold text-muted-foreground">{task}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {entry.actions?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entry.actions.map((action, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/grading');
                    }}
                     className="flex items-center gap-1 px-2 py-1 bg-brand-primary text-primary-foreground text-xs font-black rounded-lg hover:bg-brand-primary/90 transition-all cursor-pointer"
                  >
                    <BookOpen size={8} />
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Materials */}
            {entry.materials?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entry.materials.slice(0, 2).map((mat, i) => (
                   <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground text-xs font-bold rounded-full max-w-full truncate">
                    {mat.type === 'PDF' ? <FileText size={8} className="shrink-0" /> : <LinkIcon size={8} className="shrink-0" />}
                    <span className="truncate">{mat.title}</span>
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
   );
}