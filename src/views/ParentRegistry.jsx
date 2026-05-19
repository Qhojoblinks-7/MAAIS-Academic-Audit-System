import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, User, GraduationCap, Pencil, Clock, ShieldCheck, DollarSign,
  Home, Phone, Calendar, ChevronRight, Edit3, Search, Filter,
  PhoneCall, PhoneOff, Trash2, Send, Eye, UserCheck, Star, Archive,
} from 'lucide-react';
import { cn } from '../lib/utils';

const mockParents = [
  { id: 'p1', name: 'Owusu Family', student: 'Angela Owusu', class: 'SHS 3 Agric B', relations: ['Father: Kofi Owusu'], contact: '+233 24 000 0001', email: 'kofi@mail.com', smsStatus: 'active', lastContact: '2026-05-12' },
  { id: 'p2', name: 'Mensah Family', student: 'Kwame Mensah', class: 'SHS 3 Agric B', relations: ['Mother: Akua Mensah'], contact: '+233 24 000 0002', email: 'akua@mail.com', smsStatus: 'active', lastContact: '2026-05-10' },
  { id: 'p3', name: 'Boateng Family', student: 'Yaw Boateng', class: 'SHS 2 Science A', relations: ['Guardian: Kwame Boateng'], contact: '+233 24 000 0003', email: 'boateng@mail.com', smsStatus: 'inactive', lastContact: '2026-03-21' },
  { id: 'p4', name: 'Ansah Family', student: 'Esi Ansah', class: 'SHS 1 Home Econ', relations: ['Father: Kwesi Ansah', 'Mother: Afia Ansah'], contact: '+233 24 000 0004', smsStatus: 'active', lastContact: '2026-04-08' },
  { id: 'p5', name: 'Asare Family', student: 'Kofi Appiah', class: 'SHS 3 Gen Arts', relations: ['Guardian: Ama Asare'], contact: '+233 24 000 0005', smsStatus: 'active', lastContact: '2026-05-15' },
  { id: 'p6', name: 'Darko Family', student: 'Ama Darko', class: 'SHS 1 Agric A', relations: ['Mother: Abena Darko'], contact: '—', email: '—', smsStatus: 'unregistered', lastContact: '—' },
];

const smsStyles = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  inactive: 'bg-gray-50 text-gray-400 border-gray-200',
  unregistered: 'bg-rose-50 text-rose-700 border-rose-100',
};

export function ParentRegistry() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filtered = mockParents.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.student.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">Parent Registry</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guardian contacts &amp; comms history</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search parent or student..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 w-56" />
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg">
              <Users size={16} /> Register
            </button>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-gray-900" size={18} />
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{filtered.length} Registered Guardians</span>
            </div>
            <div className="flex gap-2">
              {['active', 'unregistered'].map(f => (
                <button key={f} className="px-3 py-1.5 rounded-lg text-[9px] font-black text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 uppercase tracking-widest">{f}</button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {filtered.map((parent, i) => (
              <motion.div
                key={parent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-gray-50/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center font-black text-gray-700 text-sm">
                    {parent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 mb-0.5">{parent.name}</p>
                    <p className="text-[10px] font-bold text-gray-400">{parent.student} · {parent.class}</p>
                  </div>
                </div>
                <div className="flex flex-1 min-w-[150px] justify-center">
                  {parent.relations.map((rel, j) => (
                    <span key={j} className="text-[10px] font-medium text-gray-500 mr-2 first:mr-0">{rel}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 min-w-[200px]">
                  {parent.contact !== '—' ? (
                    <a href={`tel:${parent.contact}`} className="text-[10px] font-bold text-gray-600 hover:text-emerald-700">{parent.contact}</a>
                  ) : <span className="text-[10px] font-bold text-gray-300 italic">No contact</span>}
                  <span className={cn("text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest border", smsStyles[parent.smsStatus])}>{parent.smsStatus}</span>
                </div>
                <button onClick={() => navigate(`/comms`)} className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-700 transition-all text-gray-400">
                  <Send size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
