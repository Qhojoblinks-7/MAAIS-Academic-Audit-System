import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, ChevronRight, TrendingUp, Trash2, X, Lock,
  FileText, FileUp, MoreVertical, GraduationCap, HeartPulse,
  Phone, MessageSquare, Activity, BarChart3, AlertCircle, Users,
  CheckCircle, Flag, Shield, ShieldCheck, AlertTriangle, UserPlus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAllStudents, usePromoteStudent, useDeactivateUser, useUpdateStudentProfile, useCreateStudent, useBatchImportStudents, useAllClasses, useAllDepartments } from '../../lib/hooks';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '../../components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '../../components/molecules';
import { toast, Toaster } from '../../components/ui/toast.tsx';

const StudentDossier = ({ student, onClose, onGenerateReport, onBuildTranscript }) => {
  const [activeTab, setActiveTab] = useState('Academic');

  const performanceData = [
    { term: 'SHS1 T1', grade: Math.round(student.averageGrade - 7) },
    { term: 'SHS1 T2', grade: Math.round(student.averageGrade - 4) },
    { term: 'SHS1 T3', grade: Math.round(student.averageGrade - 2) },
    { term: 'SHS2 T1', grade: student.averageGrade },
  ];

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-6 bg-brand-dark text-primary-foreground shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-foreground/10 rounded-2xl flex items-center justify-center text-primary-foreground ring-1 ring-primary-foreground/20">
              <GraduationCap size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black italic font-display">{student.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground/50">{student.indexNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-primary-foreground/10 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'Academic', label: 'Academic', icon: BarChart3 },
            { id: 'BioData', label: 'Bio-Data', icon: FileText },
            { id: 'Log', label: 'Welfare', icon: Activity },
            { id: 'Guardian', label: 'Guardian', icon: Phone },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === tab.id ? 'bg-primary-foreground text-brand-dark shadow-xl' : 'bg-primary-foreground/5 text-primary-foreground/60 hover:bg-primary-foreground/10'
            )}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-muted scrollbar-hide">
        {activeTab === 'Academic' && (
          <div className="space-y-4">
            <div className="bg-surface p-5 rounded-3xl border border-border shadow-sm">
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-4">Longitudinal Performance</h4>
              <div className="h-32 w-full mb-4">
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
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3">Subject Ledger</h4>
              <div className="space-y-2">
                {student.subjects && student.subjects.length > 0 ? student.subjects.map((sub, i) => {
                  const subjectName = sub.subject?.name || sub.subject || 'Unknown';
                  const totalScore = sub.totalScore ?? sub.classScore ?? sub.examScore ?? 0;
                  const letterGrade = sub.grade || (totalScore >= 80 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 60 ? 'C' : 'D');
                  return (
                    <div key={i} className="flex justify-between items-center p-3 hover:bg-muted rounded-2xl transition-all border border-transparent hover:border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-text-secondary"><FileText size={14} /></div>
                        <span className="text-[12px] font-bold text-text-primary">{subjectName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black italic font-display text-text-secondary">{totalScore}%</span>
                        <span className={cn('px-2 py-1 rounded-lg text-[10px] font-black italic font-display',
                          letterGrade.startsWith('A') || letterGrade.startsWith('1') ? 'bg-brand-primary/10 text-brand-primary' : 'bg-muted text-text-secondary')}>
                          {letterGrade}
                        </span>
                      </div>
                    </div>
                  );
                }) : <EmptyState context="students" variant="compact" />}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'BioData' && (
          <div className="space-y-4">
            <div className="bg-surface p-5 rounded-3xl border border-border shadow-sm">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-4">Institutional Identity</p>
              <div className="space-y-3">
                {[
                  { label: 'Index Number', value: student.indexNumber },
                  { label: 'Date of Birth', value: student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A' },
                  { label: 'Program', value: student.program },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">{item.label}</span>
                    <span className="text-[12px] font-black text-text-primary italic font-display">{item.value || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'Log' && (
          <div className="space-y-3">
            <div className="p-5 bg-surface border border-border rounded-3xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center"><HeartPulse size={16} /></div>
                <h4 className="text-[10px] font-black text-text-primary uppercase tracking-widest">Medical Log</h4>
              </div>
              <p className="text-xs font-bold text-text-secondary leading-relaxed italic">{student.healthNotes || 'No acute medical flags inherited.'}</p>
            </div>
            <div className="p-5 bg-surface border border-border rounded-3xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-warning/10 text-warning rounded-lg flex items-center justify-center"><AlertCircle size={16} /></div>
                <h4 className="text-[10px] font-black text-text-primary uppercase tracking-widest">Discipline Log</h4>
              </div>
              <p className="text-xs font-bold text-text-secondary leading-relaxed italic">{student.disciplinaryNotes || 'Institutional conduct threshold maintained.'}</p>
            </div>
          </div>
        )}
        {activeTab === 'Guardian' && (
          <div className="space-y-4">
            <div className="bg-surface p-6 rounded-4xl border border-border shadow-sm text-center">
              <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center text-text-secondary mx-auto mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-black italic font-display text-text-primary mb-1">{student.emergencyContact?.name || 'Guardian Not Linked'}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{student.emergencyContact?.relation || 'No parent association'}</p>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-3 bg-brand-dark text-primary-foreground rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"><Phone size={14} /> Voice</button>
                <button className="flex-1 py-3 bg-surface text-text-primary border border-border rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"><MessageSquare size={14} /> SMS</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-6 bg-surface border-t border-border flex gap-3 shrink-0">
        <button onClick={() => { onGenerateReport?.(student.id); }} className="flex-1 py-3 border border-border rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
          <FileText size={16} /> Dossier
        </button>
        <button onClick={() => { onBuildTranscript?.(student.id); }} className="flex-1 py-3 bg-brand-dark text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest">
          Transcript
        </button>
      </div>
    </div>
  );
};

export function HODStudentRegistry() {
  const studentsQuery = useAllStudents();
  const classesQuery = useAllClasses();
  const departmentsQuery = useAllDepartments();
  const promoteStudentMutation = usePromoteStudent();
  const deactivateUserMutation = useDeactivateUser();
  const updateStudentProfileMutation = useUpdateStudentProfile();
  const students = studentsQuery.data || [];
  const classes = classesQuery.data || [];
  const departments = departmentsQuery.data || [];
  const isLoading = studentsQuery.isLoading;

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
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [openKebabId, setOpenKebabId] = useState(null);
  const [showReverification, setShowReverification] = useState({ active: false, action: null });
  const [adminPassword, setAdminPassword] = useState('');
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [csspsFile, setCsspsFile] = useState(null);
  const [csspsPreview, setCsspsPreview] = useState([]);
  const [csspsError, setCsspsError] = useState('');
  const [isProcessingCssps, setIsProcessingCssps] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const createStudentMutation = useCreateStudent();
  const batchImportMutation = useBatchImportStudents();

  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', indexNumber: '', gender: 'MALE', dateOfBirth: '', residentialStatus: 'DAY', classId: '',
    parentFirstName: '', parentLastName: '', parentPhone: '', parentEmail: '', parentRelationship: 'Guardian',
  });

  const displayStudents = useMemo(() => students.map((s) => {
    const parentLink = s.parentLinks?.[0];
    const grades = s.grades || [];
    const avgGrade = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + (g.totalScore || g.score || 0), 0) / grades.length) : 0;
    const program = s.department?.name || s.currentClass?.program || 'General';
    return {
      id: s.id || s.userId,
      name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.user?.email || 'Unknown',
      indexNumber: s.indexNumber,
      currentClass: s.currentClass?.name || 'Unassigned',
      program,
      averageGrade: avgGrade,
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

  const selectedStudent = useMemo(() => displayStudents.find(s => s.id === selectedStudentId), [displayStudents, selectedStudentId]);

  const filteredStudents = useMemo(() => {
    return displayStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.indexNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProgram = selectedProgram === 'All' || s.program === selectedProgram;
      return matchesSearch && matchesProgram;
    });
  }, [displayStudents, searchQuery, selectedProgram]);

  const confirmVerification = async () => {
    const action = showReverification.action;
    setShowReverification({ active: false, action: null });
    try {
      if (action === 'delete-student' && selectedStudentId) {
        if (!adminPassword || adminPassword.length < 4) {
          alert('Invalid administrative password override');
          return;
        }
        await deactivateUserMutation.mutateAsync(selectedStudentId);
        setSelectedStudentId(null);
        setAdminPassword('');
      }
    } catch (err) {
      alert(`Action failed: ${err.message || 'Unknown error'}`);
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
        break;
      case 'purge':
        executeSensitiveAction('delete-student');
        setSelectedStudentId(studentId);
        break;
      default:
        break;
    }
  };

  const handleCreateStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.indexNumber) {
      alert('Name and index number are required');
      return;
    }
    try {
      await createStudentMutation.mutateAsync({
        ...newStudent,
        isBoarder: newStudent.residentialStatus === 'BOARDING',
        password: 'Student@123!',
        parentFirstName: newStudent.parentFirstName,
        parentLastName: newStudent.parentLastName,
        parentPhone: newStudent.parentPhone,
        parentEmail: newStudent.parentEmail,
        parentRelationship: newStudent.parentRelationship,
      });
      setShowCreateForm(false);
      setNewStudent({ firstName: '', lastName: '', indexNumber: '', gender: 'MALE', dateOfBirth: '', residentialStatus: 'DAY', classId: '', parentFirstName: '', parentLastName: '', parentPhone: '', parentEmail: '', parentRelationship: 'Guardian' });
    } catch (err) {
      alert('Failed to create student: ' + (err.message || err));
    }
  };

  const parseCsvContent = (content) => {
    const results = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
    });
    if (results.errors.length > 0 && results.data.length === 0) {
      throw new Error(results.errors[0].message);
    }
    return results.data.filter(r => r.index_number || r.first_name || r.last_name || r.indexnumber || r.firstname || r.lastname);
  };

  const parseXlsxContent = (content) => {
    const workbook = XLSX.read(content, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    return jsonData.map(row => {
      const normalized = {};
      Object.entries(row).forEach(([key, value]) => {
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        normalized[normalizedKey] = value !== undefined && value !== null ? String(value).trim() : '';
      });
      return normalized;
    }).filter(r => r.index_number || r.first_name || r.last_name || r.indexnumber || r.firstname || r.lastname);
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
        let records;
        if (file.name.match(/\.xlsx?$/i)) {
          records = parseXlsxContent(content);
        } else {
          records = parseCsvContent(content);
        }
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
  };

  const handleProcessCsspsUpload = async () => {
    if (!csspsPreview.length) return;

    const validationErrors = [];
    const seenIndexNumbers = new Set();
    const validClassIds = new Set((classes || []).map(c => c.id));
    const validClassNames = new Set((classes || []).map(c => c.name));
    const validDeptIds = new Set((departments || []).map(d => d.id));
    const validDeptNames = new Set((departments || []).map(d => d.name));

    csspsPreview.forEach((record, idx) => {
      const rowNum = idx + 2;
      const indexNum = record.index_number || record.indexnumber || record.index || '';
      if (!indexNum) {
        validationErrors.push(`Row ${rowNum}: Missing index number`);
      } else {
        if (seenIndexNumbers.has(indexNum)) {
          validationErrors.push(`Row ${rowNum}: Duplicate index number ${indexNum}`);
        }
        seenIndexNumbers.add(indexNum);
      }

      const firstName = record.first_name || record.firstname || record.firstName || '';
      const lastName = record.last_name || record.lastname || record.lastName || '';
      if (!firstName) validationErrors.push(`Row ${rowNum}: Missing first name`);
      if (!lastName) validationErrors.push(`Row ${rowNum}: Missing last name`);

      const classId = record.currentclassid || record.currentClassId || '';
      const className = record.classname || record.className || record.class_name || '';
      if (classId && !validClassIds.has(classId)) {
        validationErrors.push(`Row ${rowNum}: Invalid class ID "${classId}"`);
      }
      if (className && !validClassNames.has(className)) {
        validationErrors.push(`Row ${rowNum}: Unknown class name "${className}"`);
      }

      const deptId = record.departmentid || record.departmentId || '';
      const deptName = record.departmentname || record.departmentName || record.department_name || '';
      if (deptId && !validDeptIds.has(deptId)) {
        validationErrors.push(`Row ${rowNum}: Invalid department ID "${deptId}"`);
      }
      if (deptName && !validDeptNames.has(deptName)) {
        validationErrors.push(`Row ${rowNum}: Unknown department name "${deptName}"`);
      }
    });

    if (validationErrors.length > 0) {
      setCsspsError(`Validation failed (${validationErrors.length} issue(s)):\n${validationErrors.slice(0, 15).join('\n')}${validationErrors.length > 15 ? `\n...and ${validationErrors.length - 15} more` : ''}`);
      return;
    }

    setIsProcessingCssps(true);

    const students = csspsPreview.map(record => ({
      indexNumber: record.index_number || record.indexnumber || record.index || `MSHTS/2024/${String(Date.now()).slice(-6)}`,
      firstName: record.first_name || record.firstname || record.firstName || '',
      lastName: record.last_name || record.lastname || record.lastName || '',
      middleName: record.middle_name || record.middlename || record.middleName || '',
      gender: (record.gender || 'MALE').toUpperCase(),
      dateOfBirth: record.date_of_birth || record.dob || record.dateofbirth || record.dateOfBirth,
      currentClassId: record.currentclassid || record.currentClassId || '',
      departmentId: record.departmentid || record.departmentId || '',
      className: record.classname || record.className || record.class_name || '',
      departmentName: record.departmentname || record.departmentName || record.department_name || '',
      parentFirstName: record.parentfirstname || record.parentFirstName || record.parent_first_name || '',
      parentLastName: record.parentlastname || record.parentLastName || record.parent_last_name || '',
      parentPhone: record.parentphone || record.parentPhone || record.parent_phone || '',
      parentEmail: record.parentemail || record.parentEmail || record.parent_email || '',
      parentRelationship: record.parentrelationship || record.parentRelationship || record.parent_relationship || 'Guardian',
      isBoarder: (record.residential_status || record.isBoarder || '').toUpperCase() === 'BOARDING',
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

  const downloadTemplateCsv = () => {
    const sampleClass = classes.length > 0 ? classes[0] : null;
    const sampleDept = departments.length > 0 ? departments[0] : null;
    const headers = ['indexNumber','firstName','lastName','middleName','gender','dateOfBirth','residentialStatus','className','departmentName','currentClassId','departmentId','parentFirstName','parentLastName','parentPhone','parentEmail','parentRelationship'];
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
  };

  return (
    <div className="flex-1 flex flex-col bg-muted overflow-hidden relative">
      <header className="px-6 py-4 bg-surface border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-text-primary italic font-display tracking-tight leading-none">
              Student Enrolment
            </h1>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Learner Population Records : {isLoading ? '...' : `${students.length} Enrolled`}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="px-4 py-2 text-[10px] font-black uppercase tracking-widest" onClick={() => setIsBatchUploading(true)}>
              <FileUp size={14} /> Bulk Import
            </Button>
            <Button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest" onClick={() => setShowCreateForm(true)}>
              <UserPlus size={14} /> Register Student
            </Button>
            <Button variant="outline" className="px-4 py-2 text-[10px] font-black uppercase tracking-widest" onClick={() => {
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
              a.download = 'student-ledger.csv';
              a.click();
              URL.revokeObjectURL(url);
              toast.success(`Exported ${filteredStudents.length} student records`);
            }}>
              <Download size={14} /> Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="px-6 py-4 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5" />
          </div>
              <Select value={selectedProgram} onValueChange={(value) => setSelectedProgram(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Programs</SelectItem>
                  {programs.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                </SelectContent>
              </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative scrollbar-hide">
        <Table containerClassName="overflow-visible">
          <TableHeader>
            <TableRow className="bg-muted/80 border-b border-border">
              <TableHead className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Index / Name</TableHead>
              <TableHead className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Class</TableHead>
              <TableHead className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Program</TableHead>
              <TableHead className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Performance</TableHead>
              <TableHead className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((stu) => (
              <TableRow key={stu.id} className="group bg-surface hover:bg-muted/50 cursor-pointer transition-all border-b border-border/50" onClick={() => setSelectedStudentId(stu.id)}>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center text-text-secondary group-hover:bg-brand-dark group-hover:text-primary-foreground transition-all"><GraduationCap size={16} /></div>
                    <div>
                      <p className="text-[13px] font-black italic font-display text-text-primary leading-none mb-1">{stu.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{stu.indexNumber}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4"><span className="text-xs font-black text-text-primary">{stu.currentClass}</span></TableCell>
                <TableCell className="px-6 py-4"><span className="text-xs font-black text-text-primary">{stu.program}</span></TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <Badge className={cn('text-[9px] font-black uppercase tracking-widest',
                    stu.averageGrade >= 75 ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-primary/10 text-brand-primary')}>
                    {stu.averageGrade}%
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="relative inline-block">
                    <button onClick={(e) => { e.stopPropagation(); setOpenKebabId(openKebabId === stu.id ? null : stu.id); }} className="p-2 bg-muted text-text-secondary hover:bg-brand-dark hover:text-primary-foreground rounded-xl transition-all">
                      <MoreVertical size={16} />
                    </button>
                    {openKebabId === stu.id && (
                      <div className="absolute right-0 top-10 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 py-1">
                        <button onClick={() => handleKebabAction(stu.id, 'dossier')} className="w-full text-left px-3 py-2 text-[10px] font-bold text-text-primary hover:bg-muted flex items-center gap-2"><FileText size={12} className="text-brand-primary" /> View Full Dossier</button>
                        <button onClick={() => handleKebabAction(stu.id, 'purge')} className="w-full text-left px-3 py-2 text-[10px] font-bold text-destructive hover:bg-destructive/10 flex items-center gap-2"><Trash2 size={12} /> Purge Record</button>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredStudents.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-text-secondary mb-4 font-display italic text-2xl">?</div>
            <EmptyState context="students" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStudentId(null)} className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative w-full max-w-xl bg-surface h-full shadow-2xl">
              <StudentDossier student={selectedStudent} onClose={() => setSelectedStudentId(null)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReverification.active && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-surface rounded-[2.5rem] shadow-2xl p-8 text-center">
              <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock size={24} /></div>
              <h3 className="text-xl font-black italic font-display text-text-primary mb-2">Confirm Action</h3>
              <p className="text-xs text-text-secondary mb-5">This action requires administrative authorization. Please confirm to proceed.</p>
              {showReverification.action === 'delete-student' && (
                <div className="mb-5">
                  <input type="password" placeholder="Enter admin password override" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-4 py-3 border border-border rounded-xl text-xs font-bold text-center outline-none focus:ring-2 focus:ring-destructive" />
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setShowReverification({ active: false, action: null }); setAdminPassword(''); }} className="flex-1 py-3 bg-muted rounded-xl text-[10px] font-black uppercase tracking-widest">Abort</button>
                <button onClick={confirmVerification} className="flex-1 py-3 bg-brand-dark text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest">Authorize</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
               <div>
                 <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 block">Residential Status</label>
                 <select value={newStudent.residentialStatus} onChange={(e) => setNewStudent({...newStudent, residentialStatus: e.target.value})} className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-bold">
                   <option value="DAY">Day Student</option>
                   <option value="BOARDING">Boarding Student</option>
                 </select>
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

              <p className="text-[10px] text-text-secondary mt-4">Default password: Student@123! Student will be prompted to change it on first login.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowCreateForm(false)} className="flex-1 py-4 bg-muted rounded-[2rem] text-[11px] font-black uppercase tracking-widest">Cancel</button>
                <button onClick={handleCreateStudent} disabled={creatingStudent || !newStudent.firstName || !newStudent.indexNumber} className={cn("flex-1 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest", creatingStudent || !newStudent.firstName || !newStudent.indexNumber ? "bg-muted text-text-secondary cursor-not-allowed" : "bg-brand-primary text-primary-foreground")}>
                  {creatingStudent ? 'Registering...' : 'Register Student'}
                </button>
              </div>
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
                id="hod-cssps-file-input"
              />
              <label
                htmlFor="hod-cssps-file-input"
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
                onClick={downloadTemplateCsv}
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
                 onClick={() => { setIsBatchUploading(false); setCsspsPreview([]); setCsspsFile(null); setCsspsError(''); setImportResults(null); }}
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
      <Toaster />
    </div>
  );
}

export default HODStudentRegistry;
