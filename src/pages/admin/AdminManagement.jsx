import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Database, 
  ShieldAlert, 
  Search, 
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Server,
  Activity,
  Lock,
  Globe,
  Cpu,
  RefreshCw,
  HardDrive,
  FileCode,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

const users = [
  { id: '1', name: 'Martha Baah', role: 'HOD', dept: 'Home Ec', status: 'ACTIVE', lastLogin: '1h ago' },
  { id: '2', name: 'Anthony Hackman', role: 'ADMIN', dept: 'Administration', status: 'ACTIVE', lastLogin: 'Now' },
  { id: '3', name: 'Angela Efia Owusu', role: 'STUDENT', dept: 'Agric', status: 'ACTIVE', lastLogin: '5h ago' },
  { id: '4', name: 'Samuel Boateng', role: 'TEACHER', dept: 'Science', status: 'INACTIVE', lastLogin: '2d ago' },
];

const tabs = [
  { id: 'registry', label: 'Command Registry', icon: Users },
  { id: 'infrastructure', label: 'Infrastructure Hub', icon: Server },
  { id: 'protocols', label: 'Institutional Protocols', icon: Globe },
];

export function AdminManagement() {
  const [activeTab, setActiveTab] = React.useState('registry');

  const renderRegistry = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Authorized Units', value: '1,240', sub: '+12 this week' },
          { label: 'Active Sessions', value: '86', sub: 'Nominal' },
          { label: 'Pending Access', value: '0', sub: 'Clean Registry' },
          { label: 'Escalation Flags', value: '3', sub: 'Review Required' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[20px] font-black text-gray-900 tracking-tighter">{stat.value}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-2 bg-emerald-50 w-fit px-2 py-0.5 rounded">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search biological nodes..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/5 w-72 transition-all"
              />
            </div>
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
              {['ALL', 'TEACHER', 'HOD', 'STUDENT'].map((role) => (
                <button key={role} className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all text-gray-400 hover:text-gray-900">
                  {role}
                </button>
              ))}
            </div>
          </div>
          <button className="h-10 px-6 bg-emerald-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-emerald-900/10 flex items-center gap-2">
            <UserPlus size={14} />
            Onboard Entity
          </button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/10 border-b border-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <th className="px-8 py-5">Verified Identity</th>
              <th className="px-8 py-5">Authorization</th>
              <th className="px-8 py-5">Sub-Node (Dept)</th>
              <th className="px-8 py-5 text-center">Protocol Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs ring-1 ring-inset ring-gray-200 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[14px] font-black text-gray-900 tracking-tight leading-none mb-1">{user.name}</p>
                      <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Last Entry: {user.lastLogin}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em]",
                    user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' :
                    user.role === 'HOD' ? 'bg-blue-50 text-blue-700' :
                    user.role === 'TEACHER' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'
                  )}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{user.dept}</span>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      user.status === 'ACTIVE' ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                    )} />
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      user.status === 'ACTIVE' ? "text-emerald-600" : "text-gray-400"
                    )}>
                      {user.status === 'ACTIVE' ? 'Online' : 'Dormant'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
                      <Edit2 size={14} />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInfrastructure = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Compute Core Status</h3>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Cryptographic Sync: OK</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'CPU Cluster B', value: '14%', icon: Cpu, color: 'text-emerald-600' },
              { label: 'RAM Verification', value: '3.2 GB', icon: Activity, color: 'text-blue-600' },
              { label: 'SSD Throughput', value: '450 MB/s', icon: HardDrive, color: 'text-purple-600' },
              { label: 'Active Requests', value: '42 ops', icon: RefreshCw, color: 'text-amber-600' },
            ].map((node, i) => (
              <div key={i} className="p-5 bg-gray-50/50 border border-gray-100 rounded-2xl flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center", node.color)}>
                  <node.icon size={18} />
                </div>
                <div>
                  <p className="text-[18px] font-black text-gray-900 tracking-tighter leading-none mb-1">{node.value}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{node.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Database Backup Registry</h3>
            <button className="h-9 px-4 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all">
              Initialize Snapshot
            </button>
          </div>
          <div className="space-y-4">
            {[
              { id: 'snap_0x1', time: '2026-04-21 04:00', size: '1.2 GB', type: 'Automated' },
              { id: 'snap_0x2', time: '2026-04-20 04:00', size: '1.1 GB', type: 'Automated' },
              { id: 'snap_0x3', time: '2026-04-19 04:00', size: '1.1 GB', type: 'Manual' },
            ].map((snap, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-50 rounded-2xl hover:bg-gray-50/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-[12px] font-black text-gray-900 tracking-tight leading-none mb-1">{snap.id}</p>
                    <p className="text-[9px] font-bold text-gray-400">Timestamp: {snap.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-black text-gray-400 uppercase">{snap.size}</span>
                  <button className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-emerald-700 transition-all">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl shadow-gray-900/20">
          <ShieldAlert className="text-amber-500 mb-6" size={32} />
          <h3 className="text-[16px] font-black tracking-tight mb-2 italic">Infrastructure Lock</h3>
          <p className="text-[11px] text-gray-400 leading-relaxed font-medium mb-8">
            Global system updates are restricted to Maintenance Windows. Emergency patches require Alpha-Level biometric verification.
          </p>
          <div className="space-y-3">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
               <span>Firewall Node</span>
               <span className="text-emerald-500">Shielded</span>
             </div>
             <div className="h-1 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 w-[94%]" />
             </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-6">Service Health</h3>
          <div className="space-y-4">
            {[
              { label: 'Auth Gateway', status: 'Optimal' },
              { label: 'PDF Engine', status: 'Stable' },
              { label: 'Report Generator', status: 'Optimal' },
              { label: 'Email Relay', status: 'Degraded' },
            ].map((svc, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{svc.label}</span>
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                    svc.status === 'Optimal' ? "text-emerald-600 bg-emerald-50" : 
                    svc.status === 'Stable' ? "text-blue-600 bg-blue-50" : "text-rose-600 bg-rose-50"
                )}>{svc.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProtocols = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-8">Institutional Parameters</h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Year</label>
            <select className="w-full h-12 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-[13px] font-black tracking-tight focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all">
              <option>2025/2026 Academic Cycle</option>
              <option>2026/2027 Academic Cycle</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Terminal Node</label>
            <select className="w-full h-12 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-[13px] font-black tracking-tight focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all">
              <option>First Term Protocol</option>
              <option>Second Term Protocol</option>
              <option>Third Term Protocol</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Global Mark Cap (%)</label>
            <input type="number" defaultValue={100} className="w-full h-12 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-[13px] font-black tracking-tight focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">System-Wide Revision Buffer (Days)</label>
            <input type="number" defaultValue={7} className="w-full h-12 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-[13px] font-black tracking-tight focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-8">Security & Verification Tiering</h3>
        <div className="space-y-6">
          {[
            { label: 'Multi-Factor Biometric Auth', desc: 'Enforce fingerprint/face unlock for all HOD certifications.', active: true },
            { label: 'Cryptographic Audit Trail', desc: 'Seal every mark entry with a unique institutional hash.', active: true },
            { label: 'Automated Variance Flagging', desc: 'Alert admins if grade swings exceed 30% per term.', active: false },
            { label: 'Dark Mode Enforcement', desc: 'Force low-light UI scaling for mobile nodes.', active: false },
          ].map((policy, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl group hover:border-emerald-200 transition-all">
              <div>
                <p className="text-[13px] font-black text-gray-900 tracking-tight leading-none mb-2">{policy.label}</p>
                <p className="text-[10px] text-gray-500 font-medium">{policy.desc}</p>
              </div>
              <button className={cn(
                "w-12 h-6 rounded-full relative transition-all duration-300",
                policy.active ? "bg-emerald-600 shadow-lg shadow-emerald-900/20" : "bg-gray-200"
              )}>
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300",
                  policy.active ? "right-1" : "left-1"
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="h-12 px-12 bg-emerald-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-emerald-900/20">
          Sync Protocols Instituion-Wide
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 lg:p-12 pb-32 lg:pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <header className="mb-12 flex justify-between items-end">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-950 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-950/20">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[38px] font-black text-gray-900 tracking-tighter leading-none italic font-display italic uppercase">Architectural Oversight</h1>
              <p className="text-[11px] font-black text-emerald-800 uppercase tracking-[0.25em] mt-2">Centralized Command Hub for System Governance & Institutional Integrity</p>
            </div>
          </div>
          <div className="flex p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all",
                  activeTab === tab.id 
                    ? "bg-emerald-950 text-white shadow-xl shadow-emerald-950/20" 
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <tab.icon size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'registry' && renderRegistry()}
            {activeTab === 'infrastructure' && renderInfrastructure()}
            {activeTab === 'protocols' && renderProtocols()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
