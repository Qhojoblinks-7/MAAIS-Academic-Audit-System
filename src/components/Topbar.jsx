import React from 'react';
import { Search, Lock, User as UserIcon, ChevronDown, ChevronRight, Users, GraduationCap, X, ShieldCheck, Menu } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const mockSearchResults = [
  { id: 's1', type: 'student', name: 'Angela Owusu', detail: 'SHS 3 Agric B', index: '001' },
  { id: 's2', type: 'student', name: 'Kwame Mensah', detail: 'SHS 3 Agric B', index: '002' },
  { id: 's3', type: 'student', name: 'Kofi Owusu', detail: 'SHS 2 Science A', index: '003' },
  { id: 'c1', type: 'class', name: 'SHS 1 Agric B', detail: 'General Agriculture' },
  { id: 'c2', type: 'class', name: 'SHS 2 Science A', detail: 'Elective Physics' },
];

export function Topbar() {
  const { user, setRole } = useRole();
  const { isDraftMode, setIsDraftMode, setMobileMenuOpen } = useUI();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

  const results = query.trim()
    ? mockSearchResults.filter(r =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.detail.toLowerCase().includes(query.toLowerCase()) ||
        (r.index && r.index.includes(query))
      )
    : [];

  const handleResultClick = (result) => {
    setQuery('');
    setIsSearching(false);
    if (result.type === 'student') {
      navigate(`/journey?student=${result.id}`);
    } else {
      navigate('/grading');
    }
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const crumbs = [{ label: 'Home', path: '/' }];

    if (path === '/') crumbs.push({ label: 'Dashboard', path: '/' });
    else if (path === '/revisions') crumbs.push({ label: 'Correction Requests', path: '/revisions' });
    else if (path === '/missing-observations') crumbs.push({ label: 'Compliance Observations', path: '/missing-observations' });
    else if (path === '/timetable') crumbs.push({ label: 'Timetable', path: '/timetable' });
    else if (path === '/archive') crumbs.push({ label: 'Archive', path: '/archive' });
    else if (path === '/grading') crumbs.push({ label: 'Mark Entry', path: '/grading' });
    else if (path === '/audit') crumbs.push({ label: 'Audit Logs', path: '/audit' });
    else if (path === '/certification') crumbs.push({ label: 'Certification', path: '/certification' });
    else if (path === '/journey') crumbs.push({ label: 'Student Journey', path: '/journey' });
    else if (path === '/system') crumbs.push({ label: 'System Admin', path: '/system' });
    else if (path === '/settings') crumbs.push({ label: 'Vault Settings', path: '/settings' });
    else if (path === '/support') crumbs.push({ label: 'Student Support', path: '/support' });

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-[#F0F4F2] flex items-center justify-between px-4 lg:px-8 border-b border-gray-200/50 shrink-0">
      <nav className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={12} className="text-gray-400" />}
            <Link
              to={crumb.path}
              className={idx === breadcrumbs.length - 1 ? "text-emerald-800" : "text-gray-400 hover:text-gray-600 transition-colors"}
            >
              {crumb.label}
            </Link>
          </React.Fragment>
        ))}
      </nav>

      <div className="lg:hidden flex items-center gap-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-8 h-8 bg-[#064E3B] rounded-lg flex items-center justify-center text-white font-bold text-sm font-display italic shadow-lg shadow-emerald-950/20">
            M
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#064E3B] font-display italic">MAAIS</p>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <div className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded-lg shadow-sm">
          <select
            value={user?.role}
            onChange={(e) => setRole(e.target.value)}
            className="text-[10px] sm:text-xs font-bold text-[#064E3B] bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="TEACHER">Staff</option>
            <option value="HOD">HOD</option>
            <option value="ADMIN">Admin</option>
            <option value="STUDENT">Student</option>
          </select>
        </div>

        {user?.role !== 'STUDENT' && location.pathname === '/grading' && (
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setIsDraftMode(!isDraftMode)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all border",
                isDraftMode
                  ? "bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50"
                  : "bg-emerald-800 border-emerald-900 text-white hover:bg-emerald-900"
              )}
            >
              {isDraftMode ? <Lock size={14} /> : <ShieldCheck size={14} />}
              <span>
                {user?.role === 'HOD'
                  ? (isDraftMode ? 'Audit Mode' : 'Live Mode')
                  : (isDraftMode ? 'Draft Mode' : 'Submitted')}
              </span>
              <div className={cn(
                "w-1 h-1 rounded-full",
                isDraftMode ? "bg-emerald-400 animate-pulse" : "bg-emerald-200"
              )} />
            </button>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              Last saved 2h ago
            </span>
          </div>
        )}

        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search students, classes..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsSearching(true); }}
            onFocus={() => setIsSearching(true)}
            className="pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-32 md:w-64"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setIsSearching(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}

          <AnimatePresence>
            {isSearching && query.trim() && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSearching(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden min-w-[320px]"
                >
                  <div className="p-2">
                    {results.length > 0 ? (
                      results.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-all group text-left"
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            result.type === 'student' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                            {result.type === 'student' ? <Users size={18} /> : <GraduationCap size={18} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate group-hover:text-emerald-900">
                              {result.name}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate group-hover:text-emerald-700/60">
                              {result.detail} {result.index && `• ${result.index}`}
                            </p>
                          </div>
                          <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-400" />
                        </button>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-3">
                          <Search size={24} />
                        </div>
                        <p className="text-sm font-bold text-gray-900">No results found</p>
                        <p className="text-xs font-medium text-gray-400 mt-1">Try a different search term</p>
                      </div>
                    )}
                  </div>
                  {results.length > 0 && (
                    <div className="bg-gray-50 p-3 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {results.length} results matching "{query}"
                      </p>
                      <button className="text-[10px] font-black text-emerald-600 hover:text-emerald-800 uppercase tracking-widest">
                        View All
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden sm:flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="text-right">
            <p className="text-xs font-black text-gray-900 font-display italic tracking-tight">{user?.name}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{user?.role}</p>
          </div>
          <img src={user?.avatar} alt="User" className="w-8 h-8 rounded-xl bg-emerald-100 border border-white shadow-sm" />
        </div>
      </div>
    </header>
  );
}
