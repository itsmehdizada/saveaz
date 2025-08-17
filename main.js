// Main application entry point (ES Modules)
// Coordinates managers via a simple event bus and shared state
import { SecurityUtils } from './modules/SecurityUtils.js';
import { Helpers } from './utils/helpers.js';
// Inline critical constants to save one request
const CONSTANTS = {
  DISCOUNTS_URL: 'public/data/discounts.json',
  MODALS_URL: 'public/data/modals.json',
  PAGE_SIZE: 3,
};
import { EventBus } from './modules/eventBus.js';
import { StateStore } from './modules/stateStore.js';
import { UIManager } from './modules/UIManager.js';
import { ModalManager } from './modules/ModalManager.js';
import { DiscountManager } from './modules/DiscountManager.js';
import { FilterManager } from './modules/FilterManager.js';
import { SearchManager } from './modules/SearchManager.js';

// Initialize core singletons
const bus = new EventBus();
const security = new SecurityUtils();
const helpers = new Helpers();
// Always start with default (unfiltered) state regardless of URL params
const initialFromURL = (() => {
  return {
    page: 1,
    filters: {
      sort: 'highest-discount',
      location: 'all',
      category: '',
      search: ''
    }
  };
})();

const store = new StateStore({
  bus,
  initialState: {
    filters: initialFromURL.filters,
    discounts: [],
    filtered: [],
    page: initialFromURL.page,
    pageSize: CONSTANTS.PAGE_SIZE,
    loading: false,
    error: null,
  },
});

// UI
const ui = new UIManager({ bus, store, helpers });
ui.init();

// Modals
const modalManager = new ModalManager({ bus, store, security, helpers });
modalManager.init();

// Discounts (data + rendering) – start immediately, no top-level await
const discountManager = new DiscountManager({ bus, store, security, helpers, constants: CONSTANTS });
discountManager.init();

// Filters (depends on DiscountManager having data)
const filterManager = new FilterManager({ bus, store, helpers });
filterManager.init();

// Search
const searchManager = new SearchManager({ bus, store, helpers });
searchManager.init();

// Reflect state in URL (basic) — avoid writing default values to keep URL clean
// Do not reflect state into URL; always keep root path to avoid persisting filters on refresh
bus.on('state:updated', () => {
  if (location.search !== '') {
    window.history.replaceState({}, '', location.pathname);
  }
});

// Reset initial page to 1 on load to ensure only 3 discounts on refresh
window.addEventListener('DOMContentLoaded', () => {
  store.set({ page: 1 });
  // If DiscountManager already loaded data, force initial render
  bus.emit('render:list');
});



// Expose for debugging in dev
window.__app = { bus, store, ui, modalManager, discountManager, filterManager, searchManager };


