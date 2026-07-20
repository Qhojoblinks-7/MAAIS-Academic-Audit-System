import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '../../components/molecules';
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Lock,
  ArrowLeft,
  X,
  Filter,
  Download,
  ChevronDown,
  RotateCcw,
  ArrowRight,
  Trash2,
  Eye,
  Pencil,
  Users,
  Upload
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast, Toaster } from '../../components/ui/toast.tsx';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { getDepartmentColor } from '../../constants/departments';
  import { useAllStaff, useCreateStaff, useDeactivateUser, useAllDepartments, useResetStaffCredentials, useBulkImportStaff, useUpdateStaff, useTransferTeacher } from '../../lib/hooks';

export function StaffRegistry() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStaff, setSelectedStaff] = React.useState(null);
  const [selectedEditStaff, setSelectedEditStaff] = React.useState(null);
  const [editForm, setEditForm] = React.useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    staffId: '',
    departmentId: '',
    role: 'TEACHER',
    isActive: true,
  });
  const [isResettingPassword, setIsResettingPassword] = React.useState(false);
  const [resetResult, setResetResult] = React.useState(null);
  const [openKebabId, setOpenKebabId] = React.useState(null);
  const [showFilters, setShowFilters] = React.useState(false);
  const [showOnboardModal, setShowOnboardModal] = React.useState(false);
  const [showBulkModal, setShowBulkModal] = React.useState(false);
  const [bulkText, setBulkText] = React.useState('');
  const [bulkFileName, setBulkFileName] = React.useState('');
  const [bulkResult, setBulkResult] = React.useState(null);
  const [transferStaffId, setTransferStaffId] = React.useState(null);
  const [selectedDepartment, setSelectedDepartment] = React.useState('All');
  const [selectedRole, setSelectedRole] = React.useState('All');
  const [selectedStatus, setSelectedStatus] = React.useState('All');
  const [onboardForm, setOnboardForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    staffId: '',
    department: 'Administration',
    role: 'TEACHER',
  });

  const staffQuery = useAllStaff();
  const departmentsQuery = useAllDepartments();
  const createStaffMutation = useCreateStaff();
  const deactivateMutation = useDeactivateUser();
  const resetCredentialsMutation = useResetStaffCredentials();
  const bulkImportMutation = useBulkImportStaff();
  const updateStaffMutation = useUpdateStaff();
  const transferTeacherMutation = useTransferTeacher();

  const staff = staffQuery.data || [];
  const departments = departmentsQuery.data || [];
  const isLoading = staffQuery.isLoading;
  const error = staffQuery.error;

  const toggleKebab = (e, id) => {
    e.stopPropagation();
    setOpenKebabId(openKebabId === id ? null : id);
  };

  React.useEffect(() => {
    const closeMenu = () => {
      setOpenKebabId(null);
      setShowFilters(false);
    };
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const activeFilterCount =
    (selectedDepartment !== 'All' ? 1 : 0) +
    (selectedRole !== 'All' ? 1 : 0) +
    (selectedStatus !== 'All' ? 1 : 0);

  const handleExportCSV = () => {
    const csv = Papa.unparse(filteredStaff.map(s => ({
      'Name': `${s.firstName || ''} ${s.lastName || ''}`.trim(),
      'Employee ID': s.staffId || s.employeeId || '',
      'Department': s.department?.name || s.department || '',
      'Role': s.role || '',
      'Status': s.status || 'ACTIVE',
      'Email': s.email || '',
      'Phone': s.phone || '',
      'Joined Date': s.hiredAt || 'Recent',
    })));
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff-registry.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredStaff.length} staff records`);
  };

  const handleOnboardSubmit = async () => {
    if (!onboardForm.firstName || !onboardForm.lastName || !onboardForm.email) {
      alert('Name and Email are required fields.');
      return;
    }
    try {
      await createStaffMutation.mutateAsync({
        firstName: onboardForm.firstName,
        lastName: onboardForm.lastName,
        email: onboardForm.email,
        phone: onboardForm.phone,
        staffId: onboardForm.staffId || `STF-${String(staff.length + 1).padStart(3, '0')}`,
        department: onboardForm.department,
        role: onboardForm.role,
      });
      setShowOnboardModal(false);
      setOnboardForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        staffId: '',
        department: 'Administration',
        role: 'TEACHER',
      });
    } catch (err) {
      alert('Failed to create staff: ' + (err.message || err));
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user? This action cannot be undone.')) return;
    try {
      await deactivateMutation.mutateAsync(userId);
    } catch (err) {
      alert('Failed to deactivate: ' + (err.message || err));
    }
  };

  const handleTransfer = async (staff, toDeptId) => {
    try {
      await transferTeacherMutation.mutateAsync({
        teacherId: staff.id,
        fromDeptId: staff.departmentId,
        toDeptId,
      });
      toast.success(`${staff.name} transferred successfully.`);
    } catch (err) {
      toast.error('Transfer failed: ' + (err.message || err));
    } finally {
      setTransferStaffId(null);
      setOpenKebabId(null);
    }
  };

  const ROLE_CHIP_STYLES = {
    TEACHER: 'bg-sky-500/10 text-sky-600 border-sky-200',
    HOD: 'bg-violet-500/10 text-violet-600 border-violet-200',
    HEADMASTER: 'bg-amber-500/10 text-amber-600 border-amber-200',
    SUPER_ADMIN: 'bg-rose-500/10 text-rose-600 border-rose-200',
  };

  const openEdit = (staff) => {
    setEditForm({
      id: staff.id,
      firstName: staff.name.split(' ')[0] || '',
      lastName: staff.name.split(' ').slice(1).join(' ') || '',
      email: staff.email,
      phone: staff.phone,
      staffId: staff.employeeId,
      departmentId: staff.departmentId || '',
      role: staff.role,
      isActive: staff.isActive,
    });
    setSelectedEditStaff(staff);
  };

  const handleEditSubmit = async () => {
    if (!editForm.firstName || !editForm.lastName) {
      alert('First and last name are required.');
      return;
    }
    try {
      await updateStaffMutation.mutateAsync({
        id: editForm.id,
        body: {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
          phone: editForm.phone,
          staffId: editForm.staffId,
          departmentId: editForm.departmentId || undefined,
          role: editForm.role,
          isActive: editForm.isActive,
        },
      });
      setSelectedEditStaff(null);
    } catch (err) {
      alert('Failed to update staff: ' + (err.message || err));
    }
  };

  const filteredStaff = staff.filter(s => {
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) ||
      (s.staffId || '').toLowerCase().includes(searchQuery.toLowerCase());

    const deptName = s.department?.name || 'Unassigned';
    const matchesDepartment = selectedDepartment === 'All' || deptName === selectedDepartment;

    const role = s.user?.role || s.role || 'TEACHER';
    const matchesRole = selectedRole === 'All' || role === selectedRole;

    const status = s.user?.isActive ? 'Active' : 'Inactive';
    const matchesStatus = selectedStatus === 'All' || status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  const displayStaff = filteredStaff.map((s) => {
    const deptName = s.department?.name || 'Unassigned';
    const assignments = s.teachingAssignments || [];
    const classSet = new Set(
      assignments
        .map((a) => a.classSection?.id)
        .filter(Boolean)
    );
    const classNames = Array.from(
      new Set(
        assignments
          .map((a) => a.classSection?.name)
          .filter(Boolean)
      )
    );
    return {
      id: s.id,
      name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email || 'Unknown',
      employeeId: s.staffId || s.id,
      email: s.user?.email || s.email || '',
      phone: s.phone || '',
      department: deptName,
      departmentId: s.department?.id,
      departmentColor: getDepartmentColor(deptName).hex,
      role: s.user?.role || s.role || 'TEACHER',
      status: s.user?.isActive ? 'Active' : 'Inactive',
      isActive: s.user?.isActive ?? true,
      gender: s.gender,
      joinedDate: s.hiredAt,
      userId: s.userId,
      classCount: classSet.size,
      classNames,
    };
  });

  const handleBulkSubmit = async () => {
    let parsed;
    try {
      parsed = parseCsvStaff(bulkText);
    } catch (e) {
      try {
        const json = JSON.parse(bulkText);
        parsed = Array.isArray(json) ? json : [json];
      } catch (e2) {
        toast.error('Could not read the data. Upload a CSV with headers, or paste a JSON array.');
        return;
      }
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      toast.error('No staff records found. Check that your CSV has a header row and at least one row.');
      return;
    }

    const normalized = parsed.map(normalizeStaffRecord);
    const validation = normalized.map(validateStaffRecord);
    const invalid = validation.filter(v => v.errors.length > 0);
    if (invalid.length > 0) {
      const preview = invalid.slice(0, 5).map(v => `Row ${v.idx}: ${v.errors.join(', ')}`).join('\n');
      toast.error(`Please fix ${invalid.length} invalid row(s) before importing:\n\n${preview}`);
      return;
    }

    try {
      const res = await bulkImportMutation.mutateAsync(normalized);
      setBulkResult(res);
      if (res.failed === 0) {
        setBulkText('');
        setBulkFileName('');
      }
    } catch (err) {
      toast.error('Bulk import failed: ' + (err.message || err));
    }
  };

  const handleBulkFile = (file) => {
    if (!file) return;
    setBulkFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let parsed;
        if (file.name.match(/\.xlsx?$/i)) {
          parsed = parseXlsxStaff(content);
        } else {
          parsed = parseCsvStaff(content);
        }
        const csvText = Papa.unparse(parsed);
        setBulkText(csvText);
      } catch (err) {
        toast.error('Failed to parse file: ' + (err.message || 'Unknown error'));
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const sampleDept = departments.length > 0 ? departments[0].name : 'Science';
    const rows = [
      { firstName: 'Ama', lastName: 'Owusu', middleName: 'Abena', email: 'ama.owusu@mandoshts.edu.gh', phone: '+233244000001', staffId: 'TCH-001', role: 'TEACHER', gender: 'MALE', departmentName: sampleDept },
      { firstName: 'Kofi', lastName: 'Mensah', middleName: '', email: 'kofi.mensah@mandoshts.edu.gh', phone: '+233244000002', staffId: 'HOD-001', role: 'HOD', gender: 'MALE', departmentName: sampleDept },
    ];
    const csv = Papa.unparse(rows);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff-onboarding-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const HEADER_ALIASES = {
    firstname: 'firstName',
    'first name': 'firstName',
    'given name': 'firstName',
    lastname: 'lastName',
    'last name': 'lastName',
    'family name': 'lastName',
    surname: 'lastName',
    middlename: 'middleName',
    'middle name': 'middleName',
    email: 'email',
    'e-mail': 'email',
    phone: 'phone',
    'phone number': 'phone',
    'mobile': 'phone',
    'telephone': 'phone',
    role: 'role',
    gender: 'gender',
    staffid: 'staffId',
    'staff id': 'staffId',
    'employee id': 'staffId',
    'emp id': 'staffId',
    'employeeid': 'staffId',
    department: 'departmentId',
    'department id': 'departmentId',
    'dept': 'departmentId',
    'dept id': 'departmentId',
    departmentname: 'departmentName',
    'department name': 'departmentName',
  };

  const ROLE_VALUES = ['TEACHER', 'HOD', 'HEADMASTER', 'SUPER_ADMIN'];
  const GENDER_VALUES = ['MALE', 'FEMALE', 'OTHER'];

  // Robust CSV parsing via PapaParse; fallback to manual for inline text paste
  const parseCsvStaff = (raw) => {
    const results = Papa.parse(raw, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => (HEADER_ALIASES[h.trim().toLowerCase()] || h.trim()),
    });
    if (results.errors.length > 0 && results.data.length === 0) {
      throw new Error(results.errors[0].message);
    }
    return results.data.map(r => {
      const obj = {};
      Object.entries(r).forEach(([h, v]) => {
        obj[h] = (v ?? '').toString().trim();
      });
      return obj;
    });
  };

  const parseXlsxStaff = (content) => {
    const workbook = XLSX.read(content, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    return jsonData.map(row => {
      const obj = {};
      Object.entries(row).forEach(([key, value]) => {
        const normalizedKey = HEADER_ALIASES[key.trim().toLowerCase()] || key.trim();
        obj[normalizedKey] = value !== undefined && value !== null ? String(value).trim() : '';
      });
      return obj;
    });
  };

  const normalizeStaffRecord = (rec) => {
    const role = (rec.role || 'TEACHER').toString().toUpperCase();
    const gender = (rec.gender || 'MALE').toString().toUpperCase();
    return {
      firstName: rec.firstName || '',
      lastName: rec.lastName || '',
      email: rec.email || '',
      phone: rec.phone || '',
      staffId: rec.staffId || '',
      departmentId: rec.departmentId || '',
      departmentName: rec.departmentName || '',
      role: ROLE_VALUES.includes(role) ? role : 'TEACHER',
      gender: GENDER_VALUES.includes(gender) ? gender : 'MALE',
    };
  };

  const validateStaffRecord = (rec, idx) => {
    const errors = [];
    if (!rec.firstName) errors.push('missing first name');
    if (!rec.lastName) errors.push('missing last name');
    if (!rec.email) errors.push('missing email');
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(rec.email)) errors.push('invalid email');
    return { idx: idx + 1, errors };
  };

  const handleOnboardStaff = () => setShowOnboardModal(true);

  return (
    <div className="flex-1 flex flex-col bg-muted overflow-hidden relative">
      {/* Header Strategy Bar */}
      <header className="px-8 py-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-text-primary italic font-display tracking-tight leading-none mb-1">
            Staff Roster
          </h1>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Faculty &amp; Staff Records : {isLoading ? '...' : `${staff.length} Members`}</p>
        </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={handleExportCSV}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2.5"
            >
              <Download size={14} />
              Export CSV
            </Button>
            <Button 
              onClick={() => setShowBulkModal(true)}
              variant="outline"
              className="flex items-center gap-2 px-4 py-2.5"
            >
              <Users size={14} />
              Bulk Onboard
            </Button>
            <Button 
              onClick={handleOnboardStaff}
              className="flex items-center gap-2 px-5 py-2.5"
            >
              <UserPlus size={16} />
              Onboard Staff
            </Button>
          </div>
      </header>

      {/* Filter & Search Bar */}
      <div className="px-8 py-4 bg-surface border-b border-border flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative w-96 flex items-center group shrink-0">
            <Search className="absolute left-4 text-text-secondary group-focus-within:text-text-primary transition-colors" size={18} />
            <Input
              placeholder="Search staff by Name or Employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3"
            />
          </div>

          {/* Active filter chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {selectedDepartment !== 'All' && (
              <button
                onClick={() => setSelectedDepartment('All')}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-muted border-border text-text-primary hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive transition-all whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getDepartmentColor(selectedDepartment).hex }} />
                {selectedDepartment}
                <X size={12} className="opacity-50 group-hover:opacity-100" />
              </button>
            )}
            {selectedRole !== 'All' && (
              <button
                onClick={() => setSelectedRole('All')}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-muted border-border text-text-primary hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive transition-all whitespace-nowrap"
              >
                {selectedRole}
                <X size={12} className="opacity-50 group-hover:opacity-100" />
              </button>
            )}
            {selectedStatus !== 'All' && (
              <button
                onClick={() => setSelectedStatus('All')}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-muted border-border text-text-primary hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive transition-all whitespace-nowrap"
              >
                {selectedStatus}
                <X size={12} className="opacity-50 group-hover:opacity-100" />
              </button>
            )}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setSelectedDepartment('All');
                  setSelectedRole('All');
                  setSelectedStatus('All');
                }}
                className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-destructive transition-all whitespace-nowrap px-1"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filters button + popover */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFilters(!showFilters);
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
              activeFilterCount > 0
                ? "bg-brand-dark text-primary-foreground border-brand-dark"
                : "bg-surface text-text-secondary border-border hover:bg-muted"
            )}
          >
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary-foreground text-brand-dark text-[10px] leading-none">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown size={12} className={cn("transition-transform", showFilters && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-72 bg-surface border border-border rounded-2xl shadow-2xl z-[150] overflow-hidden"
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary">Filter Staff</p>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setSelectedDepartment('All');
                        setSelectedRole('All');
                        setSelectedStatus('All');
                      }}
                      className="text-[9px] font-black uppercase tracking-widest text-destructive hover:opacity-80 transition-opacity"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-5">
                  <div>
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Department</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedDepartment('All')}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                          selectedDepartment === 'All'
                            ? "bg-brand-dark text-primary-foreground border-brand-dark"
                            : "bg-surface text-text-secondary border-border hover:bg-muted"
                        )}
                      >
                        All
                      </button>
                      {departments.map((dept) => {
                        const deptName = dept.name || dept.id;
                        const active = selectedDepartment === deptName;
                        const color = getDepartmentColor(deptName).hex;
                        return (
                          <button
                            key={dept.id || dept.name}
                            onClick={() => setSelectedDepartment(deptName)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                              !active && "bg-surface text-text-secondary border-border hover:bg-muted"
                            )}
                            style={active ? {
                              backgroundColor: `${color}1a`,
                              color,
                              borderColor: `${color}66`,
                            } : undefined}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                            {deptName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Role</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['All', 'TEACHER', 'HOD', 'HEADMASTER', 'SUPER_ADMIN'].map((role) => (
                        <button
                          key={role}
                          onClick={() => setSelectedRole(role)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                            selectedRole === role
                              ? "bg-brand-dark text-primary-foreground border-brand-dark"
                              : "bg-surface text-text-secondary border-border hover:bg-muted"
                          )}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Status</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['All', 'Active', 'Inactive'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setSelectedStatus(status)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                            selectedStatus === status
                              ? "bg-brand-dark text-primary-foreground border-brand-dark"
                              : "bg-surface text-text-secondary border-border hover:bg-muted"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted border-t border-border">
                  <Button onClick={() => setShowFilters(false)} className="w-full py-2">
                    Done
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Registry Table */}
      <div className="flex-1 overflow-auto relative scrollbar-hide no-scrollbar">
          <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-muted/80 backdrop-blur-md border-b border-border">
              <TableHead className="px-8 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-widest">Full Name / ID</TableHead>
              <TableHead className="px-8 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-widest">Department</TableHead>
              <TableHead className="px-8 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-widest">Job Role</TableHead>
              <TableHead className="px-8 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-widest">Assignments</TableHead>
              <TableHead className="px-8 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-widest">Employment Status</TableHead>
              <TableHead className="px-8 py-4 text-right text-[10px] font-black text-text-secondary uppercase tracking-widest">Actions</TableHead>
            </TableRow>
</TableHeader>
           <TableBody>
             {displayStaff.map((staff) => (
                 <TableRow
                  key={staff.id} 
                  onClick={() => setSelectedStaff(staff)}
                  className="group bg-surface hover:bg-muted/50 transition-colors cursor-pointer"
                >
                 <TableCell className="px-8 py-5">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-[0.75rem] bg-muted flex items-center justify-center text-text-primary font-bold text-sm border border-border group-hover:bg-surface transition-colors uppercase select-none">
                       {staff?.name?.split(' ').map(n => n[0]).join('') || ''}
                     </div>
                     <div>
                       <p className="text-[14px] font-black text-text-primary leading-none mb-1 group-hover:text-brand-primary transition-colors">{staff?.name || ''}</p>
                       <p className="text-[11px] font-bold text-text-secondary font-mono tracking-tighter">{staff.employeeId}</p>
                     </div>
                   </div>
                 </TableCell>
                 <TableCell className="px-8 py-5">
                   <span
                     className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                     style={{
                       backgroundColor: `${staff.departmentColor}14`,
                       color: staff.departmentColor,
                       borderColor: `${staff.departmentColor}33`,
                     }}
                   >
                     <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: staff.departmentColor }} />
                     {staff.department}
                   </span>
                 </TableCell>
                   <TableCell className="px-8 py-5">
                     <span className={cn(
                       "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                       ROLE_CHIP_STYLES[staff.role] || 'bg-muted border-border text-text-secondary'
                     )}>
                       {staff.role}
                     </span>
                   </TableCell>
                   <TableCell className="px-8 py-5">
                     {staff.classCount > 0 ? (
                       <span
                         title={staff.classNames.join(', ')}
                         className="text-[13px] font-bold text-text-primary"
                       >
                         {staff.classCount} {staff.classCount === 1 ? 'Class' : 'Classes'}
                       </span>
                     ) : (
                       <span className="text-[11px] font-bold text-text-secondary italic">Unassigned</span>
                     )}
                   </TableCell>
                   <TableCell className="px-8 py-5">
                   <Badge className={cn(
                     staff.status === 'Active' ? "flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest bg-brand-primary/10 border-brand-primary text-brand-primary" :
                     staff.status === 'On Leave' ? "flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest bg-warning/10 border-warning text-warning" :
                     "flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest bg-muted border-border text-text-secondary"
                   )}>
                     {staff.status}
                   </Badge>
                 </TableCell>
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedStaff(staff); }}
                        title="View"
                        className="p-2 rounded-xl bg-muted text-text-primary hover:bg-brand-primary/10 hover:text-brand-primary transition-all"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(staff); }}
                        title="Edit"
                        className="p-2 rounded-xl bg-muted text-text-primary hover:bg-brand-primary/10 hover:text-brand-primary transition-all"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!staff.id) return;
                          try {
                            const res = await resetCredentialsMutation.mutateAsync(staff.id);
                            const tempKey = res?.resetRecord?.temporaryKey;
                            if (tempKey) {
                              setResetResult({ name: staff.name, tempKey });
                            } else {
                              toast.success('Credentials reset.');
                            }
                          } catch (err) {
                            toast.error('Failed to reset credentials: ' + (err.message || err));
                          }
                        }}
                        title="Reset Credentials"
                        className="p-2 rounded-xl bg-muted text-text-primary hover:bg-warning/10 hover:text-warning transition-all"
                      >
                        <RotateCcw size={15} />
                      </button>

                      <div className="relative">
                        <button 
                          onClick={(e) => toggleKebab(e, staff.id)}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            openKebabId === staff.id ? "bg-brand-dark text-primary-foreground" : "bg-muted text-text-primary hover:bg-brand-primary/10 hover:text-brand-primary"
                          )}
                        >
                          <MoreVertical size={16} />
                        </button>

                       <AnimatePresence>
                         {openKebabId === staff.id && (
                           <motion.div
                             initial={{ opacity: 0, scale: 0.95, y: 10 }}
                             animate={{ opacity: 1, scale: 1, y: 0 }}
                             exit={{ opacity: 0, scale: 0.95, y: 10 }}
                             className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-2xl shadow-2xl z-[150] overflow-hidden"
                           >
                              <div className="p-2 border-b border-border">
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-text-secondary px-3 py-1">
                                   {transferStaffId === staff.id ? 'Transfer To Department' : 'Advanced Staff Actions'}
                                </p>
                              </div>

                              {transferStaffId === staff.id ? (
                                <div className="p-1.5 max-h-60 overflow-y-auto scrollbar-hide">
                                  {departments.filter(d => d.id !== staff.departmentId).map(dept => (
                                    <button
                                      key={dept.id || dept.name}
                                      onClick={(e) => { e.stopPropagation(); handleTransfer(staff, dept.id); }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all text-left"
                                    >
                                      <ArrowRight size={14} />
                                      {dept.name || dept.id}
                                    </button>
                                  ))}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setTransferStaffId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-text-secondary hover:text-text-primary rounded-xl transition-all text-left"
                                  >
                                    <X size={14} />
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="p-1.5">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setTransferStaffId(staff.id); }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all text-left"
                                    >
                                      <ArrowRight size={14} />
                                       Department Transfer
                                    </button>
                                  </div>
                                  <div className="p-1.5 bg-muted border-t border-border italic">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeactivate(staff.userId); setOpenKebabId(null); }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-text-secondary hover:text-text-primary rounded-xl transition-all text-left"
                                    >
                                      <Trash2 size={14} />
                                       Deactivate Staff Member
                                    </button>
                                  </div>
                                </>
                              )}
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </div>
                   </div>
                 </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {displayStaff.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-muted rounded-3xl border-2 border-dashed border-border flex items-center justify-center text-muted mb-6 font-display italic text-4xl select-none">
              ?
            </div>
            <EmptyState context="teachers" />
          </div>
        )}
      </div>

      {/* Staff Profile Side Panel */}
      <AnimatePresence>
        {selectedStaff && (
          <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStaff(null)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm shadow-inner"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col border-l border-border z-10"
            >
              {/* Profile Header */}
              <div className="p-8 bg-brand-dark text-primary-foreground relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none text-primary-foreground">
                  <ShieldCheck size={200} />
                </div>
                
                <div className="flex justify-between items-center mb-10 relative z-10">
                  <button onClick={() => setSelectedStaff(null)} className="p-2.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl transition-all">
                    <ArrowLeft size={20} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStaff(null);
                    }}
                    className="p-2.5 bg-primary-foreground/10 hover:bg-destructive hover:text-primary-foreground text-primary-foreground rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

<div className="relative z-10">
                   <div className="flex items-center gap-4">
                     <div className="w-16 h-16 shrink-0 rounded-2xl bg-primary-foreground text-brand-dark flex items-center justify-center text-2xl font-black italic font-display shadow-2xl ring-4 ring-primary-foreground/10 select-none">
                       {selectedStaff?.name?.split(' ').map(n => n[0]).join('') || ''}
                     </div>
                     <div className="min-w-0">
                       <h3 className="text-2xl font-black italic font-display tracking-tight mb-2 leading-none truncate">{selectedStaff?.name || ''}</h3>
                       <div className="flex items-center gap-3">
                         <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-primary">{selectedStaff?.employeeId || ''}</span>
                         <div className="w-1 h-1 rounded-full bg-primary-foreground/30" />
                         <span className="text-[11px] font-bold text-primary-foreground/60">
                           Joined {selectedStaff.joinedDate ? new Date(selectedStaff.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent'}
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Profile Body */}
               <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar scrollbar-hide">
                 {/* Status Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-muted border border-border rounded-3xl">
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-3">Employment Status</p>
                    <div className="flex items-center gap-2">
                       <div className={cn(
                        "w-2 h-2 rounded-full",
                        selectedStaff.status === 'Active' ? "bg-brand-primary" :
                        selectedStaff.status === 'On Leave' ? "bg-warning" :
                        "bg-muted"
                      )} />
                      <span className="text-[14px] font-black text-text-primary tracking-tight">{selectedStaff.status}</span>
                    </div>
                  </div>
                  <div className="p-5 bg-muted border border-border rounded-3xl">
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-3">Department</p>
                    <span className="text-[14px] font-black text-text-primary tracking-tight">{selectedStaff.department}</span>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <section>
                  <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                    <div className="w-6 h-[1px] bg-muted" />
                     Contact Details
                  </h4>
                  <div className="space-y-4">
                    <div className="p-5 bg-surface border border-border rounded-3xl shadow-sm hover:border-border transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-muted text-text-secondary rounded-xl flex items-center justify-center group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-0.5">Primary Email</p>
                          <p className="text-[13px] font-bold text-text-primary break-all">{selectedStaff.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 bg-surface border border-border rounded-3xl shadow-sm hover:border-border transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-muted text-text-secondary rounded-xl flex items-center justify-center group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                          <Phone size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-0.5">Secure Line</p>
                          <p className="text-[13px] font-bold text-text-primary">{selectedStaff.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Security Actions */}
                <section>
                  <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                    <div className="w-6 h-[1px] bg-muted" />
                    Security Settings
                  </h4>
                  <div className="p-6 bg-brand-dark rounded-[2rem] shadow-xl shadow-brand-dark/10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-primary-foreground/10 text-primary-foreground rounded-2xl flex items-center justify-center">
                        <Lock size={22} />
                      </div>
                      <div>
                        <h5 className="text-primary-foreground text-sm font-black tracking-tight leading-none mb-1">Account Access</h5>
                        <p className="text-[10px] text-primary-foreground/40 font-bold uppercase tracking-widest">Staff ID: {selectedStaff.id}</p>
                      </div>
                    </div>
                    
<button 
                       onClick={async (e) => {
                        e.stopPropagation();
                         if (!selectedStaff?.id) return;
                         setIsResettingPassword(true);
                         try {
                           const res = await resetCredentialsMutation.mutateAsync(selectedStaff.id);
                           const tempKey = res?.resetRecord?.temporaryKey;
                           if (tempKey) {
                             setResetResult({ name: selectedStaff.name, tempKey });
                           } else {
                             toast.success('Credentials reset.');
                           }
                        } catch (err) {
                          toast.error('Failed to reset credentials: ' + (err.message || err));
                        } finally {
                          setIsResettingPassword(false);
                        }
                      }}
                      disabled={isResettingPassword}
                      className={cn(
                        "w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/20",
                        isResettingPassword ? "bg-primary-foreground/5 text-primary-foreground/40 cursor-not-allowed" : "bg-surface text-text-primary hover:bg-muted"
                      )}
                    >
                      <Lock size={16} />
                      {isResettingPassword ? 'Dispatching Token...' : 'Reset Access Password'}
                    </button>

                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!selectedStaff?.userId) return;
                        if (!window.confirm('Deactivate this account? This action cannot be undone.')) return;
                        try {
                          await deactivateMutation.mutateAsync(selectedStaff.userId);
                          toast.success('Account Deactivated. All access revoked.');
                          setSelectedStaff(null);
                        } catch (err) {
                          toast.error('Failed to deactivate account: ' + (err.message || err));
                        }
                      }}
                      disabled={deactivateMutation.isPending || selectedStaff.status !== 'Active'}
                      className={cn(
                        "w-full mt-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/20",
                        (deactivateMutation.isPending || selectedStaff.status !== 'Active')
                          ? "bg-primary-foreground/5 text-primary-foreground/40 cursor-not-allowed"
                          : "bg-destructive/90 text-primary-foreground hover:bg-destructive"
                      )}
                    >
                      <Trash2 size={16} />
                      {deactivateMutation.isPending
                        ? 'Revoking Access...'
                        : selectedStaff.status !== 'Active'
                          ? 'Account Inactive'
                          : 'Deactivate Account'}
                    </button>

                    <p className="text-[9px] text-primary-foreground/30 text-center mt-4 font-medium leading-relaxed italic">
                      This action will sign the staff member out of all devices and invalidate their current password.
                    </p>
                  </div>
                </section>
              </div>

              {/* Panel Footer */}
              <div className="p-8 bg-muted border-t border-border shrink-0">
                  <button className="w-full py-4 bg-surface border border-border text-text-primary rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-muted transition-all flex items-center justify-center gap-3">
                  Save Staff Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

       {/* Edit Staff Modal */}
       <AnimatePresence>
         {selectedEditStaff && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedEditStaff(null)}
               className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
             />
             <motion.div
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-lg bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden"
             >
               <div className="p-10">
                 <header className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-brand-dark text-primary-foreground rounded-2xl flex items-center justify-center">
                       <Pencil size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black italic font-display text-text-primary leading-none mb-1">Edit Staff</h3>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Update Staff Information</p>
                     </div>
                   </div>
                   <button onClick={() => setSelectedEditStaff(null)} className="p-2 text-muted hover:text-text-primary transition-all">
                     <X size={24} />
                   </button>
                 </header>

                 <div className="space-y-6">
                   <div>
                     <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Full Name</p>
                     <div className="flex gap-2">
                       <input
                         type="text"
                         placeholder="First Name"
                         value={editForm.firstName}
                         onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                         className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                       />
                       <input
                         type="text"
                         placeholder="Last Name"
                         value={editForm.lastName}
                         onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                         className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                       />
                     </div>
                   </div>

                   <div>
                     <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Primary Email</p>
                     <input
                       type="email"
                       value={editForm.email}
                       onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                       placeholder="Enter staff email..."
                       className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                     />
                   </div>

                   <div>
                     <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Secure Line</p>
                     <input
                       type="tel"
                       value={editForm.phone}
                       onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                       placeholder="Enter staff phone number..."
                       className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Employee ID</p>
                       <input
                         type="text"
                         value={editForm.staffId}
                         onChange={(e) => setEditForm({ ...editForm, staffId: e.target.value })}
                         className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                       />
                     </div>
                     <div>
                       <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Job Role</p>
                       <select
                         value={editForm.role}
                         onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                         className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                       >
                         {['TEACHER', 'HOD', 'HEADMASTER', 'SUPER_ADMIN'].map(role => (
                           <option key={role} value={role}>{role}</option>
                         ))}
                       </select>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Department</p>
                       <select
                         value={editForm.departmentId}
                         onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                         className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                       >
                         <option value="">Unassigned</option>
                         {departments.map(dept => (
                           <option key={dept.id || dept.name} value={dept.id || dept.name}>{dept.name || dept.id}</option>
                         ))}
                       </select>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Account Status</p>
                       <select
                         value={editForm.isActive ? 'Active' : 'Inactive'}
                         onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'Active' })}
                         className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                       >
                         <option value="Active">Active</option>
                         <option value="Inactive">Inactive</option>
                       </select>
                     </div>
                   </div>

                   <div className="flex gap-3 pt-4">
                     <button 
                       onClick={() => setSelectedEditStaff(null)}
                       className="flex-1 py-4 bg-muted text-text-primary font-black rounded-2xl text-[11px] uppercase tracking-widest border border-border hover:bg-muted transition-all"
                     >
                       Cancel
                     </button>
                     <button 
                       onClick={handleEditSubmit}
                       disabled={updateStaffMutation.isPending}
                       className="flex-1 py-4 bg-brand-dark text-primary-foreground font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-brand-dark/10 disabled:opacity-50"
                     >
                       {updateStaffMutation.isPending ? 'Saving…' : 'Save Changes'}
                     </button>
                   </div>
                 </div>
               </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>

       {/* Bulk Onboard Staff Modal */}
       <AnimatePresence>
         {showBulkModal && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowBulkModal(false)}
               className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
             />
             <motion.div
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-2xl bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden"
             >
               <div className="p-10">
                 <header className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-brand-dark text-primary-foreground rounded-2xl flex items-center justify-center">
                       <Users size={24} />
                     </div>
                     <div>
                       <h3 className="text-xl font-black italic font-display text-text-primary leading-none mb-1">Bulk Onboard Staff</h3>
                       <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Default password: Staff@123! Users change it on first login.</p>
                    </div>
                  </div>
                  <button onClick={() => setShowBulkModal(false)} className="p-2 text-muted hover:text-text-primary transition-all">
                    <X size={24} />
                  </button>
                </header>

                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-[10px] font-medium text-text-secondary">
                    Columns: <code className="font-mono bg-muted px-1 rounded">firstName, lastName, email, phone, staffId, role, gender, departmentName</code>
                  </p>
                  <button
                    onClick={downloadSampleCsv}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline whitespace-nowrap"
                  >
                    <Download size={12} /> Sample CSV
                  </button>
                </div>

                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleBulkFile(e.dataTransfer.files?.[0]); }}
                  className="flex flex-col items-center justify-center gap-2 w-full py-8 px-4 border-2 border-dashed border-border rounded-xl bg-muted hover:bg-muted/60 hover:border-brand-primary/40 transition-all cursor-pointer mb-3"
                >
                  <Upload size={22} className="text-text-secondary" />
                  <span className="text-[11px] font-bold text-text-primary text-center">
                    {bulkFileName ? bulkFileName : 'Drop a .csv file here or click to browse'}
                  </span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => handleBulkFile(e.target.files?.[0])}
                  />
                </label>

                <Textarea
                  value={bulkText}
                  onChange={(e) => { setBulkText(e.target.value); setBulkFileName(''); }}
                  placeholder={'firstName,lastName,email,phone,staffId,role,gender,departmentName\nAma,Owusu,ama.owusu@mandoshts.edu.gh,+233244000001,TCH-001,TEACHER,MALE,Science\nKofi,Mensah,kofi.mensah@mandoshts.edu.gh,+233244000002,HOD-001,HOD,MALE,Mathematics'}
                  className="w-full h-40 px-4 py-3 bg-muted border border-border rounded-xl text-[12px] font-mono text-text-primary focus:outline-none focus:ring-4 focus:ring-border resize-none"
                />

                 {bulkResult && (
                   <div className={cn(
                     "mt-4 p-4 rounded-xl border text-[11px] font-bold",
                     bulkResult.failed > 0 ? "bg-warning/10 border-warning text-warning" : "bg-brand-primary/10 border-brand-primary text-brand-primary"
                   )}>
                     Imported {bulkResult.success} staff, {bulkResult.failed} failed.
                     {bulkResult.errors?.length > 0 && (
                       <ul className="mt-2 space-y-1 text-[10px] font-medium">
                         {bulkResult.errors.slice(0, 5).map((e, i) => (
                           <li key={i}>{e.staffId}: {e.error}</li>
                         ))}
                       </ul>
                     )}
                   </div>
                 )}

                 <div className="flex gap-3 pt-6">
                   <button
                     onClick={() => { setShowBulkModal(false); setBulkResult(null); setBulkText(''); }}
                     className="flex-1 py-4 bg-muted text-text-primary font-black rounded-2xl text-[11px] uppercase tracking-widest border border-border hover:bg-muted transition-all"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={handleBulkSubmit}
                     disabled={bulkImportMutation.isPending || !bulkText.trim()}
                     className="flex-1 py-4 bg-brand-dark text-primary-foreground font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-brand-dark/10 disabled:opacity-50"
                   >
                     {bulkImportMutation.isPending ? 'Importing…' : 'Import Staff'}
                   </button>
                 </div>
               </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>

       {/* Onboard Staff Modal */}
       <AnimatePresence>
         {showOnboardModal && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowOnboardModal(false)}
               className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-lg bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden"
             >
               <div className="p-10">
                 <header className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-brand-dark text-primary-foreground rounded-2xl flex items-center justify-center">
                       <UserPlus size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black italic font-display text-text-primary leading-none mb-1">Add Staff Member</h3>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Register New Staff</p>
                     </div>
                   </div>
                   <button onClick={() => setShowOnboardModal(false)} className="p-2 text-muted hover:text-text-primary transition-all">
                     <X size={24} />
                   </button>
                 </header>

                 <div className="space-y-6">
<div>
                      <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Full Name</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={onboardForm.firstName}
                          onChange={(e) => setOnboardForm({...onboardForm, firstName: e.target.value})}
                          className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={onboardForm.lastName}
                          onChange={(e) => setOnboardForm({...onboardForm, lastName: e.target.value})}
                          className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                        />
                      </div>
                    </div>

                   <div>
                     <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Primary Email</p>
                     <input
                       type="email"
                       value={onboardForm.email}
                       onChange={(e) => setOnboardForm({...onboardForm, email: e.target.value})}
                       placeholder="Enter staff email..."
                       className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                     />
                   </div>

                   <div>
                     <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Secure Line</p>
                     <input
                       type="tel"
                       value={onboardForm.phone}
                       onChange={(e) => setOnboardForm({...onboardForm, phone: e.target.value})}
                       placeholder="Enter staff phone number..."
                       className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Department</p>
<select
                           value={onboardForm.department}
                           onChange={(e) => setOnboardForm({...onboardForm, department: e.target.value})}
                           className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                         >
                           <option value="Administration">Administration</option>
                           {departments.map(dept => (
                             <option key={dept.id || dept.name} value={dept.name || dept.id}>{dept.name || dept.id}</option>
                           ))}
                         </select>
                      </div>

                      <div>
                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Job Role</p>
                        <select
                          value={onboardForm.role}
                          onChange={(e) => setOnboardForm({...onboardForm, role: e.target.value})}
                          className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[13px] font-bold text-text-primary focus:outline-none focus:ring-4 focus:ring-border"
                        >
                          {['TEACHER', 'HOD', 'HEADMASTER', 'SUPER_ADMIN'].map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <p className="text-[10px] text-text-secondary">Default password: Staff@123! Staff will be prompted to change it on first login.</p>

                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => setShowOnboardModal(false)}
                        className="flex-1 py-4 bg-muted text-text-primary font-black rounded-2xl text-[11px] uppercase tracking-widest border border-border hover:bg-muted transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleOnboardSubmit}
                        className="flex-1 py-4 bg-brand-dark text-primary-foreground font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg shadow-brand-dark/10"
                      >
                         Register Staff
                      </button>
                    </div>
                 </div>
               </div>
             </motion.div>
           </div>
         )}
         </AnimatePresence>

       {/* Temporary Password Result Dialog */}
       <AnimatePresence>
         {resetResult && (
           <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setResetResult(null)}
               className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
             />
             <motion.div
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-md bg-surface rounded-[2rem] shadow-2xl overflow-hidden"
             >
               <div className="p-8">
                 <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-warning/10 text-warning rounded-2xl flex items-center justify-center">
                     <Lock size={22} />
                   </div>
                   <div>
                     <h3 className="text-lg font-black italic font-display text-text-primary leading-none mb-1">Temporary Password</h3>
                     <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">For {resetResult.name}</p>
                   </div>
                 </div>

                 <p className="text-[12px] font-medium text-text-secondary leading-relaxed mb-4">
                   Share this temporary password with the staff member securely. It is shown only once and cannot be retrieved later.
                 </p>

                 <div className="flex items-center gap-2 p-3 bg-muted border border-border rounded-xl mb-6">
                   <code className="flex-1 text-[15px] font-mono font-bold text-text-primary tracking-wide break-all select-all">
                     {resetResult.tempKey}
                   </code>
                   <button
                     onClick={() => {
                       navigator.clipboard.writeText(resetResult.tempKey)
                         .then(() => toast.success('Copied to clipboard'))
                         .catch(() => toast.error('Failed to copy'));
                     }}
                     className="shrink-0 px-3 py-2 rounded-lg bg-brand-dark text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark/90 transition-all"
                   >
                     Copy
                   </button>
                 </div>

                 <button
                   onClick={() => setResetResult(null)}
                   className="w-full py-3.5 bg-muted text-text-primary font-black rounded-2xl text-[11px] uppercase tracking-widest border border-border hover:bg-muted/80 transition-all"
                 >
                   Done
                 </button>
               </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
       <Toaster />
    </div>
  );
}
