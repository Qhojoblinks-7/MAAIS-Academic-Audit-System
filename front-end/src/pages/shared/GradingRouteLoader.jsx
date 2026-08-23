import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRole } from '../../context/RoleContext';
import { useActiveYear } from '../../lib/hooks';
import { gradingService } from '../../services/gradingService';
import { teacherService } from '../../services/teacherService';
import { adminService } from '../../services/adminService';
import { SUBJECT_CONFIG } from '../../constants/subjectConfig';
import { formatFormNumber } from '../../lib/types';
import { GradingSheet } from './GradingSheet';

const subjectConfigCache = new Map();
const gradingIdsCache = new Map();

function getCacheKey(...parts) {
  return parts.filter(Boolean).join('|');
}

export default function GradingRouteLoader() {
  const { user } = useRole();
  const activeYearQuery = useActiveYear();
  const location = window.location;
  const searchParams = new URLSearchParams(location.search);

  const subjectParam = searchParams.get('subject');
  const classParam = searchParams.get('class');
  const getMissingObsId = searchParams.get('missing');
  const getTargetStudentId = searchParams.get('studentId');
  const getTargetStudentName = searchParams.get('studentName');
  const getTargetStudentIndex = searchParams.get('index');
  const isAtRisk = searchParams.get('atRisk') === 'true';

  const [gradingData, setGradingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(subjectParam || '');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [classesLoaded, setClassesLoaded] = useState(false);

  const activeTerm = activeYearQuery.data?.terms?.find(t => t.isActive);
  const isTermFinalized = activeTerm?.isLocked ?? false;
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        activeYearQuery.refetch();
      }
    }, 300000);
    return () => clearInterval(interval);
  }, [user?.id, activeYearQuery]);

  const fetchGradingIds = useCallback(async (subject, className) => {
    const cacheKey = getCacheKey(subject, className);
    if (gradingIdsCache.has(cacheKey)) {
      return gradingIdsCache.get(cacheKey);
    }
    const result = await gradingService.getGradingIds(subject, className);
    gradingIdsCache.set(cacheKey, result);
    return result;
  }, []);

  const fetchSubjectConfig = useCallback(async () => {
    if (subjectConfigCache.has('__global__')) {
      return subjectConfigCache.get('__global__');
    }
    const result = await teacherService.getSubjectConfig().catch(() => ({}));
    subjectConfigCache.set('__global__', result);
    return result;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchGradingData = async () => {
      if (!subjectParam && !classParam) {
        setLoading(false);
        return;
      }
      if (!subjectParam || !classParam) {
        setLoading(false);
        return;
      }
      try {
        const [gradingIds, subjectConfigResult] = await Promise.all([
          fetchGradingIds(subjectParam, classParam),
          fetchSubjectConfig(),
        ]);
        if (cancelled) return;

        const [students] = await Promise.all([
          gradingService.getStudentsForGrading({
            subjectId: gradingIds?.subjectId,
            classId: gradingIds?.classId,
            termId: gradingIds?.termId,
          }),
        ]);
        if (cancelled) return;

        const subjectConfigMap = { ...SUBJECT_CONFIG };
        if (Array.isArray(subjectConfigResult)) {
          subjectConfigResult.forEach((s) => {
            if (!subjectConfigMap[s.name]) {
              subjectConfigMap[s.name] = {
                sections: s.type === 'CORE' ? ['Sec A (40)', 'Sec B (60)'] : ['Practical (40)', 'Theory (60)'],
                maxRaw: 100,
                sectionCount: 2,
                hasPractical: s.type === 'ELECTIVE',
                practicalMarks: 0,
                sbaLabel: 'SBA (30%)',
                examLabel: 'Exam (70%)',
              };
            }
          });
        }

        setGradingData({
          students: students || [],
          subjectConfig: subjectConfigMap,
          subjectId: gradingIds?.subjectId,
          classId: gradingIds?.classId,
          termId: gradingIds?.termId,
        });
      } catch (err) {
        if (!cancelled) {
          console.error('[GradingRouteLoader] failed to load grading data:', err);
          setError(err.message || 'Failed to load grading data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchGradingData();
    return () => {
      cancelled = true;
    };
  }, [subjectParam, classParam, fetchGradingIds, fetchSubjectConfig]);

  useEffect(() => {
    let cancelled = false;
    const fetchClasses = async () => {
      if (!user?.id) return;
      try {
        let classes = [];
        if (isAdmin) {
          const allClasses = await adminService.getAllClasses();
          const raw = allClasses || [];
          classes = raw
            .filter((c) => c.id && (c.name || c.className))
            .map((c) => ({
              id: c.id,
              subject: c.subject?.name || c.subject || '',
              className: c.name || c.className || '',
              department: c.department?.name || c.department || 'GENERAL',
              level: c.level || c.form || '',
              studentCount: c._count?.students || c.studentCount || 0,
            }))
            .sort((a, b) => a.className.localeCompare(b.className));
        } else {
          const teacherId = user.profileId || user.id;
          classes = await teacherService.getClasses(teacherId);
        }
        if (!cancelled) {
          setTeacherClasses(classes || []);
          setClassesLoaded(true);
          if (!selectedClass && classes?.length > 0) {
            const match = classes.find(c => c.subject === subjectParam && c.className === classParam);
            if (match) {
              setSelectedClass(match);
            } else if (isAdmin && subjectParam) {
              const subjectMatch = classes.find(c => c.subject === subjectParam);
              setSelectedClass(subjectMatch || classes[0]);
            } else {
              setSelectedClass(classes[0]);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[GradingRouteLoader] failed to load classes:', err);
        }
      }
    };
    fetchClasses();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.profileId, isAdmin, subjectParam, classParam]);

  useEffect(() => {
    setSelectedSubject(subjectParam || '');
  }, [subjectParam]);

  useEffect(() => {
    if (!classParam) {
      setSelectedClass(null);
      return;
    }
    if (!teacherClasses.length) return;
    const match = teacherClasses.find(c => c.className === classParam);
    if (match) {
      setSelectedClass(match);
    }
  }, [classParam, teacherClasses]);

  useEffect(() => {
    if (!selectedClass) return;
    const currentKey = getCacheKey(selectedClass.subject, selectedClass.className);
    const cachedKey = gradingData ? getCacheKey(gradingData.classId) : null;
    if (selectedClass.id === cachedKey) return;
    if (!classesLoaded) return;

    let cancelled = false;
    const fetchStudentsForClass = async () => {
      if (!user?.id) return;
      try {
        const [gradingIds, subjectConfigResult] = await Promise.all([
          fetchGradingIds(selectedClass.subject, selectedClass.className),
          fetchSubjectConfig(),
        ]);
        if (cancelled) return;

        const [students] = await Promise.all([
          gradingService.getStudentsForGrading({
            subjectId: gradingIds?.subjectId,
            classId: gradingIds?.classId,
            termId: gradingIds?.termId,
          }),
        ]);
        if (cancelled) return;

        const subjectConfigMap = { ...SUBJECT_CONFIG };
        if (Array.isArray(subjectConfigResult)) {
          subjectConfigResult.forEach((s) => {
            if (!subjectConfigMap[s.name]) {
              subjectConfigMap[s.name] = {
                sections: s.type === 'CORE' ? ['Sec A (40)', 'Sec B (60)'] : ['Practical (40)', 'Theory (60)'],
                maxRaw: 100,
                sectionCount: 2,
                hasPractical: s.type === 'ELECTIVE',
                practicalMarks: 0,
                sbaLabel: 'SBA (30%)',
                examLabel: 'Exam (70%)',
              };
            }
          });
        }

        setGradingData({
          students: students || [],
          subjectConfig: subjectConfigMap,
          subjectId: gradingIds?.subjectId,
          classId: gradingIds?.classId,
          termId: gradingIds?.termId,
        });
      } catch (err) {
        if (!cancelled) {
          console.error('[GradingRouteLoader] failed to fetch students for class:', err);
        }
      }
    };
    fetchStudentsForClass();
    return () => {
      cancelled = true;
    };
  }, [selectedClass?.id, user?.id, fetchGradingIds, fetchSubjectConfig, classesLoaded]);

  const uniqueSubjects = useMemo(() => {
    if (!Array.isArray(teacherClasses)) return [];
    const subjects = [...new Set(teacherClasses.map(c => c.subject).filter(Boolean))];
    return subjects.sort();
  }, [teacherClasses]);

  const uniqueLevels = useMemo(() => {
    if (!Array.isArray(teacherClasses)) return [];
    const levels = [...new Set(teacherClasses.map(c => c.level || c.form).filter(Boolean))];
    return levels.sort();
  }, [teacherClasses]);

  const availableClasses = useMemo(() => {
    if (!Array.isArray(teacherClasses)) return [];
    let filtered = teacherClasses;
    if (selectedSubject) {
      filtered = filtered.filter(c => c.subject === selectedSubject);
    }
    if (isAdmin && selectedLevel) {
      filtered = filtered.filter(c => (c.level || c.form) === selectedLevel);
    }
    return filtered;
  }, [teacherClasses, selectedSubject, selectedLevel, isAdmin]);

  const handleSubjectChange = useCallback((e) => {
    const subject = e.target.value;
    setSelectedSubject(subject);
    setSelectedLevel('');
    if (!subject) {
      setSelectedClass(null);
      return;
    }
    const firstMatch = teacherClasses.find(c => c.subject === subject);
    if (firstMatch) {
      setSelectedClass(firstMatch);
    }
  }, [teacherClasses]);

  const handleLevelChange = useCallback((e) => {
    const level = e.target.value;
    setSelectedLevel(level);
    if (!level) {
      return;
    }
    const firstMatch = teacherClasses.find(c => (c.level || c.form) === level);
    if (firstMatch) {
      setSelectedClass(firstMatch);
    }
  }, [teacherClasses]);

  const handleClassChange = useCallback((e) => {
    const classId = e.target.value;
    const cls = teacherClasses.find(c => c.id === classId);
    if (cls) {
      setSelectedClass(cls);
    }
  }, [teacherClasses]);

  useEffect(() => {
    if (!isAdmin) return;
    if (!selectedClass) return;
    if (!classesLoaded) return;
    const stillAvailable = availableClasses.some(c => c.id === selectedClass.id);
    if (!stillAvailable && availableClasses.length > 0) {
      setSelectedClass(availableClasses[0]);
    }
  }, [isAdmin, selectedClass, availableClasses, classesLoaded]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
          <p className="text-sm font-medium text-muted-foreground">
            Loading grading sheet from server…
          </p>
        </div>
      </div>
    );
  }

  if (error || !gradingData) {
    if (isAdmin && !error && subjectParam) {
      const emptyGradingData = { students: [], subjectConfig: {}, subjectId: null, classId: null, termId: null };
      const { students, subjectConfig } = emptyGradingData;
      const targetStudentId = getTargetStudentId || null;
      const DEFAULT_CLASS_INFO = {
        id: selectedClass ? selectedClass.id : subjectParam,
        subject: selectedSubject || subjectParam,
        className: selectedClass ? selectedClass.className : '',
        programme: selectedClass ? (selectedClass.department || 'GENERAL') : 'GENERAL',
        studentCount: 0,
        form: selectedClass ? formatFormNumber(selectedClass.level) : '1',
        academicYear: '2025/2026',
      };
      const STP_RULES = [
        { check: (s) => s.final > 100, message: 'Final score exceeds 100%' },
        { check: (s) => s.sba > 30, message: 'SBA exceeds 30% limit' },
        { check: (s) => s.exam > 70, message: 'Exam exceeds 70% limit' },
        { check: (s) => s.auditStatus === 'MISSING', message: 'Missing behavioral observations' },
      ];
      return (
        <GradingSheet
          classInfo={DEFAULT_CLASS_INFO}
          teacherId={user?.id || user?.staffId}
          students={students}
          subjectConfig={subjectConfig}
          stpRules={STP_RULES}
          isTermFinalized={isTermFinalized}
          missingObsId={getMissingObsId}
          targetStudentId={targetStudentId}
          targetStudentName={getTargetStudentName}
          targetStudentIndex={getTargetStudentIndex}
          noAssignmentWarning={false}
          isAtRisk={isAtRisk}
          selectedSubject={selectedSubject}
          selectedClass={selectedClass}
          availableClasses={availableClasses}
          uniqueSubjects={uniqueSubjects}
          onSubjectChange={handleSubjectChange}
          onClassChange={(e) => {
            const cls = availableClasses.find(c => c.id === e.target.value);
            if (cls) setSelectedClass(cls);
          }}
          uniqueLevels={isAdmin ? uniqueLevels : []}
          selectedLevel={isAdmin ? selectedLevel : undefined}
          onLevelChange={isAdmin ? handleLevelChange : undefined}
        />
      );
    }
    return (
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
          <p className="text-sm text-destructive">
            {error || 'No class selected for grading'}
          </p>
        </div>
      </div>
    );
  }

  const { students, subjectConfig } = gradingData;
  const targetStudentId = getTargetStudentId || null;

  const DEFAULT_CLASS_INFO = {
    id: selectedClass ? selectedClass.id : (gradingData.classId || subjectParam),
    subject: selectedSubject || subjectParam,
    className: selectedClass ? selectedClass.className : classParam,
    programme: selectedClass ? (selectedClass.department || 'GENERAL') : 'AGRICULTURE',
    studentCount: students.length,
    form: selectedClass ? formatFormNumber(selectedClass.level) : '1',
    academicYear: '2025/2026',
  };

  const STP_RULES = [
    { check: (s) => s.final > 100, message: 'Final score exceeds 100%' },
    { check: (s) => s.sba > 30, message: 'SBA exceeds 30% limit' },
    { check: (s) => s.exam > 70, message: 'Exam exceeds 70% limit' },
    {
      check: (s) => s.auditStatus === 'MISSING',
      message: 'Missing behavioral observations',
    },
  ];

  return (
    <GradingSheet
      classInfo={DEFAULT_CLASS_INFO}
      teacherId={user?.id || user?.staffId}
      students={students}
      subjectConfig={subjectConfig}
      stpRules={STP_RULES}
      isTermFinalized={isTermFinalized}
      missingObsId={getMissingObsId}
      targetStudentId={targetStudentId}
      targetStudentName={getTargetStudentName}
      targetStudentIndex={getTargetStudentIndex}
      noAssignmentWarning={!students.length && !!getTargetStudentId}
      isAtRisk={isAtRisk}
      selectedSubject={selectedSubject}
      selectedClass={selectedClass}
      availableClasses={availableClasses}
      uniqueSubjects={uniqueSubjects}
      onSubjectChange={handleSubjectChange}
      onClassChange={(e) => {
        const cls = availableClasses.find(c => c.id === e.target.value);
        if (cls) setSelectedClass(cls);
      }}
      uniqueLevels={isAdmin ? uniqueLevels : []}
      selectedLevel={isAdmin ? selectedLevel : undefined}
      onLevelChange={isAdmin ? handleLevelChange : undefined}
    />
  );
}
