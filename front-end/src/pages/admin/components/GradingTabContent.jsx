import React, { useState } from 'react';
import { TrendingUp, FileText, Check, Pencil, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useUpdateGradingRules } from '../../../lib/hooks';

// Per-department weighting overrides (in-memory for the session).
const deptWeightOverrides = {};

export function GradingTabContent({ dept, handleNodeOperation }) {
  if (!dept) return null;

  const [examWeight, setExamWeight] = useState(
    deptWeightOverrides[dept.id]?.examWeight ?? 70,
  );
  const [caWeight, setCaWeight] = useState(
    deptWeightOverrides[dept.id]?.caWeight ?? 30,
  );
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateGradingRules = useUpdateGradingRules();

  const isActive =
    dept.name === 'Science' ||
    dept.name === 'Mathematics' ||
    dept.name === 'Languages' ||
    dept.name === 'Business' ||
    dept.name === 'Agriculture';

  const electives = dept.electives || [];

  const handleExamChange = (val) => {
    const exam = Math.max(0, Math.min(100, Number(val) || 0));
    setExamWeight(exam);
    setCaWeight(100 - exam);
  };

  const handleCaChange = (val) => {
    const ca = Math.max(0, Math.min(100, Number(val) || 0));
    setCaWeight(ca);
    setExamWeight(100 - ca);
  };

  const handleSave = async () => {
    setSaving(true);
    deptWeightOverrides[dept.id] = { examWeight, caWeight };
    try {
      await updateGradingRules.mutateAsync({ examWeight, caWeight });
    } catch (e) {
      // Override is still stored locally for the session even if the
      // server call fails (e.g. role restrictions).
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const handleAuthorizeClick = (e) => {
    e.stopPropagation();
    if (handleNodeOperation) {
      handleNodeOperation('Authorize Template Update', dept.id, dept.name);
    }
  };

  return (
    <div className="space-y-4 px-1 sm:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 items-start">
        {/* LEFT: Weighting */}
        <div className="space-y-4">
          {/* Institutional Grading Template Banner */}
          <div className="bg-brand-primary p-4 rounded-xl text-primary-foreground relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <TrendingUp size={48} />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-[9px] font-black uppercase tracking-[0.15em] text-primary-foreground/40">
                  Institutional Grading Template
                </h5>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground text-[9px] font-bold uppercase tracking-wider transition-colors"
                  >
                    <Pencil size={11} />
                    Adjust
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-wider text-success mb-1">
                        Assessment Weight
                      </p>
                      <div className="flex items-center gap-1 bg-primary-foreground/10 rounded-lg px-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={examWeight}
                          onChange={(e) => handleExamChange(e.target.value)}
                          className="w-full bg-transparent text-lg font-black italic font-display text-primary-foreground outline-none py-1"
                        />
                        <span className="text-lg font-black italic font-display text-primary-foreground/70">%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-wider text-brand-primary mb-1">
                        SBA / Classwork
                      </p>
                      <div className="flex items-center gap-1 bg-primary-foreground/10 rounded-lg px-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={caWeight}
                          onChange={(e) => handleCaChange(e.target.value)}
                          className="w-full bg-transparent text-lg font-black italic font-display text-primary-foreground outline-none py-1"
                        />
                        <span className="text-lg font-black italic font-display text-primary-foreground/70">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-primary-foreground/15 overflow-hidden flex">
                    <div className="bg-success h-full transition-all" style={{ width: `${examWeight}%` }} />
                    <div className="bg-brand-primary/40 h-full transition-all" style={{ width: `${caWeight}%` }} />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 py-2 bg-success hover:bg-success/90 text-success-foreground rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
                    >
                      <Check size={13} />
                      {saving ? 'Saving…' : 'Save Weighting'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="py-2 px-3 bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center justify-center transition-all"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-wider text-success mb-0.5">
                      Assessment Weight
                    </p>
                    <p className="text-lg font-black italic font-display">{examWeight}%</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-wider text-brand-primary mb-0.5">
                      SBA / Classwork
                    </p>
                    <p className="text-lg font-black italic font-display">{caWeight}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Departmental Specialization Rules Section */}
          <div className="space-y-2">
            <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-wider pl-1">
              Departmental Specialization
            </h4>

            <div className="space-y-1.5">
              {[
                {
                  label: 'Core Assessment Weighting',
                  value: `${examWeight}%`,
                  active: isActive,
                },
                {
                  label: 'SBA / Classwork Weighting',
                  value: `${caWeight}%`,
                  active: isActive,
                },
              ].map((rule, i) => (
                <div
                  key={i}
                  className={cn(
                    'p-2.5 rounded-xl border transition-all flex items-center justify-between gap-4',
                    rule.active
                      ? 'bg-surface border-success/20 shadow-xs'
                      : 'bg-muted/30 border-border opacity-40',
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground tracking-tight truncate">
                      {rule.label}
                    </p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider font-mono mt-0.5">
                      SBA Sub-Weighting Protocol
                    </p>
                  </div>
                  <div
                    className={cn(
                      'px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 font-mono',
                      rule.active ? 'bg-success/10 text-success' : 'bg-muted/20 text-foreground/60',
                    )}
                  >
                    {rule.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Global Action Button */}
            <button
              onClick={handleAuthorizeClick}
              className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-primary-foreground rounded-xl text-[9px] font-bold uppercase tracking-wider shadow-sm active:scale-[0.99] transition-all mt-3 flex items-center justify-center gap-1.5"
            >
              <FileText size={14} />
              Authorize Template Update
            </button>
          </div>
        </div>

        {/* RIGHT: Departmental Electives & Assigned Teachers */}
        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col lg:max-h-[420px]">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
              Departmental Electives
            </h5>
            <span className="text-[9px] font-black font-mono text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
              {electives.length}
            </span>
          </div>

          {electives.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center py-6">
              <p className="text-[10px] font-medium text-muted-foreground/70 italic">
                No elective subjects registered for this department.
              </p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[360px] scrollbar-hide">
              {electives.map((sub) => (
                <div
                  key={sub.id}
                  className="p-2.5 rounded-xl border border-border bg-muted/20"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] sm:text-[13px] lg:text-[14px] font-bold text-foreground leading-tight truncate">
                      {sub.name}
                    </p>
                    {sub.code && (
                      <span className="text-[8px] font-black font-mono uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                        {sub.code}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5">
                    {sub.teachers.length === 0 ? (
                      <p className="text-[9px] font-medium text-muted-foreground/70 italic">
                        No teacher assigned
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {sub.teachers.map((t) => (
                          <span
                            key={t.id}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-md text-[9px] font-bold tracking-tight"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
