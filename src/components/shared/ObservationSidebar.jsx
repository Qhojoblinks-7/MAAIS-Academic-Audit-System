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
  // Optional but recommended to handle state lifting and prevent loss on unmount:
  isFlagged = false,
  onFlagChange,
  safetyChecked = false,
  onSafetyCheckChange,
}) {
  const safeStudent = student || { name: '', index: '' };
  const isCorrection = mode === 'correction';
  const isCompliance = mode === 'compliance';
  // Note: isBehavioral removed — WAEC STP §7 ratingsList is now unified for all
  // non-correction modes; behavioral mode is preserved via the G-ratings section.

  // Fallback local state if state-lifting props aren't wired up from parent yet
  const [localIsFlagged, setLocalIsFlagged] = React.useState(false);
  const [localSafetyChecked, setLocalSafetyChecked] = React.useState(false);

  const activeFlagged = onFlagChange ? isFlagged : localIsFlagged;
  const activeSafety = onSafetyCheckChange ? safetyChecked : localSafetyChecked;

  const toggleFlag = () => {
    if (onFlagChange) onFlagChange(!isFlagged);
    else setLocalIsFlagged(!localIsFlagged);
  };

  const toggleSafety = (checked) => {
    if (onSafetyCheckChange) onSafetyCheckChange(checked);
    else setLocalSafetyChecked(checked);
  };

  // WAEC STP §7 Qualitative Assessment — define rating categories aligned to
  // the four mandated WAEC observation groups: Lab Safety (workshop subjects),
  // Behavioral (attitudinal), Resource Economy (conservation & inventory care),
  // Hygienic Practices (cleanliness & personal hygiene).
  // WAEC-compliant categories — 1–5 rating scale per STP Qualitative Assessment module
  const ratingsList = [
    { label: 'Lab Safety',        id: 'lab_safety',       description: 'Follows all workshop safety guidelines and PPE protocols' },
    { label: 'Behavioral',         id: 'behavioral',        description: 'Attitudinal: punctuality, respect, classroom conduct' },
    { label: 'Resource Economy',   id: 'resource_economy',  description: 'Conserves materials, tools, and consumables' },
    { label: 'Hygienic Practices', id: 'hygienic_practices',description: 'Maintains personal hygiene and workspace cleanliness' },
  ];

  // Show the justification/comment block if any WAEC rating is below 3 (FR3 multi-field gate)
  const hasLowRating = Object.values(ratings).some(
    (score) => score > 0 && score < 3
  );

  const headerColor = isCorrection ? "bg-red-100/50 text-red-900" :
                      isCompliance ? "bg-amber-100/50 text-amber-900" :
                      "bg-[#D1E9E0] text-gray-800";

  return (
    <motion.aside
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      className="w-[300px] h-[calc(100vh-2rem)] flex flex-col m-4 rounded-[1.5rem] border border-gray-100 shadow-2xl bg-white shrink-0 overflow-hidden"
    >
      {/* Sticky Sidebar Header */}
      <div className={cn("px-5 py-4 font-black flex items-center justify-between shrink-0 backdrop-blur-md border-b border-gray-100/20", headerColor)}>
        <span className="text-base tracking-tight">
          {isCorrection ? 'Correction Bridge' :
           isCompliance ? 'Guided Observation' :
           'Behavioral Observation'}
        </span>
        <button 
          type="button"
          onClick={onClose} 
          className="opacity-50 hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-black/5"
          aria-label="Close sidebar"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-6">
        <div className="p-5 flex flex-col gap-4">
          {/* Student Information */}
          <div className="flex items-center gap-3 mb-1">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(safeStudent.name || 'default')}`}
              alt={`Avatar of ${safeStudent.name}`}
              className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-white shadow-md shadow-gray-200 object-cover"
            />
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-tight">{safeStudent.name || 'Select Student'}</h3>
              <p className="text-xs font-bold text-gray-500">Index No. {safeStudent.index || 'N/A'}</p>
            </div>
          </div>

          <div className="h-px bg-gray-100 -mx-5" />

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
                  <div key={rating.id} className="pb-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-xs font-black text-gray-800 tracking-tight whitespace-nowrap">{rating.label}</span>
                      <span className="text-[9px] font-medium text-gray-500 text-right line-clamp-1">{rating.description}</span>
                    </div>
                    <div className="flex gap-1 justify-between">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => onRatingChange?.(rating.id, num)}
                          className={cn(
                            "w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all",
                            ratings[rating.id] === num
                              ? "bg-[#015D34] border-[#015D34] text-white shadow-md scale-105"
                              : "border-gray-200 text-gray-600 hover:border-[#015D34] hover:text-[#015D34] hover:bg-emerald-50"
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
              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Safety & Status</h4>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={activeSafety}
                      onChange={(e) => toggleSafety(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-6 h-6 border-2 border-emerald-600 rounded flex items-center justify-center transition-all shrink-0 group-hover:scale-105",
                      activeSafety ? "bg-emerald-600" : "bg-white"
                    )}>
                      {activeSafety && <ShieldCheck size={16} className="text-white" />}
                    </div>
                    <span className="text-xs font-bold text-gray-700">Followed Lab Safety Guidelines</span>
                  </label>

                  {/* Flag Switch Mechanism */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      {activeFlagged && <AlertTriangle size={14} className="text-red-500" />}
                      Flag Student for Review
                    </span>
                    <button
                      type="button"
                      onClick={toggleFlag}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative p-1 shadow-inner shrink-0",
                        activeFlagged ? "bg-red-500" : "bg-gray-200"
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
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <label htmlFor="audit-justification" className="text-xs font-bold text-gray-800">
                      Audit Justification
                    </label>
                    <span className="text-[9px] font-black text-red-500 uppercase animate-pulse">Required</span>
                  </div>
                  <textarea
                    id="audit-justification"
                    value={comment}
                    onChange={(e) => onCommentChange?.(e.target.value)}
                    placeholder="Please provide context for lower ratings..."
                    className="w-full h-20 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sticky Action Buttons Footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-white shrink-0">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSave}
            className="flex-1 py-2.5 bg-[#015D34] text-white font-black rounded-full text-xs hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-black rounded-full text-xs hover:bg-gray-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </motion.aside>
  );
}