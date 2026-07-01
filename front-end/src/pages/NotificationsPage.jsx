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

    return () => {
      unsubscribe1();
      unsubscribe2();
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
      <div className="flex h-screen bg-[#F9F9F7] font-sans">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="hidden lg:block"></div>
          <main className="flex-1 flex overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-8">
              <div className="flex items-center justify-center py-24">
                <p className="text-sm font-medium text-gray-400">Loading notifications…</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F9F9F7] font-sans">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 bg-white border-r border-gray-200">
        <div className="flex-shrink-0 flex items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        </div>
        <nav className="mt-10 space-y-1 px-6">
          <a 
            href="/teacher-dashboard" 
            className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 011-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 00-1-1h-3a1 1 0 00-1 1v4a1 1 0 001 1h3z" />
            </svg>
            Dashboard
          </a>
          <a 
            href="/teacher/grading" 
            className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Grading
          </a>
          <a 
            href="/notifications" 
            className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-indigo-600 bg-indigo-50"
          >
            <Bell className="h-5 w-5 text-indigo-500 mr-3" />
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
                  className="p-2 hover:bg-gray-200 rounded-md"
                >
                  <ChevronLeft size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={markAllAsRead}
                  disabled={notifications.every(n => n.read)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
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
                      notif.read ? "bg-white border-gray-200" : "bg-indigo-50 border-indigo-200"
                    )}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
                            <Bell size={16} />
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className={cn(
                              "text-lg font-medium",
                  notif.read ? "text-gray-900" : "text-indigo-800"
                            )}>{notif.title}</h3>
                            <time className="text-xs text-gray-400">
                              {new Date(notif.timestamp).toLocaleDateString()} 
                              {new Date(notif.timestamp).toLocaleTimeString()}
                            </time>
                          </div>
                          <p className="text-sm text-gray-600">{notif.message}</p>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => markAsRead(notif.id)}
                              className={cn(
                                "px-2.5 py-1 text-xs font-medium rounded",
                  notif.read ? "bg-gray-200 text-gray-600 hover:bg-gray-300" : 
                                "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                            )}>
                              {notif.read ? 'Read' : 'Mark as read'}
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