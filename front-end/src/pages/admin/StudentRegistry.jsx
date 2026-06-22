import React, { useState, useMemo } from 'react';
import { 
  Search, Download, 
  ChevronRight, TrendingUp,
  Trash2, X, Lock,
  FileText, FileUp, 
  MoreVertical, GraduationCap,
  HeartPulse, Phone, MessageSquare, Activity,
  BarChart3, AlertCircle, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAllStudents, useCreateStudent } from '../../lib/hooks';
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

const StudentDossier = ({ 
  student, 
  onClose,
  executeSensitiveAction 
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
                <ResponsiveContainer width="100%" height="100%">
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
                  ? student.subjects.map((sub, i) => (
                      <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                              <FileText size={14} />
                           </div>
                           <span className="text-[12px] font-bold text-slate-700">{sub.subject}</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[11px] font-black italic font-display text-slate-400">{sub.score}%</span>
                           <span className={cn(
                             "px-2.5 py-1 rounded-lg text-[10px] font-black italic font-display",
                             sub.grade.startsWith('A') ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                           )}>
                             {sub.grade}
                           </span>
                        </div>
                      </div>
                    ))
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
                    { label: 'Date of Birth', value: student.dob },
                    { label: 'Batch ID', value: student.batch },
                    { label: 'Program Node', value: student.program },
                    { label: 'Residential Node', value: student.residentialStatus },
                    { label: 'House Cluster', value: student.house },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{item.label}</span>
                      <span className="text-[12px] font-black text-slate-900 italic font-display">{item.value}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">BECE Placement Dossier</p>
              <div className="space-y-4">
                  {[
                    { label: 'Placement Aggregate', value: student.beceAggregate },
                    { label: 'Primary Residency', value: student.beceResidency },
                    { label: 'Placement Protocol', value: student.placementType },
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
                <h3 className="text-xl font-black italic font-display text-slate-900 mb-1">{student.emergencyContact.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">{student.emergencyContact.relation}</p>
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
        <button className="flex-1 py-4 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
          <Download size={16} /> Dossier
        </button>
        <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest">
          Transcript
        </button>
      </div>
    </div>
  );
};

export const StudentRegistry = () => {
  const studentsQuery = useAllStudents();
  const createStudentMutation = useCreateStudent();
  const students = studentsQuery.data || [];
  const isLoading = studentsQuery.isLoading;

  const displayStudents = useMemo(() => students.map((s) => ({
    id: s.id,
    name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email || 'Unknown',
    indexNumber: s.studentProfile?.indexNumber || s.staffId || s.id,
    batch: '2025/2026',
    program: s.studentProfile?.currentClass?.name || s.department?.name || 'General',
    house: 'Nkrumah',
    averageGrade: 0,
    atRisk: false,
    gender: 'N/A',
    residentialStatus: 'Day',
    subjects: [],
    email: s.email,
    phone: s.phone,
    role: s.role,
  })), [students]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedHouse, setSelectedHouse] = useState('All');
  const [selectedResidence, setSelectedResidence] = useState('All');
  const [viewMode, setViewMode] = useState('Academic');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [showReverification, setShowReverification] = useState({ active: false, action: null });
  const [verificationPassword, setVerificationPassword] = useState('');

  const selectedStudent = useMemo(() => 
    displayStudents.find(s => s.id === selectedStudentId), 
    [displayStudents, selectedStudentId]
  );

  const filteredStudents = useMemo(() => {
    return displayStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           s.indexNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBatch = selectedBatch === 'All' || s.batch === selectedBatch;
      const matchesProgram = selectedProgram === 'All' || s.program === selectedProgram;
      const matchesHouse = selectedHouse === 'All' || s.house === selectedHouse;
      const matchesResidence = selectedResidence === 'All' || s.residentialStatus === selectedResidence;
      return matchesSearch && matchesBatch && matchesProgram && matchesHouse && matchesResidence;
    });
  }, [displayStudents, searchQuery, selectedBatch, selectedProgram, selectedHouse, selectedResidence]);

  const genderData = useMemo(() => [
    { name: 'Male', value: displayStudents.filter(s => s.gender === 'Male').length },
    { name: 'Female', value: displayStudents.filter(s => s.gender === 'Female').length },
  ], [displayStudents]);

  const atRiskCount = useMemo(() => 
    displayStudents.filter(s => s.atRisk).length,
    [displayStudents]
  );

  const housePerformanceData = useMemo(() => {
    return HOUSES.map(house => ({
      name: house,
      average: displayStudents.filter(s => s.house === house).length > 0
        ? Math.round(displayStudents.filter(s => s.house === house).reduce((sum, s) => sum + s.averageGrade, 0) / displayStudents.filter(s => s.house === house).length)
        : 0
    }));
  }, [displayStudents]);

  const confirmVerification = () => {
    if (verificationPassword === 'admin123') {
      const action = showReverification.action;
      setShowReverification({ active: false, action: null });
      setVerificationPassword('');
      if (action === 'export-all') alert('Generating Global Institutional Dossier...');
      if (action === 'delete-student') alert('Student Node Purged from Registry.');
      if (action === 'batch-reports') alert('Generating Terminal Reports for Category...');
    } else {
      alert('Security Violation: Invalid Administrative Override Password.');
    }
  };

  const executeSensitiveAction = (action) => {
    setShowReverification({ active: true, action });
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
             <button onClick={() => executeSensitiveAction('batch-reports')} className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
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
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={20} outerRadius={30} paddingAngle={5} dataKey="value">
                    <Cell fill="#0f172a" /><Cell fill="#94a3b8" />
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender Equity</p>
               <p className="text-xl font-black italic font-display text-slate-900">1.1 : 1.0</p>
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
            {housePerformanceData.slice(0, 2).map(house => (
              <div key={house.name} className="flex-1 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{house.name}</p>
                  <p className="text-[10px] font-black text-slate-900">{house.average}%</p>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${house.average}%` }} transition={{ duration: 1 }} className="h-full bg-slate-900" />
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
            <Select value={selectedBatch} onValueChange={(e) => setSelectedBatch(e.target.value)} className="w-full">
              <SelectTrigger>
                <SelectValue placeholder="All Batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Batches</SelectItem>
                {BATCHES.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select value={selectedHouse} onValueChange={(e) => setSelectedHouse(e.target.value)} className="w-full">
              <SelectTrigger>
                <SelectValue placeholder="All Houses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Houses</SelectItem>
                {HOUSES.map(h => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedResidence} onValueChange={(e) => setSelectedResidence(e.target.value)} className="w-full">
              <SelectTrigger>
                <SelectValue placeholder="All Residencies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Residencies</SelectItem>
                <SelectItem value="Boarder">Boarder</SelectItem>
                <SelectItem value="Day">Day</SelectItem>
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
             <Button onClick={() => executeSensitiveAction('export-all')} className="p-3">
                <Download size={20} />
             </Button>
             <Button onClick={() => alert('Launching Index Number Generator...')} variant="outline" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest font-display italic">
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
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">House</TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{viewMode === 'Academic' ? 'Performance' : 'Fees'}</TableHead>
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
                  <TableCell className="px-6 py-5">
                     <span className="text-[12px] font-black text-slate-900">{stu.house}</span>
                  </TableCell>
                   <TableCell className="px-6 py-5 text-center">
                      {viewMode === 'Academic' ? (
                         <Badge className={cn(
                           stu.averageGrade >= 75 ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                         )}>
                           {stu.averageGrade}%
                         </Badge>
                      ) : (
                         <Badge className={cn(
                           stu.feesStatus === 'Paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                         )}>
                           {stu.feesStatus}
                         </Badge>
                      )}
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
                executeSensitiveAction={executeSensitiveAction}
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
                   <h3 className="text-2xl font-black italic font-display text-slate-900 mb-2">Executive Override</h3>
                   <input type="password" placeholder="Enter Password" value={verificationPassword} onChange={(e) => setVerificationPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-center font-black tracking-widest mb-8 outline-none" />
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
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-12 text-center">
                   <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10"><FileUp size={48} /></div>
                   <h3 className="text-3xl font-black italic font-display text-slate-900 mb-4">Batch Intake</h3>
                   <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] py-16 mb-12 hover:bg-slate-50 cursor-pointer">
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Drop CSSPS File</p>
                   </div>
                   <div className="flex gap-4">
                      <button onClick={() => setIsBatchUploading(false)} className="flex-1 py-5 bg-slate-50 rounded-[2rem] text-[11px] font-black uppercase tracking-widest">Cancel</button>
                      <button className="flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest">Verify</button>
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
                      <select className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"><option>Source Cohort</option></select>
                      <select className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"><option>Destination Pipeline</option></select>
                   </div>
                   <div className="flex gap-4">
                      <button onClick={() => setIsPromoting(false)} className="flex-1 py-5 bg-slate-50 rounded-[2rem] text-[11px] font-black uppercase tracking-widest">Abort</button>
                      <button className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest">Execute</button>
                   </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};