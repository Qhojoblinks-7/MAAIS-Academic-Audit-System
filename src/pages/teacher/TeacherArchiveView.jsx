import React, { useState, useEffect } from 'react';
import { 
   Search, 
   Calendar, 
   ArrowRight, 
   BookOpen, 
   Lock, 
   Layers, 
   Sparkles,
   UserCheck
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import MOCK from '../../data/teacherMockData.json';

const SKELETON_ARCHIVED_RECORDS = MOCK?.skeletonArchivedRecords?.items || [];

export function TeacherArchiveView() {
  const { user } = useRole();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [archivedRecords, setArchivedRecords] = useState(SKELETON_ARCHIVED_RECORDS);
  const [archiveLoading, setArchiveLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedYear, setSelectedYear] = useState('2023/2024');

  // Keep searchQuery in sync with URL search params
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchArchive = async () => {
      if (!user?.id) {
        setArchiveLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/archive/teacher?teacher_id=${encodeURIComponent(user.id)}${searchParams ? `&search=${encodeURIComponent(searchParams.get('search')||'')}` : ''}`);
        if (!response.ok) throw new Error('Failed to fetch archive');
        const data = await response.json();
        const parsedRecords = data.records || (Array.isArray(data) ? data : null);
        setArchivedRecords(parsedRecords || SKELETON_ARCHIVED_RECORDS);
      } catch (err) {
        console.error('Failed to load live data:', err);
        setArchivedRecords(SKELETON_ARCHIVED_RECORDS);
      } finally {
        setArchiveLoading(false);
      }
    };
    fetchArchive();
  }, [user?.id, searchParams, searchQuery]);

  const filtered = archivedRecords.filter(r => {
    const matchesSearch = 
      r.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.class?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = r.academicYear === selectedYear || !r.academicYear;
    return matchesSearch && matchesYear;
  });

  const availableYears = [...new Set([
    '2023/2024',
    '2022/2023',
    '2021/2022',
    ...archivedRecords.map(r => r.academicYear).filter(Boolean)
  ])];

  const yearRecords = archivedRecords.filter(r => r.academicYear === selectedYear || !r.academicYear);
  const activeClassCount = yearRecords.length;
  const activeStudentCount = yearRecords.reduce((sum, r) => sum + (r.students || 0), 0);

  if (archiveLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 p-4">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium text-slate-400">Opening secure archive vault...</p>
      </div>
    );
  }

return (
      <div className="min-h-screen w-full bg-slate-50/60 font-sans text-slate-800 antialiased flex flex-col">
      
      {/* 1. Header Section */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Academic Vault</h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
              Review history, historic student counts, and archived curriculum models.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/60 px-3 py-2 rounded-xl transition-colors border border-slate-200/20 shrink-0">
            <Calendar size={13} className="text-slate-500" />
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)} 
              className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer pr-1 border-none"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

       {/* 2. Main Content Canvas */}
       <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 pb-20">
        
        {/* Overview Row: Combines contextual message banner with core counters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white flex flex-col justify-between relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-white transition-transform group-hover:scale-110 duration-300">
              <Sparkles size={60} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Term Overview</span>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                These classes are compiled in a locked state. Reviewing records does not affect current grading structures or dynamic analytics.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100/40">
              <Layers size={16} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Classes Handled</span>
              <span className="text-xl font-bold text-slate-900 block mt-0.5">{activeClassCount}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100/40">
              <UserCheck size={16} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Students Evaluated</span>
              <span className="text-xl font-bold text-slate-900 block mt-0.5">{activeStudentCount}</span>
            </div>
          </div>
        </div>

        {/* 3. Search and Action Control Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-slate-200/40">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider self-end sm:self-center">
            Term Logs ({filtered.length})
          </div>
        </div>

        {/* 4. Filtered Records Output Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length > 0 ? (
            filtered.map((r, i) => (
              <div
                key={r.id || i}
                onClick={() => navigate(`/archive/teacher/${r.id}`)}
                className="bg-white border border-slate-200/70 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-400/80 cursor-pointer shadow-sm group transition-all relative overflow-hidden min-h-[140px]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                      <BookOpen size={14} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-950 truncate">
                        {r.subject}
                      </h3>
                      <p className="text-xs font-medium text-slate-400 mt-0.5 truncate">{r.class}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-200/40 transition-colors shrink-0">
                    <Lock size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Read Only</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-slate-500">{r.students || 0} students graded</span>
                  <div className="flex items-center gap-1 font-semibold text-slate-400 group-hover:text-slate-900 transition-colors">
                    <span className="text-[11px]">Explore</span>
                    <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <p className="text-xs font-medium text-slate-400">
                No archival listings match your specific active tracking criteria.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}