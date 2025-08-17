// Simple state container with pub/sub notifications
export class StateStore {
  constructor({ bus, initialState = {} }) {
    this.bus = bus;
    const canStructured = typeof structuredClone !== 'undefined';
    this.state = canStructured ? structuredClone(initialState) : JSON.parse(JSON.stringify(initialState));
  }
  get() { return this.state; }
  set(partial) {
    this.state = { ...this.state, ...partial };
    this.bus.emit('state:updated', this.state);
  }
  update(path, value) {
    const segments = path.split('.');
    let cursor = this.state;
    for (let i = 0; i < segments.length - 1; i++) {
      const key = segments[i];
      cursor[key] = cursor[key] ?? {};
      cursor = cursor[key];
    }
    cursor[segments[segments.length - 1]] = value;
    this.bus.emit('state:updated', this.state);
  }
}


