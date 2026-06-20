import { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { teacherService } from '../services';

export function useTeacherTimetable() {
  const { user } = useRole();

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.id) {
      setTimetable([]);
      setLoading(false);
      setError(new Error('No authenticated teacher found'));
      return;
    }

    let cancelled = false;

    const fetchTimetable = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await teacherService.getTimetable(user.profileId || user.id);

        if (cancelled) return;

        setTimetable(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Failed to load timetable');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTimetable();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.profileId]);

  return { timetable, loading, error };
}
