/**
 * ErrorHandler — unified error-handling policy for MAAIS HOD (JS variant).
 *
 * Responsibilities:
 *  1. Normalise all thrown/thrown-like errors into AppError.
 *  2. Map HTTP status codes to user-facing messages.
 *  3. Log actionable details for debugging without leaking secrets.
 */

const USER_FACING_MESSAGES = {
  400: 'The request was malformed. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: "You don't have permission to perform that action. Contact your system administrator.",
  404: 'The requested resource was not found.',
  422: 'The data you submitted has issues. Please review and correct them.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'An unexpected server error occurred. Our team has been notified.',
  502: 'The server is temporarily unavailable. Please try again in a moment.',
  503: 'The service is temporarily offline for maintenance.',
};

export class AppError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class ErrorHandler {
  /**
   * Convert any thrown value into a user-friendly AppError.
   * Never throws — always returns an AppError.
   */
  normalize(error) {
    if (error instanceof AppError) return error;

    if (error instanceof TypeError) {
      return new AppError(
        'Network error. Please check your connection and try again.',
        0,
        'NETWORK_ERROR',
        error.message,
      );
    }

    if (typeof error === 'string') {
      return new AppError(error, 0, 'STRING_ERROR');
    }

    const anyErr = error; // eslint-disable-line no-var
    const status = anyErr?.status ?? anyErr?.response?.status ?? 0;
    const message = anyErr?.message || 'An unexpected error occurred.';
    const code =
      anyErr?.code ||
      (status >= 500 ? 'SERVER_ERROR' : status === 401 ? 'UNAUTHORIZED' : 'UNKNOWN_ERROR');

    const mapped =
      USER_FACING_MESSAGES[status] || USER_FACING_MESSAGES[0] || message;
    return new AppError(mapped, status, code, anyErr?.details ?? anyErr?.response?.data);
  }

  /**
   * Return only the user-visible message to the UI layer.
   */
  getDisplay(error) {
    if (error instanceof AppError) return error.message;
    return 'An unexpected error occurred.';
  }

  /**
   * Log error details for developers / SRE without leaking secrets.
   */
  log(error, context) {
    if (process.env.NODE_ENV === 'production') {
      console.error(context ? `[MAAIS][${context}]` : '[MAAIS]', this.getDisplay(error));
      return;
    }
    console.groupCollapsed(context ? `[MAAIS Error] ${context}` : '[MAAIS Error]');
    console.error(this.normalize(error));
    if (error instanceof Error) {
      console.error('stack', error.stack);
    }
    console.groupEnd();
  }

  /**
   * Convenience wrapper: handles an async fn and returns { ok, error } tuple.
   * UI: const { ok, data, error } = handler.safe(() => doSomething())
   */
  async safe(fn, context) {
    try {
      const data = await fn();
      return { ok: true, data, error: null };
    } catch (rawError) {
      const err = this.normalize(rawError);
      this.log(err, context);
      return { ok: false, error: err };
    }
  }
}

export const errorHandler = new ErrorHandler();
