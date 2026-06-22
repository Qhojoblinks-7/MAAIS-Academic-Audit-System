import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, MessageSquare, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { teacherService } from '../../services';
import { useUI } from '../../context/UIContext';

export function RightPanel() {
  const navigate = useNavigate();
  const { setRightPanelVisible } = useUI();
  const [revisions, setRevisions] = React.useState([]);
  const [atRiskStudents, setAtRiskStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [revisionsData, issuesData] = await Promise.all([
          teacherService.getGradeRevisions(),
          teacherService.getGradeIssues(),
        ]);

        const revs = Array.isArray(revisionsData) ? revisionsData : [];
        const issues = Array.isArray(issuesData) ? issuesData : [];

        const mappedRevisions = revs.slice(0, 3).map((rev) => ({
          id: rev.id,
          studentName: rev.student || 'Unknown Student',
          class: rev.class || 'Unknown Class',
          comment: rev.issue || rev.justification || 'Grade revision requested',
          time: rev.time || 'Recent',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rev.student || 'default')}`,
        }));

        const uniqueStudents = [];
        const seen = new Set();
        for (const issue of issues) {
          const name = issue.student || issue.target?.split(' - ')[1]?.split(' (')[0] || 'Unknown Student';
          const index = issue.index || issue.studentId || '000';
          const key = `${name}-${index}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueStudents.push({
              id: issue.id || issue.recordId || key,
              name,
              index,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            });
          }
        }

        setRevisions(mappedRevisions);
        setAtRiskStudents(uniqueStudents.slice(0, 3));

        const hasData = mappedRevisions.length > 0 || uniqueStudents.length > 0;
        setRightPanelVisible(hasData);
      } catch (err) {
        console.error('[RightPanel] Failed to load data:', err);
        setRightPanelVisible(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setRightPanelVisible]);

  if (loading) {
    return (
      <aside className="w-80 h-screen bg-white border-l border-gray-200 p-6 flex flex-col gap-8 overflow-y-auto no-scrollbar">
        <div className="text-center text-xs text-gray-400 mt-10">Loading panel...</div>
      </aside>
    );
  }

  if (revisions.length === 0 && atRiskStudents.length === 0) {
    return null;
  }

  return (
    <aside className="w-80 h-screen bg-white border-l border-gray-200 p-6 flex flex-col gap-8 overflow-y-auto no-scrollbar">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900">Revisions Tab</h2>
          <Link to="/revisions" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            see more <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {revisions.map((rev) => (
            <div
              key={rev.id}
              onClick={() => navigate('/revisions')}
              className="p-4 rounded-2xl bg-gray-50 border border-gray-100 relative group hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                <img src={rev.avatar} alt={rev.studentName} className="w-10 h-10 rounded-full bg-emerald-100" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 truncate">{rev.studentName}</h4>
                  <p className="text-[10px] text-gray-500 mb-1">{rev.class}</p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <span className="font-bold text-emerald-800">HOD: </span>
                    "{rev.comment}"
                  </p>
                </div>
              </div>
              <span className="absolute bottom-4 right-4 text-[10px] text-gray-400">{rev.time}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-gray-900">Students At-Risk</h2>
          <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            see more <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {atRiskStudents.map((student) => (
            <div key={student.id} className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center gap-4 hover:border-red-100 hover:bg-red-50/30 transition-all group">
              <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full bg-red-50" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-gray-900 truncate">{student.name}</h4>
                <p className="text-[10px] text-gray-500">Index No. {student.index}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

