import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { useLocation, useNavigate } from 'react-router-dom';

import studentPortalMockDataDefault from '../../data/studentPortalMockData.json';
import { TranscriptPrintTemplate } from './portal/print/TranscriptPrintTemplate';
import { TerminalPrintTemplate } from './portal/print/TerminalPrintTemplate';
import { StudentPortalHeader } from './portal/StudentPortalHeader';
import { OverviewPanel } from './portal/panels/OverviewPanel';
import { AcademicPanel } from './portal/panels/AcademicPanel';
import { InterventionsPanel } from './portal/panels/InterventionsPanel';
import { HistoryPanel } from './portal/panels/HistoryPanel';
import { GradingScalePanel } from './portal/panels/GradingScalePanel';
import { AcademicJourneyPanel } from './portal/panels/AcademicJourneyPanel';
import { BroadsheetComparisonPanel } from './portal/panels/BroadsheetComparisonPanel';

// Unified valid routing tabs lookup configuration
const VALID_TABS = ['overview', 'academic', 'interventions', 'history', 'gradingScale', 'academicJourney', 'broadsheetComparison'];

export function StudentPortal({ studentPortalMockData = studentPortalMockDataDefault }) {
  const { user } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  // Fix: Whitelist initialized to recognize 'overview' directly from MobileDrawer hooks
  const [activeTab, setActiveTab] = React.useState(() => {
    const hash = location.hash.replace('#', '') || 'overview';
    return VALID_TABS.includes(hash) ? hash : 'overview';
  });

  const [studentData, setStudentData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [notifications, setNotifications] = React.useState([]);
  const [selectedReportType, setSelectedReportType] = React.useState('transcript');
  
  // Isolated printing state mechanics to secure DOM variable hydration
  const [singlePrintData, setSinglePrintData] = React.useState(null);
  const [showPrintConfirm, setShowPrintConfirm] = React.useState(false);
  const [pendingHistoryItem, setPendingHistoryItem] = React.useState(null);

  // Sync activeTab with URL hash changes smoothly
  React.useEffect(() => {
    const hash = location.hash.replace('#', '') || 'overview';
    if (VALID_TABS.includes(hash) && hash !== activeTab) {
      setActiveTab(hash);
    }
  }, [location.hash, activeTab]);

  React.useEffect(() => {
    setStudentData(null);
    setError('');
    setNotifications([]);
    setLoading(true);
  }, [user]);

  const fetchStudentData = React.useCallback(async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    if (user.role !== 'STUDENT') {
      setError('Please switch to STUDENT role to view this portal.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const allStudents = Array.isArray(studentPortalMockData?.students)
        ? studentPortalMockData.students
        : [];

      const usernameDigits = String(user.username ?? user.id).replace(/\D/g, '');
      const userIndexDigits = usernameDigits.padStart(3, '0');
      const expectedStudId = `stud${userIndexDigits}`;
      const lastThreeDigits = usernameDigits.slice(-3).padStart(3, '0');
      const expectedStudIdFromLast3 = `stud${lastThreeDigits}`;

      const found =
        allStudents.find((s) => s.id === user.id) ||
        allStudents.find((s) => s.id === expectedStudId) ||
        allStudents.find((s) => s.id === expectedStudIdFromLast3) ||
        allStudents.find((s) => String(s.indexNumber).padStart(3, '0') === userIndexDigits) ||
        allStudents.find((s) => String(s.indexNumber).padStart(3, '0') === lastThreeDigits);

      if (!found) {
        throw new Error(`No student portal record found for credentials provided.`);
      }

      setStudentData(found);
      const notifs = found.notifications || found.interventions || [];
      setNotifications(Array.isArray(notifs) ? notifs : []);
    } catch (e) {
      setError(e.message || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  }, [user, studentPortalMockData]);

  React.useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const handleDownloadReport = () => {
    setSinglePrintData(null); // Clear single layout parameters to fallback on global configuration templates
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const handleHistoryDownloadRequest = (item) => {
    if (window.innerWidth < 640) {
      setPendingHistoryItem(item);
      setShowPrintConfirm(true);
    } else {
      triggerHistoryPrint(item);
    }
  };

  const triggerHistoryPrint = (item) => {
    const historyItem = studentData.academicHistory?.find(
      h => h.year === item.year && h.term === item.term
    ) || item;

    const formattedPrintPayload = {
      studentName: studentData.studentName || user?.name || 'Student',
      indexNumber: studentData.indexNumber || '—',
      dateOfBirth: studentData.dateOfBirth || '—',
      gender: studentData.gender || '—',
      program: studentData.programName || studentData.program || '—',
      learningArea: studentData.learningArea || '—',
      yearForm: historyItem.year || '—',
      semester: historyItem.term || '—',
      enrollmentDate: studentData.enrollmentDate || '—',
      completionDate: studentData.completionDate || '—',
      house: studentData.house || '—',
      sbaScore: studentData.sbaScore || 0,
      waecExamScore: studentData.waecExamScore || 0,
      finalScore: studentData.finalScore || 0,
      grade: studentData.grade || '—',
      gpaPerTerm: studentData.gpaPerTerm || 0,
      cgpa: studentData.cgpa || 0,
      approvalStatus: historyItem.approvalStatus || studentData.approvalStatus || '—',
      qualitativeAssessment: {
        characterQualities: studentData.characterTraits?.characterQualities ?? 0,
        leadership: studentData.characterTraits?.leadership ?? 0,
        discipline: studentData.characterTraits?.discipline ?? 0,
        teamwork: studentData.characterTraits?.teamwork ?? 0,
        ethics: studentData.characterTraits?.ethics ?? 0,
      },
      academicHistory: [{
        year: historyItem.year,
        term: historyItem.term,
        subjects: historyItem.subjects || [],
        approvalStatus: historyItem.approvalStatus
      }],
      wassceResults: studentData.wassceResults || [],
      sessionInfo: {
        year: historyItem.year || '—',
        term: historyItem.term || '—',
        examDate: studentData.terminalExamDate || '—',
      },
    };

    // React state variable mapping prevents DOM memory dropouts during systemic hardware triggers
    setSinglePrintData(formattedPrintPayload);
    
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center animate-pulse px-4">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-text-secondary">
            Loading academic ledger matrices...
          </p>
        </div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-full max-w-md bg-surface border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm text-center mx-auto">
          <AlertTriangle className="mx-auto text-warning mb-2" size={24} />
          <p className="text-sm font-bold text-text-primary">{error || 'No profile context matches found.'}</p>
          <p className="text-[11px] text-text-secondary mt-1">Please reach out to administration if this condition persists.</p>
        </div>
      </div>
    );
  }

  // Global Default Transcript Mapping Dataset
  const globalTranscriptDataset = {
    studentName: studentData.studentName || user?.name || 'Student',
    indexNumber: studentData.indexNumber || '—',
    dateOfBirth: studentData.dateOfBirth || '—',
    gender: studentData.gender || '—',
    program: studentData.programName || studentData.program || '—',
    learningArea: studentData.learningArea || '—',
    yearForm: studentData.yearForm || '—',
    semester: studentData.semester || '—',
    enrollmentDate: studentData.enrollmentDate || '—',
    completionDate: studentData.completionDate || '—',
    house: studentData.house || '—',
    sbaScore: studentData.sbaScore || 0,
    waecExamScore: studentData.waecExamScore || 0,
    finalScore: studentData.finalScore || 0,
    grade: studentData.grade || '—',
    gpaPerTerm: studentData.gpaPerTerm || 0,
    cgpa: studentData.cgpa || 0,
    approvalStatus: studentData.approvalStatus || '—',
    qualitativeAssessment: {
      characterQualities: studentData.characterTraits?.characterQualities ?? 0,
      leadership: studentData.characterTraits?.leadership ?? 0,
      discipline: studentData.characterTraits?.discipline ?? 0,
      teamwork: studentData.characterTraits?.teamwork ?? 0,
      ethics: studentData.characterTraits?.ethics ?? 0,
    },
    academicHistory: (studentData.academicHistory || []).map((h) => ({
      year: h.year,
      term: h.term,
      subjects: (h.subjects || []).map((s) => ({
        name: s.name || s.subject || s.subj,
        score: s.score ?? s.totalScore ?? 0,
        grade: s.grade || '—',
      })),
    })),
    wassceResults: studentData.wassceResults || [],
    terminalResults: (studentData.terminalResults || []).map(r => ({
      ...r,
      sbaScore: r.sbaScore ?? r.caScore ?? 0,
    })),
    sessionInfo: {
      year: studentData.yearForm || '—',
      term: studentData.semester || '—',
      examDate: studentData.terminalExamDate || '—',
    },
  };

  // Select appropriate structured metadata object prior to running print components
  const activePrintPayload = singlePrintData || globalTranscriptDataset;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 md:p-8 print:bg-surface print:p-0 no-scrollbar">
      <div className="w-full max-w-5xl mx-auto print:hidden space-y-4 sm:space-y-6 no-scrollbar">
        
        {/* Core Subcomponent Portal Header */}
        <StudentPortalHeader 
          onPrint={handleDownloadReport}
          selectedReportType={selectedReportType}
          onReportTypeChange={(e) => setSelectedReportType(e.target.value)}
        />

        {/* Tab Content Display Area Panels */}
        <main className="w-full focus:outline-none">
          {activeTab === 'overview' && (
            <OverviewPanel 
              studentData={studentData} 
              approvalStatus={studentData.approvalStatus}
              coreResults={(studentData.terminalResults || []).filter(r => 
                ['Core Mathematics', 'English Language', 'Integrated Science', 'Social Studies'].includes(r.subject)
              )}
              technicalResults={(studentData.terminalResults || []).filter(r => 
                !['Core Mathematics', 'English Language', 'Integrated Science', 'Social Studies'].includes(r.subject)
              )}
              behaviorRating={studentData.behavioralLogs?.reduce((avg, l) => avg + l.rating, 0) / (studentData.behavioralLogs?.length || 1) || 0}
              behaviorRemark={studentData.behaviorComments}
            />
          )}
          {activeTab === 'academic' && <AcademicPanel studentData={studentData} />}
          {activeTab === 'interventions' && <InterventionsPanel notifications={notifications} studentData={studentData} />}
          {activeTab === 'history' && <HistoryPanel studentData={studentData} onDownloadHistory={handleHistoryDownloadRequest} />}
          {activeTab === 'gradingScale' && <GradingScalePanel />}
          {activeTab === 'academicJourney' && <AcademicJourneyPanel studentData={studentData} />}
          {activeTab === 'broadsheetComparison' && <BroadsheetComparisonPanel studentData={studentData} />}
        </main>
      </div>

      {/* Print View Mode Engine Template Core */}
      <div className="hidden print:block w-full">
        {selectedReportType === 'transcript' && !singlePrintData ? (
          <TranscriptPrintTemplate data={activePrintPayload} />
        ) : (
          <TerminalPrintTemplate data={activePrintPayload} />
        )}
      </div>

      {/* Mobile Print Confirmation Modal */}
      {showPrintConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 sm:hidden">
          <div className="bg-surface rounded-2xl p-5 mx-4 w-full max-w-sm">
            <h3 className="text-sm font-black text-text-primary mb-2">View or Download?</h3>
            <p className="text-xs text-text-secondary mb-4">How would you like to access this result?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPrintConfirm(false)}
                className="flex-1 px-3 py-2 bg-background text-text-primary border border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPrintConfirm(false);
                  triggerHistoryPrint(pendingHistoryItem);
                }}
                className="flex-1 px-3 py-2 bg-brand-primary text-surface rounded-lg text-[10px] font-black uppercase tracking-wider"
              >
                View PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPortal;