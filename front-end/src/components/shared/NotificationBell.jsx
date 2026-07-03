import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { notification } from '../../services/notificationService';
import { eventBus } from '../../services/eventBus';
import { useRole } from '../../context/RoleContext';

export function NotificationBell() {
  const { user } = useRole();
  const userId = user?.id || user?.staffId;
  const userProfileId = user?.profileId;
  const role = user?.role;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        let unread;
        if (role === 'STUDENT' && userProfileId) {
          unread = await notification.getUnreadForStudent(userProfileId);
        } else {
          unread = await notification.getUnread();
        }
        setNotifications(unread || []);
        setUnreadCount(unread ? unread.length : 0);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications
    const realTimeUnsubscribe = notification.subscribeRealTime((notificationData) => {
      // Add new notification to the list
      setNotifications(prev => {
        // Avoid duplicates
        const exists = prev.some(n => n.id === notificationData.id);
        if (exists) return prev;
        
        return [notificationData, ...prev];
      });
      
      // Increment unread count if notification is unread
      if (!notificationData.read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    const handleNotification = () => {
      fetchNotifications();
    };

    const unsubscribe1 = eventBus.on('hod-comment-added', handleNotification);
    const unsubscribe2 = eventBus.on('grade-revision-rejected', handleNotification);
    const unsubscribe3 = eventBus.on('grade-revision-requested', handleNotification);
    const unsubscribe4 = eventBus.on('grade-revision-approved', handleNotification);

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
      realTimeUnsubscribe();
    };
  }, [userId, role, userProfileId]);

  const markAsRead = async (notificationId) => {
    try {
      await notification.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-gray-400 hover:text-gray-600" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 rounded-full text-xs font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>
      
      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
          <div className="px-4 pt-2 pb-3 space-y-2 sm:px-6">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No new notifications</p>
            ) : (
              <>
                {notifications.slice(0, 5).map(notif => (
                  <div key={notif.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-3 w-3 rounded-full 
                        {notif.read ? 'bg-gray-300' : 'bg-indigo-500'}">
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                      <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                      <time className="text-xs text-gray-400">{new Date(notif.timestamp || notif.createdAt).toLocaleTimeString()}</time>
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="ml-2 text-xs text-blue-500 hover:underline"
                      >
                        {notif.read ? 'Read' : 'Mark as read'}
                      </button>
                    </div>
                  </div>
                ))}
                {notifications.length > 5 && (
                  <div className="text-center pt-2">
                    <a href="/notifications" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      View all {notifications.length} notifications
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="px-4 py-3 text-sm text-center">
            <button
              onClick={closeDropdown}
              className="w-full text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}