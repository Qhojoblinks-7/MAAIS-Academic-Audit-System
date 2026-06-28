import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useUI } from '../../context/UIContext';
import {
  GRADE_SCALE,
  DEFAULT_SUBJECT_CONFIG,
  DEFAULT_CLASS_INFO,
  DEFAULT_STP_RULES,
  getSectionFieldName,
  calcRoman,
} from '../../constants/grading';
import { notification } from '../../services/notificationService';
import { teacherService } from '../../services/teacherService';
import { gradingApi } from '../../lib/api/grading';

/**
 * useGradingSheetLogic — single custom hook owning all GradingSheet state.
 *
 * Organised into logical clusters:
 *  - Data layer   : classInfo, students, selectedStudent
 *  - Config layer: DISPLAY_CLASS_INFO (derived), isCorrectionMode, isMissingObsMode
 *  - UI layer    : sidebar, expander, popup, STP overlay, submission status
 *  - Editing layer : tempMark, fieldToUpdate, behavioral state
 *  - Business logic : calculateScores, updateMark, runSTPValidation, handlers
 *
 * Returns a flat object of all state and setters so the component is a pure
 * renderer and all mutation lives here.
 */
export function useGradingSheetLogic({
  classInfo: classInfoProp,
  students: studentsProp,
  subjectConfig: subjectConfigProp,
  stpRules: stpRulesProp,
  isTermFinalized: isTermFinalizedProp,
  isCorrectionMode: isCorrectionModeProp = false,
  isMissingObsMode: isMissingObsModeProp = false,
  revisionId: revisionIdProp,
  targetStudentId: targetStudentIdProp,
  missingObsId: missingObsIdProp,
  teacherId: teacherIdProp = null,
}) {
  const { isTermFinalized: ctxTermFinalized } = useUI();

  // ── Resolved inputs ────────────────────────────────────────────────────────
  const isTermFinalized = isTermFinalizedProp ?? ctxTermFinalized ?? false;
  const classInfo = classInfoProp || DEFAULT_CLASS_INFO;
  const subjectConfigData = subjectConfigProp || {};
  const stpRules = stpRulesProp || DEFAULT_STP_RULES;
  const teacherId = teacherIdProp || null;

  // ── Derived config (memoised to prevent deep-diff churn in table body) ─────
  const DISPLAY_CLASS_INFO = useMemo(() => {
    const subject = classInfo?.subject || DEFAULT_CLASS_INFO.subject;
    const cfg = subjectConfigData[subject] || DEFAULT_SUBJECT_CONFIG;
    const activeSecs = cfg?.sections || DEFAULT_SUBJECT_CONFIG.sections;
    const secFields = activeSecs.map((s, i) => getSectionFieldName(s, i));
    return {
      ...DEFAULT_CLASS_INFO,
      ...classInfo,
      subjectConfig: cfg,
      activeSections: activeSecs,
      sectionFieldNames: secFields,
    };
  }, [classInfo, subjectConfigData]);

  const isCorrectionMode = isCorrectionModeProp || !!revisionIdProp;
  const isMissingObsMode = isMissingObsModeProp || !!missingObsIdProp;

  // ── Data state ─────────────────────────────────────────────────────────────
  const [students, setStudents] = useState(() => studentsProp || []);
  const [selectedStudent, setSelectedStudent] = useState(() => {
    if (targetStudentIdProp && studentsProp?.length) {
      return studentsProp.find(s => s.id === targetStudentIdProp) || studentsProp[0] || null;
    }
    return studentsProp?.[0] || null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auto-select first MISSING student and open sidebar in missing-obs mode
  useEffect(() => {
    if (isMissingObsMode && !targetStudentIdProp && students.length > 0) {
      const missingStudent = students.find(s => s.auditStatus === 'MISSING');
      if (missingStudent) {
        setSelectedStudent(missingStudent);
        setIsSidebarOpen(true);
      }
    }
    if (isCorrectionMode) {
      setIsSidebarOpen(true);
    }
  }, [isMissingObsMode, isCorrectionMode, targetStudentIdProp, students]);

  // Sync when container supplies new students (class switch / API refetch)
  useEffect(() => {
    if (studentsProp === undefined) return;
    setStudents(studentsProp);
    setSelectedStudent(prev => {
      if (!prev) return studentsProp[0] || null;
      const still = studentsProp.find(s => s.id === prev.id);
      return still || studentsProp[0] || null;
    });
  }, [studentsProp]);

  // Pre-select when external target arrives
  useEffect(() => {
    if (targetStudentIdProp && students.length > 0) {
      const found = students.find(s => s.id === targetStudentIdProp);
      if (found) setSelectedStudent(found);
    }
  }, [targetStudentIdProp, students]);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [submissionStatus, setSubmissionStatus] = useState('DRAFT');
  const [isExamExpanded, setIsExamExpanded] = useState(!!revisionIdProp);
  const [tempMark, setTempMark] = useState('');
  const [showSTPOverlay, setShowSTPOverlay] = useState(false);
  const [stpErrors, setStpErrors] = useState([]);
  const [justification, setJustification] = useState('');
  const [showJustificationPopup, setShowJustificationPopup] = useState(false);
  const [fieldToUpdate, setFieldToUpdate] = useState(null);
  const [studentToUpdate, setStudentToUpdate] = useState(null);
  const [valueToUpdate, setValueToUpdate] = useState(null);
  const [originalMark, setOriginalMark] = useState(null);

  // WAEC STP §7 — behavioural observation per-student maps
  const [behavioralRatings, setBehavioralRatings] = useState({});
  const [behavioralComment, setBehavioralComment] = useState({});
  const [flaggedStudents, setFlaggedStudents] = useState({});
  const [labSafetyCompliance, setLabSafetyCompliance] = useState({});

  // Backend ID cache — resolved once per sheet mount
  const [backendIds, setBackendIds] = useState(null);
  const [idResolutionError, setIdResolutionError] = useState(null);

  // Track pending grade corrections with justifications for audit trail sync
  const pendingCorrections = useRef(new Map());

  useEffect(() => {
    let cancelled = false;
    const clearIds = () => {
      if (!cancelled) {
        setBackendIds(null);
        setIdResolutionError(null);
      }
    };
    const resolveIds = async () => {
      if (!classInfo?.subject || !classInfo?.className) {
        clearIds();
        return;
      }
      try {
        const ids = await teacherService.getGradingIds(classInfo.subject, classInfo.className);
        if (cancelled) return;
        setBackendIds(ids || {});
        setIdResolutionError(null);
      } catch (err) {
        if (cancelled) return;
        console.error('[GradingSheet] failed to resolve backend IDs:', err);
        setBackendIds(null);
        setIdResolutionError(err.message || 'Unknown error');
      }
    };
    resolveIds();
    return () => { cancelled = true; };
  }, [classInfo?.subject, classInfo?.className]);

  // Fetch behavior observations from backend for all students
  useEffect(() => {
    let cancelled = false;
    const fetchBehaviors = async () => {
      if (!students.length) return;
      const ratingsMap = {};
      const commentMap = {};

      for (const student of students) {
        try {
          const data = await teacherService.getStudentBehavior(student.id);
          if (cancelled) return;
          const logs = Array.isArray(data?.logs) ? data.logs : [];
          const latest = logs[0];

          if (latest) {
            const ratings = {};
            if (latest.punctuality) ratings.lab_safety = latest.punctuality;
            if (latest.attendance) ratings.behavioral = latest.attendance;
            if (latest.attitude) ratings.resource_economy = latest.attitude;
            if (latest.conduct) ratings.hygienic_practices = latest.conduct;

            if (Object.keys(ratings).length > 0) {
              ratingsMap[student.id] = ratings;
            }
            if (latest.remarks) {
              commentMap[student.id] = latest.remarks;
            }
          }
        } catch (err) {
          console.error(`[GradingSheet] Failed to fetch behavior for ${student.id}:`, err);
        }
      }

      if (!cancelled) {
        setBehavioralRatings(prev => ({ ...prev, ...ratingsMap }));
        setBehavioralComment(prev => ({ ...prev, ...commentMap }));
      }
    };

    fetchBehaviors();
    return () => { cancelled = true; };
  }, [students, teacherService]);

  // Derived resolution readiness
  const backendReady = useMemo(
    () => !!(backendIds?.subjectId && backendIds?.classId && backendIds?.termId),
    [backendIds],
  );

  // ── Derived ─────────────────────────────────────────────────────────────────
  const missingCount = useMemo(
    () => students.filter(s => s.auditStatus === 'MISSING').length,
    [students]
  );
  const isSubmissionLocked = missingCount > 0 || isTermFinalized;

  // ── Score calculator ───────────────────────────────────────────────────────
  const calculateScores = useCallback((studentObj, fieldBeingUpdated) => {
    const s = { ...studentObj };
    const cfg = DISPLAY_CLASS_INFO?.subjectConfig || DEFAULT_SUBJECT_CONFIG;
    const secFields = DISPLAY_CLASS_INFO?.sectionFieldNames || ['secA', 'secB', 'secC'];

    if (secFields.includes(fieldBeingUpdated) && !isTermFinalized) {
      const totalRaw = secFields.reduce((sum, f) => sum + (parseFloat(s[f]) || 0), 0);
      const maxMarks = cfg.maxRaw || 100;
      s.exam = parseFloat(((totalRaw / maxMarks) * 70).toFixed(1));
    }

    const final = parseFloat(((parseFloat(s.sba) || 0) + (parseFloat(s.exam) || 0)).toFixed(1));

    let grade = 'F9';
    if (final >= 75) grade = 'A1';
    else if (final >= 70) grade = 'B2';
    else if (final >= 65) grade = 'B3';
    else if (final >= 60) grade = 'C4';
    else if (final >= 55) grade = 'C5';
    else if (final >= 50) grade = 'C6';
    else if (final >= 45) grade = 'D7';
    else if (final >= 40) grade = 'E8';

    s.final = final;
    s.grade = grade;
    s.remark = GRADE_SCALE[grade]?.label || '';
    return s;
  }, [DISPLAY_CLASS_INFO, isTermFinalized]);

  // ── Mark update with FR3 justification gate ─────────────────────────────────
  const updateMark = useCallback((studentId, field, value) => {
    if (isTermFinalized) return;

    const originalStudent = students.find(s => s.id === studentId);
    const isEdit =
      originalStudent &&
      originalStudent[field] !== undefined &&
      originalStudent[field] !== null;

    if (isEdit && !showJustificationPopup) {
      setOriginalMark(originalStudent[field]);
      setFieldToUpdate(field);
      setStudentToUpdate(studentId);
      setValueToUpdate(value);
      setShowJustificationPopup(true);
      return;
    }

    const numValue = value === '' ? '' : (parseFloat(value) || 0);
    setStudents(prev =>
      prev.map(s => s.id === studentId ? calculateScores({ ...s, [field]: numValue }, field) : s)
    );
    if (field === 'secB') setTempMark('');
  }, [isTermFinalized, students, showJustificationPopup, calculateScores]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const fieldMap = { sba: 'classScore', exam: 'examScore', remark: 'remark' };

  const handleJustificationSave = useCallback(() => {
    if (!justification.trim()) return;
    const numValue = valueToUpdate === '' ? '' : (parseFloat(valueToUpdate) || 0);
    const backendField = fieldMap[fieldToUpdate] || fieldToUpdate;

    setStudents(prev =>
      prev.map(s =>
        s.id === studentToUpdate
          ? calculateScores({ ...s, [fieldToUpdate]: numValue }, fieldToUpdate)
          : s
      )
    );

    pendingCorrections.current.set(studentToUpdate, {
      field: backendField,
      newValue: String(numValue),
      justification,
    });

    setShowJustificationPopup(false);
    setJustification('');
    setFieldToUpdate(null);
    setStudentToUpdate(null);
    setValueToUpdate(null);
    setOriginalMark(null);
    if (fieldToUpdate === 'secB') setTempMark('');
  }, [justification, valueToUpdate, studentToUpdate, fieldToUpdate, calculateScores]);

  const runSTPValidation = useCallback(() => {
    setShowSTPOverlay(true);
    const errors = stpRules
      .filter(rule => students.some(s => rule.check?.(s)))
      .map(rule => rule.message);
    if (isTermFinalized) errors.push('CRITICAL: Term Finalized. Database records are locked.');
    setStpErrors(errors);
  }, [stpRules, students, isTermFinalized]);

  const mapStudentToBackendEntry = (student) => ({
    studentId: student.id,
    subjectId: backendIds?.subjectId,
    termId: backendIds?.termId,
    classScore: parseFloat(student.sba) || 0,
    examScore: parseFloat(student.exam) || 0,
    remark: student.remark || '',
    hasObservation: !!(student.auditStatus === 'OK' || student.auditStatus === 'ACTIVE'),
    observationText: student.remark || '',
  });

  const persistGradesToBackend = useCallback(
    async (entriesPayload) => {
      if (!backendReady || !entriesPayload || entriesPayload.length === 0) return null;
      const cleaned = entriesPayload
        .map(mapStudentToBackendEntry)
        .filter((e) => e.studentId && e.subjectId && e.termId);
      if (cleaned.length === 0) return null;
      const result = await teacherService.bulkUpsertGradeEntries(cleaned);

      if (result && Array.isArray(result)) {
        const entryMap = new Map(result.map((e) => [e.studentId, e.id]));
        const corrections = Array.from(pendingCorrections.current.entries());
        if (corrections.length > 0) {
          await Promise.all(
            corrections.map(([studentId, data]) => {
              const gradeEntryId = entryMap.get(studentId);
              if (!gradeEntryId) return null;
              return gradingApi
                .correctGrade(
                  {
                    gradeEntryId,
                    fieldChanged: data.field,
                    newValue: data.newValue,
                    reason: data.justification,
                  },
                  teacherId,
                )
                .catch((err) => {
                  console.error('[GradingSheet] correction sync failed:', err);
                });
            }),
          );
          pendingCorrections.current.clear();
        }
      }

      return result;
    },
    [backendReady, backendIds, teacherService, gradingApi, teacherId],
  );

  const handleSaveDraft = useCallback(() => {
    if (isTermFinalized) return;
    setSubmissionStatus('DRAFT');
    setStudents(prev => prev.map(s => ({ ...s, _draftStatus: 'DRAFT' })));
    if (!backendReady) {
      if (idResolutionError) console.warn('[GradingSheet] backend IDs unresolved — saving in local mode');
      if (teacherId) {
        notification.sendHODAlert(
          teacherId,
          'GRADE_DRAFT_SAVED',
          {
            classId: classInfo.id,
            subject: classInfo.subject,
            className: classInfo.className,
            timestamp: new Date().toISOString(),
          }
        ).catch(err => {
          console.error('Failed to send HOD alert for grade draft:', err);
        });
      }
      return;
    }
    persistGradesToBackend(students)
      .then(() => {
        if (teacherId) {
          notification.sendHODAlert(
            teacherId,
            'GRADE_DRAFT_SAVED',
            {
              classId: classInfo.id,
              subject: classInfo.subject,
              className: classInfo.className,
              timestamp: new Date().toISOString(),
            }
          ).catch(err => {
            console.error('Failed to send HOD alert for grade draft:', err);
          });
        }
      })
      .catch((err) => {
        console.error('[GradingSheet] draft persistence failed:', err);
        setSubmissionStatus('ERROR');
      });
  }, [isTermFinalized, teacherId, classInfo, students, backendReady, idResolutionError, persistGradesToBackend, notification]);

  const handleSubmitToHOD = useCallback(() => {
    if (isTermFinalized || missingCount > 0) return;
    setSubmissionStatus('SUBMITTED');
    setStudents(prev => prev.map(s => ({ ...s, _submissionStatus: 'SUBMITTED' })));
    if (!backendReady) {
      if (teacherId) {
        notification.sendHODAlert(
          teacherId,
          'GRADE_SUBMITTED_TO_HOD',
          {
            classId: classInfo.id,
            subject: classInfo.subject,
            className: classInfo.className,
            timestamp: new Date().toISOString(),
          }
        ).catch(err => {
          console.error('Failed to send HOD alert for grade submission:', err);
        });
      }
      return;
    }
    persistGradesToBackend(students)
      .then(() => {
        if (teacherId) {
          notification.sendHODAlert(
            teacherId,
            'GRADE_SUBMITTED_TO_HOD',
            {
              classId: classInfo.id,
              subject: classInfo.subject,
              className: classInfo.className,
              timestamp: new Date().toISOString(),
            }
          ).catch(err => {
            console.error('Failed to send HOD alert for grade submission:', err);
          });
        }
      })
      .catch((err) => {
        console.error('[GradingSheet] submission persistence failed:', err);
        setSubmissionStatus('ERROR');
      });
  }, [isTermFinalized, missingCount, teacherId, classInfo, students, backendReady, persistGradesToBackend, notification]);

  const handleSaveBehavioralRatings = useCallback(() => {
    if (isTermFinalized) return;
    const sid = selectedStudent?.id;
    if (!sid || !backendReady) return;

    const ratings = behavioralRatings[sid] || {};
    const comment = behavioralComment[sid] || '';

    const behaviorData = {
      punctuality: ratings.lab_safety || 0,
      attendance: ratings.behavioral || 0,
      attitude: ratings.resource_economy || 0,
      conduct: ratings.hygienic_practices || 0,
      remarks: comment,
    };

    teacherService.createBehavior(sid, behaviorData)
      .then(() => {
        console.log('[WAEC STP §7] Behavioral ratings saved to backend:', sid);
      })
      .catch(err => {
        console.error('[WAEC STP §7] Failed to save behavioral ratings:', err);
      });
  }, [isTermFinalized, selectedStudent, behavioralRatings, behavioralComment, backendReady, teacherService]);

  const handleExportWAEC = useCallback(() => {
    if (isTermFinalized || missingCount > 0 || isSubmissionLocked) return;
    const headers = ['Index', 'Student Name', 'SBA', 'Exam', 'Final', 'Grade', 'Roman'];
    const rows = students.map(s => [
      s.index, s.name, s.sba, s.exam, s.final, s.grade, calcRoman(s.grade)
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WAEC_${DISPLAY_CLASS_INFO?.subject}_${DISPLAY_CLASS_INFO?.className}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [isTermFinalized, missingCount, isSubmissionLocked, students, DISPLAY_CLASS_INFO]);

  const handleCloseJustificationPopup = useCallback(() => {
    setShowJustificationPopup(false);
    setJustification('');
    setFieldToUpdate(null);
    setStudentToUpdate(null);
    setValueToUpdate(null);
    setOriginalMark(null);
  }, []);

  // ── Per-student behavioural setter helpers (for sidebar) ───────────────────
  const updateBehavioralRating = useCallback((catId, score) => {
    const sid = selectedStudent?.id;
    if (!sid) return;
    setBehavioralRatings(prev => ({
      ...prev,
      [sid]: { ...(prev[sid] || {}), [catId]: score }
    }));
  }, [selectedStudent]);

  const updateBehavioralComment = useCallback((val) => {
    const sid = selectedStudent?.id;
    if (!sid) return;
    setBehavioralComment(prev => ({ ...prev, [sid]: val }));
  }, [selectedStudent]);

  const updateFlagged = useCallback((flagged) => {
    const sid = selectedStudent?.id;
    if (!sid) return;
    setFlaggedStudents(prev => ({ ...prev, [sid]: flagged }));
  }, [selectedStudent]);

  const updateLabSafety = useCallback((checked) => {
    const sid = selectedStudent?.id;
    if (!sid) return;
    setLabSafetyCompliance(prev => ({ ...prev, [sid]: checked }));
  }, [selectedStudent]);

  // ── Return everything ───────────────────────────────────────────────────────
  return {
    // Data
    students, setStudents,
    selectedStudent, setSelectedStudent,
    // Config
    DISPLAY_CLASS_INFO,
    isCorrectionMode,
    isMissingObsMode,
    isTermFinalized,
    isSubmissionLocked,
    missingCount,
    // UI state
    submissionStatus, setSubmissionStatus,
    isExamExpanded, setIsExamExpanded,
    isSidebarOpen, setIsSidebarOpen,
    tempMark, setTempMark,
    showSTPOverlay, setShowSTPOverlay,
    stpErrors,
    showJustificationPopup,
    justification, setJustification,
    fieldToUpdate,
    studentToUpdate,
    originalMark,
    // Behavioural maps
    behavioralRatings, setBehavioralRatings,
    behavioralComment,
    flaggedStudents, setFlaggedStudents,
    labSafetyCompliance, setLabSafetyCompliance,
    // Logic
    calculateScores,
    updateMark,
    handleJustificationSave,
    handleCloseJustificationPopup,
    runSTPValidation,
    handleSaveDraft,
    handleSubmitToHOD,
    handleSaveBehavioralRatings,
    handleExportWAEC,
    // Backend connectivity
    backendIds,
    backendReady,
    idResolutionError,
    // Sidebar helpers
    updateBehavioralRating,
    updateBehavioralComment,
    updateFlagged,
    updateLabSafety,
  };
}