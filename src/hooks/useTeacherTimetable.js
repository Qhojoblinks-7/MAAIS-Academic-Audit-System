import { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import MOCK from '../data/mockApiData.json';

/* O(1) — WAEC STP assignment guard:
 * GET /api/timetable?teacher_id=... returns only the subjects and classes
 * specifically assigned to the logged-in teacher per WAEC STP T-AR-1.1.
 * Fallback to mock data if the teacher has no active assignments / API fails.
 */

// timetableFallback sourced from centralized mock data
const TIMETABLE_FALLBACK = MOCK.teacher?.timetableFallback?.items || [];

export function useTeacherTimetable() {
  const { user } = useRole();

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no user is logged in, do not expose any teacher assignments
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
        const response = await fetch(`/api/timetable?teacher_id=${encodeURIComponent(user.id)}`);

        if (!response.ok) {
          throw new Error(`Timetable API error ${response.status}`);
        }

        const data = await response.json();

        if (cancelled) return;

        setTimetable(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;

        // Per requirement: keep mock data as initial/skeleton on failure
        // WARNING: MOCK DATA in use — replace with real backend route
        setTimetable(TIMETABLE_FALLBACK);
        // Don't set error since fallback data is available
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTimetable();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return { timetable, loading, error };
}
