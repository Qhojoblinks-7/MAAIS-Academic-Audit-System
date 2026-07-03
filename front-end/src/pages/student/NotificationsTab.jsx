import React from 'react';
import { EmptyState } from '../../components/molecules';

export function NotificationsTab({ notifications, formatDate }) {
  return (
    <div className="space-y-2">
      {notifications.length > 0 ? (
        notifications.map((n, idx) => (
          <div key={idx} className={`p-3 rounded-xl border ${n.isRead ? 'bg-white/40 border-gray-200/60' : 'bg-brand-secondary/5 border-brand-secondary/20'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold text-gray-900">{n.title || n.message || 'Notification'}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{n.body || n.message || ''}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-secondary mt-1 shrink-0" />}
            </div>
            <p className="text-[9px] font-mono text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
          </div>
        ))
      ) : (
        <EmptyState context="notifications" variant="compact" />
      )}
    </div>
  );
}