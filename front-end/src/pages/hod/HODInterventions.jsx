import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EmptyState } from '../../components/molecules';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  X,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  MessageSquare,
  Flame,
  Check,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useInterventionAlerts,
  useResolveAlert,
  useAddCounselingNote,
} from "@/lib/hooks/api/hod";

export function HODInterventions() {
  // 1. Single Source of Truth from Server Engine
  const {
    data: interventionAlerts = [],
    isLoading,
    error,
    refetch,
  } = useInterventionAlerts();

  // Mutation Hooks (Assumed implementation from your API layer)
  const { mutateAsync: resolveAlertApi } = useResolveAlert();
  const { mutateAsync: addNoteApi } = useAddCounselingNote();

  // UI Presentation State
  const [alertFilter, setAlertFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeClusterId, setActiveClusterId] = useState(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [mobileFocusActive, setMobileFocusActive] = useState(false);

  // 2. Pure Derived State: Clean, normalized data arrays computed on-the-fly
  const alerts = useMemo(() => {
    return interventionAlerts.map((alert) => ({
      ...alert,
      notes: Array.isArray(alert.notes)
        ? alert.notes
        : Array.isArray(alert.history)
          ? alert.history
          : [],
    }));
  }, [interventionAlerts]);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // 3. Operational Side Effects and Network Handlers
  const handleSyncEngine = useCallback(async () => {
    setIsSyncing(true);
    try {
      await refetch();
      showToast("Department safety-net logs synchronized successfully.");
    } catch (err) {
      showToast("Sync failure. Please check infrastructure logs.");
    } finally {
      setIsSyncing(false);
    }
  }, [refetch, showToast]);

  const handleResolveAlert = useCallback(
    async (alertId) => {
      try {
        // Resolve on server first
        await resolveAlertApi(alertId);
        await refetch();
        showToast("Case file resolved and logs archived.");
      } catch (err) {
        showToast("Authorization pipeline failed.");
      }
    },
    [resolveAlertApi, refetch, showToast],
  );

  const handleAddCounselingNote = useCallback(
    async (alertId) => {
      if (!newNoteText.trim()) return;
      try {
        // Post directive to server first
        await addNoteApi({ alertId, text: newNoteText.trim() });
        setNewNoteText("");
        await refetch();
        showToast("Counseling note appended.");
      } catch (err) {
        showToast("Failed to append directive note.");
      }
    },
    [newNoteText, addNoteApi, refetch, showToast],
  );

  // 4. Client Filtering and Analytical Calculations
  const tabs = useMemo(
    () => [
      {
        id: "all",
        label: "Active",
        count: alerts.filter((a) => !a.resolved).length,
      },
      {
        id: "HIGH",
        label: "Critical",
        count: alerts.filter((a) => a.severity === "HIGH" && !a.resolved)
          .length,
      },
      {
        id: "MEDIUM",
        label: "Medium",
        count: alerts.filter((a) => a.severity === "MEDIUM" && !a.resolved)
          .length,
      },
      {
        id: "resolved",
        label: "Resolved",
        count: alerts.filter((a) => a.resolved).length,
      },
    ],
    [alerts],
  );

  const filteredAlerts = useMemo(() => {
    const searchTarget = search.trim().toLowerCase();
    return alerts.filter((a) => {
      if (alertFilter === "resolved") {
        if (!a.resolved) return false;
      } else if (alertFilter !== "all") {
        if (a.resolved || a.severity !== alertFilter) return false;
      } else {
        if (a.resolved) return false;
      }

      if (!searchTarget) return true;
      return (
        (a.studentName || "").toLowerCase().includes(searchTarget) ||
        (a.subject || "").toLowerCase().includes(searchTarget) ||
        (a.description || "").toLowerCase().includes(searchTarget)
      );
    });
  }, [alerts, search, alertFilter]);

  // Keep focus on active items safely
  useEffect(() => {
    if (filteredAlerts.length > 0) {
      const hasMatch = filteredAlerts.some((a) => a.id === activeClusterId);
      if (!hasMatch && !mobileFocusActive) {
        setActiveClusterId(filteredAlerts[0].id);
      }
    } else {
      setActiveClusterId(null);
    }
  }, [filteredAlerts, activeClusterId, mobileFocusActive]);

  const selectedAlert = useMemo(() => {
    return alerts.find((a) => a.id === activeClusterId) || null;
  }, [alerts, activeClusterId]);

  const resolutionProgress = useMemo(() => {
    if (!alerts.length) return 0;
    return Math.round(
      (alerts.filter((a) => a.resolved).length / alerts.length) * 100,
    );
  }, [alerts]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#f8fafc]">
        <RefreshCw size={20} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center max-w-sm px-4">
          <AlertTriangle size={32} className="text-rose-500 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-900">
            Failed to load interventions
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {error?.message || "Unknown error"}
          </p>
          <button
            onClick={handleSyncEngine}
            className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans antialiased overflow-hidden">
      {/* Top Header */}
      <header className="h-[72px] shrink-0 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {mobileFocusActive && (
            <button
              onClick={() => setMobileFocusActive(false)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg transition-colors"
              aria-label="Back to dossier list"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Flame
                className="text-indigo-600 shrink-0"
                size={18}
                fill="currentColor"
              />
              <span>Academic Interventions</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Track, manage, and authorize student performance reviews
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Resolution Progress
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/40">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${resolutionProgress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-600">
                {resolutionProgress}%
              </span>
            </div>
          </div>

          <button
            onClick={handleSyncEngine}
            disabled={isSyncing}
            className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-50"
            title="Synchronize Database"
          >
            <RefreshCw
              size={15}
              className={cn(isSyncing && "animate-spin text-indigo-600")}
            />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex h-[calc(100vh-72px)] w-full overflow-hidden relative">
        {/* Left Side Navigation & Feed Panel */}
        <div
          className={cn(
            "w-full md:w-[340px] shrink-0 border-r border-slate-200/70 bg-white flex flex-col h-full overflow-hidden",
            mobileFocusActive ? "hidden md:flex" : "flex",
          )}
        >
          {/* Internal Filters Control Deck */}
          <div className="p-4 border-b border-slate-100 flex flex-col gap-3 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dossiers..."
                className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder-slate-400 font-medium transition-all"
              />
              {search ? (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              ) : (
                <AlertTriangle
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                />
              )}
            </div>

            {/* Sub-tabs Segments */}
            <div className="grid grid-cols-4 bg-slate-100 p-0.5 rounded-lg border border-slate-200/20">
              {tabs.map((tab) => {
                const active = alertFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setAlertFilter(tab.id);
                      setMobileFocusActive(false);
                    }}
                    className={cn(
                      "py-1.5 text-[11px] font-semibold rounded-md transition-all text-center relative flex items-center justify-center gap-1",
                      active
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-900",
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        "text-[9px] px-1 rounded-sm font-bold",
                        active
                          ? "bg-slate-100 text-slate-700"
                          : "bg-slate-200/50 text-slate-500",
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrolling Dossier Feed List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/50">
            {filteredAlerts.length === 0 ? (
              <div className="py-12 text-center">
                <EmptyState context="grades" variant="compact" />
              </div>
            ) : (
              filteredAlerts.map((alt) => {
                const active = activeClusterId === alt.id;
                return (
                  <button
                    key={alt.id}
                    onClick={() => {
                      setActiveClusterId(alt.id);
                      setMobileFocusActive(true);
                    }}
                    aria-selected={active}
                    role="tab"
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1.5 relative group",
                      active
                        ? "bg-white border-slate-200/80 shadow-xs ring-1 ring-slate-900/5"
                        : "bg-transparent border-transparent hover:bg-slate-100/70",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div className="truncate flex-1">
                        <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {alt.studentName}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                          {alt.subject}
                        </p>
                      </div>
                      <ChevronRight
                        size={13}
                        className={cn(
                          "shrink-0 mt-0.5 text-slate-300 transition-transform group-hover:text-slate-500",
                          active && "text-indigo-500 translate-x-0.5",
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide",
                          alt.severity === "HIGH"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600",
                        )}
                      >
                        {alt.severity === "HIGH" ? "Critical" : "Medium"}
                      </span>
                      {alt.resolved && (
                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                          Archived
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Console Pane */}
        <div
          className={cn(
            "flex-1 bg-white flex flex-col h-full overflow-hidden",
            !mobileFocusActive ? "hidden md:flex" : "flex",
          )}
        >
          <AnimatePresence mode="wait">
            {selectedAlert ? (
              <motion.div
                key={selectedAlert.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col h-full overflow-hidden"
              >
                {/* Active Sub-Header Bar */}
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-slate-900">
                        {selectedAlert.studentName}
                      </h3>
                      <span
                        className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider",
                          selectedAlert.severity === "HIGH"
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100",
                        )}
                      >
                        {selectedAlert.severity === "HIGH"
                          ? "Action Mandatory"
                          : "Standard Priority"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Course Variant:{" "}
                      <span className="text-slate-700 font-semibold">
                        {selectedAlert.subject}
                      </span>
                    </p>
                  </div>

                  <span className="text-[10px] font-bold bg-white text-slate-500 border border-slate-200 rounded-md px-2 py-1 flex items-center gap-1.5 shadow-2xs self-start sm:self-auto">
                    <ShieldCheck size={12} className="text-indigo-500" />
                    FILE: {selectedAlert.id.toUpperCase()}
                  </span>
                </div>

                {/* Primary Content Viewport */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Diagnosis Presentation Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={13} className="text-amber-500" />
                      Anomalous Variance Summary
                    </h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {selectedAlert.description}
                    </p>
                  </div>

                  {/* Operational Notes/Journal Timeline Segment */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <MessageSquare size={13} className="text-slate-400" />
                      Counseling Records & Auditing Ledger (
                      {selectedAlert.notes?.length || 0})
                    </h4>

                    {(selectedAlert.notes?.length || 0) === 0 ? (
                      <p className="text-xs text-slate-400 font-medium italic py-2">
                        No historical directives updated into the case file.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedAlert.notes.map((note) => (
                          <div
                            key={note.id}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1 text-xs"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-bold text-slate-800">
                                {note.author}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {note.date}
                              </span>
                            </div>
                            <p className="text-slate-600 font-medium leading-relaxed mt-0.5">
                              {note.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Note Entry Drawer Block */}
                  {!selectedAlert.resolved && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Append Directive Note
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder="Type directive action guidelines..."
                          className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium transition-all"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCounselingNote(selectedAlert.id);
                            }
                          }}
                        />
                        <button
                          onClick={() =>
                            handleAddCounselingNote(selectedAlert.id)
                          }
                          className="px-3 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Plus size={13} />
                          <span>Append</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Operations Footer Strip Controls */}
                <div className="px-6 h-16 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between shrink-0">
                  <div>
                    {selectedAlert.resolved ? (
                      <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md inline-flex items-center gap-1.5 uppercase tracking-wide">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        Dossier Finalized
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1 inline-flex items-center gap-1.5 uppercase tracking-wide">
                        <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                        Pending Authorization
                      </span>
                    )}
                  </div>

                  {!selectedAlert.resolved && (
                    <button
                      onClick={() => handleResolveAlert(selectedAlert.id)}
                      className="px-4 h-9 bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all rounded-lg shadow-xs flex items-center gap-1.5"
                    >
                      <Check size={13} strokeWidth={3} />
                      <span>Authorize Clearance</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="m-auto text-center max-w-xs px-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100/50">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">
                  Operational Margin Secure
                </h4>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                  All automated triggers reside inside compliant departmental
                  tolerances.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Action Notification Toast Component wrapper */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="fixed bottom-4 right-4 bg-slate-900 text-white px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 z-50 border border-slate-800 shadow-lg max-w-sm"
          >
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
