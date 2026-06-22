import React from 'react';
import { ShieldCheck, User, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
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
import { useAnalyticsPulse as useAdminAnalyticsPulse } from '../../lib/hooks';

const actionBadgeStyles = {
  UPDATE: 'bg-warning/10 text-warning border-warning/20',
  LOCK: 'bg-success/10 text-success border-success/20',
  CREATE: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
  DELETE: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function AuditLogsView() {
  const analyticsQuery = useAdminAnalyticsPulse();
  const auditLogs = React.useMemo(() => {
    if (analyticsQuery.data?.recentActivity) {
      return analyticsQuery.data.recentActivity.map((activity, idx) => ({
        id: activity.id || `audit-${idx}`,
        studentName: activity.studentName || activity.target || 'System',
        subject: activity.subject || activity.action || 'N/A',
        action: activity.action || 'UPDATE',
        oldValue: activity.oldValue,
        newValue: activity.newValue,
        justification: activity.justification || activity.description || '',
        userId: activity.userId || activity.user || 'System',
        timestamp: activity.timestamp || new Date().toISOString(),
      }));
    }
    return [];
  }, [analyticsQuery.data]);

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 lg:p-12 pb-32 lg:pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* View Header */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center text-white shadow-xl shadow-foreground/10">
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
            <Button variant="outline" size="sm" className="font-black uppercase tracking-widest text-muted-foreground">
              Export Registry
            </Button>
            <Button variant="default" size="sm" className="font-black uppercase tracking-widest bg-success">
              Filter Nodes
            </Button>
          </div>
        </header>

        {/* Audit Log Table */}
        <Card className="rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-b border-border">
                  <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Timestamp</TableHead>
                  <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Custodian</TableHead>
                  <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Biological Node</TableHead>
                  <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Action Protocol</TableHead>
                  <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Delta</TableHead>
                  <TableHead className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Justification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-muted/50">
                {auditLogs.map((log) => (
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
                        <span className="text-[12px] font-black text-foreground tracking-tight">{log.userId}</span>
                      </div>
                    </TableCell>

                    {/* Target Node (Student/Subject) */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-black text-foreground tracking-tight">{log.studentName}</span>
                        <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest leading-none mt-0.5">{log.subject}</span>
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
              </TableBody>
            </Table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}