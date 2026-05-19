import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Users, BookOpen, Plus, AlertTriangle, CheckCircle2,
  X, Eye, Download, ArrowRight, ShieldCheck, FileText, QrCode, Sparkles,
  GraduationCap,
} from 'lucide-react';
import { cn } from '../lib/utils';

export function ReportGeneratorView() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = React.useState(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationStep, setGenerationStep] = React.useState(0);

  const classes = [
    { id: 'c1', name: 'SHS 1 Agric B', students: 42, progress: 100 },
    { id: 'c2', name: 'SHS 2 Science A', students: 38, progress: 96 },
    { id: 'c3', name: 'SHS 3 Home Econ', students: 35, progress: 89 },
    { id: 'c4', name: 'SHS 1 Gen Arts', students: 40, progress: 72 },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationStep(1);
    setTimeout(() => setGenerationStep(2), 1000);
    setTimeout(() => setGenerationStep(3), 2500);
    setTimeout(() => { setIsGenerating(false); setGenerationStep(0); }, 4000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter leading-none italic font-display mb-2">
            Batch Report Generator
          </h1>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
            One-click terminal report cards · QR verified · Print-ready
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {classes.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedClass(c)}
              className={cn(
                "p-6 rounded-2xl border transition-all cursor-pointer",
                selectedClass?.id === c.id ? "bg-gray-900 text-white border-gray-800 shadow-xl" : "bg-white border-gray-100 text-gray-900 hover:shadow-md"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{c.name}</span>
                <span className={cn("text-[10px] font-black px-2 py-1 rounded", c.progress === 100 ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400")}>{c.progress}%</span>
              </div>
              <p className={cn("text-3xl font-black tracking-tighter mb-2", selectedClass?.id === c.id ? "text-white" : "text-gray-900")}>{c.students}</p>
              <p className={cn("text-[10px] font-bold uppercase tracking-widest", selectedClass?.id === c.id ? "text-gray-400" : "text-gray-400")}>{selectedClass?.id === c.id ? 'Selected' : 'Students Enrolled'}</p>
            </motion.div>
          ))}
        </div>

        {selectedClass && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-1">{selectedClass.name}</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedClass.students} student reports ready</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl">
                <QrCode size={16} className="text-emerald-700" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">QR Verified</span>
              </div>
            </div>

            {isGenerating && (
              <div className="mb-8">
                <div className="flex items-center gap-6 mb-4">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border-2", generationStep >= 1 ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-gray-200", generationStep === 1 && "animate-pulse")}>
                    {generationStep >= 1 ? <CheckCircle2 size={22} /> : <span className="text-xs font-black">1</span>}
                  </div>
                  <div className={cn("flex-1 h-1.5 rounded-full", generationStep >= 2 ? "bg-emerald-500" : "bg-gray-100")} />
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border-2", generationStep >= 2 ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-gray-200", generationStep === 2 && "animate-pulse")}>
                    {generationStep >= 2 ? <CheckCircle2 size={22} /> : <span className="text-xs font-black">2</span>}
                  </div>
                  <div className={cn("flex-1 h-1.5 rounded-full", generationStep >= 3 ? "bg-emerald-500" : "bg-gray-100")} />
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border-2", generationStep >= 3 ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-gray-200")}>
                    {generationStep >= 3 ? <CheckCircle2 size={22} /> : <span className="text-xs font-black">3</span>}
                  </div>
                </div>
                <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Generate</span>
                  <span>Assign QR</span>
                  <span>Package PDF</span>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={cn("flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg", isGenerating ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-emerald-900 text-white hover:bg-emerald-950 shadow-emerald-900/20")}
              >
                {isGenerating ? <Sparkles size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {isGenerating ? 'Generating...' : 'Generate Class Reports'}
              </button>
              <button className="px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                <Download size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
