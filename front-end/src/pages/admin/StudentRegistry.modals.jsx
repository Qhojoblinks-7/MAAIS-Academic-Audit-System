import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { toast } from '../../components/ui/toast.tsx';
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
import Papa from 'papaparse';
import {
  Lock, FileUp, CheckCircle, X, Users, TrendingUp
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const StudentRegistryModals = ({ registry }) => {
  const {
    showReverification,
    setShowReverification,
    adminPassword,
    setAdminPassword,
    confirmVerification,
    isBatchUploading,
    setIsBatchUploading,
    csspsFile,
    setCsspsFile,
    csspsPreview,
    setCsspsPreview,
    csspsError,
    setCsspsError,
    isProcessingCssps,
    setIsProcessingCssps,
    handleCssFileChange,
    handleCancelCsspsUpload,
    handleProcessCsspsUpload,
    classes,
    departments,
    importResults,
    setImportResults,
    showCreateForm,
    setShowCreateForm,
    newStudent,
    setNewStudent,
    creatingStudent,
    handleCreateStudent,
    isPromoting,
    setIsPromoting,
    selectedSourceClass,
    setSelectedSourceClass,
    handleBatchPromotion,
    promotionStatus,
    predictedDest,
  } = registry;

  return (
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
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
             <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md" onClick={() => setIsBatchUploading(false)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-lg sm:max-w-2xl bg-surface rounded-[1.5rem] sm:rounded-[3rem] shadow-2xl p-6 sm:p-12">
                   <div className="w-20 h-20 sm:w-24 sm:h-24 bg-brand-primary/10 text-brand-primary rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 sm:mb-10"><FileUp size={40} /></div>
                   <h3 className="text-2xl sm:text-3xl font-black italic font-display text-text-primary mb-3 sm:mb-4">CSSPS Batch Intake</h3>

                    <div className="mb-5 sm:mb-6">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleCssFileChange}
                        className="hidden"
                        id="cssps-file-input"
                      />
                      <label
                        htmlFor="cssps-file-input"
                        className="border-4 border-dashed border-border rounded-[1.5rem] sm:rounded-[2.5rem] py-8 sm:py-16 mb-5 sm:mb-6 hover:bg-muted cursor-pointer flex flex-col items-center justify-center"
                      >
                        <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-text-secondary mb-2">Drop CSSPS File Here</p>
                        <p className="text-[8px] sm:text-[10px] text-muted">CSV/Excel formats supported</p>
                        {csspsFile && (
                          <p className="mt-3 text-[11px] font-black text-brand-primary break-all px-4">
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
                         className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline"
                       >
                         Download Template CSV
                       </button>
                    </div>

                   {csspsPreview.length > 0 && (
                      <div className="mb-5 sm:mb-6 max-h-52 sm:max-h-64 overflow-y-auto border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 scrollbar-hide">
                       <p className="text-[8px] sm:text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 sm:mb-3">Preview ({csspsPreview.length} records)</p>
                       <div className="space-y-1">
                          {csspsPreview.slice(0, 5).map((record, i) => (
                            <div key={i} className="flex justify-between text-[10px] sm:text-[11px] py-1 border-b border-border">
                              <span className="font-bold text-text-primary">{record.index_number || record.indexnumber || record.index || record.cassrefid || '—'}</span>
                              <span className="text-text-secondary truncate max-w-[40%]">{record.last_name || record.lastname || record.lastName || ''} {record.first_name || record.firstname || record.firstName || '—'} {record.middle_name || record.middlename || record.middleName || ''}</span>
                              <span className="text-text-secondary">{record.placementAggregate || 'N/A'}</span>
                            </div>
                          ))}
                        {csspsPreview.length > 5 && (
                           <p className="text-[8px] sm:text-[10px] text-text-secondary italic">...and {csspsPreview.length - 5} more</p>
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
                    <p className="text-[14px] text-text-secondary mb-4">
                      Successfully imported {importResults.success} students. {importResults.failed > 0 && `${importResults.failed} failed.`}
                    </p>
                     {importResults.failed > 0 && importResults.errors && (
                       <div className="mb-6 max-h-48 overflow-y-auto border border-border rounded-xl p-3 scrollbar-hide">
                         <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 text-left">Errors</p>
                         {importResults.errors.slice(0, 20).map((err, i) => (
                           <div key={i} className="text-[11px] text-destructive text-left py-1 border-b border-border/50 last:border-0">
                             <span className="font-bold">{err.indexNumber || 'Unknown'}:</span> {err.error}
                           </div>
                         ))}
                         {importResults.errors.length > 20 && (
                           <p className="text-[10px] text-text-secondary italic mt-2">...and {importResults.errors.length - 20} more errors</p>
                         )}
                       </div>
                     )}
                     {importResults.warnings && importResults.warnings.length > 0 && (
                       <div className="mb-6 max-h-48 overflow-y-auto border border-warning/30 rounded-xl p-3 scrollbar-hide">
                         <p className="text-[10px] font-black text-warning uppercase tracking-widest mb-2 text-left">Warnings</p>
                         {importResults.warnings.slice(0, 20).map((w, i) => (
                           <div key={i} className="text-[11px] text-warning text-left py-1 border-b border-warning/20 last:border-0">
                             <span className="font-bold">{w.indexNumber || 'Unknown'}:</span> {w.message}
                           </div>
                         ))}
                         {importResults.warnings.length > 20 && (
                           <p className="text-[10px] text-text-secondary italic mt-2">...and {importResults.warnings.length - 20} more warnings</p>
                         )}
                       </div>
                     )}
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
                      <input value={newStudent.indexNumber} onChange={(e) => setNewStudent({...newStudent, indexNumber: e.target.value})} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-bold" placeholder={newStudent.indexNumber ? "e.g. MSHTS/2024/001" : "Auto-generated if left blank"} />
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
                    <button onClick={handleCreateStudent} disabled={creatingStudent || !newStudent.firstName} className={cn("flex-1 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest", creatingStudent || !newStudent.firstName ? "bg-muted text-text-secondary cursor-not-allowed" : "bg-brand-primary text-primary-foreground")}>
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
  );
};

export default StudentRegistryModals;
