import React, { useState } from 'react';
import { Plus, X, Check, BookOpen, Users } from 'lucide-react';
import { useAssignTeacher, useAllSubjects, useAllClasses, useAcademicYears } from '../../../lib/hooks';
import { toast } from '../../../components/ui/toast';

export function AssignmentsTab({ selectedDept }) {
  const assignTeacher = useAssignTeacher();
  const { data: subjects = [] } = useAllSubjects();
  const { data: classes = [] } = useAllClasses();
  const { data: academicYears = [] } = useAcademicYears();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ teacherId: '', subjectId: '', classSectionId: '', academicYearId: '' });

  const deptSubjects = subjects.filter((s) => s.departmentId === selectedDept?.id);
  const deptClasses = classes.filter((c) => c.program === selectedDept?.name || c.departmentId === selectedDept?.id);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!form.teacherId || !form.subjectId || !form.classSectionId || !form.academicYearId) return;
    try {
      await assignTeacher.mutateAsync(form);
      toast.success('Teacher assigned to class');
      setForm({ teacherId: '', subjectId: '', classSectionId: '', academicYearId: '' });
      setShowForm(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign teacher');
    }
  };

  if (!selectedDept) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
          Teacher Assignments — {selectedDept.name}
        </h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/10"
        >
          <Plus size={14} />
          New Assignment
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAssign} className="space-y-4 p-5 bg-muted/20 border border-border rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-foreground/60 mb-1.5">Teacher</label>
              <select
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                className="w-full px-3 py-2.5 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-surface"
                required
              >
                <option value="">Select Teacher</option>
                {selectedDept.teachers?.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-foreground/60 mb-1.5">Subject</label>
              <select
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                className="w-full px-3 py-2.5 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-surface"
                required
              >
                <option value="">Select Subject</option>
                {deptSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-foreground/60 mb-1.5">Class</label>
              <select
                value={form.classSectionId}
                onChange={(e) => setForm({ ...form, classSectionId: e.target.value })}
                className="w-full px-3 py-2.5 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-surface"
                required
              >
                <option value="">Select Class</option>
                {deptClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-foreground/60 mb-1.5">Academic Year</label>
              <select
                value={form.academicYearId}
                onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}
                className="w-full px-3 py-2.5 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-surface"
                required
              >
                <option value="">Select Year</option>
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>{y.label || y.id}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={assignTeacher.isPending}
              className="px-5 py-2.5 bg-brand-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-all disabled:opacity-50"
            >
              {assignTeacher.isPending ? 'Assigning…' : 'Assign Teacher'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 bg-muted/30 text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted/20 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedDept.teachers?.length === 0 && (
          <p className="text-xs text-foreground/40 italic col-span-full">No teachers in this department yet.</p>
        )}
        {selectedDept.teachers?.map((teacher) => (
          <div key={teacher.id} className="p-4 bg-surface border border-border rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-black text-sm">
                {(teacher.name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-black text-foreground">{teacher.name}</p>
                <p className="text-[10px] text-foreground/50 font-mono">{teacher.email}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-foreground/40 uppercase tracking-wider">Assignments</p>
              {teacher.teachingAssignments?.length > 0 ? (
                teacher.teachingAssignments.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-[11px] text-foreground/70">
                    <BookOpen size={10} className="text-brand-primary" />
                    <span className="font-semibold">{a.subject?.name}</span>
                    <span className="text-foreground/40">→</span>
                    <span>{a.classSection?.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-foreground/40 italic">No class assignments yet</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
