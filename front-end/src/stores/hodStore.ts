import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ActiveMode = 'teaching' | 'oversight';

interface HODContext {
  canTeach: boolean;
  canOversight: boolean;
  hodDepartmentId: string | null;
  teachingDepartmentId: string | null;
  teachingAssignmentIds: string[];
}

interface HODState {
  // State
  activeMode: ActiveMode;
  context: HODContext | null;
  viewAsTeacherId: string | null;
  viewAsTeacherName: string | null;

  // Actions
  setActiveMode: (mode: ActiveMode) => void;
  setContext: (context: HODContext | null) => void;
  setViewAsTeacher: (teacherId: string | null) => void;
  setViewAsTeacherName: (teacherName: string | null) => void;
  reset: () => void;
}

const initialContext: HODContext = {
  canTeach: false,
  canOversight: false,
  hodDepartmentId: null,
  teachingDepartmentId: null,
  teachingAssignmentIds: [],
};

export const useHODStore = create<HODState>()(
  persist(
    (set) => ({
      // State
      activeMode: 'oversight',
      context: null,
      viewAsTeacherId: null,
      viewAsTeacherName: null,

      // Actions
      setActiveMode: (mode) => set({ activeMode: mode }),

      setContext: (context) =>
        set({
          context,
          // Auto-switch to teaching mode if user can only teach
          ...(context &&
            context.canTeach &&
            !context.canOversight && {
              activeMode: 'teaching',
            }),
        }),

      setViewAsTeacher: (teacherId) => set({ viewAsTeacherId: teacherId }),

      setViewAsTeacherName: (teacherName) => set({ viewAsTeacherName: teacherName }),

      reset: () =>
        set({
          activeMode: 'oversight',
          context: null,
          viewAsTeacherId: null,
          viewAsTeacherName: null,
        }),
    }),
    {
      name: 'hod-storage',
      partialize: (state) => ({
        activeMode: state.activeMode,
      }),
    }
  )
);

// Derived selectors
export const useActiveMode = () => useHODStore((state) => state.activeMode);
export const useHODContext = () => useHODStore((state) => state.context);
export const useIsTeachingMode = () => useHODStore((state) => state.activeMode === 'teaching');
export const useIsOversightMode = () => useHODStore((state) => state.activeMode === 'oversight');
export const useCanSwitchModes = () =>
  useHODStore((state) => state.context?.canTeach && state.context?.canOversight);
export const useViewAsTeacherId = () => useHODStore((state) => state.viewAsTeacherId);
export const useViewAsTeacherName = () => useHODStore((state) => state.viewAsTeacherName);