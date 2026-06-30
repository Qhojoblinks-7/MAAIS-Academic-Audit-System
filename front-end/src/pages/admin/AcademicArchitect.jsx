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

const MOCK_YEARS_FALLBACK = [
  {
    id: 'YG1',
    name: 'SHS 1',
    programs: [
      {
        id: 'P1-SCI',
        name: 'Science',
        classrooms: [
          { id: 'C1-S1', name: '1 Science 1', capacity: 45, studentsCount: 42, houseDistribution: { 'Guggisberg': 12, 'Aggrey': 10, 'Nkrumah': 20 } },
          { id: 'C1-S2', name: '1 Science 2', capacity: 45, studentsCount: 46, houseDistribution: { 'Guggisberg': 15, 'Aggrey': 15, 'Nkrumah': 16 } },
        ]
      },
      {
        id: 'P1-ART',
        name: 'General Arts',
        classrooms: [
          { id: 'C1-A1', name: '1 Arts 1', capacity: 50, studentsCount: 48, houseDistribution: { 'Guggisberg': 22, 'Aggrey': 26 } },
        ]
      }
    ]
  },
  {
    id: 'YG2',
    name: 'SHS 2',
    programs: [
      {
        id: 'P2-BUS',
        name: 'Business',
        classrooms: [
          { id: 'C2-B1', name: '2 Business 1', capacity: 40, studentsCount: 38, houseDistribution: { 'Nkrumah': 38 } },
        ]
      }
    ]
  },
  {
    id: 'YG3',
    name: 'SHS 3',
    programs: [
      {
        id: 'P3-SCI',
        name: 'Science',
        classrooms: [
          { id: 'C3-S1', name: '3 Science 1', capacity: 45, studentsCount: 44, houseDistribution: { 'Guggisberg': 10, 'Aggrey': 10, 'Nkrumah': 24 } },
        ]
      }
    ]
  }
];

const MOCK_SUBJECTS_FALLBACK = [
  { id: 'S1', code: 'CORE-MT', name: 'Core Mathematics', type: 'Core', creditHours: 4, applicablePrograms: [] },
  { id: 'S2', code: 'CORE-EN', name: 'English Language', type: 'Core', creditHours: 4, applicablePrograms: [] },
  { id: 'S3', code: 'CORE-SC', name: 'Integrated Science', type: 'Core', creditHours: 3, applicablePrograms: [] },
  { id: 'S4', code: 'ELEC-PHY', name: 'Elective Physics', type: 'Elective', creditHours: 4, applicablePrograms: ['Science'] },
  { id: 'S5', code: 'ELEC-ACC', name: 'Cost Accounting', type: 'Elective', creditHours: 4, applicablePrograms: ['Business'] },
  { id: 'S6', code: 'ELEC-LIT', name: 'Lit-In-English', type: 'Elective', creditHours: 3, applicablePrograms: ['General Arts'] },
];

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
        id: cls[0].id,
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
      return {
        id: `SHS-${idx}`,
        name: levelName,
        programs: Object.entries(programsMap).map(([name, cls]) => ({
          id: cls[0].id,
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
    (classes.length > 0 ? classes : MOCK_YEARS_FALLBACK.flatMap(y => y.programs.flatMap(p => p.classrooms))).forEach(c => {
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
      return {
        id: `SHS-${idx}`,
        name: levelName,
        programs: Object.entries(programsMap).map(([name, cls]) => ({
          id: cls[0].id,
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

  const activeYearId = (years.find(y => y.isActive) || years[0])?.id;

  const displaySubjects = subjects.length > 0 ? subjects.map((s, idx) => ({
    id: s.id || `S${idx}`,
    code: s.code || '',
    name: s.name,
    type: s.type || 'Core',
    creditHours: s.creditHours || 3,
    applicablePrograms: [],
  })) : MOCK_SUBJECTS_FALLBACK;

  const displayClasses = classes.length > 0 ? classes : MOCK_YEARS_FALLBACK.flatMap(y => y.programs.flatMap(p => p.classrooms));

  React.useEffect(() => {
    if (effectiveDisplayYears.length > 0 && expandedYears.length === 0) {
      setExpandedYears(effectiveDisplayYears.map(y => y.id));
    }
  }, [effectiveDisplayYears, expandedYears.length]);

  const toggleYear = (id) => {
    setExpandedYears(prev => prev.includes(id) ? prev.filter(y => y !== id) : [...prev, id]);
  };

  const toggleProgram = (id) => {
    setExpandedPrograms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const createYearMutation = useCreateYear();
  const createClassMutation = useCreateClass();
  const PROGRAMS = ['Science', 'General Arts', 'Business', 'Home Economics', 'Visual Arts'];

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
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-200/60 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <span>Academic Engine</span>
              <ChevronRight size={10} />
              <span className="text-slate-900 uppercase">Academic Architect</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight leading-none">
              Institutional Structural Governance
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
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
                  activeTab === tab.id ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"
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
      <div className="flex-1 overflow-y-auto p-8 relative">
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
              <InsightsPanel onStructuralExport={handleStructuralExport} />
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