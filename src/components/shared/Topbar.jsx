import React, { useState, useRef, useEffect } from 'react';
import { Search, Lock, User as UserIcon, ChevronDown, ChevronRight, Users, GraduationCap, X, ShieldCheck, Menu } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

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
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef(null);

  // Sync URL query params with input state gracefully
  const updateURLSearchParam = (val) => {
    const searchParams = new URLSearchParams(window.location.search);
    if (val.trim()) {
      searchParams.set('search', val);
    } else {
      searchParams.delete('search');
    }
    window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`);
  };

  // Close search overlay if clicking outside the component container
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearching(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    updateURLSearchParam('');
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
    else if (path === '/archive') {
      const archiveLabel = user?.role === 'HOD' ? 'Department Vault' : user?.role === 'TEACHER' ? 'My Teaching Archive' : 'System Archives';
      crumbs.push({ label: archiveLabel, path: '/archive' });
    }
    else if (path === '/grading') crumbs.push({ label: 'Mark Entry', path: '/grading' });
    else if (path === '/audit')  crumbs.push({ label: 'Audit & Oversight', path: '/audit' });
    else if (path === '/hod/audit') crumbs.push({ label: 'Audit & Oversight', path: '/hod/audit' });
    else if (path === '/hod/interventions') crumbs.push({ label: 'Interventions', path: '/hod/interventions' });
    else if (path === '/hod/review') crumbs.push({ label: 'Grade Review', path: '/hod/review' });
    else if (path === '/hod/lock-export') crumbs.push({ label: 'Lock & Export', path: '/hod/lock-export' });
    else if (path === '/hod/analytics') crumbs.push({ label: 'Analytics', path: '/hod/analytics' });
    else if (path === '/hod-teachers') crumbs.push({ label: 'Teacher Management', path: '/hod-teachers' });
    else if (path === '/certification') crumbs.push({ label: 'Lock & Export', path: '/certification' });
    else if (path === '/journey') crumbs.push({ label: 'Student Journey', path: '/journey' });
    else if (path === '/system') crumbs.push({ label: 'System Admin', path: '/system' });
    else if (path === '/settings') crumbs.push({ label: 'Settings', path: '/settings' });
    else if (path === '/support') crumbs.push({ label: 'Support', path: '/support' });

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 border-b border-gray-100 shrink-0 shadow-sm shadow-gray-100/40">
      
      {/* Left Area: Desktop Breadcrumbs or Mobile Brand Menu */}
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold tracking-wide">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight size={14} className="text-gray-300" />}
              <Link
                to={crumb.path}
                className={cn(
                  "transition-colors px-1.5 py-1 rounded-md",
                  idx === breadcrumbs.length - 1 
                    ? "text-emerald-800 font-bold bg-emerald-50/60" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors border border-transparent hover:border-gray-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-800 rounded-lg flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-sm shadow-emerald-900/20">
              M
            </div>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-800 font-display italic">MAAIS</p>
          </div>
        </div>
      </div>

      {/* Middle & Right Dynamic Panel Grid */}
      <div className="flex items-center gap-4 lg:gap-6 flex-1 justify-end">
        
        {/* Status Actions (Draft / Live Modes) */}
        {user?.role !== 'STUDENT' && location.pathname === '/grading' && (
          <div className="hidden sm:flex items-center gap-3 animate-fade-in">
            <button
              onClick={() => setIsDraftMode(!isDraftMode)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm transition-all border",
                isDraftMode
                  ? "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100/70"
                  : "bg-emerald-800 border-emerald-900 text-white hover:bg-emerald-900 shadow-emerald-900/10"
              )}
            >
              {isDraftMode ? <Lock size={13} /> : <ShieldCheck size={13} />}
              <span>
                {user?.role === 'HOD'
                  ? (isDraftMode ? 'Audit Mode' : 'Live Mode')
                  : (isDraftMode ? 'Draft Mode' : 'Submitted')}
              </span>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                isDraftMode ? "bg-amber-500 animate-pulse" : "bg-emerald-300"
              )} />
            </button>
            <span className="text-[11px] font-medium text-gray-400 hidden lg:inline">
              Last saved 2h ago
            </span>
          </div>
        )}

        {/* Global Search Container */}
        <div ref={searchContainerRef} className="relative w-48 sm:w-64 lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
          <input
            type="text"
            placeholder="Search classes or students..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsSearching(true); }}
            onFocus={() => setIsSearching(true)}
            className="w-full pl-9 pr-8 py-1.5 bg-gray-50/60 border border-gray-200/80 rounded-xl text-xs font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 focus:bg-white transition-all"
          />
          {query && (
            <button
              onClick={() => { 
                setQuery(''); 
                setIsSearching(false);
                updateURLSearchParam('');
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X size={12} />
            </button>
          )}

          {/* Search Dropdown Panel */}
          <AnimatePresence>
            {isSearching && query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 left-[-40px] sm:left-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 z-50 overflow-hidden min-w-[280px] sm:min-w-[320px]"
              >
                <div className="p-1.5 max-h-[360px] overflow-y-auto subtle-scrollbar">
                  {results.length > 0 ? (
                    results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-all group text-left"
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
                          result.type === 'student' 
                            ? "bg-blue-50/50 text-blue-600 border-blue-100/60" 
                            : "bg-emerald-50/50 text-emerald-600 border-emerald-100/60"
                        )}>
                          {result.type === 'student' ? <Users size={16} /> : <GraduationCap size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate group-hover:text-emerald-900 transition-colors">
                            {result.name}
                          </p>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate mt-0.5">
                            {result.detail} {result.index && `• ID: ${result.index}`}
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-gray-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </button>
                    ))
                  ) : (
                    <div className="py-8 px-4 text-center">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 mx-auto mb-2.5 border border-gray-100">
                        <Search size={18} />
                      </div>
                      <p className="text-xs font-bold text-gray-700">No matches found</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Double check your spelling and try again</p>
                    </div>
                  )}
                </div>
                
                {results.length > 0 && (
                  <div className="bg-gray-50/80 px-3.5 py-2 border-t border-gray-100 flex items-center justify-between backdrop-blur-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {results.length} found
                    </p>
                    <button className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 uppercase tracking-wider transition-colors">
                      View All
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Separator Stack & Account Profile */}
        <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-gray-100">
          {/* Role Switch Dropdown */}
          <div className="relative group bg-gray-50 hover:bg-gray-100/80 transition-colors rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 border border-gray-200/40">
            <select
              value={user?.role}
              onChange={(e) => setRole(e.target.value)}
              className="text-xs font-bold text-gray-700 bg-transparent pr-4 focus:outline-none cursor-pointer appearance-none z-10"
            >
              <option value="TEACHER">Staff</option>
              <option value="HOD">HOD</option>
              <option value="ADMIN">Admin</option>
              <option value="STUDENT">Student</option>
            </select>
            <ChevronDown size={12} className="text-gray-400 absolute right-2 pointer-events-none group-hover:text-gray-600 transition-colors" />
          </div>

          {/* User Profile Overview */}
          <div className="hidden md:flex flex-col text-right min-w-[60px]">
            <p className="text-xs font-bold text-gray-800 leading-tight tracking-tight">{user?.name}</p>
            <p className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-wider mt-0.5">{user?.role}</p>
          </div>
          
          <div className="relative shrink-0">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="User Profile" 
                className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200/60 object-cover ring-2 ring-transparent group-hover:ring-emerald-500/10 transition-all" 
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                <UserIcon size={14} />
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}