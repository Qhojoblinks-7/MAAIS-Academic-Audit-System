// Maps raw/technical errors into short, user-friendly messages for the UI.

const PATTERNS = [
  {
    test: /request timeout|aborterror|timed? out/i,
    message:
      'Saving is taking longer than expected. Your changes will retry automatically — please stay on this page.',
  },
  {
    test: /failed to fetch|network|econnrefused|load failed|offline/i,
    message:
      'Cannot reach the server. Check your internet connection and try again.',
  },
  {
    test: /grade entry is locked|grade entries are locked|are locked/i,
    message: 'Grade entries are locked. Contact your HOD to request an unlock.',
  },
  {
    test: /term is locked/i,
    message: 'The current term is locked. Grades can no longer be modified.',
  },
  {
    test: /modified by another user|conflict/i,
    message:
      'Some grades were changed elsewhere. Refresh the page and enter them again.',
  },
  {
    test: /403|forbidden/i,
    message: 'You do not have permission to save these grades.',
  },
  {
    test: /401|unauthorized|not authenticated/i,
    message: 'Your session has expired. Please sign in again.',
  },
  {
    test: /500|502|503|504|bad gateway|service unavailable/i,
    message: 'The server is temporarily unavailable. Please try again shortly.',
  },
];

export function friendlyErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const raw = error?.response?.message || error?.message || '';
  if (!raw) return fallback;
  for (const { test, message } of PATTERNS) {
    if (test.test(raw)) return message;
  }
  return raw.length > 120 ? fallback : raw;
}

export default friendlyErrorMessage;
