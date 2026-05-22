import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Search, Calendar, ShieldCheck, ArrowRight,
  BarChart3, GraduationCap, RefreshCw, FileText, ChevronDown,
  ChevronUp, Filter, History, Users, TrendingUp, Award,
  ChevronLeft, ChevronRight, AlertCircle, Download, Eye,
  Lock, AlertOctagon, Stethoscope, Save
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';

const PAGE_SIZE = 8;

const statusColors = {
  CERTIFIED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  LOCKED: 'bg-blue-50 text-blue-700 border border-blue-100',
  ARCHIVED: 'bg-slate-100 text-slate-700 border border-slate-200',
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-100',
  IN_REVIEW: 'bg-purple-50 text-purple-700 border border-purple-100',
};

const recommendationBadge = {
  PROMOTE: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  CONDITIONAL: 'bg-amber-50 text-amber-700 border border-amber-100',
  RETAIN: 'bg-red-50 text-red-700 border border-red-100',
};

const recommendationIcon = {
  PROMOTE: <Award size={14} />,
  CONDITIONAL: <AlertCircle size={14} />,
  RETAIN: <TrendingUp size={14} />,
};

const subTabs = [
  { id: 'VAULT', label: 'Class Archive', icon: Database },
  { id: 'PROMOTION', label: 'Promotion Review', icon: GraduationCap },
  { id: 'MAINTENANCE', label: 'Audit Trail Search', icon: History },
];

const emptyStubYears = ['2023/2024', '2022/2023', '2021/2022', '2020/2021', '2019/2020'];

/* ──────────────────────────────────────────────────────────────────── */

export function HODArchiveView() {
  const {
    archivedClasses,
    promotionRecommendations,
    auditLogs,
    isLoading,
    isExporting,
    error,
    getFilteredArchive,
    refreshArchivedClasses,
    refreshPromotionRecommendations,
    refreshAuditLogs,
    refreshAll,
    exportArchivedDataCtx,
    // archive filters
    archiveFilter,
    setArchiveFilter,
    archiveYearFilter,
    setArchiveYearFilter,
    archiveSearchQuery,
    setArchiveSearchQuery,
    archivePage,
    setArchivePage,
  } = useHOD();

  const [activeSubTab, setActiveSubTab] = useState('VAULT');
  const [expandedRow, setExpandedRow] = useState(null);

  /* ── Mount: initial data load ──────────────────────────────────── */
  useEffect(() => {
    if (activeSubTab === 'VAULT') {
      refreshArchivedClasses();
    } else if (activeSubTab === 'PROMOTION') {
      refreshPromotionRecommendations();
    }
  }, [activeSubTab, refreshArchivedClasses, refreshPromotionRecommendations]);

  /* ── Context-driven totals (decoupled from stale local mocked stats) */
  const archiveStats = useMemo(() => {
    const classes = archivedClasses;
    const certified = classes.filter(c => (c.status || c.termStatus || '') === 'CERTIFIED' || (c.status || c.termStatus || '') === 'LOCKED').length;
    const locked   = archivedClasses.filter(c => (c.status || c.termStatus || '') === 'LOCKED').length;
    const rate     = classes.length > 0
      ? Math.round((certified / Math.max(classes.length, 1)) * 100)
      : 0;
    return { total: classes.length, certified, locked, rate };
  }, [archivedClasses]);

  /* ── Period-over-period comparison data (static historical snapshots
      used when API returns per-class pairs, otherwise derived from shelf) */
  const getComparisonData = useCallback((cls) => {
    if (cls.comparison) return cls.comparison;
    if (cls.history) return cls.history.map(h => ({
      academicYear: h.year || h.academicYear,
      avgScore: h.finalGrade || h.avgScore || 0,
      studentCount: h.studentCount ?? 0,
    }));
    return [];
  }, []);

  /* ── Available academic year list (span archive hit range) */
  const availableYears = useMemo(() => {
    const years = new Set(emptyStubYears);
    archivedClasses.forEach(c => {
      const y = c.year || c.academicYear;
      if (y) years.add(y);
    });
    return ['all', ...Array.from(years).sort().reverse()];
  }, [archivedClasses]);

  /* ── Paginated archive list ─────────────────────────────────────── */
  const filteredArchive = getFilteredArchive();
  const totalPages = Math.max(1, Math.ceil(filteredArchive.length / PAGE_SIZE));
  const safePage = Math.min(archivePage, totalPages);
  const paginated = useMemo(
    () => filteredArchive.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredArchive, safePage],
  );

  /* ── Guard: page > total after filter change */
  useEffect(() => {
    if (archivePage > totalPages) setArchivePage(1);
  }, [totalPages, archivePage, setArchivePage]);

  /* ── Promotion helpers ─────────────────────────────────────────── */
  const promoStats = useMemo(() => ({
    auto:   promotionRecommendations.filter(r => (r.basis || '').toUpperCase() === 'AUTO').length,
    manual: promotionRecommendations.filter(r => (r.basis || '').toUpperCase() === 'MANUAL').length,
    total:  promotionRecommendations.length,
  }), [promotionRecommendations]);

  /* ── RENDER ─────────────────────────────────────────────────────── */
  return (
    <div className="w-full min-h-screen bg-[#F0F4F2] relative flex flex-col overflow-y-auto font-sans pb-16">

      {/* ── Sticky top header ─────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 z-20 shrink-0 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-emerald-900 rounded-lg flex items-center justify-center text-white shadow-md">
            <Database size={16} />
          </div>
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
            Department Archives & Review
          </span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                setArchivePage(1);
                setExpandedRow(null);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 lg:px-6 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeSubTab === tab.id ? "bg-white text-emerald-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Watermark ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none z-0 overflow-hidden">
        <h1 className="text-[25vw] font-black rotate-[-25deg] text-emerald-950 uppercase">DEPARTMENT</h1>
      </div>

      <div className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════════════════════════════════
               TAB: VAULT  — Class Archive with pagination, search, filters
          ═══════════════════════════════════════════════════════════ */}
          {activeSubTab === 'VAULT' && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/*— Header with search & filters —*/}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-900 rounded-2xl flex items-center justify-center text-emerald-100 shadow-xl border border-emerald-800 rotate-3 shrink-0">
                    <Database size={28} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Department Vault</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded">
                        v4.2 Stable
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Last Sync: {archivedClasses.length > 0 ? 'Now' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center flex-1 md:flex-initial md:min-w-[470px]">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search class, student, teacher…"
                      value={archiveSearchQuery}
                      onChange={(e) => { setArchiveSearchQuery(e.target.value); setArchivePage(1); }}
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-800/20 shadow-sm"
                    />
                  </div>

                  {/* Year filter */}
                  <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-sm shrink-0">
                    <Calendar size={16} className="text-emerald-700" />
                    <select
                      value={archiveYearFilter}
                      onChange={(e) => { setArchiveYearFilter(e.target.value); setArchivePage(1); }}
                      className="bg-transparent text-xs font-black text-gray-900 focus:outline-none cursor-pointer pr-2"
                    >
                      {availableYears.map((y) => (
                        <option key={y} value={y}>{y === 'all' ? 'All Years' : y}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status filter */}
                  <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-sm shrink-0">
                    <Filter size={16} className="text-slate-500" />
                    <select
                      value={archiveFilter}
                      onChange={(e) => { setArchiveFilter(e.target.value); setArchivePage(1); }}
                      className="bg-transparent text-xs font-black text-gray-900 focus:outline-none cursor-pointer pr-2"
                    >
                      <option value="all">All Status</option>
                      <option value="LOCKED">Locked</option>
                      <option value="CERTIFIED">Certified</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/*— KPI Cards —*/}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Archived Classes',    value: archiveStats.total,           icon: Database,   color: 'bg-blue-50 text-blue-600' },
                  { label: 'Certified Batches',   value: archiveStats.certified,       icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Compliance Rate',     value: `${archiveStats.rate}%`,       icon: BarChart3,   color: 'bg-violet-50 text-violet-600' },
                  { label: 'Locked Terms',        value: archiveStats.locked,           icon: Lock,        color: 'bg-amber-50 text-amber-600' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm", stat.color)}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/*— Archive list —*/}
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                  <Calendar className="text-slate-700" size={16} />
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                    Archived Batches Found • {archiveYearFilter === 'all' ? 'All Years' : archiveYearFilter} ({filteredArchive.length})
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {paginated.map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className=""
                    >
                      {/* Row */}
                      <div
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/40 transition-all cursor-pointer"
                        onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center font-black text-emerald-800 text-sm shrink-0 border border-emerald-100/30">
                            {(c.className || c.class || c.subject || '?').split(' ')[1]?.charAt(0) ||
                             (c.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{c.name || c.subject || c.className || '—'}</p>
                            <p className="text-[10px] font-bold text-gray-400 truncate">
                              {(c.className || c.class || '—')} &middot; {(c.students ?? c.studentCount ?? 0)} students &middot;
                              {c.avgScore ? ` Avg Weight: ${c.avgScore}%` : c.score ? ` Score: ${c.score}` : ' Completed'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={cn(
                            "text-[9px] font-black px-2.5 py-1 rounded-md tracking-wider border",
                            statusColors[c.status || c.termStatus || ''] || "bg-gray-50 text-gray-600"
                          )}>
                            {c.status || c.termStatus || 'ARCHIVED'}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">{c.year || c.academicYear || '—'}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === c.id ? null : c.id); }}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-all text-gray-400 hover:text-emerald-800"
                          >
                            {expandedRow === c.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable: YoY comparison */}
                      <AnimatePresence>
                        {expandedRow === c.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 border-t border-gray-100 bg-slate-50/60">
                              <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mt-4 mb-3">
                                Year-over-Year Comparison
                              </h4>
                              {(() => {
                                const history = getComparisonData(c);
                                if (!history.length) {
                                  return (
                                    <p className="text-[11px] font-medium text-gray-400">
                                      No historical data available for this class.
                                    </p>
                                  );
                                }
                                const scores = history.map(h => h.avgScore ?? 0);
                                const maxScore = Math.max(...scores, 1);
                                return (
                                  <div className="space-y-3">
                                    {history.map((h, idx) => (
                                      <div key={idx} className="flex items-center gap-4">
                                        <span className="text-[10px] font-bold text-gray-500 w-24 shrink-0">
                                          {h.academicYear || h.year || '—'}
                                        </span>
                                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((h.avgScore ?? 0) / maxScore) * 100}%` }}
                                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                                            className={`h-full rounded-full ${
                                              idx === 0 ? 'bg-emerald-500' : 'bg-blue-400'
                                            }`}
                                          />
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-700 w-14 text-right">
                                          {h.avgScore ?? 0}%
                                        </span>
                                        {h.studentCount != null && (
                                          <span className="text-[10px] font-medium text-gray-400 w-20 text-right">
                                            {h.studentCount} students
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}

                  {/* Empty state */}
                  {!isLoading && paginated.length === 0 && (
                    <div className="p-12 text-center text-slate-400 text-sm font-medium uppercase tracking-tight">
                      No archived batches match the current filters.
                      <button onClick={refreshArchivedClasses} className="ml-2 underline text-slate-600">Retry</button>
                    </div>
                  )}
                </div>

                {/*— Pagination —*/}
                {totalPages > 1 && (
                  <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-400">
                      Page {safePage} of {totalPages} &middot; {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredArchive.length)} of {filteredArchive.length}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setArchivePage((p) => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          safePage === 1
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        )}
                      >
                        <ChevronLeft size={14} /> Prev
                      </button>
                      <button
                        onClick={() => setArchivePage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          safePage === totalPages
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        )}
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/*— Export Archived Data —*/}
                <div className="p-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => exportArchivedDataCtx({
                      year: archiveYearFilter === 'all' ? undefined : archiveYearFilter,
                      status: archiveFilter === 'all' ? undefined : archiveFilter,
                    })}
                    disabled={isExporting}
                    className="px-5 py-2.5 bg-emerald-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={14} />
                    {isExporting ? 'Exporting…' : 'Export Archived Data'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}


          {/* ═══════════════════════════════════════════════════════════
               TAB: PROMOTION  — Promotion Recommendations
          ═══════════════════════════════════════════════════════════ */}
          {activeSubTab === 'PROMOTION' && (
            <motion.div
              key="promotion"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Summary banner */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 lg:p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 hidden sm:block">
                  <GraduationCap size={150} className="text-emerald-950" />
                </div>
                <div className="relative">
                  <h2 className="text-3xl lg:text-4xl font-black italic text-slate-900 mb-4 tracking-tighter">
                    Department Promotion Review
                  </h2>
                  <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-2xl uppercase tracking-tight">
                    Review archived class performance to generate overall system recommendations for student promotion.
                  </p>
                </div>

                {/* Promo KPIs */}
                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Records',      value: promoStats.total,  color: 'bg-blue-50 text-blue-700' },
                    { label: 'Auto-Generated',     value: promoStats.auto,   color: 'bg-emerald-50 text-emerald-700' },
                    { label: 'Manual Override',    value: promoStats.manual, color: 'bg-amber-50 text-amber-700' },
                    { label: 'Pending Review',     value: promotionRecommendations.filter(r => !r.confirmed).length, color: 'bg-red-50 text-red-700' },
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className={cn("text-[9px] font-black uppercase tracking-widest mb-1", s.color)}>{s.label}</p>
                      <p className="text-2xl font-black text-gray-900">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-start">
                  <button
                    onClick={() => exportArchivedDataCtx({ type: 'promotions' })}
                    disabled={isExporting || promotionRecommendations.length === 0}
                    className="w-full sm:w-auto px-10 py-4 bg-emerald-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-emerald-950 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText size={18} className="text-amber-400" />
                    {isExporting ? 'Generating Report…' : 'Generate Department Report'}
                  </button>
                </div>
              </div>

              {/* Recommendations list */}
              {promotionRecommendations.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <GraduationCap className="text-slate-700" size={16} />
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                      Promotion Records ({promotionRecommendations.length})
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {promotionRecommendations.map((r, i) => {
                      const badge = recommendationBadge[r.recommendation] || recommendationBadge.RETAIN;
                      return (
                        <motion.div
                          key={r.id || i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-5 hover:bg-slate-50/40 transition-all flex items-start justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-600 text-sm">
                              {r.studentIndex || r.studentId?.toString().slice(-2) || '—'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{r.studentName || '—'}</p>
                              <p className="text-[10px] font-bold text-gray-400">
                                {r.currentClass || r.className || '—'} &middot; Avg: {r.avgScore ?? '—'}%
                              </p>
                              {r.notes && (
                                <p className="text-[10px] font-medium text-gray-500 mt-0.5 line-clamp-1">{r.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={cn(
                              "text-[9px] font-black px-2.5 py-1 rounded-md tracking-wider border flex items-center gap-1",
                              badge
                            )}>
                              {recommendationIcon[r.recommendation]}
                              {r.recommendation || 'RETAIN'}
                            </span>
                            <span className="text-[9px] font-bold text-gray-300 uppercase">{r.basis || 'AUTO'}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty */}
              {!isLoading && promotionRecommendations.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-sm font-medium">
                  No promotion recommendations available yet.{' '}
                  <button onClick={refreshPromotionRecommendations} className="underline text-slate-600">Retry</button>
                </div>
              )}
            </motion.div>
          )}


          {/* ═══════════════════════════════════════════════════════════
               TAB: MAINTENANCE  — Audit Trail Multi-Criteria Search
          ═══════════════════════════════════════════════════════════ */}
          {activeSubTab === 'MAINTENANCE' && (
            <MaintenanceTab
              auditLogs={auditLogs}
              isLoading={isLoading}
              refreshAuditLogs={refreshAuditLogs}
            />
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   MAINTENANCE TAB — internal sub-component
   Filters audit log by date (start/end), teacher name, action type,
   and status. Multifactor: any combination of criteria returns the
   intersection when used together.
───────────────────────────────────────────────────────────────────── */
function MaintenanceTab({ auditLogs, isLoading, refreshAuditLogs }) {
  const [dateStart, setDateStart]   = useState('');
  const [dateEnd, setDateEnd]       = useState('');
  const [teacherQuery, setTeacherQuery] = useState('');
  const [actionFilter, setActionFilter]   = useState('all');
  const [statusFilter, setStatusFilter]   = useState('all');

  const results = useMemo(() => {
    let list = Array.isArray(auditLogs) ? auditLogs : [];

    if (dateStart) {
      list = list.filter(l => (l.time || l.createdAt || '') >= dateStart);
    }
    if (dateEnd) {
      // Include the whole end day
      list = list.filter(l => (l.time || l.createdAt || '') <= `${dateEnd} 23:59:59`);
    }
    if (teacherQuery.trim()) {
      const q = teacherQuery.toLowerCase();
      list = list.filter(l => (l.user || '').toLowerCase().includes(q));
    }
    if (actionFilter !== 'all') {
      list = list.filter(l => (l.action || '').toUpperCase() === actionFilter.toUpperCase());
    }
    if (statusFilter !== 'all') {
      list = list.filter(l => (l.status || '').toUpperCase() === statusFilter.toUpperCase());
    }
    return list;
  }, [auditLogs, dateStart, dateEnd, teacherQuery, actionFilter, statusFilter]);

  const uniqueActions = useMemo(
    () => [...new Set((auditLogs || []).map(l => l.action).filter(Boolean))],
    [auditLogs],
  );

  const uniqueStatuses = useMemo(
    () => [...new Set((auditLogs || []).map(l => l.status).filter(Boolean))],
    [auditLogs],
  );

  return (
    <motion.div
      key="maintenance"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-10 shadow-sm">
        <h3 className="text-xl font-black italic text-slate-900 mb-6 flex items-center gap-3">
          <History size={20} className="text-emerald-700" />
          Audit Trail Search
        </h3>
        <p className="text-[11px] font-medium text-slate-500 mb-6 max-w-3xl">
          Multi-criteria search: begin and end dates, teacher name, action type, and log status.
          Results are re-evaluated whenever any field changes.
        </p>

        {/* Filter row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Start Date</label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">End Date</label>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Teacher Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Filter by name…"
                value={teacherQuery}
                onChange={(e) => setTeacherQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 cursor-pointer"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800/20 cursor-pointer"
            >
              <option value="all">All Status</option>
              {uniqueStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          <Eye size={12} />
          {results.length} matching record{results.length !== 1 ? 's' : ''}
        </div>

        {/* Results */}
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
          {results.slice(0, 50).map((log, i) => {
            const shortJ = (log.justification || '').trim().length < 10 && !!log.justification;
            return (
            <motion.div
              key={log.id || i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.6) }}
              className={cn(
                "p-4 flex gap-3 items-start hover:bg-slate-50/50 transition-all",
                shortJ && "bg-rose-50/30 border-l-2 border-l-rose-300",
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                (log.status === 'RESOLVED' || log.status === 'CERTIFIED') && "bg-emerald-50 text-emerald-600",
                (log.status === 'FLAGGED' || log.status === 'FLAG') && "bg-amber-50 text-amber-600",
                log.status === 'LOCKED' && "bg-blue-50 text-blue-600",
                log.status === 'DRAFT' && "bg-slate-100 text-slate-500",
                !['RESOLVED','FLAGGED','FLAG','LOCKED','DRAFT','CERTIFIED'].includes(log.status) && "bg-gray-50 text-gray-500"
              )}>
                <History size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">
                    {log.action || '—'} — <span className="text-slate-600 font-normal">{log.target || '—'}</span>
                  </p>
                  {shortJ && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[9px] font-black uppercase border border-rose-200">
                      <AlertOctagon size={9} /> HOD-AR-2.2 Short
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                  {log.user || '—'} &middot; {log.time || log.createdAt || '—'}
                </p>
                {log.oldValue != null && log.newValue != null && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded text-[10px] font-mono text-slate-600 border border-slate-200/50 mt-1.5">
                    <span>{log.oldValue}</span><span className="text-slate-400">→</span><span className="font-bold text-slate-800">{log.newValue}</span>
                  </div>
                )}
                {log.justification && (
                  <p className={cn(
                    "text-[10px] italic mt-1.5 pl-2 border-l-2 line-clamp-2",
                    shortJ ? "text-rose-500 border-rose-300 font-bold" : "text-slate-500 border-slate-200"
                  )}>
                    {log.justification}
                  </p>
                )}
              </div>
              {log.status && (
                <span className={cn(
                  "text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 tracking-wide",
                  log.status === 'RESOLVED' || log.status === 'CERTIFIED' ? "bg-emerald-50 text-emerald-700" :
                  log.status === 'FLAGGED' || log.status === 'FLAG'     ? "bg-amber-50 text-amber-700" :
                  log.status === 'LOCKED'                                ? "bg-blue-50 text-blue-700" :
                  "bg-slate-100 text-slate-600"
                )}>
                  {log.status}
                </span>
              )}
            </motion.div>
            );
          })}
        </div>

        {/* Empty / loading */}
        {isLoading && (
          <div className="p-8 text-center text-sm text-slate-400">Searching audit trail…</div>
        )}
        {!isLoading && results.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-400">
            No matching records found.{' '}
            <button onClick={refreshAuditLogs} className="underline text-slate-600">Reload</button>
          </div>
        )}

        {/* Export audit trail */}
        {results.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => exportArchivedDataCtx({ type: 'audit-trail', startDate: dateStart, endDate: dateEnd })}
              disabled={isExporting}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              {isExporting ? 'Exporting…' : 'Export Search Results'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
