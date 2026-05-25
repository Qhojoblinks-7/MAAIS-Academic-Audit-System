import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Lock,
  User as UserIcon,
  ChevronDown,
  ChevronRight,
  Users,
  GraduationCap,
  X,
  ShieldCheck,
  Menu,
} from "lucide-react";
import { useRole } from "../../context/RoleContext";
import {
  useLocation,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useUI } from "../../context/UIContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

const MOCK_SEARCH_RESULTS = [
  {
    id: "stud001",
    type: "student",
    name: "Angela Owusu",
    detail: "Agriculture • House: Green",
    index: "001",
  },
  {
    id: "stud002",
    type: "student",
    name: "Ama Serwaa",
    detail: "Agriculture • House: Blue",
    index: "009",
  },
  {
    id: "c1",
    type: "class",
    name: "SHS 1 Agric B",
    detail: "General Agriculture",
  },
  {
    id: "c2",
    type: "class",
    name: "SHS 2 Science A",
    detail: "Elective Physics",
  },
];

export function Topbar() {
  const { user, setRole } = useRole();
  const { isDraftMode, setIsDraftMode, setMobileMenuOpen } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get("search") || "";

  const [query, setQuery] = useState(urlSearchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    setQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  const updateURLSearchParam = (val) => {
    if (val.trim()) {
      setSearchParams({ search: val }, { replace: true });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("search");
      setSearchParams(newParams, { replace: true });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearching(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = query.trim()
    ? MOCK_SEARCH_RESULTS.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.detail.toLowerCase().includes(query.toLowerCase()) ||
          (r.index && r.index.includes(query)),
      )
    : [];

  const handleResultClick = (result) => {
    setQuery("");
    setIsSearching(false);
    updateURLSearchParam("");
    navigate("/grading");
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const crumbs = [{ label: "Home", path: "/" }];

    if (path === "/") crumbs.push({ label: "Dashboard", path: "/" });
    else if (path === "/revisions") crumbs.push({ label: "Correction Requests", path: "/revisions" });
    else if (path === "/missing-observations") crumbs.push({ label: "Compliance Observations", path: "/missing-observations" });
    else if (path === "/timetable") crumbs.push({ label: "Timetable", path: "/timetable" });
    else if (path === "/archive") {
      const archiveLabel =
        user?.role === "HOD"
          ? "Department Vault"
          : user?.role === "TEACHER"
            ? "My Teaching Archive"
            : "System Archives";
      crumbs.push({ label: archiveLabel, path: "/archive" });
    } else if (path === "/grading") crumbs.push({ label: "Mark Entry", path: "/grading" });
    else if (path === "/audit") crumbs.push({ label: "Audit & Oversight", path: "/audit" });
    else if (path === "/hod/audit") crumbs.push({ label: "Audit & Oversight", path: "/hod/audit" });
    else if (path === "/hod/interventions") crumbs.push({ label: "Interventions", path: "/hod/interventions" });
    else if (path === "/hod/review") crumbs.push({ label: "Grade Review", path: "/hod/review" });
    else if (path === "/hod/lock-export") crumbs.push({ label: "Lock & Export", path: "/hod/lock-export" });
    else if (path === "/hod/analytics") crumbs.push({ label: "Analytics", path: "/hod/analytics" });
    else if (path === "/hod-teachers") crumbs.push({ label: "Teacher Management", path: "/hod-teachers" });
    else if (path === "/certification") crumbs.push({ label: "Lock & Export", path: "/certification" });
    else if (path === "/system") crumbs.push({ label: "System Admin", path: "/system" });
    else if (path === "/settings") crumbs.push({ label: "Settings", path: "/settings" });
    else if (path === "/support") crumbs.push({ label: "Support", path: "/support" });

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-gray-100 shrink-0 shadow-sm shadow-gray-100/40 print:hidden">
      
      {/* Left Section: Breadcrumbs (Desktop Layout) or Mobile SideDrawer Toggle Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <nav className="hidden md:flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <ChevronRight size={13} className="text-gray-300 mx-0.5" />
              )}
              <Link
                to={crumb.path}
                className={cn(
                  "transition-all px-2 py-1 rounded-lg tracking-widest",
                  idx === breadcrumbs.length - 1
                    ? "text-emerald-800 bg-emerald-50/80 font-black"
                    : "text-gray-400 hover:text-gray-800 hover:bg-gray-50",
                )}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1.5 text-gray-600 hover:bg-gray-50 active:bg-gray-100 rounded-xl transition-colors border border-transparent hover:border-gray-100 cursor-pointer"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-emerald-800 rounded-lg flex items-center justify-center text-white font-black text-[11px] tracking-tighter shadow-sm">
              M
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider text-emerald-800 font-display italic">
              MAAIS
            </p>
          </div>
        </div>
      </div>

      {/* Right Section: Core Global Action Elements Dock */}
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 flex-1 justify-end ml-4 min-w-0">
        
        {/* State Indicators (Draft Mode Alert Buttons) */}
        {user?.role !== "STUDENT" && location.pathname === "/grading" && (
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsDraftMode(!isDraftMode)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border cursor-pointer select-none",
                isDraftMode
                  ? "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100/70"
                  : "bg-emerald-800 border-emerald-900 text-white hover:bg-emerald-900 shadow-sm shadow-emerald-900/10",
              )}
            >
              {isDraftMode ? <Lock size={11} /> : <ShieldCheck size={11} />}
              <span>
                {user?.role === "HOD"
                  ? isDraftMode ? "Audit Mode" : "Live Mode"
                  : isDraftMode ? "Draft Mode" : "Submitted"}
              </span>
              <span
                className={cn(
                  "w-1 h-1 rounded-full",
                  isDraftMode ? "bg-amber-500 animate-pulse" : "bg-emerald-300",
                )}
              />
            </button>
            <span className="text-[10px] font-semibold text-gray-400">
              Saved 2h ago
            </span>
          </div>
        )}

        {/* Floating Global Filter Search Interface Field Container */}
        <div
          ref={searchContainerRef}
          className="relative w-full max-w-[150px] xs:max-w-[180px] sm:max-w-[240px] lg:max-w-[260px]"
        >
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={13}
          />
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsSearching(true);
              updateURLSearchParam(e.target.value);
            }}
            onFocus={() => setIsSearching(true)}
            className="w-full pl-8.5 pr-8 py-1.5 bg-gray-50/80 border border-transparent rounded-xl text-xs font-medium placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all text-ellipsis"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsSearching(false);
                updateURLSearchParam("");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={11} />
            </button>
          )}

          {/* Search Result Overlay Filter Dropdown Card */}
          <AnimatePresence>
            {isSearching && query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.99 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className="absolute top-full right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden w-[260px] xs:w-[280px] sm:w-[320px]"
              >
                <div className="p-1.5 max-h-[280px] overflow-y-auto subtle-scrollbar">
                  {results.length > 0 ? (
                    results.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-center gap-2.5 p-2 hover:bg-gray-50 rounded-lg transition-all group text-left cursor-pointer"
                      >
                        <div
                          className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center shrink-0 border",
                            result.type === "student"
                              ? "bg-blue-50/50 text-blue-600 border-blue-100/50"
                              : "bg-emerald-50/50 text-emerald-600 border-emerald-100/50",
                          )}
                        >
                          {result.type === "student" ? (
                            <Users size={13} />
                          ) : (
                            <GraduationCap size={13} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate group-hover:text-emerald-900 transition-colors">
                            {result.name}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate mt-0.5">
                            {result.detail}{" "}
                            {result.index && `• ID: ${result.index}`}
                          </p>
                        </div>
                        <ChevronRight
                          size={12}
                          className="text-gray-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0"
                        />
                      </button>
                    ))
                  ) : (
                    <div className="py-6 px-4 text-center">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 mx-auto mb-2 border border-gray-100">
                        <Search size={14} />
                      </div>
                      <p className="text-xs font-bold text-gray-700">No matches found</p>
                    </div>
                  )}
                </div>

                {results.length > 0 && (
                  <div className="bg-gray-50/50 px-3 py-2 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                      {results.length} records found
                    </p>
                    <button className="text-[9px] font-black text-emerald-700 hover:text-emerald-900 uppercase tracking-wider transition-colors cursor-pointer">
                      View All
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Account Profiling Stack Block Column */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-100 shrink-0">
          
          {/* Institutional Select Menu Component Wrapper */}
          <div className="relative bg-gray-50 hover:bg-gray-100/70 transition-colors rounded-xl px-2 py-1.5 flex items-center gap-1 border border-transparent hover:border-gray-200/30">
            <select
              value={user?.role}
              onChange={(e) => {
                const nextRole = e.target.value;
                setRole(nextRole);
                if (nextRole === "STUDENT") {
                  navigate("/");
                }
              }}
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-600 bg-transparent pr-3.5 focus:outline-none cursor-pointer appearance-none z-10"
            >
              <option value="TEACHER">Staff</option>
              <option value="HOD">HOD</option>
              <option value="ADMIN">Admin</option>
              <option value="STUDENT">Student</option>
            </select>
            <ChevronDown
              size={11}
              className="text-gray-400 absolute right-2 pointer-events-none transition-colors"
            />
          </div>

          {/* Minimal Meta Identity Descriptions */}
          <div className="hidden sm:flex flex-col text-right min-w-0 max-w-[100px]">
            <p className="text-xs font-bold text-gray-800 leading-none truncate">
              {user?.name}
            </p>
            <p className="text-[9px] font-bold text-emerald-700/80 uppercase tracking-widest mt-0.5 truncate">
              {user?.role}
            </p>
          </div>

          {/* Core Profile Avatar Container Target Node */}
          <div className="relative shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="User Profile"
                className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200/60 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shadow-2xs shrink-0">
                <UserIcon size={13} />
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}

export default Topbar;