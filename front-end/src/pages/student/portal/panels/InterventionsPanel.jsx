import React from 'react';
import { AlertTriangle, MessageSquare, CheckCircle, Bell } from 'lucide-react';
import { cn } from '../ui/cn';
import { EmptyState } from '../../../../components/molecules';

export function InterventionsPanel({ notifications = [], studentData, activeInterventions: propInterventions }) {
  const backendInterventions = React.useMemo(() => {
    const source = propInterventions || studentData?.activeInterventions;
    if (!Array.isArray(source)) return [];
    return source.map((a, idx) => ({
      id: a.id || `backend-intervention-${idx}`,
      type: 'intervention',
      message: a.description || `Performance drop alert: ${a.dropPercentage?.toFixed?.(1) ?? a.dropPercentage}% decline detected.`,
      timestamp: a.createdAt || a.timestamp || new Date().toISOString(),
      read: a.status === 'RESOLVED' || a.resolved,
    }));
  }, [propInterventions, studentData?.activeInterventions]);

  const generatedInterventions = React.useMemo(() => {
    const history = studentData?.academicHistory;
    if (!history || !Array.isArray(history)) return [];
    if (backendInterventions.length > 0) return [];

    const coreMathScores = [];
    history.forEach((term, index) => {
      const coreMath = (term.subjects || []).find(subj => 
        (subj.name || subj.subject || '').toLowerCase().trim() === 'core mathematics'
      );
      const scoreValue = coreMath?.score ?? coreMath?.totalScore ?? 0;
      if (coreMath && scoreValue > 0) {
        coreMathScores.push({
          term: `${term.year || ''} ${term.term || ''}`.trim(),
          score: scoreValue,
          index: index,
        });
      }
    });

    const interventions = [];
    for (let i = 1; i < coreMathScores.length; i++) {
      const prevScore = coreMathScores[i - 1].score;
      const currScore = coreMathScores[i].score;
      if (prevScore > 0) {
        const dropPercentage = ((prevScore - currScore) / prevScore) * 100;
        if (dropPercentage >= 15) {
          interventions.push({
            id: `intervention-drop-${coreMathScores[i].term.replace(/\s+/g, '-')}-${i}`,
            type: 'intervention',
            message: `Your Core Math score dropped by ${Math.round(dropPercentage)}% from ${prevScore}% to ${currScore}% (${coreMathScores[i - 1].term} to ${coreMathScores[i].term}).`,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      }
    }
    return interventions;
  }, [studentData?.academicHistory, backendInterventions.length]);

  const allNotifications = React.useMemo(() => {
    return Array.isArray(notifications) ? notifications.map(n => ({
      ...n,
      type: n.type || (n.title?.toLowerCase().includes('achievement') ? 'achievement' : n.body ? 'message' : n.notes ? 'intervention' : 'system'),
      message: n.message || n.body || n.notes || '',
      timestamp: n.timestamp || n.createdAt || new Date().toISOString(),
      read: n.read !== undefined ? n.read : (n.status === 'RESOLVED' ? true : false),
    })) : [];
  }, [notifications]);

  const combinedNotifications = React.useMemo(() => {
    return [...allNotifications, ...backendInterventions, ...generatedInterventions];
  }, [allNotifications, backendInterventions, generatedInterventions]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-black text-text-primary mb-4">Interventions & Notifications</h2>
         
        {combinedNotifications.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {combinedNotifications.map((n, i) => {
              const isRead = !!n.read;
              const type = (n.type || 'message').toLowerCase();

              return (
                <div
                  key={n.id || `notification-row-${type}-${i}`}
                  className={cn(
                    'p-4 rounded-xl border flex flex-col gap-3 transition-all',
                    'sm:flex-row sm:items-start sm:justify-between sm:gap-6',
                    isRead
                      ? 'border-border bg-background/70 opacity-80'
                      : type === 'intervention'
                        ? 'border-error/40 bg-error/10'
                        : type === 'counseling'
                          ? 'border-brand-secondary/40 bg-brand-secondary/10'
                          : type === 'achievement'
                            ? 'border-success/40 bg-success/10'
                            : 'border-border bg-background/40'
                  )}
                >
                  {/* Left Block: Icon Descriptor & Meta Info */}
                  <div className="flex items-center gap-3 shrink-0 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface border border-border/80 shadow-sm shrink-0">
                      {type === 'intervention' && <AlertTriangle size={15} className="text-error" />}
                      {type === 'counseling' && <MessageSquare size={15} className="text-brand-secondary" />}
                      {type === 'achievement' && <CheckCircle size={15} className="text-success" />}
                      {type !== 'intervention' && type !== 'counseling' && type !== 'achievement' && (
                        <Bell size={15} className="text-text-secondary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-text-primary text-sm truncate">
                        {type === 'intervention' && 'Intervention Alert'}
                        {type === 'counseling' && 'Counseling Note'}
                        {type === 'achievement' && 'Academic Achievement'}
                        {type !== 'intervention' && type !== 'counseling' && type !== 'achievement' && 'System Update'}
                      </h3>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wide mt-0.5">
                        {n.timestamp ? new Date(n.timestamp).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Right Block: Content Text Body */}
                  <div className="w-full sm:mt-0.5 min-w-0 sm:text-right">
                    <p className="text-xs sm:text-sm font-medium text-text-primary leading-relaxed sm:max-w-xl sm:inline-block text-left">
                      {n.message || '—'}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
            <div className="py-8 bg-background rounded-xl border border-dashed border-border/60">
              <EmptyState context="grades" variant="compact" />
            </div>
        )}
      </div>
    </div>
  );
}

export default InterventionsPanel;