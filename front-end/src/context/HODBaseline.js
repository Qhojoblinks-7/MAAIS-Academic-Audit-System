import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

const BASELINE_KEY = 'hod_dashboard_baseline_v1';

export function loadBaseline() {
  try {
    const raw = localStorage.getItem(BASELINE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveBaseline(bl) {
  try {
    localStorage.setItem(BASELINE_KEY, JSON.stringify({ ...bl, savedAt: new Date().toISOString() }));
  } catch {}
}

export function computeDelta(current, base) {
  if (base === null || base === undefined || base === 0) return null;
  const diff = current - base;
  if (Math.abs(diff) < 0.01) return 0;
  return Math.round((diff / Math.abs(base)) * 100);
}

export function useBaseline({ baseProgress = [], avgProgress = 0, unresolvedAlerts = 0, teacherCompletion = 0 }) {
  const [baselineLoaded, setBaselineLoaded] = useState(false);
  const hasSavedRef = useRef(false);

  // 1. Establish stable baseline detection closure
  const ensureBaseline = useCallback(() => {
    const existing = loadBaseline();
    const progressLen = baseProgress?.length || 0;
    
    const hasData = progressLen > 0 || avgProgress > 0 || unresolvedAlerts > 0 || teacherCompletion > 0;
    const isStale = existing && (
      existing.departmentClassCount === 0 &&
      existing.avgProgressPct === 0 &&
      existing.atRiskStudentCount === 0 &&
      existing.teacherCompletionPct === 0
    );
    
    if ((!existing || isStale) && hasData && !hasSavedRef.current) {
      hasSavedRef.current = true;
      saveBaseline({
        departmentClassCount: progressLen,
        avgProgressPct: avgProgress,
        atRiskStudentCount: unresolvedAlerts,
        teacherCompletionPct: teacherCompletion,
      });
    }
    return loadBaseline();
  }, [baseProgress?.length, avgProgress, unresolvedAlerts, teacherCompletion]);

  // 2. Safely resolve baseline tracking parameters purely
  const baseline = useMemo(() => {
    return ensureBaseline();
  }, [ensureBaseline]);

  // FIX: Push state updates and structural layout side-effects into useEffect 
  // to avoid blocking or looping the active render pipelines.
  useEffect(() => {
    setBaselineLoaded(true);
  }, [baseline]);

  // 3. Extrapolate analytical deltas
  const baselineDeltas = useMemo(() => ({
    departmentClassCount: computeDelta(baseProgress?.length || 0, baseline?.departmentClassCount),
    avgProgressPct: computeDelta(avgProgress, baseline?.avgProgressPct),
    atRiskStudentCount: computeDelta(unresolvedAlerts, baseline?.atRiskStudentCount),
    teacherCompletionPct: computeDelta(teacherCompletion, baseline?.teacherCompletionPct),
  }), [baseProgress?.length, avgProgress, unresolvedAlerts, teacherCompletion, baseline]);

  return { baseline, baselineDeltas, baselineLoaded };
}