import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  Users, 
  ShieldCheck, 
  ChevronRight, 
  Plus, 
  Search, 
  MoreVertical,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  UserCheck,
  X,
  Crown,
  Lock,
  RotateCcw,
  FileText,
  PieChart,
  Settings2,
  Download,
  Info,
  ChevronLeft,
  FileUp,
  MessageSquare
} from 'lucide-react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '../../lib/utils';

const mockDepartments = [
  { 
    id: '1', 
    name: 'Science', 
    hodName: 'Samuel Boateng', 
    hodId: 'STF-003', 
    teacherCount: 14, 
    description: 'Core and Elective Science nodes including Physics, Biology, and Chemistry.', 
    validationStatus: 85, 
    color: 'bg-blue-500',
    iconColor: 'text-blue-600',
    programs: ['General Science', 'Agricultural Science'],
    staff: [
      { id: 'STF-003', name: 'Samuel Boateng', role: 'Senior Physics Tutor', isHOD: true },
      { id: 'STF-010', name: 'Dr. Mensah', role: 'Biology Lead', isHOD: false },
      { id: 'STF-011', name: 'Kwadwo Asare', role: 'Chemistry Specialist', isHOD: false },
    ]
  },
  { 
    id: '2', 
    name: 'Mathematics', 
    hodName: 'Elizabeth Osei', 
    hodId: 'STF-006', 
    teacherCount: 12, 
    description: 'Core Mathematics and Elective Mathematics institutional units.', 
    validationStatus: 100, 
    color: 'bg-emerald-500',
    iconColor: 'text-emerald-600',
    programs: ['All Programs'],
    staff: [
      { id: 'STF-006', name: 'Elizabeth Osei', role: 'Core Math Lead', isHOD: true },
      { id: 'STF-012', name: 'Isaac Tetteh', role: 'Elective Math Tutor', isHOD: false },
    ]
  },
  { 
    id: '3', 
    name: 'Languages', 
    hodName: 'John Mensah', 
    hodId: 'STF-005', 
    teacherCount: 18, 
    description: 'English, French, and local dialect linguistic nodes.', 
    validationStatus: 45, 
    color: 'bg-purple-500',
    iconColor: 'text-purple-600',
    programs: ['All Programs'],
    staff: [
      { id: 'STF-005', name: 'John Mensah', role: 'English Literature Node', isHOD: true },
    ]
  },
  { 
    id: '4', 
    name: 'Business', 
    hodName: 'Anthony Hackman', 
    hodId: 'STF-001', 
    teacherCount: 10, 
    description: 'Accounting, Business Management, and Costing nodes.', 
    validationStatus: 70, 
    color: 'bg-amber-500',
    iconColor: 'text-amber-600',
    programs: ['Business'],
    staff: [
       { id: 'STF-001', name: 'Anthony Hackman', role: 'Accounting Lead', isHOD: true },
    ]
  },
];

const distributionData = [
  { name: 'Science', teachers: 14 },
  { name: 'Math', teachers: 12 },
  { name: 'Languages', teachers: 18 },
  { name: 'Business', teachers: 10 },
  { name: 'Vocational', teachers: 6 },
];

export function DepartmentManagement() {
  const [departments, setDepartments] = React.useState(mockDepartments);
  const [selectedDeptId, setSelectedDeptId] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('staff');
  const [viewType, setViewType] = React.useState('grid');
  const [assigningHOD, setAssigningHOD] = React.useState(null);
  const [openKebabId, setOpenKebabId] = React.useState(null);
  
  // Advanced Operations State
  const [activeOperation, setActiveOperation] = React.useState(null);

  const selectedDept = departments.find(d => d.id === selectedDeptId);

  const toggleKebab = (e, id) => {
    e.stopPropagation();
    setOpenKebabId(openKebabId === id ? null : id);
  };

  React.useEffect(() => {
    const closeMenu = () => setOpenKebabId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleNodeOperation = (operation, staffId, staffName) => {
    setActiveOperation({ type: operation, staffId, staffName });
  };

  const handleAssignHOD = (e, staffId, staffName, deptId, deptName) => {
    e.stopPropagation();
    setAssigningHOD({ staffId, staffName, deptId, deptName });
  };

  const confirmAssignment = () => {
    if (!assigningHOD) return;
    const { staffId, deptId, staffName, deptName } = assigningHOD;
    
    setDepartments(prev => prev.map(dept => {
      if (dept.id !== deptId) return dept;
      const updatedStaff = dept.staff.map(member => ({
        ...member,
        isHOD: member.id === staffId
      }));
      const newHOD = updatedStaff.find(m => m.id === staffId);
      return {
        ...dept,
        staff: updatedStaff,
        hodName: newHOD?.name || dept.hodName,
        hodId: staffId
      };
    }));

    alert(`Institutional Authority Dispatched: ${staffName} is now certified HOD for ${deptName}.`);
    setAssigningHOD(null);
  };

  const renderOperationModal = () => {
    if (!activeOperation) return null;

    const { type, staffName } = activeOperation;

    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveOperation(null)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <div className="p-10">
            <header className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                  {type === 'Registry Transfer' && <ArrowRight size={24} />}
                  {type === 'Credential Reset' && <RotateCcw size={24} />}
                  {type === 'Audit Trail View' && <Search size={24} />}
                  {type === 'Revoke Authority' && <ShieldCheck size={24} />}
                  {type === 'Deep Archive' && <Trash2 size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black italic font-display text-slate-900 leading-none mb-1">{type}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">Node: {staffName}</p>
                </div>
              </div>
              <button onClick={() => setActiveOperation(null)} className="p-2 text-slate-300 hover:text-slate-900 transition-all">
                <X size={24} />
              </button>
            </header>

            {type === 'Registry Transfer' && (
              <div className="space-y-6">
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  Select the destination cluster for this faculty node. This will relocate all associated academic history and current assessment permissions.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {departments.filter(d => d.id !== selectedDeptId).map(d => (
                    <button key={d.id} className="p-4 border border-slate-100 rounded-2xl text-left hover:border-slate-300 hover:bg-slate-50 transition-all group flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-1.5 h-6 rounded-full", d.color)} />
                        <span className="text-[13px] font-black italic text-slate-900">{d.name} Cluster</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {type === 'Credential Reset' && (
              <div className="space-y-8">
                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                  <p className="text-sm font-medium text-amber-900 leading-relaxed">
                    This will invalidate current session tokens and generate a temporary institutional access key for <span className="font-black italic underline">{staffName}</span>.
                  </p>
                </div>
                <div className="space-y-3">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Authentication Required</p>
                   <button className="w-full py-4.5 bg-slate-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20">
                     Authorize Reset Protocol
                   </button>
                </div>
              </div>
            )}

            {type === 'Audit Trail View' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {[
                    { action: 'Mark Validation', time: '2 hours ago', status: 'Success' },
                    { action: 'Registry Entry', time: 'Yestderday, 14:20', status: 'Verified' },
                    { action: 'Login Attempt', time: 'Oct 22, 09:12', status: 'Authenticated' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <div>
                        <p className="text-sm font-black italic text-slate-900">{log.action}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.time} • {log.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-4.5 border border-slate-200 text-slate-900 font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                  Generate Full Forensic Report
                </button>
              </div>
            )}

            {type === 'Revoke Authority' && (
              <div className="space-y-8 text-center">
                <p className="text-slate-500 font-medium leading-relaxed italic px-4">
                  Confirmed: strip <span className="text-slate-900 font-black italic">"{staffName}"</span> of all HOD management tokens and administrative oversight?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setActiveOperation(null)} className="flex-1 py-4.5 bg-slate-50 text-slate-900 font-black rounded-2xl text-[11px] uppercase tracking-widest">Cancel</button>
                  <button className="flex-1 py-4.5 bg-rose-600 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-600/20">Revoke Authority</button>
                </div>
              </div>
            )}

            {type === 'Deep Archive' && (
              <div className="space-y-8 text-center">
                 <div className="p-6 bg-slate-900 text-white rounded-[2rem] text-left">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Protocol Implications</p>
                   <ul className="space-y-3">
                     {['Preservation of academic records', 'Inactivation of login permissions', 'Node removal from active registry'].map((text, i) => (
                       <li key={i} className="flex items-center gap-3 text-[11px] font-bold italic">
                         <ShieldCheck size={14} className="text-emerald-400" />
                         {text}
                       </li>
                     ))}
                   </ul>
                 </div>
                 <div className="flex gap-3">
                  <button onClick={() => setActiveOperation(null)} className="flex-1 py-4.5 bg-slate-50 text-slate-900 font-black rounded-2xl text-[11px] uppercase tracking-widest">Abort</button>
                  <button className="flex-1 py-4.5 bg-slate-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest">Initiate Archive</button>
                </div>
              </div>
            )}

          </div>
          <div className="bg-slate-50 py-5 text-center border-t border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Institutional Protocol: Level 4 Authorized</p>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderStaffTab = (dept) => (
    <div className="space-y-4">
      {dept.staff.map((member) => (
        <div key={member.id} className="p-5 bg-white border border-slate-100 rounded-3xl hover:border-slate-300 transition-all group flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs ring-1 ring-slate-100">
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-[13px] font-black text-slate-900 leading-none mb-1">{member.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {member.isHOD ? (
              <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 flex items-center gap-2 shadow-sm">
                <Crown size={12} className="fill-amber-500" />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">HOD Authority</span>
              </div>
            ) : (
              <button 
                onClick={(e) => handleAssignHOD(e, member.id, member.name, dept.id, dept.name)}
                className="p-2.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all" 
                title="Assign HOD"
              >
                <Crown size={16} />
              </button>
            )}
            <div className="relative">
              <button 
                onClick={(e) => toggleKebab(e, member.id)}
                className={cn(
                  "p-2.5 rounded-xl transition-all",
                  openKebabId === member.id ? "bg-slate-900 text-white" : "text-slate-300 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <MoreVertical size={16} />
              </button>

              <AnimatePresence>
                {openKebabId === member.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[150] overflow-hidden"
                  >
                    <div className="p-2 border-b border-slate-50">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-1">Advanced Node Operations</p>
                    </div>
                    <div className="p-1.5">
                      {[
                        { label: 'Registry Transfer', icon: ArrowRight, color: 'hover:text-blue-600 hover:bg-blue-50' },
                        { label: 'Credential Reset', icon: RotateCcw, color: 'hover:text-amber-600 hover:bg-amber-50' },
                        { label: 'Audit Trail View', icon: Search, color: 'hover:text-indigo-600 hover:bg-indigo-50' },
                        { label: 'Revoke Authority', icon: ShieldCheck, color: 'hover:text-rose-600 hover:bg-rose-50' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleNodeOperation(item.label, member.id, member.name)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 rounded-xl transition-all text-left",
                            item.color
                          )}
                        >
                          <item.icon size={14} />
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-1.5 bg-slate-50 border-t border-slate-100 italic">
                      <button 
                        onClick={() => handleNodeOperation('Deep Archive', member.id, member.name)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-400 hover:text-slate-900 rounded-xl transition-all text-left"
                      >
                         <Trash2 size={14} />
                         Deep Archive Node
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ))}
      <button className="w-full py-4 border border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 mt-4">
        <Plus size={14} />
        Transfer Teacher to Cluster
      </button>
    </div>
  );

  const renderGradingTab = (dept) => (
    <div className="space-y-8">
      <div className="bg-slate-900 p-6 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <TrendingUp size={80} />
        </div>
        <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 mb-4">Institutional Grading Template</h5>
        <div className="grid grid-cols-2 gap-8 relative">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1">Assessment Weight</p>
            <p className="text-2xl font-black italic font-display">70%</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">SBA / Classwork</p>
            <p className="text-2xl font-black italic font-display">30%</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-4">Departmental Specialization</h4>
        {[
          { label: 'Lab Practical Component', value: '30%', active: dept.name === 'Science' },
          { label: 'Oral Assessment Component', value: '30%', active: dept.name === 'Languages' },
          { label: 'Project Portfolio', value: '20%', active: dept.name === 'Business' },
        ].map((rule, i) => (
          <div key={i} className={cn(
            "p-5 rounded-2xl border transition-all flex items-center justify-between",
            rule.active ? "bg-white border-emerald-100 shadow-sm" : "bg-slate-50 border-slate-100 opacity-50"
          )}>
            <div>
              <p className="text-[12px] font-black text-slate-900 tracking-tight">{rule.label}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">SBA Sub-Weighting Protocol</p>
            </div>
            <div className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-900">
              {rule.value}
            </div>
          </div>
        ))}
        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 active:scale-95 transition-all">
          Authorize Template Update
        </button>
      </div>
    </div>
  );

  const renderVaultTab = () => (
    <div className="space-y-6">
      <div className="border border-dashed border-slate-300 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-100/50 transition-all group">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-400 mb-6 shadow-sm group-hover:scale-110 transition-transform">
          <FileUp size={28} />
        </div>
        <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Upload Strategy Pulse</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[200px]">PDF format strictly required for departmental meeting minutes.</p>
      </div>

      <div className="space-y-3">
        {[
          { name: 'Minutes_Week_04.pdf', date: 'Oct 12, 2026', size: '2.4 MB' },
          { name: 'Academic_Curriculum_Reshuffle.pdf', date: 'Sep 28, 2026', size: '1.2 MB' },
        ].map((file, i) => (
          <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-slate-300 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-[12px] font-black text-slate-900 truncate tracking-tight">{file.name}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{file.date} • {file.size}</p>
              </div>
            </div>
            <button className="p-2 text-slate-200 hover:text-slate-900">
              <Download size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!selectedDept ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* 1. Breadcrumbs Header */}
            <header className="px-8 py-6 bg-white border-b border-slate-200/60 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
                  <span className="hover:text-slate-900 cursor-pointer">Registry</span>
                  <ChevronRight size={10} />
                  <span className="hover:text-slate-900 cursor-pointer">Identity Manager</span>
                  <ChevronRight size={10} />
                  <span className="text-slate-900">Departmental Hierarchy</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight leading-none">
                  The Digital Filing Cabinet
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mr-4">
                  <button 
                    onClick={() => setViewType('grid')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                      viewType === 'grid' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <LayoutGrid size={12} />
                    Folders
                  </button>
                  <button 
                    onClick={() => setViewType('list')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                      viewType === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <List size={12} />
                    Registry
                  </button>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/10 group">
                  <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                  Spawn Department
                </button>
              </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                <div className="max-w-7xl mx-auto">
                  <section>
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em] flex items-center gap-4">
                        <div className="w-10 h-[1.5px] bg-slate-900" />
                        Institutional Clusters
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                      {departments.map((dept, i) => (
                        <motion.div
                          key={dept.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setSelectedDeptId(dept.id)}
                          className="bg-white rounded-[2.5rem] border border-slate-200/50 p-8 shadow-sm hover:shadow-2xl hover:border-slate-300 transition-all cursor-pointer group relative overflow-hidden"
                        >
                          <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-10 -mt-10 group-hover:rotate-12 transition-transform", dept.color)}>
                            <Folder size={160} />
                          </div>

                          <div className="flex justify-between items-start mb-10 relative">
                            <div className={cn("w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg", dept.color)}>
                              <Folder size={26} />
                            </div>
                            <div className={cn(
                              "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm",
                              dept.validationStatus === 100 ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-blue-50 border-blue-100 text-blue-700"
                            )}>
                              {dept.validationStatus}% Verified
                            </div>
                          </div>

                          <h4 className="text-3xl font-black italic font-display text-slate-900 tracking-tight leading-none mb-3">{dept.name}</h4>
                          <p className="text-[12px] text-slate-400 font-bold leading-relaxed mb-10 line-clamp-2 uppercase tracking-wide">{dept.description}</p>

                          <div className="space-y-5 pt-8 border-t border-slate-50 relative">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-slate-100 transition-colors">
                                  <Users size={18} />
                                </div>
                                <div>
                                   <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{dept.teacherCount} Teachers</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Staff Nodes</p>
                                </div>
                              </div>
                              <ArrowRight size={16} className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                            </div>

                            <div className="p-5 bg-slate-50 rounded-2xl flex items-center justify-between group-hover:bg-slate-100/50 transition-all border border-slate-100/50">
                              <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-amber-600 flex items-center justify-center shadow-sm">
                                  <Crown size={16} fill="currentColor" fillOpacity={0.2} />
                                </div>
                                <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Assigned HOD</p>
                                  <p className="text-[13px] font-black text-slate-900 leading-none italic font-display">{dept.hodName}</p>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2">
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${dept.validationStatus}%` }}
                                  transition={{ duration: 1.5 }}
                                  className={cn("h-full rounded-full transition-all", 
                                    dept.validationStatus === 100 ? "bg-emerald-500" : "bg-blue-500"
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <aside className="hidden xl:flex w-96 bg-white border-l border-slate-200/60 flex-col shrink-0">
                <div className="p-8 border-b border-slate-200/60 flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <PieChart size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-0.5">Resource Pulse</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Institutional Equity Monitor</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-12">
                  <section>
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-8 flex items-center gap-3">
                      <div className="w-6 h-[1.5px] bg-slate-200" />
                      The Balance Meter
                    </h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart data={distributionData} layout="vertical" margin={{ left: -20, right: 20 }}>
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-2xl ring-1 ring-white/10">
                                    {payload[0].value} Staff Nodes
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="teachers" radius={[0, 4, 4, 0]} barSize={20}>
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1e293b' : '#334155'} />
                            ))}
                          </Bar>
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-8 flex items-center gap-3">
                      <div className="w-6 h-[1.5px] bg-slate-200" />
                      Strategic Mapping
                    </h4>
                    <div className="space-y-4">
                      {[
                        { name: 'Technical Stream', depts: ['Mathematics', 'Vocational'], color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { name: 'Medical Path', depts: ['Science', 'Languages'], color: 'text-rose-600', bg: 'bg-rose-50' },
                        { name: 'Global Commerce', depts: ['Business', 'Math', 'Languages'], color: 'text-amber-600', bg: 'bg-amber-50' },
                      ].map((mapping, i) => (
                        <div key={i} className="p-5 border border-slate-100 rounded-3xl group hover:border-slate-300 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                             <div className={cn("w-2 h-2 rounded-full", mapping.color.replace('text-', 'bg-'))} />
                             <p className="text-xs font-black text-slate-900 tracking-tight">{mapping.name}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {mapping.depts.map((d, di) => (
                               <span key={di} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-slate-50 text-slate-500 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all">
                                 {d}
                               </span>
                             ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </aside>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col bg-white overflow-hidden"
          >
            {/* Immersive Header */}
            <div className={cn("p-6 text-white shrink-0 relative overflow-hidden transition-colors duration-500", selectedDept.color.replace('500', '900'))}>
              <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
                <ShieldCheck size={200} />
              </div>
              
              <div className="flex justify-between items-center mb-6 relative">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedDeptId(null)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all shadow-lg backdrop-blur-md flex items-center gap-2">
                    <ChevronLeft size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Back to Registry</span>
                  </button>
                  <p className="hidden sm:block text-[10px] font-black uppercase tracking-[0.4em] text-white/50 italic">Management Hub Authorized</p>
                </div>

                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all shadow-sm backdrop-blur-sm">
                    <Download size={14} />
                    Export Dossier
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
                    <Lock size={14} />
                    Initiate Freeze
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white ring-1 ring-white/30 shadow-xl">
                    <Folder size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic font-display tracking-tight leading-none mb-1">{selectedDept.name} Cluster</h2>
                    <div className="flex items-center gap-3">
                       <div className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-white ring-1 ring-white/20">
                         {selectedDept.validationStatus}% Marks Validated
                       </div>
                       <div className="w-1 h-1 rounded-full bg-white/30" />
                       <span className="text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">{selectedDept.teacherCount} Personnel Nodes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Navigation */}
              <div className="flex gap-3 mt-6 relative">
                {[
                  { id: 'staff', label: 'Faculty Registry', icon: Users },
                  { id: 'grading', label: 'Grading Protocol', icon: Settings2 },
                  { id: 'vault', label: 'Minutes Vault', icon: FileText },
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group shadow-lg",
                      activeTab === tab.id 
                        ? "bg-white text-slate-900" 
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    )}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Immersive Body */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-slate-50/30">
              <div className="max-w-4xl">
                 <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.3, ease: 'circOut' }}
                  >
                    {activeTab === 'staff' && renderStaffTab(selectedDept)}
                    {activeTab === 'grading' && renderGradingTab(selectedDept)}
                    {activeTab === 'vault' && renderVaultTab()}
                  </motion.div>
                 </AnimatePresence>
              </div>
            </div>

            {/* Global Actions Bar */}
            <footer className="p-6 bg-white border-t border-slate-200 shrink-0 flex items-center justify-end">
               <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Last Validation Pulse</p>
                  <p className="text-[11px] font-black text-slate-900 italic font-display">Oct 23, 2026 • 08:32 AM</p>
               </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 4. Protocols & Modals */}
      <AnimatePresence>
        {assigningHOD && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAssigningHOD(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-amber-100">
                  <Crown size={40} className="fill-amber-500/20" />
                </div>
                
                <h3 className="text-2xl font-black italic font-display text-slate-900 tracking-tight leading-none mb-3">Authority Elevation</h3>
                <p className="text-slate-500 font-bold leading-relaxed mb-10 px-4 text-sm">
                  Elevate <span className="text-slate-900 font-black italic">"{assigningHOD.staffName}"</span> to Head of Department for {assigningHOD.deptName}?
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-10 text-left">
                   <div className="flex items-center gap-3 mb-3">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Granted Token Permissions</p>
                   </div>
                   <ul className="space-y-2">
                      <li className="text-[11px] font-medium text-slate-500 flex items-center gap-2 italic">
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        validation of Cluster Assessment Matrices
                      </li>
                      <li className="text-[11px] font-medium text-slate-500 flex items-center gap-2 italic">
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        Registry Certification Authority
                      </li>
                   </ul>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setAssigningHOD(null)} className="flex-1 py-4.5 bg-slate-50 text-slate-900 font-black rounded-2xl text-[11px] uppercase tracking-widest border border-slate-200/50">Abort</button>
                  <button onClick={confirmAssignment} className="flex-1 py-4.5 bg-slate-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest">Confirm</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {renderOperationModal()}
      </AnimatePresence>
    </div>
  );
}
