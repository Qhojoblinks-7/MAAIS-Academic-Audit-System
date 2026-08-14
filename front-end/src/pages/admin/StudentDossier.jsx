import React, { useState } from 'react';
import {
   BarChart3, FileText, Activity, Phone,
   HeartPulse, AlertCircle, Users, MessageSquare,
   GraduationCap, X, Trash2, Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { EmptyState } from '../../components/molecules';
import {
  ResponsiveContainer,
  XAxis, YAxis, Tooltip,
  LineChart as ReLineChart, Line, CartesianGrid
} from 'recharts';
import { Badge } from '../../components/ui/badge';

const StudentDossier = ({
   student,
   onClose,
   onGenerateReport,
   onBuildTranscript,
   newStudent,
   setNewStudent,
   executeSensitiveAction,
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

 export default StudentDossier;