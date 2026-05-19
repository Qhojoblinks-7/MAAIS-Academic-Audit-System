import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, PlusCircle, Send, FileText, GraduationCap, ArrowRight,
  ShieldCheck, AlertTriangle, Timestamp as Clock, QrCode, Download,
  Sparkles, Hash, Eye, Star, CheckCircle2, FileCheck, Scale,
} from 'lucide-react';
import { cn } from '../lib/utils';

export function TranscriptPrintTemplate() {
  return React.createElement('div', null, 'Transcript Print Template placeholder');
}

const mockStudents = [
  { id: 's1', name: 'Angela Owusu', index: '001', class: 'SHS 3 Agric B' },
  { id: 's2', name: 'Kwame Mensah', index: '002', class: 'SHS 3 Agric B' },
  { id: 's3', name: 'Yaw Boateng', index: '003', class: 'SHS 2 Science A' },
  { id: 's4', name: 'Esi Ansah', index: '004', class: 'SHS 1 Home Econ' },
  { id: 's5', name: 'Kofi Appiah', index: '005', class: 'SHS 3 Gen Arts' },
];

export function StudentJourney() {
  return <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8"><p className="text-gray-400 text-sm">Student Journey placeholder</p></div>;
}

export function TranscriptBuilder() {
  const navigate = useNavigate();
  const [students, setStudents] = React.useState(mockStudents);
  const [selected, setSelected] = React.useState(null);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-2">
            Transcript & Report Builder
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Student history · PDF export · QR-verified transcripts
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {students.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(s)}
              className={cn("p-6 rounded-2xl border transition-all cursor-pointer", selected?.id === s.id ? "bg-gray-900 text-white border-gray-800" : "bg-white border-gray-100 text-gray-900 hover:shadow-md")}
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black", selected?.id === s.id ? "bg-emerald-600" : "bg-gray-200 text-gray-700")}>
                  {s.index}
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight mb-0.5">{s.name}</p>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", selected?.id === s.id ? "text-gray-400" : "text-gray-400")}>{s.class}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">{selected.name}</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selected.class} • Index {selected.index}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                  Preview
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg"
                >
                  {isExporting ? <Sparkles size={16} className="animate-spin" /> : <Download size={16} />}
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <QrCode size={20} className="text-emerald-700" />
              <p className="text-[11px] font-black text-emerald-900">Transcript will be QR-code verified for authenticity</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
