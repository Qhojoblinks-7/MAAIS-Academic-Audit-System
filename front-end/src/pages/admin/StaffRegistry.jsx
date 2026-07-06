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
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Header Strategy Bar */}
      <header className="px-8 py-6 bg-white border-b border-slate-200/60 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight leading-none mb-1">
            Staff Directory
          </h1>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Command Registry : {isLoading ? '...' : `${staff.length} Nodes`}</p>
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
      <div className="px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="relative w-96 flex items-center group">
            <Search className="absolute left-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
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
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
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
                  className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[150] overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Filter Registry</p>
                  </div>
                  <div className="p-4 space-y-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Department</p>
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
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Role</p>
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
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
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
                   <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
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
            <TableRow className="bg-slate-50/80 backdrop-blur-md border-b border-slate-200">
              <TableHead className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name / ID</TableHead>
              <TableHead className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</TableHead>
              <TableHead className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Role</TableHead>
              <TableHead className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry Status</TableHead>
              <TableHead className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</TableHead>
            </TableRow>
</TableHeader>
           <TableBody>
             {displayStaff.map((staff) => (
               <TableRow
                 key={staff.id} 
                 onClick={() => setSelectedStaff(staff)}
                 className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
               >
                 <TableCell className="px-8 py-5">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-[0.75rem] bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-sm border border-slate-200 group-hover:bg-white transition-colors uppercase select-none">
                       {staff?.name?.split(' ').map(n => n[0]).join('') || ''}
                     </div>
                     <div>
                       <p className="text-[14px] font-black text-slate-900 leading-none mb-1 group-hover:text-emerald-800 transition-colors">{staff?.name || ''}</p>
                       <p className="text-[11px] font-bold text-slate-400 font-mono tracking-tighter">{staff.employeeId}</p>
                     </div>
                   </div>
                 </TableCell>
                <TableCell className="px-8 py-5">
                  <span className="text-[13px] font-bold text-slate-600">{staff.department}</span>
                </TableCell>
                <TableCell className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{staff.role}</span>
                  </div>
                </TableCell>
                 <TableCell className="px-8 py-5">
                   <Badge className={cn(
                     staff.status === 'Active' ? "flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest bg-emerald-50 border-emerald-100 text-emerald-700" :
                     staff.status === 'On Leave' ? "flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest bg-amber-50 border-amber-100 text-amber-700" :
                     "flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest bg-slate-100 border-slate-200 text-slate-500"
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
                        openKebabId === staff.id ? "bg-slate-900 text-white" : "text-slate-300 hover:text-slate-900 hover:bg-slate-50"
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
                          className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[150] overflow-hidden"
                        >
                          <div className="p-2 border-b border-slate-50">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-1">Advanced Node Operations</p>
                          </div>
                          <div className="p-1.5">
                            {[
                              { label: 'Registry Transfer', icon: ArrowRight, color: 'hover:text-blue-600 hover:bg-blue-50' },
                              { label: 'Credential Reset', icon: RotateCcw, color: 'hover:text-amber-600 hover:bg-amber-50' },
                            ].map((item) => (
                              <button
                                key={item.label}
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-600 rounded-xl transition-all text-left",
                                  item.color
                                )}
                              >
                                <item.icon size={14} />
                                {item.label}
                              </button>
                            ))}
                          </div>
                          <div className="p-1.5 bg-slate-50 border-t border-slate-100 italic">
                            <button 
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-400 hover:text-slate-900 rounded-xl transition-all text-left"
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
            <div className="w-20 h-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-200 mb-6 font-display italic text-4xl select-none">
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm shadow-inner"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 z-10"
            >
              {/* Profile Header */}
              <div className="p-8 bg-slate-900 text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none text-white">
                  <ShieldCheck size={200} />
                </div>
                
                <div className="flex justify-between items-center mb-10 relative z-10">
                  <button onClick={() => setSelectedStaff(null)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                    <ArrowLeft size={20} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStaff(null);
                    }}
                    className="p-2.5 bg-white/10 hover:bg-rose-500 hover:text-white text-white rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

<div className="relative z-10">
                   <div className="w-24 h-24 rounded-[2rem] bg-white text-slate-900 flex items-center justify-center text-3xl font-black italic font-display shadow-2xl mb-6 ring-4 ring-white/10 select-none">
                     {selectedStaff?.name?.split(' ').map(n => n[0]).join('') || ''}
                   </div>
                   <h3 className="text-3xl font-black italic font-display tracking-tight mb-2 leading-none">{selectedStaff?.name || ''}</h3>
                   <div className="flex items-center gap-3">
                     <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">{selectedStaff?.employeeId || ''}</span>
                    <div className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="text-[11px] font-bold text-white/60">Joined {selectedStaff.joinedDate || 'Recent'}</span>
                  </div>
                </div>
              </div>

              {/* Profile Body */}
               <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar scrollbar-hide">
                {/* Status Command */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Registry Standing</p>
                    <div className="flex items-center gap-2">
                       <div className={cn(
                        "w-2 h-2 rounded-full",
                        selectedStaff.status === 'Active' ? "bg-emerald-500" :
                        selectedStaff.status === 'On Leave' ? "bg-amber-500" :
                        "bg-slate-400"
                      )} />
                      <span className="text-[14px] font-black text-slate-900 tracking-tight">{selectedStaff.status}</span>
                    </div>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Institutional Node</p>
                    <span className="text-[14px] font-black text-slate-900 tracking-tight">{selectedStaff.department}</span>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <section>
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                    <div className="w-6 h-[1px] bg-slate-200" />
                    Contact Protocol
                  </h4>
                  <div className="space-y-4">
                    <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-slate-300 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Email</p>
                          <p className="text-[13px] font-bold text-slate-900 break-all">{selectedStaff.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-slate-300 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                          <Phone size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Secure Line</p>
                          <p className="text-[13px] font-bold text-slate-900">{selectedStaff.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Security Actions */}
                <section>
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                    <div className="w-6 h-[1px] bg-slate-200" />
                    Security Procedures
                  </h4>
                  <div className="p-6 bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-900/10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center">
                        <Lock size={22} />
                      </div>
                      <div>
                        <h5 className="text-white text-sm font-black tracking-tight leading-none mb-1">Access Protocol Hub</h5>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Node ID: {selectedStaff.id}</p>
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
                        isResettingPassword ? "bg-white/5 text-white/40 cursor-not-allowed" : "bg-white text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <Lock size={16} />
                      {isResettingPassword ? 'Dispatching Token...' : 'Reset Access Password'}
                    </button>
                    
                    <p className="text-[9px] text-white/30 text-center mt-4 font-medium leading-relaxed italic">
                      This action will terminate all active sessions and invalidate the current biological handshake.
                    </p>
                  </div>
                </section>
              </div>

              {/* Panel Footer */}
              <div className="p-8 bg-slate-50 border-t border-slate-200 shrink-0">
                <button className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
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
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
             >
               <div className="p-10">
                 <header className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                       <UserPlus size={24} />
                     </div>
                     <div>
                       <h3 className="text-xl font-black italic font-display text-slate-900 leading-none mb-1">Onboard Staff Node</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutional Registry Registration</p>
                     </div>
                   </div>
                   <button onClick={() => setShowOnboardModal(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-all">
                     <X size={24} />
                   </button>
                 </header>

                 <div className="space-y-6">
<div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="First Name"
                          value={onboardForm.firstName}
                          onChange={(e) => setOnboardForm({...onboardForm, firstName: e.target.value})}
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={onboardForm.lastName}
                          onChange={(e) => setOnboardForm({...onboardForm, lastName: e.target.value})}
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
                        />
                      </div>
                    </div>

                   <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Email</p>
                     <input
                       type="email"
                       value={onboardForm.email}
                       onChange={(e) => setOnboardForm({...onboardForm, email: e.target.value})}
                       placeholder="Enter staff email..."
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
                     />
                   </div>

                   <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Secure Line</p>
                     <input
                       type="tel"
                       value={onboardForm.phone}
                       onChange={(e) => setOnboardForm({...onboardForm, phone: e.target.value})}
                       placeholder="Enter staff phone number..."
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Department</p>
<select
                           value={onboardForm.department}
                           onChange={(e) => setOnboardForm({...onboardForm, department: e.target.value})}
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
                         >
                           <option value="Administration">Administration</option>
                           {departments.map(dept => (
                             <option key={dept.id || dept.name} value={dept.name || dept.id}>{dept.name || dept.id}</option>
                           ))}
                         </select>
                      </div>

                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Job Role</p>
                        <select
                          value={onboardForm.role}
                          onChange={(e) => setOnboardForm({...onboardForm, role: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
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
                       className="flex-1 py-4 bg-slate-50 text-slate-900 font-black rounded-2xl text-[11px] uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all"
                     >
                       Cancel
                     </button>
                     <button 
                       onClick={handleOnboardSubmit}
                       className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/10"
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