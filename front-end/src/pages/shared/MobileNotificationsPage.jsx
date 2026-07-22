import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, CheckCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import { notification } from '../../services/notificationService';
import { eventBus } from '../../services/eventBus';

export function MobileNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId') || 
                      sessionStorage.getItem('userId');
        if (!userId) {
          navigate('/');
          return;
        }
        
        const unread = await notification.getUnread();
        setNotifications(unread || []);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const handleNotification = () => {
      fetchNotifications();
    };

    const unsubscribe1 = eventBus.on('hod-comment-added', handleNotification);
    const unsubscribe2 = eventBus.on('grade-revision-rejected', handleNotification);
    const unsubscribe3 = eventBus.on('grade-revision-requested', handleNotification);
    const unsubscribe4 = eventBus.on('grade-revision-approved', handleNotification);
    const unsubscribe5 = eventBus.on('grade-revision-response', handleNotification);

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
      unsubscribe5();
    };
  }, [navigate]);

  const markAsRead = async (notificationId) => {
    try {
      await notification.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.read)
          .map(n => notification.markAsRead(n.id))
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-success/30 border-t-success rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-primary">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex-1 flex flex-col bg-background no-scrollbar">
      <header className="bg-surface border-b border-border px-4 py-3 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-transform"
            >
              <ChevronLeft size={18} className="text-primary" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-black text-primary truncate leading-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-[9px] font-bold text-brand-secondary uppercase tracking-widest truncate">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0',
                unreadCount === 0
                  ? 'bg-muted text-text-secondary cursor-not-allowed'
                  : 'bg-success/10 text-success active:scale-95'
              )}
            >
              <CheckCheck size={14} />
              Read All
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-text-secondary mb-4 border border-border">
              <Bell size={24} />
            </div>
            <h3 className="text-base font-black text-primary mb-1">No Notifications</h3>
            <p className="text-xs font-medium text-text-secondary">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif, idx) => (
              <div
                key={notif.id}
                style={{ animationDelay: `${idx * 40}ms` }}
                className={cn(
                  'rounded-2xl p-4 border transition-all',
                  notif.read
                    ? 'bg-surface border-border'
                    : 'bg-brand-primary/5 border-brand-primary/20'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
                    notif.read ? 'bg-muted text-text-secondary' : 'bg-brand-primary/10 text-brand-primary'
                  )}>
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={cn(
                        'text-sm font-black truncate',
                        notif.read ? 'text-primary' : 'text-brand-primary'
                      )}>
                        {notif.title}
                      </h3>
                      <time className="text-[10px] font-bold text-text-secondary whitespace-nowrap shrink-0">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                    <p className="text-xs font-medium text-text-secondary leading-relaxed mb-3">
                      {notif.body || notif.message || ''}
                    </p>
                    {!notif.read && (
                      <button
                        type="button"
                        onClick={() => markAsRead(notif.id)}
                        className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
