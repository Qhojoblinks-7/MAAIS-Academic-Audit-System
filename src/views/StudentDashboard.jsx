import React from 'react';

export function StudentDashboard() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-3 font-display italic tracking-tight">Welcome, Angela!</h1>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">SHS 3 — General Agric — <span className="text-emerald-700">Top 10%</span></p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Current CGPA', value: '3.82' },
            { label: 'Class Rank', value: '#8' },
            { label: 'Attendance', value: '96%' },
            { label: 'Owed Fees', value: '₵0' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-6">Latest Terminal Results</h2>
            <div className="space-y-3">
              {[
                { subj: 'General Agric', grade: 'A1', score: 92 },
                { subj: 'English Language', grade: 'B2', score: 78 },
                { subj: 'Core Mathematics', grade: 'B3', score: 75 },
                { subj: 'Social Studies', grade: 'A1', score: 88 },
                { subj: 'Integrated Science', grade: 'B2', score: 82 },
              ].map((g, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-bold text-gray-900">{g.subj}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-emerald-700">{g.score}%</span>
                    <span className="w-10 h-8 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black flex items-center justify-center">{g.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-6">Upcoming Events</h2>
            <div className="space-y-4">
              {[
                { event: 'Term 2 End-of-Term Exams', date: 'Jun 15 — Jun 22', urgent: true },
                { event: 'Parent-Teacher Conference', date: 'Jul 03', urgent: false },
                { event: 'Career Guidance Session', date: 'Jul 10', urgent: false },
                { event: 'Mid-Term Assessment', date: 'May 30', urgent: true },
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={cn("w-2 h-2 rounded-full shrink-0", e.urgent ? "bg-rose-500" : "bg-emerald-500")} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{e.event}</p>
                    <p className="text-[10px] font-bold text-gray-400">{e.date}</p>
                  </div>
                </div>
              ))}
              {[...Array(2)].map((_, i) => (
                <div key={`skeleton-${i}`} className="flex items-center gap-4 opacity-0">
                  <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-50 w-2/3 rounded mb-2" />
                    <div className="h-2 bg-gray-50 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
