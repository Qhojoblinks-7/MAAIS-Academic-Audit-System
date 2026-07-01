import { getAuthToken } from './auth';
import { dataSync } from './dataSyncLayer';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const NOTIFICATION_SOUND_URL = '/sounds/notification.mp3';

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: getHeaders(),
      credentials: 'include',
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
      throw new Error(`Notification request failed: ${res.status}`);
    }
    return res.status === 204 ? undefined : res.json();
  } catch (err) {
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      console.warn(`[NotificationService] Network error for ${method} ${path}: backend may be unreachable`);
      return null;
    }
    throw err;
  }
}

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.isAudioEnabled = true;
    this.listeners = new Set();
    this.realTimeListeners = new Set();
    
    // Subscribe to real-time notifications via WebSocket
    this.realTimeSubscription = dataSync.subscribe(this.handleRealTimeNotification.bind(this));
  }

  handleRealTimeNotification(event) {
    if (event.type === 'data' && event.payload?.type === 'notification') {
      const notificationData = event.payload.data;
      
      // Notify local listeners (for UI updates)
      this.realTimeListeners.forEach(listener => {
        try {
          listener(notificationData);
        } catch (err) {
          console.error('Error in real-time notification listener:', err);
        }
      });
      
      // Show browser notification if permission granted
      if (this.permission === 'granted') {
        this.showBrowserNotification(notificationData.title, {
          body: notificationData.message,
          icon: '/favicon.ico'
        });
      }
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) return 'unsupported';
    this.permission = await Notification.requestPermission();
    return this.permission;
  }

  async notify(title, options = {}) {
    if (this.permission !== 'granted') {
      this.permission = await this.requestPermission();
    }

    if (this.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        ...options,
      });
      if (this.isAudioEnabled) this.playSound();
      return notification;
    }
  }

  showBrowserNotification(title, options = {}) {
    if (!('Notification' in window) || this.permission !== 'granted') return;
    
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      ...options,
    });
    
    if (this.isAudioEnabled) this.playSound();
    return notification;
  }

  playSound() {
    try {
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {
      // Audio play failed silently
    }
  }

  async sendHODAlert(teacherId, action, details) {
    // Send via REST API (for persistence)
    try {
      const result = await request('POST', '/comms/notifications/hod-action', {
        teacherId,
        action,
        details,
        timestamp: new Date().toISOString(),
      });
      
      // Also send via WebSocket for real-time delivery
      dataSync.send({
        type: 'notification',
        data: {
          id: Date.now().toString(), // Temporary ID, will be replaced by server
          teacherId,
          action,
          details,
          timestamp: new Date().toISOString(),
          title: this.getNotificationTitle(action),
          message: this.getNotificationMessage(action, details),
          read: false
        }
      });
      
      return result;
    } catch (err) {
      console.error('Failed to send HOD alert:', err);
      throw err;
    }
  }

  async notifyTeacherOfHODAction(teacherId, actionType, recordId, message) {
    return this.sendHODAlert(teacherId, actionType, { recordId, message });
  }

  async notifyHODOfTeacherAction(recordId, actionType, message) {
    return this.sendTeacherAlertToHOD(null, actionType, { recordId, message });
  }

  async sendTeacherAlertToHOD(teacherId, action, details) {
    // Send via REST API (for persistence)
    try {
      const result = await request('POST', '/comms/notifications/teacher-action', {
        teacherId,
        action,
        details,
        timestamp: new Date().toISOString(),
      });
      
      // Also send via WebSocket for real-time delivery
      dataSync.send({
        type: 'notification',
        data: {
          id: Date.now().toString(), // Temporary ID, will be replaced by server
          teacherId,
          action,
          details,
          timestamp: new Date().toISOString(),
          title: this.getNotificationTitleForHOD(action),
          message: this.getNotificationMessageForHOD(action, details),
          read: false
        }
      });
      
      return result;
    } catch (err) {
      console.error('Failed to send teacher alert to HOD:', err);
      throw err;
    }
  }

  getNotificationTitle(action) {
    const titles = {
      'GRADE_DRAFT_SAVED': 'Grade Draft Saved',
      'GRADE_SUBMITTED_TO_HOD': 'Grade Submitted for Review',
      'GRADE_REVISION_REQUESTED': 'Grade Revision Requested',
      'HOD_COMMENT_ADDED': 'HOD Feedback Added',
      'GRADE_REVISION_REJECTED': 'Grade Revision Rejected',
      'DIRECT_MESSAGE': 'New Direct Message'
    };
    return titles[action] || 'Notification';
  }
  
  getNotificationMessage(action, details) {
    const messages = {
      'GRADE_DRAFT_SAVED': `A grade draft has been saved for ${details.className || 'a class'}`,
      'GRADE_SUBMITTED_TO_HOD': `Grades have been submitted for review for ${details.className || 'a class'}`,
      'GRADE_REVISION_REQUESTED': `A grade revision has been requested for ${details.className || 'a class'}`,
      'HOD_COMMENT_ADDED': `HOD feedback has been added: ${details.message || ''}`,
      'GRADE_REVISION_REJECTED': `Grade revision rejected: ${details.reason || ''}`,
      'DIRECT_MESSAGE': details.message || 'You have a new direct message'
    };
    return messages[action] || 'You have a new notification';
  }
  
  getNotificationTitleForHOD(action) {
    const titles = {
      'GRADE_DRAFT_SAVED': 'Teacher Saved Grade Draft',
      'GRADE_SUBMITTED_TO_HOD': 'Teacher Submitted Grades for Review',
      'GRADE_REVISION_REQUESTED': 'Teacher Requested Grade Revision',
      'DIRECT_MESSAGE': 'New Direct Message from Teacher'
    };
    return titles[action] || 'Notification';
  }
  
  getNotificationMessageForHOD(action, details) {
    const messages = {
      'GRADE_DRAFT_SAVED': `Teacher has saved a draft for ${details.className || 'a class'}`,
      'GRADE_SUBMITTED_TO_HOD': `Teacher has submitted grades for review for ${details.className || 'a class'}`,
      'GRADE_REVISION_REQUESTED': `Teacher has requested a grade revision for ${details.className || 'a class'}`,
      'DIRECT_MESSAGE': details.message || 'You have received a direct message from a teacher'
    };
    return messages[action] || 'You have a new notification';
  }

  async markAsRead(notificationId) {
    return request('PATCH', `/comms/notifications/${notificationId}/read`);
  }

  async getUnread() {
    return request('GET', `/comms/notifications/unread`);
  }

  async getUnreadForStudent(studentProfileId) {
    const notifs = await request('GET', `/comms/notifications/${studentProfileId}`);
    return (notifs || []).filter((n) => !n.isRead);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  subscribeRealTime(callback) {
    this.realTimeListeners.add(callback);
    return () => this.realTimeListeners.delete(callback);
  }
  
  disconnect() {
    if (this.realTimeSubscription) {
      this.realTimeSubscription();
      this.realTimeSubscription = null;
    }
  }
}

export const notification = new NotificationService();