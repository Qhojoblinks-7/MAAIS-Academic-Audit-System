import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Search, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  Printer,
  Calendar,
  User,
  Users,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Award,
  BookOpen,
  Lock,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { cn } from '../../lib/utils';
import { HODArchiveDetailView } from './HODArchiveDetailView';

// Helper to calculate WAEC Grade (simple version)
const getWAECGrade = (score) => {
  if (score >= 80) return 'A1';
  if (score >= 70) return 'B2';
  if (score >= 65) return 'B3';
  if (score >= 60) return 'C4';
  if (score >= 55) return 'C5';
  if (score >= 50) return 'C6';
  if (score >= 45) return 'D7';
  if (score >= 40) return 'E8';
  return 'F9';
};

// Rich HOD Mock dataset representing both current student badges and graduated historical alumni - perfectly mirroring the Teacher's source dataset for truth consistency
const mockHODAlumni = [
  {
    id: 't_s_f3_01',
    name: 'Kingsley Boateng',
    index: 'MAAIS-2026-F3-01',
    graduationYear: '2026',
    currentClass: 'SHS 3 Science A',
    department: 'Science',
    consistencyScore: 'High Steady',
    status: 'Archive Inbound',
    hodComment: 'Active student file. Past longitudinal cycles (Form 1 & 2) certified & sealed in registry.',
    finalWassce: 'Pending',
    history: [
      { term: 'SHS 1-T1', finalGrade: 78, behaviorRating: 4 },
      { term: 'SHS 1-T2', finalGrade: 80, behaviorRating: 5 },
      { term: 'SHS 1-T3', finalGrade: 83, behaviorRating: 5 },
      { term: 'SHS 2-T1', finalGrade: 81, behaviorRating: 4 },
      { term: 'SHS 2-T2', finalGrade: 85, behaviorRating: 4 },
      { term: 'SHS 2-T3', finalGrade: 87, behaviorRating: 5 }
    ],
    observations: [
      { id: 'obs_f3_1', date: '2025-05-12', type: 'Practicals', comment: 'Demonstrates exceptional grasp of laboratory preparation controls.', teacherName: 'Mr. Boateng' }
    ],
    interventions: []
  },
  {
    id: 't_s_f2_01',
    name: 'Priscilla Baah',
    index: 'MAAIS-2027-F2-01',
    graduationYear: '2027',
    currentClass: 'SHS 2 Science B',
    department: 'Science',
    consistencyScore: 'Steady Climb',
    status: 'Archive Inbound',
    hodComment: 'Active student file. First-year longitudinal cycle (Form 1) certified and sealed in registry.',
    finalWassce: 'Pending',
    history: [
      { term: 'SHS 1-T1', finalGrade: 70, behaviorRating: 4 },
      { term: 'SHS 1-T2', finalGrade: 73, behaviorRating: 4 },
      { term: 'SHS 1-T3', finalGrade: 75, behaviorRating: 5 }
    ],
    observations: [
      { id: 'obs_f2_1', date: '2024-11-10', type: 'Academic', comment: 'Resilient approach to soil chemistry theory.', teacherName: 'Mr. Appiah' }
    ],
    interventions: []
  },
  {
    id: 't_s_f1_01',
    name: 'Emmanuel Eshun',
    index: 'MAAIS-2028-F1-01',
    graduationYear: '2028',
    currentClass: 'SHS 1 Agric B',
    department: 'Science',
    consistencyScore: 'No Record',
    status: 'Empty Archive',
    hodComment: 'Active SHS 1 student. Historical record begins compiling upon completion of Form 1.',
    finalWassce: 'Building',
    history: [],
    observations: [],
    interventions: []
  },
  {
    id: 't_s01',
    name: 'Angela Owusu',
    index: 'MAAIS-2024-001',
    graduationYear: '2024',
    currentClass: 'Class of 2024 (Science)',
    department: 'Science',
    consistencyScore: 'High Steady',
    status: 'Archived & Verified',
    hodComment: 'Continuous assessment values audited. Certified successfully for terminal WAEC dispatch and archived in The Vault.',
    finalWassce: 'A1',
    history: [
      { term: 'SHS 1-T1', finalGrade: 85, behaviorRating: 5 },
      { term: 'SHS 1-T2', finalGrade: 88, behaviorRating: 5 },
      { term: 'SHS 1-T3', finalGrade: 90, behaviorRating: 4 },
      { term: 'SHS 2-T1', finalGrade: 82, behaviorRating: 4 },
      { term: 'SHS 2-T2', finalGrade: 78, behaviorRating: 3 },
      { term: 'SHS 2-T3', finalGrade: 92, behaviorRating: 5 },
      { term: 'SHS 3-T1', finalGrade: 90, behaviorRating: 5 },
      { term: 'SHS 3-T2', finalGrade: 89, behaviorRating: 5 },
      { term: 'SHS 3-T3', finalGrade: 94, behaviorRating: 5 }
    ],
    observations: [
      { id: 'obs1', date: '2024-03-15', type: 'Lab Safety', comment: 'Excellent handling of agricultural soil testing equipment.', teacherName: 'Mr. Boateng' },
      { id: 'obs2', date: '2024-06-10', type: 'Behavioral', comment: 'Active leader in our hands-on field experiments.', teacherName: 'Mrs. Mensah' }
    ],
    interventions: [
      { 
        id: 'int1', 
        term: 'SHS 2-T2', 
        year: '2023', 
        reason: 'Decline in practical exams', 
        action: 'Assigned to remedial microscope drills', 
        outcome: 'Practical assessment score improved by 14% peak' 
      }
    ]
  },
  {
    id: 't_s02',
    name: 'Samuel Larbi Owusu',
    index: 'MAAIS-2024-002',
    graduationYear: '2024',
    currentClass: 'Class of 2024 (Science)',
    department: 'Science',
    consistencyScore: 'Steady Climb',
    status: 'Archived & Verified',
    hodComment: 'Qualitative diaries resolved. Transcripts locked under final compliance guidelines.',
    finalWassce: 'B2',
    history: [
      { term: 'SHS 1-T1', finalGrade: 51, behaviorRating: 3 },
      { term: 'SHS 1-T2', finalGrade: 55, behaviorRating: 4 },
      { term: 'SHS 1-T3', finalGrade: 58, behaviorRating: 4 },
      { term: 'SHS 2-T1', finalGrade: 62, behaviorRating: 4 },
      { term: 'SHS 2-T2', finalGrade: 68, behaviorRating: 5 },
      { term: 'SHS 2-T3', finalGrade: 72, behaviorRating: 5 },
      { term: 'SHS 3-T1', finalGrade: 75, behaviorRating: 5 },
      { term: 'SHS 3-T2', finalGrade: 78, behaviorRating: 5 },
      { term: 'SHS 3-T3', finalGrade: 82, behaviorRating: 5 }
    ],
    observations: [
      { id: 'obs3', date: '2023-11-20', type: 'Resource Economy', comment: 'Strong leadership improvements and stellar lab report writing.', teacherName: 'Mr. Appiah' }
    ],
    interventions: [
      { 
        id: 'int2', 
        term: 'SHS 1-T3', 
        year: '2022', 
        reason: 'Initial average below 60%', 
        action: 'Mandatory clinical study hall', 
        outcome: 'Began progressive upwards transition over remaining periods' 
      }
    ]
  },
  {
    id: 't_s03',
    name: 'Esmeralda Kyeiwaa',
    index: 'MAAIS-2023-001',
    graduationYear: '2023',
    currentClass: 'Class of 2023 (Science)',
    department: 'Science',
    consistencyScore: 'Highly Stable',
    status: 'Archived & Verified',
    hodComment: 'Stellar academic posture sustained. Verified clear by department. Transcripts frozen.',
    finalWassce: 'A1',
    history: [
      { term: 'SHS 1-T1', finalGrade: 89, behaviorRating: 5 },
      { term: 'SHS 1-T2', finalGrade: 91, behaviorRating: 5 },
      { term: 'SHS 1-T3', finalGrade: 90, behaviorRating: 5 },
      { term: 'SHS 2-T1', finalGrade: 93, behaviorRating: 5 },
      { term: 'SHS 2-T2', finalGrade: 92, behaviorRating: 5 },
      { term: 'SHS 2-T3', finalGrade: 94, behaviorRating: 5 },
      { term: 'SHS 3-T1', finalGrade: 95, behaviorRating: 5 },
      { term: 'SHS 3-T2', finalGrade: 96, behaviorRating: 5 },
      { term: 'SHS 3-T3', finalGrade: 95, behaviorRating: 5 }
    ],
    observations: [
      { id: 'obs_e1', date: '2023-04-12', type: 'Academic Drive', comment: 'Stellar performance throughout the physics lab series.', teacherName: 'Mr. Appiah' }
    ],
    interventions: []
  },
  {
    id: 't_s04',
    name: 'Kwame Mensah',
    index: 'MAAIS-2023-002',
    graduationYear: '2023',
    currentClass: 'Class of 2023 (Agric Science)',
    department: 'Science',
    consistencyScore: 'Recovered',
    status: 'Archived & Verified',
    hodComment: 'Board certified. Satisfied and cleared academic requirements with remarkable perseverance.',
    finalWassce: 'B3',
    history: [
      { term: 'SHS 1-T1', finalGrade: 45, behaviorRating: 3 },
      { term: 'SHS 1-T2', finalGrade: 48, behaviorRating: 3 },
      { term: 'SHS 1-T3', finalGrade: 42, behaviorRating: 3 },
      { term: 'SHS 2-T1', finalGrade: 55, behaviorRating: 4 },
      { term: 'SHS 2-T2', finalGrade: 60, behaviorRating: 4 },
      { term: 'SHS 2-T3', finalGrade: 65, behaviorRating: 4 },
      { term: 'SHS 3-T1', finalGrade: 68, behaviorRating: 5 },
      { term: 'SHS 3-T2', finalGrade: 72, behaviorRating: 5 },
      { term: 'SHS 3-T3', finalGrade: 75, behaviorRating: 5 }
    ],
    observations: [
      { id: 'obs4', date: '2022-11-20', type: 'Safety First', comment: 'Constant growth and adherence to chemistry safety measures.', teacherName: 'Mr. Appiah' }
    ],
    interventions: [
      { 
        id: 'int3', 
        term: 'SHS 1-T3', 
        year: '2021', 
        reason: 'Weighted Average below 45%', 
        action: 'Mandatory clinical study hall', 
        outcome: 'Began upward transition over next three periods' 
      }
    ]
  }
];

export function HODArchiveView() {
  const [activeSubTab, setActiveSubTab] = React.useState('VAULT');
  const [students] = React.useState(mockHODAlumni);
  const [selectedStudent, setSelectedStudent] = React.useState(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedClass, setSelectedClass] = React.useState('ALL');
  const [selectedYear, setSelectedYear] = React.useState('ALL');

  // Promotion Pipeline logic (the active link to creating files of the past)
  // Re-modelling this to convey: promotion cycle seals the active senior year, pushes them to archive, and moves other years up.
  const [isPromoting, setIsPromoting] = React.useState(false);
  const [promotionProgress, setPromotionProgress] = React.useState(0);
  const [promotionLogged, setPromotionLogged] = React.useState(false);

  // Filter computation
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.index.includes(searchTerm);
    const matchesClass = selectedClass === 'ALL' || s.currentClass === selectedClass;
    const matchesYear = selectedYear === 'ALL' || s.graduationYear === selectedYear;
    return matchesSearch && matchesClass && matchesYear;
  });

  const terms = ['SHS 1-T1', 'SHS 1-T2', 'SHS 1-T3', 'SHS 2-T1', 'SHS 2-T2', 'SHS 2-T3', 'SHS 3-T1', 'SHS 3-T2', 'SHS 3-T3'];

  // Global counts & stats
  const totalAlumniCount = students.length;
  const verifiedSealsCount = students.filter(s => s.status === 'Archived & Verified').length;
  
  const totalGradesArray = students.flatMap(s => (s.history || []).map(h => h.finalGrade));
  const departmentAverage = totalGradesArray.length > 0 ? (totalGradesArray.reduce((a, b) => a + b, 0) / totalGradesArray.length).toFixed(1) : 'N/A';

  // High-level statistics of past years for HOD comparative chart
  const graduatedPerformanceData = [
    { year: '2021 Cohort', AvgGrade: 72.4, HighGrade: 91 },
    { year: '2022 Cohort', AvgGrade: 76.8, HighGrade: 94 },
    { year: '2023 Cohort', AvgGrade: 80.2, HighGrade: 96 },
    { year: '2024 Cohort', AvgGrade: 83.1, HighGrade: 98 }
  ];

  const handleGlobalPromotion = () => {
    setIsPromoting(true);
    setPromotionProgress(0);
    const interval = setInterval(() => {
      setPromotionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPromoting(false);
          setPromotionLogged(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F9F9F7] relative">
      
      {/* Dynamic Header & Tab Selector for HOD */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col sm:flex-row justify-between items-center z-20 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
            <Database size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">Departmental Archives</h1>
            <p className="text-[10px] font-bold text-slate-450 uppercase leading-none mt-0.5">Applied Sciences Historical Repository & Administration</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/50">
          {[
            { id: 'VAULT', label: 'The Vault (Alumni)', icon: Database },
            { id: 'PROMOTION', label: 'Promotion Terminal', icon: RefreshCw },
            { id: 'COMPLIANCE', label: 'Compliance Audits', icon: ShieldCheck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                setSelectedStudent(null);
              }}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all outline-none",
                activeSubTab === tab.id ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.012] select-none z-0">
        <h1 className="text-[14vw] font-black rotate-[-20deg] text-slate-950 uppercase">HOD REGISTRY</h1>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative z-10 w-full">
        <AnimatePresence mode="wait">
          
          {selectedStudent ? (
            <motion.div 
              key="detail_view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 h-full w-full overflow-hidden"
            >
              <HODArchiveDetailView 
                student={selectedStudent}
                onBack={() => setSelectedStudent(null)}
              />
            </motion.div>
          ) : (
            
            <div className="flex-1 overflow-y-auto no-scrollbar">
              
              {activeSubTab === 'VAULT' && (
                <motion.div 
                  key="vault"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 space-y-8 max-w-7xl mx-auto"
                >
                  
                  {/* Analytic KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { title: 'Total Rostered Students', val: totalAlumniCount, note: 'Current & Graduated profiles', color: 'slate', icon: Users },
                      { title: 'Historic WASSCE Mean', val: `${departmentAverage}%`, note: 'Department-wide GPA', color: 'slate', icon: TrendingUp },
                      { title: 'HOD Verified Seals', val: verifiedSealsCount, note: 'Permanently validated', color: 'slate', icon: ShieldCheck },
                      { title: 'Retention & Pass Key', val: '100.0%', note: 'Zero compliance leakage', color: 'slate', icon: Award }
                    ].map((card, idx) => (
                      <div key={idx} className="bg-white rounded-[2rem] border border-slate-200/60 p-6 flex items-center justify-between shadow-sm">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">{card.val}</p>
                          <p className="text-[10px] font-semibold text-slate-450 uppercase">{card.note}</p>
                        </div>
                        <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white shrink-0 bg-slate-905 bg-slate-900">
                          <card.icon size={20} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Filter Matrix Row */}
                  <div className="bg-white border border-slate-204 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-slate-900 rounded-full animate-pulse" />
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">ARCHIVE VAULT FILTER MATRIX</h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Longitudinal Departmental Trace Index</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Search Index Input */}
                      <div className="relative flex items-center h-12 bg-slate-50 border border-slate-200 rounded-xl px-4">
                        <Search className="text-slate-400 mr-2 shrink-0" size={16} />
                        <input 
                          type="text" 
                          placeholder="Search index, name or graduation serial..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-transparent border-none text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-full"
                        />
                      </div>

                      {/* Filter Class */}
                      <div className="relative flex items-center h-12 bg-slate-50 border border-slate-200 rounded-xl px-4">
                        <span className="text-[10px] font-bold text-slate-400 mr-2 shrink-0">STREAM:</span>
                        <select 
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="bg-transparent border-none text-xs text-slate-800 font-extrabold focus:outline-none cursor-pointer w-full"
                        >
                          <option value="ALL">All Cohort Streams</option>
                          <option value="SHS 1 Agric B">SHS 1 Agric B (Current Form 1)</option>
                          <option value="SHS 2 Science B">SHS 2 Science B (Current Form 2)</option>
                          <option value="SHS 3 Science A">SHS 3 Science A (Current Form 3)</option>
                          <option value="Class of 2024 (Science)">Class of 2024 (Science Alumni)</option>
                          <option value="Class of 2023 (Science)">Class of 2023 (Science Alumni)</option>
                          <option value="Class of 2023 (Agric Science)">Class of 2023 (Agric Alumni)</option>
                        </select>
                      </div>

                      {/* Filter Grad Year */}
                      <div className="relative flex items-center h-12 bg-slate-50 border border-slate-200 rounded-xl px-4">
                        <span className="text-[10px] font-bold text-slate-400 mr-2 shrink-0">COHORT YEAR:</span>
                        <select 
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          className="bg-transparent border-none text-xs text-slate-800 font-extrabold focus:outline-none cursor-pointer w-full"
                        >
                          <option value="ALL">All Past & Current Years</option>
                          <option value="2028">Form 1 (Class of 2028)</option>
                          <option value="2027">Form 2 (Class of 2027)</option>
                          <option value="2026">Form 3 (Class of 2026)</option>
                          <option value="2024">Class of 2024</option>
                          <option value="2023">Class of 2023</option>
                        </select>
                      </div>

                    </div>
                  </div>

                  {/* Student Registry Table */}
                  <div className="bg-white border border-slate-200/60 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Archives Dossiers</h4>
                        <p className="text-[10px] text-slate-450 font-bold uppercase mt-1">Select an active or alumni dossier to analyze longitudinal performance and view historical credentials</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-101 rounded-lg px-2 text-center py-1">
                        Displaying <span className="text-slate-900 font-black">{filteredStudents.length}</span> verified records in Vault
                      </span>
                    </header>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/20">
                            <th className="px-8 py-4">Student Identity</th>
                            <th className="px-6 py-4">Stream / Batch</th>
                            <th className="px-6 py-4 text-center">Cumulative Grade</th>
                            <th className="px-6 py-4 text-center">WASSCE Code</th>
                            <th className="px-6 py-4 text-center">Authorization Stat</th>
                            <th className="px-8 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredStudents.map(student => {
                            const scores = student.history ? student.history.map(h => h.finalGrade) : [];
                            const avgGrade = scores.length > 0 ? (scores.reduce((a,b)=>a+b, 0) / scores.length).toFixed(1) + '%' : 'No Past Terms';

                            return (
                              <tr 
                                key={student.id}
                                className="hover:bg-slate-50 group transition-all duration-150 cursor-pointer"
                                onClick={() => setSelectedStudent(student)}
                              >
                                <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
                                      alt="avatar" 
                                      className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-0.5"
                                    />
                                    <div>
                                      <p className="text-xs font-black text-slate-900 tracking-tight">{student.name}</p>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase font-mono">{student.index}</p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-6 py-5 text-xs text-slate-650 font-bold">
                                  {student.currentClass}
                                </td>

                                <td className="px-6 py-5 text-center">
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold italic font-mono bg-slate-100 text-slate-800 border-2 border-slate-200/60">
                                    {avgGrade}
                                  </span>
                                </td>

                                <td className="px-6 py-5 text-center bg-transparent">
                                  <span className={cn(
                                    "px-3 py-1 font-mono text-xs font-black rounded-lg text-white",
                                    student.finalWassce === 'Pending' && "bg-slate-400",
                                    student.finalWassce === 'Building' && "bg-slate-300",
                                    student.finalWassce !== 'Pending' && student.finalWassce !== 'Building' && "bg-slate-900"
                                  )}>
                                    WAEC: {student.finalWassce}
                                  </span>
                                </td>

                                <td className="px-6 py-5 text-center">
                                  <span className={cn(
                                    "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border inline-flex items-center gap-1",
                                    student.status === 'Archived & Verified' && "bg-emerald-50 text-emerald-800 border-emerald-100",
                                    student.status === 'Archive Inbound' && "bg-blue-50 text-blue-800 border-blue-100",
                                    student.status === 'Empty Archive' && "bg-amber-50 text-amber-800 border-amber-100"
                                  )}>
                                    <ShieldCheck size={11} />
                                    {student.status}
                                  </span>
                                </td>

                                <td className="px-8 py-5 text-right">
                                  <button className="p-2 hover:bg-slate-200 group-hover:bg-slate-900 rounded-xl text-slate-450 group-hover:text-white transition-all flex items-center justify-center ml-auto">
                                    <ChevronRight size={18} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </motion.div>
              )}

              {activeSubTab === 'PROMOTION' && (
                <motion.div 
                  key="promotion"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="max-w-4xl mx-auto p-8 space-y-8"
                >
                  <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-lg space-y-8">
                    
                    <header className="flex items-center gap-4 border-b border-slates-100 pb-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-md">
                        <RefreshCw size={24} className={cn(isPromoting && "animate-spin")} />
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-450 bg-slate-100 px-2.5 py-1 rounded uppercase tracking-wider">End-Of-Year Cycle Process</span>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Central Promotion Terminal</h3>
                      </div>
                    </header>

                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      Executing the Promotion Cycle permanently finalized the current term's grades, seals student outcomes, and dispatches the senior class (SHS 3) into <strong>"The Vault of Historical Archives"</strong>. It also promotes SHS 1 to SHS 2 and SHS 2 to SHS 3, completely setting the slate clean for the next active academic session.
                    </p>

                    <div className="border border-slate-100 p-6 rounded-2xl bg-slate-50 space-y-4">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Senior Class Promotion Metrics</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border rounded-xl p-4 text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Current SHS 3 Senior Size</p>
                          <p className="text-xl font-bold text-slate-905 mt-1">410 Students</p>
                        </div>
                        <div className="bg-white border rounded-xl p-4 text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Clearences Approved</p>
                          <p className="text-xl font-bold text-emerald-600 mt-1">398 Cleared</p>
                        </div>
                        <div className="bg-white border rounded-xl p-4 text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Seals Frozen</p>
                          <p className="text-xl font-bold text-slate-900 mt-1">100.0% Approved</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {isPromoting ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-black text-slate-900 uppercase">
                            <span>Sealing & Archiving Portfolios...</span>
                            <span>{promotionProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-205">
                            <motion.div 
                              className="bg-slate-900 h-full rounded-full" 
                              initial={{ width: 0 }}
                              animate={{ width: `${promotionProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          <button 
                            onClick={handleGlobalPromotion}
                            disabled={promotionLogged}
                            className={cn(
                              "flex-1 py-4 bg-slate-905 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-md shrink-0 bg-slate-900 outline-none",
                              promotionLogged && "opacity-50 cursor-not-allowed bg-slate-500"
                            )}
                          >
                            {promotionLogged ? "Promotion Cycle Executed Successfully" : "Initiate Global Promotion & Archive Cycle"}
                          </button>
                        </div>
                      )}

                      {promotionLogged && (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 flex gap-4"
                        >
                          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-emerald-950 uppercase tracking-widest leading-none">Global Transition Authenticated</h4>
                            <p className="text-xs font-semibold text-emerald-800 mt-2 leading-relaxed">
                              Senior Class of 2024 has been compiled, sealed, and successfully synchronized into <strong>The Vault</strong>. All student folders have been frozen, and student gradebooks have been reset for the next division cycle.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {activeSubTab === 'COMPLIANCE' && (
                <motion.div 
                  key="compliance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 space-y-8 max-w-5xl mx-auto"
                >
                  {/* Performance Chart tracking past averages */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                    <header className="flex items-center gap-3 mb-6 pb-4 border-b">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-90a text-slate-900">
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none font-sans">Longitudinal Cohort Comparisons</h3>
                        <p className="text-[10px] text-slate-450 font-bold uppercase mt-1">Performance metrics mapping between completely graduated years</p>
                      </div>
                    </header>

                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={graduatedPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="year" tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <YAxis domain={[50, 100]} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: 'white', fontSize: '11px', fontWeight: 900 }} />
                          <Bar dataKey="AvgGrade" fill="#0f172a" radius={[6, 6, 0, 0]} name="Cohort Average Grade" />
                          <Bar dataKey="HighGrade" fill="#64748b" radius={[6, 6, 0, 0]} name="Peak Student Grade" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Audit Logs */}
                  <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                    <div>
                      <h3 className="text-xs font-black text-slate-905 uppercase tracking-widest leading-none">Department Archive Compliance Record</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Cryptographic trace timeline of finalized school files and verified board dispatch</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { time: 'June 2024', event: 'Class of 2024 Dossier Lock', detail: '410 student records signed and generated as read-only PDF transcripts.', hash: 'MAAIS-L4-SEC-2024' },
                        { time: 'June 2023', event: 'Class of 2023 Archive Sync', detail: 'Transcripts certified with verified National Exam results integration.', hash: 'MAAIS-L4-SEC-2023' },
                        { time: 'July 2022', event: 'Class of 2022 Deep Archive Write', detail: 'Transferred terminal grading logs to secure offsite vault.', hash: 'MAAIS-L4-SEC-2022' }
                      ].map((item, idx) => (
                        <div key={idx} className="p-5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-[8px] font-black font-mono text-slate-405 bg-white border border-slate-201 rounded px-2 py-0.5">{item.time}</span>
                              <h4 className="text-xs font-black text-slate-900 leading-none">{item.event}</h4>
                            </div>
                            <p className="text-[11px] text-slate-550 font-semibold mt-2 leading-relaxed">{item.detail}</p>
                          </div>

                          <span className="font-mono text-[9px] font-extrabold bg-slate-200 text-slate-800 px-3 py-1 rounded-lg shrink-0">
                            CRC32: {item.hash}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}

            </div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
