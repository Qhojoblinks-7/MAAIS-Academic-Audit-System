import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle2, Clock, ArrowRight, X, Star, AlertCircle, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { teacherService } from '../../services';

export function SupportView() {
  const navigate = useNavigate();
  const { user } = useRole();
  const [activeTab, setActiveTab] = React.useState('academics');
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [myObservations, setMyObservations] = React.useState([]);
  const [tickets, setTickets] = React.useState([]);
  const [behaviorLogs, setBehaviorLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [obs, issues, ticketData] = await Promise.all([
          teacherService.getSupportObservations(),
          teacherService.getGradeIssues(),
          teacherService.getObservationLogs(),
        ]);

        const observations = Array.isArray(obs) ? obs : [];
        const gradeIssues = Array.isArray(issues) ? issues : [];
        const logs = Array.isArray(ticketData) ? ticketData : [];

        const mappedObs = observations.map(o => ({
          id: o.id,
          type: o.type || 'Observation',
          student: o.student || 'Unknown Student',
          teacher: o.teacher || 'Unknown Teacher',
          comment: o.comment || o.observationText || '',
          date: o.date ? new Date(o.date).toLocaleDateString() : 'N/A',
        }));

        const mappedTickets = gradeIssues.map(issue => ({
          id: issue.id || issue.recordId,
          subject: issue.issue || 'Grade Issue',
          status: issue.status || 'OPEN',
          priority: 'MEDIUM',
          date: issue.date || new Date().toISOString().split('T')[0],
        }));

        setMyObservations(mappedObs);
        setTickets(mappedTickets);

        const uniqueStudentIds = [];
        const seen = new Set();
        for (const issue of gradeIssues) {
          const sid = issue.studentId || issue.student?.id || issue.recordId;
          if (sid && !seen.has(sid)) {
            seen.add(sid);
            uniqueStudentIds.push(sid);
          }
        }

        if (uniqueStudentIds.length > 0) {
          const behaviorPromises = uniqueStudentIds.slice(0, 10).map(id =>
            teacherService.getStudentBehavior(id).catch(err => {
              console.error(`[SupportView] Failed to fetch behavior for ${id}:`, err);
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
        console.error('[SupportView] Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusStyles = {
    OPEN: 'bg-gray-50 text-gray-600 border-gray-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    AWAITING_APPROVAL: 'bg-blue-50 text-blue-700 border-blue-100',
    PENDING: 'bg-orange-50 text-orange-700 border-orange-100',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-2">ICT Support Centre</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Raise tickets · track requests · view resolution history</p>
        </header>

        {/* Observation Feed */}
        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3 mb-6">
            <Star className="text-gray-900" size={20} />
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Behaviour Observations</h2>
          </div>
          <div className="space-y-4">
            {myObservations.map((obs, i) => (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 bg-gray-50 rounded-2xl border-l-4 border-emerald-500 border-t border-r border-b border-gray-100"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded uppercase tracking-widest">{obs.type}</span>
                  <span className="text-[9px] font-black text-gray-300 italic">{obs.date}</span>
                </div>
                <p className="text-sm font-medium text-gray-700 italic leading-relaxed">"{obs.comment}"</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Observed by {obs.teacher} · Re: {obs.student}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* New Ticket */}
        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3 mb-6">
            <QrCode className="text-gray-900" size={20} />
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Raise New Ticket</h2>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Ticket title..." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-black text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
            <textarea placeholder="Describe your issue in detail..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 resize-none" />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {['Academic', 'Technical', 'Finance', 'General'].map(t => (
                  <button key={t} className="px-3 py-1.5 bg-gray-100 text-gray-500 text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-gray-200 transition-all">{t}</button>
                ))}
              </div>
              <button className="px-6 py-3 bg-emerald-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg">Submit Ticket</button>
            </div>
          </div>
        </section>

        {/* Ticket List */}
        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3 mb-6">
            <Clock className="text-gray-900" size={20} />
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">My Tickets</h2>
          </div>
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all">
                <div>
                  <p className="text-sm font-black text-gray-900 mb-0.5">{t.subject}</p>
                  <p className="text-[10px] font-bold text-gray-400">{t.date}</p>
                </div>
                <span className={cn("text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest border", statusStyles[t.status] || 'bg-gray-50 text-gray-500')}>{t.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
