import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { School, Layers, Users, AlertTriangle, ChevronRight, ChevronDown, MoreVertical, Plus, X, TrendingUp, Settings2, Archive, UserPlus, Ruler, Home, Trash2 } from 'lucide-react';
import { toast } from '../../../components/ui/toast.tsx';
import { usePromoteLevel, useArchiveYear, useTransferStudents, useUpdateClassCapacity, useRebalanceHouses, useDissolveClass } from '../../../lib/hooks';
import { ConfirmationDialog } from '../../../components/molecules/ConfirmationDialog';

const HOUSES = ['Guggisberg', 'Aggrey', 'Nkrumah'];

export function BlueprintTreeView({ 
  displayYears, 
  expandedYears, 
  expandedPrograms, 
  toggleYear, 
  toggleProgram,
  onCreateYear,
  onCreateClassroom,
  studentAvatarsByClass = {},
  programs = ['Science', 'General Arts', 'Business', 'Home Economics', 'Visual Arts']
}) {
  const [showYearModal, setShowYearModal] = useState(false);
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  const [yearForm, setYearForm] = useState({ name: '', selectedPrograms: [] });
  const [classroomForm, setClassroomForm] = useState({ name: '', capacity: 45, initialStudents: 0 });
  const [selectedProgramForClassroom, setSelectedProgramForClassroom] = useState(null);
  const [openKebabYearId, setOpenKebabYearId] = useState(null);
  const [openKebabClassroomId, setOpenKebabClassroomId] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', action: null, variant: 'danger' });

  const promoteLevelMutation = usePromoteLevel();
  const archiveYearMutation = useArchiveYear();
  const transferStudentsMutation = useTransferStudents();
  const updateClassCapacityMutation = useUpdateClassCapacity();
  const rebalanceHousesMutation = useRebalanceHouses();
  const dissolveClassMutation = useDissolveClass();

  useEffect(() => {
    const closeMenus = () => {
      setOpenKebabYearId(null);
      setOpenKebabClassroomId(null);
    };
    window.addEventListener('click', closeMenus);
    return () => window.removeEventListener('click', closeMenus);
  }, []);

  const inferClassLevel = (yearName) => {
    const match = yearName.match(/(\d)/);
    if (!match) return null;
    const num = match[1];
    const map = { '1': 'FORM_1', '2': 'FORM_2', '3': 'FORM_3' };
    return map[num] || null;
  };

  const handleYearKebabAction = async (yearId, yearName, action) => {
    setOpenKebabYearId(null);
    switch (action) {
      case 'promotion': {
        const classLevel = inferClassLevel(yearName);
        if (!classLevel) {
          toast.error('Cannot determine level for promotion');
          return;
        }
        try {
          await promoteLevelMutation.mutateAsync({
            classLevel,
            academicYearId: yearId,
          });
          toast.success('Level promotion completed successfully');
        } catch (err) {
          toast.error(`Promotion failed: ${err.message || 'Unknown error'}`);
        }
        break;
      }
      case 'restructure': {
        toast.info('Program restructuring panel coming soon');
        break;
      }
      case 'archive': {
        setConfirmDialog({
          open: true,
          title: 'Archive Year Group',
          message: `This will archive all students in ${yearName} and mark the level census as closed. This action cannot be undone.`,
          variant: 'warning',
          action: async () => {
            try {
              await archiveYearMutation.mutateAsync(yearId);
              toast.success('Year group archived successfully');
            } catch (err) {
              toast.error(`Archive failed: ${err.message || 'Unknown error'}`);
              throw err;
            }
          }
        });
        break;
      }
      default:
        break;
    }
  };

  const handleClassroomKebabAction = async (classroomId, action, classroom) => {
    setOpenKebabClassroomId(null);
    switch (action) {
      case 'transfers': {
        toast.info('Student transfer portal coming soon');
        break;
      }
      case 'capacity': {
        const newCapacity = prompt(`Update capacity for ${classroom.name} (current: ${classroom.capacity}):`, String(classroom.capacity));
        if (newCapacity === null) return;
        const parsed = parseInt(newCapacity, 10);
        if (isNaN(parsed) || parsed < 1) {
          toast.error('Capacity must be a positive number');
          return;
        }
        try {
          await updateClassCapacityMutation.mutateAsync({ classId: classroomId, capacity: parsed });
          toast.success(`Capacity updated to ${parsed}`);
        } catch (err) {
          toast.error(`Update failed: ${err.message || 'Unknown error'}`);
        }
        break;
      }
      case 'rebalance': {
        try {
          const result = await rebalanceHousesMutation.mutateAsync(classroomId);
          toast.success(`Houses rebalanced: ${JSON.stringify(result.distribution)}`);
        } catch (err) {
          toast.error(`Rebalance failed: ${err.message || 'Unknown error'}`);
        }
        break;
      }
      case 'dissolve': {
        setConfirmDialog({
          open: true,
          title: 'Dissolve Classroom Unit',
          message: `This will archive and delete "${classroom.name}". All students currently assigned will be unlinked. This action cannot be undone.`,
          variant: 'danger',
          action: async () => {
            try {
              await dissolveClassMutation.mutateAsync(classroomId);
              toast.success('Classroom unit dissolved and archived');
            } catch (err) {
              toast.error(`Dissolution failed: ${err.message || 'Unknown error'}`);
              throw err;
            }
          }
        });
        break;
      }
      default:
        break;
    }
  };

  const handleAddYear = async () => {
    if (!yearForm.name.trim()) {
      toast.error('Year Group name is required');
      return;
    }
    if (yearForm.selectedPrograms.length === 0) {
      toast.error('Select at least one program');
      return;
    }
    try {
      await onCreateYear({
        name: yearForm.name,
        programs: yearForm.selectedPrograms
      });
      setYearForm({ name: '', selectedPrograms: [] });
      setShowYearModal(false);
      toast.success('Year Group created successfully');
    } catch (err) {
      toast.error(`Failed to create Year Group: ${err.message || 'Unknown error'}`);
    }
  };

  const handleAddClassroom = async () => {
    if (!classroomForm.name.trim()) {
      toast.error('Classroom name is required');
      return;
    }
    if (!selectedProgramForClassroom) {
      toast.error('Select a program');
      return;
    }
    try {
      const houseDist = {};
      const total = parseInt(classroomForm.initialStudents) || 0;
      const perHouse = Math.floor(total / 3);
      const remainder = total % 3;
      HOUSES.forEach((house, i) => {
        houseDist[house] = perHouse + (i === 0 ? remainder : 0);
      });

      await onCreateClassroom({
        name: classroomForm.name,
        capacity: parseInt(classroomForm.capacity) || 45,
        studentsCount: total,
        houseDistribution: houseDist,
        programId: selectedProgramForClassroom.id
      });
      setClassroomForm({ name: '', capacity: 45, initialStudents: 0 });
      setSelectedProgramForClassroom(null);
      setShowClassroomModal(false);
      toast.success('Classroom Unit created successfully');
    } catch (err) {
      toast.error(`Failed to create Classroom: ${err.message || 'Unknown error'}`);
    }
  };

  const openClassroomModal = (program) => {
    setSelectedProgramForClassroom(program);
    setShowClassroomModal(true);
  };

  const handleProgramSelect = (prog) => {
    setSelectedProgramForClassroom(prev => ({ ...prev, name: prog }));
  };

  return (
    <div className="xl:col-span-8 space-y-6">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em]">Institutional Blueprint</h3>
            <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-widest italic">Physical & Logical Entity Tree</p>
          </div>
          <button 
            onClick={() => setShowYearModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20"
          >
            <Plus size={14} /> Add Year Group
          </button>
        </div>

        <div className="space-y-4">
          {displayYears.map((year) => (
            <div key={year.id} className="space-y-3">
              <div 
                onClick={() => toggleYear(year.id)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all",
                  expandedYears.includes(year.id) ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 text-slate-900 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    expandedYears.includes(year.id) ? "bg-white/10 text-white" : "bg-white text-slate-400 border border-slate-200"
                  )}>
                    {expandedYears.includes(year.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                  <span className="text-sm font-black italic font-display tracking-tight">{year.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={cn("text-[9px] font-black uppercase tracking-widest", expandedYears.includes(year.id) ? "text-white/40" : "text-slate-400")}>Pop. Census</p>
                    <p className="text-[11px] font-black italic font-display">{year.programs.reduce((acc, p) => acc + p.classrooms.reduce((acc2, c) => acc2 + c.studentsCount, 0), 0)} Units</p>
                  </div>
                  <div className="relative inline-block">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenKebabYearId(openKebabYearId === year.id ? null : year.id); }}
                      className={cn("p-2 rounded-xl transition-all", expandedYears.includes(year.id) ? "text-white/40 hover:text-white hover:bg-white/10" : "text-slate-300 hover:text-slate-900 hover:bg-slate-100")}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openKebabYearId === year.id && (
                      <div className="absolute right-0 top-12 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
                        <button onClick={() => handleYearKebabAction(year.id, year.name, 'promotion')} className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><TrendingUp size={12} className="text-emerald-600" /> Level Promotion / Rollover</button>
                        <button onClick={() => handleYearKebabAction(year.id, year.name, 'restructure')} className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Settings2 size={12} className="text-blue-600" /> Program Restructuring</button>
                        <div className="h-px bg-slate-100 my-1" />
                        <button onClick={() => handleYearKebabAction(year.id, year.name, 'archive')} className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Archive size={12} className="text-amber-600" /> Archive / Deactivate Level</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedYears.includes(year.id) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pl-8 space-y-3 overflow-hidden border-l-2 border-slate-100 ml-8"
                  >
                    {year.programs.map((program) => (
                      <div key={program.id} className="space-y-3">
                        <div 
                          onClick={(e) => { e.stopPropagation(); toggleProgram(program.id); }}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all",
                            expandedPrograms.includes(program.id) ? "bg-emerald-50 text-emerald-900 border border-emerald-100 shadow-sm" : "bg-white border border-slate-100 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <School size={16} className={cn(expandedPrograms.includes(program.id) ? "text-emerald-600" : "text-slate-300")} />
                            <span className="text-[12px] font-black uppercase tracking-widest">{program.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{program.classrooms.length} Structural Nodes</span>
                            {expandedPrograms.includes(program.id) ? <ChevronDown size={14} className="text-emerald-400" /> : <ChevronRight size={14} className="text-slate-300" />}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedPrograms.includes(program.id) && (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="pl-4 space-y-2 border-l-2 border-emerald-100/50"
                            >
                              {program.classrooms.map((classroom) => (
                                <div key={classroom.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-300 transition-all shadow-sm group">
                                  <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center transition-all group-hover:bg-slate-900 group-hover:text-white">
                                      <Layers size={18} />
                                    </div>
                                    <div>
                                      <p className="text-[14px] font-black italic font-display text-slate-900 leading-none mb-1">{classroom.name}</p>
                                      <div className="flex items-center gap-2">
                                        <Users size={10} className="text-slate-300" />
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.15em]">{classroom.studentsCount} Linked Profiles</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-8">
                                    <div className="text-center min-w-[80px]">
                                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Capacity Load</p>
                                      <div className="flex items-center gap-2">
                                        <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden min-w-[50px]">
                                          <div 
                                            className={cn(
                                              "h-full rounded-full transition-all duration-1000",
                                              classroom.studentsCount >= classroom.capacity ? "bg-rose-500" : "bg-emerald-500"
                                            )}
                                            style={{ width: `${Math.min((classroom.studentsCount / classroom.capacity) * 100, 100)}%` }}
                                          />
                                        </div>
                                        <span className={cn(
                                          "text-[10px] font-black italic font-display",
                                          classroom.studentsCount >= classroom.capacity ? "text-rose-600" : "text-emerald-600 font-mono"
                                        )}>
                                          {classroom.studentsCount}/{classroom.capacity}
                                        </span>
                                      </div>
                                      {classroom.studentsCount > classroom.capacity && (
                                        <div className="flex items-center gap-1 mt-1 justify-center">
                                          <AlertTriangle size={8} className="text-rose-500" />
                                          <span className="text-[7px] font-black text-rose-500 uppercase tracking-tighter">Capacity Threshold Exceeded</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {classroom.studentAvatars?.length > 0 && (
                                      <div className="flex -space-x-1.5 mr-2 items-center">
                                        {classroom.studentAvatars.slice(0, 3).map((student, i) => (
                                          <div
                                            key={student.id || i}
                                            title={`${student.firstName} ${student.lastName}`}
                                            className={cn(
                                              "w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-sm ring-2 ring-white",
                                              i === 0 ? "bg-blue-500" : i === 1 ? "bg-amber-500" : i === 2 ? "bg-emerald-500" : "bg-rose-500"
                                            )}
                                          >
                                            {student.initial}
                                          </div>
                                        ))}
                                        {classroom.studentAvatars.length > 3 && (
                                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-black text-white bg-slate-400 shadow-sm ring-2 ring-white">
                                            +{classroom.studentAvatars.length - 3}
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <div className="h-8 w-px bg-slate-100" />

                                    <div className="flex -space-x-2">
                                      {Object.entries(classroom.houseDistribution).map(([house, count], i) => (
                                        <div 
                                          key={house} 
                                          title={`${house}: ${count} Students`}
                                          className={cn(
                                            "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-sm ring-1 ring-slate-100",
                                            i === 0 ? "bg-blue-500" : i === 1 ? "bg-amber-500" : "bg-emerald-500"
                                          )}
                                        >
                                          {house[0]}
                                        </div>
                                      ))}
                                    </div>
                                    
                                    <div className="relative inline-block">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); setOpenKebabClassroomId(openKebabClassroomId === classroom.id ? null : classroom.id); }}
                                        className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                                      >
                                        <MoreVertical size={18} />
                                      </button>
                                      {openKebabClassroomId === classroom.id && (
                                        <div className="absolute right-0 top-12 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
                                          <button onClick={() => handleClassroomKebabAction(classroom.id, 'transfers', classroom)} className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><UserPlus size={12} className="text-indigo-600" /> Student Transfers</button>
                                          <button onClick={() => handleClassroomKebabAction(classroom.id, 'capacity', classroom)} className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Ruler size={12} className="text-blue-600" /> Capacity Overrides</button>
                                          <button onClick={() => handleClassroomKebabAction(classroom.id, 'rebalance', classroom)} className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Home size={12} className="text-emerald-600" /> House Rebalancing</button>
                                          <div className="h-px bg-slate-100 my-1" />
                                          <button onClick={() => handleClassroomKebabAction(classroom.id, 'dissolve', classroom)} className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"><Trash2 size={12} /> Unit Dissolution</button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <button 
                                onClick={() => openClassroomModal(program)}
                                className="w-full py-4 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center gap-3 text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
                              >
                                <Plus size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Classroom Unit</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showYearModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowYearModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black italic font-display text-slate-900">Add Year Group</h3>
                  <button onClick={() => setShowYearModal(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-all">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleAddYear(); }} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-2">Year Group Name</label>
                    <input
                      type="text"
                      value={yearForm.name}
                      onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 outline-none transition-all"
                      placeholder="e.g., SHS 4"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-3">Select Programs</label>
                    <div className="grid grid-cols-2 gap-3">
                      {programs.map((prog) => (
                        <label key={prog} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={yearForm.selectedPrograms.includes(prog)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setYearForm(prev => ({
                                ...prev,
                                selectedPrograms: checked
                                  ? [...prev.selectedPrograms, prog]
                                  : prev.selectedPrograms.filter(p => p !== prog)
                              }));
                            }}
                            className="w-4 h-4 rounded border-slate-300 focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-[12px] font-bold text-slate-700">{prog}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowYearModal(false)}
                      className="flex-1 px-5 py-3 bg-slate-50 text-slate-900 font-black rounded-xl border border-slate-200 hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-5 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      Create Level
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClassroomModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClassroomModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black italic font-display text-slate-900">Add Classroom Unit</h3>
                  <button onClick={() => setShowClassroomModal(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-all">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleAddClassroom(); }} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-2">Classroom Name</label>
                    <input
                      type="text"
                      value={classroomForm.name}
                      onChange={(e) => setClassroomForm({ ...classroomForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 outline-none transition-all"
                      placeholder="e.g., 1 Science 3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-2">Capacity Load</label>
                    <input
                      type="number"
                      value={classroomForm.capacity}
                      onChange={(e) => setClassroomForm({ ...classroomForm, capacity: parseInt(e.target.value) || 45 })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 outline-none transition-all"
                      defaultValue={45}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-2">Initial Student Count</label>
                    <input
                      type="number"
                      value={classroomForm.initialStudents}
                      onChange={(e) => setClassroomForm({ ...classroomForm, initialStudents: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 outline-none transition-all"
                      defaultValue={0}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowClassroomModal(false)}
                      className="flex-1 px-5 py-3 bg-slate-50 text-slate-900 font-black rounded-xl border border-slate-200 hover:bg-slate-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-5 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      Add Classroom
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <ConfirmationDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog({ open: false, title: '', message: '', action: null, variant: 'danger' })}
        isLoading={archiveYearMutation.isPending || dissolveClassMutation.isPending}
      />
    </div>
  );
}