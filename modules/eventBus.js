// Simple pub/sub EventBus
export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this.listeners = new Map();
  }
  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }
  off(event, handler) {
    const set = this.listeners.get(event);
    if (set) set.delete(handler);
  }
  emit(event, payload) {
    const set = this.listeners.get(event);
    if (!set) return;
    // synchronous dispatch for critical UI updates
    set.forEach(handler => { try { handler(payload); } catch (e) {} });
  }
}


