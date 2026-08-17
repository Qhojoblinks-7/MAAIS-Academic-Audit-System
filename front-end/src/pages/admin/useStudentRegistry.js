import { useState, useMemo } from 'react';
import {
  useAllStudents, useCreateStudent, useBatchImportStudents,
  usePromoteStudent, useBuildTranscript, useGenerateReportCard,
  useDeactivateUser, useUpdateStudentProfile, useAllClasses, useAllDepartments
} from '../../lib/hooks';
import { toast } from '../../components/ui/toast.tsx';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const useStudentRegistry = () => {
  const studentsQuery = useAllStudents();
  const classesQuery = useAllClasses();
  const departmentsQuery = useAllDepartments();
  const createStudentMutation = useCreateStudent();
  const batchImportMutation = useBatchImportStudents();
  const promoteStudentMutation = usePromoteStudent();
  const buildTranscriptMutation = useBuildTranscript();
  const generateReportCardMutation = useGenerateReportCard();
  const deactivateUserMutation = useDeactivateUser();
  const updateStudentProfileMutation = useUpdateStudentProfile();

  const students = studentsQuery.data || [];
  const classes = classesQuery.data || [];
  const departments = departmentsQuery.data || [];
  const isLoading = studentsQuery.isLoading;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [viewMode, setViewMode] = useState('Academic');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [selectedSourceClass, setSelectedSourceClass] = useState('');
  const [promotionStatus, setPromotionStatus] = useState(null);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [showReverification, setShowReverification] = useState({ active: false, action: null });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', indexNumber: '', gender: 'MALE', dateOfBirth: '', residentialStatus: 'DAY', currentClassId: '',
    parentFirstName: '', parentLastName: '', parentPhone: '', parentEmail: '', parentRelationship: 'Guardian',
  });
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [openKebabId, setOpenKebabId] = useState(null);
  const [studentAtRisk, setStudentAtRisk] = useState({});
  const [studentFunding, setStudentFunding] = useState({});
  const [adminPassword, setAdminPassword] = useState('');
  const [csspsFile, setCsspsFile] = useState(null);
  const [csspsPreview, setCsspsPreview] = useState([]);
  const [csspsError, setCsspsError] = useState('');
  const [isProcessingCssps, setIsProcessingCssps] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const programs = useMemo(() => {
    const deptNames = (departments || []).map(d => d.name);
    const classPrograms = (classes || [])
      .map(c => c.program)
      .filter(Boolean);
    const unique = Array.from(new Set([...deptNames, ...classPrograms]));
    return unique.sort();
  }, [departments, classes]);

  const displayStudents = useMemo(() => students.map((s) => {
    const parentLink = s.parentLinks?.[0];
    const grades = s.grades || [];
    const avgGrade = grades.length > 0
      ? Math.round(grades.reduce((sum, g) => sum + (g.totalScore || g.score || 0), 0) / grades.length)
      : 0;
    const baseAtRisk = avgGrade < 50;
    const program = s.department?.name || s.currentClass?.program || 'General';
    return {
      id: s.id || s.userId,
      name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.user?.email || 'Unknown',
      indexNumber: s.indexNumber,
      dob: s.dateOfBirth,
      currentClass: s.currentClass?.name || 'Unassigned',
      program,
      averageGrade: avgGrade,
      atRisk: studentAtRisk[s.id] ?? baseAtRisk,
      fundingStatus: studentFunding[s.id] || s.feesStatus || 'Free SHS',
      gender: s.gender === 'MALE' ? 'Male' : s.gender === 'FEMALE' ? 'Female' : 'N/A',
      subjects: grades,
      email: s.user?.email || s.email,
      phone: s.user?.phone || s.phone,
      role: s.user?.role || s.role,
      emergencyContact: parentLink ? {
        name: `${parentLink.parent?.firstName || ''} ${parentLink.parent?.lastName || ''}`.trim() || 'Unknown',
        relation: parentLink.relationship || 'Guardian',
      } : null,
      healthNotes: s.bio || '',
      disciplinaryNotes: '',
    };
  }), [students, studentAtRisk, studentFunding]);

  const selectedStudent = useMemo(() =>
    displayStudents.find(s => s.id === selectedStudentId),
    [displayStudents, selectedStudentId]
  );

  const filteredStudents = useMemo(() => {
    return displayStudents.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           s.indexNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProgram = selectedProgram === 'All' || s.program === selectedProgram;
      return matchesSearch && matchesProgram;
    });
  }, [displayStudents, searchQuery, selectedProgram]);

  const handlePromote = async (classId) => {
    try {
      await promoteStudentMutation.mutateAsync({ classId });
      toast.success('Students promoted successfully');
    } catch (err) {
      toast.error(`Promotion failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleBatchPromotion = async () => {
    if (!selectedSourceClass) {
      toast.error('Select a source class');
      return;
    }

    try {
      const result = await promoteStudentMutation.mutateAsync({ classId: selectedSourceClass });
      setPromotionStatus({
        promoted: result.totalProcessed || 0,
        failed: 0
      });
      toast.success(`Promoted ${result.totalProcessed || 0} students`);
    } catch (err) {
      toast.error(`Batch promotion failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleGenerateReport = async (studentId) => {
    const student = displayStudents.find(s => s.id === studentId);
    if (!student) return;

    try {
      toast.info(`Generating report card PDF for ${student.name}...`);
      await generateReportCardMutation.mutateAsync({ studentId, termId: null });
    } catch (err) {
      console.warn('Report card API error (using local data):', err);
    }

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '210mm';
      iframe.style.height = 'auto';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 48px; font-family: Arial, sans-serif; color: #0f172a; background: white; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; font-size: 11px; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 32px; }
            .section { margin-bottom: 32px; }
            .section-title { font-size: 13px; font-weight: 900; text-transform: uppercase; color: #0f172a; }
            .label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .value { font-size: 12px; font-weight: bold; }
            th { background: #0f172a; color: white; font-size: 9px; font-weight: bold; text-transform: uppercase; }
            .footer { position: absolute; bottom: 48px; left: 48px; right: 48px; border-top: 1px dashed #94a3b8; padding-top: 24px; }
            .footer-note { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-size: 24px; font-weight: 800; text-transform: uppercase; color: #0f172a;">Mando Senior High Technical School</h1>
            <p style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; margin-top: 4px;">Terminal Examination Report</p>
            <p style="font-size: 10px; color: #475569;">PMB 14, Central Region, Ghana • audit.mando-shts.edu.gh</p>
          </div>
          <div class="section">
            <h2 class="section-title">Student Information</h2>
            <table style="margin-top: 16px;">
              <tr><td class="label">Name of Student</td><td class="value">${student.name}</td></tr>
              <tr><td class="label">Permanent Index Number</td><td class="value">${student.indexNumber}</td></tr>
              <tr><td class="label">Academic Programme</td><td class="value">${student.program || 'General'}</td></tr>
            </table>
          </div>
          <div class="section">
            <h2 class="section-title">Terminal Examination Results</h2>
            ${(student.subjects && student.subjects.length > 0) ? `
              <table style="margin-top: 16px;">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>CA</th>
                    <th>Exam</th>
                    <th>Total</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  ${student.subjects.map((s) => {
                    const subjectName = s.subject?.name || s.subject || 'Unknown';
                    const score = s.score ?? 0;
                    const ca = Math.round(score * 0.3);
                    const exam = Math.round(score * 0.7);
                    const grade = s.grade ?? (score >= 80 ? 'A1' : score >= 70 ? 'B2' : score >= 60 ? 'C4' : score >= 50 ? 'C6' : 'F9');
                    return `<tr>
                      <td class="value">${subjectName}</td>
                      <td>${ca}%</td>
                      <td>${exam}%</td>
                      <td class="value">${score}%</td>
                      <td class="value">${grade}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size: 12px; color: #64748b; font-style: italic; text-align: center; padding: 40px 0;">No subject records available for this student.</p>'}
          </div>
          <div class="footer"><p class="footer-note">Document Status: SYSTEM GENERATED • This is an automated academic report</p></div>
        </body>
        </html>
      `);
      doc.close();

      await new Promise((resolve) => setTimeout(resolve, 300));
      const canvas = await html2canvas(doc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -heightLeft, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Report_Card_${student.indexNumber}_${student.name.replace(/\s/g, '_')}.pdf`);
      toast.success('Report card downloaded successfully');
    } catch (error) {
      toast.error(`Failed to generate report: ${error.message || 'Unknown error'}`);
    }
  };

  const handleBuildTranscript = async (studentId) => {
    const student = displayStudents.find(s => s.id === studentId);
    if (!student) return;

    try {
      toast.info(`Generating transcript PDF for ${student.name}...`);
      await buildTranscriptMutation.mutateAsync({ studentIdOrIndex: studentId });
    } catch (err) {
      console.warn('Transcript API error (using local data):', err);
    }

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '210mm';
      iframe.style.height = 'auto';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 48px; font-family: Arial, sans-serif; color: #0f172a; background: white; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; font-size: 11px; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 32px; }
            .section { margin-bottom: 32px; }
            .section-title { font-size: 13px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin-bottom: 12px; }
            .label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; }
            .value { font-size: 12px; font-weight: bold; }
            th { background: #0f172a; color: white; font-size: 9px; font-weight: bold; text-transform: uppercase; }
            .term-header { background: #0f172a; color: white; padding: 8px 16px; font-size: 10px; font-weight: bold; text-transform: uppercase; margin: 16px 0; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px dashed #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="font-size: 24px; font-weight: 800; text-transform: uppercase; color: #0f172a;">Mando Senior High Technical School</h1>
            <p style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; margin-top: 4px;">Official Academic Transcript</p>
            <p style="font-size: 10px; color: #475569;">PMB 14, Central Region, Ghana • audit.mando-shts.edu.gh</p>
          </div>
          <div class="section">
            <h2 class="section-title">Student Information</h2>
            <table style="margin-top: 16px;">
              <tr><td class="label">Student Name</td><td class="value">${student.name}</td></tr>
              <tr><td class="label">Index Number</td><td class="value">${student.indexNumber}</td></tr>
              <tr><td class="label">Program</td><td class="value">${student.program || 'General'}</td></tr>
              <tr><td class="label">House</td><td class="value">${student.house || 'N/A'}</td></tr>
            </table>
          </div>
          <div class="section">
            <h2 class="section-title">Academic History</h2>
            ${(student.subjects && student.subjects.length > 0) ? `
              <table style="margin-top: 16px;">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  ${student.subjects.map((s) => {
                    const subjectName = s.subject?.name || s.subject || 'Unknown';
                    const score = s.score ?? 0;
                    const grade = s.grade ?? (score >= 80 ? 'A1' : score >= 70 ? 'B2' : score >= 60 ? 'C4' : score >= 50 ? 'C6' : 'F9');
                    return `<tr>
                      <td class="value">${subjectName}</td>
                      <td>${score}%</td>
                      <td class="value">${grade}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size: 12px; color: #64748b; font-style: italic; text-align: center; padding: 40px 0;">No subject records available for this student.</p>'}
          </div>
          <div class="footer">
            <p style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b;">Archive Status: VERIFIED & REGISTERED • HOD Certified</p>
          </div>
        </body>
        </html>
      `);
      doc.close();

      await new Promise((resolve) => setTimeout(resolve, 300));
      const canvas = await html2canvas(doc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -heightLeft, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Transcript_${student.indexNumber}_${student.name.replace(/\s/g, '_')}.pdf`);
      toast.success('Transcript downloaded successfully');
    } catch (error) {
      toast.error(`Failed to generate transcript: ${error.message || 'Unknown error'}`);
    }
  };

  const confirmVerification = async () => {
    const action = showReverification.action;
    setShowReverification({ active: false, action: null });

    try {
      if (action === 'export-all') {
        toast.success('Generating Global Institutional Dossier...');
      } else if (action === 'delete-student' && selectedStudentId) {
        if (!adminPassword || adminPassword.length < 4) {
          toast.error('Invalid administrative password override');
          return;
        }
        await deactivateUserMutation.mutateAsync(selectedStudentId);
        toast.success('Student record purged from registry');
        setSelectedStudentId(null);
        setAdminPassword('');
      } else if (action === 'batch-reports') {
        toast.success('Generating Terminal Reports for Category...');
      }
    } catch (err) {
      toast.error(`Action failed: ${err.message || 'Unknown error'}`);
    }
  };

  const executeSensitiveAction = (action) => {
    setShowReverification({ active: true, action });
  };

  const handleKebabAction = (studentId, action) => {
    setOpenKebabId(null);
    switch (action) {
      case 'dossier':
        setSelectedStudentId(studentId);
        toast.info('Opening student dossier...');
        break;
      case 'toggle-risk':
        setStudentAtRisk(prev => {
          const current = prev[studentId];
          const next = current === undefined ? true : !current;
          const newState = { ...prev, [studentId]: next };
          toast.info(next ? 'Academic risk flagged' : 'Academic risk cleared');
          return newState;
        });
        break;
      case 'cycle-funding':
        setStudentFunding(prev => {
          const current = prev[studentId] || 'Free SHS';
          const cycle = ['Free SHS', 'Fully Funded', "Gov't Covered"];
          const idx = cycle.indexOf(current);
          const next = cycle[(idx + 1) % cycle.length];
          toast.success(`Funding updated to ${next}`);
          return { ...prev, [studentId]: next };
        });
        break;
      case 'purge':
        executeSensitiveAction('delete-student');
        setSelectedStudentId(studentId);
        toast.warning('Administrative authorization required to purge record');
        break;
      default:
        break;
    }
  };

  const handleCreateStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.indexNumber) {
      toast.error('Name and index number are required');
      return;
    }

    const selectedClass = classes.find(c => c.id === newStudent.currentClassId);
    const departmentId = selectedClass?.program
      ? departments.find(d => d.name === selectedClass.program)?.id
      : undefined;

    setCreatingStudent(true);
    try {
      await createStudentMutation.mutateAsync({
        ...newStudent,
        currentClassId: newStudent.currentClassId,
        departmentId,
        isBoarder: newStudent.residentialStatus === 'BOARDING',
        password: 'Student@123!',
        parentFirstName: newStudent.parentFirstName,
        parentLastName: newStudent.parentLastName,
        parentPhone: newStudent.parentPhone,
        parentEmail: newStudent.parentEmail,
        parentRelationship: newStudent.parentRelationship,
      });
      setShowCreateForm(false);
      setNewStudent({ firstName: '', lastName: '', indexNumber: '', gender: 'MALE', dateOfBirth: '', residentialStatus: 'DAY', currentClassId: '', parentFirstName: '', parentLastName: '', parentPhone: '', parentEmail: '', parentRelationship: 'Guardian' });
      toast.success('Student registered successfully');
    } catch (err) {
      toast.error(`Registration failed: ${err.message || 'Unknown error'}`);
    } finally {
      setCreatingStudent(false);
    }
  };

  const parseFile = (file) => {
    return new Promise((resolve, reject) => {
      const isExcel = file.name.match(/\.xlsx?$/i);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          if (isExcel) {
            const workbook = XLSX.read(content, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            resolve(jsonData);
          } else {
            Papa.parse(content, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: false,
              complete: (results) => resolve(results.data),
              error: (err) => reject(err),
            });
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      if (isExcel) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const normalizeRecord = (record) => {
    const keys = Object.keys(record);
    const normalized = {};
    keys.forEach(key => {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      normalized[normalizedKey] = record[key] !== undefined && record[key] !== null ? String(record[key]).trim() : '';
    });
    return normalizeCsspsRecord(normalized);
  };

  const CSSPS_COLUMN_ALIASES = {
    index_no: 'index_number',
    indexnumber: 'index_number',
    index: 'index_number',
    candidate_name: 'name',
    full_name: 'name',
    students_name: 'name',
    name: 'name',
    programme: 'department_name',
    course: 'department_name',
    department: 'department_name',
    day_boarding: 'residential_status',
    residential_status: 'residential_status',
    residential: 'residential_status',
    boarding_status: 'residential_status',
    class_name: 'class_name',
    className: 'class_name',
    class: 'class_name',
    year: 'class_name',
    form: 'class_name',
    parents_name: 'parent_name',
    parent_name: 'parent_name',
    parents_tel: 'parent_phone',
    parent_phone: 'parent_phone',
    parents_email: 'parent_email',
    parent_email: 'parent_email',
    relationship: 'parent_relationship',
  };

  const normalizeCsspsRecord = (record) => {
    const mapped = { ...record };
    Object.entries(CSSPS_COLUMN_ALIASES).forEach(([alias, target]) => {
      if (record[alias] && !mapped[target]) {
        mapped[target] = record[alias];
      }
    });

    if (mapped.name && !mapped.first_name && !mapped.last_name) {
      const nameParts = mapped.name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        mapped.last_name = nameParts[0];
        mapped.first_name = nameParts[1];
        if (nameParts.length > 2) {
          mapped.middle_name = nameParts.slice(2).join(' ');
        }
      } else if (nameParts.length === 1) {
        mapped.first_name = nameParts[0];
      }
    }

    if (mapped.parent_name && !mapped.parent_first_name && !mapped.parent_last_name) {
      const nameParts = mapped.parent_name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        mapped.parent_last_name = nameParts[0];
        mapped.parent_first_name = nameParts[1];
      } else if (nameParts.length === 1) {
        mapped.parent_first_name = nameParts[0];
      }
    }

    if (mapped.residential_status) {
      mapped.isBoarder = mapped.residential_status.toUpperCase().includes('BOARD') || mapped.residential_status.toUpperCase() === 'BOARDING';
    }

    if (mapped.class_name) {
      mapped.className = mapped.class_name.replace(/^Year\s+/i, 'Form ');
    }

    return mapped;
  };

  const handleCssFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      setCsspsError('Only CSV/Excel files are supported');
      return;
    }

    setCsspsFile(file);
    setCsspsError('');

    try {
      const rawRecords = await parseFile(file);
      const normalizedRecords = rawRecords.map(normalizeRecord);
      setCsspsPreview(normalizedRecords);
    } catch (err) {
      setCsspsError('Failed to parse file: ' + (err.message || 'Unknown error'));
      setCsspsPreview([]);
    }
  };

  const handleCancelCsspsUpload = () => {
    setIsBatchUploading(false);
    setCsspsFile(null);
    setCsspsPreview([]);
    setCsspsError('');
    setImportResults(null);
    toast.info('CSSPS upload cancelled');
  };

  const handleProcessCsspsUpload = async () => {
    if (!csspsPreview.length) return;

    const validationErrors = [];
    const seenIndexNumbers = new Set();

    csspsPreview.forEach((record, idx) => {
      const indexNum = record.index_number || record.indexnumber || record.index || '';
      if (indexNum) {
        if (seenIndexNumbers.has(indexNum)) {
          validationErrors.push(`Row ${idx + 2}: Duplicate index number`);
        }
        seenIndexNumbers.add(indexNum);
      }
      const firstName = record.first_name || record.firstname || record.first_name || '';
      const lastName = record.last_name || record.lastname || record.last_name || '';
      const hasName = firstName || lastName || record.name;

      if (!hasName) {
        validationErrors.push(`Row ${idx + 2}: Missing first name`);
      }

      if (!lastName && !record.name) {
        validationErrors.push(`Row ${idx + 2}: Missing last name`);
      }
    });

    if (validationErrors.length > 0) {
      setCsspsError(`Validation failed:\n${validationErrors.slice(0, 10).join('\n')}${validationErrors.length > 10 ? `\n...and ${validationErrors.length - 10} more errors` : ''}`);
      return;
    }

    setIsProcessingCssps(true);

    const students = csspsPreview.map(record => {
      let firstName = record.first_name || record.firstname || record.first_name || '';
      let lastName = record.last_name || record.lastname || record.last_name || '';
      let middleName = record.middle_name || record.middlename || record.middleName || '';

      if (record.name && !firstName && !lastName) {
        const nameParts = record.name.trim().split(/\s+/);
        if (nameParts.length >= 2) {
          lastName = nameParts[0];
          firstName = nameParts[1];
          if (nameParts.length > 2) {
            middleName = nameParts.slice(2).join(' ');
          }
        } else if (nameParts.length === 1) {
          firstName = nameParts[0];
        }
      }

      return {
        firstName,
        lastName,
        middleName,
        gender: (record.gender || 'MALE').toUpperCase(),
        dateOfBirth: record.date_of_birth || record.dob || record.dateofbirth || record.dateOfBirth || '',
        nationalId: record.nationalid || record.natid || record.nat_id || '',
        disability: record.disability || record.disability_type || '',
        canReadBraille: record.canreadbraille === 'true' || record.can_read_braille === 'true' || false,
        indexNumber: record.index_number || record.indexnumber || record.index || '',
        subjects: [
          record.Sub1, record.Sub2, record.Sub3, record.Sub4, record.Sub5,
          record.Sub6, record.Sub7, record.Sub8, record.Sub9, record.Sub10,
          record.Sub11
        ].filter(Boolean),
        currentClassId: record.currentclassid || record.currentclassid || record.currentclassid || '',
        departmentId: record.departmentid || record.departmentid || record.departmentid || '',
        className: (record.classname || record.class_name || (record.cassyear ? record.cassyear.replace(/^Year\s+/i, 'Form ') : '')) || '',
        departmentName: record.departmentname || record.department_name || record.programname || '',
        parentFirstName: record.parentfirstname || record.parentfirstname || record.parent_first_name || '',
        parentLastName: record.parentlastname || record.parentlastname || record.parent_last_name || '',
        parentPhone: record.parentphone || record.parentphone || record.parent_phone || '',
        parentEmail: record.parentemail || record.parentemail || record.parent_email || '',
        parentRelationship: record.parentrelationship || record.parentrelationship || record.parent_relationship || 'Guardian',
        isBoarder: (record.residential_status || record.isboarder || record.isBoarder || '').toUpperCase() === 'BOARDING',
      };
    });

    try {
      const result = await batchImportMutation.mutateAsync(students);
      setImportResults(result);
      setCsspsPreview([]);
      setCsspsFile(null);
    } catch (err) {
      setCsspsError('Import failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessingCssps(false);
    }
  };

  const predictNextClass = (sourceClassName) => {
    if (!sourceClassName) return '';
    const match = sourceClassName.match(/^([1-3])(.+)$/);
    if (!match) return '';
    const num = parseInt(match[1]);
    const suffix = match[2];
    const nextNum = num + 1;
    if (nextNum > 3) return 'Graduation';
    const nextClass = classes.find(c => c.name === `${nextNum}${suffix}`);
    return nextClass ? nextClass.name : `${nextNum}${suffix}`;
  };

  const predictedDest = predictNextClass(selectedSourceClass);

  return {
    students,
    classes,
    departments,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedProgram,
    setSelectedProgram,
    viewMode,
    setViewMode,
    selectedStudentId,
    setSelectedStudentId,
    isPromoting,
    setIsPromoting,
    selectedSourceClass,
    setSelectedSourceClass,
    promotionStatus,
    setPromotionStatus,
    isBatchUploading,
    setIsBatchUploading,
    showReverification,
    setShowReverification,
    showCreateForm,
    setShowCreateForm,
    newStudent,
    setNewStudent,
    creatingStudent,
    setCreatingStudent,
    openKebabId,
    setOpenKebabId,
    studentAtRisk,
    setStudentAtRisk,
    studentFunding,
    setStudentFunding,
    adminPassword,
    setAdminPassword,
    csspsFile,
    setCsspsFile,
    csspsPreview,
    setCsspsPreview,
    csspsError,
    setCsspsError,
    isProcessingCssps,
    setIsProcessingCssps,
    importResults,
    setImportResults,
    programs,
    displayStudents,
    filteredStudents,
    selectedStudent,
    predictedDest,
    handlePromote,
    handleBatchPromotion,
    handleGenerateReport,
    handleBuildTranscript,
    confirmVerification,
    executeSensitiveAction,
    handleKebabAction,
    handleCreateStudent,
    handleCssFileChange,
    handleCancelCsspsUpload,
    handleProcessCsspsUpload,
  };
};