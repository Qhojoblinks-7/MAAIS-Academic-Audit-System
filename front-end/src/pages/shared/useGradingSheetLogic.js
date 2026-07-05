import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useUI } from '../../context/UIContext';
import {
  GRADE_SCALE,
  DEFAULT_SUBJECT_CONFIG,
  DEFAULT_CLASS_INFO,
  DEFAULT_STP_RULES,
  getSectionFieldName,
  calcRoman,
  getSubjectCode,
  splitName,
} from '../../constants/grading';
import { notification } from '../../services/notificationService';
import { toast } from '../../components/ui/toast';
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
  targetStudentName: targetStudentNameProp,
  targetStudentIndex: targetStudentIndexProp,
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
    console.log('[useGradingSheetLogic] targetStudentIdProp changed:', targetStudentIdProp, 'students count:', students.length);
    if (targetStudentIdProp) {
      const found = students.find(s => s.id === targetStudentIdProp);
      if (found) {
        setSelectedStudent(found);
      } else if (students.length === 0) {
        const syntheticStudent = {
          id: targetStudentIdProp,
          name: targetStudentNameProp || 'Selected Student',
          index: targetStudentIndexProp || '',
          auditStatus: 'MISSING',
          sba: 0,
          exam: 0,
          final: 0,
          grade: '',
          remark: '',
          gradeEntryId: null,
        };
        console.log('[useGradingSheetLogic] creating synthetic student for sidebar:', syntheticStudent);
        setSelectedStudent(syntheticStudent);
      } else {
        console.log('[useGradingSheetLogic] falling back to first student:', students[0] ? { id: students[0].id, name: students[0].name } : 'NO STUDENTS');
        setSelectedStudent(students[0]);
      }
    }
  }, [targetStudentIdProp, students, targetStudentNameProp]);

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
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionText, setRevisionText] = useState('');
  const [revisionSubmitting, setRevisionSubmitting] = useState(false);

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

  // ── Business logic ───────────────────────────────────────────────────────────
  const mapStudentToBackendEntry = useCallback(
    (student) => {
      const entry = {
        studentId: student.id,
        subjectId: backendIds?.subjectId,
        termId: backendIds?.termId,
        remark: student.remark || '',
      };
      const sba = parseFloat(student.sba);
      const exam = parseFloat(student.exam);
      if (!isNaN(sba)) entry.classScore = sba;
      if (!isNaN(exam)) entry.examScore = exam;
      return entry;
    },
    [backendIds],
  );

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

  // ── Autosave effect ────────────────────────────────────────────────────────
  const [autosaveStatus, setAutosaveStatus] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [stpValidating, setStpValidating] = useState(false);
  const autosaveTimerRef = useRef(null);
  const autosaveMountedRef = useRef(false);

  useEffect(() => {
    if (!autosaveMountedRef.current) {
      autosaveMountedRef.current = true;
      return;
    }
    if (!backendReady || !students?.length) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    setAutosaveStatus('saving');
    autosaveTimerRef.current = setTimeout(async () => {
      try {
        await persistGradesToBackend(students);
        setAutosaveStatus('saved');
        setLastSavedAt(new Date());
        toast.success('Saved');
        setTimeout(() => setAutosaveStatus('idle'), 2000);
      } catch (e) {
        setAutosaveStatus('error');
        toast.error('Auto-save failed: ' + (e.message || 'Unknown error'));
      }
    }, 1000);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [students, backendReady, persistGradesToBackend]);

  // ── 5-minute bulk draft sync ────────────────────────────────────────────────
  const bulkIntervalRef = useRef(null);

  useEffect(() => {
    if (!backendReady || !students?.length) return;

    bulkIntervalRef.current = setInterval(async () => {
      try {
        await persistGradesToBackend(students);
        toast.success('Bulk draft submitted');
      } catch (e) {
        console.error('Bulk draft submission failed:', e);
      }
    }, 300000);

    return () => {
      if (bulkIntervalRef.current) clearInterval(bulkIntervalRef.current);
    };
  }, [students, backendReady, persistGradesToBackend]);

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
    if (stpValidating) return;
    setStpValidating(true);
    setShowSTPOverlay(true);

    const runCheck = async () => {
      try {
        if (backendReady) {
          await persistGradesToBackend(students);
        }
        const errors = stpRules
          .filter(rule => students.some(s => rule.check?.(s)))
          .map(rule => rule.message);
        if (isTermFinalized) errors.push('CRITICAL: Term Finalized. Database records are locked.');
        setStpErrors(errors);

        if (errors.length === 0) {
          toast.success('STP validation passed — no compliance issues found');
        } else {
          toast.error(`STP validation found ${errors.length} issue${errors.length !== 1 ? 's' : ''}`);
        }
      } catch (e) {
        setStpErrors([]);
        toast.error('STP validation failed: ' + (e.message || 'Unknown error'));
      } finally {
        setStpValidating(false);
      }
    };

runCheck();
  }, [stpRules, students, isTermFinalized, backendReady, persistGradesToBackend, stpValidating]);

  const handleSaveDraft = useCallback(() => {
    if (isTermFinalized) return;
    setSubmissionStatus('DRAFT');
    setStudents(prev => prev.map(s => ({ ...s, _draftStatus: 'DRAFT' })));
    if (!backendReady) {
      toast.info('Saving locally — backend IDs still resolving');
      return;
    }
    persistGradesToBackend(students)
      .then(() => {
        toast.success('Draft saved successfully');
      })
      .catch((err) => {
        console.error('[GradingSheet] draft persistence failed:', err);
        setSubmissionStatus('ERROR');
        toast.error('Failed to save draft');
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
        toast.success('Bulk draft submitted');
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
        toast.error('Failed to submit to HOD');
      });
  }, [isTermFinalized, missingCount, teacherId, classInfo, students, backendReady, persistGradesToBackend, notification, toast]);

  const handleRequestRevision = useCallback(() => {
    if (isTermFinalized) return;
    if (!selectedStudent?.gradeEntryId) {
      toast.error('Please select a student first to request a grade revision.');
      return;
    }
    setShowRevisionModal(true);
    setRevisionText('');
  }, [isTermFinalized, selectedStudent, toast]);

  const doRequestRevision = useCallback(async () => {
    if (!selectedStudent?.gradeEntryId || !revisionText.trim()) return;
    setRevisionSubmitting(true);
    try {
      await teacherService.submitGradeRevision({
        gradeEntryId: selectedStudent.gradeEntryId,
        issue: revisionText.trim(),
        severity: 'medium',
      });
      notification.sendHODAlert(
        teacherId,
        'GRADE_REVISION_REQUESTED',
        {
          classId: classInfo.id,
          subject: classInfo.subject,
          className: classInfo.className,
          student: selectedStudent.name,
          timestamp: new Date().toISOString(),
        }
      ).catch(err => {
        console.error('Failed to send HOD alert for grade revision request:', err);
      });
      setShowRevisionModal(false);
      setRevisionText('');
      toast.success('Grade revision requested successfully');
    } catch (e) {
      toast.error(e.message || 'Failed to request grade revision');
    } finally {
      setRevisionSubmitting(false);
    }
  }, [selectedStudent, revisionText, teacherId, classInfo, notification, toast]);

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
        toast.success('Behavioral ratings saved');
      })
      .catch(err => {
        console.error('[WAEC STP §7] Failed to save behavioral ratings:', err);
        toast.error('Failed to save behavioral ratings');
      });
  }, [isTermFinalized, selectedStudent, behavioralRatings, behavioralComment, backendReady, teacherService, toast]);

  const handleExportWAEC = useCallback(() => {
    if (isTermFinalized || missingCount > 0 || isSubmissionLocked) return;
    
    const headers = [
      'CandidateNumber',
      'Surname',
      'OtherNames',
      'DateOfBirth',
      'Gender',
      'SubjectCode',
      'ContinuousAssessment',
      'ExamScore'
    ];
    
    const subjectCode = getSubjectCode(DISPLAY_CLASS_INFO?.subject);
    const classInfo = DISPLAY_CLASS_INFO || DEFAULT_CLASS_INFO;
    
    const rows = students.map(s => {
      const nameParts = splitName(s.name || '');
      return [
        s.index || s.indexNumber || '',
        nameParts.surname,
        nameParts.otherNames,
        s.dateOfBirth || '',
        s.gender === 'FEMALE' ? 'F' : s.gender === 'MALE' ? 'M' : '',
        subjectCode,
        s.sba ?? '',
        s.exam ?? ''
      ];
    });
    
    const csvLines = [headers, ...rows].map(r => 
      r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    );
    const csv = csvLines.join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const schoolCode = 'MAAIS';
    const fileName = `${schoolCode}_${classInfo?.form?.replace(/\s/g, '') || 'SHS1'}_${classInfo?.academicYear?.replace(/\//g, '-') || '2025-2026'}.csv`;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('WAEC STP CSV exported successfully');
  }, [isTermFinalized, missingCount, isSubmissionLocked, students, DISPLAY_CLASS_INFO, toast]);

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
    handleRequestRevision,
    doRequestRevision,
    showRevisionModal,
    setShowRevisionModal,
    revisionText,
    setRevisionText,
    revisionSubmitting,
    handleSaveBehavioralRatings,
    handleExportWAEC,
    stpValidating,
    autosaveStatus,
    lastSavedAt,
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