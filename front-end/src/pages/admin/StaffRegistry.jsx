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
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast, Toaster } from '../../components/ui/toast.tsx';
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
import { 
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
 import { Card } from '../../components/ui/card';
 import { useAllStaff, useCreateStaff, useDeactivateUser, useAllDepartments, useResetStaffCredentials } from '../../lib/hooks';

export function StaffRegistry() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStaff, setSelectedStaff] = React.useState(null);
  const [isResettingPassword, setIsResettingPassword] = React.useState(false);
  const [openKebabId, setOpenKebabId] = React.useState(null);
  const [showFilters, setShowFilters] = React.useState(false);
  const [showOnboardModal, setShowOnboardModal] = React.useState(false);
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

  const staff = staffQuery.data || [];
  const departments = departmentsQuery.data || [];
  const isLoading = staffQuery.isLoading;
  const error = staffQuery.error;

  const toggleKebab = (e, id) => {
    e.stopPropagation();
    setOpenKebabId(openKebabId === id ? null : id);
  };

  React.useEffect(() => {
    const closeMenu = () => setOpenKebabId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleExportCSV = () => {
    const headers = ['Name', 'Employee ID', 'Department', 'Role', 'Status', 'Email', 'Phone', 'Joined Date'];
    const csvContent = [
      headers.join(','),
      ...staff.map(s => [
        `"${(s.firstName || '') + ' ' + (s.lastName || '')}"`,
        `"${s.staffId || s.employeeId || ''}"`,
        `"${s.department?.name || s.department || ''}"`,
        `"${s.role || ''}"`,
        `"${s.status || 'ACTIVE'}"`,
        `"${s.email || ''}"`,
        `"${s.phone || ''}"`,
        `"${s.hiredAt || 'Recent'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff-registry.csv';
    a.click();
    URL.revokeObjectURL(url);
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

  const displayStaff = filteredStaff.map((s) => ({
    id: s.id,
    name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email || 'Unknown',
    employeeId: s.staffId || s.id,
    email: s.user?.email || s.email || '',
    phone: s.phone || '',
    department: s.department?.name || 'Unassigned',
    role: s.user?.role || s.role || 'TEACHER',
    status: s.user?.isActive ? 'Active' : 'Inactive',
    joinedDate: s.hiredAt,
    userId: s.userId,
  }));

  const handleOnboardStaff = () => setShowOnboardModal(true);

  return (
    <div className="flex-1 flex flex-col bg-muted overflow-hidden relative">
      {/* Header Strategy Bar */}
      <header className="px-8 py-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-text-primary italic font-display tracking-tight leading-none mb-1">
            Staff Directory
          </h1>
           <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Institutional Command Registry : {isLoading ? '...' : `${staff.length} Nodes`}</p>
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
             onClick={handleOnboardStaff}
             className="flex items-center gap-2 px-5 py-2.5"
           >
             <UserPlus size={16} />
             Onboard Staff
           </Button>
         </div>
      </header>

      {/* Filter & Search Bar */}
      <div className="px-8 py-4 bg-surface border-b border-border flex items-center justify-between shrink-0">
          <div className="relative w-96 flex items-center group">
            <Search className="absolute left-4 text-text-secondary group-focus-within:text-text-primary transition-colors" size={18} />
            <Input 
              placeholder="Query Registry by Name or Employee ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3"
            />
          </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowFilters(!showFilters);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-text-secondary hover:bg-muted transition-all"
            >
              <Filter size={14} />
              Filters
              <ChevronDown size={12} className={cn("transition-transform", showFilters && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-72 bg-surface border border-border rounded-2xl shadow-2xl z-[150] overflow-hidden"
                >
                  <div className="p-4 border-b border-border">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-secondary mb-2">Filter Registry</p>
                  </div>
                  <div className="p-4 space-y-4">
                      <div>
                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Department</p>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment} className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="All Departments" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Departments</SelectItem>
                            {departments.map(dept => (
                              <SelectItem key={dept.id || dept.name} value={dept.name || dept.id}>{dept.name || dept.id}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Role</p>
                        <Select value={selectedRole} onValueChange={setSelectedRole} className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="All Roles" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Roles</SelectItem>
                            {['TEACHER', 'HOD', 'HEADMASTER', 'SUPER_ADMIN'].map(role => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                     <div>
                       <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">Status</p>
                       <Select value={selectedStatus} onValueChange={setSelectedStatus} className="w-full">
                         <SelectTrigger>
                           <SelectValue placeholder="All Statuses" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="All">All Statuses</SelectItem>
                           <SelectItem value="Active">Active</SelectItem>
                           <SelectItem value="On Leave">On Leave</SelectItem>
                           <SelectItem value="Retired">Retired</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                  </div>
                   <div className="p-4 bg-muted border-t border-border flex gap-2">
                     <Button
                       onClick={() => {
                         setSelectedDepartment('All');
                         setSelectedRole('All');
                         setSelectedStatus('All');
                       }}
                       variant="outline"
                       className="flex-1 py-2"
                     >
                       Reset
                     </Button>
                     <Button
                       onClick={() => setShowFilters(false)}
                       className="flex-1 py-2"
                     >
                       Apply
                     </Button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="flex-1 overflow-auto no-scrollbar scrollbar-hide">
        <Table containerClassName="overflow-visible">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-muted/80 backdrop-blur-md border-b border-border">
              <TableHead className="px-8 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-widest">Full Name / ID</TableHead>
              <TableHead className="px-8 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-widest">Department</TableHead>
              <TableHead className="px-8 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-widest">Job Role</TableHead>
              <TableHead className="px-8 py-4 text-left text-[10px] font-black text-text-secondary uppercase tracking-widest">Registry Status</TableHead>
              <TableHead className="px-8 py-4 text-right text-[10px] font-black text-text-secondary uppercase tracking-widest">Operations</TableHead>
            </TableRow>
</TableHeader>
           <TableBody>
             {displayStaff.map((staff) => (
               <TableRow
                 key={staff.id} 
                 onClick={() => setSelectedStaff(staff)}
                 className="group hover:bg-muted/50 transition-colors cursor-pointer"
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
                  <span className="text-[13px] font-bold text-text-secondary">{staff.department}</span>
                </TableCell>
                <TableCell className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                    <span className="text-[11px] font-black text-text-primary uppercase tracking-widest">{staff.role}</span>
                  </div>
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
                <TableCell className="px-8 py-5 text-right">
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleKebab(e, staff.id)}
                      className={cn(
                        "p-2 rounded-xl transition-all",
                        openKebabId === staff.id ? "bg-brand-dark text-primary-foreground" : "text-muted hover:text-text-primary hover:bg-muted"
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
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-text-secondary px-3 py-1">Advanced Node Operations</p>
                          </div>
                          <div className="p-1.5">
                            {[
                              { label: 'Registry Transfer', icon: ArrowRight, color: 'hover:text-brand-primary hover:bg-brand-primary/10' },
                              { label: 'Credential Reset', icon: RotateCcw, color: 'hover:text-warning hover:bg-warning/10' },
                            ].map((item) => (
                              <button
                                key={item.label}
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-text-secondary rounded-xl transition-all text-left",
                                  item.color
                                )}
                              >
                                <item.icon size={14} />
                                {item.label}
                              </button>
                            ))}
                          </div>
                          <div className="p-1.5 bg-muted border-t border-border italic">
                            <button 
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-text-secondary hover:text-text-primary rounded-xl transition-all text-left"
                            >
                              <Trash2 size={14} />
                              Deep Archive Node
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                   <div className="w-24 h-24 rounded-[2rem] bg-primary-foreground text-brand-dark flex items-center justify-center text-3xl font-black italic font-display shadow-2xl mb-6 ring-4 ring-primary-foreground/10 select-none">
                     {selectedStaff?.name?.split(' ').map(n => n[0]).join('') || ''}
                   </div>
                   <h3 className="text-3xl font-black italic font-display tracking-tight mb-2 leading-none">{selectedStaff?.name || ''}</h3>
                   <div className="flex items-center gap-3">
                     <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-primary">{selectedStaff?.employeeId || ''}</span>
                    <div className="w-1 h-1 rounded-full bg-primary-foreground/30" />
                    <span className="text-[11px] font-bold text-primary-foreground/60">Joined {selectedStaff.joinedDate || 'Recent'}</span>
                  </div>
                </div>
              </div>

              {/* Profile Body */}
               <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar scrollbar-hide">
                {/* Status Command */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-muted border border-border rounded-3xl">
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-3">Registry Standing</p>
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
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-3">Institutional Node</p>
                    <span className="text-[14px] font-black text-text-primary tracking-tight">{selectedStaff.department}</span>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <section>
                  <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                    <div className="w-6 h-[1px] bg-muted" />
                    Contact Protocol
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
                    Security Procedures
                  </h4>
                  <div className="p-6 bg-brand-dark rounded-[2rem] shadow-xl shadow-brand-dark/10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-primary-foreground/10 text-primary-foreground rounded-2xl flex items-center justify-center">
                        <Lock size={22} />
                      </div>
                      <div>
                        <h5 className="text-primary-foreground text-sm font-black tracking-tight leading-none mb-1">Access Protocol Hub</h5>
                        <p className="text-[10px] text-primary-foreground/40 font-bold uppercase tracking-widest">Node ID: {selectedStaff.id}</p>
                      </div>
                    </div>
                    
<button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!selectedStaff?.userId) return;
                        setIsResettingPassword(true);
                        try {
                          await resetCredentialsMutation.mutateAsync(selectedStaff.userId);
                          toast.success('Password Reset Link Dispatched via Secure Protocol.');
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
                    
                    <p className="text-[9px] text-primary-foreground/30 text-center mt-4 font-medium leading-relaxed italic">
                      This action will terminate all active sessions and invalidate the current biological handshake.
                    </p>
                  </div>
                </section>
              </div>

              {/* Panel Footer */}
              <div className="p-8 bg-muted border-t border-border shrink-0">
                <button className="w-full py-4 bg-surface border border-border text-text-primary rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-muted transition-all flex items-center justify-center gap-3">
                  Commit Registry Updates
                </button>
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
                       <h3 className="text-xl font-black italic font-display text-text-primary leading-none mb-1">Onboard Staff Node</h3>
                       <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Institutional Registry Registration</p>
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
                       Register Node
                     </button>
                   </div>
                 </div>
               </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
      <Toaster />
    </div>
  );
}