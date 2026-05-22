import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ConfirmationDialog({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && open && onCancel && !isLoading) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onCancel, isLoading]);

  if (!open) return null;

  const variantStyles = {
    danger: {
      button: 'bg-rose-600 hover:bg-rose-700 text-white',
      iconBg: 'bg-rose-100 text-rose-600',
    },
    primary: {
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    warning: {
      button: 'bg-amber-500 hover:bg-amber-600 text-white',
      iconBg: 'bg-amber-100 text-amber-600',
    },
  };

  const v = variantStyles[variant] || variantStyles.danger;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-message"
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !isLoading && onCancel?.()}
      />

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', v.iconBg)}>
            <AlertTriangle size={20} />
          </div>

          <div className="flex-1 min-w-0">
            <h2
              id="confirmation-dialog-title"
              className="text-sm font-bold text-gray-900"
            >
              {title}
            </h2>
            <p
              id="confirmation-dialog-message"
              className="text-xs text-gray-500 mt-1 leading-relaxed"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-xs font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5',
              v.button
            )}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
