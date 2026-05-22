import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowRight, Timer, LayoutGrid, List, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export function TimetableHeader({ currentPeriod, nextPeriod, formatTime, view, setView }) {
  const navigate = useNavigate();

  // 1. Live Period Section Card Component View
  const renderLivePeriodCard = () => {
    const isActive = !!currentPeriod;
    
    return (
      <div className={cn(
        "p-5 rounded-2xl border-2 flex items-center justify-between transition-all duration-200",
        isActive ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
      )}>
        <div className="flex items-center gap-4 min-w-0">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            isActive ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"
          )}>
            <Timer size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Live Period</p>
            <h3 className="text-base font-black text-gray-900 leading-tight truncate">
              {isActive ? `${currentPeriod.subjectName} — ${currentPeriod.className}` : 'No Active Session'}
            </h3>
            {isActive && (
              <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-1 uppercase tracking-wider">
                <MapPin size={10} className="shrink-0" /> {currentPeriod.venue}
              </p>
            )}
          </div>
        </div>
        {isActive && (
          <button 
            onClick={() => navigate('/grading')}
            className="px-4 py-2 bg-emerald-800 text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            Open Sheet
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    );
  };

  // 2. Next Up Section Card Component View
  const renderNextPeriodCard = () => {
    const hasNext = !!nextPeriod;
    
    return (
      <div className="p-5 bg-white border border-gray-200 rounded-2xl flex items-center justify-between min-w-0">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
            <Clock size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Coming Up Next</p>
            <h3 className="text-base font-black text-gray-900 leading-tight truncate">
              {hasNext ? `${nextPeriod.subjectName} — ${nextPeriod.className}` : 'End of Day'}
            </h3>
            {hasNext && (
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                Starts at {nextPeriod.startTime}
              </p>
            )}
          </div>
        </div>

        {/* Database Lock Warning Anchor Block */}
        <div className="text-right shrink-0 pl-4 border-l border-gray-100">
          <div className="flex items-center gap-1 justify-end text-red-600 mb-0.5">
            <ShieldAlert size={12} />
            <p className="text-[9px] font-black uppercase tracking-widest">PostgreSQL Lock</p>
          </div>
          <p className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md inline-block">
            4 Days Remaining
          </p>
        </div>
      </div>
    );
  };

  return (
    <header className="px-8 pt-8 pb-6 bg-white border-b border-gray-200 shadow-sm z-10 select-none">
      {/* Upper Navigation Action Bar Area */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-800/10">
            <Calendar size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Academic Schedule</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">System Sync Active</p>
            </div>
          </div>
        </div>

        {/* Agenda Grid Toggles */}
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/30">
            <button 
              onClick={() => setView('daily')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer",
                view === 'daily' ? "bg-white text-emerald-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <List size={14} />
              Daily Agenda
            </button>
            <button 
              onClick={() => setView('weekly')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer",
                view === 'weekly' ? "bg-white text-emerald-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <LayoutGrid size={14} />
              Weekly Grid
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Dynamic Information Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {renderLivePeriodCard()}
        {renderNextPeriodCard()}
      </div>
    </header>
  );
}