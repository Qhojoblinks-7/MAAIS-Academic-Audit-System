import React from 'react';
import { GraduationCap, Mail, Calendar, BookOpen, Home, CalendarDays, Briefcase, Phone, Award, CheckCircle, BarChart3, AlertTriangle } from 'lucide-react';
import { SimpleBar } from './SimpleBar';

export function StudentSidebar({ portalData, backendStudent, isArchived, characterTraits, activeInterventions }) {
  const classForm = backendStudent?.currentClass?.name || '—';
  const department = backendStudent?.department?.name || '—';
  const formatDOB = (dob) => { if (!dob) return '—'; try { return new Date(dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '—'; } };
  const formatDate = (dateStr) => { if (!dateStr) return '—'; try { return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '—'; } };
  const fullName = `${backendStudent?.firstName || ''} ${backendStudent?.middleName || ''} ${backendStudent?.lastName || ''}`.replace(/\s+/g, ' ').trim() || 'Unknown Student';

  const latestGPA = portalData?.academicHistory?.length > 0
    ? Number(portalData.academicHistory[portalData.academicHistory.length - 1]?.gpa || 0)
    : Number(portalData?.cgpa || 0);

  const overviewStats = [
    { label: 'CGPA', value: latestGPA.toFixed(2), icon: Award, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Attendance', value: `${portalData?.attendancePercentage ?? 0}%`, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'SBA Avg', value: `${portalData?.sbaScore ?? 0}%`, icon: BarChart3, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Exam Avg', value: `${portalData?.waecExamScore ?? 0}%`, icon: GraduationCap, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  return (
    <div className="lg:col-span-4 space-y-4">
      <div className="bg-white/60 border border-white/80 rounded-[24px] p-5 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[12px] bg-slate-100 border border-white flex items-center justify-center text-slate-400 shrink-0">
            <GraduationCap size={28} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-tight truncate">{fullName}</h2>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">Index: {backendStudent?.indexNumber || '—'}</p>
            <p className="text-[10px] text-gray-500">{classForm}</p>
            <p className="text-[10px] text-gray-500">{department}</p>
          </div>
        </div>

        {isArchived && (
          <div className="p-2.5 bg-amber-50/60 border border-amber-200/40 rounded-xl">
            <p className="text-[11px] text-amber-800 font-medium">Record archived. Grades are read-only.</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-gray-600">
            <Mail size={11} className="text-gray-400" />
            <span className="truncate">{backendStudent?.user?.email || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-600">
            <Calendar size={11} className="text-gray-400" />
            <span>DOB: {formatDOB(backendStudent?.dateOfBirth)}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-600">
            <BookOpen size={11} className="text-gray-400" />
            <span>Gender: {backendStudent?.gender || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-600">
            <CalendarDays size={11} className="text-gray-400" />
            <span>Admitted: {formatDate(portalData?.enrollmentDate || backendStudent?.admissionDate)}</span>
          </div>
          {portalData?.completionDate && (
            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              <GraduationCap size={11} className="text-gray-400" />
              <span>Completed: {formatDate(portalData.completionDate)}</span>
            </div>
          )}
          {portalData?.house && (
            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              <Home size={11} className="text-gray-400" />
              <span>House: {portalData.house}</span>
            </div>
          )}
        </div>
      </div>

      {(portalData?.parents?.length > 0) && (
        <div className="bg-white/60 border border-white/80 rounded-[24px] p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Parents / Guardians</h3>
          <div className="space-y-2">
            {portalData.parents.map((parent) => (
              <div key={parent.id} className="p-3 bg-white/80 border border-slate-100 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-black text-gray-800">
                    {parent.firstName} {parent.lastName}
                    {parent.isPrimary && <span className="ml-2 text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Primary</span>}
                  </p>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{parent.relationship}</span>
                </div>
                <div className="space-y-1 text-[10px] text-gray-600">
                  {parent.phone && (<div className="flex items-center gap-1.5"><Phone size={10} className="text-gray-400" /><span>{parent.phone}</span></div>)}
                  {parent.email && (<div className="flex items-center gap-1.5"><Mail size={10} className="text-gray-400" /><span className="truncate">{parent.email}</span></div>)}
                  {parent.occupation && (<div className="flex items-center gap-1.5"><Briefcase size={10} className="text-gray-400" /><span>{parent.occupation}</span></div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/60 border border-white/80 rounded-[24px] p-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Academic Overview</h3>
        <div className="grid grid-cols-2 gap-2">
          {overviewStats.map((stat) => (
            <div key={stat.label} className={`p-3 rounded-xl border ${stat.color}`}>
              <p className="text-[9px] font-black uppercase tracking-wider opacity-70">{stat.label}</p>
              <p className="text-sm font-black">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-gray-500">Year / Term</span>
            <span className="font-bold text-gray-800">{portalData?.yearForm || '—'} / {portalData?.semester || '—'}</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-gray-500">Class</span>
            <span className="font-bold text-gray-800">{classForm}</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-gray-500">Program</span>
            <span className="font-bold text-gray-800">{portalData?.programName || department || '—'}</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-gray-500">Learning Area</span>
            <span className="font-bold text-gray-800">{portalData?.learningArea || '—'}</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-gray-500">Approval</span>
            <span className={`font-black uppercase ${portalData?.approvalStatus === 'APPROVED' ? 'text-emerald-700' : 'text-amber-700'}`}>{portalData?.approvalStatus || 'PENDING'}</span>
          </div>
        </div>
      </div>

      {characterTraits && (
        <div className="bg-white/60 border border-white/80 rounded-[24px] p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Character & Behavior</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-gray-500">Overall Quality</span>
              <span className="font-black text-gray-800">{characterTraits.characterQualities?.toFixed(1) ?? 0}</span>
            </div>
            {['leadership', 'discipline', 'teamwork', 'ethics', 'communication', 'responsibility'].map((trait) => (
              <div key={trait} className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-medium text-gray-600 capitalize">{trait}</span>
                  <span className="font-mono font-bold text-gray-700">{characterTraits[trait] ?? 0}</span>
                </div>
                <SimpleBar value={characterTraits[trait] ?? 0} max={5} color="bg-brand-secondary" />
              </div>
            ))}
          </div>
          {portalData?.behaviorComments && (
            <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-[10px] text-gray-600 italic">"{portalData.behaviorComments}"</p>
            </div>
          )}
        </div>
      )}

      {activeInterventions.length > 0 && (
        <div className="bg-rose-50/60 border border-rose-200/40 rounded-[24px] p-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-rose-800 mb-3 flex items-center gap-1">
            <AlertTriangle size={11} /> Active Interventions ({activeInterventions.length})
          </h3>
          <div className="space-y-2">
            {activeInterventions.map((alert, idx) => (
              <div key={idx} className="p-2 bg-white/60 rounded-lg border border-rose-100">
                <p className="text-[10px] font-bold text-rose-900 uppercase">{alert.subject || 'General'}</p>
                <p className="text-[10px] text-rose-800">{alert.reason || alert.description || 'Intervention required'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}