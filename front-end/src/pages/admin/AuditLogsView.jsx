import React, { useState, useMemo } from 'react';
import { ShieldCheck, User, Clock, ArrowRight, Search, Filter, X, ChevronDown, Download, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { useAdminAuditLogs } from '../../lib/hooks/api/admin';

const parseUserAgent = (userAgent) => {
  if (!userAgent || userAgent === 'Internal') return { browser: 'Internal', os: 'System', device: 'Server' };
  
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  if (userAgent.includes('Firefox/')) browser = 'Firefox';
  else if (userAgent.includes('Edg/')) browser = 'Edge';
  else if (userAgent.includes('Chrome/')) browser = 'Chrome';
  else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Opera/') || userAgent.includes('OPR/')) browser = 'Opera';

  if (userAgent.includes('Windows NT 10.0')) os = 'Windows';
  else if (userAgent.includes('Mac OS X')) os = 'macOS';
  else if (userAgent.includes('Linux') && !userAgent.includes('Android')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  if (userAgent.includes('Mobile')) device = 'Phone';
  else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) device = 'Tablet';

  return { browser, os, device };
};

const getUserDisplayName = (log) => {
  if (log.userName) return log.userName;
  if (log.userEmail) {
    const namePart = log.userEmail.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }
  return 'System';
};

export function AuditLogsView() {
  const auditLogsQuery = useAdminAuditLogs();
  
  const actionBadgeStyles = {
    UPDATE: 'bg-warning/10 text-warning border-warning/20',
    LOCK: 'bg-success/10 text-success border-success/20',
    CREATE: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    DELETE: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      toast.error('No logs to export');
      return;
    }
    const headers = ['Timestamp', 'Action', 'Student', 'Subject', 'Old Value', 'New Value', 'Justification', 'User'];
    const rows = filteredLogs.map(log => [
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS'),
      log.action,
      log.studentName,
      log.subject,
      log.oldValue,
      log.newValue,
      log.justification,
      log.userId,
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredLogs.length} audit log entries`);
  };

  const handleExport = () => {
    exportToCSV();
  };

  const handleFilterToggle = () => {
    setShowFilterPanel(prev => !prev);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAction('ALL');
  };

  const auditLogs = React.useMemo(() => {
    if (auditLogsQuery.data?.logs) {
      return auditLogsQuery.data.logs.map((log) => {
        const payload = log.payload || {};
        const action = log.action || 'UPDATE';
        let studentName = 'System';
        let subject = log.entity || 'N/A';
        let oldValue = '';
        let newValue = '';
        let justification = '';

        if (payload.studentId) {
          studentName = payload.studentName || `Student ${payload.studentId.slice(0, 8)}`;
        }
        if (payload.subjectId) {
          subject = payload.subjectName || `Subject ${payload.subjectId.slice(0, 8)}`;
        }

        if (action === 'GRADE_CORRECTION') {
          oldValue = typeof payload.oldValue === 'string' ? payload.oldValue : '';
          newValue = typeof payload.newValue === 'string' ? payload.newValue : '';
          justification = payload.justification || '';
          if (payload.fieldChanged) {
            subject = `${subject} (${payload.fieldChanged})`;
          }
        } else if (action === 'CREATE' || action === 'UPDATE') {
          const newObj = payload.newValue || {};
          const oldObj = payload.oldValue || {};
          if (newObj.grade) newValue = `Grade: ${newObj.grade}`;
          else if (newObj.totalScore != null) newValue = `Score: ${newObj.totalScore}`;
          else if (newObj.classScore != null) newValue = `SBA: ${newObj.classScore}`;
          if (oldObj.grade) oldValue = `Grade: ${oldObj.grade}`;
          else if (oldObj.totalScore != null) oldValue = `Score: ${oldObj.totalScore}`;
          else if (oldObj.classScore != null) oldValue = `SBA: ${oldObj.classScore}`;
        } else if (action === 'LOCK' || action === 'UNLOCK') {
          newValue = action === 'LOCK' ? 'Locked' : 'Unlocked';
        }

        const userAgentInfo = parseUserAgent(log.userAgent);

        return {
          id: log.id,
          timestamp: log.createdAt || new Date().toISOString(),
          action,
          studentName,
          subject,
          oldValue,
          newValue,
          justification,
          userId: log.userEmail || log.userId,
          userName: payload.userName || payload.actorName || null,
          ipAddress: log.ipAddress || 'Internal',
          userAgent: log.userAgent || 'Internal',
          userAgentParsed: userAgentInfo,
          severity: action === 'DELETE' ? 'ERROR' : action === 'CREATE' || action === 'GRADE_CORRECTION' ? 'INFO' : 'WARNING',
          category: ['CREATE','UPDATE','LOCK','UNLOCK','GRADE_CORRECTION'].includes(action) ? 'ACADEMIC' : 'SYSTEM',
          metadata: payload,
        };
      });
    }
    return [];
  }, [auditLogsQuery.data]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = !searchQuery || 
        log.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
      return matchesSearch && matchesAction;
    });
  }, [auditLogs, searchQuery, selectedAction]);

  return (
    <div className="flex-1 overflow-y-auto bg-background py-5 px-8 pb-32 lg:pb-24 scrollbar-hide">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
         className="w-full"
      >
        {/* View Header */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center text-primary-foreground shadow-xl shadow-foreground/10">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-foreground tracking-tighter leading-none italic uppercase font-display">
                Audit Repository
              </h1>
              <p className="text-[10px] font-black text-success uppercase tracking-widest mt-1">
                Mandatory cryptographically verifiable modification log
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleExport}
              variant="outline" 
              size="sm" 
              className="font-black uppercase tracking-widest text-muted-foreground"
            >
               Export Audit Log
            </Button>
            <Button 
              onClick={handleFilterToggle}
              variant="default" 
              size="sm" 
              className="font-black uppercase tracking-widest bg-success"
            >
              <Filter size={14} className="mr-2" />
              Filter Nodes
            </Button>
          </div>
        </header>

        {/* Filter Panel */}
        {showFilterPanel && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 bg-surface border border-border rounded-[2rem] p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-black text-text-primary uppercase tracking-wider">Filter Audit Logs</h3>
              <button onClick={() => setShowFilterPanel(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <X size={16} className="text-text-secondary" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input 
                  type="text" 
                  placeholder="Search student, subject, user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-[12px] font-bold text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-success/20 focus:border-success transition-all"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <select 
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-background border border-border rounded-xl text-[12px] font-bold text-text-primary uppercase tracking-wider outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-success/20 focus:border-success transition-all"
                >
                  <option value="ALL">All Actions</option>
                  <option value="UPDATE">Update</option>
                  <option value="CREATE">Create</option>
                  <option value="DELETE">Delete</option>
                  <option value="LOCK">Lock</option>
                  <option value="UNLOCK">Unlock</option>
                  <option value="GRADE_CORRECTION">Grade Correction</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" size={14} />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={clearFilters}
                  className="w-full py-3 bg-muted text-text-secondary border border-border rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            {(searchQuery || selectedAction !== 'ALL') && (
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Active Filters:</span>
                {searchQuery && (
                  <span className="px-2 py-1 bg-success/10 text-success border border-success/20 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    Search: {searchQuery}
                  </span>
                )}
                {selectedAction !== 'ALL' && (
                  <span className="px-2 py-1 bg-success/10 text-success border border-success/20 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    Action: {selectedAction}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}

         {/* Audit Log Table */}
         <Card className="rounded-[2.5rem] overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                {filteredLogs.length} {filteredLogs.length === 1 ? 'Record' : 'Records'} Found
              </span>
              {(searchQuery || selectedAction !== 'ALL') && (
                <span className="text-[9px] font-bold text-text-secondary">
                  Showing filtered results
                </span>
              )}
            </div>
            <div className="overflow-x-auto scrollbar-hide">
             <Table>
               <TableHeader>
                 <TableRow className="bg-muted/30 border-b border-border">
                   <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Timestamp</TableHead>
                   <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Custodian</TableHead>
                   <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Affected Record</TableHead>
                   <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Action Type</TableHead>
                   <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Delta</TableHead>
                   <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Justification</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody className="divide-y divide-muted/50">
                 {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50 transition-colors group">
                    
                    {/* Timestamp */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                        <Clock size={12} className="opacity-40" />
                        {format(new Date(log.timestamp), 'MMM d, HH:mm')}
                      </div>
                    </TableCell>

                     {/* Custodian User */}
                     <TableCell className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-muted rounded-lg flex items-center justify-center text-muted-foreground group-hover:bg-success/10 group-hover:text-success transition-colors">
                           <User size={12} />
                         </div>
                         <div className="flex flex-col">
                           <span className="text-[12px] font-black text-foreground tracking-tight">{getUserDisplayName(log)}</span>
                           <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                             <Globe size={8} />
                             {log.userAgentParsed.browser} / {log.userAgentParsed.os}
                           </span>
                         </div>
                       </div>
                     </TableCell>

                      {/* Affected Record (Student/Subject) */}
                     <TableCell className="px-6 py-4 whitespace-nowrap">
                       <div className="flex flex-col">
                         <span className="text-[12px] font-black text-foreground tracking-tight">{log.studentName}</span>
                         <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest leading-none mt-0.5">{log.subject}</span>
                         {log.ipAddress && log.ipAddress !== 'Internal' && (
                           <span className="text-[8px] font-bold text-muted-foreground mt-0.5">IP: {log.ipAddress}</span>
                         )}
                       </div>
                     </TableCell>

                    {/* Action Type */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest ${actionBadgeStyles[log.action] || 'bg-muted text-muted-foreground border-border'}`}>
                        {log.action}
                      </span>
                    </TableCell>

                    {/* Delta Difference */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {log.action === 'UPDATE' ? (
                        <div className="flex items-center gap-2 text-[11px] font-black">
                          <span className="text-muted-foreground/30 line-through">{log.oldValue}</span>
                          <ArrowRight size={12} className="text-muted-foreground/20" />
                          <span className="text-success">{log.newValue}</span>
                        </div>
                      ) : log.action === 'CREATE' ? (
                        <span className="text-[11px] font-black text-success">{log.newValue}</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-bold tracking-widest">NONE</span>
                      )}
                    </TableCell>

                    {/* Context Justification */}
                    <TableCell className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-xs">
                        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed italic opacity-70 group-hover:opacity-100 transition-opacity">
                          "{log.justification}"
                        </p>
                      </div>
                    </TableCell>

                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Filter size={32} className="text-text-secondary/30" />
                        <p className="text-[11px] font-black text-text-secondary uppercase tracking-widest">No matching audit records</p>
                        <p className="text-[10px] text-text-secondary">Try adjusting your filter criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
