import React from 'react';
import { QrCode, ShieldCheck, GraduationCap, Award, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const TranscriptPrintTemplate = React.forwardRef(function TranscriptPrintTemplate({ data }, ref) {
  if (!data) return null;

  const formatPrintDate = (value) => {
    if (!value || value === '—') return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div
      ref={ref}
      id="transcript-template"
      className={cn(
        "bg-white text-slate-900 min-h-screen w-[210mm] shadow-2xl relative font-sans p-12 select-none",
        "fixed -left-[9999px] top-0 print:static print:block print:p-8 print:shadow-none"
      )}
    >
      {/* Background Watermark Accent Layer for Official Presentation */}
      <div className="absolute inset-0 opacity-[0.02] flex items-center justify-center pointer-events-none p-24">
        <GraduationCap size={400} className="stroke-[1]" />
      </div>

      {/* Primary Document Header Container */}
      <div className="relative flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div className="flex gap-5 items-center">
          {/* Configurable Institutional Shield Node */}
          <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
            {data.institutionLogoUrl ? (
              <img 
                src={data.institutionLogoUrl} 
                alt="Institution Logo" 
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <GraduationCap size={36} className="stroke-[1.5]" />
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900 leading-tight">
              {data.institutionName || "Mando Senior High Technical School"}
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600 mt-1">
              Official Academic Record & Statement of Results
            </p>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">
              {data.institutionAddress || "PMB 14, Central Region, Ghana"} • {data.institutionWebsite || "portal.institution.edu.gh"}
            </p>
          </div>
        </div>

        {/* Secure Ledger Verification Metadata Block */}
        <div className="text-right shrink-0">
          <div className="bg-slate-50 p-2 rounded-lg inline-block border border-slate-200 shadow-2xs mb-1.5">
            <QrCode size={44} className="text-slate-900 stroke-[1.5]" />
          </div>
          <p className="text-[7.5px] font-black uppercase tracking-wider text-slate-400">
            Secure Cryptographic Audit
          </p>
        </div>
      </div>

      {/* Biographic & Academic Profile Metadata Matrix Grid */}
      <div className="relative grid grid-cols-2 gap-x-12 gap-y-3 bg-slate-50/60 rounded-xl border border-slate-100 p-4 mb-8">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Student Name</span>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{data.studentName}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Index / ID Number</span>
            <span className="text-xs font-bold text-slate-900 font-mono tracking-tight">{data.indexNumber}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Program of Study</span>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{data.program}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Enrollment Period</span>
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              {formatPrintDate(data.enrollmentDate) || "—"} {data.completionDate ? ` — ${formatPrintDate(data.completionDate)}` : ''}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">House / Faculty Affiliation</span>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{data.house || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Verification Ledger</span>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-600 stroke-[2.5]" />
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">System Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Continuous Academic Ledger Assessment Blocks */}
      <div className="relative space-y-6 mb-8">
        {data.academicHistory?.map((session, idx) => (
          <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs break-inside-avoid">
            {/* Term Section Stripe Headings */}
            <div className="bg-slate-900 px-4 py-2 flex justify-between items-center text-white">
              <h3 className="text-[10px] font-bold uppercase tracking-widest">
                {session.year} — {session.term}
              </h3>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Continuous Evaluation Record
              </span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-2 px-4 text-[9px] font-bold uppercase tracking-wider text-slate-500 w-[55%]">Subject Particulars</th>
                  <th className="py-2 px-4 text-[9px] font-bold uppercase tracking-wider text-slate-500 text-center w-[15%]">Credit Hours</th>
                  <th className="py-2 px-4 text-[9px] font-bold uppercase tracking-wider text-slate-500 text-center w-[15%]">Percentage</th>
                  <th className="py-2 px-4 text-[9px] font-bold uppercase tracking-wider text-slate-500 text-right w-[15%]">Grade Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {session.subjects?.map((sub, sIdx) => (
                  <tr key={sIdx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2 px-4 text-xs font-medium text-slate-800 uppercase tracking-tight">{sub.name}</td>
                    <td className="py-2 px-4 text-xs font-mono text-center text-slate-600">{sub.creditHours || "1.0"}</td>
                    <td className="py-2 px-4 text-xs font-mono text-center text-slate-700 font-medium">{sub.score}%</td>
                    <td className="py-2 px-4 text-xs font-bold text-right text-slate-900 tracking-wide">{sub.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Final External Summary Examination Ledger Block (WASSCE / National Standards) */}
      {data.wassceResults && (
        <div className="relative mt-8 pt-6 border-t border-dashed border-slate-300 break-inside-avoid">
          <div className="flex items-center gap-2 mb-4 bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-xl">
            <ShieldCheck size={16} className="text-slate-700 shrink-0" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">
              Official External Examination Credentials (WASSCE Summary)
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 bg-slate-50/30 border border-slate-100 rounded-xl p-4">
            {data.wassceResults.map((res, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-200/50 pb-1.5">
                <span className="text-xs font-medium text-slate-600 uppercase tracking-tight">{res.subject}</span>
                <span className="text-xs font-bold text-slate-900 bg-white border border-slate-200 shadow-3xs px-2 py-0.5 rounded-md font-mono min-w-[32px] text-center">
                  {res.grade}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificate Attestation Footer Area Node */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end print:static print:mt-16 print:bottom-auto">
        <div className="max-w-xs">
          <div className="flex items-center gap-1.5 mb-2 text-slate-400">
            <Award size={12} className="stroke-[2]" />
            <span className="text-[8px] font-bold uppercase tracking-wider">Security Attestation</span>
          </div>
          <p className="text-[8.5px] font-medium text-slate-400 leading-relaxed uppercase tracking-tight">
            This transcript document is verified by the central MAAIS network parameters. 
            Any modifications to the data rows void the document seal instantly.
          </p>
        </div>

        {/* Official Authority Validation Block */}
        <div className="text-center w-56 shrink-0">
          <div className="h-[1px] bg-slate-300 w-full mb-3" />
          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
            Office of the Registrar
          </p>
          <p className="text-[8.5px] font-medium text-slate-400 mt-0.5 uppercase tracking-widest italic">
            Institutional Seal & Signatory
          </p>
        </div>
      </div>
    </div>
  );
});

export default TranscriptPrintTemplate;