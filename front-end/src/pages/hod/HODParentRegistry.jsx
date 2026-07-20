import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Download, X, FileText, MoreVertical, GraduationCap,
  UserPlus, Phone, MessageSquare, BarChart3, Mail, Send, UserCheck,
  CreditCard, Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  ResponsiveContainer, Tooltip, AreaChart, Area, XAxis
} from 'recharts';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from '../../components/ui/select';
import { useAllParents, useCreateParent, useAllStudents } from '../../lib/hooks';
import { EmptyState } from '../../components/molecules';

const ParentProfile = ({ parent, onClose }) => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-6 bg-brand-dark text-primary-foreground shrink-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-foreground/10 rounded-2xl flex items-center justify-center text-primary-foreground ring-1 ring-primary-foreground/20">
              <UserCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black italic font-display">{parent.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground/50">{parent.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-primary-foreground/10 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'Overview', label: 'Ward Overview', icon: Users },
            { id: 'History', label: 'Communication', icon: MessageSquare },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === tab.id ? 'bg-primary-foreground text-brand-dark shadow-xl' : 'bg-primary-foreground/5 text-primary-foreground/60 hover:bg-primary-foreground/10'
            )}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-muted scrollbar-hide">
        {activeTab === 'Overview' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Linked Households</h4>
            </div>
            <div className="space-y-3">
              {parent.wards.map((ward) => (
                <div key={ward.id} className="bg-surface p-5 rounded-3xl border border-border shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-text-secondary"><GraduationCap size={20} /></div>
                      <div>
                        <p className="text-[14px] font-black italic font-display text-text-primary leading-none mb-1">{ward.name}</p>
                        <p className="text-[9px] font-black uppercase text-text-secondary tracking-widest">{ward.id}</p>
                      </div>
                    </div>
                    <div className={cn('px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest',
                      ward.feesStatus === 'Free SHS' ? 'bg-success/10 text-success border border-success/20' :
                      ward.feesStatus === 'Fully Funded' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' :
                      ward.feesStatus === "Gov't Covered" ? 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20' :
                      'bg-warning/10 text-warning border border-warning/20')}>
                      {ward.feesStatus}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted p-3 rounded-2xl">
                      <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Avg Score</p>
                      <p className="text-xl font-black italic font-display text-text-primary">{ward.averageScore}%</p>
                    </div>
                    <div className="bg-muted p-3 rounded-2xl">
                      <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Attendance</p>
                      <p className="text-xl font-black italic font-display text-text-primary">{ward.attendance}%</p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-brand-dark rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-2 text-primary-foreground/50">
                      <CreditCard size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Statement Balance</span>
                    </div>
                    <p className="text-sm font-black italic font-display text-primary-foreground">GHS 0.00</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'History' && (
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Communication Ledger</h4>
            {parent.communicationLogs.map((log) => (
              <div key={log.id} className="bg-surface p-4 rounded-3xl border border-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center',
                      log.type === 'SMS' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-primary/10 text-brand-primary')}>
                      {log.type === 'SMS' ? <MessageSquare size={12} /> : <Mail size={12} />}
                    </div>
                    <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">{log.type} Blast</span>
                  </div>
                  <span className="text-[9px] font-bold text-text-secondary italic">{log.timestamp}</span>
                </div>
                <p className="text-xs font-bold text-text-secondary leading-relaxed italic mb-2">"{log.content}"</p>
                <div className="flex items-center gap-1.5">
                  <div className={cn('w-1.5 h-1.5 rounded-full', log.status === 'Delivered' ? 'bg-brand-primary' : 'bg-warning')} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">{log.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-surface border-t border-border flex gap-3 shrink-0">
        <Button className="p-3"><Phone size={18} /></Button>
        <Button className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest">Full Statement</Button>
        <Button variant="outline" className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest">Archive</Button>
      </div>
    </div>
  );
};

export function HODParentRegistry() {
  const { data: parents = [], isLoading, error } = useAllParents();
  const { data: students = [] } = useAllStudents();
  const createParentMutation = useCreateParent();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newParentForm, setNewParentForm] = useState({
    firstName: '', lastName: '', phone: '', email: '', occupation: '',
  });
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const selectedParent = useMemo(() => parents.find(p => p.id === selectedParentId), [parents, selectedParentId]);

  const filteredParents = useMemo(() => {
    return parents.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.wards.some(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [parents, searchQuery]);

  const handleCreateParent = async () => {
    if (!newParentForm.firstName || !newParentForm.lastName || !newParentForm.phone) {
      alert('First name, last name, and phone are required.');
      return;
    }
    try {
      await createParentMutation.mutateAsync({
        firstName: newParentForm.firstName,
        lastName: newParentForm.lastName,
        phone: newParentForm.phone,
        email: newParentForm.email,
        occupation: newParentForm.occupation,
        studentIds: selectedStudentIds,
      });
      setIsCreateModalOpen(false);
      setNewParentForm({ firstName: '', lastName: '', phone: '', email: '', occupation: '' });
      setSelectedStudentIds([]);
      setStudentSearch('');
    } catch (err) {
      alert('Failed to create parent: ' + (err.message || err));
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-muted overflow-hidden relative">
      <header className="px-6 py-4 bg-surface border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-text-primary italic font-display tracking-tight leading-none">
              Guardian Network
            </h1>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Household Contact Records : {isLoading ? '...' : `${parents.length} Guardians`}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="px-4 py-2 text-[10px] font-black uppercase tracking-widest" onClick={() => setIsBroadcasting(true)}>
              <Send size={14} /> Broadcast Blast
            </Button>
            <Button className="p-2.5" onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={18} />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-6 py-4 bg-surface border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <Input placeholder="Search Guardians or Wards..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="px-4 py-2 text-[10px] font-black uppercase tracking-widest">
            <Download size={14} /> Global Report
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative scrollbar-hide">
        <Table containerClassName="overflow-visible">
          <TableHeader>
            <TableRow className="bg-muted/80 border-b border-border">
              <TableHead className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Guardian / Household</TableHead>
              <TableHead className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Linked Wards</TableHead>
              <TableHead className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest">Communication</TableHead>
              <TableHead className="px-6 py-3 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParents.map((parent) => (
              <TableRow key={parent.id} className="group bg-surface hover:bg-muted/50 cursor-pointer transition-all border-b border-border/50" onClick={() => setSelectedParentId(parent.id)}>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                      parent.appAdopted ? 'bg-brand-primary/10 text-brand-primary' : 'bg-muted text-text-secondary')}>
                      {parent.appAdopted ? <UserCheck size={16} /> : <Users size={16} />}
                    </div>
                    <div>
                      <p className="text-[13px] font-black italic font-display text-text-primary leading-none mb-1 flex items-center gap-2">
                        {parent.name}
                        {parent.isPTAExecutive && <span className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[8px] rounded uppercase">PTA Exec</span>}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{parent.phone}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {parent.wards.map(w => (
                      <span key={w.id} className="px-2 py-0.5 bg-muted text-text-secondary text-[10px] font-black italic font-display rounded-lg border border-border">{w.name}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div>
                    <p className="text-[11px] font-bold text-text-primary mb-0.5">{parent.lastContacted}</p>
                    <p className="text-[9px] font-black uppercase text-text-secondary tracking-tight">{parent.lastMessage}</p>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="outline" className="p-2" onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:${parent.phone}`;
                    }}>
                      <Phone size={14} />
                    </Button>
                    <Button variant="outline" className="p-2" onClick={(e) => { e.stopPropagation(); setSelectedParentId(parent.id); }}>
                      <MoreVertical size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredParents.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-text-secondary mb-4 font-display italic text-2xl">?</div>
            <EmptyState context="parents" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedParent && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedParentId(null)} className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative w-full max-w-xl bg-surface h-full shadow-2xl">
              <ParentProfile parent={selectedParent} onClose={() => setSelectedParentId(null)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBroadcasting && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md" onClick={() => setIsBroadcasting(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-surface rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-8 bg-brand-primary text-primary-foreground flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black italic font-display">Broadcast Terminal</h3>
                  <p className="text-[10px] font-black uppercase text-primary-foreground/50 tracking-widest mt-1">Global Household Communication Protocol</p>
                </div>
                <X className="cursor-pointer hover:text-primary-foreground/80 transition-all" onClick={() => setIsBroadcasting(false)} />
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Target Population</label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select Population" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Guardians">All Guardians</SelectItem>
                        <SelectItem value="SHS 3 Boarder Parents">SHS 3 Boarder Parents</SelectItem>
                        <SelectItem value="Gov't Funded Wards">Gov't Funded Wards</SelectItem>
                        <SelectItem value="Day Parent Protocol">Day Parent Protocol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Template Core</label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select Template" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Custom Message">Custom Message</SelectItem>
                        <SelectItem value="PTA Meeting Invitation">PTA Meeting Invitation</SelectItem>
                        <SelectItem value="Terminal Report Dispatch">Terminal Report Dispatch</SelectItem>
                        <SelectItem value="Re-opening Schedule">Re-opening Schedule</SelectItem>
                        <SelectItem value="WASSCE Registration Portal Closing">WASSCE Registration Portal Closing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Broadcast Payload</label>
                  <Textarea rows={4} className="w-full px-6 py-4" placeholder="Type your strategic institutional message here..." />
                </div>
                <div className="p-5 bg-brand-primary/10 rounded-[2rem] border border-brand-primary flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary text-primary-foreground rounded-xl flex items-center justify-center"><FileText size={18} /></div>
                    <div>
                      <p className="text-[11px] font-black text-brand-primary uppercase tracking-widest">Report Card Sync</p>
                      <p className="text-[9px] font-black text-brand-primary uppercase">Push PDF Reports to App</p>
                    </div>
                  </div>
                  <div className="w-10 h-5 bg-brand-primary/20 rounded-full relative">
                    <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-brand-primary rounded-full" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsBroadcasting(false)} className="flex-1 py-4 bg-muted rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-muted transition-all">Abort Blast</button>
                  <button className="flex-1 py-4 bg-brand-dark text-primary-foreground rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                    <Send size={14} /> Execute Blast
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-xl bg-surface rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-6 bg-brand-dark text-primary-foreground flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black italic font-display">Register Guardian</h3>
                  <p className="text-[10px] font-black uppercase text-primary-foreground/50 tracking-widest mt-1">Enrol new parent into institutional registry</p>
                </div>
                <X className="cursor-pointer hover:text-destructive transition-all" onClick={() => setIsCreateModalOpen(false)} />
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">First Name</label>
                    <Input value={newParentForm.firstName} onChange={(e) => setNewParentForm({ ...newParentForm, firstName: e.target.value })} className="w-full" placeholder="Kwame" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Last Name</label>
                    <Input value={newParentForm.lastName} onChange={(e) => setNewParentForm({ ...newParentForm, lastName: e.target.value })} className="w-full" placeholder="Mensah" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Phone</label>
                  <Input value={newParentForm.phone} onChange={(e) => setNewParentForm({ ...newParentForm, phone: e.target.value })} className="w-full" placeholder="+233 24 000 0000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Email</label>
                  <Input value={newParentForm.email} onChange={(e) => setNewParentForm({ ...newParentForm, email: e.target.value })} className="w-full" placeholder="parent@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-text-secondary tracking-widest ml-1">Occupation</label>
                  <Input value={newParentForm.occupation} onChange={(e) => setNewParentForm({ ...newParentForm, occupation: e.target.value })} className="w-full" placeholder="Trader" />
                </div>

                <div className="border-t border-border pt-5">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3">Link Wards</p>
                  <div className="space-y-2">
                    <Input
                      placeholder="Search students by name or index number..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full"
                    />
                    {studentSearch && (
                      <div className="bg-muted border border-border rounded-xl max-h-40 overflow-y-auto">
                        {students
                          .filter(s => {
                            const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
                            const index = (s.indexNumber || '').toLowerCase();
                            const q = studentSearch.toLowerCase();
                            return !selectedStudentIds.includes(s.id) && (name.includes(q) || index.includes(q));
                          })
                          .slice(0, 8)
                          .map(s => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSelectedStudentIds(prev => [...prev, s.id]);
                                setStudentSearch('');
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-surface transition-all flex items-center justify-between border-b border-border last:border-0"
                            >
                              <div>
                                <p className="text-[11px] font-bold text-text-primary">{s.firstName} {s.lastName}</p>
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">{s.indexNumber}</p>
                              </div>
                              <Plus size={14} className="text-brand-primary" />
                            </button>
                          ))}
                        {students.filter(s => {
                          const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
                          const index = (s.indexNumber || '').toLowerCase();
                          const q = studentSearch.toLowerCase();
                          return !selectedStudentIds.includes(s.id) && (name.includes(q) || index.includes(q));
                        }).length === 0 && (
                          <p className="text-[10px] text-text-secondary px-4 py-3 italic">No matching students found</p>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedStudentIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedStudentIds.map(id => {
                        const s = students.find(st => st.id === id);
                        if (!s) return null;
                        return (
                          <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-[10px] font-black border border-brand-primary/20">
                            {s.firstName} {s.lastName}
                            <button onClick={() => setSelectedStudentIds(prev => prev.filter(pid => pid !== id))} className="hover:text-destructive transition-all">
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-3">
                  <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 bg-muted rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-muted transition-all">Cancel</button>
                  <button onClick={handleCreateParent} disabled={createParentMutation.isPending} className="flex-1 py-3 bg-brand-dark text-primary-foreground rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                    <UserPlus size={14} /> {createParentMutation.isPending ? 'Registering...' : 'Register Guardian'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HODParentRegistry;
