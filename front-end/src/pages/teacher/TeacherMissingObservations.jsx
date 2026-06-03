import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, AlertTriangle, CheckCircle2, Search,
  Clock, Calendar, Sparkles, SlidersHorizontal, Inbox, ChevronRight
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '../../lib/utils';

const mockObservations = [
  { id: 'o1', student: 'Angela Owusu', index: '001', class: 'SHS 1 Agric B', type: 'Lab Safety', teacher: 'R. Owusu', status: 'Missing', date: '2026-01-15' },
  { id: 'o2', student: 'Kwame Mensah', index: '002', class: 'SHS 1 Agric B', type: 'Behavioral', teacher: 'M. Baah', status: 'Logged', date: '2026-01-14' },
  { id: 'o3', student: 'Yaw Boateng', index: '003', class: 'SHS 1 Agric B', type: 'Resource Economy', teacher: 'A. Boateng', status: 'Missing', date: '2026-01-12' },
  { id: 'o4', student: 'Esi Ansah', index: '004', class: 'SHS 1 Agric B', type: 'Hygienic Practices', teacher: 'E. Aidoo', status: 'Logged', date: '2026-01-10' },
  { id: 'o5', student: 'Kofi Appiah', index: '005', class: 'SHS 1 Agric B', type: 'Lab Safety', teacher: 'S. K. Mensah', status: 'Missing', date: '2026-01-08' },
];

export function TeacherMissingObservations() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('missing');
  const [searchQuery, setSearchQuery] = useState('');

  // Deep-link via URL params: ?student=X or ?index=X or ?tab=X
  useEffect(() => {
    const urlStudent = searchParams.get('student');
    const urlIndex = searchParams.get('index');
    const urlTab = searchParams.get('tab');

    if (urlTab) {
      setActiveTab(urlTab);
    } else if (urlStudent || urlIndex) {
      // Auto-set activeTab to missing when a student/index is provided
      setActiveTab('missing');
    }

    if (urlStudent) {
      setSearchQuery(urlStudent);
    } else if (urlIndex) {
      setSearchQuery(urlIndex);
    }
  }, [searchParams]);

  // Structured inline data matching compute layer
  const filteredObservations = useMemo(() => {
    return mockObservations.filter((obs) => {
      const matchesTab = 
        activeTab === 'all' ? true : 
        activeTab === 'missing' ? obs.status === 'Missing' : 
        obs.status === 'Logged';

      const matchesSearch = 
        obs.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obs.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obs.index.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obs.teacher.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const missingCount = useMemo(() => 
    mockObservations.filter(o => o.status === 'Missing').length, 
    []
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full h-full bg-muted font-sans antialiased overflow-hidden">
      
{/* HEADER SECTION LAYOUT CONTEXT */}
      <header className="p-6 lg:p-8 bg-card border-b border-border shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-brand-primary rounded-xl flex items-center justify-center shadow-md shadow-brand-primary/10 shrink-0">
              <AlertTriangle size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Teacher Observation Hub</h1>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">Audit data sheets and enforce term entry verification guidelines</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-start md:self-center">
            <div className="flex items-center gap-1.5 bg-warning/10 text-warning border border-warning/20 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Sparkles size={13} className="animate-pulse" />
              <span>{missingCount} Entries Outstanding</span>
            </div>
          </div>
        </div>
      </header>

      {/* WORKFLOW MATRIX FILTERS AND CONTROL BAR */}
      <section className="px-6 lg:px-8 py-4 bg-card border-b border-border shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* TAB LOGIC TRIGGERS */}
          <div className="flex p-0.5 bg-muted rounded-xl border border-border self-start">
            {[
              { id: 'missing', label: 'Outstanding' },
              { id: 'logged', label: 'Logged Records' },
              { id: 'all', label: 'All Audits' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-card text-brand-primary shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* COMPACT FLOATING SEARCH MODULE */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student name, index, teacher..."
              className="w-full pl-9 pr-4 py-1.5 bg-muted border border-border rounded-xl text-xs font-medium focus:bg-card focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all placeholder:text-muted-foreground"
            />
          </div>

        </div>
      </section>

      {/* PRIMARY CENTRAL FEED LOG VIEWPORT */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 min-h-0 no-scrollbar">
        <div className="max-w-6xl mx-auto">
          
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
            
            {/* SUB-PANEL SYSTEM LEDGER BANNER */}
            <div className="px-5 py-4 border-b border-border bg-muted/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                <SlidersHorizontal size={13} />
                Observation Logs
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                Showing {filteredObservations.length} of {mockObservations.length} logs
              </span>
            </div>

            {/* INTERACTIVE ROWS CONTAINER */}
            <div className="divide-y divide-border min-h-0">
              <AnimatePresence mode="wait">
                {filteredObservations.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card"
                  >
                    <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                      <Inbox size={18} />
                    </div>
                    <h3 className="text-xs font-bold text-foreground">No logs found</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[260px]">Modify filter variables or check index archives for older compliance tracking lines.</p>
                  </motion.div>
                ) : (
                  filteredObservations.map((obs, idx) => {
                    const isMissing = obs.status === 'Missing';
                    return (
                      <motion.div
                        key={obs.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.02 }}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/40 transition-colors group"
                      >
                        {/* LEFT BOUND BLOCK: ENTITY LABELS */}
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 shadow-sm",
                            isMissing 
                              ? "bg-warning/10 border-warning/20 text-warning" 
                              : "bg-success/10 border-success/20 text-success"
                          )}>
                            {isMissing ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-foreground truncate tracking-tight">{obs.student}</p>
                              <span className="text-[10px] font-medium font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border shrink-0">
                                {obs.index}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground mt-1">
                              <span className="font-semibold text-foreground">{obs.class}</span>
                              <span className="text-border">•</span>
                              <span className="flex items-center gap-1">Instructed by {obs.teacher}</span>
                              <span className="text-border hidden md:inline">•</span>
                              <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded font-medium hidden md:inline">
                                {obs.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT BOUND BLOCK: STATUS METRICS AND INTERACTIVE CTAS */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border shrink-0">
                          
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded border tracking-wide", 
                              isMissing 
                                ? "bg-warning/10 text-warning border-warning/20" 
                                : "bg-success/10 text-success border-success/20"
                            )}>
                              {obs.status}
                            </span>
                            
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono">
                              <Calendar size={12} />
                              <span>{obs.date}</span>
                            </div>
                          </div>

                          <div className="w-8 flex justify-end">
                            {isMissing ? (
                              <button
                                onClick={() => window.location.href = `/grading?missing=${obs.id}&student=${obs.index}`}
                                className="p-1.5 bg-warning/10 hover:bg-warning text-warning hover:text-background border border-warning/20 rounded-lg transition-all shadow-sm flex items-center justify-center group-hover:translate-x-0.5"
                                title="Resolve observation entry window"
                              >
                                <ArrowRight size={13} />
                              </button>
                            ) : (
                              <ChevronRight size={14} className="text-success opacity-0 group-hover:opacity-100 transition-opacity pr-1" />
                            )}
                          </div>

                        </div>

                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

          </div>
          
        </div>
      </main>
    </div>
   );
}