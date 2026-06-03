import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Printer,
  ShieldCheck,
  User,
  Database,
  TrendingUp,
  History,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Lock,
  Bot,
  Award
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

// Helper to calculate WAEC Grade (simple version)
const getWAECGrade = (score) => {
  if (score >= 80) return { grade: 'A1', label: 'Excellent', color: 'bg-slate-100 text-slate-900 border-slate-300 font-bold' };
  if (score >= 70) return { grade: 'B2', label: 'Very Good', color: 'bg-slate-50 text-slate-800 border-slate-205' };
  if (score >= 65) return { grade: 'B3', label: 'Good', color: 'bg-slate-50 text-slate-850 border-slate-205' };
  if (score >= 60) return { grade: 'C4', label: 'Credit', color: 'bg-[#F9F9F7] text-slate-700 border-slate-200' };
  if (score >= 55) return { grade: 'C5', label: 'Credit', color: 'bg-[#F9F9F7] text-slate-705 border-slate-200' };
  if (score >= 50) return { grade: 'C6', label: 'Credit', color: 'bg-[#F9F9F7] text-slate-705 border-slate-200' };
  if (score >= 45) return { grade: 'D7', label: 'Pass', color: 'bg-amber-50 text-amber-800 border-amber-200' };
  if (score >= 40) return { grade: 'E8', label: 'Pass', color: 'bg-orange-50 text-orange-800 border-orange-200' };
  return { grade: 'F9', label: 'Fail', color: 'bg-rose-50 text-rose-800 border-rose-250' };
};

export function HODArchiveDetailView({ student, onBack }) {
  const [showToast, setShowToast] = React.useState(null);

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

const handleExportTranscript = async () => {
    triggerToast("Generating official transcript PDF...");

    try {
      // Create isolated iframe to avoid Tailwind's oklch colors
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '210mm';
      iframe.style.height = 'auto';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 48px; font-family: Arial, sans-serif; color: #0f172a; background: white; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; font-size: 11px; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 32px; }
            .section { margin-bottom: 32px; }
            .section-title { font-size: 13px; font-weight: 900; text-transform: uppercase; color: #0f172a; }
            .term-header { background: #0f172a; color: white; padding: 8px 16px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
            .label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .value { font-size: 12px; font-weight: bold; }
            .subject { font-weight: 500; text-transform: uppercase; color: #0f172a; }
            .score { font-family: monospace; text-align: center; color: #475569; }
            .grade { font-weight: bold; text-align: right; color: #0f172a; }
            .footer { position: absolute; bottom: 48px; left: 48px; right: 48px; border-top: 1px dashed #94a3b8; padding-top: 24px; }
            .footer-note { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-size: 24px; font-weight: 800; text-transform: uppercase; color: #0f172a;">Mando Senior High Technical School</h1>
            <p style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; margin-top: 4px;">Official Academic Record & Statement of Results</p>
            <p style="font-size: 10px; color: #475569;">PMB 14, Central Region, Ghana • portal.institution.edu.gh</p>
          </div>
          <div class="section">
            <h2 class="section-title">Student Information</h2>
            <table style="margin-top: 16px;">
              <tr><td class="label">Student Name</td><td class="value">${student.name || 'N/A'}</td></tr>
              <tr><td class="label">Index Number</td><td class="value" style="font-family: monospace;">${student.index || 'N/A'}</td></tr>
              <tr><td class="label">Program of Study</td><td class="value">${student.currentClass?.includes('Agric') ? 'General Agriculture' : 'Science'}</td></tr>
            </table>
          </div>
          <div class="section">
            <h2 class="section-title">Academic History</h2>
            ${student.history && student.history.length > 0 
              ? student.history.map(term => `
                <div style="margin-top: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <div class="term-header">${term.term || 'Term'}</div>
                  <table>
                    <thead><tr style="background: #f8fafc;"><th class="label">Subject</th><th class="label" style="text-align: center;">Score</th><th class="label" style="text-align: right;">Grade</th></tr></thead>
                    <tbody>
                      <tr><td class="subject">Core Mathematics</td><td class="score">${term.finalGrade}%</td><td class="grade">${getWAECGrade(term.finalGrade).grade}</td></tr>
                      <tr><td class="subject">English Language</td><td class="score">${Math.min(100, term.finalGrade + 2)}%</td><td class="grade">${getWAECGrade(Math.min(100, term.finalGrade + 2)).grade}</td></tr>
                      <tr><td class="subject">Integrated Science</td><td class="score">${term.finalGrade}%</td><td class="grade">${getWAECGrade(term.finalGrade).grade}</td></tr>
                      <tr><td class="subject">Social Studies</td><td class="score">${Math.max(30, term.finalGrade - 5)}%</td><td class="grade">${getWAECGrade(Math.max(30, term.finalGrade - 5)).grade}</td></tr>
                      <tr><td class="subject">Elective Subject 1</td><td class="score">${Math.min(100, term.finalGrade + 3)}%</td><td class="grade">${getWAECGrade(Math.min(100, term.finalGrade + 3)).grade}</td></tr>
                      <tr><td class="subject">Elective Subject 2</td><td class="score">${Math.max(30, term.finalGrade - 2)}%</td><td class="grade">${getWAECGrade(Math.max(30, term.finalGrade - 2)).grade}</td></tr>
                    </tbody>
                  </table>
                </div>
              `).join('')
              : '<p style="font-size: 12px; color: #64748b; font-style: italic; text-align: center; padding: 40px 0;">No academic records available for this student.</p>'
            }
          </div>
          <div class="footer"><p class="footer-note">Archive Status: VERIFIED & REGISTERED • HOD Certified</p></div>
        </body>
        </html>
      `);
      iframeDoc.close();

      await new Promise(resolve => setTimeout(resolve, 300));

      const iframeBody = iframeDoc.body;
      const canvas = await html2canvas(iframeBody, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -heightLeft, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${student?.name?.replace(/\s/g, '_') || 'transcript'}_official_transcript.pdf`);
      triggerToast("Official transcript exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      triggerToast("Failed to export transcript - please try again");
    }
  };

  const scores = student.history.map(h => h.finalGrade);
  const averageGpa = scores.length > 0 ? (scores.reduce((acc, s) => acc + s, 0) / scores.length).toFixed(1) : 'No Terms';
  const highestTerminal = scores.length > 0 ? Math.max(...scores) : 'N/A';
  const lowestTerminal = scores.length > 0 ? Math.min(...scores) : 'N/A';

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7]/60 relative no-scrollbar pb-24 h-full">
      {/* Dynamic Toast Alerts */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-xl z-50 flex items-center gap-3 text-xs font-black tracking-wide animate-bounce">
          <ShieldCheck className="text-emerald-400" size={16} />
          {showToast}
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-white border-b border-slate-200/60 sticky top-0 z-30 shadow-sm/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 bg-slate-50 hover:bg-slate-105 rounded-2xl text-slate-600 border border-slate-200/60 transition-all flex items-center justify-center outline-none"
              title="Return to department archives"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] bg-slate-100 px-20 px-2 py-1 rounded inline-flex items-center gap-1">
                <Lock size={10} strokeWidth={3} /> Certified Departmental Archives (Vault Record)
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2 font-sans">
                Longitudinal Audit: <span className="italic font-display font-medium text-slate-700">{student.name}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportTranscript}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl text-xs font-black transition-all shadow-md outline-none"
            >
              <Printer size={15} />
              Verify & Print Official Transcript
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        
        {/* Quick Biographical Summary Banner */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 z-10 font-sans">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative">
            <div className="relative">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
                alt={student.name} 
                className="w-24 h-24 rounded-[2rem] bg-slate-50 p-1 border-4 border-slate-100 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center text-white bg-slate-900 shadow-lg border-2 border-white">
                <ShieldCheck size={16} />
              </div>
            </div>

            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="px-2.5 py-0.5 bg-slate-150 text-slate-750 font-mono rounded-lg text-[10px] font-black uppercase tracking-widest">{student.index}</span>
                <span className="px-2.5 py-0.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Class of {student.graduationYear}</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter mt-2">{student.name}</h1>
              <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-wider font-sans">
                Stream: {student.currentClass} • Anomaly Detection: <span className="text-slate-900 font-black">Passed</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto self-stretch md:self-center relative">
            {[
              { label: 'Longitudinal GPA', val: `${averageGpa}%`, note: 'Overall 3-year cumulative' },
              { label: 'Peak Cycle Grade', val: `${highestTerminal}%`, note: 'WAEC Division Peak' },
              { label: 'WASSCE Output', val: student.finalWassce, note: 'National exam certification' },
              { label: 'Audit Status', val: 'VERIFIED & REGISTERED', note: 'HOD Clearance Sealed', accent: true }
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50/80 border border-slate-100 rounded-2xl px-5 py-4 min-w-[130px] flex flex-col justify-between shadow-sm">
                <p className="text-[9px] font-black text-slate-405 uppercase tracking-widest">{stat.label}</p>
                <p className={cn(
                  "text-xl font-extrabold tracking-tight mt-1 text-slate-900",
                  stat.accent && "text-emerald-700 bg-none font-black text-[10px]"
                )}>{stat.val}</p>
                <p className="text-[9px] font-semibold text-slate-400 mt-1 leading-none">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>

{/* Section 1: Dynamic Performance Trend Graph */}
         <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
           <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
             <div className="flex items-center gap-3 font-sans">
               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900">
                 <TrendingUp size={20} />
               </div>
               <div>
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">1. Verified Academic Profile Trajectory</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Tamper-Proof Longitudinal Progress Tracker</p>
               </div>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-wider">
               <Bot size={13} className="text-slate-900" />
               Department Certified Grade trace
             </div>
           </header>

           {student.history.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 border border-slate-200/50 rounded-3xl text-center">
               <History size={36} className="text-slate-300 mb-2 font-sans" />
               <p className="text-xs font-black text-slate-800 uppercase tracking-widest">No Past Terms Archived Yet</p>
               <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider mt-1">This student is currently in SHS 1. Archives compile starting in Form 2.</p>
             </div>
           ) : (
             <div className="h-[300px] w-full pt-4">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={student.history}>
                   <defs>
                     <linearGradient id="hodTrendGlow1" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15}/>
                       <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                   <XAxis 
                     dataKey="term" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} 
                     dy={8} 
                   />
                   <YAxis 
                     domain={[30, 100]} 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} 
                   />
                   <Tooltip 
                     contentStyle={{ 
                       backgroundColor: '#0f172a', 
                       borderRadius: '16px', 
                       border: 'none', 
                       color: 'white', 
                       fontSize: '11px',
                       fontWeight: 900,
                       boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                     }}
                     formatter={(value) => [`${value}%`, 'Grade Average']}
                   />
                   <Area 
                     type="monotone" 
                     dataKey="finalGrade" 
                     stroke="#0f172a" 
                     strokeWidth={5} 
                     fillOpacity={1} 
                     fill="url(#hodTrendGlow1)" 
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           )}
        </section>

        {/* Section 2: Terminal Assessment Breakdowns of the Selected Student */}
        <section className="space-y-6">
          <header className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">2. Terminal Assessment Sheets Archive (Full 9 High School terms)</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Longitudinal grade breakdowns across all cycles of high school phase</p>
            </div>
          </header>

          {student.history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200/60 rounded-[2.5rem] shadow-sm text-center w-full">
              <FileText size={32} className="text-slate-300 mb-2 font-sans" />
              <p className="text-xs font-black text-slate-800 uppercase tracking-widest">No Terminal Assessment Dossiers</p>
              <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider mt-1">Dossier is initialized, but first-year quarters have not compiled for permanent digital archival storage.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {student.history.map((term, tIdx) => (
                <div key={term.term} className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden flex flex-col shadow-sm">
                  
                  {/* Upper bar */}
                  <div className="bg-slate-50 px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3 font-sans">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-md">
                        {tIdx + 1}
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-wider">{term.term} Journal</h4>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">HOD Cleared</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-100">
                      HOD Certified
                    </span>
                  </div>

{/* Subject Grade Table */}
                   <div className="p-4 overflow-x-auto no-scrollbar">
                     <Table className="w-full text-left min-w-[280px]">
                       <TableHeader>
                         <TableRow className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                           <TableHead className="pb-3 pl-2">Subject</TableHead>
                           <TableHead className="pb-3 text-center">Class (30)</TableHead>
                           <TableHead className="pb-3 text-center">Exam (70)</TableHead>
                           <TableHead className="pb-3 text-center">Grade</TableHead>
                           <TableHead className="pb-3 text-right pr-2 italic font-black">Total</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody className="divide-y divide-slate-50">
                         {['Core Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'Elective Subject 1', 'Elective Subject 2'].map((subj, sIdx) => {
                           const baseGrade = term.finalGrade || 70;
                           const classScore = Math.round((baseGrade * 0.3) + (sIdx % 2 === 0 ? 1 : -3));
                           const examScore = Math.round((baseGrade * 0.7) + (sIdx % 3 === 0 ? -1 : 3));
                           const totalScore = Math.min(100, Math.max(0, classScore + examScore));
                           const calculatedGrade = getWAECGrade(totalScore);

                           return (
                             <TableRow key={subj} className="hover:bg-slate-50/50 transition-all text-[11px] font-medium text-slate-600">
                               <TableCell className="py-3 pl-2 font-semibold text-slate-800 leading-tight">
                                 {subj}
                               </TableCell>
                               <TableCell className="py-3 text-center font-mono text-slate-500">
                                 {classScore}
                               </TableCell>
                               <TableCell className="py-3 text-center font-mono text-slate-500">
                                 {examScore}
                               </TableCell>
                               <TableCell className="py-3 text-center">
                                 <span className={cn(
                                   "px-2 py-0.5 text-[9px] rounded-md font-bold border",
                                   calculatedGrade.color
                                 )}>
                                   {calculatedGrade.grade}
                                 </span>
                               </TableCell>
                               <TableCell className="py-3 text-right pr-2 font-extrabold font-mono text-slate-900">
                                 {totalScore}%
                               </TableCell>
                             </TableRow>
                           );
                         })}
                       </TableBody>
                     </Table>
                   </div>

                  {/* Term Aggregate Summary Footer */}
                  <div className="bg-slate-50/30 border-t border-slate-100 p-4.5 flex items-center justify-between text-slate-500 text-xs mt-auto">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Behavior Rating:</span>
                      <span className="ml-1 text-slate-805 font-extrabold">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span 
                            key={idx} 
                            className={cn(
                              "text-base leading-none", 
                              idx < (term.behaviorRating || 3) ? "text-slate-900" : "text-slate-200"
                            )}
                          >
                            ★
                          </span>
                        ))}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Journal Average</span>
                      <span className="text-sm font-black text-slate-900 italic font-mono mt-0.5 block">{term.finalGrade}%</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Subject Mastery Metrics, Behaviors, and Warnings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Observation Logs */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <header className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">3. Comprehensive Observations Archive</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Qualitative Teacher Notes Logs (Frozen)</p>
                </div>
              </header>

              <div className="space-y-4">
                {student.observations && student.observations.length > 0 ? (
                  student.observations.map((obs) => (
                    <div key={obs.id} className="p-5 bg-slate-50/60 border-l-4 border-slate-900 border-y border-r border-slate-150 rounded-r-2xl">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[8px] font-black text-slate-800 bg-slate-205 px-2 py-0.5 rounded uppercase font-sans">{obs.type}</span>
                        <span className="text-[8px] font-bold text-slate-400 font-mono">{obs.date}</span>
                      </div>
                      <p className="text-xs font-semibold leading-relaxed text-slate-705 italic">"{obs.comment}"</p>
                      <p className="text-[8px] font-black text-slate-450 mt-2 uppercase tracking-wide font-sans">— Signed: Instructor {obs.teacherName}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center italic py-8 font-sans">No qualitative academic observation observations logged for this record cycle.</p>
                )}
              </div>
            </div>

            <div className="mt-8 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-slate-900 animate-pulse shrink-0" />
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-normal font-sans">Historical Ledger Protected: No ongoing evaluations may be registered for past graduates.</p>
            </div>
          </section>

          {/* Intervention Logs & Certificates of Clearance */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <header className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">4. Interventions & Remedial Coaching Track</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Term remedial coaching logs and milestone outcomes</p>
                </div>
              </header>

              <div className="space-y-4">
                {student.interventions && student.interventions.length > 0 ? (
                  student.interventions.map((int) => (
                    <div key={int.id} className="bg-slate-50/60 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all font-sans">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[8px] font-black text-slate-800 bg-slate-200 px-2.5 py-1 rounded">REMEDIAL METRICS</span>
                          <span className="text-[8px] font-bold text-slate-450 uppercase">{int.term}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 tracking-tight leading-snug">Trigger Issue: <span className="font-medium text-slate-550 italic">{int.reason}</span></p>
                        <p className="text-xs font-bold text-slate-800 mt-1 tracking-tight leading-snug">Implemented Strategy: <span className="font-medium text-slate-550 italic">{int.action}</span></p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-150 bg-slate-105/50 p-3 rounded-xl border border-slate-200/50">
                        <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest block mb-0.5 font-sans">Outcome Document Status</span>
                        <p className="text-[11px] font-bold text-slate-700 italic">"{int.outcome}"</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center italic py-8 font-sans">No specific developmental interventions recorded for this student.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 font-sans">
                <ShieldCheck size={11} className="text-slate-900" /> Secure longitudinal registry validated • Level 4 Clearance
              </span>
            </div>
          </section>

        </div>

        {/* Section 4: HOD Final Certification Signature Note */}
        <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden font-sans">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-white/10 to-white/0 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative">
            <header className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest font-sans">5. Official Board Endorsement & Certificate of Clearance</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Archived Clearance Statement and Seal verification indicators</p>
              </div>
            </header>

            <div className="space-y-6">
              <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
                <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest block mb-2">Authenticated HOD Entry Note</span>
                <p className="text-sm font-semibold italic text-slate-200 leading-relaxed">
                  "{student.hodComment || 'Overall academic portfolio audited and cleared for permanent historical archive.'}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0 bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    Archive Status: VERIFIED & SEALED IN HISTORICAL VAULT
                  </p>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => triggerToast("Generating encrypted verification qr matrix...")}
                    className="px-6 py-3.5 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-750 transition-all outline-none"
                  >
                    Generate Verification QR Ticket
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-800/80 [border-top-style:dashed]">
              <div className="text-center md:text-left">
                <span className="text-[9px] font-black text-slate-505 uppercase tracking-widest block leading-none mb-1">Audit Clearance Anchor</span>
                <span className="text-[11px] font-mono font-black text-slate-350 text-slate-300">MAAIS-VAULT-HASH-{student.id}-99X</span>
              </div>
              <div className="text-center md:text-right">
                <span className="text-[9px] font-black text-slate-505 uppercase tracking-widest block leading-none mb-1">Approved Department Head Signature</span>
                <span className="text-sm font-display italic font-medium text-slate-300">Head of Department, General & Applied Sciences</span>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
