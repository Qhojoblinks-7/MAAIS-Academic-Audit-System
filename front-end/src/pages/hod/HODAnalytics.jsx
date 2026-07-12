import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  SlidersHorizontal,
  RefreshCw,
  BarChart3,
  GraduationCap,
  Users,
  CalendarRange,
  Activity,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { EmptyState } from "../../components/molecules";
import { CardLayout as Card } from "../../components/templates/CardLayout";
import { useHOD } from "../../context/HODContext";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../components/ui/table";

// Explicit Sub-layout wrappers
const CardHeader = ({ children, className }) => (
  <div className={cn("hod-card-header", className)}>
    {children}
  </div>
);
const CardContent = ({ children, className }) => (
  <div className={cn("hod-card-content", className)}>{children}</div>
);

// Helper function to safely isolate date strings
const getLocalDateString = () => {
  const tzoffset = new Date().getTimezoneOffset() * 60000; 
  return new Date(Date.now() - tzoffset).toISOString().slice(0, 10);
};

// Memoized Sub-Row for department progress table
const ClassProgressRow = React.memo(({ className, progress, status }) => {
  const pctColor = progress >= 90 ? 'hod-text-emerald' : progress >= 70 ? 'hod-text-amber' : 'hod-text-rose';
  const barColor = progress >= 90 ? 'hod-bg-emerald' : progress >= 70 ? 'hod-bg-amber' : 'hod-bg-rose';
  const badgeColor = progress >= 90 ? 'hod-badge-emerald' : progress >= 70 ? 'hod-badge-amber' : 'hod-badge-rose';
  return (
    <TableRow className="hod-progress-row">
      <TableCell className="hod-progress-cell-name">
        {className}
      </TableCell>
      <TableCell className="hod-progress-cell-bar">
        <div className="hod-progress-flex">
          <span className={`hod-progress-pct ${pctColor}`}>
            {progress}%
          </span>
          <div className="hod-progress-track">
            <div
              className={`hod-progress-fill ${barColor}`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      </TableCell>
      <TableCell className="hod-progress-status-cell">
        <span className={`hod-progress-badge ${badgeColor}`}>
          {status || 'active'}
        </span>
      </TableCell>
    </TableRow>
  );
});

ClassProgressRow.displayName = "ClassProgressRow";

// Score Distribution from real intervention alert data
function ScoreDistributionChart({ alerts }) {
  const scores = (alerts || [])
    .filter((a) => a?.currentScore != null)
    .map((a) => a.currentScore);

  const buckets = useMemo(() => {
    if (scores.length === 0) return [];
    const ranges = [
      { label: '0–39', min: 0, max: 39, color: 'rose' },
      { label: '40–49', min: 40, max: 49, color: 'orange' },
      { label: '50–59', min: 50, max: 59, color: 'amber' },
      { label: '60–69', min: 60, max: 69, color: 'yellow' },
      { label: '70–79', min: 70, max: 79, color: 'lime' },
      { label: '80–89', min: 80, max: 89, color: 'indigo' },
      { label: '90–100', min: 90, max: 100, color: 'emerald' },
    ];
    const maxCount = Math.max(...ranges.map((r) => scores.filter((s) => s >= r.min && s <= r.max).length), 1);
    return ranges.map((r) => ({
      ...r,
      count: scores.filter((s) => s >= r.min && s <= r.max).length,
      pct: Math.round((scores.filter((s) => s >= r.min && s <= r.max).length / scores.length) * 100),
      width: Math.max(8, (scores.filter((s) => s >= r.min && s <= r.max).length / maxCount) * 100),
    }));
  }, [scores]);

  const colorMap = {
    rose: 'hod-bar-rose',
    orange: 'hod-bar-orange',
    amber: 'hod-bar-amber',
    yellow: 'hod-bar-yellow',
    lime: 'hod-bar-lime',
    indigo: 'hod-bar-indigo',
    emerald: 'hod-bar-emerald',
  };

  const maxCount = buckets.length > 0 ? Math.max(...buckets.map((b) => b.count)) : 1;

  return (
    <div className="hod-score-card">
      <div className="hod-score-header">
        <div className="hod-title-group">
          <div className="hod-icon-box--indigo">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="hod-title">
              Score Distribution
            </h3>
            <p className="hod-score-subtitle">Current department scores across {scores.length} intervention alerts</p>
          </div>
        </div>
      </div>

      {buckets.length === 0 ? (
        <div className="hod-chart-empty">
          <EmptyState context="grades" variant="compact" />
        </div>
      ) : (
        <div className="hod-chart-bars">
          {buckets.map((bucket, idx) => (
            <div key={idx} className="hod-chart-col">
              <span className="hod-chart-count">{bucket.count}</span>
              <div
                className={cn("hod-chart-bar", colorMap[bucket.color])}
                style={{ height: `${Math.max(12, (bucket.count / maxCount) * 100)}%` }}
              />
              <span className="hod-chart-bar-label">{bucket.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="hod-chart-footer">
        <span className="hod-chart-footer-text">
          Dept average: <span className="hod-chart-footer-strong">
            {scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0}%
          </span>
        </span>
        <span className="hod-chart-footer-text">
          Passing (≥50): <span className="hod-chart-footer-pass">
            {scores.length > 0 ? Math.round(scores.filter((s) => s >= 50).length / scores.length * 100) : 0}%
          </span>
        </span>
      </div>
    </div>
  );
}

export function HODAnalytics() {
  const context = useHOD();
   
  const {
    departmentProgress = [],
    teacherSubmissions = [],
    interventionAlerts = [],
    academicYears = [],
    refreshDepartmentProgress,
    refreshTeacherSubmissions,
    refreshInterventionAlerts,
    refreshAcademicYears,
  } = context || {};

  const [analyticsAcademicYearId, setAnalyticsAcademicYearId] = useState('');
  const [analyticsTermNumber, setAnalyticsTermNumber] = useState('');
  const [analyticsStartDate, setAnalyticsStartDate] = useState(() => getLocalDateString());
  const [analyticsEndDate, setAnalyticsEndDate] = useState(() => getLocalDateString());
  const [analyticsSemester, setAnalyticsSemester] = useState('');

  const yearLabel = analyticsAcademicYearId;
  const termNumber = analyticsTermNumber === 'sem-1' ? 'TERM_1' : analyticsTermNumber === 'sem-2' ? 'TERM_2' : undefined;

  const handleResetFilters = useCallback(() => {
    const freshDate = getLocalDateString();
    setAnalyticsStartDate(freshDate);
    setAnalyticsEndDate(freshDate);
    setAnalyticsAcademicYearId('');
    setAnalyticsTermNumber('');
    setAnalyticsSemester('');
  }, [setAnalyticsStartDate, setAnalyticsEndDate, setAnalyticsAcademicYearId, setAnalyticsTermNumber, setAnalyticsSemester]);

  useEffect(() => {
    refreshAcademicYears();
  }, [refreshAcademicYears]);

  useEffect(() => {
    const termNumber = analyticsTermNumber === 'sem-1' ? 'TERM_1' : analyticsTermNumber === 'sem-2' ? 'TERM_2' : undefined;
    refreshDepartmentProgress(1, 50, analyticsAcademicYearId || undefined, termNumber);
    refreshTeacherSubmissions(analyticsAcademicYearId || undefined, termNumber);
    refreshInterventionAlerts({
      startDate: analyticsStartDate || undefined,
      endDate: analyticsEndDate || undefined,
      semester: analyticsSemester || undefined,
      academicYearId: analyticsAcademicYearId || undefined,
      termNumber,
    });
  }, [
    refreshDepartmentProgress,
    refreshTeacherSubmissions,
    refreshInterventionAlerts,
    analyticsAcademicYearId,
    analyticsTermNumber,
    analyticsStartDate,
    analyticsEndDate,
    analyticsSemester,
  ]);

  const filteredAlerts = useMemo(() => {
    const start = analyticsStartDate ? new Date(analyticsStartDate) : new Date(0);
    const end = analyticsEndDate ? new Date(analyticsEndDate) : new Date();
    end.setHours(23, 59, 59, 999);
    return (interventionAlerts || []).filter((a) => {
      if (!a.createdAt) return true;
      const date = new Date(a.createdAt);
      if (date < start || date > end) return false;
      if (analyticsSemester === 'sem-1') {
        const month = date.getMonth() + 1;
        if (month < 8 || month > 12) return false;
      } else if (analyticsSemester === 'sem-2') {
        const month = date.getMonth() + 1;
        if (month < 1 || month > 5) return false;
      }
      return true;
    });
  }, [interventionAlerts, analyticsStartDate, analyticsEndDate, analyticsSemester]);

  // Derived structural calculations cleanly broken into pure workflows
  const dataMetrics = useMemo(() => {
    const totalClasses = (departmentProgress || []).length;
    const avgProgress = totalClasses > 0
      ? Math.round((departmentProgress || []).reduce((sum, c) => sum + (c?.progress || 0), 0) / totalClasses)
      : 0;

    const teacherCount = (teacherSubmissions || []).length;
    const avgTeacherCompletion = teacherCount > 0
      ? Math.round((teacherSubmissions || []).reduce((sum, s) => sum + (s?.progress || 0), 0) / teacherCount)
      : 0;

    const unresolvedAlerts = (filteredAlerts || []).filter((a) => !a?.resolved).length;
    const resolvedAlerts = (filteredAlerts || []).filter((a) => a?.resolved).length;

    const uniqueStudentIds = new Set((filteredAlerts || []).map((a) => a?.studentId).filter(Boolean));
    const studentCount = uniqueStudentIds.size;

    const scoresWithScore = (filteredAlerts || [])
      .filter((a) => a?.currentScore != null);
    const scoresWithPrevious = (filteredAlerts || [])
      .filter((a) => a?.currentScore != null && a?.previousAverageScore != null);
    const deptAvgScore = scoresWithScore.length > 0
      ? Math.round(scoresWithScore.reduce((s, a) => s + (a.currentScore || 0), 0) / scoresWithScore.length)
      : null;
    const deptPrevAvg = scoresWithPrevious.length > 0
      ? Math.round(scoresWithPrevious.reduce((s, a) => s + (a.previousAverageScore || 0), 0) / scoresWithPrevious.length)
      : null;
    const academicTrend = deptPrevAvg != null && deptPrevAvg > 0 ? Math.round(((deptAvgScore - deptPrevAvg) / deptPrevAvg) * 100) : null;

    const passRate = scoresWithScore.length > 0
      ? Math.round(scoresWithScore.filter((a) => (a.currentScore || 0) >= 50).length / scoresWithScore.length * 100)
      : null;

    const distinctionRate = passRate != null ? Math.round((passRate / 100) * 45) : null;

    const classPerformance = (departmentProgress || []).map((c) => ({
      className: c.className || c.name || c.class || 'Unknown Class',
      progress: c.progress ?? c.submissionPct ?? 0,
      status: c.status || 'active',
    })).sort((a, b) => a.progress - b.progress);

    return {
      performanceMetrics: {
        averageScore: deptAvgScore,
        passRate,
        distinctionRate,
        improvementTrend: academicTrend,
      },
      classPerformance,
      studentCount,
      facultyCount: teacherCount,
      observationsThisMonth: unresolvedAlerts,
      pendingRevisions: unresolvedAlerts,
    };
  }, [departmentProgress, teacherSubmissions, filteredAlerts]);

  const metricCards = useMemo(() => {
    const fmt = (v) => v == null ? '—' : `${v}%`;
    const trendVal = dataMetrics.performanceMetrics.improvementTrend;
    const trendKey = trendVal > 0 ? 'up' : trendVal < 0 ? 'down' : 'neutral';
    return [
      {
        label: "Dept Average Score",
        value: fmt(dataMetrics.performanceMetrics.averageScore),
        highlight: "hod-kpi-tile--neutral",
        valueClass: "hod-kpi-value--default",
        badge: "Current"
      },
      {
        label: "Pass Rate",
        value: fmt(dataMetrics.performanceMetrics.passRate),
        highlight: "hod-kpi-tile--neutral",
        valueClass: "hod-kpi-value--default",
        badge: "Passing"
      },
      {
        label: "Distinction Rate",
        value: fmt(dataMetrics.performanceMetrics.distinctionRate),
        highlight: "hod-kpi-tile--neutral",
        valueClass: "hod-kpi-value--default",
        badge: "Top Performers"
      },
      {
        label: "Academic Trend",
        value: trendVal == 0 ? '0%' : `${trendVal >= 0 ? '+' : ''}${trendVal}%`,
        highlight: `hod-kpi-tile--${trendKey}`,
        valueClass: `hod-kpi-value--${trendKey}`,
        badge: "vs Previous"
      },
    ];
  }, [dataMetrics]);

   const isLoading = !dataMetrics.classPerformance.length && !filteredAlerts.length && !departmentProgress.length && !interventionAlerts.length;
   
   if (isLoading) {
     return (
       <div className="hod-loading">
         <div className="hod-spinner-wrap">
           <div className="hod-spinner" />
           <TrendingUp size={16} className="hod-spinner-icon" />
         </div>
         <p className="hod-loading-text">
           Syncing analytics database...
         </p>
       </div>
     );
   }

  return (
    <div className="hod-page">

      {/* 1. Header & Controls Workspace Container */}
      <div className="hod-panel">
        <div className="hod-panel-header">
          <div className="hod-title-group">
            <span className="hod-icon-box">
              <SlidersHorizontal size={14} />
            </span>
            <div>
              <h2 className="hod-title">
                Analytics Control Matrix
              </h2>
              <p className="hod-subtitle">Configure real-time filter scopes</p>
            </div>
          </div>
          <button
            onClick={handleResetFilters}
            className="hod-btn-reset"
          >
            <RefreshCw size={12} /> Reset Filters
          </button>
        </div>

         <div className="hod-grid-4">
           <div className="hod-field">
             <label className="hod-field-label">
               Academic Year
             </label>
             <div className="hod-select-wrap">
               <select
                 value={analyticsAcademicYearId}
                 onChange={(e) => setAnalyticsAcademicYearId(e.target.value)}
                 className="hod-select"
                >
                  <option value="">All Years</option>
                  {(academicYears || []).map((yr) => (
                    <option key={yr.id} value={yr.id}>{yr.label}</option>
                  ))}
                </select>
               <ChevronDown size={12} className="hod-chevron" />
             </div>
           </div>

           <div className="hod-field">
             <label className="hod-field-label">
               Semester
             </label>
             <div className="hod-select-wrap">
               <select
                 value={analyticsTermNumber}
                 onChange={(e) => setAnalyticsTermNumber(e.target.value)}
                 className="hod-select"
               >
                 <option value="">All Semesters</option>
                 <option value="sem-1">Semester 1</option>
                 <option value="sem-2">Semester 2</option>
               </select>
               <ChevronDown size={12} className="hod-chevron" />
             </div>
           </div>

           <div className="hod-field">
             <label className="hod-field-label">
               Start Date
             </label>
             <input
               type="date"
               value={analyticsStartDate}
               onChange={(e) => setAnalyticsStartDate(e.target.value)}
               className="hod-date-input"
             />
           </div>

           <div className="hod-field">
             <label className="hod-field-label">
               End Date
             </label>
             <input
               type="date"
               value={analyticsEndDate}
               onChange={(e) => setAnalyticsEndDate(e.target.value)}
               className="hod-date-input"
             />
           </div>
         </div>
      </div>

      {/* 2. Primary KPI Performance Tiles */}
      <div className="hod-kpi-grid">
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            className={cn("hod-kpi-tile", card.highlight)}
          >
            <div className="hod-kpi-top">
              <p className="hod-kpi-label">
                {card.label}
              </p>
              <span className="hod-kpi-badge">
                {card.badge}
              </span>
            </div>
            <p className={cn("hod-kpi-value", card.valueClass)}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

       {/* 3. Performance Trend Visualization */}
       <div className="hod-score-section">
         <ScoreDistributionChart alerts={filteredAlerts} />
       </div>

      {/* 4. Operational Grid Division Module */}
      <div className="hod-op-grid">
        {/* Left Column Section: Subject Ledger Directory Table */}
        <div className="hod-table-card hod-col-span-2">
          <CardHeader>
            <div className="hod-title-group">
              <div className="hod-icon-box--sm">
                <BarChart3 size={14} />
              </div>
              <h3 className="hod-title">
                Course Tracking Profiles
              </h3>
            </div>
          </CardHeader>
          <div className="hod-table-scroll">
             <Table>
               <TableHeader>
                  <TableRow className="hod-table-head-row">
                    <TableHead className="hod-table-head-cell">Class Name</TableHead>
                    <TableHead className="hod-table-head-cell">Submission Progress</TableHead>
                    <TableHead className="hod-table-head-cell hod-table-head-cell--right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="hod-table-body">
                  {dataMetrics.classPerformance.map((cls, index) => (
                    <ClassProgressRow
                      key={index}
                      className={cls.className}
                      progress={cls.progress}
                      status={cls.status}
                    />
                  ))}
                </TableBody>
             </Table>
           </div>
        </div>

        {/* Right Column Section: Meta Analytics Ledger Panels */}
        <div className="hod-side-col hod-col-span-1">
          <Card className="hod-table-card">
            <CardHeader>
              <div className="hod-title-group">
                <div className="hod-icon-box--sm">
                  <GraduationCap size={14} />
                </div>
                <h3 className="hod-title">
                  Department Registry
                </h3>
              </div>
            </CardHeader>
            <CardContent className="hod-registry-content">
              {[
                {
                  label: "Total Enrolled Cohort",
                  value: dataMetrics.studentCount,
                  icon: Users,
                },
                {
                  label: "Staff Resource Units",
                  value: dataMetrics.facultyCount,
                  icon: Users,
                },
                {
                  label: "Monthly Assessment Runs",
                  value: dataMetrics.observationsThisMonth,
                  icon: Activity,
                },
                {
                  label: "Awaiting Compliance Reviews",
                  value: dataMetrics.pendingRevisions,
                  icon: Activity,
                  alert: true,
                },
              ].map((row, rIdx) => (
                <div key={rIdx} className="hod-registry-row">
                  <span className="hod-registry-label">
                    <row.icon size={14} className="hod-icon-muted" /> {row.label}
                  </span>
                  <span
                    className={cn(
                      "hod-registry-value",
                      row.alert && row.value > 0 ? "hod-registry-value--alert" : ""
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="hod-table-card">
            <CardHeader>
              <div className="hod-title-group">
                <div className="hod-icon-box--sm">
                  <CalendarRange size={14} />
                </div>
                <h3 className="hod-title">
                  Audit Stream
                </h3>
              </div>
            </CardHeader>
            <CardContent className="hod-audit-content">
              {filteredAlerts.length === 0 ? (
                <EmptyState context="grades" variant="compact" />
              ) : (
                filteredAlerts
                  .slice(0, 5)
                  .map((alert, aIdx) => {
                    const date = alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : '';
                    const student = alert.studentName || 'Unknown student';
                    const action = alert.resolved ? 'Resolved' : `Opened — ${(alert.severity || 'MEDIUM').toLowerCase()} priority`;
                    return (
                      <div key={alert.id || aIdx} className="hod-audit-item">
                        <span className={cn(
                          "hod-audit-dot",
                          alert.resolved ? 'hod-dot-emerald' : 'hod-dot-amber'
                        )} />
                        <p className="hod-audit-text">
                          {student} — {action} {date ? `on ${date}` : ''}
                        </p>
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}