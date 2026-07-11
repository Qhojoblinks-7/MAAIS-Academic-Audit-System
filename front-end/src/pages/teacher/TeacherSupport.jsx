import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle2, Clock, ArrowRight, Star, Edit, Lock, AlertCircle, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { teacherService } from '../../services';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

export function TeacherSupport() {
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [category, setCategory] = React.useState('General');
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [supportObservations, setSupportObservations] = React.useState([]);
  const [gradeIssues, setGradeIssues] = React.useState([]);
  const [statusStyles, setStatusStyles] = React.useState({});
  const [behaviorLogs, setBehaviorLogs] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const obs = await teacherService.getSupportObservations();
        const issues = await teacherService.getGradeIssues();
        const styles = await teacherService.getGradeIssueStatusMeta();
        setSupportObservations(obs || []);
        setGradeIssues(issues || []);
        setStatusStyles(styles || {});

        const uniqueStudentIds = [];
        const seen = new Set();
        for (const issue of issues || []) {
          const sid = issue.studentId || issue.student?.id || issue.recordId;
          if (sid && !seen.has(sid)) {
            seen.add(sid);
            uniqueStudentIds.push(sid);
          }
        }

        if (uniqueStudentIds.length > 0) {
          const behaviorPromises = uniqueStudentIds.slice(0, 10).map(id =>
            teacherService.getStudentBehavior(id).catch(err => {
              console.error(`[TeacherSupport] Failed to fetch behavior for ${id}:`, err);
              return null;
            })
          );
          const behaviorResults = await Promise.all(behaviorPromises);
          const logs = [];
          for (const result of behaviorResults) {
            if (result?.logs && Array.isArray(result.logs)) {
              logs.push(...result.logs);
            }
          }
          setBehaviorLogs(logs);
        }
      } catch (err) {
        console.error('Failed to load support data');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const categoryMap = {
        'Grade Entry': 'Academic',
        'Observation': 'Academic',
        'Technical': 'Technical',
        'General': 'General',
      };

      const ticketData = {
        title: title.trim(),
        description: message.trim(),
        category: categoryMap[category] || 'General',
        priority: 'MEDIUM',
      };
      
      await teacherService.submitSupportTicket(ticketData);
      
      setSuccessMessage('Ticket submitted successfully!');
      setTitle('');
      setMessage('');
      setCategory('General');
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setErrorMessage('Failed to submit ticket: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-2xl font-black text-foreground tracking-tighter mb-2">Teacher ICT Support</h1>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Grade issues · observation flags · technical help</p>
        </header>

        {successMessage && (
          <div className="mb-4 p-4 rounded-2xl bg-success/10 border border-success/20 text-success flex items-center gap-3">
            <CheckCircle2 size={20} className="text-success" />
            <span>{successMessage}</span>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
            <AlertCircle size={20} className="text-destructive" />
            <span>{errorMessage}</span>
          </div>
        )}

        <section className="bg-card rounded-[2rem] border border-border p-8 shadow-sm mb-8">
          <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3 mb-6">
            <Star className="text-foreground" size={20} />
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest">My Observations</h2>
          </div>
          <div className="space-y-4">
            {supportObservations.map((obs, i) => (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 bg-muted border-l-4 border-success rounded-2xl border-t border-r border-b"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-black text-success bg-success/10 px-2.5 py-1 rounded uppercase tracking-widest">
                    {obs.type}
                  </span>
                  <span className="text-xs font-black text-muted-foreground ">
                    {obs.date}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground  leading-relaxed">
                  "{obs.comment}"
                </p>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-2">
                  Re: {obs.student} &middot; Obs. by {obs.teacher}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-card rounded-[2rem] border border-border p-8 shadow-sm mb-8">
          <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3 mb-6">
            <AlertCircle className="text-foreground" size={20} />
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest">Grade Issue Flags</h2>
          </div>
          <div className="space-y-3">
            {gradeIssues.map((issue) => (
              <Card key={issue.id} className="p-4">
                <div>
                  <p className="text-sm font-black text-foreground mb-0.5">{issue.issue}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {issue.subject} &middot; {issue.className} &middot; {issue.date}
                  </p>
                </div>
                <span className={cn("text-xs font-black px-2 py-1 rounded uppercase tracking-widest")}>
                  {issue.status}
                </span>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-card rounded-[2rem] border border-border p-8 shadow-sm mb-8">
          <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3 mb-6">
            <Users className="text-foreground" size={20} />
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest">Behavior Observations</h2>
          </div>
          <div className="space-y-3">
            {behaviorLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No behavior observations recorded yet.</p>
            ) : (
              behaviorLogs.slice(0, 5).map((log, i) => (
                <motion.div
                  key={log.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-muted border-l-4 border-brand-primary rounded-2xl border-t border-r border-b"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded uppercase tracking-widest">
                      {log.remarks ? 'Recorded' : 'No Remarks'}
                    </span>
                    <span className="text-xs font-black text-muted-foreground ">
                      {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {log.remarks && (
                    <p className="text-xs font-medium text-foreground  leading-relaxed">
                      "{log.remarks}"
                    </p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs font-black text-muted-foreground uppercase tracking-wider">
                    {log.punctuality && <span>Punctuality: {log.punctuality}/5</span>}
                    {log.attendance && <span>Attendance: {log.attendance}/5</span>}
                    {log.attitude && <span>Attitude: {log.attitude}/5</span>}
                    {log.conduct && <span>Conduct: {log.conduct}/5</span>}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="bg-card rounded-[2rem] border border-border p-8 shadow-sm mb-8">
          <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3 mb-6">
            <QrCode className="text-foreground" size={20} />
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest">Raise New Ticket</h2>
          </div>
          <div className="space-y-4">
            <form onSubmit={handleSubmit}>
              <Input 
                type="text" 
                placeholder="Brief description of the issue..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-6 py-4 font-black placeholder:text-muted-foreground" 
                disabled={loading}
              />
              <Textarea 
                placeholder="Include class, subject, student details..." 
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-6 py-4 placeholder:text-muted-foreground disabled:opacity-50" 
                disabled={loading}
              />
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {['Grade Entry', 'Observation', 'Technical', 'General'].map(t => (
                    <Button 
                      key={t} 
                      variant={category === t ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategory(t)}
                      disabled={loading}
                      className="text-xs font-black rounded-lg uppercase tracking-widest"
                    >
                      {t}
                    </Button>
                  ))}
                </div>
                <p className="text-xs font-medium text-muted-foreground">Selected: {category}</p>
              </div>
              <Button 
                type="submit"
                disabled={loading || !title.trim()}
                className="w-full py-3 font-black uppercase tracking-widest shadow-lg"
              >
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
   );
}