import { calcRoman } from '../pages/shared/GradingSheet.constants';

class ReportEngine {
  generateWAECCSV(rows, subjectName = 'Subject', className = 'Class') {
    const headers = ['Index', 'Student Name', 'SBA', 'Exam', 'Final', 'Grade', 'Roman'];
    const dataRows = (rows || []).map((s) => [
      s.index ?? '',
      `"${(s.name ?? '').replace(/"/g, '""')}"`,
      s.sba ?? 0,
      s.exam ?? 0,
      s.final ?? 0,
      s.grade ?? '',
      calcRoman(s.grade),
    ]);
    return [headers, ...dataRows].map((r) => r.join(',')).join('\r\n');
  }

  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  generateBroadsheet(students, subjectName, className, term, academicYear) {
    const rows = students.map((s) => ({
      index: s.indexNumber,
      name: s.name,
      sba: s.sba || 0,
      exam: s.exam || 0,
      final: s.final || 0,
      grade: s.grade || 'F9',
    }));

    const csv = this.generateWAECCSV(rows, subjectName, className);
    const header = [
      `Broadsheet Report`,
      `Subject: ${subjectName}`,
      `Class: ${className}`,
      `Term: ${term}`,
      `Academic Year: ${academicYear}`,
      `Generated: ${new Date().toISOString()}`,
      ``,
    ].join('\r\n');

    return `${header}${csv}`;
  }

  generateSummaryReport(data, groupBy = 'class') {
    const summary = {};

    data.forEach((item) => {
      const key = item[groupBy] || 'Unknown';
      if (!summary[key]) {
        summary[key] = {
          total: 0,
          count: 0,
          grades: {},
        };
      }
      summary[key].total += item.final || 0;
      summary[key].count += 1;
      const grade = item.grade || 'F9';
      summary[key].grades[grade] = (summary[key].grades[grade] || 0) + 1;
    });

    return Object.entries(summary).map(([key, stats]) => ({
      [groupBy]: key,
      average: stats.count > 0 ? (stats.total / stats.count).toFixed(2) : 0,
      count: stats.count,
      gradeDistribution: stats.grades,
    }));
  }
}

export const reportEngine = new ReportEngine();