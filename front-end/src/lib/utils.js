import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatStudentName(student) {
  if (!student) return 'Unknown';
  const last = student.lastName || student.last_name || student.lastname || '';
  const first = student.firstName || student.first_name || student.firstname || '';
  const middle = student.middleName || student.middle_name || student.middlename || '';
  return `${last} ${first} ${middle}`.replace(/\s+/g, ' ').trim() || student.email || 'Unknown';
}
