import React from 'react';
import { Users, GraduationCap, BookOpen, Pencil, Trash2, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function StaffRegistry() {
  const staff = [
    { id: 't1', name: 'Anthony Hackman', role: 'Teacher', dept: 'General Agric', classes: 4, status: 'Active' },
    { id: 't2', name: 'Abena Boateng', role: 'Teacher', dept: 'General Science', classes: 3, status: 'Active' },
    { id: 't3', name: 'Martha Baah', role: 'HOD', dept: 'Home Economics', classes: 2, status: 'Active' },
    { id: 't4', name: 'Kwadwo Mensah', role: 'Teacher', dept: 'Technical Drawing', classes: 3, status: 'On Leave' },
    { id: 't5', name: 'Esi Dankwa', role: 'Teacher', dept: 'English Language', classes: 6, status: 'Active' },
    { id: 't6', name: 'Yaw Asare', role: 'Teacher', dept: 'Mathematics', classes: 5, status: 'Active' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">Staff Registry</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Personnel directory & role assignments</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-emerald-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg">
            <Plus size={16} /> Add Staff Member
          </button>
        </header>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-900 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-900 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-900 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-900 uppercase tracking-widest">Classes</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-900 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-900 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[10px] font-black text-emerald-700">
                        {s.name.charAt(0)}
                      </div>
                      <span className="text-sm font-black text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{s.role}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{s.dept}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{s.classes}</td>
                  <td className="px-6 py-4">
                    <span className={cn("text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest", s.status === 'Active' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{s.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-700"><Pencil size={14} /></button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-all text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
