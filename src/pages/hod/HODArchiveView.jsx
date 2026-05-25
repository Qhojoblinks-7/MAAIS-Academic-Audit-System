import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Filter, Download, RefreshCw, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';

const PAGE_SIZE = 8;

export function HODArchiveView() {
  const { 
    archivedClasses = [], 
    archiveYearFilter = 'all', 
    setArchiveYearFilter, 
    archiveFilter = 'all', 
    setArchiveFilter, 
    archiveSearchQuery = '', 
    setArchiveSearchQuery,
    archivePage = 1, 
    setArchivePage,
    getFilteredArchive,
    exportArchivedDataCtx,
    refreshArchivedClasses 
  } = useHOD();

  const [activeTab, setActiveTab] = useState('vault');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedClass, setExpandedClass] = useState(null);

  useEffect(() => {
    refreshArchivedClasses();
  }, [refreshArchivedClasses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshArchivedClasses();
    setRefreshing(false);
  };

  const filtered = typeof getFilteredArchive === 'function' ? getFilteredArchive() : [];
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedData = filtered.slice((archivePage - 1) * PAGE_SIZE, archivePage * PAGE_SIZE);

  const handleExport = async () => {
    if (typeof exportArchivedDataCtx === 'function') {
      await exportArchivedDataCtx({ year: archiveYearFilter !== 'all' ? archiveYearFilter : undefined });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Department Archive</h1>
              <p className="text-xs text-gray-500 mt-0.5">Historical records, audit parameters, and vault maintenance</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-xs transition-colors self-start sm:self-center"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Refresh Vault
            </button>
          </div>

          {/* Tab Navigation Menu */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/70 rounded-xl border border-gray-200/40 w-fit">
            {['vault', 'promotions', 'maintenance'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize",
                  activeTab === tab
                    ? "bg-white text-gray-950 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                {tab === 'vault' ? 'Department Vault' : tab}
              </button>
            ))}
          </div>

          {/* Primary View Router */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              
              {/* Query Manipulation Engine Controls */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Database size={15} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {filtered.length} total index items discovered
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={archiveYearFilter}
                      onChange={(e) => { setArchiveYearFilter(e.target.value); setArchivePage(1); }}
                      className="px-3 py-1.5 text-xs font-medium border border-gray-200 bg-white rounded-lg text-gray-700 outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="all">All Years</option>
                      <option value="2024/2025">2024/2025</option>
                      <option value="2025/2026">2025/2026</option>
                    </select>
                    <select
                      value={archiveFilter}
                      onChange={(e) => { setArchiveFilter(e.target.value); setArchivePage(1); }}
                      className="px-3 py-1.5 text-xs font-medium border border-gray-200 bg-white rounded-lg text-gray-700 outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="all">All Status</option>
                      <option value="LOCKED">Locked</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by class name, index target, or scope parameter..."
                    value={archiveSearchQuery}
                    onChange={(e) => { setArchiveSearchQuery(e.target.value); setArchivePage(1); }}
                    className="flex-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Data Record Layout Array */}
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((cls) => (
                      <motion.div
                        key={cls.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden"
                      >
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50/60 flex items-center justify-between transition-colors"
                          onClick={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)}
                        >
                          <div className="min-w-0">
                            <h3 className="text-xs font-bold text-gray-800 truncate">{cls.className || cls.name}</h3>
                            <p className="text-[10px] font-medium text-gray-400 mt-0.5">{cls.academicYear}</p>
                          </div>
                          <ChevronRight 
                            size={15} 
                            className={cn("text-gray-400 transition-transform duration-200", expandedClass === cls.id && "rotate-90 text-gray-800")}
                          />
                        </div>

                        {expandedClass === cls.id && (
                          <div className="px-4 pb-4 border-t border-gray-50 bg-gray-50/10 grid grid-cols-2 gap-4 pt-3.5">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Average Composite Score</p>
                              <p className="text-sm font-black text-gray-800 mt-0.5">{cls.averageScore || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Security / Commit State</p>
                              <div className="mt-1">
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                                  cls.status === 'LOCKED' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-gray-50 text-gray-600 border border-gray-200"
                                )}>
                                  {cls.status || 'UNASSIGNED'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-2xs">
                      <Database size={40} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">No archived records discovered</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Adjust database query filter constraints and retry.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Pagination Interface Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6 pt-2">
                  <button
                    onClick={() => setArchivePage(Math.max(1, archivePage - 1))}
                    disabled={archivePage === 1}
                    className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-white bg-gray-50/50 disabled:opacity-40 transition-opacity"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-gray-500">
                    Page {archivePage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setArchivePage(Math.min(totalPages, archivePage + 1))}
                    disabled={archivePage === totalPages}
                    className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-white bg-gray-50/50 disabled:opacity-40 transition-opacity"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Data Extraction Action Module */}
              <div className="pt-2">
                <button
                  onClick={handleExport}
                  disabled={filtered.length === 0}
                  className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Download size={14} />
                  Export Target Dataset
                </button>
              </div>
            </div>
          )}

          {activeTab === 'promotions' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-2xs">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Promotion Metrics Module Active</p>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-2xs">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vault Integrity Subsystems Idle</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}