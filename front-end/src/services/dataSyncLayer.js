const WS_RECONNECT_DELAY = 5000;
const POLLING_INTERVAL = 30000;

class DataSyncLayer {
  constructor() {
    this.ws = null;
    this.pollingTimer = null;
    this.reconnectTimer = null;
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
        this.fallbackPolling = false;
        this.notify({ type: 'connection', status: 'connected' });
      };
      this.ws.onmessage = (event) => {
        this.notify({ type: 'data', payload: JSON.parse(event.data) });
      };
      this.ws.onclose = () => {
        this.isConnected = false;
        this.reconnectTimer = setTimeout(() => this.connect(), WS_RECONNECT_DELAY);
      };
      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.fallbackPolling = true;
      this.startPolling();
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopPolling();
    clearTimeout(this.reconnectTimer);
    this.isConnected = false;
  }

  startPolling() {
    if (this.pollingTimer) return;
    this.pollingTimer = setInterval(() => {
      this.fetchUpdates().catch(() => {});
    }, POLLING_INTERVAL);
  }

  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  async fetchUpdates() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sync/updates`);
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