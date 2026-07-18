import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, AlertTriangle, CheckCircle2, Search,
  Clock, Calendar, Sparkles, SlidersHorizontal, Inbox, ChevronRight
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '../../components/molecules';
import { Card } from '@/components/ui/card';
import { useMissingObservations } from '@/lib/hooks';

export function HODMissingObservations() {
  const { setBreadcrumb } = useBreadcrumb();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('missing');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: observations = [], isLoading } = useMissingObservations();

  useEffect(() => {
    const urlStudent = searchParams.get('student');
    const urlIndex = searchParams.get('index');
    const urlTab = searchParams.get('tab');

    if (urlTab) {
      setActiveTab(urlTab);
    } else if (urlStudent || urlIndex) {
      setActiveTab('missing');
    }

    if (urlStudent) {
      setSearchQuery(urlStudent);
    } else if (urlIndex) {
      setSearchQuery(urlIndex);
    }
  }, [searchParams]);

  useEffect(() => {
    const tabLabel = activeTab === 'missing' ? 'Missing' : activeTab === 'logged' ? 'Logged' : 'All';
    setBreadcrumb([{ label: 'Compliance Observations', path: '/missing-observations' }, { label: tabLabel, path: null }]);
  }, [activeTab, setBreadcrumb]);

  const normalizedObservations = useMemo(() => {
    return observations.map((obs) => ({
      id: obs.id,
      student: `${obs.student?.firstName || ''} ${obs.student?.lastName || ''}`.trim() || 'Unknown',
      index: obs.student?.indexNumber || '',
      class: obs.student?.currentClass?.name || 'Unknown Class',
      type: obs.subject?.name || 'Unknown Subject',
      teacher: obs.teacher || 'Unknown',
      status: obs.hasObservation ? 'Logged' : 'Missing',
      date: obs.updatedAt ? new Date(obs.updatedAt).toISOString().split('T')[0] : '—',
      studentId: obs.studentId,
      observationId: obs.id,
    }));
  }, [observations]);

  const filteredObservations = useMemo(() => {
    return normalizedObservations.filter((obs) => {
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
  }, [normalizedObservations, activeTab, searchQuery]);

  const missingCount = useMemo(() =>
    normalizedObservations.filter(o => o.status === 'Missing').length,
    [normalizedObservations]
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background/50">
        <div className="text-sm text-muted-foreground">Loading observations...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full h-full bg-background/50 font-sans antialiased overflow-hidden">
      
      {/* HEADER SECTION LAYOUT CONTEXT */}
      <header className="p-6 lg:p-8 bg-card border-b border-border/60 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-brand-primary rounded-xl flex items-center justify-center shadow-md shrink-0">
              <AlertTriangle size={20} className="text-brand-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">HOD Observation Hub</h1>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">Audit data sheets and enforce term entry verification guidelines</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-start md:self-center">
            <div className="flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/30 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Sparkles size={13} className="text-brand-primary animate-pulse" />
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
                  "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer",
                  activeTab === tab.id
                    ? "bg-card text-brand-primary font-bold"
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
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student name, index, teacher..."
              className="w-full pl-9 pr-4 py-1.5 text-xs font-medium focus:bg-card focus:outline-none focus:ring-4 focus:ring-brand-primary/20 transition-all placeholder:text-muted-foreground"
            />
          </div>

        </div>
      </section>

      {/* PRIMARY CENTRAL FEED LOG VIEWPORT */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 min-h-0 no-scrollbar">
        <div className="max-w-6xl mx-auto">
          
          <Card className="rounded-2xl overflow-hidden flex flex-col">
            
            {/* SUB-PANEL SYSTEM LEDGER BANNER */}
            <div className="px-5 py-4 border-b border-border bg-muted/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                <SlidersHorizontal size={13} />
                Observation Logs
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                Showing {filteredObservations.length} of {normalizedObservations.length} logs
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
                      <EmptyState context="comments" variant="compact" />
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
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5",
                            isMissing 
                              ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary" 
                              : "bg-success/10 border-success/30 text-success"
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
                                ? "bg-brand-primary/10 text-brand-primary border-brand-primary/30" 
                                : "bg-success/10 text-success border-success/30"
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
                               <Button
                                  onClick={() => navigate(`/grading?missing=${obs.observationId}&studentId=${obs.studentId}&studentName=${encodeURIComponent(obs.student)}&index=${encodeURIComponent(obs.index)}&subject=${encodeURIComponent(obs.type)}&class=${encodeURIComponent(obs.class)}`)}
                                  variant="outline"
                                  size="sm"
                                  className="p-1.5 transition-transform group-hover:translate-x-0.5"
                                  title="Resolve observation entry window"
                                >
                                  <ArrowRight size={13} />
                                </Button>
                             ) : (
                              <ChevronRight size={14} className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity pr-1" />
                            )}
                          </div>

                        </div>

                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

          </Card>
          
        </div>
      </main>
    </div>
  );
}
