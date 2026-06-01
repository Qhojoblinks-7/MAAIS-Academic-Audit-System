import React from 'react';
import { AlertTriangle, MessageSquare, CheckCircle } from 'lucide-react';
import { cn } from '../ui/cn';

export function InterventionsPanel({ notifications = [], studentData }) {
  const allNotifications = Array.isArray(notifications) ? notifications : [];
   
// Generate intervention notifications based on academic performance drops
  const generatedInterventions = React.useMemo(() => {
    const interventions = [];
    
    if (!studentData || !studentData.academicHistory) return interventions;
    
    // Look for Core Mathematics scores across terms
    const coreMathScores = [];
    
    studentData.academicHistory.forEach((term, index) => {
      const coreMath = term.subjects.find(subj => 
        (subj.name || subj.subject || '').toLowerCase() === 'core mathematics'
      );
      
      if (coreMath && (coreMath.score ?? 0) > 0) {
        coreMathScores.push({
          term: `${term.year} ${term.term}`,
          score: coreMath.score,
          index: index
        });
      }
    });
    
    // Check for 15% or more drops between consecutive terms
    for (let i = 1; i < coreMathScores.length; i++) {
      const prevScore = coreMathScores[i-1].score;
      const currScore = coreMathScores[i].score;
      
      if (prevScore > 0) {
        const dropPercentage = ((prevScore - currScore) / prevScore) * 100;
        
        if (dropPercentage >= 15) {
          interventions.push({
            id: `intervention-drop-${i}`,
            type: 'intervention',
            message: `Your Core Math score dropped by ${Math.round(dropPercentage)}% from ${prevScore}% to ${currScore}% (${coreMathScores[i-1].term} to ${coreMathScores[i].term})`,
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      }
    }
    
    return interventions;
  }, [studentData]);
  
  // Combine user notifications with generated interventions
  const combinedNotifications = [...allNotifications, ...generatedInterventions];

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4">Interventions & Notifications</h2>
         
        {combinedNotifications.length ? (
          <div className="space-y-3 sm:space-y-4">
            {combinedNotifications.map((n, i) => (
              <div
                key={n.id || `${n.type}-${i}`}
                className={cn(
                  'p-4 rounded-xl border flex flex-col gap-3 transition-all',
                  'sm:flex-row sm:items-start sm:justify-between sm:gap-6',
                  n.read
                    ? 'border-gray-100 bg-gray-50/50'
                    : n.type === 'intervention'
                      ? 'border-red-200 bg-red-50/40'
                      : n.type === 'counseling'
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-blue-200 bg-blue-50/40'
                )}
              >
                {/* Left Block: Icon & Meta Headers */}
                <div className="flex items-center gap-3 shrink-0 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-gray-100 shadow-sm shrink-0">
                    {n.type === 'intervention' && <AlertTriangle size={15} className="text-amber-600" />}
                    {n.type === 'counseling' && <MessageSquare size={15} className="text-emerald-600" />}
                    {n.type === 'achievement' && <CheckCircle size={15} className="text-emerald-600" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-gray-900 text-sm truncate">
                      {n.type === 'intervention'
                        ? 'Intervention Alert'
                        : n.type === 'counseling'
                          ? 'Counseling Note'
                          : 'Message'}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">
                      {n.timestamp ? new Date(n.timestamp).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>

                {/* Right Block: Core Message Copy */}
                <div className="w-full sm:mt-0.5 min-w-0 sm:text-right">
                  <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed sm:max-w-xl sm:inline-block text-left">
                    {n.message || '—'}
                  </p>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-xs font-medium">No intervention messages available.</p>
          </div>
        )}
      </div>
    </div>
  );
}