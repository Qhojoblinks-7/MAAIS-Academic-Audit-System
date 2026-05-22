import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Eye, Key, ChevronDown, LogOut, ShieldCheck, AlertTriangle, Clock, StopCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ActionButtonGroup, LoadingSpinner, EmptyState, ConfirmationDialog } from '../molecules';
import { useHOD } from '../../context/HODContext';
import { auditTrail } from '../../services/auditTrailService';
import { notification } from '../../services/notificationService';
import { eventBus } from '../../services/eventBus';

function TeacherCard({ teacher, onImpersonate, onResetPassword }) {
  const [open, setOpen] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleResetPassword = async () => {
    await onResetPassword?.(teacher);
    setShowResetDialog(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 text-sm font-bold text-purple-700">
          {(teacher.name || '?').charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-gray-900 truncate">{teacher.name || 'Unknown'}</p>
          <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
            <span className="font-mono">{teacher.id || '—'}</span>
            {teacher.subject && (
              <>
                <span className="text-gray-300">·</span>
                {teacher.subject}
              </>
            )}
            {teacher.email && (
              <>
                <span className="text-gray-300">·</span>
                {teacher.email}
              </>
            )}
          </div>
        </div>

        <ChevronDown
          size={14}
          className={cn('text-gray-400 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-50"
          >
            <div className="px-3 pb-3 pl-[3.75rem] flex flex-wrap gap-2">
              <button
                onClick={() => onImpersonate?.(teacher)}
                className="px-3 py-1.5 bg-purple-600 text-white text-[10px] font-medium rounded-lg hover:bg-purple-700 flex items-center gap-1"
              >
                <Eye size={11} /> View as Teacher
              </button>
              <button
                onClick={() => setShowResetDialog(true)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[10px] font-medium rounded-lg hover:bg-gray-200 flex items-center gap-1"
              >
                <Key size={11} /> Reset Password
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        open={showResetDialog}
        title="Reset Teacher Password"
        message={`Reset password for ${teacher.name}? A temporary password will be generated.`}
        confirmLabel="Reset Password"
        onConfirm={handleResetPassword}
        onCancel={() => setShowResetDialog(false)}
        variant="warning"
      />
    </div>
  );
}

function ImpersonationBanner({ teacherName, onStop }) {
  const [time, setTime] = useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-purple-50 border border-purple-200/60 rounded-2xl p-4 flex items-center gap-3"
    >
      <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center shrink-0">
        <Eye size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-purple-800">
          Viewing as <span className="font-black uppercase">{teacherName}</span>
        </p>
        <p className="text-[10px] text-purple-600 mt-0.5 flex items-center gap-1">
          <Clock size={10} />
          Session timer: {Math.floor(time / 60)}m {time % 60}s
        </p>
      </div>

      <button
        onClick={onStop}
        className="px-3 py-1.5 bg-purple-700 text-white text-[10px] font-medium rounded-lg hover:bg-purple-800 flex items-center gap-1 shrink-0"
      >
        <StopCircle size={11} />
        Stop Impersonation
      </button>
    </motion.div>
  );
}

export function TeacherImpersonationConsole({
  teachers: controlledTeachers,
  viewAsTeacherId,
  viewAsTeacherName,
  onImpersonate,
  onStop,
  onResetPassword,
  showBanner = true,
  className,
}) {
  const { departmentTeachers, refreshDepartmentTeachers, isLoading } = useHOD();
  const teachers = controlledTeachers ?? departmentTeachers;
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return teachers;
    const q = search.toLowerCase();
    return teachers.filter(
      (t) =>
        (t.name || '').toLowerCase().includes(q) ||
        (t.id || '').toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q)
    );
  }, [teachers, search]);

  const handleImpersonate = async (teacher) => {
    const oldVal = auditTrail.captureSnapshot({ impersonating: null });
    await onImpersonate?.(teacher);
    const newVal = auditTrail.captureSnapshot({ impersonating: teacher.id });
    await auditTrail.logChange('impersonation_session', teacher.id, oldVal, newVal, `HOD viewing as ${teacher.name}`);
    eventBus.emit('impersonation-started', { teacherId: teacher.id, teacherName: teacher.name });
    setSearch('');
  };

  const isImpersonating = Boolean(viewAsTeacherId);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Active impersonation banner */}
      {showBanner && isImpersonating && viewAsTeacherName && (
        <ImpersonationBanner
          teacherName={viewAsTeacherName}
          onStop={() => onStop?.()}
        />
      )}

      {/* Search */}
      <div className="relative">
        <Search
          size={12}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teachers by name, ID, or subject…"
          className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
        />
      </div>

      {/* Teacher cards */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No teachers found"
          description={search ? 'No teachers match your search query.' : 'No teachers in this department.'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((teacher, i) => (
            <TeacherCard
              key={teacher.id || i}
              teacher={teacher}
              onImpersonate={handleImpersonate}
              onResetPassword={onResetPassword}
            />
          ))}
        </div>
      )}

      {/* Refresh + audit info */}
      {isImpersonating && (
        <div className="flex items-center gap-2 text-[9px] text-purple-600 border-t border-purple-200/50 pt-2">
          <AlertTriangle size={10} />
          All actions during impersonation are logged in the audit trail for accountability.
        </div>
      )}
    </div>
  );
}
