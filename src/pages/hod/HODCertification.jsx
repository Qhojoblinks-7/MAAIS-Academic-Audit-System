import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Download, RefreshCw, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { LoadingSpinner } from '../../components/molecules';

export function HODCertification() {
  const { 
    departmentProgress, 
    lockTerm, 
    unlockTerm, 
    exportClassCSV, 
    refreshDepartmentProgress,
    refreshLockedTerms 
  } = useHOD();

  const [lockingId, setLockingId] = React.useState(null);
  const [exportingId, setExportingId] = React.useState(null);
  const [confirmingLock, setConfirmingLock] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshDepartmentProgress(), refreshLockedTerms()]);
    setRefreshing(false);
  };

  const handleLock = async (termId) => {
    setLockingId(termId);
    try {
      await lockTerm(termId);
    } finally {
      setLockingId(null);
      setConfirmingLock(null);
    }
  };

  const handleExport = async (termId, classId) => {
    setExportingId(classId);
    try {
      await exportClassCSV(termId, classId);
    } finally {
      setExportingId(null);
    }
  };

  const canLock = (cls) => cls.progress === 100 && cls.status !== 'LOCKED';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HOD Certification</h1>
              <p className="text-sm text-gray-500 mt-1">Lock department matrix and export for WAEC</p>
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

          <div className="grid gap-4">
            {departmentProgress.length > 0 ? (
              departmentProgress.map((cls) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">{cls.className || cls.name}</h3>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full",
                          cls.status === 'LOCKED' 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-amber-50 text-amber-700"
                        )}>
                          {cls.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{cls.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div 
                            className={cn(
                              "h-1.5 rounded-full transition-all",
                              cls.progress === 100 ? "bg-emerald-500" : "bg-amber-500"
                            )}
                            style={{ width: `${cls.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {cls.status !== 'LOCKED' && (
                        <button
                          onClick={() => setConfirmingLock(cls.id)}
                          disabled={!canLock(cls) || lockingId === cls.id}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2",
                            canLock(cls)
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          )}
                        >
                          <Lock size={14} />
                          {lockingId === cls.id ? 'Locking...' : 'Lock Dept Matrix'}
                        </button>
                      )}
                      
                      {cls.status === 'LOCKED' && (
                        <button
                          onClick={() => handleExport(cls.termId, cls.id)}
                          disabled={exportingId === cls.id}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Download size={14} />
                          {exportingId === cls.id ? 'Exporting...' : 'Export WAEC CSV'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <ShieldCheck size={48} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No classes ready for certification</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmingLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60" onClick={() => setConfirmingLock(null)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Lock</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Locking the department matrix is irreversible. All teachers will be prevented from making further edits.
              Are you sure you want to proceed?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingLock(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLock(confirmingLock)}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
              >
                Confirm Lock
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}