import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Download, Plus,
  ChevronRight, TrendingUp,
  X,
  FileText,
  MoreVertical, GraduationCap,
  UserPlus, Fingerprint,
  Phone, MessageSquare,
  BarChart3, AlertCircle, Mail,
  Send, ShieldCheck, UserCheck,
  CreditCard, Eye, EyeOff, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  Tooltip,
  AreaChart, Area
} from 'recharts';
import { MOCK_PARENTS, PTA_ROLES, BROADCAST_TEMPLATES, PARENT_TARGET_POPULATIONS } from './data';

// --- Components ---

const ParentProfile = ({ parent, onClose }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [maskFees, setMaskFees] = useState(true);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 bg-emerald-900 text-white shrink-0">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white ring-1 ring-white/20">
              <UserCheck size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black italic font-display">{parent.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{parent.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'Overview', label: 'Ward Overview', icon: Users },
            { id: 'History', label: 'Communication', icon: MessageSquare },
            { id: 'Identity', label: 'Access Control', icon: ShieldCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab.id ? "bg-white text-emerald-900 shadow-xl" : "bg-white/5 text-white/60 hover:bg-white/10"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Households</h4>
              <button 
                onClick={() => setMaskFees(!maskFees)}
                className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest"
              >
                {maskFees ? <Eye size={12} /> : <EyeOff size={12} />}
                {maskFees ? 'Show Financials' : 'Mask Financials'}
              </button>
            </div>
            <div className="space-y-4">
              {parent.wards.map((ward) => (
                <div key={ward.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <p className="text-[14px] font-black italic font-display text-slate-900 leading-none mb-1">{ward.name}</p>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{ward.id}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                      ward.feesStatus === 'Paid' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      ward.feesStatus === 'Arrears' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                      "bg-amber-50 text-amber-600 border border-amber-100"
                    )}>
                      {ward.feesStatus}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Score</p>
                      <p className="text-xl font-black italic font-display text-slate-900">{ward.averageScore}%</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                      <p className="text-xl font-black italic font-display text-slate-900">{ward.attendance}%</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-slate-900 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-3 text-white/50">
                      <CreditCard size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Statement Balance</span>
                    </div>
                    <p className="text-sm font-black italic font-display text-white">
                      GHS {maskFees ? '****.**' : ward.balance.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'History' && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Communication Ledger</h4>
            {parent.communicationLogs.map((log) => (
              <div key={log.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      log.type === 'SMS' ? "bg-blue-50 text-blue-600" : "bg-indigo-50 text-indigo-600"
                    )}>
                      {log.type === 'SMS' ? <MessageSquare size={14} /> : <Mail size={14} />}
                    </div>
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{log.type} Blast</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 italic">{log.timestamp}</span>
                </div>
                <p className="text-[13px] font-bold text-slate-600 leading-relaxed italic mb-3">
                  "{log.content}"
                </p>
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full", log.status === 'Delivered' ? 'bg-emerald-500' : 'bg-amber-500')} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{log.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Identity' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm text-center">
              <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <Fingerprint size={40} />
              </div>
              <h3 className="text-xl font-black italic font-display text-slate-900 mb-1">Access Protocol</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Household Credential Management</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Code</span>
                  <span className="text-[14px] font-black text-slate-900 italic font-display">{parent.accessCode}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile PIN</span>
                  <span className="text-[14px] font-black text-slate-900 italic font-display">****</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20">
                  <ShieldCheck size={16} /> Reset PIN
                </button>
                <button className="flex-1 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest">
                  <Bell size={16} /> Notify
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t border-slate-100 flex gap-3 shrink-0">
        <button className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all flex items-center justify-center">
          <Phone size={20} />
        </button>
        <button className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest">
          Full Statement
        </button>
        <button className="flex-1 py-4 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest">
          Archive
        </button>
      </div>
    </div>
  );
};

export const ParentRegistry = () => {
  const [parents] = useState(MOCK_PARENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isPTAHubOpen, setIsPTAHubOpen] = useState(false);

  const selectedParent = useMemo(() => 
    parents.find(p => p.id === selectedParentId),
    [parents, selectedParentId]
  );

  const filteredParents = useMemo(() => {
    return parents.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.wards.some(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [parents, searchQuery]);

  // Analytics Data
  const appAdoptionRate = (parents.filter(p => p.appAdopted).length / parents.length) * 100;
  const invalidNumbers = 4; // Mock
  const smsCredits = 12500;

  const engagementData = [
    { name: 'Adopted', value: parents.filter(p => p.appAdopted).length },
    { name: 'Pending', value: parents.filter(p => !p.appAdopted).length },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
      <header className="px-8 py-6 bg-white border-b border-slate-200/60 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <span>Registry</span>
              <ChevronRight size={10} />
              <span className="text-slate-900">Guardian Dynamic Hub</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight leading-none">
              Institutional Household Management
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setIsPTAHubOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-emerald-100 transition-all">
                <Users size={16} /> PTA Hub
             </button>
             <button onClick={() => setIsBroadcasting(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20">
                <Send size={16} /> Broadcast Blast
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            <div className="h-16 w-16 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={engagementData} cx="50%" cy="50%" innerRadius={20} outerRadius={30} paddingAngle={5} dataKey="value">
                    <Cell fill="#10b981" /><Cell fill="#94a3b8" />
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">App Adoption</p>
               <p className="text-xl font-black italic font-display text-emerald-600">{appAdoptionRate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="bg-rose-50 p-5 rounded-[2rem] border border-rose-100 flex items-center justify-between">
            <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
               <AlertCircle size={24} />
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Contact Accuracy</p>
               <p className="text-xl font-black italic font-display text-rose-900">{invalidNumbers} Missing</p>
            </div>
          </div>
          <div className="bg-blue-50 p-5 rounded-[2rem] border border-blue-100 flex items-center justify-between md:col-span-1 xl:col-span-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <CreditCard size={24} />
              </div>
              <div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Carrier Credits</p>
                <p className="text-xl font-black italic font-display text-blue-900">{smsCredits.toLocaleString()} SMS</p>
              </div>
            </div>
            <div className="h-2 w-32 bg-blue-100 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1 }} className="h-full bg-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 py-5 bg-white border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-6">
         <div className="flex items-center gap-4 flex-1 min-w-[300px]">
           <div className="relative flex-1">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="Search Guardians or Wards..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] outline-none font-medium" />
           </div>
         </div>
         <div className="flex items-center gap-3">
            <button className="px-5 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
               <Download size={16} /> Global Report
            </button>
            <button className="p-3 bg-slate-900 text-white rounded-2xl"><Plus size={20} /></button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guardian / Household</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Wards</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Communication Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ward Finance</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredParents.map((parent) => (
                <tr key={parent.id} className="group hover:bg-slate-50 cursor-pointer transition-all" onClick={() => setSelectedParentId(parent.id)}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className={cn(
                         "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                         parent.appAdopted ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                       )}>
                         {parent.appAdopted ? <UserCheck size={18} /> : <Users size={18} />}
                       </div>
                       <div>
                          <p className="text-[14px] font-black italic font-display text-slate-900 leading-none mb-1.5 flex items-center gap-2">
                            {parent.name}
                            {parent.isPTAExecutive && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] rounded uppercase">PTA Exec</span>}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{parent.phone}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex flex-wrap gap-1.5">
                       {parent.wards.map(w => (
                         <span key={w.id} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black italic font-display rounded-lg">
                           {w.name}
                         </span>
                       ))}
                     </div>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 mb-0.5">{parent.lastContacted}</p>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-tight">{parent.lastMessage}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      {parent.wards.map(w => (
                        <div key={w.id} className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          w.feesStatus === 'Paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          w.feesStatus === 'Arrears' ? "bg-rose-50 text-rose-600 border-rose-100" :
                          "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          {w.feesStatus}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                     <div className="flex justify-end gap-2">
                        <button className="p-3 bg-slate-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all" onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${parent.phone}`;
                        }}>
                          <Phone size={18} />
                        </button>
                        <button className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all"><MoreVertical size={18} /></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Profile Drawer */}
      <AnimatePresence>
        {selectedParent && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedParentId(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative w-full max-w-xl bg-white h-full shadow-2xl">
              <ParentProfile parent={selectedParent} onClose={() => setSelectedParentId(null)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Broadcasting Modal */}
      <AnimatePresence>
        {isBroadcasting && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsBroadcasting(false)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-3xl font-black italic font-display">Broadcast Terminal</h3>
                    <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mt-2">Global Household Communication Protocol</p>
                  </div>
                  <X className="cursor-pointer hover:text-rose-500 transition-all" onClick={() => setIsBroadcasting(false)} />
                </div>
                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Target Population</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm">
                        <option>All Guardians</option>
                        <option>SHS 3 Boarder Parents</option>
                        <option>Fee Arrears Only</option>
                        <option>Day Parent Protocol</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Template Core</label>
                      <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm">
                        <option>Custom Message</option>
                        <option>PTA Meeting Invitation</option>
                        <option>Terminal Report Dispatch</option>
                        <option>Re-opening Schedule</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Broadcast Payload</label>
                    <textarea 
                      rows={4}
                      className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-bold text-sm italic resize-none"
                      placeholder="Type your strategic institutional message here..."
                    />
                  </div>

                  <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">Report Card Sync</p>
                        <p className="text-[9px] font-black text-emerald-600 uppercase">Push PDF Reports to App</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-emerald-200 rounded-full relative">
                      <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 rounded-full" />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setIsBroadcasting(false)} className="flex-1 py-5 bg-slate-50 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Abort Blast</button>
                    <button className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                      <Send size={16} /> Execute Blast
                    </button>
                  </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PTA Hub Modal */}
      <AnimatePresence>
        {isPTAHubOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsPTAHubOpen(false)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-10 bg-emerald-900 text-white shrink-0">
                  <h3 className="text-3xl font-black italic font-display">PTA Executive Hub</h3>
                  <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mt-2">Association Governance & Engagement Analytics</p>
                </div>
                <div className="flex-1 overflow-y-auto p-10">
                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Association Leadership</h4>
                      <div className="space-y-4">
                        {parents.filter(p => p.isPTAExecutive).map(exec => (
                          <div key={exec.id} className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <UserCheck size={20} />
                              </div>
                              <div>
                                <p className="text-[13px] font-black italic font-display text-slate-900 leading-none mb-1">{exec.name}</p>
                                <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">{exec.ptaRole}</p>
                              </div>
                            </div>
                            <button className="p-2.5 bg-slate-900 text-white rounded-xl">
                              <Phone size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Attendance Trends</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { day: 'Meeting 1', count: 45 },
                            { day: 'Meeting 2', count: 52 },
                            { day: 'Meeting 3', count: 38 },
                            { day: 'Meeting 4', count: 65 },
                          ]}>
                            <defs>
                              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="day" hide />
                            <Tooltip />
                            <Area type="monotone" dataKey="count" stroke="#059669" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-6 flex justify-between items-center">
                         <div>
                            <p className="text-xl font-black italic font-display text-emerald-600">65%</p>
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Global Participation</p>
                         </div>
                         <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20">Log Meeting</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end">
                   <button onClick={() => setIsPTAHubOpen(false)} className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest">Close Command Center</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
