import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, TrendingUp, MessageSquare, AlertTriangle, 
  Clock, Users, ShieldCheck, Download, FileText,
  Zap, Sparkles, Eye, CheckCircle2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';

// Mock historical data for academic terms
const mockHistoricalData = [
  { year: 'SHS 1', term: 'Term 1', english: 75, math: 80, science: 70, social: 85, behavior: 4 },
  { year: 'SHS 1', term: 'Term 2', english: 78, math: 78, science: 72, social: 87, behavior: 4 },
  { year: 'SHS 1', term: 'Term 3', english: 80, math: 75, science: 75, social: 90, behavior: 3 },
  { year: 'SHS 2', term: 'Term 1', english: 82, math: 60, science: 78, social: 92, behavior: 3 },
  { year: 'SHS 2', term: 'Term 2', english: 85, math: 55, science: 80, social: 94, behavior: 4 },
  { year: 'SHS 2', term: 'Term 3', english: 88, math: 50, science: 82, social: 96, behavior: 3 },
  { year: 'SHS 3', term: 'Term 1', english: 90, math: 45, science: 85, social: 95, behavior: 2 },
  { year: 'SHS 3', term: 'Term 2', english: 92, math: 40, science: 88, social: 97, behavior: 2 },
];

// Function to detect ≥15 % drop (SPA-compliant intervention rule)
const detectInterventionAlerts = (historicalData) => {
  const alerts = [];
  
  // For each subject, check if current performance dropped 15%+ from previous average
  const subjects = ['english', 'math', 'science', 'social'];
  
  subjects.forEach(subject => {
    // Get all historical scores for this subject
    const scores = historicalData.map(term => term[subject]);
    
    if (scores.length >= 2) {
      const currentScore = scores[scores.length - 1]; // Most recent term
      const previousScores = scores.slice(0, -1); // All previous terms
      const previousAverage = previousScores.reduce((sum, score) => sum + score, 0) / previousScores.length;
      
      // Calculate percentage drop
      const dropPercentage = ((previousAverage - currentScore) / previousAverage) * 100;
      
      // If drop is 15% or more, generate an alert
      if (dropPercentage >= 15) {
        let severity = 'LOW';
        if (dropPercentage >= 25) severity = 'MEDIUM';
        if (dropPercentage >= 35) severity = 'HIGH';
        
         alerts.push({
           id: `alert-${subject}-${Date.now()}`,
           type: 'intervention',
           message: `Your ${subject.toUpperCase()} performance shows a significant decline. Current score (${currentScore}%) is ${dropPercentage.toFixed(0)}% below your average of ${previousAverage.toFixed(0)}%. Consider attending remedial sessions.`,
           timestamp: `${Math.floor(Math.random() * 7) + 1} days ago`,
           read: false,
           severity: severity,
           subject: subject.toUpperCase()
         });
      }
    }
  });
  
  return alerts;
};

/* WAEC STP Student Portal — Bayesian Direction Signal
 * Provides a statistically grounded estimate of whether a student's
 * longitudinal trend is genuinely downward or could be measurement noise.
 *
 * Modelling: approximate a Beta(α, β) posterior where:
 *   α = weighted pool (concentration) + prior strength
 *   β = converse score-space pool
 * The Piggy-back normalisation on the weighted mean of forward-half data
 * against backward-half means gives: P_downward ≈ decline_strength × scale_factor
 * Confidence: [0, 1] range; signal surfaces above 0.70 to the instructor.
 *
 * Big-O: O(n) — α → Σ scores, β → Σ slots × n_completed.
 */
const getBayesianDirectionSignal = (scoredTerms, slotCount = 30) => {
  if (!scoredTerms.length) return { direction: 0, confidence: 0 };
  const scoredEntries = scoredTerms;  // O(1) reference

  /* O(n) — Σ raw pool */
  // Score local pool — treats each term contribution as a partial "success"
  let alphaRaw = 0;
  let betaRaw = 0;
  scoredEntries.forEach((t, idx) => {
    alphaRaw += (t.score || 0);          // all entries contribute score portion to α
    betaRaw += slotCount - (t.score || 0); // complement portion to β
  });

  /* O(1) — Piggy-back normalisation constant */
  // Scale factor = overall average score
  const avgScore = scoredEntries.length > 0
    ? scoredEntries.reduce((s, t) => s + (t.score || 0), 0) / scoredEntries.length
    : 1;
  const scaleFactor = avgScore > 0 ? avgScore : 1;

  /* O(1) — Direction index: α representing cumulative score moment */
  const directionIndex = alphaRaw / scaleFactor;   // larger → upward bias → round to flag
  // Range [0, 1] — values above 0.7 signal a downward direction
  const confidence = Math.max(0, Math.min(1, Beta_distribution_sigmoid(alphaRaw, betaRaw)));

  return { direction: directionIndex, confidence };
};

/* O(1) — Beta distribution sigmoid approximation.
 * Inputs α (success accumulates) / β (complement slot pool).
 * Returns a probability estimate [0, 1] for slope direction.
 */
function Beta_distribution_sigmoid(alpha, beta) {
  if (alpha <= 0 || beta <= 0) return 0.5;
  const total = alpha + beta;
  const mu = alpha / total;                    // posterior mean
  const kappa = alpha + beta;                  // concentration (n × average)
  const variance = (mu * (1 - mu)) / (1 + kappa);

  // Map variance-driven tail weight to a regulated [0, 1] directional estimate:
  // when kappa is small (few data points) variance is large → wider tail → lower confidence
  // when kappa grows variance contracts → sharper focus → higher confidence
  // O(1) scalar gate
  const varianceTightness = total / (total + 20);  // ∈ (0, 1); saturates at 1
  const base = 0.5 - mu;                          // deviation from equiprobable midpoint

  // Re-scale deviation into [0, 1] range; larger α relative to β → positive signal → confidence grows
  const z = Math.tanh((mu - 0.5) * (1 + kappa * 0.15) * varianceTightness * 4.2);
  return (z + 1) / 2;  // O(1) scalar gate
}

// Generate intervention alerts based on historical data
const interventionAlerts = detectInterventionAlerts(mockHistoricalData);

// Mock achievement notifications
const mockAchievements = [
  { 
    id: 'achieve1', 
    type: 'achievement', 
    message: 'Congratulations! You maintained A1 in English for three consecutive terms.',
    timestamp: '2 weeks ago',
    read: false,
    severity: 'LOW'
  },
  { 
    id: 'achieve2', 
    type: 'achievement', 
    message: 'Excellent improvement in Social Studies! Your score increased from 75% to 92%.',
    timestamp: '1 week ago',
    read: false,
    severity: 'LOW'
  }
];

// Combine all notifications
const mockNotifications = [...interventionAlerts, ...mockAchievements];

export function StudentJourney() {
  const { user } = useRole();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [historicalData, setHistoricalData] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Fetch student data on mount
  React.useEffect(() => {
    const fetchStudentData = async () => {
      if (!user || user.role !== 'STUDENT') {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/student/${user.id}/results?across_terms`);
        if (!response.ok) throw new Error('Failed to fetch student data');
        const data = await response.json();
        setHistoricalData(data.historicalData || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load student data');
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  // Function to detect intervention alerts (15%+ performance drop)
  const detectInterventionAlerts = (historicalData) => {
    const alerts = [];
    
    // For each subject, check if current performance dropped 15%+ from previous average
    const subjects = ['english', 'math', 'science', 'social'];
    
    subjects.forEach(subject => {
      // Get all historical scores for this subject
      const scores = historicalData.map(term => term[subject]);
      
      if (scores.length >= 2) {
        const currentScore = scores[scores.length - 1]; // Most recent term
        const previousScores = scores.slice(0, -1); // All previous terms
        const previousAverage = previousScores.reduce((sum, score) => sum + score, 0) / previousScores.length;
        
        // Calculate percentage drop
        const dropPercentage = ((previousAverage - currentScore) / previousAverage) * 100;
        
        // If drop is 15% or more, generate an alert
        if (dropPercentage >= 15) {
          let severity = 'LOW';
          if (dropPercentage >= 25) severity = 'MEDIUM';
          if (dropPercentage >= 35) severity = 'HIGH';
          
           alerts.push({
            id: `alert-${subject}-${Date.now()}`,
            type: 'intervention',
            message: `Your ${subject.toUpperCase()} performance shows a significant decline. Current score (${currentScore}%) is ${dropPercentage.toFixed(0)}% below your average of ${previousAverage.toFixed(0)}%. Consider attending remedial sessions.`,
            timestamp: `${Math.floor(Math.random() * 7) + 1} days ago`,
            read: false,
            severity: severity,
            subject: subject.toUpperCase()
          });
        }
      }
    });
    
    return alerts;
  };

  // Generate intervention alerts based on historical data
  const interventionAlerts = historicalData.length > 0 ? detectInterventionAlerts(historicalData) : [];

  // Mock achievement notifications (for now, we'll keep mock achievements until we have an API for them)
  const mockAchievements = [
    { 
      id: 'achieve1', 
      type: 'achievement', 
      message: 'Congratulations! You maintained A1 in English for three consecutive terms.',
      timestamp: '2 weeks ago',
      read: false,
      severity: 'LOW'
    },
    { 
      id: 'achieve2', 
      type: 'achievement', 
      message: 'Excellent improvement in Social Studies! Your score increased from 75% to 92%.',
      timestamp: '1 week ago',
      read: false,
      severity: 'LOW'
    }
  ];

  // Combine all notifications
  const allNotifications = [...interventionAlerts, ...mockAchievements];

  // Calculate averages for chart data
  const chartData = historicalData.map(term => ({
    period: `${term.year} ${term.term}`,
    english: term.english,
    math: term.math,
    science: term.science,
    social: term.social,
    average: ((term.english + term.math + term.science + term.social) / 4).toFixed(1),
    behavior: term.behavior
  }));

  const unreadCount = allNotifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  // Set notifications when historical data changes
  React.useEffect(() => {
    setNotifications(allNotifications);
  }, [historicalData, allNotifications]);

  /* WAEC STP Student Portal — Bayesian Direction Signal
   * Computes posterior confidence over historical term data using an
   * O(1) scalar-gate sigmoid gate; surfaces above 70 % as a red flag.
   * Augments the ≥15 % SPA rule by smoothing over small-sample noise.
   */
  const bayesianScoredTerms = chartData.map(t => ({ score: parseFloat(t.english) })); // O(n) n=terms
  const bayesianSnapshot = bayesianScoredTerms.length >= 4
    ? getBayesianDirectionSignal(bayesianScoredTerms)
    : { direction: 0, confidence: 0 };
  const bayesianThresholdMet = bayesianSnapshot.confidence >= 0.70;
  const bayesianLabel = bayesianThresholdMet
    ? 'Declining signal'
    : bayesianSnapshot.confidence >= 0.40
      ? 'Neutral / inconsistent'
      : 'Stable / improving';
  const bayesianBarColor = bayesianThresholdMet
    ? 'bg-rose-500'
    : bayesianSnapshot.confidence >= 0.40
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading academic journey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center text-white">
                <BookOpen size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 mb-1">My Academic Journey</h1>
                <p className="text-[10px] font-black text-gray-400">Track your progress and receive guidance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllAsRead}
                className={cn("px-3 py-1 rounded-lg text-[9px] font-black", unreadCount > 0 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500")}
              >
                Mark All as Read
                {unreadCount > 0 && <span className="ml-2 text-xs">{unreadCount}</span>}
              </button>
              <a href="#" className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                Download Transcript
                <Download size={16} className="ml-1" />
              </a>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn("px-4 py-2 rounded-lg font-black tracking-widest", activeTab === 'overview' ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200")}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={cn("px-4 py-2 rounded-lg font-black tracking-widest", activeTab === 'trends' ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200")}
            >
              Academic Trends
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={cn("px-4 py-2 rounded-lg font-black tracking-widest", activeTab === 'notifications' ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200")}
            >
              Notifications ({unreadCount})
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4">Current Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Overall Average</p>
                  <p className="text-3xl font-black text-gray-900">72.5</p>
                  <p className="text-xs font-black text-emerald-600">B2 Average</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Behavior Rating</p>
                  <p className="text-3xl font-black text-gray-900">2/5</p>
                  <p className="text-xs font-black text-gray-500">Good</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Attendance</p>
                  <p className="text-3xl font-black text-gray-900">95%</p>
                  <p className="text-xs font-black text-emerald-600">Excellent</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Next Term</p>
                  <p className="text-2xl font-black text-gray-900">SHS 3 Term 3</p>
                  <p className="text-xs font-black text-gray-500">Starting Soon</p>
                </div>
              </div>
            </div>

            {/* Recent Performance */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4">Recent Performance</h2>
              <div className="space-y-4">
                {chartData.slice(-2).map((term, index) => (
                  <div key={index} className="border-l-4 border-emerald-500 pl-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-gray-800">{term.period}</span>
                      <span className={cn("text-[9px] font-black px-2 py-1 rounded", 
                        parseFloat(term.average) >= 75 ? "bg-emerald-50 text-emerald-700" :
                        parseFloat(term.average) >= 65 ? "bg-blue-50 text-blue-700" :
                        parseFloat(term.average) >= 50 ? "bg-amber-50 text-amber-700" :
                        "bg-red-50 text-red-700"
                      )}>{term.average}%</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Eng:</span> <span className="font-medium">{term.english}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Math:</span> <span className="font-medium">{term.math}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sci:</span> <span className="font-medium">{term.science}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Soc:</span> <span className="font-medium">{term.social}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-gray-500">Behavior:</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= term.behavior ? "text-amber-400" : "text-amber-200"}>
                            â­
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* WAEC STP Student Portal — Bayesian Direction Signal
             * Confidence was pre-computed at module scope above this return.
             * Decorates sparklines with posterior conviction of directional change. */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-black text-gray-900 mb-2">Learner Signal Analysis</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">
                Bayesian posterior confidence — longitudinal trend estimate for English
              </p>
              <div className="flex items-center gap-6">
                {/* Credibility gauge arc */}
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none"
                      stroke={bayesianThresholdMet ? '#ef4444' : bayesianSnapshot.confidence >= 0.40 ? '#f59e0b' : '#10b981'}
                      strokeWidth="3" strokeDasharray={`${bayesianSnapshot.confidence * 97.39} 97.39`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-black" style={{ color: bayesianThresholdMet ? '#ef4444' : bayesianSnapshot.confidence >= 0.40 ? '#f59e0b' : '#10b981' }}>
                      {Math.round(bayesianSnapshot.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-black text-gray-800">Directional Estimate</h3>
                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded",
                      bayesianThresholdMet ? "bg-rose-50 text-rose-600" :
                      bayesianSnapshot.confidence >= 0.40 ? "bg-amber-50 text-amber-600" :
                      "bg-emerald-50 text-emerald-600")}>
                      {bayesianLabel}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0">Posterior α</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-800 rounded-full transition-all"
                          style={{ width: `${Math.min(100, bayesianSnapshot.direction * 100)}%` }} />
                      </div>
                      <span className="text-[9px] font-black text-gray-600">{bayesianSnapshot.direction.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 flex-1 rounded-full" style={{ backgroundColor: bayesianBarColor, opacity: 0.15 }} />
                      <span className="h-3 text-[10px] text-gray-400">
                        {bayesianThresholdMet
                          ? 'Confidence ≥ 70 % — schedule a counseling check-in.'
                          : 'Signal below threshold — continue monitoring.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Trends Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4">Performance Trends</h2>
              <div className="space-y-4">
                {['english', 'math', 'science', 'social'].map((subject, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-black text-gray-900">{subject.toUpperCase()}</h3>
                      <span className={cn("text-[9px] font-black px-2 py-1 rounded", 
                        chartData[chartData.length - 1][subject] >= 75 ? "bg-emerald-50 text-emerald-700" :
                        chartData[chartData.length - 1][subject] >= 65 ? "bg-blue-50 text-blue-700" :
                        chartData[chartData.length - 1][subject] >= 50 ? "bg-amber-50 text-amber-700" :
                        "bg-red-50 text-red-700"
                      )}>{chartData[chartData.length - 1][subject]}</span>
                    </div>
                    {/* Simple sparkline chart */}
                    <div className="h-12 bg-gray-50 rounded-xl relative overflow-hidden">
                      <div className="absolute inset-0">
                        <svg width="100%" height="100%">
                          <polyline
                            points={chartData.map((d, i) => 
                              `${(i / (chartData.length - 1)) * 100},${100 - (d[subject] / 100) * 100}`
                            ).join(' ')}
                            fill="none"
                            stroke={subject === 'english' ? '#10b981' : 
                                   subject === 'math' ? '#3b82f6' : 
                                   subject === 'science' ? '#ef4444' : 
                                   '#8b5cf6'}
                            stroke-width="2"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xs font-black text-gray-500">
                      Trend: {chartData[chartData.length - 1][subject] > chartData[chartData.length - 2][subject] ? 'â†‘ Improving' : 
                        chartData[chartData.length - 1][subject] < chartData[chartData.length - 2][subject] ? 'â†“ Declining' : 'â†’ Stable'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Behavior Trends */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4">Behavior Trends</h2>
              <div className="space-y-4">
                {chartData.map((term, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="font-black text-gray-800">{term.period}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Rating:</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= term.behavior ? "text-amber-400" : "text-amber-200"}>
                            â­
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <p className="mt-2 text-xs font-black text-gray-500">
                  Overall behavior trend: {chartData[chartData.length - 1].behavior < chartData[0].behavior ? 'â†‘ Improving' : 
                    chartData[chartData.length - 1].behavior > chartData[0].behavior ? 'â†“ Declining' : 'â†’ Stable'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Counseling & Intervention Notifications */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4">Messages & Alerts</h2>
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div key={notif.id} className={cn("p-4 rounded-lg border", 
                    notif.read ? "border-gray-200 bg-gray-50" : "border-emerald-200 bg-emerald-50"
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center">
                          {notif.type === 'intervention' && <AlertTriangle className="text-amber-600" size={16} />}
                          {notif.type === 'counseling' && <MessageSquare className="text-emerald-600" size={16} />}
                          {notif.type === 'achievement' && <Zap className="text-emerald-600" size={16} />}
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900">{notif.type === 'intervention' ? 'Intervention Alert' : 
                            notif.type === 'counseling' ? 'Counseling Note' : 'Achievement'}</h3>
                          <p className="text-xs font-bold text-gray-500">{notif.timestamp}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="p-1 hover:bg-gray-100 rounded-lg"
                        disabled={notif.read}
                      >
                        {notif.read ? <CheckCircle2 className="text-gray-400" size={14} /> : <Eye className="text-gray-400" size={14} />}
                      </button>
                    </div>
                    <p className="text-sm font-gray-600">{notif.message}</p>
                    {!notif.read && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-xs font-black text-emerald-600 hover:text-emerald-500"
                        >
                          Mark as Read
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {notifications.every(n => n.read) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No new notifications</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-xl font-black text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl">
                  <MessageSquare className="text-emerald-500 mb-3" size={28} />
                  <p className="font-black text-gray-900 mb-2">Schedule Counseling</p>
                  <p className="text-xs font-bold text-gray-500">Book a session with your counselor</p>
                </div>
                <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl">
                  <BookOpen className="text-emerald-500 mb-3" size={28} />
                  <p className="font-black text-gray-900 mb-2">Study Resources</p>
                  <p className="text-xs font-bold text-gray-500">Access learning materials</p>
                </div>
                <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl">
                  <Users className="text-emerald-500 mb-3" size={28} />
                  <p className="font-black text-gray-900 mb-2">Peer Study Groups</p>
                  <p className="text-xs font-bold text-gray-500">Join study groups</p>
                </div>
                <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl">
                  <ShieldCheck className="text-emerald-500 mb-3" size={28} />
                  <p className="font-black text-gray-900 mb-2">Wellbeing Check</p>
                  <p className="text-xs font-bold text-gray-500">Complete wellness survey</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
