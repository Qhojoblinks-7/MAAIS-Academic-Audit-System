export const performanceDatasets = {
  'Avg Score': [
    { name: 'Science', value: 78, color: '#059669' },
    { name: 'Business', value: 82, color: '#0284c7' },
    { name: 'Gen Arts', value: 74, color: '#7c3aed' },
    { name: 'Home Econ', value: 88, color: '#db2777' },
    { name: 'Vis Arts', value: 68, color: '#ea580c' },
  ],
  'Completion': [
    { name: 'Science', value: 92, color: '#059669' },
    { name: 'Business', value: 95, color: '#0284c7' },
    { name: 'Gen Arts', value: 81, color: '#7c3aed' },
    { name: 'Home Econ', value: 89, color: '#db2777' },
    { name: 'Vis Arts', value: 72, color: '#ea580c' },
  ]
};

export const initialActivityLog = [
  { id: '1', time: '10:15 AM', event: 'SHS 3 Science 2 marks finalized by HOD.', type: 'academic' },
  { id: '2', time: '10:02 AM', event: 'Bulk SMS sent to SHS 1 Parents regarding PTA meeting.', type: 'comm' },
  { id: '3', time: '09:45 AM', event: 'New Student (Index #4492) added to House: Guggisberg.', type: 'system' },
  { id: '4', time: '09:12 AM', event: 'Server Sync: Database integrity check successful.', type: 'security' },
  { id: '5', time: '08:30 AM', event: 'Madam Gladys requested Password Reset.', type: 'support' },
];

export const initialPendingApprovals = [
  { id: '1', teacher: 'Mr. Owusu', detail: 'Index #001 Grade Change (C6 -> B3)', time: '2h ago', status: 'pending' },
  { id: '2', teacher: 'Mrs. Appiah', detail: 'Bulk Delete: SHS 2 Test Drafts', time: '4h ago', status: 'pending' },
  { id: '3', teacher: 'Mr. Mensah', detail: 'Late Enrollment Waiver: Index #512', time: '5h ago', status: 'pending' },
];

export const supportTickets = [
  { id: '1', user: 'Madam Gladys', issue: 'Password reset encryption loop', status: 'priority' },
  { id: '2', user: 'Chemistry Lab', issue: 'Tablet Node #14 sync error', status: 'active' },
];

export const vitalSigns = [
  { label: 'Student Census', value: '2,450', subtext: '1,800 Boarders / 650 Day', icon: 'Users', color: 'text-blue-600', bg: 'bg-blue-50', trend: '#2563eb' },
  { label: 'Faculty Engagement', value: '112', subtext: '8 Teachers offline', icon: 'GraduationCap', color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '#4f46e5' },
  { label: 'Grading Progress', value: '65%', subtext: 'Deadline: Oct 24th', icon: 'TrendingUp', color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '#059669', progress: 65 },
  { label: 'Flagged Activities', value: '14 Alerts', subtext: 'Integrity issues detected', icon: 'AlertCircle', color: 'text-rose-600', bg: 'bg-rose-50', trend: '#e11d48' },
];

export const fabActions = [
  { label: 'Register Node', icon: 'UserPlus', color: 'bg-white text-slate-900', hover: 'hover:bg-slate-100' },
  { label: 'Broadcast Pulse', icon: 'Radio', color: 'bg-white text-slate-900', hover: 'hover:bg-slate-100' },
  { label: 'Grade Entry Freeze', icon: 'Lock', color: 'bg-rose-600 text-white', hover: 'hover:bg-rose-700' },
];

export const registerNodeProtocols = [
  { label: 'Student Protocol', desc: 'Initialize profile data', icon: 'GraduationCap', path: '/identity/students' },
  { label: 'Faculty Protocol', desc: 'Provision access rights', icon: 'UserPlus', path: '/identity/staff' },
  { label: 'Guardian Protocol', desc: 'Link household nodes', icon: 'Users', path: '/identity/parents' }
];

export const broadcastChannels = ['In-App Push', 'Bulk SMS', 'Email'];