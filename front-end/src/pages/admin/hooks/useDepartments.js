import { useState, useEffect } from 'react';
import { getDepartmentColor } from '../../../constants/departments';

const CHECKLIST_ITEMS = [
  'HOD authority verified',
  'Curriculum mapping complete',
  'Staff onboarding done',
  'Assessment templates deployed',
  'Audit trail initialized',
  'Resource allocation confirmed',
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function pickRandomColor(seed) {
  return getDepartmentColor(seed);
}

export function normalizeDept(dept, index, fallbackStaff) {
  const hodId = dept?.hodId || `STF-${String(index + 1).padStart(3, '0')}`;
  const hodName = dept?.hodName || `HOD ${index + 1}`;

  const teacherCount =
    typeof dept?.teacherCount === 'number'
      ? dept.teacherCount
      : Math.floor(Math.random() * 20) + 5;

  const validationStatus =
    typeof dept?.validationStatus === 'number'
      ? dept.validationStatus
      : Math.floor(Math.random() * 55) + 45;

  const randomColor = pickRandomColor(dept?.id || dept?.name || String(index));
  const staff = Array.isArray(dept?.staff) && dept.staff.length > 0 ? dept.staff : fallbackStaff;

  const checklist = CHECKLIST_ITEMS.map((item, ci) => ({
    id: `${dept?.id || index}-cl-${ci}`,
    label: item,
    completed: Math.random() > 0.4,
  }));

  return {
    id: dept?.id ?? String(index + 1),
    name: dept?.name ?? ['Science', 'Mathematics', 'Languages', 'Business'][index % 4],
    hodName,
    hodId,
    teacherCount,
    description:
      dept?.description || `${dept?.name ?? ['Science', 'Mathematics', 'Languages', 'Business'][index % 4]} department covering various academic disciplines.`,
    validationStatus,
    color: randomColor.color,
    iconColor: randomColor.iconColor,
    hex: randomColor.hex,
    light: randomColor.light,
    lightText: randomColor.lightText,
    border: randomColor.border,
    dark: randomColor.dark,
    darkText: randomColor.darkText,
    programs: dept?.programs && dept.programs.length ? dept.programs : [`${dept?.name ?? 'Department'} Program`],
    staff,
    checklist,
  };
}

export function normalizeDeptFromApi(dept, index) {
  const hodStaff = dept.staff?.find(s => s.user?.role === 'HOD');
  const hodName = hodStaff
    ? `${hodStaff.user.firstName || ''} ${hodStaff.user.lastName || ''}`.trim() || hodStaff.staffId || 'Unassigned'
    : 'Unassigned';
  const hodId = hodStaff?.id || null;

  const frontendStaff = (dept.staff || []).map(s => {
    const subjects = (s.teachingAssignments || [])
      .map(a => a.subject)
      .filter(Boolean)
      .map(sub => ({ id: sub.id, name: sub.name, code: sub.code }));

    return {
      id: s.id,
      name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.staffId,
      role: s.user?.role || 'TEACHER',
      isHOD: s.user?.role === 'HOD',
      staffId: s.staffId,
      subjects,
    };
  });

  const electives = (dept.subjects || [])
    .filter(s => s.type === 'ELECTIVE')
    .map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      teachers: (s.teachingAssignments || [])
        .map(a => a.teacher)
        .filter(Boolean)
        .map(t => ({
          id: t.id,
          name: `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.staffId,
          staffId: t.staffId,
        })),
    }));

  const randomColor = pickRandomColor(dept.id || dept.code || dept.name || String(index));

  const checklist = CHECKLIST_ITEMS.map((item, ci) => ({
    id: `${dept.id || index}-cl-${ci}`,
    label: item,
    completed: Math.random() > 0.4,
  }));

  return {
    id: dept.id,
    name: dept.name || 'Unknown',
    code: dept.code || '',
    head: hodName,
    hodName,
    hodId,
    teacherCount: dept._count?.staff || 0,
    description: dept.description || `${dept.name} department covering various academic disciplines.`,
    validationStatus: (hashString(dept.id) % 55) + 45,
    color: randomColor.color,
    iconColor: randomColor.iconColor,
    hex: randomColor.hex,
    light: randomColor.light,
    lightText: randomColor.lightText,
    border: randomColor.border,
    dark: randomColor.dark,
    darkText: randomColor.darkText,
    programs: [`${dept.name} Program`],
    electives,
    staff: frontendStaff,
    checklist,
    _raw: dept,
  };
}

export function buildInitialDepartments() {
  const names = ['Science', 'Mathematics', 'Languages', 'Business', 'General Arts', 'Home Economics', 'Technical'];
  const normalized = names.slice(0, 4).map((name, index) => {
    const fallbackStaff = [
      { id: `STF-${String(index + 1).padStart(3, '0')}`, name: `HOD ${index + 1}`, role: 'HOD', isHOD: true },
      { id: `STF-${String(index + 1).padStart(3, '0')}T`, name: `Teacher ${index + 1}`, role: 'Teacher', isHOD: false },
    ];
    return normalizeDept(
      { name, teacherCount: Math.floor(Math.random() * 20) + 5, validationStatus: Math.floor(Math.random() * 55) + 45 },
      index,
      fallbackStaff
    );
  });

  return normalized;
}

export function buildDistribution(depts) {
  const distributionData = depts.map((dept) => ({
    name: dept.name,
    teachers: dept.teacherCount,
    hex: dept.hex,
  }));

  return distributionData;
}