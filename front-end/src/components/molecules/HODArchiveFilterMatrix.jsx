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
    <div className="bg-surface border-border rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm space-y-3">
      {/* Header Info Block */}
      <div className="flex flex-row items-center justify-between gap-2 border-b border-border pb-2 md:border-none md:pb-0">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-foreground rounded-full shrink-0" />
          <h3 className="text-xs sm:text-xs font-black text-foreground uppercase tracking-widest leading-none">
            Archive Vault Filter
          </h3>
        </div>
        <span className="text-xs sm:text-xs font-bold text-muted-foreground uppercase text-right truncate max-w-[180px] xs:max-w-none">
          Longitudinal Trace Index
        </span>
      </div>

      {/* Grid Inputs Wrapper */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        {/* Search Input Container */}
        <div className="relative flex items-center py-2 sm:py-3 bg-muted border border-border rounded-lg px-2.5 sm:px-4 sm:col-span-2 md:col-span-1">
          <Search className="text-muted-foreground mr-1.5 shrink-0" size={12} />
          <input 
            type="text" 
            placeholder="Search name or index..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent border-none text-xs sm:text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full p-0 focus:ring-0 leading-none"
          />
        </div>

        {/* Filter Stream */}
        <div className="relative flex items-center py-2 sm:py-3 bg-muted border border-border rounded-lg px-2.5 sm:px-4">
          <span className="text-xs font-black text-muted-foreground mr-1.5 shrink-0 tracking-wider">STREAM:</span>
          <select 
            value={selectedClass}
            onChange={(e) => onClassChange(e.target.value)}
            className="bg-transparent border-none text-xs sm:text-xs text-foreground font-extrabold focus:outline-none cursor-pointer w-full p-0 focus:ring-0 appearance-none leading-none"
          >
            {availableClasses.map(cls => (
              <option key={cls} value={cls}>{getClassLabel(cls)}</option>
            ))}
          </select>
        </div>

        {/* Filter Cohort */}
        <div className="relative flex items-center py-2 sm:py-3 bg-muted border border-border rounded-lg px-2.5 sm:px-4">
          <span className="text-xs font-black text-muted-foreground mr-1.5 shrink-0 tracking-wider">COHORT:</span>
          <select 
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="bg-transparent border-none text-xs sm:text-xs text-foreground font-extrabold focus:outline-none cursor-pointer w-full p-0 focus:ring-0 appearance-none leading-none"
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