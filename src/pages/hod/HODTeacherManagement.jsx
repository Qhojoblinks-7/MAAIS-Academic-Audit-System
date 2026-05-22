import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, RefreshCw, Eye, Key, ChevronDown, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { LoadingSpinner } from '../../components/molecules';

export function HODTeacherManagement() {
  const { 
    departmentTeachers, 
    refreshDepartmentTeachers,
    resetTeacherPasswordAction,
    impersonateTeacherAction,
    viewAsTeacherId,
    stopImpersonationAction,
    isLoading 
  } = useHOD();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [impersonatingTeacher, setImpersonatingTeacher] = useState(null);
  const [impersonateReason, setImpersonateReason] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshDepartmentTeachers();
    setRefreshing(false);
  };

  const filteredTeachers = departmentTeachers.filter(t =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generatePassword = () => {
    return Math.random().toString(36).slice(2, 10).replace(/[^a-zA-Z0-9]/g, '');
  };

  const handlePasswordReset = async (teacherId) => {
    const newPassword = generatePassword();
    await resetTeacherPasswordAction(teacherId, newPassword);
    setGeneratedPassword({ teacherId, password: newPassword });
    setTimeout(() => setGeneratedPassword(null), 10000);
  };

  const handleImpersonate = async (teacherId, reason) => {
    await impersonateTeacherAction(teacherId, { reason, timestamp: new Date().toISOString() });
    setImpersonatingTeacher(null);
    setImpersonateReason('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage department teachers and access</p>
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

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {viewAsTeacherId && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Currently viewing as teacher mode
                </span>
              </div>
              <button
                onClick={stopImpersonationAction}
                className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700"
              >
                Stop Viewing
              </button>
            </div>
          )}

          <div className="space-y-3">
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 font-bold">
                          {teacher.name?.[0] || '?'}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{teacher.name}</h3>
                          <p className="text-xs text-gray-500">{teacher.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedTeacher(expandedTeacher === teacher.id ? null : teacher.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <ChevronDown size={16} className={expandedTeacher === teacher.id ? 'rotate-180' : ''} />
                        </button>
                      </div>
                    </div>

                    {expandedTeacher === teacher.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-gray-500">Subjects</p>
                            <p className="font-medium">{teacher.subjects?.join(', ') || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Classes</p>
                            <p className="font-medium">{teacher.classes?.length || 0} classes</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => handlePasswordReset(teacher.id)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 flex items-center gap-1"
                          >
                            <Key size={12} />
                            Reset Password
                          </button>
                          <button
                            onClick={() => setImpersonatingTeacher(teacher)}
                            className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg hover:bg-purple-200 flex items-center gap-1"
                          >
                            <Eye size={12} />
                            View As
                          </button>
                        </div>
                      </div>
                    )}

                    {generatedPassword?.teacherId === teacher.id && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-xs text-emerald-900 mb-1">Temporary Password:</p>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono font-bold text-emerald-700 bg-white px-2 py-1 rounded">
                            {generatedPassword.password}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(generatedPassword.password)}
                            className="text-xs text-emerald-700 hover:underline"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <Users size={48} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No teachers found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {impersonatingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60" onClick={() => setImpersonatingTeacher(null)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <Eye size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">View As Teacher</h3>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-purple-900">
                You are about to view the system as {impersonatingTeacher.name}. 
                All actions will be logged for audit purposes.
              </p>
            </div>

            <textarea
              placeholder="Reason for viewing (required)"
              value={impersonateReason}
              onChange={(e) => setImpersonateReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setImpersonatingTeacher(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleImpersonate(impersonatingTeacher.id, impersonateReason)}
                disabled={!impersonateReason.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                Start Viewing
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}