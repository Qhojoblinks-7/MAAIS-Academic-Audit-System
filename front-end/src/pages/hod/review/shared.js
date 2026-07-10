import { statusStyles, severityStyles } from '../../shared/RevisionsFeed';

export { statusStyles, severityStyles };

export const REVIEW_VIEWS = {
  APPROVALS: 'approvals',
  REVISIONS: 'revisions',
  LOCK: 'lock',
};

export function isResolvedStatus(status) {
  const s = (status || '').toUpperCase();
  return s === 'RESOLVED' || s === 'REJECTED';
}

export function statusLabel(status) {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'AWAITING_APPROVAL':
      return 'Awaiting Approval';
    case 'TEACHER_REPLIED':
      return 'Teacher Replied';
    case 'REJECTED':
      return 'Rejected';
    case 'RESOLVED':
      return 'Resolved';
    default:
      return 'Unknown';
  }
}

export function formatTime(isoString) {
  if (!isoString) return 'Unknown';
  const date = new Date(isoString);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function countPending(revisions = []) {
  return revisions.filter(
    (r) => !isResolvedStatus(r.status),
  ).length;
}
