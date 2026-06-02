import React, { useState, useRef, useEffect } from "react";
import { Search, Lock, User as UserIcon, ChevronDown, Users, GraduationCap, X, ShieldCheck, Menu, ChevronRight } from "lucide-react";
import { useLocation, Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { useRole } from "../../context/RoleContext";
import { useUI } from "../../context/UIContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "../ui/breadcrumb";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function Topbar() {
  const { user, setRole } = useRole();
  const { isDraftMode, setIsDraftMode, setMobileMenuOpen } = useUI();
  const location = useLocation();
  const navigate = useNavigate();

  // Breadcrumb generation logic
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const items = [{ label: "Home", path: "/" }];
    
    // Simplification for demo: map path to label
    if (path === "/grading") items.push({ label: "Mark Entry", path: "/grading" });
    if (path === "/settings") items.push({ label: "Settings", path: "/settings" });
    
    return items;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 border-b border-gray-100 shadow-sm print:hidden">
      
      {/* Shadcn Breadcrumb Section */}
      <div className="flex items-center">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-bold text-emerald-800">{crumb.label}</BreadcrumbPage>
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
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Shadcn Input for Search */}
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search records..." className="pl-8" />
        </div>

        {/* Role Switcher using Shadcn Button style */}
        <Button variant="outline" size="sm" className="gap-2">
          {user?.role} <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

export default Topbar;