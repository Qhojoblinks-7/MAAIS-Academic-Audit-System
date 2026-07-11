import React, { useState, useEffect } from 'react';
import { Bell, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { notification } from '../services/notificationService';
import { eventBus } from '../services/eventBus';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/molecules';

export function NotificationsPage() {
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
      <div className="flex h-screen bg-background font-sans">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="hidden lg:block"></div>
          <main className="flex-1 flex overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-8">
              <div className="flex items-center justify-center py-24">
                <p className="text-sm font-medium text-muted-foreground">Loading notifications…</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 bg-surface border-r border-border">
        <div className="flex-shrink-0 flex items-center px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Notifications</h2>
        </div>
        <nav className="mt-10 space-y-1 px-6">
          <a 
            href="/teacher-dashboard" 
            className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted"
          >
            <svg className="h-5 w-5 text-muted-foreground mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 011-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 00-1-1h-3a1 1 0 00-1 1v4a1 1 0 001 1h3z" />
            </svg>
            Dashboard
          </a>
          <a 
            href="/teacher/grading" 
            className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted"
          >
            <svg className="h-5 w-5 text-muted-foreground mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Grading
          </a>
          <a 
            href="/notifications" 
            className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-brand-primary bg-brand-primary/5"
          >
            <Bell className="h-5 w-5 text-brand-primary mr-3" />
            Notifications
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="hidden lg:block"></div>
        <main className="flex-1 flex overflow-hidden relative">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/teacher-dashboard')}
                  className="p-2 hover:bg-muted rounded-md"
                >
                  <ChevronLeft size={20} className="text-muted-foreground hover:text-foreground" />
                </button>
                <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={markAllAsRead}
                  disabled={notifications.every(n => n.read)}
                  className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-foreground"
                >
                  Mark all as read
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <EmptyState context="notifications" variant="compact" />
              ) : (
                <>
                  {notifications.map(notif => (
                    <div key={notif.id} className={cn(
                      "border rounded-lg p-4",
                      notif.isRead ? "bg-surface border-border" : "bg-brand-primary/5 border-brand-primary/20"
                    )}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                            <Bell size={16} />
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className={cn(
                              "text-lg font-medium",
                  notif.isRead ? "text-foreground" : "text-brand-primary"
                            )}>{notif.title}</h3>
                            <time className="text-xs text-muted-foreground">
                              {new Date(notif.createdAt).toLocaleDateString()} 
                              {new Date(notif.createdAt).toLocaleTimeString()}
                            </time>
                          </div>
                          <p className="text-sm text-text-secondary">{notif.body || notif.message || ''}</p>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => markAsRead(notif.id)}
                              className={cn(
                                "px-2.5 py-1 text-xs font-medium rounded",
                  notif.isRead ? "bg-muted text-text-secondary hover:bg-muted" : 
                                "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20"
                            )}>
                              {notif.isRead ? 'Read' : 'Mark as read'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}