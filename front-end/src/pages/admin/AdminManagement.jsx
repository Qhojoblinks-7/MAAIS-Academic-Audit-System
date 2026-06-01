import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Users, Server, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StaffRegistry } from './StaffRegistry';
import { InfrastructureView } from './components/InfrastructureView';
import { ProtocolsView } from './components/ProtocolsView';
import mockApiData from '../../data/mockApiData.json';

const iconMap = { Users, Server, Globe };

export function AdminManagement() {
  const [activeTab, setActiveTab] = React.useState('registry');

  const tabs = (mockApiData.engineRoom?.adminTabs || []).map(tab => ({
    ...tab,
    icon: iconMap[tab.icon] || Users
  }));

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
              {activeTab === 'registry' && <StaffRegistry />}
              {activeTab === 'infrastructure' && <InfrastructureView />}
              {activeTab === 'protocols' && <ProtocolsView />}
            </motion.div>
          </AnimatePresence>
      </motion.div>
    </div>
  );
}
