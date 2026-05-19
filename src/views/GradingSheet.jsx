import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, CheckCircle2, AlertCircle, Save, X, ShieldAlert,
  PlusCircle, MinusCircle, ChevronRight, ChevronLeft, MessageSquare, Send,
  Paperclip, History, ArrowRight, ShieldCheck, AlertTriangle, ClipboardCheck,
  Lock, Zap, Sparkles,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ObservationSidebar } from '../components/ObservationSidebar';
import { useUI } from '../context/UIContext';

const mockStudents = [
  { id: '001', name: 'Angela Owusu', index: '001', secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1', auditStatus: 'MISSING' },
  { id: '002', name: 'Kwame Mensah', index: '002', secA: 20, secB: 30, secC: 15, sba: 15.2, exam: 32.5, final: 47.7, grade: 'D7', auditStatus: 'MISSING' },
  { id: '003', name: 'Yaw Boateng', index: '003', secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1', auditStatus: 'MISSING' },
  { id: '004', name: 'Esi Ansah', index: '004', secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1', auditStatus: 'MISSING' },
  { id: '005', name: 'Kofi Appiah', index: '005', secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1', auditStatus: 'MISSING' },
];

const getSmartRemark = (grade) => {
  const remarks = {
    'A1': 'Excellent: Exceptional performance in all components.',
    'B2': 'Very Good: Highly commendable effort and focus.',
    'B3': 'Good: Solid understanding of core concepts.',
    'C4': 'Credit: Satisfactory performance with consistent results.',
    'C5': 'Credit: Can do better with more effort.',
    'C6': 'Credit: Average performance; needs steady improvement.',
    'D7': 'Pass: Meeting minimum standards for the subject.',
    'E8': 'Pass: Weak performance; requires reinforcement.',
    'F9': 'Fail: Poor performance; remedial sessions highly recommended.',
  };
  return remarks[grade] || 'N/A';
};

export function GradingSheet() {
  const { isTermFinalized } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const revisionId = queryParams.get('revision');
  const targetStudentId = queryParams.get('student');
  const missingObsId = queryParams.get('missing');

  const [students, setStudents] = React.useState(mockStudents);
  const [selectedStudent, setSelectedStudent] = React.useState(mockStudents[0]);
  const [isFlagged, setIsFlagged] = React.useState(false);
  const [isExamExpanded, setIsExamExpanded] = React.useState(!!revisionId);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [teacherReply, setTeacherReply] = React.useState('');
  const [tempMark, setTempMark] = React.useState('');
  const [showAuditToast, setShowAuditToast] = React.useState(false);
  const [showSTPOverlay, setShowSTPOverlay] = React.useState(false);
  const [stpErrors, setStpErrors] = React.useState([]);
  const [observationRatings, setObservationRatings] = React.useState({});
  const [observationComment, setObservationComment] = React.useState('');

  const isCorrectionMode = !!revisionId;
  const isMissingObsMode = !!missingObsId;
  const missingCount = students.filter(s => s.auditStatus === 'MISSING').length;
  const isSubmissionLocked = missingCount > 0 || isTermFinalized;

  const calculateScores = (s, fieldBeingUpdated) => {
    if (['secA', 'secB', 'secC'].includes(fieldBeingUpdated)) {
      const totalRaw = (s.secA || 0) + (s.secB || 0) + (s.secC || 0);
      s.exam = parseFloat(((totalRaw / 140) * 70).toFixed(1));
    }
    const final = parseFloat(((s.sba || 0) + (s.exam || 0)).toFixed(1));
    let grade = 'F9';
    if (final >= 80) grade = 'A1';
    else if (final >= 70) grade = 'B2';
    else if (final >= 65) grade = 'B3';
    else if (final >= 60) grade = 'C4';
    else if (final >= 55) grade = 'C5';
    else if (final >= 50) grade = 'C6';
    else if (final >= 45) grade = 'D7';
    else if (final >= 40) grade = 'E8';
    return { ...s, final, grade, remark: getSmartRemark(grade) };
  };

  const updateMark = (studentId, field, value) => {
    if (isTermFinalized) return;
    const numValue = parseFloat(value) || 0;
    setStudents(prev => prev.map(s => s.id === studentId ? calculateScores({ ...s, [field]: numValue }, field) : s));
  };

  React.useEffect(() => {
    if (targetStudentId) {
      const student = students.find(s => s.id === targetStudentId);
      if (student) { setSelectedStudent(student); setTempMark(student.secB.toString()); }
    }
  }, [targetStudentId, students]);

  const toggleExamExpansion = () => {
    const next = !isExamExpanded;
    setIsExamExpanded(next);
    setIsSidebarOpen(next ? false : true);
  };

  const handleSaveObservation = () => {
    if (isTermFinalized) return;
    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, auditStatus: 'COMPLETE' } : s));
    setTimeout(() => setShowAuditToast(true), 100);
    setTimeout(() => setShowAuditToast(false), 5000);
  };

  const runSTPValidation = () => {
    setShowSTPOverlay(true);
    const errors = [];
    if (students.some(s => s.final > 100)) errors.push('Final score exceeds 100%');
    if (students.some(s => s.sba > 30)) errors.push('SBA exceeds 30% limit');
    if (students.some(s => s.exam > 70)) errors.push('Exam exceeds 70% limit');
    if (students.some(s => s.auditStatus === 'MISSING')) errors.push('Missing behavioral observations');
    if (isTermFinalized) errors.push('CRITICAL: Term Finalized. Edits forbidden.');
    setStpErrors(errors);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F0F4F2]">
      <div className="flex-1 overflow-y-auto p-8 relative">
        {isTermFinalized && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="sticky top-0 left-0 right-0 z-50 mb-6">
            <div className="bg-rose-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-rose-900/20 border border-rose-500/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Lock size={20} /></div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">Final Seal Active</p>
                  <p className="text-[10px] font-bold text-rose-100 opacity-80 uppercase tracking-tight">Database locked for report generation. Contact admin for emergency triage.</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/20">Terminal State</div>
            </div>
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("max-w-full mx-auto transition-all", isTermFinalized && "opacity-60 grayscale-[0.3]")}>
          <header className="mb-8 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              {isCorrectionMode && <div className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg animate-pulse">Correction Mode</div>}
              {isMissingObsMode && <div className="px-3 py-1 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg animate-pulse">Compliance Mode</div>}
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">General Agric - SHS 1 Agric B</h1>
                <p className="text-gray-500 text-sm font-medium">Record the class and exam scores for your students below.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={runSTPValidation} className="p-3 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                <Zap size={18} /> STP Validation
              </button>
              {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl hover:bg-emerald-200 transition-all flex items-center gap-2 font-bold text-sm">
                  <ChevronLeft size={20} /> {isCorrectionMode ? 'Show Feedback' : isMissingObsMode ? 'Show Rubric' : 'Show Observation'}
                </button>
              )}
            </div>
          </header>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-4 py-4 text-xs font-black text-gray-900 border-r border-gray-100">ID</th>
                  <th className="px-4 py-4 text-xs font-black text-gray-900 border-r border-gray-100">Name</th>
                  {!isExamExpanded && <th className="px-4 py-4 text-xs font-black text-gray-900 border-r border-gray-100 text-center">SBA (30%)</th>}
                  {isExamExpanded && (
                    <>
                      <th className="px-4 py-4 text-xs font-black text-emerald-700 border-r border-gray-100 text-center bg-emerald-50/30">Sec A (40)</th>
                      <th className="px-4 py-4 text-xs font-black text-emerald-700 border-r border-gray-100 text-center bg-emerald-50/30">Sec B (60)</th>
                      <th className="px-4 py-4 text-xs font-black text-emerald-700 border-r border-gray-100 text-center bg-emerald-50/30">Sec C (40)</th>
                      <th className="px-4 py-4 text-xs font-black text-emerald-700 border-r border-gray-100 text-center bg-emerald-50/30">Total (140)</th>
                    </>
                  )}
                  <th className="px-4 py-4 text-xs font-black text-gray-900 border-r border-gray-100 text-center">
                    <div className="flex items-center justify-center gap-2">Exam (70%)<button onClick={toggleExamExpansion} className="text-emerald-600 hover:text-emerald-800 transition-colors">{isExamExpanded ? <MinusCircle size={18} /> : <PlusCircle size={18} />}</button></div>
                  </th>
                  <th className="px-4 py-4 text-xs font-black text-gray-900 border-r border-gray-100 text-center">Final</th>
                  <th className="px-4 py-4 text-xs font-black text-gray-900 border-r border-gray-100 text-center">Grade</th>
                  <th className="px-4 py-4 text-xs font-black text-slate-400 uppercase tracking-widest pl-6">Automated Smart Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student, idx) => {
                  const isTarget = (isCorrectionMode || isMissingObsMode) && student.id === targetStudentId;
                  const isGhosted = (isCorrectionMode || isMissingObsMode) && !isTarget;
                  return (
                    <tr key={idx} className={cn("transition-all group cursor-pointer", selectedStudent.id === student.id ? "bg-emerald-50/50" : "hover:bg-gray-50/50", isGhosted && "opacity-30 grayscale-[0.5]", showSTPOverlay && student.auditStatus === 'MISSING' && "bg-red-50")} onClick={() => setSelectedStudent(student)}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 border-r border-gray-100">
                        <div className="flex items-center gap-2">
                          {showSTPOverlay && student.auditStatus === 'MISSING' && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                          {student.index}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 border-r border-gray-100">{student.name}</td>
                      {!isExamExpanded && (
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 border-r border-gray-100 text-center">
                          <input type="number" value={student.sba} readOnly={isTermFinalized} onChange={(e) => updateMark(student.id, 'sba', e.target.value)} className="w-12 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-md" />
                        </td>
                      )}
                      {isExamExpanded && (
                        <>
                          <td className="px-4 py-4 text-sm font-medium text-emerald-800 border-r border-gray-100 text-center bg-emerald-50/10">
                            <input type="number" value={student.secA} readOnly={isTermFinalized} onChange={(e) => updateMark(student.id, 'secA', e.target.value)} className="w-12 bg-transparent text-center font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-md" />
                          </td>
                          <td className={cn("px-4 py-4 text-sm font-medium border-r border-gray-100 text-center transition-all", isTarget && isCorrectionMode ? "ring-2 ring-red-500 ring-inset bg-red-50/30 animate-pulse" : "bg-emerald-50/10 text-emerald-800")}>
                            {isTarget && isCorrectionMode ? (
                              <div className="flex flex-col items-center">
                                <input type="number" value={tempMark} readOnly={isTermFinalized} onChange={(e) => { setTempMark(e.target.value); updateMark(student.id, 'secB', e.target.value); }} className="w-12 bg-transparent text-center font-black text-red-700 focus:outline-none" />
                                <div className="text-[8px] font-black text-gray-400 flex items-center gap-1 mt-1"><span className="line-through">{mockStudents.find(m => m.id === student.id)?.secB}</span><ArrowRight size={8} /><span className="text-red-600">{tempMark}</span></div>
                              </div>
                            ) : (
                              <input type="number" value={student.secB} readOnly={isTermFinalized} onChange={(e) => updateMark(student.id, 'secB', e.target.value)} className="w-12 bg-transparent text-center font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-md" />
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-emerald-800 border-r border-gray-100 text-center bg-emerald-50/10">
                            <input type="number" value={student.secC} readOnly={isTermFinalized} onChange={(e) => updateMark(student.id, 'secC', e.target.value)} className="w-12 bg-transparent text-center font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-md" />
                          </td>
                          <td className="px-4 py-4 text-sm font-black text-emerald-900 border-r border-gray-100 text-center bg-emerald-50/20">{student.secA + student.secB + student.secC}</td>
                        </>
                      )}
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 border-r border-gray-100 text-center">
                        <input type="number" value={student.exam} readOnly={isTermFinalized} onChange={(e) => updateMark(student.id, 'exam', e.target.value)} className="w-12 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-md font-bold" />
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-gray-900 border-r border-gray-100 text-center">{student.final}</td>
                      <td className="px-4 py-4 text-sm font-black text-emerald-700 text-center bg-emerald-50/30 border-r border-gray-100">{student.grade}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 group/remark">
                          <Sparkles size={12} className="text-amber-400 opacity-0 group-hover/remark:opacity-100 transition-opacity" />
                          <p className="text-[10px] font-bold text-slate-500 italic uppercase tracking-tighter leading-tight max-w-[200px]">{student.remark || getSmartRemark(student.grade)}</p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <footer className="mt-8 flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isSubmissionLocked ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                {isSubmissionLocked ? <Lock size={20} /> : <ShieldCheck size={20} />}
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">{isSubmissionLocked ? "Submission Locked" : "Audit Readiness Passed"}</p>
                <p className="text-xs font-bold text-gray-500">{isSubmissionLocked ? `${missingCount} mandatory observations missing.` : "All mandatory observations logged. Guardrail lifted."}</p>
              </div>
            </div>
            <button disabled={isSubmissionLocked} className={cn("px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-lg", isSubmissionLocked ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/20")}>
              Submit All to HOD <ArrowRight size={18} />
            </button>
          </footer>
        </motion.div>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <ObservationSidebar
            mode={isCorrectionMode ? 'correction' : isMissingObsMode ? 'compliance' : 'behavioral'}
            student={selectedStudent}
            onClose={() => setIsSidebarOpen(false)}
            ratings={observationRatings}
            onRatingChange={(id, num) => setObservationRatings(prev => ({ ...prev, [id]: num }))}
            comment={observationComment}
            onCommentChange={setObservationComment}
            onSave={handleSaveObservation}
            hodFeedback={{ teacherName: 'Martha', message: "Total exceeds marks on script. Please verify the raw marks for Section B.", timeAgo: '2h ago' }}
            teacherReply={teacherReply}
            onReplyChange={setTeacherReply}
            onSecondaryAction={() => navigate('/revisions')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSTPOverlay && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSTPOverlay(false)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Zap size={28} /></div>
                  <button onClick={() => setShowSTPOverlay(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">STP Validation Scan</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-6">Scanning your current mark sheet for compliance and data integrity errors.</p>
                <div className="space-y-3 mb-8">
                  {['Score Range Validation', 'Mandatory Observations', 'Audit Trail Consistency', 'HOD Revision Alignment'].map((check, i) => {
                    const status = stpErrors.includes('Missing behavioral observations') && check === 'Mandatory Observations' ? 'FAIL' : 'PASS';
                    return (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-sm font-bold text-gray-700">{check}</span>
                        <span className={cn("text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest", status === 'PASS' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700 animate-pulse")}>{status}</span>
                      </div>
                    );
                  })}
                </div>
                {stpErrors.length > 0 ? (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8">
                    <p className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 flex items-center gap-2"><AlertCircle size={14} />Critical Errors Found</p>
                    <ul className="space-y-1">{stpErrors.map((err, i) => <li key={i} className="text-xs font-bold text-red-700">• {err}</li>)}</ul>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-8">
                    <p className="text-xs font-black text-emerald-900 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={14} />All Protocols Verified</p>
                  </div>
                )}
                <button onClick={() => setShowSTPOverlay(false)} className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl text-sm hover:bg-black transition-all">Close Validator</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAuditToast && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"><ShieldCheck size={20} /></div>
            <div><p className="font-black text-sm">All Mandatory Observations Logged</p><p className="text-xs font-bold text-emerald-100">Audit Guardrail Lifted. Submission Unlocked.</p></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
