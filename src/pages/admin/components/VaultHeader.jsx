import React from 'react';
import { cn } from '../../../lib/utils';
import { Database, FileText, Filter, Calendar, Search } from 'lucide-react';

export function VaultHeader({ activeSubTab, selectedStudent, searchTerm, setSearchTerm, selectedYear, setSelectedYear, selectedSubject, setSelectedSubject, showCoreComparison, setShowCoreComparison }) {
  return (
    <header className="p-4 sm:p-6 md:p-8 border-b border-gray-200 bg-white/40 backdrop-blur-xl shrink-0 w-full">
      {/* Top Section: Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6 sm:mb-8">
        
        {/* Title branding block */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-900 rounded-2xl flex items-center justify-center text-emerald-100 shadow-2xl border border-emerald-800 rotate-3 shrink-0">
            <Database size={24} className="sm:hidden" />
            <Database size={32} className="hidden sm:block" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter">The Vault</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-[10px] sm:text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-100/50 px-2 py-0.5 rounded">
                Historical Archive v4.2
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  Last Synced: Today 04:12 AM
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* View Switches & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner w-full sm:w-auto">
            <button 
              onClick={() => setShowCoreComparison(false)}
              className={cn(
                "flex-1 sm:flex-none text-center px-4 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap",
                !showCoreComparison ? "bg-white text-emerald-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Expert View
            </button>
            <button 
              onClick={() => setShowCoreComparison(true)}
              className={cn(
                "flex-1 sm:flex-none text-center px-4 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap",
                showCoreComparison ? "bg-white text-emerald-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              Core Comparison
            </button>
          </div>
          
          <button className="px-5 py-2.5 sm:py-3 bg-emerald-900 text-white rounded-xl font-black text-xs sm:text-sm hover:bg-emerald-950 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2 w-full sm:w-auto">
            <FileText size={16} className="shrink-0" />
            <span className="whitespace-nowrap">Bulk Progress Report</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Query Search Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-stretch sm:items-center w-full">
        
        {/* Dropdowns side-by-side on mobile viewport layout */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4">
          {/* Subject Selector */}
          <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <Filter size={14} className="text-emerald-700 shrink-0" />
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-black text-gray-900 focus:outline-none cursor-pointer pr-2 w-full truncate"
            >
              <option>Integrated Science</option>
              <option>Elective Physics</option>
              <option>Elective Chemistry</option>
              <option>Elective Biology</option>
            </select>
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <Calendar size={14} className="text-emerald-700 shrink-0" />
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-black text-gray-900 focus:outline-none cursor-pointer pr-2 w-full"
            >
              <option>2024/2025</option>
              <option>2023/2024</option>
              <option>2022/2023</option>
            </select>
          </div>
        </div>

        {/* Global Student Lookup Input */}
        <div className="w-full md:flex-1 md:min-w-75 relative h-11 sm:h-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="Lookup Student Index (e.g. 10001)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm h-full"
          />
        </div>
      </div>
    </header>
  );
}