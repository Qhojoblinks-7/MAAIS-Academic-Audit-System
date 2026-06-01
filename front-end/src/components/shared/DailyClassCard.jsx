import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin, ShieldAlert, BookOpen, FilePlus, FileText, Link as LinkIcon, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export function DailyClassCard({ entry, user, hoveredId, setHoveredId, selectedEntry, setIsResourceModalOpen, newMaterial, setNewMaterial }) {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      onMouseEnter={() => setHoveredId(entry.id)}
      onMouseLeave={() => setHoveredId(null)}
      className={cn(
        "bg-white rounded-2xl p-5 border border-gray-200 flex flex-col group hover:border-emerald-200 transition-all shadow-sm overflow-hidden",
        entry.isClash && "border-red-200 bg-red-50/30"
      )}
    >
      <div className="flex items-center gap-6">
        <div className="w-20 text-center border-r border-gray-100 pr-6 shrink-0">
          <p className="text-base font-black text-gray-900">{entry.startTime}</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase">{entry.endTime}</p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-lg font-black text-gray-900 truncate">{entry.subjectName}</h4>
            <span className={cn(
              "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0",
              entry.type === 'LAB' ? "bg-emerald-100 text-emerald-700" :
              entry.type === 'SUBSTITUTION' ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-600"
            )}>
              {entry.type}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xs font-bold text-gray-500 truncate">{entry.className}</p>
            <span className="text-gray-300 shrink-0">•</span>
            <p className="text-xs font-bold text-gray-500 flex items-center gap-1 truncate">
              <MapPin size={12} /> {entry.venue}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {entry.missingObservations && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-700">
              <ShieldAlert size={14} />
              <span className="text-[9px] font-black uppercase">{entry.missingObservations} Missing</span>
            </div>
          )}
          <button
            onClick={() => navigate('/grading')}
            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-800 group-hover:text-white transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {hoveredId === entry.id && entry.tasks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Session Tasks</p>
            <div className="grid grid-cols-2 gap-3">
              {entry.tasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-bold text-gray-700">{task}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => navigate('/grading')}
                className="flex-1 py-2 bg-emerald-800 text-white text-xs font-black rounded-xl hover:bg-emerald-900 transition-all"
              >
                Open Grading Sheet
              </button>
              {user?.role !== 'STUDENT' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEntry(entry);
                    setIsResourceModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-white border border-emerald-800 text-emerald-800 text-xs font-black rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                >
                  <FilePlus size={14} />
                  Attach Materials
                </button>
              )}
            </div>
            {entry.materials?.length > 0 && (
              <div className="mt-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Materials</p>
                <div className="flex flex-wrap gap-2">
                  {entry.materials.map((mat, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 text-[10px] font-bold text-gray-600"
                    >
                      {mat.type === 'PDF' ? <FileText size={12} className="text-rose-500" /> : <LinkIcon size={12} className="text-blue-500" />}
                      {mat.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
