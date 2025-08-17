// Handles filtering logic, memoization, and emits updates
export class FilterManager {
  constructor({ bus, store, helpers }) {
    this.bus = bus;
    this.store = store;
    this.helpers = helpers;

  }

  init() {
    this.bus.on('filters:update', (partial) => {
      const state = this.store.get();
      const filters = { ...state.filters, ...partial };
      this.store.update('filters', filters);
      this.applyFilters();
    });

    this.bus.on('search:query', (q) => {
      const state = this.store.get();
      this.store.update('filters', { ...state.filters, search: q });
      this.applyFilters();
    });

    // Allow other modules (e.g., data loader) to request a re-application of filters
    this.bus.on('filters:apply', () => {
      this.applyFilters();
    });

    // Ensure initial sort is applied on startup if data already exists
    this.applyFilters();
  }

  applyFilters() {
    const { discounts, filters } = this.store.get();
    const key = JSON.stringify({ filters, count: discounts.length });
    const result = this.helpers.memoize(`filters:${key}`, () => {
      const search = (filters.search || '').toLowerCase();
      const normalize = (str) => (str || '')
        .toString()
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
      let list = discounts.filter(d => {
        const matchCat = !filters.category || d.category === filters.category;
        const matchSearch = !search || d.title.toLowerCase().includes(search) || d.location.toLowerCase().includes(search) || (d.keywords && d.keywords.some(k => k.toLowerCase().includes(search)));
        return matchCat && matchSearch;
      });
      if (filters.location && filters.location !== 'all') {
        const loc = normalize(filters.location);
        list = list.filter(d => normalize(d.location).includes(loc));
      }
      switch (filters.sort) {
        case 'id':
          list.sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0));
          break;
        case 'highest-rating':
          list.sort((a,b) => parseFloat(b.rating) - parseFloat(a.rating));
          break;
        case 'highest-discount':
        default: {
          const getVal = (s) => parseFloat(String(s).replace('%','')) || 0;
          list.sort((a,b) => getVal(b.discount_amount) - getVal(a.discount_amount));
        }
      }
      return list;
    });
    this.store.set({ filtered: result, page: 1 });
    this.bus.emit('render:list');
  }
}


