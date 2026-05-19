import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Send, Phone, Users, CheckCircle2, Clock, BarChart3,
  Eye, SendHorizontal, AlertCircle, EyeOff, Handshake, Verified, UserCheck, PhoneCall,
} from 'lucide-react';
import { cn } from '../lib/utils';

export function CommsView() {
  const [activeTab, setActiveTab] = React.useState('sms');

  const smsStats = [
    { label: 'Pending Notices', value: '5', sub: 'Draft phase' },
    { label: 'Sent This Week', value: '240', sub: 'Across 8 classes' },
    { label: 'Read Rate', value: '87%', sub: 'Strong engagement' },
    { label: 'Failed Deliveries', value: '3', sub: 'Requires retry' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none italic font-display mb-2">
            Communications Hub
          </h1>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
            School-wide notices · SMS dispatch · Mass notifications
          </p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {smsStats.map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-[24px] font-black text-gray-900 tracking-tighter">{stat.value}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
              <p className="text-[10px] font-medium text-gray-500 mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare className="text-gray-900" size={20} />
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Compose New Broadcast</h2>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Notice title..." className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-[14px] font-black text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
            <textarea placeholder="Write your broadcast message here..." rows={4} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 resize-none" />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-widest">SMS</span>
                <span className="px-3 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black rounded-lg uppercase tracking-widest">APP</span>
                <span className="px-3 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black rounded-lg uppercase tracking-widest">EMAIL</span>
              </div>
              <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg">
                Dispatch Now
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Recent Dispatches</h2>
            </div>
            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Term 2 Mid-Term Results Released', channel: 'SMS', time: '2h ago', status: 'sent' },
              { title: 'Parent-Teacher Conference Reminder', channel: 'APP', time: '1d ago', status: 'delivered' },
              { title: 'Emergency Closure Notice', channel: 'SMS', time: '3d ago', status: 'sent' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <SendHorizontal size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{item.title}</p>
                    <p className="text-[10px] font-bold text-gray-400">{item.channel} • {item.time}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded uppercase tracking-widest">{item.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
