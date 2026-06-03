import React, { useMemo } from 'react';
import { 
  Search, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck, 
  Users,
  Award
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function VaultTab({ 
  students = [], 
  searchTerm = '', 
  selectedClass = 'ALL', 
  selectedYear = 'ALL', 
  setSearchTerm, 
  setSelectedClass, 
  setSelectedYear, 
  filteredStudents = [], 
  setSelectedStudent 
}) {

  // Memoize data metrics so they don't recalculate on every keystroke
  const stats = useMemo(() => {
    const totalAlumniCount = students.length;
    const verifiedSealsCount = students.filter(s => s.status === 'Archived & Verified').length;
    
    const totalGradesArray = students.flatMap(s => s.history?.map(h => h.finalGrade) || []);
    const departmentAverage = totalGradesArray.length > 0 
      ? (totalGradesArray.reduce((a, b) => a + b, 0) / totalGradesArray.length).toFixed(1) 
      : 'N/A';

    return {
      totalAlumniCount,
      verifiedSealsCount,
      departmentAverage: departmentAverage !== 'N/A' ? `${departmentAverage}%` : 'N/A'
    };
  }, [students]);

  const kpiCards = [
    { title: 'Total Rostered Students', val: stats.totalAlumniCount, note: 'Current & Graduated profiles', icon: Users },
    { title: 'Historic WASSCE Mean', val: stats.departmentAverage, note: 'Department-wide GPA', icon: TrendingUp },
    { title: 'HOD Verified Seals', val: stats.verifiedSealsCount, note: 'Permanently validated', icon: ShieldCheck },
    { title: 'Retention & Pass Key', val: '100.0%', note: 'Zero compliance leakage', icon: Award }
  ];

  // Explicitly defining the shared column structure for headers and rows
  const gridLayoutClass = "grid grid-cols-[2fr_1.5fr_1fr_1.2fr_1.5fr_0.5fr] gap-4 items-center";

  return (
    <div className="space-y-6">
      {/* Analytic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, idx) => (
          <Card key={idx} className="rounded-[2rem] p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{card.title}</p>
              <p className="text-2xl font-black text-foreground tracking-tight">{card.val}</p>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">{card.note}</p>
            </div>
            <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white shrink-0 bg-foreground">
              <card.icon size={20} />
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Matrix Row */}
      <Card className="rounded-[2rem] p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-foreground rounded-full animate-pulse" />
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest leading-none">ARCHIVE VAULT FILTER MATRIX</h3>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Longitudinal Departmental Trace Index</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative flex items-center h-12 bg-muted border border-border rounded-xl px-4">
            <Search className="text-muted-foreground mr-2 shrink-0" size={16} />
            <Input 
              type="text" 
              placeholder="Search index, name or graduation serial..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs placeholder:text-muted-foreground focus:outline-none w-full"
            />
          </div>

          <div className="relative flex items-center h-12 bg-muted border border-border rounded-xl px-4">
            <span className="text-[10px] font-bold text-muted-foreground mr-2 shrink-0">STREAM:</span>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent border-none text-xs text-foreground font-extrabold focus:outline-none cursor-pointer w-full"
            >
              <option value="ALL">All Cohort Streams</option>
              <option value="SHS 1 Agric B">SHS 1 Agric B (Current Form 1)</option>
              <option value="SHS 2 Science B">SHS 2 Science B (Current Form 2)</option>
              <option value="SHS 3 Science A">SHS 3 Science A (Current Form 3)</option>
              <option value="Class of 2024 (Science)">Class of 2024 (Science Alumni)</option>
              <option value="Class of 2023 (Science)">Class of 2023 (Science Alumni)</option>
              <option value="Class of 2023 (Agric Science)">Class of 2023 (Agric Alumni)</option>
            </select>
          </div>

          <div className="relative flex items-center h-12 bg-muted border border-border rounded-xl px-4">
            <span className="text-[10px] font-bold text-muted-foreground mr-2 shrink-0">COHORT YEAR:</span>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent border-none text-xs text-foreground font-extrabold focus:outline-none cursor-pointer w-full"
            >
              <option value="ALL">All Past & Current Years</option>
              <option value="2028">Form 1 (Class of 2028)</option>
              <option value="2027">Form 2 (Class of 2027)</option>
              <option value="2026">Form 3 (Class of 2026)</option>
              <option value="2024">Class of 2024</option>
              <option value="2023">Class of 2023</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Student Registry - Pure Flexbox & CSS Grid View */}
      <Card className="rounded-[2.5rem] overflow-hidden shadow-sm">
        <header className="px-8 py-5 border-b border-border flex items-center justify-between bg-muted/50">
          <div>
            <h4 className="text-xs font-black text-foreground uppercase tracking-widest leading-none">Archives Dossiers</h4>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Select an active or alumni dossier to analyze longitudinal performance</p>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground bg-card border border-border rounded-lg px-2 py-1">
            Displaying <span className="text-foreground font-black">{filteredStudents.length}</span> verified records in Vault
          </span>
        </header>

        {/* Outer view container to wrap grid row items */}
        <div className="min-w-[800px] overflow-x-auto">
          
          {/* Header Grid Component */}
          <div className={cn("px-8 py-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/20", gridLayoutClass)}>
            <div>Student Identity</div>
            <div>Stream / Batch</div>
            <div className="text-center">Cumulative Grade</div>
            <div className="text-center">WASSCE Code</div>
            <div className="text-center">Authorization Stat</div>
            <div className="text-right">Action</div>
          </div>

          {/* Body Content Grid Component */}
          <div className="divide-y divide-border">
            {filteredStudents.length === 0 ? (
              <div className="px-8 py-12 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                No matching student dossiers found in the vault.
              </div>
            ) : (
              filteredStudents.map(student => {
                const scores = student?.history?.map(h => h.finalGrade) || [];
                const avgGrade = scores.length > 0 
                  ? `${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}%` 
                  : 'No Past Terms';

                return (
                  <div 
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={cn(
                      "px-8 py-5 hover:bg-muted/50 group transition-all duration-150 cursor-pointer role-button",
                      gridLayoutClass
                    )}
                  >
                    {/* Identity Column */}
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name)}`} 
                        alt={`${student.name}'s avatar`} 
                        className="w-10 h-10 rounded-xl bg-muted border border-border p-0.5"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-foreground tracking-tight truncate">{student.name}</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase font-mono">{student.index}</p>
                      </div>
                    </div>

                    {/* Stream Column */}
                    <div className="text-xs text-muted-foreground font-bold truncate">
                      {student.currentClass}
                    </div>

                    {/* Cumulative Grade Column */}
                    <div className="text-center">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold italic font-mono bg-muted text-foreground border border-border inline-block">
                        {avgGrade}
                      </span>
                    </div>

                    {/* WASSCE Status Column */}
                    <div className="text-center">
                      <span className={cn(
                        "px-3 py-1 font-mono text-xs font-black rounded-lg text-white inline-block",
                        student.finalWassce === 'Pending' && "bg-muted-foreground",
                        student.finalWassce === 'Building' && "bg-border",
                        student.finalWassce !== 'Pending' && student.finalWassce !== 'Building' && "bg-foreground"
                      )}>
                        WAEC: {student.finalWassce}
                      </span>
                    </div>

                    {/* Authorization Badge Column */}
                    <div className="text-center">
                      <span className={cn(
                        "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border inline-flex items-center gap-1",
                        student.status === 'Archived & Verified' && "bg-success/10 text-success border-success/30",
                        student.status === 'Archive Inbound' && "bg-brand-primary/10 text-brand-primary border-brand-primary/30",
                        student.status === 'Empty Archive' && "bg-warning/10 text-warning border-warning/30"
                      )}>
                        <ShieldCheck size={11} />
                        {student.status}
                      </span>
                    </div>

                    {/* Navigation CTA Column */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        aria-label={`View dossier for ${student.name}`}
                        variant="ghost"
                        size="icon"
                        className="rounded-xl hover:bg-foreground hover:text-background transition-all"
                      >
                        <ChevronRight size={18} />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </Card>
    </div>
  );
}