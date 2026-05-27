import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownLeft, RefreshCw, BookOpen, Award, AlertCircle, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StatusBadge, EmptyState } from '../molecules';
import { useHOD } from '../../context/HODContext';

function GradeRow({ student, currentGrade, previousGrade }) {
  const delta = (currentGrade?.score ?? 0) - (previousGrade?.score ?? 0);
  const absDelta = Math.abs(delta);
  const isImprovement = delta > 0;
  const isDecline = delta < 0;

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-gray-700">
          {(student.name || '?').charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 truncate">{student.name || 'Unknown'}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-gray-500 font-mono">{student.indexNumber || '—'}</span>
          <StatusBadge status={currentGrade?.grade || 'N/A'} />
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs font-bold text-gray-900">{currentGrade?.score ?? '—'}</p>
        <div className={cn(
          'flex items-center justify-end gap-0.5 text-[10px] font-semibold',
          isImprovement ? 'text-emerald-600' : isDecline ? 'text-rose-600' : 'text-gray-500'
        )}>
          {isImprovement && <TrendingUp size={10} />}
          {isDecline && <TrendingDown size={10} />}
          {!isImprovement && !isDecline && <Minus size={10} />}
          {delta > 0 ? '+' : ''}{delta.toFixed(1)}
        </div>
      </div>
    </div>
  );
}

function SubjectComparisonCard({ subject, currentTerm, previousTerm, onFetchComparison, loading }) {
  const [comparisonData, setComparisonData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  const handleFetch = async () => {
    setFetchLoading(true);
    try {
      const data = await onFetchComparison?.(subject.id, currentTerm, previousTerm);
      if (data) setComparisonData(data);
    } finally {
      setFetchLoading(false);
    }
  };

  // Fetch data on mount and when term changes
  React.useEffect(() => {
    handleFetch();
  }, [subject.id, currentTerm, previousTerm, onFetchComparison]);

  const avgCurrent = comparisonData.length > 0
    ? (comparisonData.reduce((sum, s) => sum + (s.currentGrade?.score || 0), 0) / comparisonData.length).toFixed(1)
    : null;
  const avgPrevious = comparisonData.length > 0
    ? (comparisonData.reduce((sum, s) => sum + (s.previousGrade?.score || 0), 0) / comparisonData.length).toFixed(1)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-3.5 border-b border-gray-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
          <BookOpen size={15} className="text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-gray-900">{subject.name || 'Subject'}</h3>
          <p className="text-[10px] text-gray-500">
            Avg: {avgCurrent ?? '—'} vs {avgPrevious ?? '—'}
          </p>
        </div>
        <button
          onClick={handleFetch}
          disabled={loading || fetchLoading}
          className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-lg hover:bg-gray-200 flex items-center gap-1"
        >
          {loading || fetchLoading ? <RefreshCw size={10} className="animate-spin" /> : <RefreshCw size={10} />}
        </button>
      </div>

      <div className="p-3 space-y-0.5">
        {comparisonData.length === 0 ? (
          <div className="text-center py-4">
            <Award size={24} className="text-gray-200 mx-auto mb-1.5" />
            <p className="text-[10px] text-gray-400">
              No data available for {currentTerm} vs {previousTerm}
            </p>
          </div>
        ) : (
          comparisonData.map((row, i) => (
            <GradeRow
              key={row.studentId || i}
              student={row.student || row}
              currentGrade={row.currentGrade}
              previousGrade={row.previousGrade}
            />
          ))
        )}
      </div>

      {comparisonData.length > 0 && (
        <div className="px-3 pb-3 flex items-center gap-3 py-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            <Calendar size={10} className="text-gray-400" />
            <span className="text-[10px] font-medium text-gray-700">{currentTerm}</span>
          </div>
          <ArrowUpRight size={10} className="text-gray-400" />
          <div className="flex items-center gap-1.5">
            <Calendar size={10} className="text-gray-400" />
            <span className="text-[10px] font-medium text-gray-700">{previousTerm}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PromotionRecommendationRow({ rec }) {
  const config = {
    PROMOTE: { color: 'emerald', icon: ArrowUpRight, label: 'Promote' },
    RETAIN: { color: 'rose', icon: AlertCircle, label: 'Retain' },
    CONDITIONAL: { color: 'amber', icon: Minus, label: 'Conditional' },
  };
  const c = config[rec?.recommendation] || config.CONDITIONAL;
  const Icon = c.icon;

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors">
      <Icon size={16} className={cn('shrink-0',
        rec?.recommendation === 'PROMOTE' ? 'text-emerald-600' :
        rec?.recommendation === 'RETAIN' ? 'text-rose-600' : 'text-amber-600'
      )} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900">{rec?.studentName || 'Unknown'}</p>
        <p className="text-[10px] text-gray-500">{rec?.reason || '—'}</p>
      </div>
      <StatusBadge status={rec?.recommendation || 'CONDITIONAL'} />
    </div>
  );
}

export function CurrentPreviousTermComparisonView({
  gradeComparison: controlledData,
  subjects: controlledSubjects,
  onFetchComparison,
  recommendations: controlledRecs,
  currentTerm,
  previousTerm,
  className,
}) {
  const { gradeComparison, promotionRecommendations } = useHOD();
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const comparisonData = controlledData ?? gradeComparison;
  const recs = controlledRecs ?? promotionRecommendations;

  const handleFetch = async (subjectId, termA, termB) => {
    setLoading(true);
    try {
      const result = await onFetchComparison?.(subjectId, termA, termB);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const subjects = controlledSubjects || [
    { id: '1', name: 'Mathematics' },
    { id: '2', name: 'English Language' },
    { id: '3', name: 'Physics' },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Subject term comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subjects.map((subject) => (
          <SubjectComparisonCard
            key={subject.id}
            subject={subject}
            currentTerm={currentTerm}
            previousTerm={previousTerm}
            onFetchComparison={handleFetch}
            loading={loading && selectedSubject === subject.id}
          />
        ))}
      </div>

      {/* Promotion recommendations */}
      {recs && recs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-3.5 border-b border-gray-100 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Award size={15} className="text-indigo-600" />
            </div>
            <h3 className="text-xs font-bold text-gray-900">Promotion Recommendations</h3>
          </div>
          <div className="p-2">
            {recs.map((rec, i) => (
              <PromotionRecommendationRow key={rec.studentId || i} rec={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}