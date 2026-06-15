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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const MOCK_SEARCH_RESULTS = [
  { id: "stud001", type: "student", name: "Angela Owusu", detail: "Agriculture • Index: 001", index: "001" },
  { id: "stud002", type: "student", name: "Ama Serwaa", detail: "Agriculture • Index: 009", index: "009" },
  { id: "stud003", type: "student", name: "Kwame Mensah", detail: "Agriculture • Index: 002", index: "002" },
  { id: "c1", type: "class", name: "SHS 1 Agric B", detail: "General Agriculture" },
  { id: "c2", type: "class", name: "SHS 2 Science A", detail: "Elective Physics" },
];

function BreadcrumbNav() {
  const { user } = useRole();
  const location = useLocation();

  // Mapping for specific path labels
  const labelMap = {
    "": "Dashboard",
    "student-profile": "Student Profile",
    "revisions": "Correction Requests",
    "missing-observations": "Compliance Observations",
    "timetable": "Timetable",
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
    "settings": "Settings",
    "support": "Support",
    "new": "New Support Ticket",
    "ticket": "Support Ticket",
    "journey-audit": "Journey Audit"
  };

  const pathnames = location.pathname.split("/").filter((x) => x);
  const crumbs = [{ label: "Home", path: "/" }, ...pathnames.map((value, index) => {
    const path = `/${pathnames.slice(0, index + 1).join("/")}`;
    return { label: labelMap[value] || value.replace(/-/g, " "), path };
  })];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-bold text-brand-primary">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path}>{crumb.label}</Link>
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

  const results = query.trim()
    ? MOCK_SEARCH_RESULTS.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()) || r.detail.toLowerCase().includes(query.toLowerCase()) || (r.index && r.index.includes(query)))
    : [];

  const handleResultClick = (result) => {
    setQuery(""); setIsSearching(false); updateURLSearchParam("");
    if (result.type === 'student') { navigate(`/student-profile?id=${result.id}`); }
    else { navigate("/grading"); }
  };

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    if (nextRole === "STUDENT") { navigate("/"); }
  };

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

        <div ref={searchContainerRef} className="relative w-full max-w-[150px] xs:max-w-[180px] sm:max-w-[240px] lg:max-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={13} />
          <Input
            placeholder="Search..."
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
                  {results.length > 0 ? (
                    results.map((result) => (
                      <button key={result.id} type="button" onClick={() => handleResultClick(result)} className="w-full flex items-center gap-2.5 p-2 hover:bg-muted rounded-lg transition-all group text-left">
                        <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0 border", result.type === "student" ? "bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20" : "bg-brand-primary/10 text-brand-primary border-brand-primary/20")}>
                          {result.type === "student" ? <Users size={13} /> : <GraduationCap size={13} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-text-primary truncate group-hover:text-brand-primary">{result.name}</p>
                          <p className="text-[10px] font-bold text-text-secondary uppercase truncate mt-0.5">{result.detail} {result.index && `• ID: ${result.index}`}</p>
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
                {results.length > 0 && (
                  <div className="bg-muted/80 px-3 py-2 border-t border-border flex items-center justify-between">
                    <p className="text-[9px] font-black text-text-secondary uppercase">{results.length} records found</p>
                    <button className="text-[9px] font-black text-brand-primary hover:text-brand-secondary uppercase">View All</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-border shrink-0">
          <Select value={user?.role} onValueChange={handleRoleChange}>
            <SelectTrigger className="h-7 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider w-auto min-w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TEACHER">Staff</SelectItem>
              <SelectItem value="HOD">HOD</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden sm:flex flex-col text-right min-w-0 max-w-[100px]">
            <p className="text-xs font-bold text-text-primary truncate">{user?.name}</p>
            <p className="text-[9px] font-bold text-brand-secondary/80 uppercase truncate">{user?.role}</p>
          </div>

          <div className="relative shrink-0">
            <Avatar className="w-8 h-8 rounded-xl border border-border">
              <AvatarImage src={user?.avatar} alt="User Profile" />
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