import React, { useState, useMemo, useCallback } from 'react';
import { 
   Building2, BookOpen, ChevronRight, Gauge
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GradingRulesView } from './GradingRulesView';
import { useAllDepartments, useAllSubjects, useAllClasses, useAllStudents, useClassesWithStudents, useAcademicYears as useAdminAcademicYears, useCreateYear, useCreateClass } from '../../lib/hooks';
import { BlueprintTreeView } from './components/BlueprintTreeView';
import { InsightsPanel } from './components/InsightsPanel';
import { CurriculumMatrixView } from './components/CurriculumMatrixView';
import { toast } from '../../components/ui/toast.tsx';

export function AcademicArchitect() {
  const [activeTab, setActiveTab] = useState('Blueprint');
  const [expandedYears, setExpandedYears] = useState([]);
  const [expandedPrograms, setExpandedPrograms] = useState([]);
  const [selectedProgramForClassroom, setSelectedProgramForClassroom] = useState(null);

  const yearsQuery = useAdminAcademicYears();
  const departmentsQuery = useAllDepartments();
  const subjectsQuery = useAllSubjects();
  const classesQuery = useAllClasses();
  const studentsQuery = useAllStudents();
  const classesWithStudentsQuery = useClassesWithStudents();

  const years = yearsQuery.data || [];
  const departments = departmentsQuery.data || [];
  const subjects = subjectsQuery.data || [];
  const classes = classesQuery.data || [];
  const allStudents = studentsQuery.data || [];
  const classesWithStudents = classesWithStudentsQuery.data || [];

  const activeYearId = (years.find(y => y.isActive) || years[0])?.id;
  const groupYearId = activeYearId || null;


  const studentAvatarsByClass = useMemo(() => {
    const map = {};
    (classesWithStudents || []).forEach((cw) => {
      if (cw.studentPreviews?.length) {
        map[cw.id] = cw.studentPreviews;
      }
    });
    return map;
  }, [classesWithStudents]);

  const displayYears = years.length > 0 ? years.map((y, idx) => {
    const yearClasses = classes.filter(c => c.level === (y.label || y.name));
    const programsMap = {};
    yearClasses.forEach(c => {
      const progName = c.name?.split(' ').slice(1).join(' ') || c.name || 'General';
      if (!programsMap[progName]) programsMap[progName] = [];
      programsMap[progName].push(c);
    });
    return {
      id: y.id || `Y${idx}`,
      name: y.label || y.name,
      programs: Object.entries(programsMap).map(([name, cls]) => ({
        id: `${y.id || `Y${idx}`}__${name}`,
        name,
        classrooms: cls.map(c => ({
          id: c.id,
          name: c.name,
          capacity: c.capacity || 45,
          studentsCount: c._count?.students ?? 0,
          houseDistribution: {},
          studentAvatars: studentAvatarsByClass[c.id] || [],
        }))
      }))
    };
  }) : (() => {
    const levelNames = { FORM_1: 'Form 1', FORM_2: 'Form 2', FORM_3: 'Form 3' };
    const grouped = {};
    (classes.length > 0 ? classes : []).forEach(c => {
      const groupName = levelNames[c.level] || c.level || 'General';
      if (!grouped[groupName]) grouped[groupName] = [];
      grouped[groupName].push(c);
    });
    
    return Object.entries(grouped).map(([levelName, clsList], idx) => {
      const programsMap = {};
      clsList.forEach(c => {
        const progName = c.name?.split(' ').slice(1).join(' ') || c.name || 'General';
        if (!programsMap[progName]) programsMap[progName] = [];
        programsMap[progName].push(c);
      });
      const yearId = `${groupYearId || 'SHS'}-${idx}`;
      return {
        id: yearId,
        name: levelName,
        programs: Object.entries(programsMap).map(([name, cls]) => ({
          id: `${yearId}__${name}`,
          name,
          classrooms: cls.map(c => ({
            id: c.id,
            name: c.name,
            capacity: c.capacity || 45,
            studentsCount: c._count?.students ?? 0,
            houseDistribution: {},
            studentAvatars: studentAvatarsByClass[c.id] || [],
          }))
        }))
      };
    });
  })();

  const yearGroupsHaveClassrooms = displayYears.some(y => y.programs.length > 0 && y.programs.some(p => p.classrooms.length > 0));
  const effectiveDisplayYears = yearGroupsHaveClassrooms ? displayYears : (() => {
    const levelNames = { FORM_1: 'Form 1', FORM_2: 'Form 2', FORM_3: 'Form 3' };
    const grouped = {};
    (classes.length > 0 ? classes : []).forEach(c => {
      const groupName = levelNames[c.level] || c.level || 'General';
      if (!grouped[groupName]) grouped[groupName] = [];
      grouped[groupName].push(c);
    });
    
    return Object.entries(grouped).map(([levelName, clsList], idx) => {
      const programsMap = {};
      clsList.forEach(c => {
        const progName = c.name?.split(' ').slice(1).join(' ') || c.name || 'General';
        if (!programsMap[progName]) programsMap[progName] = [];
        programsMap[progName].push(c);
      });
      const yearId = `${groupYearId || 'SHS'}-${idx}`;
      return {
        id: yearId,
        name: levelName,
        programs: Object.entries(programsMap).map(([name, cls]) => ({
          id: `${yearId}__${name}`,
          name,
          classrooms: cls.map(c => ({
            id: c.id,
            name: c.name,
            capacity: c.capacity || 45,
            studentsCount: c._count?.students ?? 0,
            houseDistribution: {},
            studentAvatars: studentAvatarsByClass[c.id] || [],
          }))
        }))
      };
    });
  })();

  const displaySubjects = subjects.length > 0 ? subjects.map((s, idx) => ({
    id: s.id || `S${idx}`,
    code: s.code || '',
    name: s.name,
    type: s.type || 'Core',
    creditHours: s.creditHours || 3,
    applicablePrograms: [],
  })) : [];

  const displayClasses = classes.length > 0 ? classes : [];

  React.useEffect(() => {
    if (effectiveDisplayYears.length > 0 && expandedYears.length === 0) {
      setExpandedYears(effectiveDisplayYears.map(y => y.id));
    }
  }, [effectiveDisplayYears, expandedYears.length]);

  const programForClass = (cls) => {
    const name = (cls.name || '').toLowerCase();
    if (name.includes('science')) return 'Science';
    if (name.includes('arts') && !name.includes('visual')) return 'General Arts';
    if (name.includes('bus')) return 'Business';
    if (name.includes('home')) return 'Home Economics';
    if (name.includes('technical')) return 'Technical';
    return 'General';
  };

  const insightsStats = useMemo(() => {
    const totalClassUnits = classes.length;
    let totalOccupancy = 0;
    const anomalies = [];
    const programLoad = {};

    classes.forEach(c => {
      const occ = c.capacity > 0 ? (c._count?.students ?? 0) / c.capacity : 0;
      totalOccupancy += occ;

      if ((c._count?.students ?? 0) > c.capacity) {
        anomalies.push({
          name: c.name,
          current: c._count?.students ?? 0,
          capacity: c.capacity,
        });
      }

      const prog = programForClass(c);
      programLoad[prog] = (programLoad[prog] || 0) + (c._count?.students ?? 0);
    });

    const avgOccupancy = totalClassUnits > 0 ? Math.round((totalOccupancy / totalClassUnits) * 100) : 0;

    const topProgram = Object.entries(programLoad).sort((a, b) => b[1] - a[1])[0];
    const topProgramName = topProgram ? topProgram[0] : 'N/A';
    const topProgramCount = topProgram ? topProgram[1] : 0;
    const totalStudents = Object.values(programLoad).reduce((a, b) => a + b, 0);
    const topProgramPercent = totalStudents > 0 ? Math.round((topProgramCount / totalStudents) * 100) : 0;

    return {
      totalClassUnits,
      avgOccupancy,
      anomalies: anomalies.slice(0, 5),
      topProgramName,
      topProgramPercent,
      totalStudents,
    };
  }, [classes]);

  const toggleYear = (id) => {
    setExpandedYears(prev => prev.includes(id) ? prev.filter(y => y !== id) : [...prev, id]);
  };

  const toggleProgram = (id) => {
    setExpandedPrograms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const createYearMutation = useCreateYear();
  const createClassMutation = useCreateClass();
  const PROGRAMS = ['Science', 'General Arts', 'Business', 'Home Economics', 'Technical'];

  const handleCreateYear = useCallback(async ({ name, programs }) => {
    await createYearMutation.mutateAsync({
      label: name,
      programs: programs
    });
  }, [createYearMutation]);

  const handleCreateClassroom = useCallback(async ({ name, capacity, studentsCount, houseDistribution, programId }) => {
    const program = selectedProgramForClassroom?.name || '';
    const yearGroup = effectiveDisplayYears.find(y => y.programs.some(p => p.id === programId))?.name || '';
    const levelMap = { 'Form 1': 'FORM_1', 'Form 2': 'FORM_2', 'Form 3': 'FORM_3', 'SHS 1': 'FORM_1', 'SHS 2': 'FORM_2', 'SHS 3': 'FORM_3' };
    const levelEnum = levelMap[yearGroup] || 'FORM_1';
    await createClassMutation.mutateAsync({
      name,
      capacity,
      level: levelEnum,
      program
    });
  }, [createClassMutation, effectiveDisplayYears, selectedProgramForClassroom?.name]);

  const handleStructuralExport = useCallback(() => {
    toast.info('Generating Structural Export...');
    const exportData = effectiveDisplayYears.map(year => ({
      id: year.id,
      name: year.name,
      programs: year.programs.map(program => ({
        id: program.id,
        name: program.name,
        classrooms: program.classrooms.map(classroom => ({
          id: classroom.id,
          name: classroom.name,
          capacity: classroom.capacity || 45,
          studentCount: classroom.studentsCount || 0,
          houses: classroom.houseDistribution || {}
        }))
      }))
    }));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `school_academic_structure_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Structural export completed');
  }, [displayYears]);

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* Header */}
      <header className="px-8 py-6 bg-surface border-b border-border shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-black text-text-primary italic font-display tracking-tight leading-none">
              Institutional Structural Governance
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-muted p-1 rounded-2xl border border-border shadow-inner">
            {[
              { id: 'Blueprint', label: 'Class Structures', icon: Building2 },
              { id: 'Curriculum', label: 'Subject Mapping', icon: BookOpen },
              { id: 'Grading', label: 'Grading Protocol', icon: Gauge },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id ? "bg-surface text-text-primary shadow-md ring-1 ring-border" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
        <div className="max-w-7xl mx-auto space-y-8">
          {activeTab === 'Blueprint' ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                <BlueprintTreeView 
                  displayYears={effectiveDisplayYears}
                  expandedYears={expandedYears}
                  expandedPrograms={expandedPrograms}
                  toggleYear={toggleYear}
                  toggleProgram={toggleProgram}
                  onCreateYear={handleCreateYear}
                  onCreateClassroom={handleCreateClassroom}
                  studentAvatarsByClass={studentAvatarsByClass}
                />
              <InsightsPanel onStructuralExport={handleStructuralExport} insightsStats={insightsStats} />
            </div>
          ) : activeTab === 'Curriculum' ? (
            <CurriculumMatrixView
              displaySubjects={displaySubjects}
              displayClasses={displayClasses}
              academicYearId={activeYearId}
            />
          ) : (
            <div className="-mx-8 -my-8 h-[calc(100vh-200px)]">
              <GradingRulesView />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}