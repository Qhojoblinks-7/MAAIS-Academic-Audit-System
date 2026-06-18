import React from "react";
import { QrCode, ShieldCheck, GraduationCap, Award, CheckCircle2 } from "lucide-react";
import { cn } from "../ui/cn";

export const TranscriptPrintTemplate = React.forwardRef(function TranscriptPrintTemplate({ data = {} }, ref) {
  const studentsList = data.students || (data.studentName ? [data] : []);

  const getFirstAvailable = (values) => {
    for (const value of values) {
      if (value === undefined || value === null) continue;
      const text = String(value).trim();
      if (text && text !== '—') return value;
    }
    return '—';
  };

  const formatPrintDate = (value) => {
    if (!value || value === '—') return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatApiDate = (value) => {
    if (!value || value === '—') return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getProgramName = (student) => getFirstAvailable([
    student.program,
    student.programName,
    student.learningArea,
    student.student?.program,
    student.student?.programName,
    student.student?.currentClass?.name,
    student.currentClass?.name,
    student.department?.name,
    student.student?.department?.name,
    data.program,
    data.programName,
    data.learningArea,
  ]);

  const getExamDate = (student) => formatPrintDate(getFirstAvailable([
    student.sessionInfo?.examDate,
    student.examDate,
    student.terminalExamDate,
    student.generatedAt,
    student.reportDate,
    data.sessionInfo?.examDate,
    data.examDate,
    data.terminalExamDate,
    data.generatedAt,
    data.reportDate,
  ]));

  if (studentsList.length === 0) {
    return (
      <div className="text-center py-12 border border-slate-200 rounded-xl text-sm text-slate-400 font-sans italic bg-white">
        No student scholastic records detected in the active printing queue ledger.
      </div>
    );
  }

  // MASTER HEADER MATRIX
  const RenderHeaderBlock = ({ student }) => (
    <div className="w-full text-left">
      {/* Header Block */}
      <div className="relative flex justify-between items-start border-b-4 border-slate-900 pb-5 mb-6">
        <div className="flex gap-4 items-center">
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
              Official Academic Transcript & Permanent Record
            </p>
            <p className="text-[9px] text-slate-400 font-medium tracking-wide mt-0.5 font-sans">
              {data.institutionAddress || "PMB 14, Central Region, Ghana"} &bull; {data.institutionWebsite || "audit.mando-shts.edu.gh"}
            </p>
          </div>
        </div>

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
            <span className="text-xs font-black text-slate-950 uppercase tracking-tight">{student.studentName || "—"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Permanent Index Number</span>
            <span className="text-xs font-bold text-slate-950 font-mono tracking-tight">{student.indexNumber || "—"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Academic Programme</span>
            <span className="text-xs font-black text-slate-950 uppercase tracking-tight truncate max-w-[180px] print:max-w-none">{getProgramName(student)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Enrollment Period</span>
            <span className="text-xs font-bold text-slate-950 tracking-tight">
              {formatPrintDate(student.enrollmentDate) || "—"} {student.completionDate ? ` — ${formatPrintDate(student.completionDate)}` : ''}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Latest Examination Date</span>
            <span className="text-xs font-bold text-slate-950 tracking-tight">
              {getExamDate(student)}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Cumulative GPA</span>
            <span className="text-xs font-black text-slate-950 font-mono">
              {student.cgpa ? Number(student.cgpa).toFixed(2) : "0.00"}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Record Authentication</span>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-700 stroke-[3]" />
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                {student.approvalStatus === "LOCKED" || student.approvalStatus === "VERIFIED" ? "Certified Secure" : "Pending Audit"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // AUTHENTICATED SIGNATURE FOOTER WITH BUILT-IN PHYSICAL STAMPING ISOLATION
  const RenderFooterBlock = () => (
    <div className="w-full pt-6 border-t border-slate-300 flex justify-between items-end font-sans bg-white">
      <div className="max-w-xs text-left pb-2">
        <div className="flex items-center gap-1.5 mb-2 text-slate-400">
          <Award size={12} className="stroke-[2.5]" />
          <span className="text-[8px] font-black uppercase tracking-wider">System Integrity Attestation</span>
        </div>
        <p className="text-[7.5px] font-medium text-slate-400 leading-normal uppercase tracking-tight">
          This scholastic history file is fetched directly from encrypted institution database archives.
          Any handwritten additions, unauthenticated ink stamps, or formatting adjustments void the verified signature seal.
        </p>
      </div>

      {/* OPTIMIZED: Added physical height allocations for stamps and signatures */}
      <div className="text-center w-52 shrink-0 flex flex-col justify-end">
        {/* Dedicated Signatory Canvas (Leaves exactly ~60px of physical vertical whitespace) */}
        <div className="h-16 w-full opacity-30 select-none pointer-events-none italic font-serif text-slate-400 text-[10px] tracking-widest flex items-center justify-center border border-dashed border-slate-100 rounded mb-2 print:border-0">
          {data.signatureMock || "[ Place Embossed Seal Here ]"}
        </div>
        <div className="h-[1.5px] bg-slate-950 w-full mb-1.5" />
        <p className="text-[9.5px] font-black text-slate-950 uppercase tracking-wider">
          Office of the Registrar
        </p>
        <p className="text-[7.5px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest italic">
          Authorized Signatory Stamp
        </p>
      </div>
    </div>
  );

  const masterSheetClassNames = cn(
    "box-border bg-white text-slate-950 relative font-serif p-12 select-none mx-auto border border-slate-200 mb-8",
    "w-full max-w-[210mm] print:w-full print:max-w-none print:p-0 print:border-0 print:margin-0 shadow-sm print:shadow-none",
    "break-after-page page-break-after-always universal-print-sheet"
  );

  return (
    <div ref={ref} id="transcript-batch-container" className="universal-print-root-override">
      <style>{`
        @media print {
          html, body, #root, [class*="layout"], [class*="container"], [class*="wrapper"], main, section {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            display: block !important;
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .universal-print-root-override {
            display: block !important;
            width: 100% !important;
            position: static !important;
          }

          .universal-print-sheet { 
            display: block !important;
            position: relative !important;
            page-break-after: always !important; 
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            padding: 20mm 18mm 18mm 18mm !important; /* Generates optimized printable boundaries */
            box-sizing: border-box !important;
            height: auto !important;
          }

          .invisible-layout-table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            height: auto !important;
          }
          
          /* Ensures the tfoot padding calculation scales clean across Edge/Chrome print engines */
          .invisible-layout-table tfoot td {
            padding-top: 24px !important;
          }
        }
      `}</style>

      {studentsList.map((student, studentIdx) => {
        const academicHistory = student.academicHistory || [];
        const wassceResults = student.wassceResults || [];

        return (
          <React.Fragment key={student.id || studentIdx}>
            
            {/* STAGE 1: Individual Semester Sheets */}
            {academicHistory.map((session, idx) => (
              <div key={`sem-${idx}`} className={masterSheetClassNames}>
                <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none p-24">
                  <GraduationCap size={360} className="stroke-[1] text-slate-900" />
                </div>
                <div className="absolute inset-4 border border-slate-300/60 pointer-events-none rounded-sm print:inset-2" />

                <table className="invisible-layout-table border-0 p-0 m-0 w-full text-left">
                  <thead>
                    <tr>
                      <td className="p-0 border-0">
                        <RenderHeaderBlock student={student} />
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-0 border-0 pt-2 pb-4 align-top">
                        <div className="relative border border-slate-300 rounded-lg overflow-hidden shadow-3xs bg-white">
                          <div className="bg-slate-950 px-4 py-1.5 flex justify-between items-center text-white font-sans">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest">
                              {session.year} &bull; {session.term}
                            </h3>
                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                              Continuous Assessment Record
                            </span>
                          </div>

                          <table className="w-full text-left border-collapse font-sans table-fixed">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-1.5 px-4 text-[9px] font-black uppercase tracking-wider text-slate-500 w-[60%]">Subject Course Description</th>
                                <th className="py-1.5 px-4 text-[9px] font-black uppercase tracking-wider text-slate-500 text-center w-[20%]">Numerical Score</th>
                                <th className="py-1.5 px-4 text-[9px] font-black uppercase tracking-wider text-slate-500 text-right w-[20%]">Letter Grade</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {session.subjects?.map((sub, sIdx) => (
                                <tr key={sIdx} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="py-1.5 px-4 text-xs font-semibold text-slate-900 uppercase tracking-tight font-serif truncate">
                                    {sub.name || sub.subject || "—"}
                                  </td>
                                  <td className="py-1.5 px-4 text-xs font-mono text-center text-slate-700">
                                    {sub.score !== undefined ? `${sub.score}%` : "—"}
                                  </td>
                                  <td className="py-1.5 px-4 text-xs font-black text-right text-slate-950 tracking-wide font-serif">
                                    {sub.grade || "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="p-0 border-0 pt-6">
                        <RenderFooterBlock />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ))}

            {/* STAGE 2: Summary / WASSCE Sheet */}
            <div className={masterSheetClassNames}>
              <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none p-24">
                <GraduationCap size={360} className="stroke-[1] text-slate-900" />
              </div>
              <div className="absolute inset-4 border border-slate-300/60 pointer-events-none rounded-sm print:inset-2" />

              <table className="invisible-layout-table border-0 p-0 m-0 w-full text-left">
                <thead>
                  <tr>
                    <td className="p-0 border-0">
                      <RenderHeaderBlock student={student} />
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-0 border-0 pt-2 pb-4 align-top">
                      {wassceResults && wassceResults.length > 0 ? (
                        <div className="relative bg-white border border-slate-300 rounded-lg overflow-hidden shadow-3xs mb-6">
                          <div className="bg-slate-950 px-4 py-1.5 flex items-center gap-2 text-white font-sans">
                            <ShieldCheck size={13} className="text-slate-400 shrink-0" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest">
                              External Examination Ledger Summary (WASSCE Record)
                            </h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 bg-slate-50/20 p-4 font-sans">
                            {wassceResults.map((res, i) => (
                              <div key={i} className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                                <span className="text-xs font-medium text-slate-700 uppercase tracking-tight font-serif truncate mr-2">
                                  {res.subject || res.name}
                                </span>
                                <span className="text-xs font-black text-slate-950 bg-white border border-slate-200 shadow-3xs px-2 py-0.5 rounded font-mono min-w-[34px] text-center shrink-0">
                                  {res.grade}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="relative mb-6 border border-dashed border-slate-200 rounded-xl py-8 text-center text-xs text-slate-400 font-sans italic bg-slate-50/40">
                          No external graduation board examinations (WASSCE) filed for this cycle.
                        </div>
                      )}

                      <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 font-sans">
                        <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Official Grading Key Interpretations</h4>
                        <div className="grid grid-cols-4 gap-2 text-[9px] text-slate-500 font-medium">
                          <div><strong className="text-slate-800 font-mono">A1 / Excellent:</strong> 75% – 100%</div>
                          <div><strong className="text-slate-800 font-mono">B2 / Very Good:</strong> 70% – 74%</div>
                          <div><strong className="text-slate-800 font-mono">B3 / Good:</strong> 65% – 69%</div>
                          <div><strong className="text-slate-800 font-mono">C4-C6 / Credit:</strong> 50% – 64%</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td className="p-0 border-0 pt-6">
                      <RenderFooterBlock />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

          </React.Fragment>
        );
      })}
    </div>
  );
});

export default TranscriptPrintTemplate;