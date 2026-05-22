import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Clock, MessageSquare, ArrowDownCircle, CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { HODCommentInput, StatusBadge, EmptyState } from '../molecules';
import { useHOD } from '../../context/HODContext';

function CommentBubble({ comment, role, timestamp }) {
  const isTeacher = role === 'teacher';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-2',
        isTeacher ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      <div className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold',
        isTeacher ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
      )}>
        {isTeacher ? 'T' : 'H'}
      </div>

      <div className={cn(
        'flex-1 max-w-[80%] px-3 py-2 rounded-xl',
        isTeacher
          ? 'bg-gray-100 text-gray-800 rounded-tl-none'
          : 'bg-emerald-50 text-gray-800 rounded-tr-none'
      )}>
        <p className="text-[10px] font-bold text-gray-400 mb-0.5">{role === 'teacher' ? 'Teacher' : 'HOD'}</p>
        <p className="text-xs text-gray-800 whitespace-pre-wrap break-words">{comment}</p>
        {timestamp && (
          <p className="text-[9px] text-gray-400 mt-1">
            {typeof timestamp === 'string' ? timestamp.split('T')[0] + ' ' + (timestamp.split('T')[1] || '').slice(0, 5) : 'Just now'}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function ThreadEntry({ log }) {
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center gap-2 flex-wrap py-1">
        <StatusBadge status={log.status} />
        <span className="text-[11px] font-medium text-gray-800">{log.action || 'Grade change'}</span>
        {log.justification && (
          <span className="text-[10px] text-gray-500">{log.justification.slice(0, 60)}{log.justification.length > 60 ? '…' : ''}</span>
        )}
        <button
          onClick={() => setShowInput(!showInput)}
          className="ml-auto px-2 py-0.5 text-[10px] font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-1"
        >
          <MessageSquare size={10} />
          Reply
        </button>
      </div>

      {/* Thread */}
      <div className="space-y-2 pl-2 border-l-2 border-gray-100">
        {/* Teacher justification */}
        {log.justification && (
          <CommentBubble
            comment={log.justification}
            role="teacher"
            timestamp={log.timestamp}
          />
        )}

        {/* HOD comment */}
        {log.hodComment && (
          <CommentBubble
            comment={log.hodComment}
            role="hod"
            timestamp={log.timestamp}
          />
        )}

        {/* No comments yet */}
        {!log.justification && !log.hodComment && (
          <p className="text-[10px] text-gray-400 pl-4">No comment on this record yet.</p>
        )}

        {/* HOD reply input */}
        <AnimatePresence>
          {showInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="pl-4 pt-1">
                <HODCommentInput
                  onSubmit={(val) => {
                    setShowInput(false);
                  }}
                  placeholder="Add HOD response..."
                  maxLength={500}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function HODCommentThread({ entries: controlledEntries, onReply, className }) {
  const { auditLogs } = useHOD();
  const entries = controlledEntries ?? auditLogs;
  const threadEntries = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    // Filter to entries that have at least a justification or HOD comment
    return entries.filter(
      (e) => (e.justification && e.justification.trim()) || (e.hodComment && e.hodComment.trim())
    );
  }, [entries]);

  return (
    <div className={cn('space-y-3', className)}>
      {threadEntries.length === 0 ? (
        <EmptyState
          title="No comments yet"
          description="Teacher justifications and HOD feedback will appear here."
        />
      ) : (
        <div className="space-y-4">
          {threadEntries.map((entry, i) => (
            <ThreadEntry key={entry.id || i} log={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
