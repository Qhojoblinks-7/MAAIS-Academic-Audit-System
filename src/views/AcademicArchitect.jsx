import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Cpu, BookOpen, Plus, Save, RotateCcw, Trash2,
  ArrowRight, Search, Star, Sparkles, ChevronRight, Zap,
} from 'lucide-react';
import { cn } from '../lib/utils';

const academicYears = ['2026/2027 (Active)', '2025/2026 (Archived)', '2024/2025 (Archived)', '2023/2024 (Archived)'] as const;
const termsList = ['Term 1 (Jan–Apr)', 'Term 2 (May–Aug)', 'Term 3 (Sep–Dec)'];

const allSubjects = [
  { id: 's1', code: 'MTH101', name: 'Core Mathematics', type: 'CORE', dept: 'Mathematics', mandatory: true },
  { id: 's2', code: 'ENG101', name: 'English Language', type: 'CORE', dept: 'English', mandatory: true },
  { id: 's3', code: 'SCI101', name: 'Integrated Science', type: 'CORE', dept: 'Science', mandatory: true },
  { id: 's4', code: 'SOC101', name: 'Social Studies', type: 'CORE', dept: 'Social Studies', mandatory: true },
  { id: 's5', code: 'ICT101', name: 'ICT / Computing', type: 'CORE', dept: 'ICT', mandatory: true },
  { id: 's6', code: 'AGR201', name: 'General Agriculture', type: 'TECHNICAL', dept: 'Agriculture', mandatory: false },
  { id: 's7', code: 'ECO201', name: 'Economics', type: 'ELECTIVE', dept: 'Business', mandatory: false },
  { id: 's8', code: 'ART201', name: 'Visual Arts', type: 'TECHNICAL', dept: 'Art', mandatory: false },
];

const classGroups = [
  { id: 'c1', name: 'SHS 1 Agric A', form: 1, stream: 'A', dept: 'Agriculture', classSize: 40, enrolled: true },
  { id: 'c2', name: 'SHS 1 Agric B', form: 1, stream: 'B', dept: 'Agriculture', classSize: 42, enrolled: true },
  { id: 'c3', name: 'SHS 2 Science A', form: 2, stream: 'A', dept: 'Science', classSize: 38, enrolled: true },
  { id: 'c4', name: 'SHS 2 Science B', form: 2, stream: 'B', dept: 'Science', classSize: 36, enrolled: true },
  { id: 'c5', name: 'SHS 3 Home Econ', form: 3, stream: 'A', dept: 'Home Economics', classSize: 35, enrolled: true },
  { id: 'c6', name: 'SHS 3 Gen Arts', form: 3, stream: 'A', dept: 'General Arts', classSize: 33, enrolled: true },
  { id: 'c7', name: 'SHS 3 Agric B', form: 3, stream: 'B', dept: 'Agriculture', classSize: 41, enrolled: true },
  { id: 'c8', name: 'SHS 1 Visual', form: 1, stream: 'A', dept: 'Visual Arts', classSize: 28, enrolled: true },
];

export function AcademicArchitect() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = React.useState('subjects');
  const [activeYear, setActiveYear] = React.useState('2026/2027 (Active)');
  const [activeTerm, setActiveTerm] = React.useState('Term 1 (Jan–Apr)');
  const [subjectSearch, setSubjectSearch] = React.useState('');
  const [selectedClass, setSelectedClass] = React.useState(classGroups[0]?.name || '');
  const [selectedElective, setSelectedElective] = React.useState('Select Elective');

  const sections = [
    { key: 'subjects', label: 'Curriculum Matrix' },
    { key: 'classes', label: 'Class Forge' },
    { key: 'promotion', label: 'Promotion Cycle' },
  ];

  const filteredSubjects = allSubjects.filter(s =>
    s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
    s.code.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12 pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 font-display italic tracking-tight leading-none mb-3">Academic Architect</h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                <Cpu size={16} className="text-gray-400" />
                <select value={activeYear} onChange={(e) => setActiveYear(e.target.value)} className="bg-transparent text-xs font-black text-gray-900 focus:outline-none tracking-wide font-mono">
                  {academicYears.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                <Cpu size={16} className="text-emerald-500" />
                <select value={activeTerm} onChange={(e) => setActiveTerm(e.target.value)} className="bg-transparent text-xs font-black text-gray-900 focus:outline-none font-mono">
                  {termsList.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Sub-navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {sections.map(section => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                activeSection === section.key ? "bg-gray-900 text-white shadow-lg" : "bg-white text-gray-500 border border-gray-200"
              )}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Curriculum Matrix */}
        {activeSection === 'subjects' && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {['CORE', 'TECHNICAL', 'ELECTIVE'].map((type) => (
              <div key={type} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} className={type === 'CORE' ? 'text-blue-600' : type === 'TECHNICAL' ? 'text-amber-600' : 'text-purple-600'} />
                    <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest italic font-display">{type} Subjects</h2>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">{allSubjects.filter(s => s.type === type).length} total</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {allSubjects.filter(s => s.type === type).map((subject) => (
                    <div key={subject.id} className="flex items-center gap-4 p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-all">
                      <div className={cn("w-2 h-6 rounded-full", type === 'CORE' ? 'bg-blue-500' : type === 'TECHNICAL' ? 'bg-amber-500' : 'bg-purple-500')} />
                      <div className="flex-1">
                        <p className="text-sm font-black text-gray-900">{subject.name}</p>
                        <span className="text-[9px] font-black font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{subject.code}</span>
                        <span className="text-[9px] font-black text-gray-400 ml-2">{subject.dept}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {subject.mandatory && (
                          <span className="text-[8px] font-black text-white uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500">MANDATORY</span>
                        )}
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-300 hover:text-gray-700"><Edit3 size={14} /></button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-all text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.section>
        )}

        {/* Class Forge */}
        {activeSection === 'classes' && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-8 flex gap-3">
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-900 uppercase tracking-widest focus:outline-none">
                <option value="">Add Elective to a Group ({classGroups.length})</option>
                {classGroups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
              <select value={selectedElective} onChange={(e) => setSelectedElective(e.target.value)} className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-900 uppercase tracking-widest focus:outline-none">
                <option>Select Elective</option>
                {allSubjects.filter(s => s.type === 'ELECTIVE' || s.type === 'TECHNICAL').map(s => <option key={s.id} value={s.code}>{s.code} — {s.name}</option>)}
              </select>
              <button className="px-6 py-3 bg-emerald-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg flex items-center gap-2">
                <Plus size={16} /> Add to Group
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {classGroups.map((cls, i) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-[2.5rem] border border-gray-100 p-7 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Star size={14} className="text-emerald-600" />
                      </div>
                      <span className="text-[13px] font-black text-gray-900 italic font-display">{cls.name}</span>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-300 hover:text-gray-700">
                      <Settings size={14} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen size={11} /> Elective Choices
                    </p>
                    <div className="space-y-2">
                      {allSubjects.filter(s => s.type === 'ELECTIVE' || s.type === 'TECHNICAL').slice(0, 2).map((s) => (
                        <div key={s.id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-emerald-50/60 to-emerald-50/20 rounded-xl border border-emerald-100">
                          <div className="flex-1">
                            <p className="text-[11px] font-black text-gray-900 tracking-tight">{s.name}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{s.dept}</p>
                          </div>
                          <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">{s.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Promotion Cycle */}
        {activeSection === 'promotion' && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm mb-8">
              <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3 mb-8">
                <RotateCcw className="text-gray-900" size={20} />
                <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Manage Promotions</h2>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-8">
                Execute end-of-term transitions. Select a destination class and action type for each form.
              </p>
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="pb-3 pr-4">From</th>
                      <th className="pb-3 pr-4">To</th>
                      <th className="pb-3 pr-4">Action</th>
                      <th className="pb-3 text-right">Execute</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { from: 'SHS 1', to: 'SHS 2', action: 'Promote', students: 182 },
                      { from: 'SHS 2', to: 'SHS 3', action: 'Promote', students: 157 },
                      { from: 'SHS 3', to: 'Alumni', action: 'Graduate', students: 98 },
                      { from: 'SHS 2', to: 'SHS 2 (Repeat)', action: 'Repeat', students: 12 },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="py-4 pr-4 text-[13px] font-black text-gray-900">{row.from}</td>
                        <td className="py-4 pr-4 text-sm font-medium text-gray-500">{row.to}</td>
                        <td className="py-4 pr-4">
                          <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-2 py-1 rounded">{row.action}</span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="px-4 py-2 bg-emerald-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg">Execute {row.action}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Retention Policy */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
              <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3 mb-8">
                <Trash2 className="text-gray-900" size={20} />
                <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Data Retention &amp; Pruning</h2>
              </div>
              <button className="px-8 py-4 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg flex items-center gap-2">
                <RotateCcw size={16} /> Perform System Cleanse
              </button>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
