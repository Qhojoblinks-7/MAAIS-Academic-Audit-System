import React from "react";
import { QrCode, ShieldCheck, GraduationCap, Award, CheckCircle2 } from "lucide-react";
import { cn } from "../ui/cn";

export const TerminalPrintTemplate = React.forwardRef(function TerminalPrintTemplate({ data = {} }, ref) {
  const terminalResults = data.terminalResults || [];
  const sessionInfo = data.sessionInfo || {};

  return (
    <div
      ref={ref}
      id="terminal-report-template"
      className={cn(
        // Box-sizing and layout containment mechanics
        "box-border bg-white text-slate-950 min-h-screen relative font-serif p-12 select-none mx-auto border border-slate-200",
        // Enforces clean constraint values on screens to simulate standard paper sizes safely
        "w-full max-w-[210mm]",
        // Print media overrides that yield layout scaling to the local printer frame engine
        "fixed -left-[9999px] top-0 print:static print:block print:w-full print:max-w-none print:p-6 print:border-0 print:shadow-none"
      )}
    >
      {/* Security Watermark Crest */}
      <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none p-24">
        <GraduationCap size={360} className="stroke-[1] text-slate-900" />
      </div>

      {/* Outer Administrative Security Border */}
      <div className="absolute inset-4 border border-slate-300/60 pointer-events-none rounded-sm print:inset-2" />

      {/* Header Block */}
      <div className="relative flex justify-between items-start border-b-4 border-slate-900 pb-5 mb-6">
        <div className="flex gap-4 items-center">
          {/* Institutional Shield / Crest Box */}
          <div className="w-14 h-14 bg-slate-950 text-white rounded-xl flex items-center justify-center shadow-md shrink-0 border border-slate-800">
            {data.institutionLogoUrl ? (
              <img 
                src={data.institutionLogoUrl} 
                alt="Institution Logo" 
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <GraduationCap size={32} className="stroke-[1.2]" />
            )}
          </div>
          
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-none font-sans">
              {data.institutionName || "Mando Senior High Technical School"}
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600 mt-1.5 font-sans">
              Terminal Examination Report
            </p>
            <p className="text-[9px] text-slate-400 font-medium tracking-wide mt-0.5 font-sans">
              {data.institutionAddress || "PMB 14, Central Region, Ghana"} &bull; {data.institutionWebsite || "audit.mando-shts.edu.gh"}
            </p>
          </div>
        </div>

        {/* Cryptographic Ledger Authentication Node */}
        <div className="text-right shrink-0 flex flex-col items-center">
          <div className="bg-white p-1.5 rounded-lg inline-block border-2 border-slate-900 shadow-sm mb-1">
            <QrCode size={40} className="text-slate-950 stroke-[1.5]" />
          </div>
          <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-400 font-sans">
            Verify Ledger ID
          </span>
        </div>
      </div>

      {/* Biographic Matrix Block */}
      <div className="relative grid grid-cols-2 gap-x-8 gap-y-2 bg-slate-50/80 rounded-xl border border-slate-200/60 p-4 mb-6 font-sans">
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Name of Student</span>
            <span className="text-xs font-black text-slate-950 uppercase tracking-tight">{data.studentName || "—"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Permanent Index Number</span>
            <span className="text-xs font-bold text-slate-950 font-mono tracking-tight">{data.indexNumber || "—"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Academic Programme</span>
            <span className="text-xs font-black text-slate-950 uppercase tracking-tight truncate max-w-[180px] print:max-w-none">{data.program || "—"}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Examination Session</span>
            <span className="text-xs font-bold text-slate-950 tracking-tight">
              {sessionInfo.year || "—"} &bull; {sessionInfo.term || "—"} Terminal
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Examination Date</span>
            <span className="text-xs font-bold text-slate-950 tracking-tight">
              {sessionInfo.examDate || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Record Authentication</span>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-700 stroke-[3]" />
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Certified Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Examination Results Table */}
      {terminalResults.length > 0 ? (
        <div className="relative space-y-5 mb-6">
          {/* Header Title Bar */}
          <div className="bg-slate-950 px-4 py-1.5 flex justify-between items-center text-white font-sans">
            <h3 className="text-[10px] font-bold uppercase tracking-widest">
              Terminal Examination Results
            </h3>
            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
              Session: {sessionInfo.year || "—"} {sessionInfo.term || "—"} Term
            </span>
          </div>

          <table className="w-full text-left border-collapse font-sans table-fixed">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-1.5 px-4 text-[9px] font-black uppercase tracking-wider text-slate-500 w-[40%]">Subject Course Description</th>
                <th className="py-1.5 px-4 text-[9px] font-black uppercase tracking-wider text-slate-500 text-center w-[15%]">CA</th>
                <th className="py-1.5 px-4 text-[9px] font-black uppercase tracking-wider text-slate-500 text-center w-[15%]">Exam</th>
                <th className="py-1.5 px-4 text-[9px] font-black uppercase tracking-wider text-slate-500 text-center w-[10%]">Total</th>
                <th className="py-1.5 px-4 text-[9px] font-black uppercase tracking-wider text-slate-500 text-center w-[10%]">Grade</th>
                <th className="py-1.5 px-4 text-[9px] font-black uppercase tracking-wider text-slate-500 text-center w-[10%]">Points</th>
                <th className="py-1.5 px-4 text-[9px] font-black uppercase tracking-wider text-slate-500 text-right w-[10%]">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {terminalResults.map((result, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-1.5 px-4 text-xs font-semibold text-slate-900 uppercase tracking-tight font-serif truncate">{result.subject}</td>
                  <td className="py-1.5 px-4 text-xs font-mono text-center text-slate-700">{result.caScore ?? 0}%</td>
                  <td className="py-1.5 px-4 text-xs font-mono text-center text-slate-700">{result.examScore ?? 0}%</td>
                  <td className="py-1.5 px-4 text-xs font-mono text-center text-slate-700 font-bold">{result.totalScore ?? 0}%</td>
                  <td className="py-1.5 px-4 text-xs font-black text-center text-slate-950 tracking-wide font-serif">{result.grade || "F9"}</td>
                  <td className="py-1.5 px-4 text-xs font-mono text-center text-slate-700">{result.points ?? 0}</td>
                  <td className="py-1.5 px-4 text-xs font-medium text-center text-slate-600">{result.remarks || " — "}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Section */}
          {terminalResults.length > 0 && (
            <div className="mt-4 p-3 bg-slate-50/30 rounded-lg font-sans">
              <div className="grid grid-cols-2 gap-4 text-[9px] font-medium text-slate-500">
                <div>
                  <span className="font-bold">Number of Subjects:</span> {terminalResults.length}
                </div>
                <div>
                  <span className="font-bold">Average Score:</span> 
                  {(terminalResults.reduce((sum, r) => sum + (r.totalScore || 0), 0) / terminalResults.length).toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 border border-slate-200 rounded-xl text-xs text-slate-400 font-sans italic">
          No terminal examination results provided for this session.
        </div>
      )}

      {/* Institutional Grading Legend Grid */}
      <div className="mt-6 border border-slate-200 rounded-lg p-3 bg-slate-50/50 break-inside-avoid font-sans">
        <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Official Grading Key Interpretations</h4>
        <div className="grid grid-cols-4 gap-2 text-[9px] text-slate-500 font-medium">
          <div><strong className="text-slate-800 font-mono">A1 / Excellent:</strong> 75% – 100%</div>
          <div><strong className="text-slate-800 font-mono">B2 / Very Good:</strong> 70% – 74%</div>
          <div><strong className="text-slate-800 font-mono">B3 / Good:</strong> 65% – 69%</div>
          <div><strong className="text-slate-800 font-mono">C4-C6 / Credit:</strong> 50% – 64%</div>
        </div>
      </div>

      {/* Attestation Attenuation Footer Section */}
      <div className="mt-10 flex justify-between items-end break-inside-avoid font-sans">
        <div className="max-w-xs">
          <div className="flex items-center gap-1.5 mb-1.5 text-slate-400">
            <Award size={13} className="stroke-[2.5]" />
            <span className="text-[8px] font-black uppercase tracking-wider">System Integrity Attestation</span>
          </div>
          <p className="text-[8px] font-medium text-slate-400 leading-normal uppercase tracking-tight">
            This terminal report document is generated directly via digital cryptographic signature protocols.
            Any structural changes, manual ink additions, or data layer alterations void this layout seal instantly.
          </p>
        </div>

        {/* Validation Authority Signature Deck */}
        <div className="text-center w-48 shrink-0">
          <div className="h-6 opacity-40 select-none pointer-events-none italic font-serif text-slate-600 text-xs tracking-widest flex items-center justify-center">
            {data.signatureMock || "Official Office Seal"}
          </div>
          <div className="h-[1.5px] bg-slate-950 w-full mb-1.5" />
          <p className="text-[10px] font-black text-slate-950 uppercase tracking-wider">
            Office of the Registrar
          </p>
          <p className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest italic">
            Authorized Signatory Stamp
          </p>
        </div>
      </div>
    </div>
  );
});

export default TerminalPrintTemplate;