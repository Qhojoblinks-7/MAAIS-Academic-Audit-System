import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, TrendingUp, ArrowUpDown, Receipt, Download, Globe, Trash2, QrCode, Users, Target } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';

const feeRecords = [
  { id: 'f1', student: 'Angela Owusu', index: '001', class: 'SHS 3 Agric B', fee: 'T-Pass', amount: 4500, paid: 4500, status: 'PAID', dueDate: '2026-05-30' },
  { id: 'f2', student: 'Kwame Mensah', index: '002', class: 'SHS 3 Agric B', fee: 'T-Pass', amount: 4500, paid: 2500, status: 'PARTIAL', dueDate: '2026-05-30' },
  { id: 'f3', student: 'Yaw Boateng', index: '003', class: 'SHS 2 Science A', fee: 'PTA Levy', amount: 1200, paid: 0, status: 'PENDING', dueDate: '2026-06-15' },
  { id: 'f4', student: 'Esi Ansah', index: '004', class: 'SHS 1 Home Econ', fee: 'T-Pass', amount: 4500, paid: 4500, status: 'PAID', dueDate: '2026-05-30' },
  { id: 'f5', student: 'Kofi Appiah', index: '005', class: 'SHS 3 Gen Arts', fee: 'Sports Fee', amount: 800, paid: 800, status: 'PAID', dueDate: '2026-06-01' },
  { id: 'f6', student: 'Ama Darko', index: '006', class: 'SHS 1 Agric A', fee: 'PTA Levy', amount: 1200, paid: 0, status: 'OVERDUE', dueDate: '2026-04-15' },
];

const statusStyles = {
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  PARTIAL: 'bg-amber-50 text-amber-700 border-amber-100',
  PENDING: 'bg-gray-50 text-gray-500 border-gray-100',
  OVERDUE: 'bg-rose-50 text-rose-700 border-rose-100',
};

export function FinanceView() {
  const { user } = useRole();
  const [activeTab, setActiveTab] = React.useState('fees');
  const stats = React.useMemo(() => ({
    collected: feeRecords.reduce((sum, f) => sum + f.paid, 0),
    outstanding: feeRecords.reduce((sum, f) => sum + (f.amount - f.paid), 0),
    overdue: feeRecords.filter(f => f.status === 'OVERDUE').length,
    pending: feeRecords.filter(f => f.status === 'PENDING').length,
  }), []);

  const totalCollected = feeRecords.reduce((sum, f) => sum + f.paid, 0);
  const totalOutstanding = feeRecords.reduce((sum, f) => sum + (f.amount - f.paid), 0);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <Wallet size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">Finance &amp; Procurement</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fee ledger Â· procurement Â· income expenditure</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Collected This Term', value: `GHâ‚µ${totalCollected.toLocaleString()}`, icon: Wallet, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Outstanding', value: `GHâ‚µ${totalOutstanding.toLocaleString()}`, icon: AlertTriangle, color: 'bg-rose-50 text-rose-700' },
            { label: 'Overdue Items', value: stats.overdue.toString(), icon: Clock, color: 'bg-amber-50 text-amber-700' },
            { label: 'Procurement Orders', value: '8', icon: Target, color: 'bg-blue-50 text-blue-700' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.color)}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-8">
          {['fees', 'expenses', 'procurement'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === tab ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50")}>
              {tab === 'fees' ? 'Fee Ledger' : tab === 'expenses' ? 'Expenditure' : 'Procurement'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="text-gray-900" size={18} />
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Fee Records â€” {feeRecords.length} Entries</span>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all text-gray-500"><Download size={16} /></button>
              <button className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all text-gray-500"><QrCode size={16} /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Class</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Fee Type</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Paid</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Due</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {feeRecords.map((fee, i) => (
                  <tr key={fee.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-700">{fee.student.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{fee.student}</p>
                          <p className="text-[10px] font-bold text-gray-400">{fee.index}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{fee.class}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{fee.fee}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">GHâ‚µ{fee.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-700 text-right">GHâ‚µ{fee.paid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-500">{fee.dueDate}</td>
                    <td className="px-6 py-4">
                      <span className={cn("text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest border", statusStyles[fee.status])}>{fee.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

