import { useState, useEffect } from 'react';
import mockApiData from '../../../data/mockApiData.json';

const rawDepartments = mockApiData.departments?.items || [];

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

  const colorClasses = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500'];
  const iconColorClasses = ['text-blue-600', 'text-emerald-600', 'text-purple-600', 'text-amber-600'];

  const staff = Array.isArray(dept?.staff) && dept.staff.length > 0 ? dept.staff : fallbackStaff;

  return {
    id: dept?.id ?? String(index + 1),
    name: dept?.name ?? ['Science', 'Mathematics', 'Languages', 'Business'][index % 4],
    hodName,
    hodId,
    teacherCount,
    description:
      dept?.description || `${dept?.name ?? ['Science', 'Mathematics', 'Languages', 'Business'][index % 4]} department covering various academic disciplines.`,
    validationStatus,
    color: colorClasses[index % colorClasses.length],
    iconColor: iconColorClasses[index % iconColorClasses.length],
    programs: dept?.programs && dept.programs.length ? dept.programs : [`${dept?.name ?? 'Department'} Program`],
    staff,
  };
}

export function buildInitialDepartments() {
  const normalized = rawDepartments.map((dept, index) => {
    const fallbackStaff = [
      { id: `STF-${String(index + 1).padStart(3, '0')}`, name: `HOD ${index + 1}`, role: 'HOD', isHOD: true },
      { id: `STF-${String(index + 1).padStart(3, '0')}T`, name: `Teacher ${index + 1}`, role: 'Teacher', isHOD: false },
    ];

    return normalizeDept(dept, index, fallbackStaff);
  });

  const filled = [...normalized];
  while (filled.length < 4) {
    const i = filled.length;
    const newName = ['Science', 'Mathematics', 'Languages', 'Business'][i % 4];

    const hodId = `STF-${String(i + 1).padStart(3, '0')}`;
    const staff = [
      { id: hodId, name: `HOD ${i + 1}`, role: 'HOD', isHOD: true },
      { id: `${hodId}T`, name: `Teacher ${i + 1}`, role: 'Teacher', isHOD: false },
    ];

    filled.push(
      normalizeDept(
        { id: String(i + 1), name: newName, teacherCount: Math.floor(Math.random() * 20) + 5, validationStatus: Math.floor(Math.random() * 55) + 45 },
        i,
        staff
      )
    );
  }

  return filled.slice(0, 4);
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