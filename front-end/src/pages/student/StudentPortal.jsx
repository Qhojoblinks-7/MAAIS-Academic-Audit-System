import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthToken } from '../../services/auth';

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

const VALID_TABS = ['overview', 'academic', 'interventions', 'history', 'gradingScale', 'academicJourney', 'broadsheetComparison'];

export function StudentPortal({ 
    studentPortalMockData = {},
    useApi = true,
  }) {
  const { user } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = React.useState(() => {
    const hash = location.hash.replace('#', '') || 'overview';
    console.log('[StudentPortal] [Lifecycle] Initializing activeTab state. Hash derived:', hash);
    return VALID_TABS.includes(hash) ? hash : 'overview';
  });

  const [studentData, setStudentData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [notifications, setNotifications] = React.useState([]);
  const [selectedReportType, setSelectedReportType] = React.useState('transcript');
  
  const [singlePrintData, setSinglePrintData] = React.useState(null);
  const [showPrintConfirm, setShowPrintConfirm] = React.useState(false);
  const [pendingHistoryItem, setPendingHistoryItem] = React.useState(null);

  // Sync activeTab with URL hash changes smoothly
  React.useEffect(() => {
    const hash = location.hash.replace('#', '') || 'overview';
    console.log('[StudentPortal] [Effect] URL Hash change detected:', location.hash, 'Calculated Tab:', hash);
    if (VALID_TABS.includes(hash) && hash !== activeTab) {
      console.log('[StudentPortal] [State Shift] Updating activeTab to:', hash);
      setActiveTab(hash);
    }
  }, [location.hash, activeTab]);

  // Clean layout context parameters safely when switching user state variables
  React.useEffect(() => {
    console.log('[StudentPortal] [Effect] user.id change detected or initialization occurring. User ID:', user?.id);
    setStudentData(null);
    setError('');
    setNotifications([]);
    setLoading(true);
  }, [user?.id]);

  // Stable pure transformer helper configuration
  const transformApiResponse = React.useCallback((apiData) => {
    console.log('[StudentPortal] [Transformer] Transforming API response payload:', apiData);
    if (!apiData) {
      console.warn('[StudentPortal] [Transformer] Received null or undefined apiData.');
      return null;
    }
    const normalizeTermLabel = (term) => {
      const value = String(term || '').trim();
      if (!value) return '—';

      const upperValue = value.toUpperCase();
      const numericMatch = value.match(/\d+/);

      if (upperValue.startsWith('TERM_')) {
        return numericMatch ? `Term ${numericMatch[0]}` : '—';
      }

      if (upperValue.includes('TERM')) {
        return numericMatch ? `Term ${numericMatch[0]}` : value;
      }

      if (numericMatch) return `Term ${numericMatch[0]}`;

      return value;
    };

    const normalizeYearLabel = (year) => {
      const value = String(year || '').trim();
      return value ? value.replace('/', '-') : '—';
    };

    const normalizeSubject = (subject) => ({
      name: subject?.name || subject?.subject || subject?.subj || 'Unknown',
      score: subject?.score ?? subject?.totalScore ?? 0,
      grade: subject?.grade || '-',
    });

    const rawYearForm = apiData.yearForm || apiData.academicYearLabel || '—';
    const rawSemester = apiData.semester || apiData.termLabel;
    const normalizedSemester = normalizeTermLabel(rawSemester);
    const history = Array.isArray(apiData.academicHistory) ? apiData.academicHistory : [];
    const academicHistory = history.map(term => ({
      ...term,
      year: normalizeYearLabel(term?.year || term?.yearLabel || rawYearForm),
      term: normalizeTermLabel(term?.term),
      subjects: Array.isArray(term?.subjects) ? term.subjects.map(normalizeSubject) : [],
      approvalStatus: term?.approvalStatus || apiData.approvalStatus,
    }));

    const latestHistoryYear = academicHistory.length > 0
      ? academicHistory[academicHistory.length - 1].year
      : '—';
    const normalizedYearForm = normalizeYearLabel(rawYearForm) === '—'
      ? latestHistoryYear
      : normalizeYearLabel(rawYearForm);
    const terminalResults = Array.isArray(apiData.terminalResults)
      ? apiData.terminalResults
      : [
          ...(Array.isArray(apiData.coreResults) ? apiData.coreResults : []),
          ...(Array.isArray(apiData.technicalResults) ? apiData.technicalResults : []),
        ];
    const hasCurrentTerm = academicHistory.some(term =>
      normalizeYearLabel(term?.year) === normalizedYearForm && normalizeTermLabel(term?.term) === normalizedSemester
    );

    if (!hasCurrentTerm && normalizedYearForm !== '—' && normalizedSemester !== '—' && terminalResults.length > 0) {
      academicHistory.push({
        year: normalizedYearForm,
        term: normalizedSemester,
        subjects: terminalResults.map(normalizeSubject),
        approvalStatus: apiData.approvalStatus,
      });
    }

    const result = {
      ...apiData,
      yearForm: normalizedYearForm,
      semester: normalizedSemester,
      academicHistory,
      studentName: `${apiData.student?.firstName || ''} ${apiData.student?.lastName || ''}`.trim() || apiData.studentName || 'Student',
      indexNumber: apiData.student?.indexNumber || apiData.indexNumber || '—',
      program: apiData.student?.currentClass?.name || apiData.program || '—',
      attendance: apiData.attendancePercentage ?? apiData.attendance ?? 0,
      lastSeen: apiData.lastSeen ?? apiData.student?.user?.lastLoginAt ?? null,
    };
    console.log('[StudentPortal] [Transformer] Completed successfully. Formatted object output:', result);
    return result;
  }, []);

  const fetchStudentData = React.useCallback(async () => {
    console.log('[StudentPortal] [Fetch Engine] Initiated execution loop.');
    console.log('[StudentPortal] [Fetch Engine] Current Environment Context Variables -> user.id:', user?.id, '| user.role:', user?.role, '| useApi config flag:', useApi);

    if (!user?.id || user?.role !== 'STUDENT') {
      console.warn('[StudentPortal] [Fetch Engine] Halted. Guard clause failed: execution criteria unfulfilled.');
      setLoading(false);
      return;
    }

    try {
      let data;
      if (useApi) {
        const url = `/api/v1/portal/students/${user.id}/portal-data`;
        console.log('[StudentPortal] [Fetch Engine] Dispatching network request to backend resource endpoint:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        console.log('[StudentPortal] [Fetch Engine] Server connection established. HTTP Response Code Status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch student portal data: ${response.status}`);
        }
        data = await response.json();
        console.log('[StudentPortal] [Fetch Engine] Successfully parsed API response JSON string content data.');
      } else {
        console.log('[StudentPortal] [Fetch Engine] useApi is false. Stepping back down to mock data configurations.');
        const allStudents = Array.isArray(studentPortalMockData?.students)
          ? studentPortalMockData.students
          : [];

        const usernameDigits = String(user.username ?? user.id).replace(/\D/g, '');
        const userIndexDigits = usernameDigits.padStart(3, '0');
        const expectedStudId = `stud${userIndexDigits}`;

        console.log('[StudentPortal] [Fetch Engine] Scanning mock manifest array metrics for matches using ID parsing algorithms. Computed values:', { usernameDigits, userIndexDigits, expectedStudId });

        data =
          allStudents.find((s) => s.id === user.id) ||
          allStudents.find((s) => s.id === expectedStudId) ||
          allStudents.find((s) => String(s.indexNumber).padStart(3, '0') === userIndexDigits);

        if (!data) {
          throw new Error(`No student portal record found for credentials provided.`);
        }
        console.log('[StudentPortal] [Fetch Engine] Local structural match discovered inside mock arrays.');
      }

      if (!data) {
        throw new Error('No data returned from portal context templates.');
      }

      const transformed = useApi ? transformApiResponse(data) : data;

      console.log('[StudentPortal] [Fetch Engine] Storing structural variables inside application hook state sets:', transformed);
      setStudentData(transformed);
      setNotifications(Array.isArray(transformed?.notifications) ? transformed.notifications : []);
      setError('');
    } catch (e) {
      console.error('[StudentPortal] [Fetch Engine] Runtime failure encountered during loop cycle processing:', e);
      setError(e.message || 'Failed to load student data');
    } finally {
      console.log('[StudentPortal] [Fetch Engine] Exiting execution cycle scope blocks. Dropping loading flags to false.');
      setLoading(false);
    }
  }, [user?.id, user?.role, useApi, transformApiResponse]);

  React.useEffect(() => {
    console.log('[StudentPortal] [Effect] Mount loop execution layer triggering dispatch routines.');
    fetchStudentData();
  }, [fetchStudentData]);

  const handleDownloadReport = () => {
    console.log('[StudentPortal] [Action Trigger] Global printing session configuration initiated.');
    setSinglePrintData(null);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const handleHistoryDownloadRequest = (item) => {
    console.log('[StudentPortal] [Action Trigger] Print requested for specific historical sheet reference:', item);
    if (window.innerWidth < 640) {
      console.log('[StudentPortal] [Action Trigger] Screen dimensions register smaller than 640px. Displaying confirmation dialog layout layer.');
      setPendingHistoryItem(item);
      setShowPrintConfirm(true);
    } else {
      triggerHistoryPrint(item);
    }
  };

  const triggerHistoryPrint = (item) => {
    console.log('[StudentPortal] [Action Trigger] Structuring specific historical printing matrix data payloads for targeted item:', item);
    const historyItem = studentData?.academicHistory?.find(
      h => h.year === item.year && h.term === item.term
    ) || item;

    const formattedPrintPayload = {
      studentName: studentData?.studentName || user?.name || 'Student',
      indexNumber: studentData?.indexNumber || '—',
      dateOfBirth: studentData?.dateOfBirth || '—',
      gender: studentData?.gender || '—',
      program: studentData?.programName || studentData?.program || '—',
      learningArea: studentData?.learningArea || '—',
      yearForm: historyItem?.year || '—',
      semester: historyItem?.term || '—',
      enrollmentDate: studentData?.enrollmentDate || '—',
      completionDate: studentData?.completionDate || '—',
      house: studentData?.house || '—',
      sbaScore: studentData?.sbaScore || 0,
      waecExamScore: studentData?.waecExamScore || 0,
      finalScore: studentData?.finalScore || 0,
      grade: studentData?.grade || '—',
      gpaPerTerm: studentData?.gpaPerTerm || 0,
      cgpa: studentData?.cgpa || 0,
      approvalStatus: historyItem?.approvalStatus || studentData?.approvalStatus || '—',
      qualitativeAssessment: {
        characterQualities: studentData?.characterTraits?.characterQualities ?? 0,
        leadership: studentData?.characterTraits?.leadership ?? 0,
        discipline: studentData?.characterTraits?.discipline ?? 0,
        teamwork: studentData?.characterTraits?.teamwork ?? 0,
        ethics: studentData?.characterTraits?.ethics ?? 0,
      },
      academicHistory: [{
        year: historyItem?.year,
        term: historyItem?.term,
        subjects: historyItem?.subjects || [],
        approvalStatus: historyItem?.approvalStatus
      }],
      wassceResults: studentData?.wassceResults || [],
      sessionInfo: {
        year: historyItem?.year || '—',
        term: historyItem?.term || '—',
        examDate: studentData?.terminalExamDate || '—',
      },
    };

    console.log('[StudentPortal] [Action Trigger] Serializing localized single print object payload target:', formattedPrintPayload);
    setSinglePrintData(formattedPrintPayload);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  console.log('[StudentPortal] [Render Node Check] Current Component Variables Map state check -> loading:', loading, '| error state content:', error, '| studentData available status:', !!studentData);

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
    console.warn('[StudentPortal] [Render Node Failure Route] Rendering full error overlay UI context elements.');
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

  const activePrintPayload = singlePrintData || globalTranscriptDataset;
  console.log('[StudentPortal] [Render Node Success Route] Mounting structural markup tree view boards. Tab View Active Target:', activeTab);

  return (
    <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 md:p-8 print:bg-surface print:p-0 no-scrollbar">
      <div className="w-full max-w-5xl mx-auto print:hidden space-y-4 sm:space-y-6 no-scrollbar">
        
        <StudentPortalHeader 
          onPrint={handleDownloadReport}
          selectedReportType={selectedReportType}
          onReportTypeChange={(e) => setSelectedReportType(e.target.value)}
        />

        <main className="w-full focus:outline-none">
          {activeTab === 'overview' && (
            <OverviewPanel 
              studentData={studentData} 
              approvalStatus={studentData.approvalStatus}
              coreResults={studentData.coreResults || (studentData.terminalResults || []).filter(r => 
                ['Core Mathematics', 'English Language', 'Integrated Science', 'Social Studies'].includes(r.subject)
              )}
              technicalResults={studentData.technicalResults || (studentData.terminalResults || []).filter(r => 
                !['Core Mathematics', 'English Language', 'Integrated Science', 'Social Studies'].includes(r.subject)
              )}
              behaviorRating={studentData.behaviorRating ?? ((studentData.behavioralLogs?.reduce((avg, l) => avg + l.rating, 0) / (studentData.behavioralLogs?.length || 1)) || 0)}
              behaviorRemark={studentData.behaviorComments}
            />
          )}
          {activeTab === 'academic' && <AcademicPanel studentData={studentData} />}
          {activeTab === 'interventions' && <InterventionsPanel notifications={[...(notifications || []), ...(studentData?.activeInterventions || [])]} studentData={studentData} />}
          {activeTab === 'history' && <HistoryPanel studentData={studentData} onDownloadHistory={handleHistoryDownloadRequest} />}
          {activeTab === 'gradingScale' && <GradingScalePanel />}
          {activeTab === 'academicJourney' && <AcademicJourneyPanel studentData={studentData} />}
          {activeTab === 'broadsheetComparison' && <BroadsheetComparisonPanel studentData={studentData} />}
        </main>
      </div>

      <div className="hidden print:block w-full">
        {selectedReportType === 'transcript' && !singlePrintData ? (
          <TranscriptPrintTemplate data={activePrintPayload} />
        ) : (
          <TerminalPrintTemplate data={activePrintPayload} />
        )}
      </div>

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