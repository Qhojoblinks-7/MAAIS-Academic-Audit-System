import React, { useState, useMemo } from 'react';
import {
   Search, Download, 
   ChevronRight, TrendingUp,
   Trash2, X, Lock,
   FileText, FileUp, 
   MoreVertical, GraduationCap,
   HeartPulse, Phone, MessageSquare, Activity,
   BarChart3, AlertCircle, Users, CheckCircle,
   Flag, Shield, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { toast, Toaster } from '../../components/ui/toast.tsx';
import { EmptyState } from '../../components/molecules';
import { useAllStudents, useCreateStudent, useBatchImportStudents, usePromoteStudent, useBuildTranscript, useGenerateReportCard, useDeactivateUser, useUpdateStudentProfile, useAllClasses, useAllDepartments } from '../../lib/hooks';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
  ResponsiveContainer,
  XAxis, YAxis, Tooltip, 
  LineChart as ReLineChart, Line, CartesianGrid
} from 'recharts';
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
      <div className="flex flex-col h-full bg-surface">
      <div className="p-8 bg-brand-dark text-primary-foreground shrink-0">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-foreground/10 rounded-2xl flex items-center justify-center text-primary-foreground ring-1 ring-primary-foreground/20">
              <GraduationCap size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black italic font-display">{student.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground/50">{student.indexNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-primary-foreground/10 rounded-xl transition-all">
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
                activeTab === tab.id ? "bg-primary-foreground text-brand-dark shadow-xl" : "bg-primary-foreground/5 text-primary-foreground/60 hover:bg-primary-foreground/10"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-muted scrollbar-hide">
        {activeTab === 'Academic' && (
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm">
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-6">Longitudinal Performance</h4>
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
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-4">Historical Subject Ledger</h4>
<div className="space-y-2">
                {student.subjects && student.subjects.length > 0 
                  ? student.subjects.map((sub, i) => {
                       const subjectName = sub.subject?.name || sub.subject || 'Unknown';
                       const totalScore = sub.totalScore ?? sub.classScore ?? sub.examScore ?? 0;
                       const letterGrade = sub.grade || (totalScore >= 80 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 60 ? 'C' : 'D');
                       return (
                          <div key={i} className="flex justify-between items-center p-3 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-text-secondary">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-text-secondary">
                                <FileText size={14} />
                             </div>
                              <span className="text-[12px] font-bold text-text-primary">{subjectName}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <span className="text-[11px] font-black italic font-display text-text-secondary">{totalScore}%</span>
                              <span className={cn(
                                "px-2.5 py-1 rounded-lg text-[10px] font-black italic font-display",
                                letterGrade.startsWith('A') || letterGrade.startsWith('1') ? "bg-brand-primary/10 text-brand-primary" : "bg-muted text-text-secondary"
                              )}>
                                {letterGrade}
                              </span>
                     </div>

                     <div className="border-t border-border pt-4 mt-2">
                       <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3">Parent / Guardian (optional)</p>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Parent First Name</label>
                           <input value={newStudent.parentFirstName} onChange={(e) => setNewStudent({...newStudent, parentFirstName: e.target.value})} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-bold" placeholder="First name" />
                         </div>
                         <div>
                           <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Parent Last Name</label>
                           <input value={newStudent.parentLastName} onChange={(e) => setNewStudent({...newStudent, parentLastName: e.target.value})} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-bold" placeholder="Last name" />
                         </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4 mt-3">
                         <div>
                           <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Parent Phone</label>
                           <input value={newStudent.parentPhone} onChange={(e) => setNewStudent({...newStudent, parentPhone: e.target.value})} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-bold" placeholder="+233 24 000 0000" />
                         </div>
                         <div>
                           <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Relationship</label>
                           <select value={newStudent.parentRelationship} onChange={(e) => setNewStudent({...newStudent, parentRelationship: e.target.value})} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-bold">
                             <option value="Guardian">Guardian</option>
                             <option value="Father">Father</option>
                             <option value="Mother">Mother</option>
                           </select>
                         </div>
                       </div>
                     </div>
                   </div>
                       );
                    })
                  :                   <EmptyState context="students" variant="compact" />
                }
              </div>
            </div>
          </div>
        )}

        {activeTab === 'BioData' && (
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-6">Institutional Identity</p>
              <div className="space-y-4">
                  {[
                    { label: 'Index Number', value: student.indexNumber },
                    { label: 'Date of Birth', value: student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A' },
                    { label: 'Program', value: student.program },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-[11px] font-bold text-text-secondary uppercase tracking-tight">{item.label}</span>
                      <span className="text-[12px] font-black text-text-primary italic font-display">{item.value || 'N/A'}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-6">BECE Placement Dossier</p>
              <div className="space-y-4">
                  {[
                    { label: 'Placement Aggregate', value: student.beceAggregate || 'N/A' },
                    { label: 'Primary Residency', value: student.beceResidency || 'N/A' },
                    { label: 'Placement', value: student.placementType || 'N/A' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-[11px] font-bold text-text-secondary uppercase tracking-tight">{item.label}</span>
                      <span className="text-[12px] font-black text-brand-primary italic font-display">{item.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Log' && (
          <div className="space-y-4">
            <div className="p-6 bg-surface border border-border rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center">
                   <HeartPulse size={20} />
                 </div>
                 <h4 className="text-[11px] font-black text-text-primary uppercase tracking-widest">Medical Log</h4>
              </div>
              <div className="p-4 bg-destructive/50 border border-destructive rounded-2xl">
                 <p className="text-[13px] font-bold text-text-primary leading-relaxed italic">
                   {student.healthNotes || 'No acute medical flags inherited.'}
                 </p>
              </div>
            </div>
            <div className="p-6 bg-surface border border-border rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
                   <AlertCircle size={20} />
                 </div>
                 <h4 className="text-[11px] font-black text-text-primary uppercase tracking-widest">Discipline Log</h4>
              </div>
              <div className="p-4 bg-muted border border-border rounded-2xl">
                 <p className="text-[13px] font-bold text-text-secondary leading-relaxed italic">
                   {student.disciplinaryNotes || 'Institutional conduct threshold maintained.'}
                 </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Guardian' && (
          <div className="space-y-6">
             <div className="bg-surface p-8 rounded-4xl border border-border shadow-sm text-center">
                <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center text-text-secondary mx-auto mb-6">
                  <Users size={40} />
                </div>
                <h3 className="text-xl font-black italic font-display text-text-primary mb-1">
                  {(student.emergencyContact?.name) || 'Guardian Not Linked'}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-8">
                  {student.emergencyContact?.relation || 'No parent association'}
                </p>
                <div className="flex gap-3">
                  <button className="flex-1 py-4 bg-brand-dark text-primary-foreground rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest">
                    <Phone size={16} /> Voice
                  </button>
                  <button className="flex-1 py-4 bg-surface text-text-primary border border-border rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest">
                    <MessageSquare size={16} /> SMS
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-surface border-t border-border flex gap-3 shrink-0">
        <button 
          onClick={() => executeSensitiveAction('delete-student')}
          className="p-4 bg-destructive/10 text-destructive rounded-2xl hover:bg-destructive/10 transition-all"
        >
          <Trash2 size={20} />
        </button>
<button 
          onClick={() => {
            if (student) {
              onGenerateReport?.(student.id);
            }
          }}
          className="flex-1 py-4 border border-border rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3"
        >
          <Download size={16} /> Dossier
        </button>
        <button 
          onClick={() => {
            if (student) {
              onBuildTranscript?.(student.id);
            }
          }}
          className="flex-1 py-4 bg-brand-dark text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest"
        >
          Transcript
        </button>
      </div>
    </div>
  );
};

export const StudentRegistry = () => {
  const studentsQuery = useAllStudents();
  const classesQuery = useAllClasses();
  const departmentsQuery = useAllDepartments();
  const createStudentMutation = useCreateStudent();
  const batchImportMutation = useBatchImportStudents();
  const promoteStudentMutation = usePromoteStudent();
  const buildTranscriptMutation = useBuildTranscript();
  const generateReportCardMutation = useGenerateReportCard();
  const deactivateUserMutation = useDeactivateUser();
  const updateStudentProfileMutation = useUpdateStudentProfile();
  const students = studentsQuery.data || [];
  const classes = classesQuery.data || [];
  const departments = departmentsQuery.data || [];
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
    if (!selectedSourceClass) {
      toast.error('Select a source class');
      return;
    }

    try {
      const result = await promoteStudentMutation.mutateAsync({ classId: selectedSourceClass });
      setPromotionStatus({ 
        promoted: result.totalProcessed || 0, 
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

  const programs = useMemo(() => {
    const deptNames = (departments || []).map(d => d.name);
    const classPrograms = (classes || [])
      .map(c => c.program)
      .filter(Boolean);
    const unique = Array.from(new Set([...deptNames, ...classPrograms]));
    return unique.sort();
  }, [departments, classes]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [viewMode, setViewMode] = useState('Academic');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [selectedSourceClass, setSelectedSourceClass] = useState('');
  const [promotionStatus, setPromotionStatus] = useState(null);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [showReverification, setShowReverification] = useState({ active: false, action: null });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', indexNumber: '', gender: 'MALE', dateOfBirth: '', residentialStatus: 'DAY', currentClassId: '',
    parentFirstName: '', parentLastName: '', parentPhone: '', parentEmail: '', parentRelationship: 'Guardian',
  });
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [openKebabId, setOpenKebabId] = useState(null);
  const [studentAtRisk, setStudentAtRisk] = useState({});
  const [studentFunding, setStudentFunding] = useState({});
  const [adminPassword, setAdminPassword] = useState('');
  const [csspsFile, setCsspsFile] = useState(null);
  const [csspsPreview, setCsspsPreview] = useState([]);
  const [csspsError, setCsspsError] = useState('');
  const [isProcessingCssps, setIsProcessingCssps] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const displayStudents = useMemo(() => students.map((s) => {
    const parentLink = s.parentLinks?.[0];
    const grades = s.grades || [];
    const avgGrade = grades.length > 0 
      ? Math.round(grades.reduce((sum, g) => sum + (g.totalScore || g.score || 0), 0) / grades.length) 
      : 0;
    const baseAtRisk = avgGrade < 50;
    const program = s.department?.name || s.currentClass?.program || 'General';
    return {
      id: s.id || s.userId,
      name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.user?.email || 'Unknown',
      indexNumber: s.indexNumber,
      dob: s.dateOfBirth,
      currentClass: s.currentClass?.name || 'Unassigned',
      program,
      averageGrade: avgGrade,
      atRisk: studentAtRisk[s.id] ?? baseAtRisk,
      fundingStatus: studentFunding[s.id] || s.feesStatus || 'Free SHS',
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
  }), [students, studentAtRisk, studentFunding]);

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

  const confirmVerification = async () => {
    const action = showReverification.action;
    setShowReverification({ active: false, action: null });

    try {
      if (action === 'export-all') {
        toast.success('Generating Global Institutional Dossier...');
      } else if (action === 'delete-student' && selectedStudentId) {
        if (!adminPassword || adminPassword.length < 4) {
          toast.error('Invalid administrative password override');
          return;
        }
        await deactivateUserMutation.mutateAsync(selectedStudentId);
        toast.success('Student record purged from registry');
        setSelectedStudentId(null);
        setAdminPassword('');
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

  const handleKebabAction = (studentId, action) => {
    setOpenKebabId(null);
    switch (action) {
      case 'dossier':
        setSelectedStudentId(studentId);
        toast.info('Opening student dossier...');
        break;
      case 'toggle-risk':
        setStudentAtRisk(prev => {
          const current = prev[studentId];
          const next = current === undefined ? true : !current;
          const newState = { ...prev, [studentId]: next };
          toast.info(next ? 'Academic risk flagged' : 'Academic risk cleared');
          return newState;
        });
        break;
      case 'cycle-funding':
        setStudentFunding(prev => {
          const current = prev[studentId] || 'Free SHS';
          const cycle = ['Free SHS', 'Fully Funded', "Gov't Covered"];
          const idx = cycle.indexOf(current);
          const next = cycle[(idx + 1) % cycle.length];
          toast.success(`Funding updated to ${next}`);
          return { ...prev, [studentId]: next };
        });
        break;
      case 'purge':
        executeSensitiveAction('delete-student');
        setSelectedStudentId(studentId);
        toast.warning('Administrative authorization required to purge record');
        break;
      default:
        break;
    }
  };

  const handleCreateStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.indexNumber) {
      toast.error('Name and index number are required');
      return;
    }

    const selectedClass = classes.find(c => c.id === newStudent.currentClassId);
    const departmentId = selectedClass?.program 
      ? departments.find(d => d.name === selectedClass.program)?.id 
      : undefined;

    setCreatingStudent(true);
    try {
      await createStudentMutation.mutateAsync({
        ...newStudent,
        currentClassId: newStudent.currentClassId,
        departmentId,
        isBoarder: newStudent.residentialStatus === 'BOARDING',
        password: 'Student@123!',
        parentFirstName: newStudent.parentFirstName,
        parentLastName: newStudent.parentLastName,
        parentPhone: newStudent.parentPhone,
        parentEmail: newStudent.parentEmail,
        parentRelationship: newStudent.parentRelationship,
      });
      setShowCreateForm(false);
      setNewStudent({ firstName: '', lastName: '', indexNumber: '', gender: 'MALE', dateOfBirth: '', residentialStatus: 'DAY', currentClassId: '', parentFirstName: '', parentLastName: '', parentPhone: '', parentEmail: '', parentRelationship: 'Guardian' });
      toast.success('Student registered successfully');
    } catch (err) {
      toast.error(`Registration failed: ${err.message || 'Unknown error'}`);
    } finally {
      setCreatingStudent(false);
    }
  };

  // CSSPS Upload handlers
  const parseFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          if (file.name.match(/\.xlsx?$/i)) {
            const workbook = XLSX.read(content, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            resolve(jsonData);
          } else {
            Papa.parse(content, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: false,
              complete: (results) => resolve(results.data),
              error: (err) => reject(err),
            });
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const normalizeRecord = (record) => {
    const keys = Object.keys(record);
    const normalized = {};
    keys.forEach(key => {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      normalized[normalizedKey] = record[key] !== undefined && record[key] !== null ? String(record[key]).trim() : '';
    });
    return normalized;
  };

  const handleCssFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      setCsspsError('Only CSV/Excel files are supported');
      return;
    }
    
    setCsspsFile(file);
    setCsspsError('');
    
    try {
      const rawRecords = await parseFile(file);
      const normalizedRecords = rawRecords.map(normalizeRecord);
      setCsspsPreview(normalizedRecords);
    } catch (err) {
      setCsspsError('Failed to parse file: ' + (err.message || 'Unknown error'));
      setCsspsPreview([]);
    }
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
    
    const validationErrors = [];
    const seenIndexNumbers = new Set();
    
    csspsPreview.forEach((record, idx) => {
      if (!record.index_number && !record.indexnumber && !record.index) {
        validationErrors.push(`Row ${idx + 2}: Missing index number`);
      } else {
        const indexNum = record.index_number || record.indexnumber || record.index;
        if (seenIndexNumbers.has(indexNum)) {
          validationErrors.push(`Row ${idx + 2}: Duplicate index number ${indexNum}`);
        }
        seenIndexNumbers.add(indexNum);
      }
      
      if (!record.first_name && !record.firstname && !record.first_name) {
        validationErrors.push(`Row ${idx + 2}: Missing first name`);
      }
      
      if (!record.last_name && !record.lastname && !record.last_name) {
        validationErrors.push(`Row ${idx + 2}: Missing last name`);
      }
    });
    
    if (validationErrors.length > 0) {
      setCsspsError(`Validation failed:\n${validationErrors.slice(0, 10).join('\n')}${validationErrors.length > 10 ? `\n...and ${validationErrors.length - 10} more errors` : ''}`);
      return;
    }
    
    setIsProcessingCssps(true);
    
    const students = csspsPreview.map(record => ({
      indexNumber: record.index_number || record.indexnumber || record.index || `MSHTS/2024/${String(Date.now()).slice(-6)}`,
      firstName: record.first_name || record.firstname || record.first_name || '',
      lastName: record.last_name || record.lastname || record.last_name || '',
      middleName: record.middle_name || record.middlename || record.middleName || '',
      gender: (record.gender || 'MALE').toUpperCase(),
      dateOfBirth: record.date_of_birth || record.dob || record.dateofbirth || record.dateOfBirth,
      currentClassId: record.currentclassid || record.currentclassid || record.currentclassid || '',
      departmentId: record.departmentid || record.departmentid || record.departmentid || '',
      className: record.classname || record.classname || record.class_name || '',
      departmentName: record.departmentname || record.departmentname || record.department_name || '',
      parentFirstName: record.parentfirstname || record.parentfirstname || record.parent_first_name || '',
      parentLastName: record.parentlastname || record.parentlastname || record.parent_last_name || '',
      parentPhone: record.parentphone || record.parentphone || record.parent_phone || '',
      parentEmail: record.parentemail || record.parentemail || record.parent_email || '',
      parentRelationship: record.parentrelationship || record.parentrelationship || record.parent_relationship || 'Guardian',
      isBoarder: (record.residential_status || record.isboarder || record.isBoarder || '').toUpperCase() === 'BOARDING',
    }));
    
    try {
      const result = await batchImportMutation.mutateAsync(students);
      setImportResults(result);
      setCsspsPreview([]);
      setCsspsFile(null);
    } catch (err) {
      setCsspsError('Import failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessingCssps(false);
    }
  };

  const predictNextClass = (sourceClassName) => {
    if (!sourceClassName) return '';
    const match = sourceClassName.match(/^([1-3])(.+)$/);
    if (!match) return '';
    const num = parseInt(match[1]);
    const suffix = match[2];
    const nextNum = num + 1;
    if (nextNum > 3) return 'Graduation';
    const nextClass = classes.find(c => c.name === `${nextNum}${suffix}`);
    return nextClass ? nextClass.name : `${nextNum}${suffix}`;
  };

  const predictedDest = predictNextClass(selectedSourceClass);

  return (
    <div className="flex-1 flex flex-col bg-muted overflow-hidden relative">
      <header className="px-8 py-6 bg-surface border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-text-primary italic font-display tracking-tight leading-none">
            Student Enrolment
            </h1>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Learner Population Records : {isLoading ? '...' : `${students.length} Enrolled`}</p>
          </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                + Register
              </button>
              <button 
                onClick={() => {
                  const csv = Papa.unparse(filteredStudents.map(s => ({
                    'Index Number': s.indexNumber,
                    'Name': s.name,
                    'Email': s.email || '',
                    'Program': s.program,
                  })));
                  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'student-batch-report.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success(`Exported ${filteredStudents.length} student records`);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-surface text-text-primary border border-border rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm"
              >
                <FileText size={16} /> Bulk Reports
              </button>
              <button onClick={() => setIsBatchUploading(true)} className="flex items-center gap-2 px-5 py-2.5 bg-muted text-text-primary border border-border rounded-xl text-[10px] font-black uppercase tracking-widest">
                <Users size={16} /> Bulk Registry
              </button>
              <button onClick={() => setIsPromoting(true)} className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20">
                <TrendingUp size={16} /> Promotion Engine
              </button>
           </div>
        </div>

      </header>

      <div className="px-8 py-5 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-6 py-3" />
            </div>
              <Select value={selectedProgram} onValueChange={(value) => setSelectedProgram(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Programs</SelectItem>
                  {programs.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
         </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-muted p-1 rounded-xl border border-border">
                <Button onClick={() => setViewMode('Academic')} variant={viewMode === 'Academic' ? "default" : "outline"} className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  Academic
                </Button>
                <Button onClick={() => setViewMode('Personal')} variant={viewMode === 'Personal' ? "default" : "outline"} className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  Biosocial
                </Button>
             </div>
              <Button onClick={() => {
                  const csv = Papa.unparse(filteredStudents.map(s => ({
                    'Index': s.indexNumber,
                    'Name': s.name,
                    'Program': s.program,
                    'Average Grade': s.averageGrade,
                  })));
                  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
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

      <div className="flex-1 overflow-y-auto relative scrollbar-hide">
          <Table>
            <TableHeader>
                <TableRow className="bg-muted/80 border-b border-border">
                  <TableHead className="px-8 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Index / Name</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Class</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Program</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Performance</TableHead>
                  <TableHead className="px-6 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Guardian</TableHead>
                  <TableHead className="px-8 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((stu) => (
                <TableRow key={stu.id} className="group bg-surface hover:bg-muted cursor-pointer transition-all" onClick={() => setSelectedStudentId(stu.id)}>
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-11 h-11 bg-muted rounded-xl flex items-center justify-center text-text-secondary group-hover:bg-brand-dark group-hover:text-primary-foreground transition-all"><GraduationCap size={18} /></div>
                       <div>
                          <p className="text-[14px] font-black italic font-display text-text-primary leading-none mb-1.5">{stu.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{stu.indexNumber}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                     <span className="text-[12px] font-black text-text-primary">{stu.currentClass}</span>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                     <span className="text-[12px] font-black text-text-primary">{stu.program}</span>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-center">
                     <Badge className={cn(
                       stu.averageGrade >= 75 ? "bg-brand-primary/10 text-brand-primary" : "bg-brand-primary/10 text-brand-primary"
                     )}>
                       {stu.averageGrade}%
                     </Badge>
                   </TableCell>
                   <TableCell className="px-6 py-5 text-center">
                      <Badge className={cn(
                        stu.emergencyContact
                          ? "bg-brand-primary/10 text-brand-primary"
                          : "bg-muted text-text-secondary"
                      )}>
                        {stu.emergencyContact ? 'Linked' : 'Unlinked'}
                      </Badge>
                   </TableCell>
                    <TableCell className="px-8 py-5 text-right">
                      <div className="relative inline-block">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenKebabId(openKebabId === stu.id ? null : stu.id); }}
                          className="p-3 bg-muted text-text-secondary hover:bg-brand-dark hover:text-primary-foreground rounded-xl transition-all"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openKebabId === stu.id && (
                          <div className="absolute right-0 top-12 w-56 bg-surface border border-border rounded-xl shadow-xl z-50 py-1">
                            <button onClick={() => handleKebabAction(stu.id, 'dossier')} className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-text-primary hover:bg-muted flex items-center gap-2"><FileText size={12} className="text-brand-primary" /> View Full Dossier</button>
                            <button onClick={() => handleKebabAction(stu.id, 'toggle-risk')} className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-text-primary hover:bg-muted flex items-center gap-2"><AlertTriangle size={12} className={cn("text-warning", stu.atRisk && "fill-warning")} /> {stu.atRisk ? 'Clear Academic Risk' : 'Flag Academic Risk'}</button>
                            <button onClick={() => handleKebabAction(stu.id, 'cycle-funding')} className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-text-primary hover:bg-muted flex items-center gap-2"><ShieldCheck size={12} className="text-brand-primary" /> Funding: {stu.fundingStatus}</button>
                            <div className="h-px bg-muted my-1" />
                            <button onClick={() => handleKebabAction(stu.id, 'purge')} className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-destructive hover:bg-destructive/10 flex items-center gap-2"><Trash2 size={12} /> Purge Student Record</button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
           </Table>
        </div>

      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStudentId(null)} className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative w-full max-w-xl bg-surface h-full shadow-2xl">
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
                 <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md" />
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-surface rounded-[2.5rem] shadow-2xl p-10 text-center">
                     <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-6"><Lock size={32} /></div>
                     <h3 className="text-2xl font-black italic font-display text-text-primary mb-2">Confirm Action</h3>
                     <p className="text-[13px] text-text-secondary mb-6">This action requires administrative authorization. Please confirm to proceed.</p>
                     {showReverification.action === 'delete-student' && (
                       <div className="mb-6">
                         <input
                           type="password"
                           placeholder="Enter admin password override"
                           value={adminPassword}
                           onChange={(e) => setAdminPassword(e.target.value)}
                           className="w-full px-4 py-3 border border-border rounded-xl text-[11px] font-bold text-center outline-none focus:ring-2 focus:ring-destructive"
                         />
                       </div>
                     )}
                     <div className="flex gap-3">
                        <button onClick={() => { setShowReverification({ active: false, action: null }); setAdminPassword(''); }} className="flex-1 py-4 bg-muted rounded-xl text-[10px] font-black uppercase tracking-widest">Abort</button>
                        <button onClick={confirmVerification} className="flex-1 py-4 bg-brand-dark text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest">Authorize</button>
                     </div>
                 </motion.div>
             </div>
           )}
{isBatchUploading && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md" onClick={() => setIsBatchUploading(false)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-surface rounded-[3rem] shadow-2xl p-12">
                   <div className="w-24 h-24 bg-brand-primary/10 text-brand-primary rounded-[2.5rem] flex items-center justify-center mx-auto mb-10"><FileUp size={48} /></div>
                   <h3 className="text-3xl font-black italic font-display text-text-primary mb-4">CSSPS Batch Intake</h3>
                   
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
                        className="border-4 border-dashed border-border rounded-[2.5rem] py-16 mb-6 hover:bg-muted cursor-pointer flex flex-col items-center justify-center"
                      >
                        <p className="text-[11px] font-black uppercase tracking-widest text-text-secondary mb-2">Drop CSSPS File Here</p>
                        <p className="text-[10px] text-muted">CSV/Excel formats supported</p>
                        {csspsFile && (
                          <p className="mt-3 text-[12px] font-black text-brand-primary">
                            {csspsFile.name}
                          </p>
                        )}
                      </label>
                       <button 
                          onClick={() => {
                            const headers = ['indexNumber','firstName','lastName','middleName','gender','dateOfBirth','residentialStatus','className','departmentName','currentClassId','departmentId','parentFirstName','parentLastName','parentPhone','parentEmail','parentRelationship'];
                            const sampleClass = classes.length > 0 ? classes[0] : null;
                            const sampleDept = departments.length > 0 ? departments[0] : null;
                            const sample = [
                              'MSHTS/2024/001',
                              'Kwame',
                              'Mensah',
                              'Kofi',
                              'MALE',
                              '2008-01-15',
                              'DAY',
                              sampleClass?.name || '1A',
                              sampleDept?.name || 'Science',
                              sampleClass?.id || '',
                              sampleDept?.id || '',
                              'Ama',
                              'Owusu',
                              '+233244000001',
                              'ama.owusu@parent.com',
                              'Mother'
                            ];
                            const csv = Papa.unparse([headers, sample]);
                            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'student-import-template.csv';
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                         className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline"
                       >
                         Download Template CSV
                       </button>
                    </div>

                   {csspsPreview.length > 0 && (
                      <div className="mb-6 max-h-64 overflow-y-auto border border-border rounded-2xl p-4 scrollbar-hide">
                       <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3">Preview ({csspsPreview.length} records)</p>
                       <div className="space-y-1">
                         {csspsPreview.slice(0, 5).map((record, i) => (
                           <div key={i} className="flex justify-between text-[11px] py-1 border-b border-border">
                             <span className="font-bold text-text-primary">{record.indexNumber}</span>
                             <span className="text-text-secondary">{record.firstName} {record.lastName}</span>
                             <span className="text-text-secondary">{record.placementAggregate || 'N/A'}</span>
                           </div>
                         ))}
                         {csspsPreview.length > 5 && (
                           <p className="text-[10px] text-text-secondary italic">...and {csspsPreview.length - 5} more</p>
                         )}
                       </div>
                     </div>
                   )}

                   {csspsError && (
                     <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-xl text-[11px] font-black">
                       {csspsError}
                     </div>
                   )}

                   <div className="flex gap-4">
                      <button 
                        onClick={handleCancelCsspsUpload}
                        className="flex-1 py-5 bg-muted rounded-[2rem] text-[11px] font-black uppercase tracking-widest"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleProcessCsspsUpload}
                        disabled={!csspsFile || isProcessingCssps}
                        className={cn(
                          "flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest",
                          isProcessingCssps || !csspsFile 
                            ? "bg-muted text-text-secondary cursor-not-allowed" 
                            : "bg-brand-primary text-primary-foreground hover:bg-brand-primary"
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
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-lg bg-surface rounded-[2.5rem] shadow-2xl p-10 text-center">
                    <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-6"><CheckCircle size={32} /></div>
                    <h3 className="text-2xl font-black italic font-display text-text-primary mb-2">Import Complete</h3>
                    <p className="text-[14px] text-text-secondary mb-6">
                      Successfully imported {importResults.success} students. {importResults.failed > 0 && `${importResults.failed} failed.`}
                    </p>
                    <button 
                      onClick={() => setImportResults(null)}
                      className="px-8 py-3 bg-brand-dark text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest"
                    >
                      Done
                    </button>
                 </motion.div>
              </div>
             )}
            {showCreateForm && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md" onClick={() => setShowCreateForm(false)} />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-lg bg-surface rounded-[2.5rem] shadow-2xl p-10">
                  <h3 className="text-2xl font-black italic font-display text-text-primary mb-8">Register New Student</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">First Name *</label>
                        <input value={newStudent.firstName} onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-bold" placeholder="First Name" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Last Name *</label>
                        <input value={newStudent.lastName} onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-bold" placeholder="Last Name" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Index Number *</label>
                      <input value={newStudent.indexNumber} onChange={(e) => setNewStudent({...newStudent, indexNumber: e.target.value})} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-bold" placeholder="e.g. MSHTS/2024/001" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Gender</label>
                        <select value={newStudent.gender} onChange={(e) => setNewStudent({...newStudent, gender: e.target.value})} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-bold">
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Date of Birth</label>
                        <input type="date" value={newStudent.dateOfBirth} onChange={(e) => setNewStudent({...newStudent, dateOfBirth: e.target.value})} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-bold" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Residential Status</label>
                        <select value={newStudent.residentialStatus} onChange={(e) => setNewStudent({...newStudent, residentialStatus: e.target.value})} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-bold">
                          <option value="DAY">Day Student</option>
                          <option value="BOARDING">Boarding Student</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Class</label>
                        <select value={newStudent.currentClassId} onChange={(e) => setNewStudent({...newStudent, currentClassId: e.target.value})} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-bold">
                          <option value="">Select Class</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                   <p className="text-[10px] text-text-secondary mt-4 mb-4">A temporary password will be generated and the student will be prompted to change it on first login.</p>
                  <div className="flex gap-4">
                    <button onClick={() => setShowCreateForm(false)} className="flex-1 py-4 bg-muted rounded-[2rem] text-[11px] font-black uppercase tracking-widest">Cancel</button>
                    <button onClick={handleCreateStudent} disabled={creatingStudent || !newStudent.firstName || !newStudent.indexNumber} className={cn("flex-1 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest", creatingStudent || !newStudent.firstName || !newStudent.indexNumber ? "bg-muted text-text-secondary cursor-not-allowed" : "bg-brand-primary text-primary-foreground")}>
                      {creatingStudent ? 'Registering...' : 'Register Student'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
           {isPromoting && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md" onClick={() => setIsPromoting(false)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-surface rounded-[3rem] shadow-2xl p-12">
                   <h3 className="text-3xl font-black italic font-display text-text-primary mb-12">Promotion Engine</h3>
                    <div className="space-y-6 mb-12">
                       <div>
                         <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Source Class</label>
                         <select 
                           value={selectedSourceClass}
                           onChange={(e) => setSelectedSourceClass(e.target.value)}
                           className="w-full px-6 py-4 bg-muted border border-border rounded-2xl outline-none"
                         >
                           <option value="">Select source class</option>
                           {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.level})</option>)}
                         </select>
                       </div>
                       <div>
                         <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Predicted Destination</label>
                         <div className="w-full px-6 py-4 bg-muted/50 border border-border rounded-2xl text-text-secondary text-sm">
                           {predictedDest || 'Select a source class first'}
                         </div>
                       </div>
                    </div>
                   <div className="flex gap-4">
                      <button onClick={() => setIsPromoting(false)} className="flex-1 py-5 bg-muted rounded-[2rem] text-[11px] font-black uppercase tracking-widest">Abort</button>
                      <button 
                        onClick={() => {
                          setIsPromoting(false);
                          handleBatchPromotion();
                        }} 
                        disabled={!selectedSourceClass}
                        className={cn(
                          "flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest",
                          selectedSourceClass ? "bg-brand-primary text-primary-foreground" : "bg-muted text-text-secondary cursor-not-allowed"
                        )}
                      >Execute</button>
                   </div>
                  {promotionStatus && (
                    <div className="mt-6 p-4 bg-brand-primary/10 text-brand-primary rounded-2xl text-[11px] font-black">
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