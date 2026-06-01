import React, { useState, useMemo } from 'react';
import { 
  FileText, Send, Printer, ShieldCheck, 
  AlertTriangle, Filter, Search, CheckCircle2,
  Stamp as StampIcon, PenTool, Download,
  Layers, UserCheck, Clock, MoreVertical,
  ChevronRight, Calendar, Bookmark, RefreshCw, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const MOCK_REPORTS = [
  { id: '1', name: 'Angela Owusu', form: 'SHS 3', track: 'Gold Track', class: 'General Science 1', status: 'READY', attendance: '68/70', gradeAverage: 88.5 },
  { id: '2', name: 'Kwame Mensah', form: 'SHS 3', track: 'Gold Track', class: 'General Science 1', status: 'MISSING_MARKS', attendance: '45/70', gradeAverage: 47.7 },
  { id: '3', name: 'Yaw Boateng', form: 'SHS 3', track: 'Gold Track', class: 'General Science 1', status: 'READY', attendance: '70/70', gradeAverage: 92.1 },
  { id: '4', name: 'Esi Ansah', form: 'SHS 3', track: 'Gold Track', class: 'General Science 1', status: 'PENDING_APPROVAL', attendance: '65/70', gradeAverage: 78.4 },
  { id: '5', name: 'Papa Kofi', form: 'SHS 1', track: 'Green Track', class: 'Business 1', status: 'READY', attendance: '70/70', gradeAverage: 84.3 },
];

export const ReportGeneratorView = () => {
  const [selectedForm, setSelectedForm] = useState('SHS 3');
  const [selectedTrack, setSelectedTrack] = useState('Gold Track');
  const [selectedClass, setSelectedClass] = useState('General Science 1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [showSealModal, setShowSealModal] = useState(false);
  const [useDigitalSeal, setUseDigitalSeal] = useState(true);

  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => setIsCompiling(false), 3000);
  };

  // Memoized Filtering Pipeline
  const filteredReports = useMemo(() => {
    return MOCK_REPORTS.filter((report) => {
      const matchesForm = report.form === selectedForm;
      const matchesTrack = report.track === selectedTrack;
      const matchesClass = report.class === selectedClass;
      const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesForm && matchesTrack && matchesClass && matchesSearch;
    });
  }, [selectedForm, selectedTrack, selectedClass, searchQuery]);

  // Compute live registry metrics based on filtered subset
  const metrics = useMemo(() => {
    const ready = filteredReports.filter(r => r.status === 'READY').length;
    const missing = filteredReports.filter(r => r.status === 'MISSING_MARKS').length;
    return { ready, missing };
  }, [filteredReports]);

  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <span>Academic Engine</span>
              <ChevronRight size={10} />
              <span className="text-slate-900 uppercase">Terminal Report Engine</span>
            </div>
            <h1 className="text-3xl font-black italic font-display text-slate-900 tracking-tight leading-none">
              Automated Report Factory
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">
              Batch Processing, Forensic Signatures & Parent Portal Sync
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
             <button 
              onClick={() => setShowSealModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all font-sans shadow-sm"
             >
                <StampIcon size={14} /> Digital Seal Registry
             </button>
             <button 
              onClick={handleCompile}
              disabled={isCompiling || filteredReports.length === 0}
              className={cn(
                "flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all",
                (isCompiling || filteredReports.length === 0) && "opacity-60 cursor-not-allowed"
              )}
             >
                {isCompiling ? <RefreshCw size={14} className="animate-spin" /> : <Printer size={14} />}
                {isCompiling ? 'Compiling Datasets...' : 'Compile Batch Reports'}
             </button>
          </div>
        </header>

        {/* 1. Batch Generation Controls */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Academic Level</label>
                 <select 
                  value={selectedForm}
                  onChange={(e) => setSelectedForm(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                 >
                    <option value="SHS 1">SHS 1</option>
                    <option value="SHS 2">SHS 2</option>
                    <option value="SHS 3">SHS 3</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Track</label>
                 <select 
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                 >
                    <option value="Green Track">Green Track</option>
                    <option value="Gold Track">Gold Track</option>
                    <option value="Single Track">Single Track</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Specific Course Class</label>
                 <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                 >
                    <option value="General Science 1">General Science 1</option>
                    <option value="General Science 2">General Science 2</option>
                    <option value="Agricultural Science 1">Agricultural Science 1</option>
                    <option value="Business 1">Business 1</option>
                 </select>
              </div>
              <div className="space-y-2 relative flex flex-col justify-end">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest md:absolute md:top-0">Search Student</label>
                 <div className="relative">
                   <input 
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Filter by name..."
                     className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                   />
                   <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 </div>
              </div>
           </div>
        </section>

        {/* 2. Generation Interface & Grid Details */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          <div className="xl:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-10 py-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Layers size={18} className="text-teal-500" />
                      Compilation Registry
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Selected: {selectedForm} • {selectedClass}</p>
                  </div>
                  <div className="flex gap-4">
                     <span className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        <CheckCircle2 size={12} /> {metrics.ready} Ready
                     </span>
                     <span className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100">
                        <AlertTriangle size={12} /> {metrics.missing} Missing
                     </span>
                  </div>
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-white border-b border-slate-100">
                          <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Hierarchy</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Avg Grade</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Attend</th>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Status</th>
                          <th className="px-8 py-5"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredReports.length > 0 ? (
                         filteredReports.map((report) => (
                           <tr key={report.id} className="hover:bg-slate-50/50 transition-all group">
                              <td className="px-10 py-6">
                                 <p className="text-[14px] font-black italic font-display text-slate-900 leading-tight">{report.name}</p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: ST-00{report.id}</p>
                              </td>
                              <td className="px-6 py-6 text-center">
                                 <span className="text-[16px] font-black font-mono text-slate-900 italic font-display">{report.gradeAverage}%</span>
                              </td>
                              <td className="px-6 py-6">
                                 <div className="flex items-center gap-2">
                                    <Calendar size={12} className="text-slate-300" />
                                    <span className="text-[11px] font-black text-slate-600 font-mono">{report.attendance}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className={cn(
                                   "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                   report.status === 'READY' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                   report.status === 'MISSING_MARKS' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                   report.status === 'PENDING_APPROVAL' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                   "bg-blue-50 text-blue-600 border-blue-100"
                                 )}>
                                    {report.status.replace('_', ' ')}
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <button className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-900 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                                   <Download size={14} />
                                 </button>
                              </td>
                           </tr>
                         ))
                       ) : (
                         <tr>
                           <td colSpan={5} className="px-10 py-16 text-center text-[12px] font-bold uppercase tracking-widest text-slate-400 italic">
                             No student records found matches criteria.
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-8">
             <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                   <UserCheck size={120} />
                </div>
                <div className="relative z-10">
                   <h3 className="text-xl font-black italic font-display text-white tracking-tight mb-8">Headmaster's Seal</h3>
                   
                   <div className="p-6 bg-white/5 border border-white/10 rounded-3xl mb-8 group hover:bg-white/10 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-slate-400 border border-white/5 group-hover:border-white/20 transition-all">
                            <PenTool size={24} />
                         </div>
                         <div>
                            <p className="text-[11px] font-black text-white/40 uppercase tracking-widest">Assigned Signatory</p>
                            <p className="text-[14px] font-black italic font-display text-white mt-0.5">V.P. Academic Affairs</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                         <span>Applied Stamp</span>
                         <span className="text-emerald-400 flex items-center gap-1.5"><ShieldCheck size={10} /> VERIFIED</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                         <span>Digital Overlay</span>
                         <span className="text-slate-100">BOTTOM-RIGHT</span>
                      </div>
                   </div>

                   <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all select-none">
                      <div className={cn(
                        "w-5 h-5 rounded-md border-2 border-slate-600 flex items-center justify-center transition-all",
                        useDigitalSeal ? "bg-teal-500 border-teal-500" : ""
                      )}>
                        {useDigitalSeal && <CheckCircle2 size={12} className="text-white" />}
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={useDigitalSeal}
                          onChange={(e) => setUseDigitalSeal(e.target.checked)}
                        />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Apply Digital Seal to Batch</span>
                   </label>
                </div>
             </div>

             <div className="bg-amber-50 rounded-[2.5rem] border border-amber-100 p-8">
                <h3 className="text-[13px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                   <AlertTriangle size={18} className="text-amber-500" />
                   Blocking Issues
                </h3>
                <div className="space-y-4">
                   <div className="p-4 bg-white rounded-2xl border border-amber-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Missing Mark Flag</p>
                      <p className="text-[12px] font-black italic font-display text-slate-900">Elective Chemistry (Mrs. Lamptey)</p>
                      <div className="flex items-center gap-2 mt-2">
                         <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full w-4/5 bg-amber-400" />
                         </div>
                         <span className="text-[10px] font-black text-amber-600">80% IN</span>
                      </div>
                   </div>
                   <div className="p-4 bg-white rounded-2xl border border-amber-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">HOD Sign-off</p>
                      <p className="text-[12px] font-black italic font-display text-slate-900">Technical Drawing Desk</p>
                      <p className="text-[9px] font-bold text-rose-500 mt-2 uppercase flex items-center gap-1">
                        <Clock size={10} /> Pending HOD Digital Key
                      </p>
                   </div>
                </div>
                
                <button className="w-full mt-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all font-sans shadow-sm">
                  Send Nudge to Teachers
                </button>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                   <Bookmark size={18} className="text-blue-500" />
                   Attendance Integrity
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-6">
                   Terminal reports are synced with the biometric attendance logs for the current track.
                </p>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-[11px] font-black">
                      <span className="text-slate-400 uppercase tracking-widest">Avg Attendance</span>
                      <span className="text-slate-900">94.2%</span>
                   </div>
                   <div className="flex justify-between items-center text-[11px] font-black">
                      <span className="text-slate-400 uppercase tracking-widest">Biometric Sync</span>
                      <span className="text-emerald-600 uppercase tracking-widest">ACTIVE</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {showSealModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowSealModal(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10"
            >
               <div className="flex justify-between items-center mb-8">
                  <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white">
                     <StampIcon size={32} />
                  </div>
                  <button onClick={() => setShowSealModal(false)} className="p-2 border border-slate-100 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                     <X size={18} />
                  </button>
               </div>
               
               <h3 className="text-3xl font-black italic font-display text-slate-900 mb-2">Digital Seal Registry</h3>
               <p className="text-slate-400 font-medium leading-relaxed text-[13px] mb-8">
                 Upload high-resolution scans of the official school stamp and executive signatures. These will be overlaid on all cryptographically signed reports.
               </p>

               <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 group hover:border-teal-500 hover:bg-teal-500/5 transition-all cursor-pointer">
                     <Printer size={32} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center px-6">Official School Stamp (PNG/SVG)</p>
                  </div>
                  <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 group hover:border-teal-500 hover:bg-teal-500/5 transition-all cursor-pointer">
                     <PenTool size={32} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center px-6">Executive Signature (PNG/SVG)</p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button 
                     onClick={() => setShowSealModal(false)}
                     className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all font-sans"
                  >
                    Discard Changes
                  </button>
                  <button 
                    onClick={() => setShowSealModal(false)}
                    className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all"
                  >
                    Update Registry
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};