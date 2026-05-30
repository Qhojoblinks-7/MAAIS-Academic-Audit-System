import { Users, Server, Globe } from 'lucide-react';

export const adminUsers = [
  { id: '1', name: 'Martha Baah', role: 'HOD', dept: 'Home Ec', status: 'ACTIVE', lastLogin: '1h ago' },
  { id: '2', name: 'Anthony Hackman', role: 'ADMIN', dept: 'Administration', status: 'ACTIVE', lastLogin: 'Now' },
  { id: '3', name: 'Angela Owusu', role: 'STUDENT', dept: 'Agric', status: 'ACTIVE', lastLogin: '5h ago' },
  { id: '4', name: 'Samuel Boateng', role: 'TEACHER', dept: 'Science', status: 'INACTIVE', lastLogin: '2d ago' },
];

export const adminTabs = [
  { id: 'registry', label: 'Command Registry', icon: Users },
  { id: 'infrastructure', label: 'Infrastructure Hub', icon: Server },
  { id: 'protocols', label: 'Institutional Protocols', icon: Globe },
];

import { Cpu, Activity, HardDrive, RefreshCw } from 'lucide-react';

export const computeNodes = [
  { label: 'CPU Cluster B', value: '14%', icon: Cpu, color: 'text-emerald-600' },
  { label: 'RAM Verification', value: '3.2 GB', icon: Activity, color: 'text-blue-600' },
  { label: 'SSD Throughput', value: '450 MB/s', icon: HardDrive, color: 'text-purple-600' },
  { label: 'Active Requests', value: '42 ops', icon: RefreshCw, color: 'text-amber-600' },
];

export const backupSnapshots = [
  { id: 'snap_0x1', time: '2026-04-21 04:00', size: '1.2 GB', type: 'Automated' },
  { id: 'snap_0x2', time: '2026-04-20 04:00', size: '1.1 GB', type: 'Automated' },
  { id: 'snap_0x3', time: '2026-04-19 04:00', size: '1.1 GB', type: 'Manual' },
];

export const serviceHealth = [
  { label: 'Auth Gateway', status: 'Optimal' },
  { label: 'PDF Engine', status: 'Stable' },
  { label: 'Report Generator', status: 'Optimal' },
  { label: 'Email Relay', status: 'Degraded' },
];

export const securityPolicies = [
  { label: 'Multi-Factor Biometric Auth', desc: 'Enforce fingerprint/face unlock for all HOD certifications.', active: true },
  { label: 'Cryptographic Audit Trail', desc: 'Seal every mark entry with a unique institutional hash.', active: true },
  { label: 'Automated Variance Flagging', desc: 'Alert admins if grade swings exceed 30% per term.', active: false },
  { label: 'Dark Mode Enforcement', desc: 'Force low-light UI scaling for mobile nodes.', active: false },
];

export const registryStats = [
  { label: 'Authorized Units', value: '1,240', sub: '+12 this week' },
  { label: 'Active Sessions', value: '86', sub: 'Nominal' },
  { label: 'Pending Access', value: '0', sub: 'Clean Registry' },
  { label: 'Escalation Flags', value: '3', sub: 'Review Required' },
];