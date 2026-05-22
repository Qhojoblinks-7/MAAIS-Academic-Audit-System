import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Filter, Download, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { LoadingSpinner } from '../../components/molecules';

const PAGE_SIZE = 8;

export function HODArchiveView() {
  const { 
    archivedClasses, 
    archiveYearFilter, 
    setArchiveYearFilter, 
    archiveFilter, 
    setArchiveFilter, 
    archiveSearchQuery, 
    setArchiveSearchQuery,
    archivePage, 
    setArchivePage,
    getFilteredArchive,
    exportArchivedDataCtx,
    refreshArchivedClasses 
  } = useHOD();

  const [activeTab, setActiveTab] = useState('vault');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedClass, setExpandedClass] = useState(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshArchivedClasses();
    setRefreshing(false);
  };

  const filtered = getFilteredArchive();
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedData = filtered.slice((archivePage - 1) * PAGE_SIZE, archivePage * PAGE_SIZE);

  const handleExport = async () => {
    await exportArchivedDataCtx({ year: archiveYearFilter !== 'all' ? archiveYearFilter : undefined });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Department Archive</h1>
              <p className="text-sm text-gray-500 mt-1">Historical records and vault maintenance</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {['vault', 'promotions', 'maintenance'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-xl transition-all",
                  activeTab === tab
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                )}
              >
                {tab === 'vault' ? 'Department Vault' : tab === 'promotions' ? 'Promotions' : 'Maintenance'}
              </button>
            ))}
          </div>

          {activeTab === 'vault' && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Database size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{filtered.length} records</span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <select
                    value={archiveYearFilter}
                    onChange={(e) => { setArchiveYearFilter(e.target.value); setArchivePage(1); }}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
                  >
                    <option value="all">All Years</option>
                    <option value="2024/2025">2024/2025</option>
                    <option value="2025/2026">2025/2026</option>
                  </select>
                  <select
                    value={archiveFilter}
                    onChange={(e) => { setArchiveFilter(e.target.value); setArchivePage(1); }}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
                  >
                    <option value="all">All Status</option>
                    <option value="LOCKED">Locked</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={archiveSearchQuery}
                    onChange={(e) => { setArchiveSearchQuery(e.target.value); setArchivePage(1); }}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {paginatedData.length > 0 ? (
                  paginatedData.map((cls) => (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    >
                      <div 
                        className="p-5 cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{cls.className || cls.name}</h3>
                            <p className="text-xs text-gray-500">{cls.academicYear}</p>
                          </div>
                          <ChevronRight 
                            size={16} 
                            className={cn("transition-transform", expandedClass === cls.id && "rotate-90")}
                          />
                        </div>
                      </div>

                      {expandedClass === cls.id && (
                        <div className="px-5 pb-5 border-t border-gray-100">
                          <div className="pt-4 space-y-3">
                            <div>
                              <p className="text-xs text-gray-500">Average Score</p>
                              <p className="text-sm font-medium">{cls.averageScore || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Status</p>
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                cls.status === 'LOCKED' ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-700"
                              )}>
                                {cls.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Database size={48} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No archived records found</p>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setArchivePage(Math.max(1, archivePage - 1))}
                    disabled={archivePage === 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {archivePage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setArchivePage(Math.min(totalPages, archivePage + 1))}
                    disabled={archivePage === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Download size={14} />
                  Export Archive Data
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}