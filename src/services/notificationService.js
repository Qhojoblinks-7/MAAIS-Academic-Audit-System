import { getAuthToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const NOTIFICATION_SOUND_URL = '/sounds/notification.mp3';

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
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
}

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.isAudioEnabled = true;
    this.listeners = new Set();
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
    return request('POST', '/api/notifications/hod-action', {
      teacherId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyTeacherOfHODAction(teacherId, actionType, recordId, message) {
    return this.sendHODAlert(teacherId, actionType, { recordId, message });
  }

  async markAsRead(notificationId) {
    return request('PATCH', `/api/notifications/${notificationId}/read`);
  }

  async getUnread(userId) {
    return request('GET', `/api/notifications/unread?userId=${userId}`);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const notification = new NotificationService();