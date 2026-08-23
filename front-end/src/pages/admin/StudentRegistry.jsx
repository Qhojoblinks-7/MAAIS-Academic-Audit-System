import React from 'react';
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
import Papa from 'papaparse';
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
import StudentDossier from './StudentDossier';
import { useStudentRegistry } from './useStudentRegistry';
import StudentRegistryTable from './StudentRegistry.table';
import StudentRegistryModals from './StudentRegistry.modals';

export const StudentRegistry = () => {
  const registry = useStudentRegistry();

  return (
    <div className="flex-1 flex flex-col bg-muted overflow-hidden relative">
      <header className="px-8 py-6 bg-surface border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-text-primary italic font-display tracking-tight leading-none">
            Student Enrolment
            </h1>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Learner Population Records : {registry.isLoading ? '...' : `${registry.totalStudentCount} Enrolled`}</p>
          </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => registry.setShowCreateForm(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                + Register
              </button>
              <button
                onClick={() => {
                  const csv = Papa.unparse(registry.filteredStudents.map(s => ({
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
                  toast.success(`Exported ${registry.filteredStudents.length} student records`);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-surface text-text-primary border border-border rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm"
              >
                <FileText size={16} /> Bulk Reports
              </button>
              <button onClick={() => registry.setIsBatchUploading(true)} className="flex items-center gap-2 px-5 py-2.5 bg-muted text-text-primary border border-border rounded-xl text-[10px] font-black uppercase tracking-widest">
                <Users size={16} /> Bulk Registry
              </button>
              <button onClick={() => registry.setIsPromoting(true)} className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20">
                <TrendingUp size={16} /> Promotion Engine
              </button>
           </div>
        </div>

      </header>

      <div className="px-8 py-5 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <Input placeholder="Search..." value={registry.searchQuery} onChange={(e) => registry.setSearchQuery(e.target.value)} className="w-full pl-12 pr-6 py-3" />
            </div>
              <Select value={registry.selectedProgram} onValueChange={(value) => registry.setSelectedProgram(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Programs</SelectItem>
                  {registry.programs.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
         </div>
           <div className="flex items-center gap-3">
              <div className="flex bg-muted p-1 rounded-xl border border-border">
                 <Button onClick={() => registry.setViewMode('Academic')} variant={registry.viewMode === 'Academic' ? "default" : "outline"} className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">
                   Academic
                 </Button>
                 <Button onClick={() => registry.setViewMode('Personal')} variant={registry.viewMode === 'Personal' ? "default" : "outline"} className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">
                   Biosocial
                 </Button>
              </div>
               <Button onClick={() => {
                   const csv = Papa.unparse(registry.filteredStudents.map(s => ({
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
                   toast.success(`Exported ${registry.filteredStudents.length} student records`);
                 }} className="p-3">
                 <Download size={20} />
               </Button>
               <Button
                 onClick={() => {
                   const nextIndex = `MSHTS/2024/${String(registry.students.length + 1).padStart(3, '0')}`;
                   toast.success(`Next available index: ${nextIndex}`);
                 }}
                 variant="outline"
                 className="px-4 py-3 text-[10px] font-black uppercase tracking-widest font-display italic"
               >
                 ID Generator
               </Button>
           </div>
      </div>

      <StudentRegistryTable
        filteredStudents={registry.filteredStudents}
        viewMode={registry.viewMode}
        searchQuery={registry.searchQuery}
        selectedProgram={registry.selectedProgram}
        setSelectedStudentId={registry.setSelectedStudentId}
        openKebabId={registry.openKebabId}
        setOpenKebabId={registry.setOpenKebabId}
        handleKebabAction={registry.handleKebabAction}
        isLoading={registry.isLoading}
        studentsLength={registry.students.length}
        selectedStudent={registry.selectedStudent}
        onCloseDossier={() => registry.setSelectedStudentId(null)}
        onGenerateReport={registry.handleGenerateReport}
        onBuildTranscript={registry.handleBuildTranscript}
        executeSensitiveAction={registry.executeSensitiveAction}
        newStudent={registry.newStudent}
        setNewStudent={registry.setNewStudent}
        loadMoreRef={registry.loadMoreRef}
        isFetchingNextPage={registry.isFetchingNextPage}
        totalStudentCount={registry.totalStudentCount}
      />

      <StudentRegistryModals
        registry={registry}
      />

      <Toaster />
    </div>
  );
};