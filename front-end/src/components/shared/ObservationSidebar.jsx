import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CorrectionMode } from './CorrectionMode';

export function ObservationSidebar({
  mode,
  student = { name: '', index: '' },
  onClose,
  ratings = {},
  onRatingChange,
  comment = '',
  onCommentChange,
  onSave,
  hodFeedback,
  teacherReply = '',
  onReplyChange,
  onSecondaryAction,
  isFlagged = false,
  onFlagChange,
  safetyChecked = false,
  onSafetyCheckChange,
  disabled = false,
  saving = false,
}) {
  const safeStudent = student || { name: '', index: '' };
  const isCorrection = mode === 'correction';
  const isCompliance = mode === 'compliance';

  const [localIsFlagged, setLocalIsFlagged] = React.useState(false);
  const [localSafetyChecked, setLocalSafetyChecked] = React.useState(false);

  const activeFlagged = onFlagChange ? isFlagged : localIsFlagged;
  const activeSafety = onSafetyCheckChange ? safetyChecked : localSafetyChecked;

  const toggleFlag = () => {
    if (onFlagChange) onFlagChange(!activeFlagged);
    else setLocalIsFlagged(!localIsFlagged);
  };

  const toggleSafety = (checked) => {
    if (onSafetyCheckChange) onSafetyCheckChange(checked);
    else setLocalSafetyChecked(checked);
  };

  const ratingsList = [
    { label: 'Lab Safety',        id: 'lab_safety',        description: 'Follows all workshop safety guidelines and PPE protocols' },
    { label: 'Behavioral',         id: 'behavioral',        description: 'Attitudinal: punctuality, respect, classroom conduct' },
    { label: 'Resource Economy',   id: 'resource_economy',  description: 'Conserves materials, tools, and consumables' },
    { label: 'Hygienic Practices', id: 'hygienic_practices', description: 'Maintains personal hygiene and workspace cleanliness' },
  ];

  const hasLowRating = Object.values(ratings).some(
    (score) => score > 0 && score < 3
  );

  const headerColor = isCorrection ? "bg-destructive/10 text-destructive" :
                      isCompliance ? "bg-warning/10 text-warning" :
                      "bg-success/10 text-foreground";

  return (
    <motion.aside
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
      className="w-[300px] fixed top-20 right-4 bottom-4 flex flex-col rounded-[1.5rem] border border-border shadow-2xl bg-surface z-30 overflow-hidden"
    >
      {/* Sticky Sidebar Header */}
      <div className={cn("px-5 py-4 font-black flex items-center justify-between shrink-0 border-b border-border/20", headerColor)}>
        <span className="text-base tracking-tight">
          {isCorrection ? 'Correction Bridge' :
           isCompliance ? 'Guided Observation' :
           'Behavioral Observation'}
        </span>
        <button 
          type="button"
          onClick={onClose} 
          className="opacity-50 hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted cursor-pointer"
          aria-label="Close sidebar"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-6 overscroll-contain">
        <div className="p-5 flex flex-col gap-4">
          {/* Student Information */}
          <div className="flex items-center gap-3 mb-1">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(safeStudent.name || 'default')}`}
              alt={`Avatar of ${safeStudent.name}`}
              className="w-12 h-12 rounded-full bg-success/10 border-2 border-background shadow-md shadow-muted object-cover"
            />
            <div>
              <h3 className="text-lg font-black text-foreground leading-tight">{safeStudent.name || 'Select Student'}</h3>
              <p className="text-xs font-bold text-muted-foreground">Index No. {safeStudent.index || safeStudent.id?.slice(0, 8) || 'N/A'}</p>
            </div>
          </div>

          <div className="h-px bg-border -mx-5" />

          {/* Dynamic Mode Forms */}
          {isCorrection ? (
            <CorrectionMode
              student={safeStudent}
              hodFeedback={hodFeedback}
              teacherReply={teacherReply}
              onReplyChange={onReplyChange}
              onSubmitToHOD={onSecondaryAction}
              originalMark={null}
              newMark={null}
            />
          ) : (
            <>
              {/* Standard Rating Matrix */}
              <div className="space-y-4">
                {ratingsList.map((rating) => (
                  <div key={rating.id} className="pb-3 border-b border-border last:border-0">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-xs font-black text-foreground tracking-tight whitespace-nowrap">{rating.label}</span>
                      <span className="text-xs font-medium text-muted-foreground text-right line-clamp-1">{rating.description}</span>
                    </div>
                    <div className="flex gap-1 justify-between">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => onRatingChange?.(rating.id, num)}
                          className={cn(
                            "w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all cursor-pointer",
                            ratings[rating.id] === num
                              ? "bg-success border-success text-background shadow-md scale-105"
                              : "border-border text-text-secondary hover:border-success hover:text-success hover:bg-success/10"
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Safety Guidelines Form Control */}
              <div className="pt-3 border-t border-border">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Safety & Status</h4>
                <div className="flex flex-col gap-3">
                  <label 
                       className="flex items-center gap-3 cursor-pointer select-none group"
                    >
                       <input
                         type="checkbox"
                         checked={activeSafety}
                         onChange={(e) => toggleSafety(e.target.checked)}
                         className="sr-only"
                       />
                       <div className={cn(
                         "w-6 h-6 border-2 border-success rounded flex items-center justify-center transition-all shrink-0 group-hover:scale-105",
                         activeSafety ? "bg-success" : "bg-surface"
                       )}>
                          {activeSafety && <ShieldCheck size={16} className="text-background" />}
                       </div>
                       <span className="text-xs font-bold text-foreground">Followed Lab Safety Guidelines</span>
                     </label>

                  {/* Flag Switch Mechanism */}
                   <div className="flex items-center justify-between pt-1">
                     <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                       {activeFlagged && <AlertTriangle size={14} className="text-destructive" />}
                       Flag Student for Review
                     </span>
                     <button
                       type="button"
                       onClick={toggleFlag}
                       className={cn(
                         "w-12 h-6 rounded-full transition-all relative p-1 shadow-inner shrink-0 cursor-pointer",
                         activeFlagged ? "bg-destructive" : "bg-muted"
                       )}
                      aria-label="Flag student for review"
                    >
                      <motion.div
                        animate={{ x: activeFlagged ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="w-4 h-4 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Audit Justification Field */}
              {hasLowRating && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <label htmlFor="audit-justification" className="text-xs font-bold text-foreground">
                      Audit Justification
                    </label>
                    <span className="text-xs font-black text-destructive uppercase animate-pulse">Required</span>
                  </div>
                  <textarea
                    id="audit-justification"
                    value={comment}
                    onChange={(e) => onCommentChange?.(e.target.value)}
                    placeholder="Please provide context for lower ratings..."
                    className="w-full h-20 bg-muted border border-border rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-destructive/20 resize-none"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sticky Action Buttons Footer */}
      <div className="px-5 py-3 border-t border-border bg-surface shrink-0">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={disabled || saving}
            className={cn(
              "flex-1 py-2.5 font-black rounded-full text-xs transition-all shadow-md",
              disabled || saving
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-success text-background hover:bg-success/90 shadow-success/20 cursor-pointer"
            )}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className={cn(
              "flex-1 py-2.5 font-black rounded-full text-xs transition-all",
              disabled
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-muted text-foreground hover:bg-muted cursor-pointer"
            )}
          >
            Close
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

export default ObservationSidebar;
