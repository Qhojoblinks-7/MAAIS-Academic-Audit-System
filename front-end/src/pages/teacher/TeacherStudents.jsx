import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, RefreshCw, X, Mail, BookOpen,
  UserCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { teacherService } from '../../services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '../../components/molecules';

function StudentCard({ student, onClick }) {
  if (!student) return null;

  const fullName = student.name || 'Unknown Student';
  const initials = fullName
    .split(' ')
    .map((n) => n?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const latestGrade = student.grades?.[0];
  const avgScore = latestGrade ? Math.round((latestGrade.totalScore || 0) * 10) / 10 : null;

  return (
    <Card
      onClick={onClick}
      className="bg-white hover:border-slate-300 border-slate-200/80 rounded-xl p-5 shadow-3xs group hover:shadow-2xs transition-all relative flex flex-col justify-between cursor-pointer"
    >
      <div className="absolute top-4 right-4">
        <span className={cn(
          "text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shadow-3xs border",
          student.isActive
            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
            : "bg-slate-100 border-slate-200 text-slate-500"
        )}>
          {student.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex flex-col items-center text-center pt-2 pb-5">
        <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold flex items-center justify-center text-base shadow-3xs group-hover:scale-105 transition-transform duration-200">
          {initials}
        </div>
        <h4 className="text-sm font-bold text-slate-900 mt-3.5 tracking-tight group-hover:text-indigo-600 transition-colors">{fullName}</h4>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {student.id?.slice(0, 8) || '—'}</p>

        <div className="mt-3.5 space-y-1.5 w-full">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 font-semibold uppercase tracking-wider text-[9px] rounded-md">
            <BookOpen size={10} />
            {student.className || 'Unassigned'}
          </span>
          {avgScore !== null && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-[9px] rounded-md ml-1">
              <UserCheck size={10} />
              Avg: {avgScore}%
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 mt-1">
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span className="font-mono">{student.indexNumber || '—'}</span>
          {student.department?.name && (
            <span className="truncate max-w-[60%]">{student.department.name}</span>
          )}
        </div>
      </div>
    </Card>
  );
}

function StudentDetailPanel({ student, onClose }) {
  if (!student) return null;

  const fullName = student.name || 'Unknown Student';

  return (
    <AnimatePresence>
      {student && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-white border-l border-slate-200/80 shadow-2xl overflow-y-auto z-50 flex flex-col"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Dossier</h3>
                  <p className="text-sm font-bold text-slate-900 tracking-tight mt-0.5">Profile Operational Index</p>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full border border-slate-200/60 text-slate-500 hover:text-slate-800"
                >
                  <X size={14} />
                </Button>
              </div>

              <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-3xs">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-2xl shadow-3xs">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="text-center mt-2">
                  <p className="text-base font-bold tracking-tight text-slate-900">{fullName}</p>
                  <p className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-md mt-1.5 inline-block">
                    Index: {student.indexNumber || '—'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { icon: Mail, title: 'Mail Record Address', value: student.email || 'No record mapped' },
                  { icon: BookOpen, title: 'Instructional Core Assignment', value: student.className || 'Not Configured' },
                  { icon: Users, title: 'Departmental Context', value: student.department?.name || 'Not Assigned' },
                ].map((field, idx) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-200/60 shadow-3xs">
                      <field.icon size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{field.title}</span>
                      <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5">{field.value}</span>
                    </div>
                  </div>
                ))}

                <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-200/60 shadow-3xs">
                    <UserCheck size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Permission Context</span>
                    <span className={cn("text-xs font-bold block mt-0.5", student.isActive ? 'text-emerald-700' : 'text-slate-500')}>
                      {student.isActive ? 'Active Core Permission' : 'Suspended Workspace Access'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function TeacherStudents() {
  const { user } = useRole();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStudents = async () => {
    try {
      const data = await teacherService.getStudents(searchQuery);
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[TeacherStudents] failed to load students:', error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStudents();
    } catch (error) {
      console.error('[TeacherStudents] refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const list = Array.isArray(students) ? students : [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((s) =>
      (s?.name || '').toLowerCase().includes(q) ||
      (s?.indexNumber || '').toLowerCase().includes(q) ||
      (s?.email || '').toLowerCase().includes(q) ||
      (s?.className || '').toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-y-auto scrollbar-hide bg-slate-50/40 font-sans antialiased pb-12">
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-white/95 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Student Directory</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Students enrolled in your assigned classes</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-3xs"
          >
            <RefreshCw size={12} className={cn("text-slate-400 mr-1.5", refreshing && 'animate-spin text-indigo-600')} />
            Synchronize Directory
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-5">
        <div className="bg-white rounded-xl p-3 flex items-center shadow-3xs border border-slate-200/80">
          <Search size={14} className="text-slate-400 ml-2 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search students by name, index number, or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isLoading && students.length === 0 ? (
          <div className="bg-white rounded-xl flex flex-col items-center justify-center p-20 border border-slate-200/80 shadow-3xs">
            <LoadingSpinner size="md" className="text-slate-800" />
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider mt-3">Re-indexing Local Matrix...</span>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onClick={() => setSelectedStudent(student)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/80 p-20 text-center shadow-3xs flex flex-col items-center justify-center">
            <div className="p-3 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl mb-3">
              <Users size={28} />
            </div>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">No Student Records Found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-medium">
              {searchQuery ? 'Try widening filter strings or clearing the search.' : 'No students are currently enrolled in your assigned classes.'}
            </p>
          </div>
        )}
      </main>

      <StudentDetailPanel
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}

export default TeacherStudents;
