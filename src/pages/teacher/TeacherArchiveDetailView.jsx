import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { GradingSheet } from "../shared/GradingSheet";
import { useRole } from "../../context/RoleContext";
import MOCK from "../../data/teacherMockData.json";

const SKELETON_ARCHIVED_RECORDS = MOCK?.skeletonArchivedRecords?.items || [];

const SUBJECT_CONFIG = {
  "General Agriculture": {
    sections: ["Paper 1 (50)", "Paper 2-Agri (90)", "Paper 3-Pract (60)"],
    maxRaw: 200,
    sectionCount: 3,
    hasPractical: true,
    practicalMarks: 60,
    sbaLabel: "SBA (30%)",
    examLabel: "Exam (70%)",
  },
  "Animal Science": {
    sections: ["Paper 1 (50)", "Paper 2-Agri (90)", "Paper 3-Pract (60)"],
    maxRaw: 200,
    sectionCount: 3,
    hasPractical: true,
    practicalMarks: 60,
    sbaLabel: "SBA (30%)",
    examLabel: "Exam (70%)",
  },
  "Integrated Science": {
    sections: ["Sec A (40)", "Sec B (60)"],
    maxRaw: 100,
    sectionCount: 2,
    hasPractical: false,
    practicalMarks: 0,
    sbaLabel: "SBA (30%)",
    examLabel: "Exam (70%)",
  },
  Mathematics: {
    sections: ["Sec A (40)", "Sec B (60)"],
    maxRaw: 100,
    sectionCount: 2,
    hasPractical: false,
    practicalMarks: 0,
    sbaLabel: "SBA (30%)",
    examLabel: "Exam (70%)",
  },
};

const ARCHIVE_STUDENTS = {
  t1: [
    {
      id: "001",
      name: "Angela Owusu",
      index: "001",
      form: "SHS 3",
      programme: "AGRICULTURE",
      secA: 35,
      secB: 50,
      secC: 38,
      sba: 28.5,
      exam: 61.5,
      final: 90.0,
      grade: "A1",
    },
    {
      id: "003",
      name: "Yaw Boateng",
      index: "003",
      form: "SHS 3",
      programme: "AGRICULTURE",
      secA: 35,
      secB: 50,
      secC: 38,
      sba: 28.5,
      exam: 61.5,
      final: 90.0,
      grade: "A1",
    },
    {
      id: "004",
      name: "Esi Ansah",
      index: "004",
      form: "SHS 3",
      programme: "AGRICULTURE",
      secA: 32,
      secB: 48,
      secC: 35,
      sba: 26.0,
      exam: 55.0,
      final: 81.0,
      grade: "A1",
    },
    {
      id: "009",
      name: "Ama Serwaa",
      index: "009",
      form: "SHS 3",
      programme: "AGRICULTURE",
      secA: 30,
      secB: 40,
      secC: 35,
      sba: 25.0,
      exam: 50.0,
      final: 75.0,
      grade: "A1",
    },
  ],
};

const getArchiveRecord = (id) =>
  SKELETON_ARCHIVED_RECORDS.find((r) => r.id === id);

const getMockStudents = (record) => {
  if (!record) return [];
  const key = record.subject.toLowerCase().includes("agric")
    ? "General Agriculture"
    : record.subject.toLowerCase().includes("animal")
      ? "Animal Science"
      : record.subject.toLowerCase().includes("math")
        ? "Mathematics"
        : record.subject.toLowerCase().includes("science")
          ? "Integrated Science"
          : null;
  return key && ARCHIVE_STUDENTS["t1"]
    ? ARCHIVE_STUDENTS["t1"].map((s) => ({ ...s, subject: key }))
    : ARCHIVE_STUDENTS["t1"] || [];
};

export function TeacherArchiveDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useRole();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchive = async () => {
      if (!user?.id || !id) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `/api/archive/teacher/${id}?teacher_id=${encodeURIComponent(user.id)}`,
        );
        setRecord(
          response.ok
            ? (await response.json()).record || getArchiveRecord(id)
            : getArchiveRecord(id),
        );
      } catch (err) {
        setRecord(getArchiveRecord(id));
      } finally {
        setLoading(false);
      }
    };
    fetchArchive();
  }, [user?.id, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-3" />
        <p className="text-xs font-medium text-slate-400">
          Opening archive workspace...
        </p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-500">
          Archive record not found
        </p>
        <button
          onClick={() => navigate("/teacher/archive")}
          className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
        >
          Back to Archive
        </button>
      </div>
    );
  }

  const subjectKey = record.subject.includes("Mathematics")
    ? "Mathematics"
    : record.subject.includes("Animal")
      ? "Animal Science"
      : record.subject.includes("Science")
        ? "Integrated Science"
        : "General Agriculture";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 antialiased">
      {/* Context Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/teacher/archive")}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-baseline gap-2">
              <h1 className="text-sm font-bold text-slate-900">
                {record.subject}
              </h1>
              <span className="text-xs text-slate-400 font-medium">
                ({record.class} •{" "}
                {record.year || record.academicYear || "2023/2024"})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md border border-slate-200">
            <Lock size={12} className="text-slate-400" />
            <span>Read-Only</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs flex-1">
          <GradingSheet
            classInfo={{
              id: record.id,
              subject: subjectKey,
              className: record.class,
              programme: "AGRICULTURE",
              studentCount: record.students,
              form: "SHS 3",
              academicYear: record.year || record.academicYear || "2023/2024",
            }}
            students={getMockStudents(record)}
            subjectConfig={SUBJECT_CONFIG}
            stpRules={[
              {
                check: (s) => s.final > 100,
                message: "Final score exceeds 100%",
              },
              { check: (s) => s.sba > 30, message: "SBA exceeds 30% limit" },
              { check: (s) => s.exam > 70, message: "Exam exceeds 70% limit" },
            ]}
            isTermFinalized={true}
          />
        </div>
      </main>
    </div>
  );
}
