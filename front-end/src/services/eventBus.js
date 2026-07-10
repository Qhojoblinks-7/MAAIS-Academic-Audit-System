class EventBus {
  constructor() {
    this.events = {};
    this.bc = null;
    try {
      this.bc = new BroadcastChannel('maais_event_bus');
      this.bc.onmessage = (ev) => {
        const { event, payload } = ev.data || {};
        if (event && this.events[event]) {
          this.events[event].forEach((callback) => {
            try {
              callback(payload);
            } catch {
              // Silently catch listener errors
            }
          });
        }
      };
    } catch {
      // BroadcastChannel not supported
    }
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event, payload) {
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => {
      try {
        callback(payload);
      } catch {
        // Silently catch listener errors
      }
    });
    try {
      this.bc?.postMessage({ event, payload });
    } catch {
      // BroadcastChannel post failed
    }
  }

  once(event, callback) {
    const wrapper = (payload) => {
      this.off(event, wrapper);
      callback(payload);
    };
    return this.on(event, wrapper);
  }

  clear(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

export const eventBus = new EventBus();