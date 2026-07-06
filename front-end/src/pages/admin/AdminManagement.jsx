import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StaffRegistry } from './StaffRegistry';

const iconMap = { Users };

const ADMIN_TABS = [
  { id: 'registry', label: 'Staff Registry', icon: 'Users' },
];

export function AdminManagement() {
  const [activeTab, setActiveTab] = React.useState('registry');

  const tabs = ADMIN_TABS.map(tab => ({
    ...tab,
    icon: iconMap[tab.icon] || Users,
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 lg:p-12 pb-32 lg:pb-24 scrollbar-hide">
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
        </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'registry' && <StaffRegistry />}
            </motion.div>
          </AnimatePresence>
      </motion.div>
    </div>
  );
}
