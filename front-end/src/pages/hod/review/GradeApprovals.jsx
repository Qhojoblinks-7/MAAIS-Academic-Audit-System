import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  GraduationCap,
  CheckCircle2,
  XCircle,
  BookOpen,
  X,
  ChevronRight,
  Check,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge, SubmissionProgressSparkline, ConfirmationDialog } from '@/components/molecules';
import { GradeDiscussionThread } from '@/components/organisms';
import { HODCommentInput, ActionButtonGroup } from '@/components/molecules';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

function SubjectRow({ subject, studentName, onAddRemark, onApprove, onReject }) {
  const [remark, setRemark] = useState('');

  const handleAction = (callback, payload) => {
    if (typeof callback === 'function') {
      callback(payload);
      setRemark('');
    }
  };

  return (
    <div className="border border-gray-200/60 rounded-xl p-3 bg-white shadow-3xs transition-all hover:border-gray-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <BookOpen size={12} className="text-gray-400 shrink-0" />
            <p className="text-xs font-bold text-gray-900">{subject?.subject || subject?.name || 'Unassigned Curriculum'}</p>
            <SubmissionProgressSparkline value={subject?.progress || 0} size="sm" />
          </div>
          <div className="grid grid-cols-3 gap-2 max-w-xs bg-slate-50 p-2 rounded-lg border border-gray-200/40">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">SBA</p>
              <p className="text-xs font-bold text-gray-700">{subject?.sba ?? '—'}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Exam</p>
              <p className="text-xs font-bold text-gray-700">{subject?.exam ?? '—'}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Final</p>
              <p className="text-xs font-bold text-gray-950">{subject?.final ?? '—'}</p>
            </div>
          </div>
          <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
            Status Boundary: <StatusBadge status={subject?.grade || 'N/A'} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-2 shrink-0">
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Add override details..."
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder-gray-400 font-medium w-full sm:w-44"
          />
          <ActionButtonGroup
            actions={[
              {
                label: 'Approve',
                variant: 'primary',
                icon: CheckCircle2,
                onClick: () => handleAction(onApprove, { subjectId: subject?.id, remark }),
              },
              {
                label: 'Reject',
                variant: 'danger',
                icon: XCircle,
                onClick: () => handleAction(onReject, { subjectId: subject?.id, subjectName: subject?.subject || subject?.name, remark }),
              },
            ]}
            className="gap-1 justify-end"
          />
        </div>
      </div>
    </div>
  );
}

export function GradeApprovals({ pipeline }) {
  const { departmentProgress, addStudentRemark, rejectSubject, approveSubject } = pipeline;
  const [search, setSearch] = useState('');
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [rejectConfirm, setRejectConfirm] = useState(null);

  const allStudents = useMemo(() => {
    if (!Array.isArray(departmentProgress)) return [];
    const list = [];
    departmentProgress.forEach((cls) => {
      if (!cls) return;
      const studentArray = Array.isArray(cls.students) ? cls.students : [];
      studentArray.forEach((s) => {
        if (!s) return;
        list.push({
          ...s,
          className: cls.className || s.className || 'Unknown Class Matrix',
          subject: cls.subject || s.subject,
          subjects: Array.isArray(cls.subjects) ? cls.subjects : Array.isArray(s.subjects) ? s.subjects : [],
          status: cls.status || s.status || 'PENDING',
          form: cls.form || s.form,
          programme: cls.programme || s.programme,
        });
      });
    });
    return list;
  }, [departmentProgress]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const students = !query
      ? allStudents
      : allStudents.filter((s) =>
          String(s?.name || '').toLowerCase().includes(query) ||
          String(s?.indexNumber || '').toLowerCase().includes(query) ||
          String(s?.className || '').toLowerCase().includes(query),
        );
    if (students.length > 0 && !activeStudentId) setActiveStudentId(students[0].id);
    return students;
  }, [allStudents, search, activeStudentId]);

  const selectedStudent = useMemo(
    () => allStudents.find((s) => s.id === activeStudentId) || filteredStudents[0] || null,
    [allStudents, activeStudentId, filteredStudents],
  );

  const handleAddRemark = useCallback(
    async ({ studentId, remark }) => {
      if (!remark || remark.trim().length < 10) {
        return { error: 'Remarks must be at least 10 characters.' };
      }
      const gradeEntryId = selectedStudent?.subjects?.[0]?.id;
      const res = await addStudentRemark({ gradeEntryId, remark: remark.trim() });
      if (res?.error) toast.error(res.error);
      else toast.success('HOD remark recorded as a revision request');
    },
    [addStudentRemark, selectedStudent],
  );

  const handleReject = useCallback(
    ({ subjectId, subjectName, remark }) => {
      if (!subjectId) return;
      setRejectConfirm({
        subjectName: subjectName || subjectId,
        onConfirm: async () => {
          const res = await rejectSubject({ subjectId, reason: remark });
          if (res?.error) toast.error(res.error);
          else toast.success('Subject rejected');
          setRejectConfirm(null);
        },
      });
    },
    [rejectSubject],
  );

  const handleApprove = useCallback(
    async ({ subjectId, remark }) => {
      if (!subjectId) return;
      const res = await approveSubject({ subjectId, comment: remark });
      if (res?.error) toast.error(res.error);
      else toast.success('Subject approved');
    },
    [approveSubject],
  );

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <div className="w-full md:w-80 shrink-0 flex flex-col space-y-3 h-full overflow-hidden border-r border-border/60">
        <div className="bg-card rounded-xl border border-border shadow-sm p-3">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter student list..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-medium"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={11} />
              </button>
            )}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-2 flex-1 overflow-y-auto space-y-0.5">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs italic">No matched profiles.</div>
          ) : (
            filteredStudents.map((s) => {
              const active = activeStudentId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStudentId(s.id)}
                  className={cn('w-full text-left p-2.5 rounded-lg text-xs transition-all border group flex items-center gap-3', active ? 'bg-foreground text-white border-foreground font-medium' : 'bg-card border-transparent text-muted-foreground hover:bg-muted/80 hover:text-foreground')}
                >
                  <div className={cn('w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black shrink-0', active ? 'bg-muted text-brand-primary' : 'bg-muted text-foreground')}>
                    {(s.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold truncate">{s.name || 'Anonymous Log'}</p>
                      <ChevronRight size={12} className={cn('shrink-0 transition-transform', active ? 'text-brand-primary translate-x-0.5' : 'text-muted-foreground group-hover:text-muted-foreground')} />
                    </div>
                    <p className={cn('text-[10px] truncate mt-0.5')}>{s.indexNumber || '—'} · {s.className}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 bg-card rounded-xl border border-border shadow-sm h-full flex flex-col overflow-hidden">
        <AnimatePresence>
          {selectedStudent ? (
            <motion.div
              key={selectedStudent.id}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.12 }}
              className="flex flex-col h-full overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border/60 bg-muted/40 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground/90 tracking-tight">{selectedStudent.name}</h3>
                    <span className="text-[10px] font-mono font-bold bg-card border border-border px-1.5 py-0.5 rounded text-muted-foreground">{selectedStudent.indexNumber || 'No Index'}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">Class Group: <span className="text-muted-foreground/80 font-semibold">{selectedStudent.className}</span></p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                  <StatusBadge status={selectedStudent.status || 'PENDING'} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Course Matrices Override Channels</h4>
                  {Array.isArray(selectedStudent.subjects) && selectedStudent.subjects.map((s, i) => (
                    <SubjectRow
                      key={s?.id || i}
                      subject={s}
                      studentName={selectedStudent.name}
                      onAddRemark={(payload) => handleAddRemark({ studentId: selectedStudent.id, ...payload })}
                      onApprove={(payload) => handleApprove(payload)}
                      onReject={(payload) => handleReject(payload)}
                    />
                  ))}
                </div>

                <div className="border-t border-border/60 pt-4">
                  <HODCommentInput
                    onSubmit={(remark) => handleAddRemark({ studentId: selectedStudent.id, remark })}
                    placeholder={`Compile institutional HOD remark for ${selectedStudent.name}...`}
                    maxLength={500}
                  />
                </div>

                <div className="border-t border-border/60 pt-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Grade Discussion</h4>
                  <GradeDiscussionThread
                    subjectId={selectedStudent.id}
                    studentId={selectedStudent.id}
                    sender="HOD"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="m-auto text-center py-12 max-w-xs">
              <GraduationCap size={32} className="text-muted-foreground/50 mx-auto mb-3" />
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Empty Ledger Pipeline</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-normal">No active student evaluation forms queued for review.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmationDialog
        open={!!rejectConfirm}
        title="Reject Grade Revision Request"
        message={`Confirm rejection declaration targeting ${rejectConfirm?.subjectName}?`}
        confirmLabel="Verify Record Rejection"
        variant="danger"
        onConfirm={() => rejectConfirm?.onConfirm?.()}
        onCancel={() => setRejectConfirm(null)}
      />
    </div>
  );
}
