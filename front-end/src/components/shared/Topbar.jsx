import React, { useState, useRef, useEffect } from "react";
import { Search, Lock, User as UserIcon, X, ShieldCheck, Menu, Users, GraduationCap } from "lucide-react";
import { useRole } from "../../context/RoleContext";
import { useLocation, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUI } from "../../context/UIContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { studentService } from "../../services/studentService";
import { NotificationBell } from "./NotificationBell";

function BreadcrumbNav() {
  const { user } = useRole();
  const location = useLocation();

  const labelMap = {
    "": "Dashboard",
    "student": "Student",
    "portal": "Portal",
    "student-profile": "Student Profile",
    "revisions": "Correction Requests",
    "missing-observations": "Compliance Observations",
    "timetable": user?.role === "STUDENT" ? "My Timetable" : "Timetable",
    "archive": user?.role === "HOD" ? "Department Vault" : user?.role === "TEACHER" ? "My Teaching Archive" : "System Archives",
    "grading": "Mark Entry",
    "audit": "Audit & Oversight",
    "hod": "Department",
    "interventions": "Interventions",
    "review": "Grade Review",
    "lock-export": "Lock & Export",
    "analytics": "Analytics",
    "teachers": "Teacher Management",
    "approvals": "Approvals",
    "broadsheet": "Broadsheet Generator",
    "academic-architect": "Academic Architect",
    "comms": "Comms",
    "extended": "Extended Logs",
    "identity": "Identity",
    "staff": "Staff Registry",
    "departments": "Departments",
    "students": "Students",
    "parents": "Parents",
    "system": "System Admin",
    "settings": user?.role === "STUDENT" ? "My Identity" : "Settings",
    "support": user?.role === "STUDENT" ? "ICT Support" : "Support",
    "new": "New Support Ticket",
    "ticket": "Support Ticket",
    "journey-audit": "Journey Audit",
    "overview": "Overview",
    "academic": "Academic",
    "history": "History",
    "gradingScale": "Grading Scale",
    "academicJourney": "Academic Journey",
    "broadsheetComparison": "Broadsheet Comparison"
  };

  const crumbs = [{ label: "Home", path: "/" }];

  if (user?.role === "STUDENT" && user?.name) {
    crumbs.push({ label: user.name, path: "/student/portal" });
  }

  const pathnames = location.pathname.split("/").filter((x) => x);

  const displaySegments = [];
  let i = 0;
  while (i < pathnames.length) {
    if (pathnames[i] === "student" && pathnames[i + 1] === "portal") {
      if (user?.role !== "STUDENT" || !user?.name) {
        displaySegments.push({ display: "Student Portal", original: "student/portal" });
      }
      i += 2;
    } else {
      displaySegments.push({ display: pathnames[i], original: pathnames[i] });
      i += 1;
    }
  }

  displaySegments.forEach((seg, index) => {
    const path = "/" + displaySegments.slice(0, index + 1).map(s => s.original).join("/");
    const label = labelMap[seg.display] || labelMap[seg.original] || seg.display.replace(/-/g, " ");
    crumbs.push({ label, path });
  });

  const hash = location.hash.replace("#", "");
  const validStudentTabs = ["overview", "academic", "interventions", "history", "gradingScale", "academicJourney", "broadsheetComparison"];
  const isStudentPortal = pathnames.length >= 2 && pathnames[0] === "student" && pathnames[1] === "portal";

  if (isStudentPortal && validStudentTabs.includes(hash)) {
    crumbs.push({
      label: labelMap[hash] || hash.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      path: null,
    });
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          const crumbPath = crumb.path ?? crumb.href;
          const crumbLabel = crumb.label || '';
          return (
            <React.Fragment key={idx}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-bold text-brand-primary">{crumbLabel}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumbPath}>{crumbLabel}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function Topbar() {
  const { user, setRole } = useRole();
  const { isDraftMode, setIsDraftMode, setMobileMenuOpen } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get("search") || "";

  const [query, setQuery] = useState(urlSearchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchContainerRef = useRef(null);

  useEffect(() => { setQuery(urlSearchQuery); }, [urlSearchQuery]);

  const updateURLSearchParam = (val) => {
    if (val.trim()) { setSearchParams({ search: val }, { replace: true }); }
    else { const newParams = new URLSearchParams(searchParams); newParams.delete("search"); setSearchParams(newParams, { replace: true }); }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) { setIsSearching(false); }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSearchResults = React.useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await studentService.searchStudents(searchQuery);
      setSearchResults(results || []);
    } catch (e) {
      setSearchResults([]);
    }
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const debounceTimer = setTimeout(() => {
        fetchSearchResults(query);
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
    }
  }, [query, fetchSearchResults]);

  const handleResultClick = (result) => {
    setQuery(""); setIsSearching(false); updateURLSearchParam("");
    if (result.id) { navigate(`/student-profile?id=${result.id}`); }
    else { navigate("/grading"); }
  };

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    if (nextRole === "STUDENT") { navigate("/"); }
  };

  const avatarSrc = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'default')}`;

  return (
    <header className="sticky top-0 z-40 h-16 bg-surface/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border shrink-0 shadow-sm shadow-surface/40 print:hidden">
      
      <div className="flex items-center gap-3 shrink-0">
        <nav className="hidden md:block">
          <BreadcrumbNav />
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)} className="w-9 h-9">
            <Menu size={18} />
          </Button>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-brand-primary rounded-lg flex items-center justify-center text-surface font-black text-[11px] tracking-tighter">
              M
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider text-brand-primary italic">MAAIS</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 flex-1 justify-end ml-4 min-w-0">
        
        {user?.role !== "STUDENT" && location.pathname === "/grading" && (
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <Button
              variant={isDraftMode ? "outline" : "default"}
              size="sm"
              onClick={() => setIsDraftMode(!isDraftMode)}
              className="gap-2 text-[10px] font-bold uppercase tracking-widest"
            >
              {isDraftMode ? <Lock size={11} /> : <ShieldCheck size={11} />}
              <span>
                {user?.role === "HOD" ? (isDraftMode ? "Audit Mode" : "Live Mode") : (isDraftMode ? "Draft Mode" : "Submitted")}
              </span>
              <span className={cn("w-1 h-1 rounded-full", isDraftMode ? "bg-warning animate-pulse" : "bg-success")} />
            </Button>
            <span className="text-[10px] font-semibold text-text-secondary">Saved 2h ago</span>
          </div>
        )}

        {user?.role !== "STUDENT" && (
          <div ref={searchContainerRef} className="relative w-full max-w-[150px] xs:max-w-[180px] sm:max-w-[240px] lg:max-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={13} />
            <Input
              placeholder="Search students..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setIsSearching(true); updateURLSearchParam(e.target.value); }}
              onFocus={() => setIsSearching(true)}
              className="pl-8.5 pr-8 py-1.5 text-xs"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(""); setIsSearching(false); updateURLSearchParam(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary rounded-md hover:bg-muted transition-colors">
                <X size={11} />
              </button>
            )}

            <AnimatePresence>
              {isSearching && query.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.99 }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                  className="absolute top-full right-0 mt-2 bg-surface rounded-xl border border-border shadow-xl z-50 overflow-hidden w-[260px] xs:w-[280px] sm:w-[320px]"
                >
                  <div className="p-1.5 max-h-[280px] overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <button key={result.id} type="button" onClick={() => handleResultClick(result)} className="w-full flex items-center gap-2.5 p-2 hover:bg-muted rounded-lg transition-all group text-left">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 border bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20">
                            <Users size={13} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-text-primary truncate group-hover:text-brand-primary">{result.name}</p>
                            <p className="text-[10px] font-bold text-text-secondary uppercase truncate mt-0.5">
                              {result.classForm} • Index: {result.indexNumber}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-6 px-4 text-center">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-text-secondary mx-auto mb-2 border border-border">
                          <Search size={14} />
                        </div>
                        <p className="text-xs font-bold text-text-primary">No matches found</p>
                      </div>
                    )}
                  </div>
                  {searchResults.length > 0 && (
                    <div className="bg-muted/80 px-3 py-2 border-t border-border flex items-center justify-between">
                      <p className="text-[9px] font-black text-text-secondary uppercase">{searchResults.length} records found</p>
                      <button className="text-[9px] font-black text-brand-primary hover:text-brand-secondary uppercase">View All</button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-border shrink-0">
          <NotificationBell />

          <div className="hidden sm:flex flex-col text-right min-w-0 max-w-[100px]">
            <p className="text-xs font-bold text-text-primary truncate">{user?.name}</p>
            <p className="text-[9px] font-bold text-brand-secondary/80 uppercase truncate">{user?.role}</p>
          </div>

          <div className="relative shrink-0">
            <Avatar className="w-8 h-8 rounded-xl border border-border">
              <AvatarImage src={avatarSrc} alt="User Profile" />
              <AvatarFallback className="rounded-xl bg-brand-secondary/10 text-brand-secondary text-[11px] font-bold">
                <UserIcon size={13} />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;