import { Search } from 'lucide-react';

export function HODArchiveFilterMatrix({ 
  searchTerm, 
  onSearchChange, 
  selectedClass, 
  onClassChange, 
  selectedYear, 
  onYearChange,
  availableClasses = ['ALL', 'SHS 1 Agric B', 'SHS 2 Science B', 'SHS 3 Science A'],
  availableYears = ['ALL', '2028', '2027', '2026', '2024', '2023']
}) {
  const getClassLabel = (cls) => {
    if (cls === 'ALL') return 'All Cohort Streams';
    if (cls.includes('Agric')) return cls.replace('Agric B', ' (Form 1)');
    if (cls.includes('SHS 1')) return cls.replace('SHS 1', 'Form 1');
    if (cls.includes('SHS 2')) return cls.replace('SHS 2', 'Form 2');
    if (cls.includes('SHS 3')) return cls.replace('SHS 3', 'Form 3');
    return cls;
  };

  const getYearLabel = (year) => {
    if (year === 'ALL') return 'All Years';
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    if (yearNum >= currentYear) {
      return `Form ${3 - (yearNum - currentYear)} (Class of ${year})`;
    }
    return `Class of ${year}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm space-y-3">
      {/* Header Info Block */}
      <div className="flex flex-row items-center justify-between gap-2 border-b border-slate-100 pb-2 md:border-none md:pb-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-slate-900 rounded-full shrink-0" />
          <h3 className="text-[9px] sm:text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
            Archive Vault Filter
          </h3>
        </div>
        <span className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase text-right truncate max-w-[180px] xs:max-w-none">
          Longitudinal Trace Index
        </span>
      </div>

      {/* Grid Inputs Wrapper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        {/* Search Input Container */}
        <div className="relative flex items-center py-2 sm:py-3 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 sm:px-4 sm:col-span-2 md:col-span-1">
          <Search className="text-slate-400 mr-1.5 shrink-0" size={12} />
          <input 
            type="text" 
            placeholder="Search name or index..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent border-none text-[10px] sm:text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-full p-0 focus:ring-0 leading-none"
          />
        </div>

        {/* Filter Stream */}
        <div className="relative flex items-center py-2 sm:py-3 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 sm:px-4">
          <span className="text-[8px] font-black text-slate-400 mr-1.5 shrink-0 tracking-wider">STREAM:</span>
          <select 
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="bg-transparent border-none text-[10px] sm:text-xs text-slate-800 font-extrabold focus:outline-none cursor-pointer w-full p-0 focus:ring-0 appearance-none leading-none"
          >
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>{getClassLabel(cls)}</option>
            ))}
          </select>
        </div>

        {/* Filter Cohort */}
        <div className="relative flex items-center py-2 sm:py-3 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 sm:px-4">
          <span className="text-[8px] font-black text-slate-400 mr-1.5 shrink-0 tracking-wider">COHORT:</span>
          <select 
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="bg-transparent border-none text-[10px] sm:text-xs text-slate-800 font-extrabold focus:outline-none cursor-pointer w-full p-0 focus:ring-0 appearance-none leading-none"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{getYearLabel(year)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}