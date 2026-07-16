import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, History, MessageSquare, Send, Paperclip } from 'lucide-react';

export function CorrectionMode({
  student,
  hodFeedback,
  teacherReply,
  onReplyChange,
  onSubmitToHOD,
  originalMark,
  newMark,
}) {
  return (
    <div className="flex-1 flex flex-col gap-5">
      {hodFeedback && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-destructive uppercase tracking-widest">
            <History size={12} />
            HOD Feedback
          </div>
          <div className="bg-destructive/10 rounded-xl p-3 border border-destructive/20 relative">
            <div className="flex gap-2 mb-2">
              <MessageSquare size={14} className="text-destructive mt-1 shrink-0" />
              <p className="text-xs text-text-secondary leading-relaxed">
                <span className="font-bold text-destructive">HOD {hodFeedback.teacherName}: </span>
                "{hodFeedback.message}"
              </p>
            </div>
            <span className="block text-right text-xs font-bold text-muted-foreground uppercase">{hodFeedback.timeAgo}</span>
          </div>
        </div>
      )}

      <div className="space-y-3 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
            <Send size={12} />
            Your Explanation
          </div>
          <button type="button" className="p-1 text-muted-foreground hover:text-success transition-colors cursor-pointer" aria-label="Attach documents">
            <Paperclip size={14} />
          </button>
        </div>
        <textarea
          value={teacherReply}
          onChange={(e) => onReplyChange?.(e.target.value)}
          placeholder="Explain the fix..."
          className="w-full h-24 bg-muted border border-border rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-success/20 resize-none"
        />
        <div className="flex flex-wrap gap-2">
          {['Typo Fixed', 'Remarked', 'Data Verified'].map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => onReplyChange?.(tag)}
               className="px-2 py-1 bg-muted text-xs font-black text-text-secondary uppercase tracking-widest rounded-lg hover:bg-success/10 hover:text-success transition-all cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmitToHOD}
        className="w-full py-3 bg-success text-background font-black rounded-xl text-xs hover:bg-success/90 transition-all shadow-lg shadow-success/20 flex items-center justify-center gap-2 mt-auto cursor-pointer"
      >
        Submit to HOD
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

export function CorrectionMarkInput({ student, isTarget, tempMark, originalMark, onMarkChange, isTermFinalized }) {
  if (!isTarget) {
    return (
      <input 
        type="number" 
        value={student.secB ?? ''} 
        readOnly={isTermFinalized} 
        onBlur={(e) => {
          // NaN-on-blank double-guard: write 0 if field is empty per WAEC STP T-AR-1.2
          if (e.target.value === '' || e.target.value === null) {
            onMarkChange(student.id, 'secB', 0);
          }
        }}
        onChange={(e) => onMarkChange(student.id, 'secB', e.target.value)} 
        className="w-16 bg-transparent text-center text-xs font-bold focus:outline-none focus:ring-1 focus:ring-success rounded-md" 
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      <input 
        type="number" 
        value={tempMark} 
        readOnly={isTermFinalized} 
        onBlur={(e) => {
          // NaN-on-blank double-guard for secB temp-mark field
          if (e.target.value === '' || e.target.value === null) {
            onMarkChange(student.id, 'secB', 0);
          }
        }}
        onChange={(e) => { 
          onMarkChange(student.id, 'secB', e.target.value); 
        }} 
        className="w-16 bg-transparent text-center text-xs font-black text-destructive focus:outline-none" 
      />
      <div className="text-xs font-black text-muted-foreground flex items-center gap-1 mt-1">
        <span className="line-through">{originalMark}</span>
        <ArrowRight size={8} />
        <span className="text-destructive">{tempMark || '-'}</span>
      </div>
    </div>
  );
}

export function CorrectionModeBanner() {
  return (
    <div className="px-3 py-1 bg-destructive text-background text-xs font-black uppercase tracking-widest rounded-lg animate-pulse">
      Correction Mode
    </div>
  );
}

export function JustificationPopup({ 
  isOpen, 
  onClose, 
  justification, 
  onJustificationChange, 
  onSave,
  originalMark: overlayOriginalMark,
  newValue: overlayNewValue,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-surface shrink-0">
          <h3 className="text-xl font-black text-foreground">Justification Required</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <p className="mb-4 text-text-secondary text-sm">
            This mark has already been recorded. Please provide a reason for changing it:
          </p>

          {/* WAEC STP FR3 — original vs new value delta display */}
          {overlayOriginalMark !== undefined && overlayOriginalMark !== null && (
            <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-2xl flex items-center gap-4">
              <span className="text-xs font-black text-warning uppercase tracking-widest shrink-0">Change</span>
              <span className="text-sm font-black text-muted-foreground line-through">
                {overlayOriginalMark}
              </span>
              <span className="text-warning text-lg">→</span>
              <span className="text-sm font-black text-success">
                {overlayNewValue}
              </span>
            </div>
          )}

          <textarea
            value={justification}
            onChange={(e) => onJustificationChange(e.target.value)}
            placeholder="e.g. Typo correction; student retook test; script re-marked by HOD"
            className="w-full min-h-[80px] p-3 border border-border rounded-lg focus:ring-2 focus:ring-success focus:border-success resize-none text-sm"
          />
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-muted text-text-secondary rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-6 py-2 bg-success text-background font-black rounded-lg hover:bg-success/90 transition-colors"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
