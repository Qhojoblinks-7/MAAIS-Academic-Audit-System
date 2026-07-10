const WS_RECONNECT_DELAY = 5000;
const POLLING_INTERVAL_ONLINE = 30000;
const POLLING_INTERVAL_OFFLINE = 120000;
const MAX_RECONNECT_DELAY = 60000;

class DataSyncLayer {
  constructor() {
    this.ws = null;
    this.pollingTimer = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.listeners = new Set();
    this.isConnected = false;
    this.url = import.meta.env.VITE_WS_URL || '';
    this.fallbackPolling = false;
  }

  connect() {
    if (!this.url) {
      this.fallbackPolling = true;
      this.startPolling();
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.fallbackPolling = false;
        this.notify({ type: 'connection', status: 'connected' });
      };
      this.ws.onmessage = (event) => {
        try {
          this.notify({ type: 'data', payload: JSON.parse(event.data) });
        } catch {
          // Ignore malformed messages
        }
      };
      this.ws.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };
      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.fallbackPolling = true;
      this.startPolling();
    }
  }

  scheduleReconnect() {
    const delay = Math.min(
      WS_RECONNECT_DELAY * 2 ** this.reconnectAttempts,
      MAX_RECONNECT_DELAY,
    );
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopPolling();
    clearTimeout(this.reconnectTimer);
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  startPolling() {
    if (this.pollingTimer) return;
    const interval = navigator.onLine ? POLLING_INTERVAL_ONLINE : POLLING_INTERVAL_OFFLINE;
    this.pollingTimer = setInterval(() => {
      this.fetchUpdates().catch(() => {});
    }, interval);
  }

  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  async fetchUpdates() {
    try {
      const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
      const url = base ? `${base}/sync/updates` : '/sync/updates';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        this.notify({ type: 'data', payload: data });
      }
    } catch {
      // Silently fail on polling errors
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event) {
    this.listeners.forEach((cb) => cb(event));
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else if (this.fallbackPolling) {
      this.fetchUpdates().catch(() => {});
    }
  }
}

export const dataSync = new DataSyncLayer();