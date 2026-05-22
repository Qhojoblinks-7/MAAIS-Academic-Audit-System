import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, GraduationCap, CheckCircle2, XCircle,
  MessageSquare, RefreshCw, AlertTriangle, ChevronRight,
  BookOpen
} from 'lucide-react';

import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { hodService } from '../../services/hodService';
import { auditTrail } from '../../services/auditTrailService';
import { notification } from '../../services/notificationService';
import { eventBus } from '../../services/eventBus';
import { HODCommentInput, ActionButtonGroup, StatusBadge, SubmissionProgressSparkline, ConfirmationDialog }
  from '../../components/molecules';
import { GradeComparisonView } from '../../components/organisms';

function SubjectRow({ subject, studentName, onAddRemark, onReject }) {
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl p-3 bg-white hover:bg-gray-50/50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen size={13} className="text-gray-400 shrink-0" />
            <p className="text-xs font-semibold text-gray-900">{subject.subject || subject.name || '—'}</p>
            <SubmissionProgressSparkline value={subject.progress || 0} size="sm" />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1.5">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">SBA</p>
              <p className="text-xs font-bold text-gray-800">{subject.sba ?? '—'}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Exam</p>
              <p className="text-xs font-bold text-gray-800">{subject.exam ?? '—'}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Final</p>
              <p className="text-xs font-bold text-gray-800">{subject.final ?? '—'}</p>
            </div>
          </div>
          <p className="text-[10px] font-medium mt-1 text-gray-600">
            Current grade: <StatusBadge status={subject.grade || 'N/A'} />
          </p>
        </div>

        <ActionButtonGroup
          actions={[
            {
              label: 'Approve',
              variant: 'primary',
              icon: CheckCircle2,
              onClick: () => { onAddRemark?.({ subjectId: subject.id, remark }); setRemark(''); },
            },
            {
              label: 'Reject',
              variant: 'danger',
              icon: XCircle,
              onClick: () => onReject?.({
                subjectId: subject.id,
                subjectName: subject.subject || subject.name,
                remark,
              }),
            },
          ]}
          className="flex-wrap"
        />
      </div>
    </div>
  );
}

function StudentCard({ student, onSelectRemark, className }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden", className)}
    >
      <button onClick={() => setExpanded(!expanded)}
        className="w-full p-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 text-sm font-bold text-emerald-700">
          {(student.name || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-gray-900 truncate">{student.name || 'Unknown'}</p>
            <span className="text-[10px] font-mono text-gray-400">{student.indexNumber || student.index || '—'}</span>
          </div>
          <p className="text-[10px] text-gray-500">
            {student.form || student.className || '—'} · {student.programme || (student.subjects?.length ?? 0)} subjects
          </p>
        </div>
        <ChevronRight
          size={14}
          className={cn('text-gray-400 shrink-0 transition-transform', expanded && 'rotate-90')}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-3 pb-3 pl-[3.75rem] space-y-2 border-t border-gray-50">
              {student.subjects?.map((s, i) => (
                <SubjectRow key={s.id || i} subject={s} studentName={student.name} />
              ))}
              <HODCommentInput
                onSubmit={(remark) => onSelectRemark?.({ studentId: student.id, studentName: student.name, remark })}
                placeholder={`Add HOD remark for ${student.name || 'this student'}…`}
                maxLength={500}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function HODReview() {
  const {
    departmentProgress, refreshDepartmentProgress, isLoading,
    rejectRevision,
  } = useHOD();

  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rejectConfirm, setRejectConfirm] = useState(null); // { studentName, subjectName, onConfirm }

  // Flatten students from all department classes
  const allStudents = useMemo(() => {
    const list = [];
    departmentProgress.forEach(cls => {
      (cls.students || []).forEach(s => {
        list.push({
          ...s,
          className: cls.className || s.className,
          subject:   cls.subject   || s.subject,
          subjects:  cls.subjects  || s.subjects || [],
          status:    cls.status,
          form:      cls.form,
          programme: cls.programme,
        });
      });
    });
    return list;
  }, [departmentProgress]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allStudents;
    const q = search.toLowerCase();
    return allStudents.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.indexNumber || '').toLowerCase().includes(q) ||
      (s.className || '').toLowerCase().includes(q)
    );
  }, [allStudents, search]);

  const hits = selectedStudent
    ? allStudents.filter(s => s.name === selectedStudent.name)
    : filtered.slice(0, 20);

  const handleAddRemark = async ({ studentId, studentName, remark }) => {
    if (!remark || remark.length < 10) { alert('HOD-AR-2.2: Remark must be at least 10 characters.'); return; }
    try {
      const oldVal = auditTrail.captureSnapshot({});
      const result = await hodService.updateHODComment(studentId, remark);
      const newVal = auditTrail.captureSnapshot({ comment: remark });
      await auditTrail.logChange('student_result', studentId, oldVal, newVal, remark);
      eventBus.emit('hod-comment-added', { studentId, studentName, remark });
      await notification.notifyTeacherOfHODAction(studentId, 'COMMENT_ADDED', result?.id || studentId, remark);
      console.info('[HODReview] remark added:', studentId, studentName, remark);
    } catch (e) {
      console.error('Failed to add remark:', e);
    }
  };

  const handleReject = async ({ subjectId, studentName, remark, subjectName }) => {
    setRejectConfirm({
      studentName: studentName || 'this student',
      subjectName: subjectName || subjectId,
      onConfirm: async () => {
        try {
          const oldVal = auditTrail.captureSnapshot({ rejected: false });
          await rejectRevision(subjectId, remark || 'No reason given');
          const newVal = auditTrail.captureSnapshot({ rejected: true });
          await auditTrail.logChange(
            'grade_revision', subjectId, oldVal, newVal, `HOD rejected revision for ${studentName}: ${remark}`
          );
          eventBus.emit('grade-revision-rejected', { recordId: subjectId, studentName, reason: remark });
          await notification.notifyTeacherOfHODAction(studentName || subjectId, 'GRADE_REVISION_REJECTED', subjectId, remark);
          console.info('[HODReview] rejected:', subjectId, remark);
        } catch (e) {
          console.error('[HODReview] reject failed:', e);
        } finally {
          setRejectConfirm(null);
        }
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Grade Review</h1>
              <p className="text-sm text-gray-500 mt-0.5">HOD remarks · approve · reject — HOD-AR-3.x</p>
            </div>
            <button onClick={refreshDepartmentProgress} disabled={isLoading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm">
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student by name, index, or class…"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
            />
          </div>

          {/* Grade comparison (HOD-AR-3.3) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <AlertTriangle size={16} className="text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-900">Grade Comparison — Current vs Previous Term</h2>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-gray-400">HOD-AR-3.3</span>
            </div>
            <div className="p-4">
              <GradeComparisonView
                subjects={departmentProgress.slice(0, 6)}
                className=""
              />
            </div>
          </div>

          {search.trim() === '' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allStudents.slice(0, 9).map((s, i) => (
                <button key={s.id || i} onClick={() => { setSelectedStudent(s); setSearch(s.name); }}
                  className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-sm font-bold text-emerald-700">
                      {(s.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{s.name || 'Unknown'}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{s.indexNumber || '—'} · {s.className || '—'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <StatusBadge status={s.status || 'ACTIVE'} />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {hits.length === 0 ? (
                <div className="text-center py-10">
                  <GraduationCap size={42} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No students match &ldquo;{search}&rdquo;</p>
                </div>
              ) : (
                hits.map((s, i) => (
                  <StudentCard
                    key={s.id || i}
                    student={s}
                    className="cursor-pointer"
                    onSelectRemark={handleAddRemark}
                    onReject={handleReject}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        open={!!rejectConfirm}
        title="Reject Grade Revision"
        message={`Reject the revision for ${rejectConfirm?.studentName || 'this student'}? The teacher will be notified with your reason.`}
        confirmLabel="Reject"
        variant="danger"
        onConfirm={() => rejectConfirm?.onConfirm?.()}
        onCancel={() => setRejectConfirm(null)}
      />
    </div>
  );
}
