import React from 'react';
import { BehaviorStars } from '../ui/BehaviorStars';
import { ResultsCard } from '../ui/ResultsCard';
import { StatusBadge } from '../ui/StatusBadge'; 
import { CounselingFlag } from '../ui/CounselingFlag';

function getChronologicalWeight(yearString, termString) {
  const yearMatch = typeof yearString === 'string' ? yearString.match(/\d+/) : null;
  const termMatch = typeof termString === 'string' ? termString.match(/\d+/) : null;
  
  const yearNum = yearMatch ? parseInt(yearMatch[0], 10) : 1;
  const termNum = termMatch ? parseInt(termMatch[0], 10) : 1;
  
  return (yearNum * 3) + termNum;
}

export function OverviewPanel({ 
  studentData = {}, 
  approvalStatus, 
  coreResults, 
  technicalResults, 
  behaviorRating, 
  behaviorRemark 
}) {
  // Memoize performance tracking based solely on stable academic tracking strings
  const counselingNotifications = React.useMemo(() => {
    const notifications = [];
    const history = studentData?.academicHistory;
    
    if (!history || !Array.isArray(history)) {
      return notifications;
    }
    
    const coreMathScores = [];
    
    history.forEach((term) => {
      if (!term || !Array.isArray(term.subjects)) return;
      
      const coreMath = term.subjects.find(subj => 
        subj && ((subj.name || subj.subject || '').toLowerCase().trim() === 'core mathematics')
      );
      
      const scoreValue = coreMath?.score ?? coreMath?.totalScore;
      if (coreMath && typeof scoreValue === 'number') {
        coreMathScores.push({
          termLabel: `${term.year || ''} ${term.term || ''}`.trim(),
          score: scoreValue,
          weight: getChronologicalWeight(term.year, term.term)
        });
      }
    });
    
    // Sort array safely without changing mutable parameters upstream
    const sortedScores = [...coreMathScores].sort((a, b) => a.weight - b.weight);
    
    for (let i = 1; i < sortedScores.length; i++) {
      const prev = sortedScores[i - 1];
      const curr = sortedScores[i];
      const isConsecutiveTerm = (curr.weight - prev.weight) === 1;
      
      if (isConsecutiveTerm && prev.score > 0) {
        const dropPercentage = ((prev.score - curr.score) / prev.score) * 100;
        if (dropPercentage >= 15) {
          notifications.push({
            message: `Core Math score dropped by ${Math.round(dropPercentage)}% from ${prev.score}% to ${curr.score}% (${prev.termLabel} to ${curr.termLabel})`,
            type: 'warning'
          });
        }
      }
    }
    return notifications;
  }, [studentData?.academicHistory]);
  
  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-(--size-xl) mx-auto">
      
      {/* 1. CRITICAL ALERTS (Top Priority) */}
      {counselingNotifications.length > 0 && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {counselingNotifications.map((notification, index) => (
            <CounselingFlag 
              key={`counseling-alert-${index}`}
              message={notification.message}
              type={notification.type}
            />
          ))}
        </div>
      )}
      
      {/* 2. CURRENT TERM SNAPSHOT LAYER */}
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-background rounded-xl p-3 sm:p-4 transition-colors hover:bg-surface">
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">
              Current CGPA
            </p>
            <p className="text-xl sm:text-2xl font-black text-text-primary">
              {Number(studentData.cgpa || 0).toFixed(2)}
            </p>
          </div>
          
          <div className="bg-background rounded-xl p-3 sm:p-4 transition-colors hover:bg-surface">
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">
              Class Rank
            </p>
            <p className="text-xl sm:text-2xl font-black text-text-primary">
              #{studentData.classRank || '—'}
            </p>
          </div>
          
          <div className="bg-background rounded-xl p-3 sm:p-4 transition-colors hover:bg-surface">
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">
              Attendance
            </p>
            <p className="text-xl sm:text-2xl font-black text-text-primary">
              {studentData.attendance !== undefined && studentData.attendance !== null
                ? `${Number(studentData.attendance).toFixed(0)}%`
                : '—'}
            </p>
          </div>
          
          <div className="bg-background rounded-xl p-3 sm:p-4 flex flex-col justify-between transition-colors hover:bg-surface">
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">
              Verification Status
            </p>
            <div className="inline-flex items-center mt-1">
              <StatusBadge status={approvalStatus || studentData.approvalStatus || 'PENDING'} />
            </div>
          </div>
        </div>
      </div>
      
      {/* 3. TWO-COLUMN SPLIT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        
        {/* Left Side: Academic Performance Cards */}
        <div className="lg:col-span-2 w-full overflow-hidden space-y-4 sm:space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-1 shadow-xs">
            <ResultsCard 
              coreResults={coreResults} 
              technicalResults={technicalResults} 
              approvalStatus={approvalStatus} 
            />
          </div>
        </div>
        
        {/* Right Side: Behavior & Sidebar Insights */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Qualitative Behavior Block */}
          <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-wider mb-4 pb-2 border-b border-border">
              Behavioral Evaluation
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">
                  Overall Rating
                </p>
                <div className="flex items-center mt-0.5">
                  <BehaviorStars rating={behaviorRating} />
                </div>
              </div>

              <div>
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">
                  Instructor Remarks
                </p>
                {behaviorRemark ? (
                  <p className="text-xs font-medium text-text-primary leading-relaxed bg-background p-2.5 rounded-xl border border-border">
                    "{behaviorRemark}"
                  </p>
                ) : (
                  <p className="text-xs text-text-secondary italic bg-background p-2.5 rounded-xl text-center">
                    No remarks provided for this term.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Character Assessment Metrics Block */}
          {studentData.characterTraits && (
            <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs">
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wider mb-4 pb-2 border-b border-border">
                Core Traits
              </h3>
              
              <div className="space-y-2.5">
                {[
                  { label: 'Qualities', value: studentData.characterTraits.characterQualities },
                  { label: 'Leadership', value: studentData.characterTraits.leadership },
                  { label: 'Discipline', value: studentData.characterTraits.discipline },
                  { label: 'Teamwork', value: studentData.characterTraits.teamwork },
                  { label: 'Ethics', value: studentData.characterTraits.ethics },
                ].map((trait, idx) => (
                  <div key={`trait-row-${idx}`} className="flex items-center justify-between bg-background hover:bg-surface px-3 py-2 rounded-xl transition-colors">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">{trait.label}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-border h-1.5 rounded-full overflow-hidden hidden xs:block">
                        <div 
                          className="bg-brand-primary h-full rounded-full" 
                          style={{ width: `${Math.min(Math.max(((trait.value ?? 0) / 5) * 100, 0), 100)}%` }}
                        />
                      </div>
                      <span className="font-black text-text-primary text-xs min-w-[24px] text-right">
                        {trait.value ?? 0}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Activity/Logs Meta Card */}
          <div className="bg-background rounded-xl p-3.5 border border-border flex items-center justify-between">
            <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">
              Last Seen
            </span>
            <span className="text-xs font-black text-text-primary">
              {studentData.lastSeen
                ? new Date(studentData.lastSeen).toLocaleDateString(undefined, { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                : '—'}
            </span>
          </div>

        </div>
      </div>
       
    </div>
  );
}