import React from "react";
import { ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { teacherService } from "../../services";
import { hodService } from "../../services/hodService";
import { useUI } from "../../context/UIContext";
import { useRole } from "../../context/RoleContext";

export function RightPanel() {
  const navigate = useNavigate();
  const { setRightPanelVisible } = useUI();
  const { user } = useRole();
  const isHOD = user?.role === "HOD";
  const [revisions, setRevisions] = React.useState([]);
  const [atRiskStudents, setAtRiskStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = async () => {
    try {
      const [revisionsData, issuesData] = await Promise.all([
        isHOD
          ? hodService.getGradeRevisions()
          : teacherService.getGradeRevisions(),
        isHOD
          ? hodService.getInterventionAlerts().catch(() => [])
          : teacherService.getGradeIssues().catch(() => []),
      ]);

      const revs = Array.isArray(revisionsData) ? revisionsData : [];
      const issues = Array.isArray(issuesData) ? issuesData : [];

      const mappedRevisions = revs.slice(0, 2).map((rev) => ({
         id: rev.id,
         studentName: rev.student || rev.studentName || "Unknown Student",
         class: rev.class || rev.className || "Unknown Class",
         comment: rev.issue || rev.justification || "Grade revision requested",
         time: rev.time || rev.createdAt || "Recent",
         avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rev.student || rev.studentName || "default")}`,
       }));

       const uniqueStudents = [];
       const seen = new Set();
       for (const issue of issues) {
         const name =
           issue.student ||
           issue.studentName ||
           issue.target?.split(" - ")[1]?.split(" (")[0] ||
           "Unknown Student";
         const index = issue.index || issue.studentIndex || issue.studentId || "000";
         const cls = issue.className || issue.class || '';
         const subject = issue.subject || '';
         const studentId = issue.studentId || issue.student?.id || index;
         const key = `${name}-${index}`;
         if (!seen.has(key)) {
           seen.add(key);
           uniqueStudents.push({
             id: issue.id || issue.recordId || key,
             name,
             index,
             class: cls,
             subject,
             studentId,
             avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
           });
         }
       }

      setRevisions(mappedRevisions);
      setAtRiskStudents(uniqueStudents.slice(0, 3));

      const hasData = mappedRevisions.length > 0 || uniqueStudents.length > 0;
      setRightPanelVisible(hasData);
    } catch (err) {
      console.error("[RightPanel] Failed to load data:", err);
      setRightPanelVisible(false);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [setRightPanelVisible, user?.role, isHOD]);

  if (loading) {
    return (
      <aside className="w-80 h-screen bg-surface border-l border-border p-6 flex flex-col gap-8 overflow-y-auto no-scrollbar">
        <div className="text-center text-xs text-muted-foreground mt-10">
          Loading panel...
        </div>
      </aside>
    );
  }

  if (revisions.length === 0 && atRiskStudents.length === 0) {
    return null;
  }

  return (
    <aside className="w-80 h-screen bg-surface border-l border-border flex flex-col overflow-y-auto no-scrollbar">
      <div className="p-6 flex flex-col gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest">Revisions Tab</h2>
            <Link
              to="/revisions"
              className="text-xs font-semibold text-brand-primary hover:text-brand-primary flex items-center gap-1"
            >
              see more <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {revisions.map((rev) => (
              <div
                key={rev.id}
                onClick={() => navigate("/revisions")}
                className="p-4 rounded-2xl bg-muted border border-border relative group hover:bg-success/10 transition-colors cursor-pointer"
              >
                <div className="flex gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.studentName}
                    className="w-10 h-10 rounded-full bg-success/10 shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0 pb-6">
                    <h4 className="font-bold text-sm text-foreground truncate">
                      {rev.studentName}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">{rev.class}</p>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                      <span className="font-bold text-brand-primary">HOD: </span>
                      {"\"" + rev.comment + "\""}
                    </p>
                  </div>
                </div>
                <span className="absolute bottom-4 right-4 text-xs text-muted-foreground whitespace-nowrap">
                      {rev.time ? new Date(rev.time).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black text-foreground uppercase tracking-widest">Students At-Risk</h2>
            <button 
              onClick={fetchData}
              className="text-xs font-semibold text-brand-primary hover:text-brand-primary flex items-center gap-1"
            >
              refresh <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {atRiskStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => {
                  if (!student.class || !student.subject) return;
                  navigate(`/grading?class=${encodeURIComponent(student.class)}&subject=${encodeURIComponent(student.subject)}&studentId=${encodeURIComponent(student.index)}&studentName=${encodeURIComponent(student.name)}&studentIndex=${encodeURIComponent(student.index)}&atRisk=true`);
                }}
                className="p-4 rounded-2xl bg-surface border-l-4 border-l-destructive border-y border-r border-border flex items-center gap-4 hover:bg-destructive/10 transition-all group cursor-pointer"
              >
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-10 h-10 rounded-full bg-destructive/10 shrink-0 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-foreground truncate">
                    {student.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Index No. {student.index}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
