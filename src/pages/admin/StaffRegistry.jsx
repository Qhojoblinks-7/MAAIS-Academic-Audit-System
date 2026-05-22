import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  ChevronRight, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Lock, 
  ArrowLeft,
  X,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

const mockStaff = [
  { id: '1', name: 'Anthony Hackman', employeeId: 'STF-001', department: 'Science', role: 'Teacher', status: 'Active', email: 'a.hackman@vault.edu', phone: '+233 24 555 0101', joinedDate: '2018-09-12' },
  { id: '2', name: 'Martha Baah', employeeId: 'STF-002', department: 'Home Economics', role: 'HOD', status: 'Active', email: 'm.baah@vault.edu', phone: '+233 20 555 0202', joinedDate: '2015-01-20' },
  { id: '3', name: 'Samuel Boateng', employeeId: 'STF-003', department: 'Science', role: 'Teacher', status: 'On Leave', email: 's.boateng@vault.edu', phone: '+233 55 555 0303', joinedDate: '2020-11-05' },
  { id: '4', name: 'Gladys Owusu', employeeId: 'STF-004', department: 'Administration', role: 'Accountant', status: 'Active', email: 'g.owusu@vault.edu', phone: '+233 24 555 0404', joinedDate: '2012-06-15' },
  { id: '5', name: 'John Mensah', employeeId: 'STF-005', department: 'Languages', role: 'Teacher', status: 'Retired', email: 'j.mensah@vault.edu', phone: '+233 27 555 0505', joinedDate: '1998-09-01' },
  { id: '6', name: 'Elizabeth Osei', employeeId: 'STF-006', department: 'Mathematics', role: 'Teacher', status: 'Active', email: 'e.osei@vault.edu', phone: '+233 54 555 0606', joinedDate: '2021-02-14' },
];

export function StaffRegistry() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStaff, setSelectedStaff] = React.useState(null);
  const [isResettingPassword, setIsResettingPassword] = React.useState(false);

  const filteredStaff = mockStaff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Header Strategy Bar */}
      <header className="px-8 py-6 bg-white border-b border-slate-200/60 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight leading-none mb-1">
            Staff Directory
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Command Registry : {mockStaff.length} Nodes</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all">
            <Download size={14} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/10">
            <UserPlus size={16} />
            Onboard Staff
          </button>
        </div>
      </header>

      {/* Filter & Search Bar */}
      <div className="px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="relative w-96 flex items-center group">
          <Search className="absolute left-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Query Registry by Name or Employee ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Registry Table */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50/80 backdrop-blur-md border-b border-slate-200">
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name / ID</th>
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Role</th>
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry Status</th>
              <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredStaff.map((staff) => (
              <tr 
                key={staff.id} 
                onClick={() => setSelectedStaff(staff)}
                className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[0.75rem] bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-sm border border-slate-200 group-hover:bg-white transition-colors uppercase">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-[14px] font-black text-slate-900 leading-none mb-1 group-hover:text-emerald-800 transition-colors">{staff.name}</p>
                      <p className="text-[11px] font-bold text-slate-400 font-mono tracking-tighter">{staff.employeeId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[13px] font-bold text-slate-600">{staff.department}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{staff.role}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest",
                    staff.status === 'Active' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                    staff.status === 'On Leave' ? "bg-amber-50 border-amber-100 text-amber-700" :
                    "bg-slate-100 border-slate-200 text-slate-500"
                  )}>
                    <div className={cn(
                      "w-1 h-1 rounded-full",
                      staff.status === 'Active' ? "bg-emerald-500" :
                      staff.status === 'On Leave' ? "bg-amber-500" :
                      "bg-slate-400"
                    )} />
                    {staff.status}
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStaff.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-200 mb-6 font-display italic text-4xl">
              ?
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No Nodes Identified</h3>
            <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
              No staff members matching your current filters were found in the registry.
            </p>
          </div>
        )}
      </div>

      {/* Staff Profile Side Panel */}
      <AnimatePresence>
        {selectedStaff && (
          <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStaff(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm shadow-inner"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
            >
              {/* Profile Header */}
              <div className="p-8 bg-slate-900 text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
                  <ShieldCheck size={200} />
                </div>
                
                <div className="flex justify-between items-center mb-10 relative">
                  <button onClick={() => setSelectedStaff(null)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                    <ArrowLeft size={20} />
                  </button>
                  <button className="p-2.5 bg-white/10 hover:bg-rose-500 rounded-xl transition-all">
                    <X size={20} onClick={() => setSelectedStaff(null)} />
                  </button>
                </div>

                <div className="relative">
                  <div className="w-24 h-24 rounded-[2rem] bg-white text-slate-900 flex items-center justify-center text-3xl font-black italic font-display shadow-2xl mb-6 ring-4 ring-white/10">
                    {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-3xl font-black italic font-display tracking-tight mb-2 leading-none">{selectedStaff.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">{selectedStaff.employeeId}</span>
                    <div className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="text-[11px] font-bold text-white/60">Joined {selectedStaff.joinedDate}</span>
                  </div>
                </div>
              </div>

              {/* Profile Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {/* Status Command */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Registry Standing</p>
                    <div className="flex items-center gap-2">
                       <div className={cn(
                        "w-2 h-2 rounded-full",
                        selectedStaff.status === 'Active' ? "bg-emerald-500" :
                        selectedStaff.status === 'On Leave' ? "bg-amber-500" :
                        "bg-slate-400"
                      )} />
                      <span className="text-[14px] font-black text-slate-900 tracking-tight">{selectedStaff.status}</span>
                    </div>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Institutional Node</p>
                    <span className="text-[14px] font-black text-slate-900 tracking-tight">{selectedStaff.department}</span>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <section>
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                    <div className="w-6 h-[1px] bg-slate-200" />
                    Contact Protocol
                  </h4>
                  <div className="space-y-4">
                    <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-slate-300 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Email</p>
                          <p className="text-[13px] font-bold text-slate-900">{selectedStaff.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-slate-300 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                          <Phone size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Secure Line</p>
                          <p className="text-[13px] font-bold text-slate-900">{selectedStaff.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Security Actions */}
                <section>
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                    <div className="w-6 h-[1px] bg-slate-200" />
                    Security Procedures
                  </h4>
                  <div className="p-6 bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-900/10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center">
                        <Lock size={22} />
                      </div>
                      <div>
                        <h5 className="text-white text-sm font-black tracking-tight leading-none mb-1">Access Protocol Hub</h5>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Node ID: {selectedStaff.id}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setIsResettingPassword(true);
                        setTimeout(() => {
                          setIsResettingPassword(false);
                          alert('Password Reset Link Dispatched via Secure Protocol.');
                        }, 2000);
                      }}
                      disabled={isResettingPassword}
                      className={cn(
                        "w-full py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/20",
                        isResettingPassword ? "bg-white/5 text-white/40" : "bg-white text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <Lock size={16} />
                      {isResettingPassword ? 'Dispatching Token...' : 'Reset Access Password'}
                    </button>
                    
                    <p className="text-[9px] text-white/30 text-center mt-4 font-medium leading-relaxed italic">
                      This action will terminate all active sessions and invalidate the current biological handshake.
                    </p>
                  </div>
                </section>
              </div>

              {/* Panel Footer */}
              <div className="p-8 bg-slate-50 border-t border-slate-200">
                <button className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                  Commit Registry Updates
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
