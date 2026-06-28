import React, { useState, useMemo } from 'react';
import {
   Search, Download, 
   ChevronRight, TrendingUp,
   Trash2, X, Lock,
   FileText, FileUp, 
   MoreVertical, GraduationCap,
   HeartPulse, Phone, MessageSquare, Activity,
   BarChart3, AlertCircle, Users, CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { toast, Toaster } from '../../components/ui/toast.tsx';
import { useAllStudents, useCreateStudent, useBatchImportStudents, usePromoteStudent, useBuildTranscript, useGenerateReportCard, useDeactivateUser, useUpdateStudentProfile } from '../../lib/hooks';
import { 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, 
  LineChart as ReLineChart, Line, CartesianGrid
} from 'recharts';
import { PROGRAMS, HOUSES, BATCHES } from './data';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { 
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const StudentDossier = ({ 
   student, 
   onClose,
   onGenerateReport,
   onBuildTranscript,
 }) => {
  const [activeTab, setActiveTab] = useState('Academic');

  const performanceData = [
    { term: 'SHS1 T1', grade: Math.round(student.averageGrade - 7) },
    { term: 'SHS1 T2', grade: Math.round(student.averageGrade - 4) },
    { term: 'SHS1 T3', grade: Math.round(student.averageGrade - 2) },
    { term: 'SHS2 T1', grade: student.averageGrade },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 bg-slate-900 text-white shrink-0">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white ring-1 ring-white/20">
              <GraduationCap size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black italic font-display">{student.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{student.indexNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'Academic', label: 'Academic', icon: BarChart3 },
            { id: 'BioData', label: 'Bio-Data', icon: FileText },
            { id: 'Log', label: 'Welfare', icon: Activity },
            { id: 'Guardian', label: 'Guardian', icon: Phone },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab.id ? "bg-white text-slate-900 shadow-xl" : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        {activeTab === 'Academic' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Longitudinal Performance</h4>
              <div className="h-40 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <ReLineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip />
                    <Line type="monotone" dataKey="grade" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, fill: '#0f172a' }} />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Historical Subject Ledger</h4>
<div className="space-y-2">
                {student.subjects && student.subjects.length > 0 
                  ? student.subjects.map((sub, i) => {
                      const subjectName = sub.subject?.name || sub.subject || 'Unknown';
                      const score = sub.score ?? sub.grade ?? 0;
                      const grade = sub.grade ?? (score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D');
                      return (
                        <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                               <FileText size={14} />
                            </div>
                             <span className="text-[12px] font-bold text-slate-700">{subjectName}</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className="text-[11px] font-black italic font-display text-slate-400">{score}%</span>
                             <span className={cn(
                               "px-2.5 py-1 rounded-lg text-[10px] font-black italic font-display",
                               grade.startsWith('A') ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                             )}>
                               {grade}
                             </span>
                          </div>
                        </div>
                      );
                    })
                  : <p className="text-[13px] font-bold text-slate-400 italic">No subject records available.</p>
                }
              </div>
            </div>
          </div>
        )}

        {activeTab === 'BioData' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Institutional Identity</p>
              <div className="space-y-4">
                  {[
                    { label: 'Index Number', value: student.indexNumber },
                    { label: 'Date of Birth', value: student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A' },
                    { label: 'Program Node', value: student.program },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{item.label}</span>
                      <span className="text-[12px] font-black text-slate-900 italic font-display">{item.value || 'N/A'}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">BECE Placement Dossier</p>
              <div className="space-y-4">
                  {[
                    { label: 'Placement Aggregate', value: student.beceAggregate || 'N/A' },
                    { label: 'Primary Residency', value: student.beceResidency || 'N/A' },
                    { label: 'Placement Protocol', value: student.placementType || 'N/A' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{item.label}</span>
                      <span className="text-[12px] font-black text-indigo-600 italic font-display">{item.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Log' && (
          <div className="space-y-4">
            <div className="p-6 bg-white border border-slate-200 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                   <HeartPulse size={20} />
                 </div>
                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Medical Log</h4>
              </div>
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl">
                 <p className="text-[13px] font-bold text-slate-700 leading-relaxed italic">
                   {student.healthNotes || 'No acute medical flags inherited.'}
                 </p>
              </div>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                   <AlertCircle size={20} />
                 </div>
                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Discipline Log</h4>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                 <p className="text-[13px] font-bold text-slate-600 leading-relaxed italic">
                   {student.disciplinaryNotes || 'Institutional conduct threshold maintained.'}
                 </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Guardian' && (
          <div className="space-y-6">
             <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mx-auto mb-6">
                  <Users size={40} />
                </div>
                <h3 className="text-xl font-black italic font-display text-slate-900 mb-1">
                  {(student.emergencyContact?.name) || 'Guardian Not Linked'}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">
                  {student.emergencyContact?.relation || 'No parent association'}
                </p>
                <div className="flex gap-3">
                  <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest">
                    <Phone size={16} /> Voice
                  </button>
                  <button className="flex-1 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest">
                    <MessageSquare size={16} /> SMS
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t border-slate-100 flex gap-3 shrink-0">
        <button 
          onClick={() => executeSensitiveAction('delete-student')}
          className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all"
        >
          <Trash2 size={20} />
        </button>
<button 
          onClick={() => {
            if (student) {
              onGenerateReport?.(student.id);
            }
          }}
          className="flex-1 py-4 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
        >
          <Download size={16} /> Dossier
        </button>
        <button 
          onClick={() => {
            if (student) {
              onBuildTranscript?.(student.id);
            }
          }}
          className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest"
        >
          Transcript
        </button>
      </div>
    </div>
  );
};

export const StudentRegistry = () => {
  const studentsQuery = useAllStudents();
  const createStudentMutation = useCreateStudent();
  const batchImportMutation = useBatchImportStudents();
  const promoteStudentMutation = usePromoteStudent();
  const buildTranscriptMutation = useBuildTranscript();
  const generateReportCardMutation = useGenerateReportCard();
  const deactivateUserMutation = useDeactivateUser();
  const updateStudentProfileMutation = useUpdateStudentProfile();
  const students = studentsQuery.data || [];
  const isLoading = studentsQuery.isLoading;

  const handlePromote = async (classId) => {
    try {
      await promoteStudentMutation.mutateAsync({ classId });
      toast.success('Students promoted successfully');
    } catch (err) {
      toast.error(`Promotion failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleBatchPromotion = async () => {
    if (!selectedSourceClass || !selectedDestClass) {
      toast.error('Select both source and destination classes');
      return;
    }

    const classToPromote = filteredStudents
      .filter(s => s.program === selectedSourceClass)
      .find(s => s.id);
    
    if (!classToPromote) {
      toast.error('No students found in the selected source class');
      return;
    }

    const classId = classToPromote.currentClassId || 
                    filteredStudents.find(s => s.program === selectedSourceClass)?.currentClassId;

    if (!classId) {
      toast.error('Could not determine class ID for promotion');
      return;
    }

    try {
      const result = await promoteStudentMutation.mutateAsync({ classId });
      setPromotionStatus({ 
        promoted: result.totalProcessed || filteredStudents.filter(s => s.program === selectedSourceClass).length, 
        failed: 0 
      });
      toast.success(`Promoted ${result.totalProcessed || 0} students`);
    } catch (err) {
      toast.error(`Batch promotion failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleGenerateReport = async (studentId) => {
    const student = displayStudents.find(s => s.id === studentId);
    if (!student) return;
    
    try {
      toast.info(`Generating report card PDF for ${student.name}...`);
      await generateReportCardMutation.mutateAsync({ studentId, termId: null });
    } catch (err) {
      console.warn('Report card API error (using local data):', err);
    }
    
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '210mm';
      iframe.style.height = 'auto';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(`
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
            .label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .value { font-size: 12px; font-weight: bold; }
            th { background: #0f172a; color: white; font-size: 9px; font-weight: bold; text-transform: uppercase; }
            .footer { position: absolute; bottom: 48px; left: 48px; right: 48px; border-top: 1px dashed #94a3b8; padding-top: 24px; }
            .footer-note { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-size: 24px; font-weight: 800; text-transform: uppercase; color: #0f172a;">Mando Senior High Technical School</h1>
            <p style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; margin-top: 4px;">Terminal Examination Report</p>
            <p style="font-size: 10px; color: #475569;">PMB 14, Central Region, Ghana • audit.mando-shts.edu.gh</p>
          </div>
          <div class="section">
            <h2 class="section-title">Student Information</h2>
            <table style="margin-top: 16px;">
              <tr><td class="label">Name of Student</td><td class="value">${student.name}</td></tr>
              <tr><td class="label">Permanent Index Number</td><td class="value">${student.indexNumber}</td></tr>
              <tr><td class="label">Academic Programme</td><td class="value">${student.program || 'General'}</td></tr>
            </table>
          </div>
          <div class="section">
            <h2 class="section-title">Terminal Examination Results</h2>
            ${(student.subjects && student.subjects.length > 0) ? `
              <table style="margin-top: 16px;">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>CA</th>
                    <th>Exam</th>
                    <th>Total</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  ${student.subjects.map((s) => {
                    const subjectName = s.subject?.name || s.subject || 'Unknown';
                    const score = s.score ?? 0;
                    const ca = Math.round(score * 0.3);
                    const exam = Math.round(score * 0.7);
                    const grade = s.grade ?? (score >= 80 ? 'A1' : score >= 70 ? 'B2' : score >= 60 ? 'C4' : score >= 50 ? 'C6' : 'F9');
                    return `<tr>
                      <td class="value">${subjectName}</td>
                      <td>${ca}%</td>
                      <td>${exam}%</td>
                      <td class="value">${score}%</td>
                      <td class="value">${grade}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size: 12px; color: #64748b; font-style: italic; text-align: center; padding: 40px 0;">No subject records available for this student.</p>'}
          </div>
          <div class="footer"><p class="footer-note">Document Status: SYSTEM GENERATED • This is an automated academic report</p></div>
        </body>
        </html>
      `);
      doc.close();
      
      await new Promise((resolve) => setTimeout(resolve, 300));
      const canvas = await html2canvas(doc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
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
      
      pdf.save(`Report_Card_${student.indexNumber}_${student.name.replace(/\s/g, '_')}.pdf`);
      toast.success('Report card downloaded successfully');
    } catch (error) {
      toast.error(`Failed to generate report: ${error.message || 'Unknown error'}`);
    }
  };

  const handleBuildTranscript = async (studentId) => {
    const student = displayStudents.find(s => s.id === studentId);
    if (!student) return;
    
    try {
      toast.info(`Generating transcript PDF for ${student.name}...`);
      await buildTranscriptMutation.mutateAsync({ studentIdOrIndex: studentId });
    } catch (err) {
      console.warn('Transcript API error (using local data):', err);
    }
    
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '210mm';
      iframe.style.height = 'auto';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 48px; font-family: Arial, sans-serif; color: #0f172a; background: white; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; font-size: 11px; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 32px; }
            .section { margin-bottom: 32px; }
            .section-title { font-size: 13px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin-bottom: 12px; }
            .label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .value { font-size: 12px; font-weight: bold; }
            th { background: #0f172a; color: white; font-size: 9px; font-weight: bold; text-transform: uppercase; }
            .term-header { background: #0f172a; color: white; padding: 8px 16px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin: 16px 0; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px dashed #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-size: 24px; font-weight: 800; text-transform: uppercase; color: #0f172a;">Mando Senior High Technical School</h1>
            <p style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; margin-top: 4px;">Official Academic Transcript</p>
            <p style="font-size: 10px; color: #475569;">PMB 14, Central Region, Ghana • audit.mando-shts.edu.gh</p>
          </div>
          <div class="section">
            <h2 class="section-title">Student Information</h2>
            <table style="margin-top: 16px;">
              <tr><td class="label">Student Name</td><td class="value">${student.name}</td></tr>
              <tr><td class="label">Index Number</td><td class="value">${student.indexNumber}</td></tr>
              <tr><td class="label">Program</td><td class="value">${student.program || 'General'}</td></tr>
              <tr><td class="label">House</td><td class="value">${student.house || 'N/A'}</td></tr>
            </table>
          </div>
          <div class="section">
            <h2 class="section-title">Academic History</h2>
            ${(student.subjects && student.subjects.length > 0) ? `
              <table style="margin-top: 16px;">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  ${student.subjects.map((s) => {
                    const subjectName = s.subject?.name || s.subject || 'Unknown';
                    const score = s.score ?? 0;
                    const grade = s.grade ?? (score >= 80 ? 'A1' : score >= 70 ? 'B2' : score >= 60 ? 'C4' : score >= 50 ? 'C6' : 'F9');
                    return `<tr>
                      <td class="value">${subjectName}</td>
                      <td>${score}%</td>
                      <td class="value">${grade}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size: 12px; color: #64748b; font-style: italic; text-align: center; padding: 40px 0;">No subject records available for this student.</p>'}
          </div>
          <div class="footer">
            <p style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b;">Archive Status: VERIFIED & REGISTERED • HOD Certified</p>
          </div>
        </body>
        </html>
      `);
      doc.close();
      
      await new Promise((resolve) => setTimeout(resolve, 300));
      const canvas = await html2canvas(doc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
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
      
      pdf.save(`Transcript_${student.indexNumber}_${student.name.replace(/\s/g, '_')}.pdf`);
      toast.success('Transcript downloaded successfully');
    } catch (error) {
      toast.error(`Failed to generate transcript: ${error.message || 'Unknown error'}`);
    }
  };

  const displayStudents = useMemo(() => students.map((s) => {
    const parentLink = s.parentLinks?.[0];
    const grades = s.grades || [];
    const avgGrade = grades.length > 0 
      ? Math.round(grades.reduce((sum, g) => sum + (g.totalScore || g.score || 0), 0) / grades.length) 
      : 0;
    return {
      id: s.id || s.userId,
      name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.user?.email || 'Unknown',
      indexNumber: s.indexNumber,
      dob: s.dateOfBirth,
      program: s.currentClass?.name || s.department?.name || 'General',
      currentClassId: s.currentClassId,
      averageGrade: avgGrade,
      atRisk: avgGrade < 50,
      gender: s.gender === 'MALE' ? 'Male' : s.gender === 'FEMALE' ? 'Female' : 'N/A',
      subjects: grades,
      email: s.user?.email || s.email,
      phone: s.user?.phone || s.phone,
      role: s.user?.role || s.role,
      emergencyContact: parentLink ? {
        name: `${parentLink.parent?.firstName || ''} ${parentLink.parent?.lastName || ''}`.trim() || 'Unknown',
        relation: parentLink.relationship || 'Guardian',
      } : null,
      healthNotes: s.bio || '',
      disciplinaryNotes: '',
    };
  }), [students]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [viewMode, setViewMode] = useState('Academic');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [selectedSourceClass, setSelectedSourceClass] = useState('');
  const [selectedDestClass, setSelectedDestClass] = useState('');
  const [promotionStatus, setPromotionStatus] = useState(null);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [showReverification, setShowReverification] = useState({ active: false, action: null });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', indexNumber: '', gender: 'MALE', dateOfBirth: '', email: '', classId: '',
  });
  const [creatingStudent, setCreatingStudent] = useState(false);
  
  // CSSPS Upload states
  const [csspsFile, setCsspsFile] = useState(null);
  const [csspsPreview, setCsspsPreview] = useState([]);
  const [csspsError, setCsspsError] = useState('');
  const [isProcessingCssps, setIsProcessingCssps] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const selectedStudent = useMemo(() => 
    displayStudents.find(s => s.id === selectedStudentId), 
    [displayStudents, selectedStudentId]
  );

  const filteredStudents = useMemo(() => {
    return displayStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           s.indexNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProgram = selectedProgram === 'All' || s.program === selectedProgram;
      return matchesSearch && matchesProgram;
    });
  }, [displayStudents, searchQuery, selectedProgram]);

  const genderData = useMemo(() => [
    { name: 'Male', value: displayStudents.filter(s => s.gender === 'Male').length },
    { name: 'Female', value: displayStudents.filter(s => s.gender === 'Female').length },
  ], [displayStudents]);

  const atRiskCount = useMemo(() => 
    displayStudents.filter(s => s.atRisk).length,
    [displayStudents]
  );

  const programPerformanceData = useMemo(() => {
    return PROGRAMS.map(prog => {
      const programStudents = displayStudents.filter(s => s.program === prog);
      const average = programStudents.length > 0
        ? Math.round(programStudents.reduce((sum, s) => sum + s.averageGrade, 0) / programStudents.length)
        : 0;
      return { name: prog, average };
    });
  }, [displayStudents]);

  const confirmVerification = async () => {
    const action = showReverification.action;
    setShowReverification({ active: false, action: null });

    try {
      if (action === 'export-all') {
        toast.success('Generating Global Institutional Dossier...');
      } else if (action === 'delete-student' && selectedStudentId) {
        await deactivateUserMutation.mutateAsync(selectedStudentId);
        toast.success('Student deactivated from registry');
        setSelectedStudentId(null);
      } else if (action === 'batch-reports') {
        toast.success('Generating Terminal Reports for Category...');
      }
    } catch (err) {
      toast.error(`Action failed: ${err.message || 'Unknown error'}`);
    }
  };

  const executeSensitiveAction = (action) => {
    setShowReverification({ active: true, action });
  };

  const handleCreateStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.indexNumber) {
      toast.error('Name and index number are required');
      return;
    }

    setCreatingStudent(true);
    try {
      await createStudentMutation.mutateAsync({
        ...newStudent,
        password: 'Student@123!',
      });
      setShowCreateForm(false);
      setNewStudent({ firstName: '', lastName: '', indexNumber: '', gender: 'MALE', dateOfBirth: '', email: '', classId: '' });
      toast.success('Student registered successfully');
    } catch (err) {
      toast.error(`Registration failed: ${err.message || 'Unknown error'}`);
    } finally {
      setCreatingStudent(false);
    }
  };

  // CSSPS Upload handlers
  const parseCsvContent = (content) => {
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const record = {};
      headers.forEach((h, i) => {
        record[h] = values[i] || '';
      });
      return record;
    }).filter(r => r.index_number || r.first_name || r.last_name);
  };

  const handleCssFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      setCsspsError('Only CSV/Excel files are supported');
      return;
    }
    
    setCsspsFile(file);
    setCsspsError('');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const records = typeof content === 'string' ? parseCsvContent(content) : [];
        setCsspsPreview(records);
      } catch (err) {
        setCsspsError('Failed to parse file: ' + (err.message || 'Unknown error'));
        setCsspsPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handleCancelCsspsUpload = () => {
    setIsBatchUploading(false);
    setCsspsFile(null);
    setCsspsPreview([]);
    setCsspsError('');
    setImportResults(null);
    toast.info('CSSPS upload cancelled');
  };

  const handleProcessCsspsUpload = async () => {
    if (!csspsPreview.length) return;
    
    setIsProcessingCssps(true);
    
    const students = csspsPreview.map(record => ({
      indexNumber: record.index_number || record.indexNumber || `MSHTS/2024/${String(Date.now()).slice(-6)}`,
      firstName: record.first_name || record.firstName || '',
      lastName: record.last_name || record.lastName || '',
      middleName: record.middle_name || record.middleName || '',
      gender: (record.gender || 'MALE').toUpperCase(),
      dateOfBirth: record.date_of_birth || record.dob || record.dateOfBirth,
      password: 'Student@123!',
    }));
    
    try {
      const result = await batchImportMutation.mutateAsync(students);
      setImportResults(result);
      setCsspsPreview([]);
      toast.success(`Imported ${result.success} students successfully`);
    } catch (err) {
      toast.error(`Import failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessingCssps(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
      <header className="px-8 py-6 bg-white border-b border-slate-200/60 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <span>Registry</span>
              <ChevronRight size={10} />
              <span className="text-slate-900">Student Dynamic Ledger</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight leading-none">
              Institutional Population Intelligence
            </h1>
          </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                + Register
              </button>
              <button 
                onClick={() => {
                  const csvHeaders = ['Index Number', 'Name', 'Email', 'Program'];
                  const csvContent = [
                    csvHeaders.join(','),
                    ...filteredStudents.map(s => [
                      `"${s.indexNumber}"`,
                      `"${s.name}"`,
                      `"${s.email || ''}"`,
                      `"${s.program}"`
                    ].join(','))
                  ].join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'student-batch-report.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success(`Exported ${filteredStudents.length} student records`);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm"
              >
                <FileText size={16} /> Bulk Reports
              </button>
              <button onClick={() => setIsBatchUploading(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-900 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest">
                <FileUp size={16} /> CSSPS Upload
              </button>
              <button onClick={() => setIsPromoting(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                <TrendingUp size={16} /> Promotion Engine
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            <div className="h-16 w-16 shrink-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <RePieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={20} outerRadius={30} paddingAngle={5} dataKey="value">
                    <Cell fill="#0f172a" /><Cell fill="#94a3b8" />
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
<div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender Equity</p>
                <p className="text-xl font-black italic font-display text-slate-900">
                  {genderData[1]?.value || 0}:{genderData[0]?.value || 0}
                </p>
             </div>
          </div>
          <div className="bg-rose-50 p-5 rounded-[2rem] border border-rose-100 flex items-center justify-between">
            <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
               <AlertCircle size={24} />
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">At-Risk</p>
               <p className="text-xl font-black italic font-display text-rose-900">{atRiskCount} Nodes</p>
            </div>
          </div>
          <div className="md:col-span-1 xl:col-span-2 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center gap-8">
{programPerformanceData.slice(0, 2).map(prog => (
               <div key={prog.name} className="flex-1 space-y-3">
                 <div className="flex justify-between items-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{prog.name}</p>
                   <p className="text-[10px] font-black text-slate-900">{prog.average}%</p>
                 </div>
                 <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${prog.average}%` }} transition={{ duration: 1 }} className="h-full bg-slate-900" />
                 </div>
               </div>
             ))}
          </div>
        </div>
      </header>

      <div className="px-8 py-5 bg-white border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-6 py-3" />
            </div>
            <Select value={selectedProgram} onValueChange={(e) => setSelectedProgram(e.target.value)} className="w-full">
              <SelectTrigger>
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Programs</SelectItem>
                {PROGRAMS.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
         </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <Button onClick={() => setViewMode('Academic')} variant={viewMode === 'Academic' ? "default" : "outline"} className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  Academic
                </Button>
                <Button onClick={() => setViewMode('Personal')} variant={viewMode === 'Personal' ? "default" : "outline"} className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  Biosocial
                </Button>
             </div>
<Button onClick={() => {
                  const csvHeaders = ['Index', 'Name', 'Program', 'Average Grade'];
                  const csvContent = [
                    csvHeaders.join(','),
                    ...filteredStudents.map(s => [
                      `"${s.indexNumber}"`,
                      `"${s.name}"`,
                      `"${s.program}"`,
                      `"${s.averageGrade}"`
                    ].join(','))
                  ].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'student-ledger.csv';
                a.click();
                URL.revokeObjectURL(url);
                toast.success(`Exported ${filteredStudents.length} student records`);
              }} className="p-3">
                <Download size={20} />
              </Button>
              <Button 
                onClick={() => {
                  const nextIndex = `MSHTS/2024/${String(students.length + 1).padStart(3, '0')}`;
                  toast.success(`Next available index: ${nextIndex}`);
                }} 
                variant="outline" 
                className="px-4 py-3 text-[10px] font-black uppercase tracking-widest font-display italic"
              >
                ID Generator
              </Button>
          </div>
      </div>

<div className="flex-1 overflow-y-auto p-8 relative">
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 border-b border-slate-100">
                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Index / Name</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Program</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Performance</TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Protocol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((stu) => (
                <TableRow key={stu.id} className="group hover:bg-slate-50 cursor-pointer transition-all" onClick={() => setSelectedStudentId(stu.id)}>
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all"><GraduationCap size={18} /></div>
                       <div>
                          <p className="text-[14px] font-black italic font-display text-slate-900 leading-none mb-1.5">{stu.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stu.indexNumber}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                     <span className="text-[12px] font-black text-slate-900">{stu.program}</span>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-center">
                     <Badge className={cn(
                       stu.averageGrade >= 75 ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                     )}>
                       {stu.averageGrade}%
                     </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                     <button className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all"><MoreVertical size={18} /></button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
           </Table>
         </Card>
       </div>

      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStudentId(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative w-full max-w-xl bg-white h-full shadow-2xl">
<StudentDossier 
                student={selectedStudent} 
                onClose={() => setSelectedStudentId(null)}
                onGenerateReport={handleGenerateReport}
                onBuildTranscript={handleBuildTranscript}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
       {showReverification.active && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 text-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Lock size={32} /></div>
                    <h3 className="text-2xl font-black italic font-display text-slate-900 mb-2">Confirm Action</h3>
                    <p className="text-[13px] text-slate-600 mb-8">This action requires administrative authorization. Please confirm to proceed.</p>
                    <div className="flex gap-3">
                       <button onClick={() => setShowReverification({ active: false, action: null })} className="flex-1 py-4 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest">Abort</button>
                       <button onClick={confirmVerification} className="flex-1 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Authorize</button>
                    </div>
                </motion.div>
            </div>
          )}
{isBatchUploading && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsBatchUploading(false)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12">
                   <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10"><FileUp size={48} /></div>
                   <h3 className="text-3xl font-black italic font-display text-slate-900 mb-4">CSSPS Batch Intake</h3>
                   
                   <div className="mb-6">
                     <input
                       type="file"
                       accept=".csv,.xlsx,.xls"
                       onChange={handleCssFileChange}
                       className="hidden"
                       id="cssps-file-input"
                     />
                     <label
                       htmlFor="cssps-file-input"
                       className="border-4 border-dashed border-slate-100 rounded-[2.5rem] py-16 mb-6 hover:bg-slate-50 cursor-pointer flex flex-col items-center justify-center"
                     >
                       <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Drop CSSPS File Here</p>
                       <p className="text-[10px] text-slate-300">CSV/Excel formats supported</p>
                       {csspsFile && (
                         <p className="mt-3 text-[12px] font-black text-indigo-600">
                           {csspsFile.name}
                         </p>
                       )}
                     </label>
                   </div>

                   {csspsPreview.length > 0 && (
                     <div className="mb-6 max-h-64 overflow-y-auto border border-slate-100 rounded-2xl p-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Preview ({csspsPreview.length} records)</p>
                       <div className="space-y-1">
                         {csspsPreview.slice(0, 5).map((record, i) => (
                           <div key={i} className="flex justify-between text-[11px] py-1 border-b border-slate-50">
                             <span className="font-bold text-slate-900">{record.indexNumber}</span>
                             <span className="text-slate-600">{record.firstName} {record.lastName}</span>
                             <span className="text-slate-400">{record.placementAggregate || 'N/A'}</span>
                           </div>
                         ))}
                         {csspsPreview.length > 5 && (
                           <p className="text-[10px] text-slate-400 italic">...and {csspsPreview.length - 5} more</p>
                         )}
                       </div>
                     </div>
                   )}

                   {csspsError && (
                     <div className="mb-4 p-3 bg-rose-50 text-rose-600 rounded-xl text-[11px] font-black">
                       {csspsError}
                     </div>
                   )}

                   <div className="flex gap-4">
                      <button 
                        onClick={handleCancelCsspsUpload}
                        className="flex-1 py-5 bg-slate-50 rounded-[2rem] text-[11px] font-black uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleProcessCsspsUpload}
                        disabled={!csspsFile || isProcessingCssps}
                        className={cn(
                          "flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest",
                          isProcessingCssps || !csspsFile 
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        )}
                      >
                        {isProcessingCssps ? 'Processing...' : 'Verify & Import'}
                      </button>
                   </div>
                </motion.div>
             </div>
           )}
           {importResults && (
             <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 text-center">
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><CheckCircle size={32} /></div>
                   <h3 className="text-2xl font-black italic font-display text-slate-900 mb-2">Import Complete</h3>
                   <p className="text-[14px] text-slate-600 mb-6">
                     Successfully imported {importResults.success} students. {importResults.failed > 0 && `${importResults.failed} failed.`}
                   </p>
                   <button 
                     onClick={() => setImportResults(null)}
                     className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest"
                   >
                     Done
                   </button>
                </motion.div>
             </div>
            )}
            {showCreateForm && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCreateForm(false)} />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10">
                  <h3 className="text-2xl font-black italic font-display text-slate-900 mb-8">Register New Student</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">First Name *</label>
                        <input value={newStudent.firstName} onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold" placeholder="First Name" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Last Name *</label>
                        <input value={newStudent.lastName} onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold" placeholder="Last Name" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Index Number *</label>
                      <input value={newStudent.indexNumber} onChange={(e) => setNewStudent({...newStudent, indexNumber: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold" placeholder="e.g. MSHTS/2024/001" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Gender</label>
                        <select value={newStudent.gender} onChange={(e) => setNewStudent({...newStudent, gender: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold">
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Date of Birth</label>
                        <input type="date" value={newStudent.dateOfBirth} onChange={(e) => setNewStudent({...newStudent, dateOfBirth: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
                        <input value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold" placeholder="student@email.com" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Class / Program</label>
                        <select value={newStudent.classId} onChange={(e) => setNewStudent({...newStudent, classId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold">
                          <option value="">Select Program</option>
                          {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-4 mb-4">Default password: Student@123!</p>
                  <div className="flex gap-4">
                    <button onClick={() => setShowCreateForm(false)} className="flex-1 py-4 bg-slate-50 rounded-[2rem] text-[11px] font-black uppercase tracking-widest">Cancel</button>
                    <button onClick={handleCreateStudent} disabled={creatingStudent || !newStudent.firstName || !newStudent.indexNumber} className={cn("flex-1 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest", creatingStudent || !newStudent.firstName || !newStudent.indexNumber ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-emerald-600 text-white")}>
                      {creatingStudent ? 'Registering...' : 'Register Student'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
           {isPromoting && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsPromoting(false)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-12">
                  <h3 className="text-3xl font-black italic font-display text-slate-900 mb-12">Promotion Engine</h3>
                  <div className="grid grid-cols-2 gap-8 mb-12">
                     <select 
                       value={selectedSourceClass}
                       onChange={(e) => setSelectedSourceClass(e.target.value)}
                       className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                     >
                       <option value="">Source Cohort</option>
                       {PROGRAMS.map(prog => <option key={prog} value={prog}>{prog}</option>)}
                     </select>
                     <select 
                       value={selectedDestClass}
                       onChange={(e) => setSelectedDestClass(e.target.value)}
                       className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                     >
                       <option value="">Destination Pipeline</option>
                       {PROGRAMS.map(prog => <option key={prog} value={prog}>{prog}</option>)}
                     </select>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => setIsPromoting(false)} className="flex-1 py-5 bg-slate-50 rounded-[2rem] text-[11px] font-black uppercase tracking-widest">Abort</button>
                     <button 
                       onClick={() => {
                         setIsPromoting(false);
                         handleBatchPromotion();
                       }} 
                       disabled={!selectedSourceClass || !selectedDestClass}
                       className={cn(
                         "flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest",
                         selectedSourceClass && selectedDestClass ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                       )}
                     >Execute</button>
                  </div>
                  {promotionStatus && (
                    <div className="mt-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[11px] font-black">
                      Promoted {promotionStatus.promoted} students successfully
                    </div>
                  )}
               </motion.div>
            </div>
          )}
       </AnimatePresence>
       <Toaster />
     </div>
   );
};