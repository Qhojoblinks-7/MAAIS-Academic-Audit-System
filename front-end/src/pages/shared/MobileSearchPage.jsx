import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ChevronRight, GraduationCap, UserCog, Users, UserCheck, UsersRound } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { studentService } from '../../services/studentService';
import { adminService } from '../../services/adminService';
import { EmptyState } from '../../components/molecules/EmptyState';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

function getIcon(type) {
  switch (type) {
    case 'student': return GraduationCap;
    case 'teacher':
    case 'staff': return UserCog;
    case 'parent': return Users;
    case 'department': return UserCheck;
    case 'class': return UsersRound;
    default: return Users;
  }
}

function getBadgeColor(type) {
  switch (type) {
    case 'student': return 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20';
    case 'teacher':
    case 'staff': return 'bg-purple-50 text-purple-600 border-purple-200';
    case 'parent': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'department': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'class': return 'bg-sky-50 text-sky-600 border-sky-200';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export function MobileSearchPage() {
  const navigate = useNavigate();
  const { user } = useRole();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const role = user?.role;
      let data = [];
      if (role === 'TEACHER') {
        const [students, parents] = await Promise.all([
          studentService.searchStudents(searchQuery).catch(() => []),
          adminService.searchParents(searchQuery).catch(() => []),
        ]);
        data = [...students, ...parents];
      } else if (['HOD', 'ADMIN', 'SUPER_ADMIN', 'HEADMASTER'].includes(role)) {
        data = await adminService.globalSearch(searchQuery).catch(() => []);
      }
      setResults(Array.isArray(data) ? data.slice(0, 40) : []);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, fetchSearch]);

  const handleResultClick = (result) => {
    setQuery('');
    switch (result.type) {
      case 'teacher':
        navigate(`/teacher-profile?id=${result.id}`);
        break;
      case 'parent':
        navigate('/identity/parents');
        break;
      case 'department':
        navigate(`/department/${result.id}`);
        break;
      case 'class':
        navigate(`/timetable?class=${result.id}`);
        break;
      case 'staff':
        navigate(`/teacher-profile?id=${result.id}`);
        break;
      default:
        if (result.id) navigate(`/student-profile?id=${result.id}`);
        else navigate('/grading');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background no-scrollbar">
      <header className="bg-surface border-b border-border px-4 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shrink-0">
            <ChevronRight size={20} className="text-primary rotate-180" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-primary">Search</h1>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Students, staff, classes</p>
          </div>
        </div>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={16} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="pl-9 pr-9 py-3 text-sm"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary rounded-md hover:bg-muted transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="py-10 text-center">
            <div className="w-8 h-8 border-2 border-success/30 border-t-success rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-text-secondary">Searching...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="py-16">
            <EmptyState context="students" variant="compact" />
            <p className="text-xs font-bold text-text-secondary text-center mt-2">No records found</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-2">
            {results.map((result) => {
              const Icon = getIcon(result.type);
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:bg-muted transition-all text-left active:scale-[0.98]"
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border', getBadgeColor(result.type))}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-text-primary truncate">{result.name}</p>
                    <p className="text-[11px] font-bold text-text-secondary uppercase truncate">
                      {result.sublabel || result.classForm || result.indexNumber || result.type}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-text-secondary shrink-0" />
                </button>
              );
            })}
          </div>
        )}

        {!searched && !loading && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-text-secondary mx-auto mb-4 border border-border">
              <Search size={20} />
            </div>
            <p className="text-sm font-black text-primary mb-1">Search</p>
            <p className="text-xs font-medium text-text-secondary">Search for students, staff, classes and more.</p>
          </div>
        )}
      </div>
    </div>
  );
}
