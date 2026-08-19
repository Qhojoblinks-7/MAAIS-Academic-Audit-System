import React, { useState } from "react";
import { Plus, X, Check, BookOpen } from "lucide-react";
import { useAllSubjects, useUpdateSubject, useCreateSubject } from "../../../lib/hooks";
import { toast } from "sonner";

export function SubjectsTab({ selectedDept }) {
  const { data: subjects = [], isLoading: subjectsLoading } = useAllSubjects();
  const updateSubject = useUpdateSubject();
  const createSubject = useCreateSubject();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: "", code: "", type: "CORE", description: "" });

  const assigned = subjects.filter((s) => s.departmentId === selectedDept?.id);
  const unassigned = subjects.filter((s) => s.departmentId !== selectedDept?.id);

  const handleAssign = async (subjectId) => {
    try {
      await updateSubject.mutateAsync({ id: subjectId, dto: { departmentId: selectedDept.id } });
      toast.success("Subject assigned to department");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to assign subject");
    }
  };

  const handleUnassign = async (subjectId) => {
    try {
      await updateSubject.mutateAsync({ id: subjectId, dto: { departmentId: null } });
      toast.success("Subject unassigned");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to unassign subject");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSubject.name.trim() || !newSubject.code.trim() || !newSubject.type) return;
    try {
      const created = await createSubject.mutateAsync(newSubject);
      if (selectedDept?.id) {
        await updateSubject.mutateAsync({ id: created?.data?.id || created?.id, dto: { departmentId: selectedDept.id } });
      }
      setNewSubject({ name: "", code: "", type: "CORE", description: "" });
      setShowCreateForm(false);
      toast.success("Subject created and assigned");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create subject");
    }
  };

  if (subjectsLoading) return <p className="text-sm text-foreground/50 italic">Loading subjects...</p>;
  if (!selectedDept) return null;

  return (
    <div className="space-y-6">
      {/* Assigned Subjects */}
      <div>
        <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">
          Assigned to {selectedDept.name}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {assigned.length === 0 && (
            <p className="text-xs text-foreground/40 italic col-span-full">No subjects assigned yet.</p>
          )}
          {assigned.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center text-success">
                  <BookOpen size={14} />
                </div>
                <div>
                  <p className="text-xs font-black text-foreground">{subject.name}</p>
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">{subject.code}</p>
                </div>
              </div>
              <button
                onClick={() => handleUnassign(subject.id)}
                className="p-1.5 text-foreground/30 hover:text-destructive transition-all"
                title="Unassign"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Unassigned Subjects */}
      <div>
        <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">
          Available to Assign
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {unassigned.length === 0 && (
            <p className="text-xs text-foreground/40 italic col-span-full">All subjects are assigned.</p>
          )}
          {unassigned.map((subject) => (
            <div
              key={subject.id}
              className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted/50 rounded-lg flex items-center justify-center text-foreground/40">
                  <BookOpen size={14} />
                </div>
                <div>
                  <p className="text-xs font-black text-foreground">{subject.name}</p>
                  <p className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">{subject.code}</p>
                </div>
              </div>
              <button
                onClick={() => handleAssign(subject.id)}
                className="p-1.5 text-foreground/30 hover:text-success transition-all"
                title="Assign"
              >
                <Check size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Subject */}
      <div>
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/10"
          >
            <Plus size={14} />
            Create New Subject
          </button>
        ) : (
          <form onSubmit={handleCreate} className="space-y-3 p-4 bg-muted/20 border border-border rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1">Subject Name</label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-xs font-bold focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                  placeholder="e.g. Further Mathematics"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1">Code</label>
                <input
                  type="text"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-xs font-bold focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none"
                  placeholder="e.g. 403"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-foreground/60 mb-1">Type</label>
                <select
                  value={newSubject.type}
                  onChange={(e) => setNewSubject({ ...newSubject, type: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-xs font-bold focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-surface"
                >
                  <option value="CORE">CORE</option>
                  <option value="ELECTIVE">ELECTIVE</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createSubject.isPending || updateSubject.isPending}
                className="px-4 py-2 bg-brand-primary text-primary-foreground rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-all disabled:opacity-50"
              >
                {createSubject.isPending ? "Creating..." : "Create & Assign"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-muted/30 text-foreground rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-muted/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
