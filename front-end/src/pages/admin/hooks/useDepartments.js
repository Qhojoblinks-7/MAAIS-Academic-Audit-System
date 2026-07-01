import { useState, useEffect } from 'react';

const DEPARTMENT_COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-teal-500'];
const ICON_COLOR_CLASSES = ['text-blue-600', 'text-emerald-600', 'text-purple-600', 'text-amber-600', 'text-rose-600', 'text-cyan-600', 'text-orange-600', 'text-teal-600'];

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
  const idx = hashString(seed) % DEPARTMENT_COLORS.length;
  return { color: DEPARTMENT_COLORS[idx], iconColor: ICON_COLOR_CLASSES[idx] };
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

  const frontendStaff = (dept.staff || []).map(s => ({
    id: s.id,
    name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.staffId,
    role: s.user?.role || 'TEACHER',
    isHOD: s.user?.role === 'HOD',
    staffId: s.staffId,
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
    programs: [`${dept.name} Program`],
    staff: frontendStaff,
    checklist,
    _raw: dept,
  };
}

export function buildInitialDepartments() {
  const names = ['Science', 'Mathematics', 'Languages', 'Business', 'General Arts', 'Visual Arts', 'Home Economics', 'Technical'];
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
  }));

  if (distributionData.length < 5) {
    distributionData.push({ name: 'Vocational', teachers: Math.floor(Math.random() * 15) + 5 });
  }

  return distributionData;
}