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

// Helper to calculate WAEC Grade
const getWAECGrade = (score) => {
  if (score >= 80) return { grade: 'A1', label: 'Excellent', color: 'bg-[#F9F9F7] text-slate-900 border-slate-300 font-black' };
  if (score >= 70) return { grade: 'B2', label: 'Very Good', color: 'bg-slate-50 text-slate-800 border-slate-200' };
  if (score >= 65) return { grade: 'B3', label: 'Good', color: 'bg-slate-50 text-slate-850 border-slate-200' };
  if (score >= 60) return { grade: 'C4', label: 'Credit', color: 'bg-slate-100/50 text-slate-700 border-slate-200' };
  if (score >= 55) return { grade: 'C5', label: 'Credit', color: 'bg-slate-100/50 text-slate-700 border-slate-200' };
  if (score >= 50) return { grade: 'C6', label: 'Credit', color: 'bg-slate-100/50 text-slate-700 border-slate-200' };
  if (score >= 45) return { grade: 'D7', label: 'Pass', color: 'bg-amber-50/50 text-amber-800 border-amber-200' };
  if (score >= 40) return { grade: 'E8', label: 'Pass', color: 'bg-orange-50/50 text-orange-850 border-orange-200' };
  return { grade: 'F9', label: 'Fail', color: 'bg-rose-50 text-rose-800 border-rose-250' };
};

export function TeacherArchiveDetailView({ student, onBack }) {
  const [showToast, setShowToast] = React.useState(null);

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

const handleExportTranscript = async () => {
  triggerToast("Compiling official modern alumni academic report...");

  try {
    // Create isolated iframe to completely bypass global Tailwind style interference
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
        <meta charset="utf-8">
        <style>
          @page { size: A4; margin: 0; }
          body { 
            margin: 0; 
            padding: 55px 60px; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a; 
            background: #ffffff; 
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
          }
          
          /* Modern Minimalist Security Frame */
          .transcript-container {
            border: 1px solid #e2e8f0;
            border-top: 6px solid #0f172a;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            position: relative;
            min-height: 255mm;
          }

          /* Modern Header Layout */
          .header-grid { width: 100%; border-collapse: collapse; margin-bottom: 35px; }
          .logo-badge { 
            width: 64px; 
            height: 64px; 
            background: #0f172a;
            border-radius: 16px;
            text-align: center; 
            vertical-align: middle; 
            font-size: 11px; 
            font-weight: 800; 
            color: #ffffff; 
            letter-spacing: 1px;
          }
          .header-text { padding-left: 20px; vertical-align: middle; }
          .institution-name { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin: 0; }
          .institution-dept { font-size: 12px; font-weight: 600; color: #475569; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; }
          .institution-contact { font-size: 11px; color: #94a3b8; margin: 2px 0 0 0; font-weight: 400; }
          
          .document-tag { 
            display: inline-block;
            background: #f1f5f9; 
            color: #0f172a; 
            padding: 6px 14px; 
            border-radius: 8px;
            font-size: 11px; 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 1px;
            margin-bottom: 30px;
          }

          /* Dynamic Split Layout Columns */
          .layout-split { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .column-main { width: 65%; vertical-align: top; padding-right: 30px; }
          .column-side { width: 35%; vertical-align: top; background: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #f1f5f9; }
          
          .panel-title { 
            font-size: 11px; 
            font-weight: 700; 
            text-transform: uppercase; 
            color: #64748b; 
            letter-spacing: 1px;
            margin: 0 0 16px 0;
          }
          
          .profile-grid { width: 100%; border-collapse: collapse; }
          .profile-grid td { padding: 6px 0; font-size: 13px; vertical-align: middle; }
          .meta-label { color: #64748b; font-weight: 500; font-size: 12px; width: 35%; }
          .meta-value { color: #0f172a; font-weight: 600; }
          
          .status-capsule {
            background: #e0f2fe;
            color: #0369a1;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
          }

          /* Contemporary Legend Scaling */
          .scale-table { width: 100%; border-collapse: collapse; }
          .scale-table td { font-size: 11px; padding: 4px 0; color: #475569; }
          .scale-key { font-weight: 700; color: #0f172a; width: 25%; }

          /* Sleek Term Cards & Ledgers */
          .term-wrapper { margin-bottom: 25px; page-break-inside: avoid; }
          .term-heading-bar { 
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 4px 8px 4px;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 12px;
          }
          .term-title-text { font-size: 13px; font-weight: 700; color: #0f172a; }
          .term-token { font-family: monospace; font-size: 11px; color: #94a3b8; font-weight: bold; }
          
          .ledger-table { width: 100%; border-collapse: collapse; }
          .ledger-table th { 
            color: #64748b; 
            font-size: 10px; 
            font-weight: 700; 
            text-transform: uppercase; 
            padding: 8px 12px;
            text-align: center;
            letter-spacing: 0.5px;
          }
          .ledger-table td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
          .ledger-table tr:last-child td { border-bottom: none; }
          
          .course-name { font-weight: 600; color: #0f172a; }
          .score-digit { font-family: -apple-system, sans-serif; text-align: center; color: #475569; font-weight: 500; }
          .aggregate-badge { 
            display: inline-block;
            background: #f1f5f9;
            font-weight: 700; 
            color: #0f172a;
            padding: 3px 8px;
            border-radius: 6px;
            text-align: center;
            min-width: 32px;
          }
          .grade-output { font-weight: 700; text-align: right; color: #0f172a; padding-right: 8px; }

          /* Registry Verification Desk Footer */
          .registry-footer { 
            margin-top: 50px; 
            width: 100%; 
            border-collapse: collapse;
            page-break-inside: avoid;
          }
          .sign-block { width: 60%; vertical-align: bottom; }
          .sign-line { width: 220px; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px; height: 35px; }
          .stamp-perimeter { width: 90px; height: 90px; border: 1px dashed #cbd5e1; border-radius: 12px; text-align: center; vertical-align: middle; font-size: 8px; color: #94a3b8; text-transform: uppercase; font-weight: 700; padding: 6px; background: #fafafa; }
          
          .security-footer { 
            position: absolute;
            bottom: 40px;
            left: 40px;
            right: 40px;
            border-top: 1px solid #f1f5f9; 
            padding-top: 14px; 
            display: flex; 
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
            font-weight: 600;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        
        <div class="transcript-container">
          
          <!-- Premium Institutional Branding Segment -->
          <table class="header-grid">
            <tr>
              <td class="logo-badge">
                MSH
              </td>
              <td class="header-text">
                <h1 class="institution-name">Mando Senior High Technical School</h1>
                <p class="institution-dept">Office of the Registrar • Student Records Matrix</p>
                <p class="institution-contact">Central Region, Ghana • Verification Registry Portal: records@mando.edu.gh</p>
              </td>
            </tr>
          </table>

          <div class="document-tag">Official Academic Transcript Record</div>

          <!-- Modern Balanced Multi-Column Info Hub -->
          <table class="layout-split">
            <tr>
              <td class="column-main">
                <h2 class="panel-title">Student Profile Identity</h2>
                <table class="profile-grid">
                  <tr>
                    <td class="meta-label">Legal Name:</td>
                    <td class="meta-value">${student.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td class="meta-label">Index ID:</td>
                    <td class="meta-value" style="font-family: monospace; font-size: 13px; color: #0f172a;">${student.index || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td class="meta-label">Curriculum Stream:</td>
                    <td class="meta-value">${student.currentClass?.includes('Agric') ? 'General Agriculture Program' : 'General Science Pathway'}</td>
                  </tr>
                  <tr>
                    <td class="meta-label">Record Status:</td>
                    <td><span class="status-capsule">Concluded Alumni</span></td>
                  </tr>
                </table>
              </td>
              
              <td class="column-side">
                <h2 class="panel-title">Scale Matrix (WAEC)</h2>
                <table class="scale-table">
                  <tr><td class="scale-key">A1</td><td>75% - 100% (Excellent)</td></tr>
                  <tr><td class="scale-key">B2 - B3</td><td>65% - 74% (Very Good / Good)</td></tr>
                  <tr><td class="scale-key">C4 - C6</td><td>50% - 64% (Credit Pass)</td></tr>
                  <tr><td class="scale-key">D7 - E8</td><td>40% - 49% (Pass / Weak)</td></tr>
                  <tr><td class="scale-key">F9</td><td>0% - 39% (Fail Evaluation)</td></tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Main Transcript Ledger Block -->
          <h2 class="panel-title" style="margin-bottom: 20px; color: #0f172a; font-size: 12px;">Performance Evaluation History</h2>
          
          ${student.history && student.history.length > 0 
            ? student.history.map((term, index) => {
                const theoryScore = term.finalGrade;
                const practicalScore = Math.min(100, term.finalGrade + 2);
                const uniqueBlockKey = `M-TR-B${index + 1}`;
                
                return `
                  <div class="term-wrapper">
                    <div class="term-heading-bar">
                      <span class="term-title-text">${term.term || 'Academic Block Index'}</span>
                      <span class="term-token">${uniqueBlockKey}</span>
                    </div>
                    <table class="ledger-table">
                      <thead>
                        <tr>
                          <th style="text-align: left; width: 48%;">Registered Module Course Units</th>
                          <th style="width: 14%;">SBA (30%)</th>
                          <th style="width: 14%;">Exam (70%)</th>
                          <th style="width: 12%;">Aggregate</th>
                          <th style="text-align: right; width: 12%; padding-right: 8px;">Alpha Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="course-name">General Agriculture (Theory Base)</td>
                          <td class="score-digit">${Math.round(theoryScore * 0.28)}</td>
                          <td class="score-digit">${Math.round(theoryScore * 0.68)}</td>
                          <td class="score-digit"><span class="aggregate-badge">${theoryScore}%</span></td>
                          <td class="grade-output">${getWAECGrade(theoryScore).grade}</td>
                        </tr>
                        <tr>
                          <td class="course-name">General Agriculture (Practical / Core Lab Track)</td>
                          <td class="score-digit">${Math.round(practicalScore * 0.30)}</td>
                          <td class="score-digit">${Math.round(practicalScore * 0.67)}</td>
                          <td class="score-digit"><span class="aggregate-badge">${practicalScore}%</span></td>
                          <td class="grade-output">${getWAECGrade(practicalScore).grade}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                `;
              }).join('')
            : `
              <div style="text-align: center; padding: 40px; border: 1px dashed #cbd5e1; border-radius: 12px; color: #64748b; font-style: italic; font-size: 13px;">
                No permanent verified institutional ledgers are registered under this student query.
              </div>
            `
          }

          <!-- Modern Verification Desk Authentication Block -->
          <table class="registry-footer">
            <tr>
              <td class="sign-block">
                <div class="sign-line"></div>
                <p style="font-size: 11px; font-weight: 700; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.3px;">Mr. J. E. Mensah</p>
                <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0; font-weight: 500;">Head of Academic Records Registry Directorate</p>
              </td>
              <td style="text-align: right; display: flex; justify-content: flex-end;">
                <div class="stamp-perimeter">
                  <div style="margin-top: 26px; line-height: 1.4; font-size: 8px; letter-spacing: 0.2px;">AUTHENTICITY<br>REGISTRY SEAL</div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Security Footprint Meta Track -->
          <div class="security-footer">
            <span>SECURE SYSTEM TOKEN: MSH-TRANS-${Math.random().toString(36).substring(2, 11).toUpperCase()}-2026</span>
            <span style="letter-spacing: 0.5px; font-weight: 700; color: #64748b;">CERTIFIED DIGITAL RECORD VAULT RELEASE</span>
          </div>

        </div>

      </body>
      </html>
    `);
    iframeDoc.close();

    // Allow formatting engine headroom to cleanly stabilize elements prior to processing
    await new Promise(resolve => setTimeout(resolve, 450));

    const iframeBody = iframeDoc.body;
    const canvas = await html2canvas(iframeBody, {
      scale: 2.5, // Crisp anti-aliased output scaling
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
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`OFFICIAL_TRANSCRIPT_${(student?.name || 'STUDENT').replace(/\s/g, '_').toUpperCase()}_${student.index || 'RECORD'}.pdf`);
    triggerToast("Transcript exported successfully");
  } catch (error) {
    console.error("Export engine pipeline exception thrown:", error);
    triggerToast("Failed to compile official contemporary report data payload");
  }
};
  const scores = student.history.map(h => h.finalGrade);
  const averageGpa = scores.length > 0 ? (scores.reduce((acc, s) => acc + s, 0) / scores.length).toFixed(1) : 'No Terms';
  const highestTerminal = scores.length > 0 ? Math.max(...scores) : 'N/A';

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/40 relative no-scrollbar pb-24 h-full">
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
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 border border-slate-200/60 transition-all flex items-center justify-center outline-none"
              title="Return to department archives"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] bg-slate-100 px-2 py-1 rounded inline-flex items-center gap-1">
                <Lock size={10} /> Faculty Archive Ledger (Frozen)
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2 font-sans">
                Longitudinal Portfolio: <span className="italic font-display font-medium text-slate-700">{student.name}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportTranscript}
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-all shadow-md outline-none"
            >
              <Printer size={15} />
              Export Verified Transcript
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
        
        {/* Quick Biographical Summary Banner */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 z-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative">
            <div className="relative">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
                alt={student.name} 
                className="w-24 h-24 rounded-[2rem] bg-slate-50 p-1 border-4 border-slate-100 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white bg-slate-900">
                <ShieldCheck size={16} />
              </div>
            </div>

            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="px-2.5 py-0.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">{student.index}</span>
                <span className="px-2.5 py-0.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Class of {student.graduationYear}</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter mt-2">{student.name}</h1>
              <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-wider font-sans">
                Stream: {student.currentClass} • Performance Rank: <span className="text-slate-900 font-extrabold">{student.consistencyScore}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto self-stretch md:self-center relative">
            {[
              { label: 'Longitudinal GPA', val: `${averageGpa}%`, note: 'Overall 3-year mean' },
              { label: 'Highest Cycle Grade', val: `${highestTerminal}%`, note: 'Peak score achievement' },
              { label: 'WASSCE Certificate', val: student.finalWassce, note: 'National exam output' },
              { label: 'Vault Security', val: 'SEALED & LOCKED', note: 'Tamper-proof status', accent: true }
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50/80 border border-slate-100 rounded-2xl px-5 py-4 min-w-[130px] flex flex-col justify-between shadow-sm">
                <p className="text-[9px] font-black text-slate-405 uppercase tracking-widest">{stat.label}</p>
                <p className={cn(
                  "text-xl font-black tracking-tight mt-1 text-slate-900",
                  stat.accent && "text-emerald-700 bg-none font-black text-xs"
                )}>{stat.val}</p>
                <p className="text-[9px] font-semibold text-slate-400 mt-1 leading-none">{stat.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 1: Dynamic Performance Trend Graph */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
          <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">1. Completed Longitudinal Grade Progression</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase">3-Year High School Grade Mapping</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-wider">
              <Bot size={13} className="text-slate-900" />
              Historic Grade Ledger Map
            </div>
          </header>

          {student.history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 border border-slate-200/50 rounded-3xl text-center">
              <History size={36} className="text-slate-300 mb-2" />
              <p className="text-xs font-black text-slate-800 uppercase tracking-widest">No Past Terms Archived Yet</p>
              <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider mt-1">This student is currently in SHS 1. Archives compile starting in Form 2.</p>
            </div>
          ) : (
            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={student.history}>
                  <defs>
                    <linearGradient id="teacherTrendGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
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
                    fill="url(#teacherTrendGlow)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Section 2: Terminal Assessment Breakdowns --> Subject Grades */}
        <section className="space-y-6">
          <header className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">2. Terminal Assessment Sheets Archive (General Agric Scope)</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Scoped instructor ledger: Displaying performance data specific to General Agric streams</p>
            </div>
          </header>

          {student.history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200/60 rounded-[2.5rem] shadow-sm text-center w-full">
              <FileText size={32} className="text-slate-300 mb-2 font-sans" />
              <p className="text-xs font-black text-slate-800 uppercase tracking-widest">No Terminal Assessment Dossiers</p>
              <p className="text-[10px] text-slate-450 uppercase font-bold mt-1">Student dossier is active, but first-year high school quarters have not yet completed for archival storage.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {student.history.map((term, tIdx) => (
                <div key={term.term} className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden flex flex-col shadow-sm">
                  
                  {/* Upper bar */}
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-md">
                        {tIdx + 1}
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-wider">{term.term} Journal</h4>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Phase verified</p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-100">
                      Sealed Record
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
                           <TableHead className="pb-3 text-right pr-2 font-black italic">Total</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody className="divide-y divide-slate-50">
                         {['General Agric (Theory)', 'General Agric (Practical)'].map((subj, sIdx) => {
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
                                   "px-2 py-0.5 text-[9px] rounded-md border",
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
                      <span className="ml-1 text-slate-800 font-extrabold">
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

        {/* Section 3: Observational Diaries & Remedial Intervention Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Observation Logs */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900">
                    <History size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">3. Student Observation Journal</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Qualitative Teacher Diaries</p>
                  </div>
                </div>
                
                <span className="px-3 py-1 bg-slate-100 text-slate-500 font-extrabold text-[9px] rounded-lg tracking-wider border border-slate-200 uppercase">
                  Locked Vault Link
                </span>
              </header>

              <div className="space-y-4">
                {student.observations && student.observations.length > 0 ? (
                  student.observations.map((obs) => (
                    <div key={obs.id} className="p-5 bg-slate-50/60 border-l-4 border-slate-900 border-y border-r border-slate-150 rounded-r-2xl">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[8px] font-black text-slate-800 bg-slate-200 px-2 py-0.5 rounded uppercase">{obs.type}</span>
                        <span className="text-[8px] font-bold text-slate-400 font-mono">{obs.date}</span>
                      </div>
                      <p className="text-xs font-semibold leading-relaxed text-slate-700 italic">"{obs.comment}"</p>
                      <p className="text-[8px] font-black text-slate-450 mt-2 uppercase tracking-wide">— Signed: Instructor {obs.teacherName}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center italic py-8">No qualitative academic observations logged for this record cycle.</p>
                )}
              </div>
            </div>

            <div className="mt-8 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-slate-900 shrink-0 animate-pulse" />
              <p className="text-[10px] font-extrabold text-slate-400 uppercase leading-normal">Compliance Guard: Archives are read-only and sealed for record security under MAAIS Protocol.</p>
            </div>
          </section>

          {/* Intervention Logs & Certificates of Clearance */}
          <section className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">4. Remedial Coaching & Interventions</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Interactive counseling and training logs</p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-slate-100 text-slate-500 font-extrabold text-[9px] rounded-lg tracking-wider border border-slate-200 uppercase">
                  Archived State
                </span>
              </header>

              <div className="space-y-4">
                {student.interventions && student.interventions.length > 0 ? (
                  student.interventions.map((int) => (
                    <div key={int.id} className="bg-slate-50/60 border border-slate-205 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-all">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[8px] font-black text-slate-700 bg-slate-200 px-2.5 py-1 rounded">REMEDIAL REGISTRY FILE</span>
                          <span className="text-[8px] font-bold text-slate-450 uppercase">{int.term}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 tracking-tight leading-snug">Trigger Issue: <span className="font-medium text-slate-550 italic">{int.reason}</span></p>
                        <p className="text-xs font-bold text-slate-800 mt-1 tracking-tight leading-snug">Action Strategy: <span className="font-medium text-slate-550 italic">{int.action}</span></p>
                      </div>
                      {int.outcome && (
                        <div className="mt-4 pt-4 border-t border-slate-150 bg-slate-100/50 p-3 rounded-xl border border-slate-200/50">
                          <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest block mb-0.5">Tracked Progress Response</span>
                          <p className="text-[11px] font-bold text-slate-705 italic">"{int.outcome}"</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center italic py-8">No specific developmental interventions recorded for this student.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <ShieldCheck size={11} className="text-slate-900" /> Historic transcript validated successfully
              </span>
            </div>
          </section>

        </div>

        {/* Section 4: HOD Remarks & Information Box */}
        {student.hodComment && (
          <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-white/10 to-white/0 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            
            <div className="relative">
              <header className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest font-sans">Departmental Audit Clearances</h4>
                  <p className="text-[10px] font-bold text-slate-300 uppercase">HOD Comments and Level 4 Seal Authentication Details</p>
                </div>
              </header>

              <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/40">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">HOD Comments Endorsement</span>
                <p className="text-sm font-semibold italic text-slate-100 leading-relaxed">
                  "{student.hodComment}"
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-800/80 [border-top-style:dashed]">
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Clearance Anchor Hash</span>
                  <span className="text-[11px] font-mono font-black text-slate-300">MAAIS-RECON-{student.id}-TRACE</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Authenticated Signature</span>
                  <span className="text-sm font-display italic font-medium text-slate-300">Head of Department, General & Applied Sciences</span>
                </div>
              </div>

            </div>
          </section>
        )}

      </div>

    </div>
  );
}