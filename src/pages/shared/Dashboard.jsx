import { useRole } from '../../context/RoleContext';
import { StudentDashboard } from '../student/StudentDashboard';
import { AdminHome } from '../admin/AdminHome';
import { TeacherDashboard } from '../teacher/TeacherDashboard';
import { HODDashboard } from '../hod/HODDashboard';

export function Dashboard() {
  const { user } = useRole();

  if (user?.role === 'STUDENT') return <StudentDashboard />;
  if (user?.role === 'ADMIN') return <AdminHome />;
  if (user?.role === 'TEACHER') return <TeacherDashboard />;
  if (user?.role === 'HOD') return <HODDashboard />;

  return <StudentDashboard />;
}