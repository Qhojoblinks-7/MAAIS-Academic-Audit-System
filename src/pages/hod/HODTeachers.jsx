import React from 'react';
import { useHOD } from '../../context/HODContext';
import { TeacherImpersonationConsole } from '../../components/organisms';
import { auditTrail } from '../../services/auditTrailService';
import { notification } from '../../services/notificationService';

export function HODTeachers() {
  const { departmentTeachers, refreshDepartmentTeachers, isLoading, impersonateTeacherAction, stopImpersonationAction, resetTeacherPasswordAction } = useHOD();

  const handleImpersonate = async (teacher) => {
    await impersonateTeacherAction(teacher.id, 'HOD review requested');
  };

  const handleStop = async () => {
    await stopImpersonationAction();
  };

  const handleResetPassword = async (teacher) => {
    await resetTeacherPasswordAction(teacher.id);
    await auditTrail.logChange('teacher_account', teacher.id, {}, { passwordReset: true }, 'Password reset by HOD');
    await notification.notifyTeacherOfHODAction(teacher.id, 'PASSWORD_RESET', teacher.id, 'Your password has been reset by the HOD');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <TeacherImpersonationConsole
          teachers={departmentTeachers}
          viewAsTeacherId={null}
          viewAsTeacherName={null}
          onImpersonate={handleImpersonate}
          onStop={handleStop}
          onResetPassword={handleResetPassword}
        />
      </div>
    </div>
  );
}
