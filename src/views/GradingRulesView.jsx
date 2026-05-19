import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, Bell, BookOpen, Clock, Save, Shuffle,
  RotateCcw, Crown, Star, ShieldCheck, Settings, ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

export function GradingRulesView() {
  const navigate = useNavigate();

  const rules = [
    { id: 'r1', subject: 'General Science', a1: 80, b2: 75, b3: 70, c4: 65, c5: 60, c6: 55, d7: 50, e8: 45, active: true },
    { id: 'r2', subject: 'English Language', a1: 75, b2: 70, b3: 65, c4: 60, c5: 55, c6: 50, d7: 45, e8: 40, active: true },
    { id: 'r3', subject: 'Mathematics', a1: 80, b2: 75, b3: 65, c4: 60, c5: 55, c6: 50, d7: 45, e8: 40, active: true },
    { id: 'r4', subject: 'Social Studies', a1: 75, b2: 70, b3: 65, c4: 60, c5: 55, c6: 50, d7: 45, e8: 40, active: true },
    { id: 'r5', subject: 'General Arts', a1: 80, b2: 75, b3: 70, c4: 65, c5: 60, c6: 55, d7: 50, e8: 45, active: true },
    { id: 'r6', subject: 'Home Economics', a1: 75, b2: 70, b3: 65, c4: 60, c5: 55, c6: 50, d7: 45, e8: 40, active: true },
  ];

  const grades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <Crown size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">Grading Thresholds</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Per-subject score boundaries &amp; automated remarks</p>
            </div>
          </div>
          <button onClick={() => navigate('/grading')} className="flex items-center gap-2 text-xs font-black text-gray-600 hover:text-emerald-700 uppercase tracking-[0.15em] transition-colors">
            View Matrix <ChevronRight size={14} />
          </button>
        </header>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="text-gray-900" size={18} />
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Active Thresholds — {rules.length} Subjects</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg">
              <Plus size={14} /> Add Subject
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                  {grades.map(g => (
                    <th key={g} className="px-4 py-4 text-center text-[9px] font-black text-gray-400 uppercase tracking-widest border-l border-gray-100 min-w-[60px]">
                      <div className="flex flex-col items-center gap-1">
                        <span>{g}</span>
                        <span className="text-gray-200">≥</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4 text-sm font-black text-gray-900">{rule.subject}</td>
                    <td className="px-4 py-4 text-center text-sm font-black text-emerald-700 border-l border-gray-50">{rule.a1}</td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-blue-600 border-l border-gray-50">{rule.b2}</td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-blue-500 border-l border-gray-50">{rule.b3}</td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-amber-600 border-l border-gray-50">{rule.c4}</td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-amber-500 border-l border-gray-50">{rule.c5}</td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-amber-500/70 border-l border-gray-50">{rule.c6}</td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-rose-600 border-l border-gray-50">{rule.d7}</td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-rose-500 border-l border-gray-50">{rule.e8}</td>
                    <td className="px-6 py-4">
                      <span className={cn("text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest", rule.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500")}>
                        {rule.active ? 'Active' : 'Draft'}
                      </span>
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
