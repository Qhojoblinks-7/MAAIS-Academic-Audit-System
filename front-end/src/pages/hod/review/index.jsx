import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Layers,
  Hourglass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useReviewPipeline } from './useReviewPipeline';
import { ClassLockExport } from './ClassLockExport';
import { GradeApprovals } from './GradeApprovals';
import { RevisionRequests } from './RevisionRequests';
import { REVIEW_VIEWS, countPending } from './shared';

const SEGMENTS = [
  { key: REVIEW_VIEWS.APPROVALS, label: 'Grade Approvals', icon: CheckCircle2 },
  { key: REVIEW_VIEWS.REVISIONS, label: 'Revision Requests', icon: Hourglass },
  { key: REVIEW_VIEWS.LOCK, label: 'Lock & Export', icon: Layers },
];

function SegmentTabs({ active, onChange, pendingRevisions, pendingClasses }) {
  return (
    <div className="flex p-0.5 bg-muted rounded-lg border border-border">
      {SEGMENTS.map((seg) => {
        const Icon = seg.icon;
        const count = seg.key === REVIEW_VIEWS.REVISIONS ? pendingRevisions : seg.key === REVIEW_VIEWS.LOCK ? pendingClasses : 0;
        const isActive = active === seg.key;
        return (
          <button
            key={seg.key}
            onClick={() => onChange(seg.key)}
            className={cn('px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer', isActive ? 'bg-card text-foreground shadow-sm border border-border/20 font-bold' : 'text-muted-foreground hover:text-foreground')}
          >
            <Icon size={13} />
            {seg.label}
            {count > 0 && (
              <span className={cn('inline-flex items-center justify-center min-w-[18px] h-5 px-1 rounded-full text-[10px] font-bold', isActive ? 'bg-foreground text-white' : 'bg-slate-200 text-slate-600')}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PipelineHeader({ activeView, onViewChange, pendingRevisions, pendingClasses, onRefresh, isLoading }) {
  return (
    <header className="bg-card border-b border-border/80 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-card/95">
      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-foreground tracking-tight">Grade Review Pipeline</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Approve revisions, review correction requests, and seal term records.</p>
        </div>
        <div className="flex items-center gap-3">
          <SegmentTabs active={activeView} onChange={onViewChange} pendingRevisions={pendingRevisions} pendingClasses={pendingClasses} />
          <Button onClick={onRefresh} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            Sync Ledger
          </Button>
        </div>
      </div>
    </header>
  );
}

function PipelineState({ variant, onRetry, message }) {
  const content =
    variant === 'loading'
      ? { icon: <RefreshCw size={24} className="animate-spin text-muted-foreground" />, title: 'Loading grade review queue...' }
      : { icon: <AlertTriangle size={32} className="text-rose-500 mx-auto mb-3" />, title: message || 'Failed to load grade review data' };
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background/50 font-sans antialiased">
      <PipelineHeaderShell />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          {content.icon}
          <h4 className="text-sm font-bold text-foreground mt-3">{content.title}</h4>
          {variant === 'error' && (
            <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
              <RefreshCw size={12} /> Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PipelineHeaderShell() {
  return (
    <header className="bg-card border-b border-border/80 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-card/95">
      <div className="w-full">
        <h1 className="text-base font-bold text-foreground tracking-tight">Grade Review Pipeline</h1>
      </div>
    </header>
  );
}

export function HODReview() {
  const pipeline = useReviewPipeline();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(searchParams.get('view') || REVIEW_VIEWS.APPROVALS);
  const [activeClassId, setActiveClassId] = useState(null);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view && Object.values(REVIEW_VIEWS).includes(view)) {
      setActiveView(view);
    }
  }, [searchParams]);

  const changeView = (view) => {
    setActiveView(view);
    const next = new URLSearchParams(searchParams);
    next.set('view', view);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (pipeline.sortedClasses.length > 0 && !activeClassId) {
      setActiveClassId(pipeline.sortedClasses[0].id);
    }
  }, [pipeline.sortedClasses, activeClassId]);

  const pendingRevisions = useMemo(() => countPending(pipeline.revisions), [pipeline.revisions]);
  const pendingClasses = useMemo(
    () => Math.max(0, pipeline.sortedClasses.filter((c) => c.status !== 'LOCKED').length),
    [pipeline.sortedClasses],
  );

  if (pipeline.progressLoading && pipeline.revisionsLoading) {
    return <PipelineState variant="loading" />;
  }
  if (pipeline.progressError) {
    return <PipelineState variant="error" onRetry={pipeline.refreshAll} message={pipeline.progressError?.message} />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background/50 font-sans antialiased">
      <PipelineHeader
        activeView={activeView}
        onViewChange={changeView}
        pendingRevisions={pendingRevisions}
        pendingClasses={pendingClasses}
        onRefresh={pipeline.refreshAll}
        isLoading={pipeline.isLoading}
      />

      <main className="flex-1 overflow-hidden w-full p-6 flex gap-6 items-start min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="flex-1 flex min-h-0 h-full"
          >
            {activeView === REVIEW_VIEWS.APPROVALS && <GradeApprovals pipeline={pipeline} />}
            {activeView === REVIEW_VIEWS.REVISIONS && <RevisionRequests pipeline={pipeline} />}
            {activeView === REVIEW_VIEWS.LOCK && <ClassLockExport pipeline={pipeline} activeClassId={activeClassId} onSelect={setActiveClassId} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default HODReview;
