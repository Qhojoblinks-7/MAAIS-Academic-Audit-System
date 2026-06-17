import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { studentApi } from '../../services/api/studentApi';
import { useStudentPortalData } from '../../hooks/api/useStudentApi';

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

export function StudentPortal() {
  const { user } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  const studentId = user?.id || '';
  const username = user?.username;
  const userName = user?.name;

  console.log('[StudentPortal] Initializing context:', { studentId, username, userName, currentHash: location.hash });

  const { data: studentData, loading, error: portalError } = useStudentPortalData(studentId);

  const [activeTab, setActiveTab] = React.useState(() => {
    const hash = location.hash.replace('#', '') || 'overview';
    const fallback = VALID_TABS.includes(hash) ? hash : 'overview';
    console.log('[StudentPortal] State init activeTab from hash:', { hash, fallback });
    return fallback;
  });

  const [selectedReportType, setSelectedReportType] = React.useState('transcript');
  const [singlePrintData, setSinglePrintData] = React.useState(null);
  const [showPrintConfirm, setShowPrintConfirm] = React.useState(false);
  const [pendingHistoryItem, setPendingHistoryItem] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);

  // Sync tab layout with window location hash changes
  React.useEffect(() => {
    const hash = location.hash.replace('#', '') || 'overview';
    console.log('[StudentPortal] useEffect [location.hash]:', { hash, activeTab });
    if (VALID_TABS.includes(hash) && hash !== activeTab) {
      console.log(`[StudentPortal] Updating activeTab state to match hash: "${hash}"`);
      setActiveTab(hash);
    } else if (!VALID_TABS.includes(hash)) {
      console.log(`[StudentPortal] Invalid hash detected ("${hash}"). Defaulting view state to "overview"`);
      setActiveTab('overview');
    }
  }, [location.hash, activeTab]);

  // Sync incoming notifications
  React.useEffect(() => {
    if (Array.isArray(studentData?.notifications)) {
      console.log('[StudentPortal] Syncing notifications array:', studentData.notifications);
      setNotifications(studentData.notifications);
    }
  }, [studentData?.notifications]);

  // Data normalization logic
  const transformApiResponse = React.useCallback((apiData) => {
    if (!apiData) {
      console.warn('[StudentPortal] transformApiResponse encountered empty/null apiData.');
      return null;
    }

    console.log('[StudentPortal] transformApiResponse executing on raw studentData:', apiData);

    const normalizeTermLabel = (term) => {
      const value = String(term || '').trim();
      if (!value) return '—';
      const upperValue = value.toUpperCase();
      const numericMatch = value.match(/\d+/);

      if (upperValue.startsWith('TERM_')) return numericMatch ? `Term ${numericMatch[0]}` : '—';
      if (upperValue.includes('TERM')) return numericMatch ? `Term ${numericMatch[0]}` : value;
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
    const history = Array.isArray(apiData.academicHistory) ? apiData.academicHistory : [];

    const academicHistory = history.map((term, index) => {
      const parsedYear = normalizeYearLabel(term?.year || term?.yearLabel || rawYearForm);
      const parsedTerm = normalizeTermLabel(term?.term);
      return {
        ...term,
        year: parsedYear,
        term: parsedTerm,
        subjects: Array.isArray(term?.subjects) ? term.subjects.map(normalizeSubject) : [],
        approvalStatus: term?.approvalStatus || apiData.approvalStatus,
      };
    });

    const latestHistoryTerm = academicHistory.length > 0 ? academicHistory[academicHistory.length - 1].term : null;
    const normalizedSemester = normalizeTermLabel(rawSemester) === '—' && latestHistoryTerm ? latestHistoryTerm : normalizeTermLabel(rawSemester);

    const latestHistoryYear = academicHistory.length > 0 ? academicHistory[academicHistory.length - 1].year : '—';
    const normalizedYearForm = normalizeYearLabel(rawYearForm) === '—' ? latestHistoryYear : normalizeYearLabel(rawYearForm);

    const terminalResults = Array.isArray(apiData.terminalResults)
      ? apiData.terminalResults
      : [
          ...(Array.isArray(apiData.coreResults) ? apiData.coreResults : []),
          ...(Array.isArray(apiData.technicalResults) ? apiData.technicalResults : []),
        ];

    const hasCurrentTerm = academicHistory.some((term) =>
      normalizeYearLabel(term?.year) === normalizedYearForm && normalizeTermLabel(term?.term) === normalizedSemester,
    );

    if (!hasCurrentTerm && normalizedYearForm !== '—' && normalizedSemester !== '—' && terminalResults.length > 0) {
      console.log('[StudentPortal] Injecting missing current active term info into parsed academicHistory array.');
      academicHistory.push({
        year: normalizedYearForm,
        term: normalizedSemester,
        subjects: terminalResults.map(normalizeSubject),
        approvalStatus: apiData.approvalStatus,
      });
    }

    const transformed = {
      ...apiData,
      yearForm: normalizedYearForm,
      semester: normalizedSemester,
      academicHistory,
      studentName: `${apiData.student?.firstName || ''} ${apiData.student?.lastName || ''}`.trim() || 'Student',
      indexNumber: apiData.student?.indexNumber || '—',
      program: apiData.student?.currentClass?.name || '—',
      attendance: apiData.attendancePercentage ?? apiData.attendance ?? 0,
      lastSeen: apiData.lastSeen ?? apiData.student?.user?.lastLoginAt ?? null,
    };

    console.log('[StudentPortal] transformApiResponse transformation complete result:', transformed);
    return transformed;
  }, []);

  const transformedStudentData = studentData ? transformApiResponse(studentData) : null;

  const handleDownloadReport = () => {
    console.log('[StudentPortal] Executing handleDownloadReport (Global PDF Print Workflow)', { selectedReportType });
    setSinglePrintData(null);
    setSelectedReportType('transcript');
    setTimeout(() => {
      console.log('[StudentPortal] Initializing global window browser print dialog setup');
      window.print();
    }, 50);
  };

  const handleHistoryDownloadRequest = (item) => {
    console.log('[StudentPortal] handleHistoryDownloadRequest triggered for item:', item);
    if (window.innerWidth < 640) {
      console.log('[StudentPortal] Mobile viewport identified. Postponing print confirmation modal view overlay.');
      setPendingHistoryItem(item);
      setShowPrintConfirm(true);
    } else {
      console.log('[StudentPortal] Standard desktop viewport identified. Proceeding to direct history print payload compiler.');
      triggerHistoryPrint(item);
    }
  };

  const triggerHistoryPrint = (item) => {
    console.log('[StudentPortal] Compiling explicit timeline item for print payload construction:', item);
    const historyItem = transformedStudentData?.academicHistory?.find(
      h => h.year === item.year && h.term === item.term
    ) || item;

    const formattedPrintPayload = {
      studentName: transformedStudentData?.studentName || userName || 'Student',
      indexNumber: transformedStudentData?.indexNumber || '—',
      dateOfBirth: transformedStudentData?.dateOfBirth || '—',
      gender: transformedStudentData?.gender || '—',
      program: transformedStudentData?.programName || transformedStudentData?.program || '—',
      learningArea: transformedStudentData?.learningArea || '—',
      yearForm: historyItem?.year || '—',
      semester: historyItem?.term || '—',
      enrollmentDate: transformedStudentData?.enrollmentDate || '—',
      completionDate: transformedStudentData?.completionDate || '—',
      house: transformedStudentData?.house || '—',
      sbaScore: transformedStudentData?.sbaScore || 0,
      waecExamScore: transformedStudentData?.waecExamScore || 0,
      finalScore: transformedStudentData?.finalScore || 0,
      grade: transformedStudentData?.grade || '—',
      gpaPerTerm: transformedStudentData?.gpaPerTerm || 0,
      cgpa: transformedStudentData?.cgpa || 0,
      approvalStatus: historyItem?.approvalStatus || transformedStudentData?.approvalStatus || '—',
      qualitativeAssessment: {
        characterQualities: transformedStudentData?.characterTraits?.characterQualities ?? 0,
        leadership: transformedStudentData?.characterTraits?.leadership ?? 0,
        discipline: transformedStudentData?.characterTraits?.discipline ?? 0,
        teamwork: transformedStudentData?.characterTraits?.teamwork ?? 0,
        ethics: transformedStudentData?.characterTraits?.ethics ?? 0,
      },
      academicHistory: [{
        year: historyItem?.year,
        term: historyItem?.term,
        subjects: historyItem?.subjects || [],
        approvalStatus: historyItem?.approvalStatus
      }],
      wassceResults: transformedStudentData?.wassceResults || [],
      sessionInfo: {
        year: historyItem?.year || '—',
        term: historyItem?.term || '—',
        examDate: transformedStudentData?.terminalExamDate || '—',
      },
    };

    console.log('[StudentPortal] Formatted Print Payload for Timeline History block structured:', formattedPrintPayload);
    setSinglePrintData(formattedPrintPayload);
    setTimeout(() => {
      console.log('[StudentPortal] Triggering individual specific target terminal result printing.');
      window.print();
    }, 150);
  };

  if (loading) {
    console.log('[StudentPortal] Rendering: Loading state');
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

  if (!transformedStudentData || portalError) {
    console.error('[StudentPortal] Rendering: Error or Missing Profile context match execution logs:', { portalError, transformedStudentData });
    return (
      <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-full max-w-md bg-surface border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm text-center mx-auto">
          <AlertTriangle className="mx-auto text-warning mb-2" size={24} />
          <p className="text-sm font-bold text-text-primary">{portalError || 'No profile context matches found.'}</p>
          <p className="text-[11px] text-text-secondary mt-1">Please reach out to administration if this condition persists.</p>
        </div>
      </div>
    );
  }

  // Generate fallback base package structural layout mapping
  const globalTranscriptDataset = {
    studentName: transformedStudentData.studentName || userName || 'Student',
    indexNumber: transformedStudentData.indexNumber || '—',
    dateOfBirth: transformedStudentData.dateOfBirth || '—',
    gender: transformedStudentData.gender || '—',
    program: transformedStudentData.programName || transformedStudentData.program || '—',
    learningArea: transformedStudentData.learningArea || '—',
    yearForm: transformedStudentData.yearForm || '—',
    semester: transformedStudentData.semester || '—',
    enrollmentDate: transformedStudentData.enrollmentDate || '—',
    completionDate: transformedStudentData.completionDate || '—',
    house: transformedStudentData.house || '—',
    sbaScore: transformedStudentData.sbaScore || 0,
    waecExamScore: transformedStudentData.waecExamScore || 0,
    finalScore: transformedStudentData.finalScore || 0,
    grade: transformedStudentData.grade || '—',
    gpaPerTerm: transformedStudentData.gpaPerTerm || 0,
    cgpa: transformedStudentData.cgpa || 0,
    approvalStatus: transformedStudentData.approvalStatus || '—',
    qualitativeAssessment: {
      characterQualities: transformedStudentData.characterTraits?.characterQualities ?? 0,
      leadership: transformedStudentData.characterTraits?.leadership ?? 0,
      discipline: transformedStudentData.characterTraits?.discipline ?? 0,
      teamwork: transformedStudentData.characterTraits?.teamwork ?? 0,
      ethics: transformedStudentData.characterTraits?.ethics ?? 0,
    },
    academicHistory: (transformedStudentData.academicHistory || []).map((h) => ({
      year: h.year,
      term: h.term,
      subjects: (h.subjects || []).map((s) => ({
        name: s.name || s.subject || s.subj,
        score: s.score ?? s.totalScore ?? 0,
        grade: s.grade || '—',
      })),
    })),
    wassceResults: transformedStudentData.wassceResults || [],
    terminalResults: (transformedStudentData.terminalResults || []).map(r => ({
      ...r,
      sbaScore: r.sbaScore ?? r.caScore ?? 0,
    })),
    sessionInfo: {
      year: transformedStudentData.yearForm || '—',
      term: transformedStudentData.semester || '—',
      examDate: transformedStudentData.terminalExamDate || '—',
    },
  };

  const activePrintPayload = singlePrintData || globalTranscriptDataset;
  console.log('[StudentPortal] Rendering Layout details.', { activeTab, displayingPrintPayload: !!singlePrintData ? 'Single Row context' : 'Global Dataset context' });

  return (
    <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 md:p-8 print:bg-surface print:p-0 no-scrollbar">
      <div className="w-full max-w-5xl mx-auto print:hidden space-y-4 sm:space-y-6 no-scrollbar">

        <StudentPortalHeader
          onPrint={handleDownloadReport}
          selectedReportType={selectedReportType}
          onReportTypeChange={(e) => {
            console.log('[StudentPortal] Report type configuration updated:', e.target.value);
            setSelectedReportType(e.target.value);
          }}
        />

        <main className="w-full focus:outline-none">
          {activeTab === 'overview' && (
            <OverviewPanel
              studentData={transformedStudentData}
              approvalStatus={transformedStudentData.approvalStatus}
              coreResults={transformedStudentData.coreResults || (transformedStudentData.terminalResults || []).filter(r =>
                ['Core Mathematics', 'English Language', 'Integrated Science', 'Social Studies'].includes(r.subject)
              )}
              technicalResults={transformedStudentData.technicalResults || (transformedStudentData.terminalResults || []).filter(r =>
                !['Core Mathematics', 'English Language', 'Integrated Science', 'Social Studies'].includes(r.subject)
              )}
              behaviorRating={transformedStudentData.behaviorRating ?? ((transformedStudentData.behavioralLogs?.reduce((avg, l) => avg + l.rating, 0) / (transformedStudentData.behavioralLogs?.length || 1)) || 0)}
              behaviorRemark={transformedStudentData.behaviorComments}
            />
          )}
          {activeTab === 'academic' && <AcademicPanel studentData={transformedStudentData} />}
          {activeTab === 'interventions' && <InterventionsPanel notifications={[...(notifications || []), ...(transformedStudentData?.activeInterventions || [])]} studentData={transformedStudentData} />}
          {activeTab === 'history' && <HistoryPanel studentData={transformedStudentData} onDownloadHistory={handleHistoryDownloadRequest} />}
          {activeTab === 'gradingScale' && <GradingScalePanel />}
          {activeTab === 'academicJourney' && <AcademicJourneyPanel studentData={transformedStudentData} />}
          {activeTab === 'broadsheetComparison' && <BroadsheetComparisonPanel studentData={transformedStudentData} />}
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
                onClick={() => {
                  console.log('[StudentPortal] Print modal execution dismissed by user request');
                  setShowPrintConfirm(false);
                }}
                className="flex-1 px-3 py-2 bg-background text-text-primary border border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('[StudentPortal] Print modal execution confirmed by mobile layout view confirmation trigger.');
                  setShowPrintConfirm(false);
                  triggerHistoryPrint(pendingHistoryItem);
                }}
                className="flex-1 px-3 py-2 bg-brand-primary text-surface rounded-lg text-[10px] font-black uppercase tracking-widest"
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