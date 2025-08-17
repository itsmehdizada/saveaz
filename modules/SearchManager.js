export class SearchManager {
  constructor({ bus, store, helpers }) {
    this.bus = bus;
    this.store = store;
    this.helpers = helpers;
  }
  init() {
    // Scroll to discounts on submit
    this.bus.on('search:submit', () => {
      const discountsSection = document.getElementById('discounts');
      if (discountsSection) {
        discountsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}


