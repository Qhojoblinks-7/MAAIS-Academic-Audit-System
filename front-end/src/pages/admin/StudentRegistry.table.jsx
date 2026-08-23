import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { MoreVertical, GraduationCap, FileText, AlertTriangle, ShieldCheck, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentDossier from './StudentDossier';

const StudentRegistryTable = ({
  filteredStudents,
  viewMode,
  searchQuery,
  selectedProgram,
  setSelectedStudentId,
  openKebabId,
  setOpenKebabId,
  handleKebabAction,
  isLoading,
  studentsLength,
  selectedStudent,
  onCloseDossier,
  onGenerateReport,
  onBuildTranscript,
  executeSensitiveAction,
  newStudent,
  setNewStudent,
  loadMoreRef,
  isFetchingNextPage,
  totalStudentCount,
}) => {
  return (
    <>
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

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="py-4 flex justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-text-secondary">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-bold">Loading more...</span>
            </div>
          )}
          {!isFetchingNextPage && filteredStudents.length > 0 && filteredStudents.length >= (totalStudentCount || studentsLength) && (
            <span className="text-xs font-bold text-text-secondary">
              All {totalStudentCount || studentsLength} students loaded
            </span>
          )}
        </div>
      </div>
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCloseDossier} className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative w-full max-w-xl bg-surface h-full shadow-2xl">
  <StudentDossier
                  student={selectedStudent}
                  onClose={onCloseDossier}
                  onGenerateReport={onGenerateReport}
                  onBuildTranscript={onBuildTranscript}
                  executeSensitiveAction={executeSensitiveAction}
                  newStudent={newStudent}
                  setNewStudent={setNewStudent}
                />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudentRegistryTable;